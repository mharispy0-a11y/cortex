/**
 * Tenant-isolation proof for the M2 RLS policies.
 *
 * Provisions two throwaway users with the service-role key (the ONLY thing
 * it is used for), then attacks the policies with plain anon-key clients:
 * user B tries every way to reach user A's workspace. RLS — not the
 * frontend — must block all of it.
 *
 * Run: npm run test:rls   (requires .env.local with project keys)
 */
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../lib/database.types";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

type Anon = SupabaseClient<Database>;

const admin = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results: { name: string; pass: boolean; detail: string }[] = [];

function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✅ PASS" : "❌ FAIL"}  ${name} — ${detail}`);
}

function newAnonClient(): Anon {
  return createClient<Database>(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function provisionUser(label: string, password: string) {
  const email = `rls-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`Could not provision user ${label}: ${error?.message}`);
  }
  const client = newAnonClient();
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(`Could not sign in ${label}: ${signInError.message}`);
  }
  return { id: data.user.id, email, client };
}

async function main() {
  console.log("Provisioning users A and B…");
  const password = `Rls-test-${Math.random().toString(36)}!9`;
  const a = await provisionUser("a", password);
  const b = await provisionUser("b", password);
  const cleanupWorkspaces: string[] = [];

  try {
    // ── 1. Workspace creation via the app path (RPC) — read-back assertion
    const { data: ws, error: wsErr } = await a.client.rpc("create_workspace", {
      workspace_name: "Tenant A HQ",
      workspace_slug: `tenant-a-${Date.now()}`,
    });
    record(
      "create_workspace RPC returns the row in the same call",
      !wsErr && !!ws?.id && ws.name === "Tenant A HQ",
      wsErr ? wsErr.message : `got id ${ws?.id}`
    );
    if (!ws) throw new Error("Cannot continue without a workspace");
    cleanupWorkspaces.push(ws.id);

    // ── 2. The race probe: plain .insert().select() on workspaces
    const { data: rawWs, error: rawErr } = await a.client
      .from("workspaces")
      .insert({
        owner_id: a.id,
        name: "Raw Insert Probe",
        slug: `raw-probe-${Date.now()}`,
      })
      .select()
      .maybeSingle();
    record(
      "PROBE (informational): .insert().select() read-back",
      true, // informational — the app uses the RPC either way
      rawErr
        ? `returned error: ${rawErr.message}`
        : rawWs
          ? "returned the row (no visibility race on this stack)"
          : "returned EMPTY — trigger-vs-RETURNING race confirmed; RPC is required"
    );
    // If the row wasn't returned the insert may still have happened —
    // the final cleanup deletes all of A's workspaces regardless.
    if (rawWs) cleanupWorkspaces.push(rawWs.id);

    // ── 3. A can read their workspace back normally
    const { data: aRead } = await a.client
      .from("workspaces")
      .select("id, name")
      .eq("id", ws.id)
      .maybeSingle();
    record(
      "A reads their own workspace",
      aRead?.id === ws.id,
      aRead ? "row visible to member" : "row NOT visible — policy broken"
    );

    // ── 4. B cannot read A's workspace (direct select by id)
    const { data: bRead } = await b.client
      .from("workspaces")
      .select("*")
      .eq("id", ws.id);
    record(
      "B cannot read A's workspace",
      (bRead ?? []).length === 0,
      `got ${(bRead ?? []).length} rows`
    );

    // ── 5. B cannot read A's member list
    const { data: bMembers } = await b.client
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", ws.id);
    record(
      "B cannot read A's member list",
      (bMembers ?? []).length === 0,
      `got ${(bMembers ?? []).length} rows`
    );

    // ── 6. B cannot insert themselves as a member (crafted insert)
    const { error: bJoinErr } = await b.client
      .from("workspace_members")
      .insert({ workspace_id: ws.id, user_id: b.id, role: "admin" });
    record(
      "B cannot insert themselves into A's workspace",
      !!bJoinErr,
      bJoinErr ? `blocked: ${bJoinErr.code}` : "INSERT SUCCEEDED — RLS HOLE"
    );

    // ── 7. B cannot create an invite into A's workspace
    const { error: bInviteErr } = await b.client
      .from("workspace_invites")
      .insert({
        workspace_id: ws.id,
        email: "intruder@example.com",
        role: "admin",
        invited_by: b.id,
      });
    record(
      "B cannot create invites for A's workspace",
      !!bInviteErr,
      bInviteErr ? `blocked: ${bInviteErr.code}` : "INSERT SUCCEEDED — RLS HOLE"
    );

    // ── 8. B cannot rename A's workspace (update affects 0 rows)
    const { data: bUpdate } = await b.client
      .from("workspaces")
      .update({ name: "pwned" })
      .eq("id", ws.id)
      .select();
    record(
      "B cannot update A's workspace",
      (bUpdate ?? []).length === 0,
      `update touched ${(bUpdate ?? []).length} rows`
    );

    // ── 9. Duplicate pending invite is rejected by the partial unique index
    const inviteEmail = "teammate@example.com";
    const { error: inv1Err } = await a.client.from("workspace_invites").insert({
      workspace_id: ws.id,
      email: inviteEmail,
      role: "member",
      invited_by: a.id,
    });
    const { error: inv2Err } = await a.client.from("workspace_invites").insert({
      workspace_id: ws.id,
      email: inviteEmail.toUpperCase(), // case-insensitive duplicate
      role: "member",
      invited_by: a.id,
    });
    record(
      "duplicate pending invite blocked (case-insensitive)",
      !inv1Err && inv2Err?.code === "23505",
      `first: ${inv1Err?.code ?? "ok"}, second: ${inv2Err?.code ?? "NOT BLOCKED"}`
    );

    // ── 10. B cannot accept an invite issued to someone else's email
    const { data: bInvite, error: bInviteCreateErr } = await a.client
      .from("workspace_invites")
      .insert({
        workspace_id: ws.id,
        email: "someone-else@example.com",
        role: "member",
        invited_by: a.id,
      })
      .select("token")
      .single();
    if (bInviteCreateErr || !bInvite) {
      record("email-mismatch invite setup", false, bInviteCreateErr?.message ?? "no token");
    } else {
      const { error: mismatchErr } = await b.client.rpc(
        "accept_workspace_invite",
        { invite_token: bInvite.token }
      );
      record(
        "B cannot accept an invite issued to a different email",
        !!mismatchErr && mismatchErr.message.includes("invite_email_mismatch"),
        mismatchErr ? mismatchErr.message : "ACCEPT SUCCEEDED — HOLE"
      );
    }

    // ── 11. Legit invite to B's email works end to end
    const { data: legitInvite } = await a.client
      .from("workspace_invites")
      .insert({
        workspace_id: ws.id,
        email: b.email,
        role: "member",
        invited_by: a.id,
      })
      .select("token")
      .single();
    if (!legitInvite) {
      record("legit invite flow", false, "could not create invite");
    } else {
      const { data: joinedWsId, error: acceptErr } = await b.client.rpc(
        "accept_workspace_invite",
        { invite_token: legitInvite.token }
      );
      const { data: bNowReads } = await b.client
        .from("workspaces")
        .select("id")
        .eq("id", ws.id)
        .maybeSingle();
      record(
        "B accepts a legit invite and can then read the workspace",
        !acceptErr && joinedWsId === ws.id && bNowReads?.id === ws.id,
        acceptErr ? acceptErr.message : "joined and row visible"
      );

      // ── 12. B (member, not admin) cannot read the invites list
      const { data: bInvitesList } = await b.client
        .from("workspace_invites")
        .select("*")
        .eq("workspace_id", ws.id);
      record(
        "B (member) cannot read the invite list (admin-only)",
        (bInvitesList ?? []).length === 0,
        `got ${(bInvitesList ?? []).length} rows`
      );

      // ── 13. B (member) cannot promote themselves
      const { data: bPromote } = await b.client
        .from("workspace_members")
        .update({ role: "admin" })
        .eq("workspace_id", ws.id)
        .eq("user_id", b.id)
        .select();
      record(
        "B (member) cannot promote themselves to admin",
        (bPromote ?? []).length === 0,
        `update touched ${(bPromote ?? []).length} rows`
      );
    }
  } finally {
    console.log("\nCleaning up…");
    // Workspaces must go first: profiles deletion is RESTRICTed by
    // workspaces.owner_id.
    for (const id of cleanupWorkspaces) {
      await admin.from("workspaces").delete().eq("id", id);
    }
    // Catch any probe workspace that wasn't captured
    await admin.from("workspaces").delete().eq("owner_id", a.id);
    await admin.auth.admin.deleteUser(a.id);
    await admin.auth.admin.deleteUser(b.id);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n${results.length - failed.length}/${results.length} checks passed.`
  );
  if (failed.length > 0) {
    console.error("TENANT ISOLATION FAILURES — do not ship:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.detail}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test run crashed:", err);
  process.exit(1);
});
