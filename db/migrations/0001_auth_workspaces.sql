-- ════════════════════════════════════════════════════════════════════════
-- Cortex · Migration 0001 — Auth + Workspaces (Milestone 2)
-- Apply via Supabase SQL editor or `supabase db push`.
-- ════════════════════════════════════════════════════════════════════════

-- ============ EXTENSIONS ============
create extension if not exists moddatetime with schema extensions;

-- ============ TYPES ============
create type public.workspace_role as enum ('owner', 'admin', 'member');

-- ============ TABLES ============
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id),
  name        text not null check (char_length(name) between 1 and 80),
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  role         public.workspace_role not null default 'member',
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.workspace_invites (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email        text not null,
  role         public.workspace_role not null default 'member'
               check (role <> 'owner'),          -- invites can never grant ownership
  token        uuid not null unique default gen_random_uuid(),
  invited_by   uuid not null references public.profiles (id),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '7 days',
  accepted_at  timestamptz
);

create index workspace_members_user_idx on public.workspace_members (user_id);
create index workspace_invites_workspace_idx on public.workspace_invites (workspace_id);

-- one pending invite per email per workspace
create unique index workspace_invites_pending_email_idx
  on public.workspace_invites (workspace_id, lower(email))
  where accepted_at is null;

-- keep profiles.updated_at fresh
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function extensions.moddatetime (updated_at);

-- ============ SIGNUP TRIGGER ============
-- profiles auto-created on signup — never a client insert
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'avatar_url');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ WORKSPACE OWNER TRIGGER ============
-- creator automatically becomes the owner member
create function public.handle_new_workspace()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end; $$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- ============ SECURITY DEFINER HELPERS (the recursion breakers) ============
create function public.is_workspace_member(ws_id uuid)
returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = (select auth.uid())
  );
$$;

create function public.is_workspace_admin(ws_id uuid)
returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id
      and user_id = (select auth.uid())
      and role in ('owner', 'admin')
  );
$$;

-- teammates may see each other's profiles (for member lists)
create function public.shares_workspace_with(other_user uuid)
returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs using (workspace_id)
    where mine.user_id = (select auth.uid()) and theirs.user_id = other_user
  );
$$;

revoke execute on function public.is_workspace_member(uuid),
                           public.is_workspace_admin(uuid),
                           public.shares_workspace_with(uuid) from public, anon;
grant  execute on function public.is_workspace_member(uuid),
                           public.is_workspace_admin(uuid),
                           public.shares_workspace_with(uuid) to authenticated;

-- ============ WORKSPACE CREATION RPC ============
-- Inserts the workspace and (via trigger) the owner membership in one
-- definer transaction, then returns the row — avoids the trigger-vs-
-- RETURNING visibility race that makes .insert().select() return empty.
create function public.create_workspace(workspace_name text, workspace_slug text)
returns public.workspaces
language plpgsql security definer set search_path = '' as $$
declare
  ws public.workspaces;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.workspaces (owner_id, name, slug)
  values ((select auth.uid()), workspace_name, workspace_slug)
  returning * into ws;

  return ws;
end; $$;

revoke execute on function public.create_workspace(text, text) from public, anon;
grant  execute on function public.create_workspace(text, text) to authenticated;

-- ============ INVITE ACCEPTANCE RPC ============
-- The invited user is not a member yet, so acceptance bypasses RLS here
-- instead of opening a read path on the invites table.
create function public.accept_workspace_invite(invite_token uuid)
returns uuid  -- the workspace id, so the app can redirect into it
language plpgsql security definer set search_path = '' as $$
declare
  inv record;
  caller_email text;
begin
  select * into inv from public.workspace_invites
   where token = invite_token and accepted_at is null and expires_at > now();
  if not found then
    raise exception 'invite_invalid_or_expired';
  end if;

  select email into caller_email from auth.users where id = (select auth.uid());
  if lower(caller_email) is distinct from lower(inv.email) then
    raise exception 'invite_email_mismatch';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (inv.workspace_id, (select auth.uid()), inv.role)
  on conflict (workspace_id, user_id) do nothing;

  update public.workspace_invites set accepted_at = now() where id = inv.id;
  return inv.workspace_id;
end; $$;

revoke execute on function public.accept_workspace_invite(uuid) from public, anon;
grant  execute on function public.accept_workspace_invite(uuid) to authenticated;

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles          enable row level security;
alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;

-- ---------- profiles ----------
create policy "read own or teammate profiles" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.shares_workspace_with(id));

create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
-- no INSERT/DELETE policies: trigger creates, auth.users cascade deletes

-- ---------- workspaces ----------
create policy "members read their workspaces" on public.workspaces
  for select to authenticated
  using (public.is_workspace_member(id));

create policy "anyone may create a workspace they own" on public.workspaces
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "admins update workspace" on public.workspaces
  for update to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

create policy "only the owner deletes" on public.workspaces
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ---------- workspace_members ----------
create policy "members see the member list" on public.workspace_members
  for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins add non-owner members" on public.workspace_members
  for insert to authenticated
  with check (public.is_workspace_admin(workspace_id) and role <> 'owner');

create policy "admins change non-owner roles" on public.workspace_members
  for update to authenticated
  using (public.is_workspace_admin(workspace_id) and role <> 'owner')
  with check (role <> 'owner');

create policy "leave, or admins remove non-owners" on public.workspace_members
  for delete to authenticated
  using (
    (user_id = (select auth.uid()) and role <> 'owner')
    or (public.is_workspace_admin(workspace_id) and role <> 'owner')
  );

-- ---------- workspace_invites ----------
create policy "admins manage invites" on public.workspace_invites
  for select to authenticated using (public.is_workspace_admin(workspace_id));

create policy "admins create invites" on public.workspace_invites
  for insert to authenticated
  with check (public.is_workspace_admin(workspace_id)
              and invited_by = (select auth.uid()));

create policy "admins revoke invites" on public.workspace_invites
  for delete to authenticated using (public.is_workspace_admin(workspace_id));
-- no UPDATE policy: accepted_at is set only by accept_workspace_invite()
