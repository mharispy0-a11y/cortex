# Cortex — Build Progress

**Live preview:** https://getcortex.netlify.app — a **foundation preview with M1
stubs** (auth not wired, mock workspace/user data, uploads disabled). This is a
WIP demo, not the finished product. Deployed via Netlify CLI (`netlify deploy
--build --prod`); connect the repo in the Netlify dashboard later for CI/CD.

Multi-tenant AI knowledge assistant (RAG SaaS). Stack: Next.js 15 (App Router),
TypeScript strict, Tailwind v4, shadcn/ui, Framer Motion, Supabase + pgvector,
Anthropic API, Stripe. See README for setup.

## Milestones

- [x] **M1 — Foundation** *(current)*
  - Next.js 15 + TS strict + Tailwind v4 + shadcn/ui + Framer Motion
  - Design tokens: zinc-950 canvas, indigo/violet accent, glass surfaces, Geist fonts
  - Motion system: `components/motion/` (fade-in, stagger, page-transition), reduced-motion aware
  - Animated landing page: hero w/ chat preview, features, how-it-works, CTA
  - App shell: fixed sidebar (sheet on mobile), topbar, workspace switcher + user menu (mocked)
  - Dashboard placeholder with stat cards + empty state
- [~] **M2 — Auth + Workspaces** *(code complete — live verification pending Supabase keys)*
  - `@supabase/ssr` cookie sessions, middleware session refresh + `/dashboard`·`/settings`·`/onboarding`·`/invite` route protection
  - Migration `db/migrations/0001_auth_workspaces.sql`: profiles (signup trigger + moddatetime), workspaces, members, invites
  - RLS on every table; SECURITY DEFINER helpers break policy recursion; all INSERTs have WITH CHECK
  - `create_workspace()` RPC (avoids trigger-vs-RETURNING read-back race) + `accept_workspace_invite()` RPC
  - Partial unique index blocks duplicate pending invites (case-insensitive)
  - Login/signup (email+password, Zod + RHF), onboarding, settings w/ members + copyable invite links
  - `npm run test:rls` — two-user tenant-isolation proof (13 checks)
  - **Remaining:** apply migration to a Supabase project, run `test:rls`, manual signup→invite round-trip
- [ ] **M3 — Document ingestion** — upload → Storage → chunk → embed → pgvector, indexing status UI
- [ ] **M4 — RAG chat** — streaming chat, retrieval, inline citations, no-answer guardrail, history
- [ ] **M5 — Analytics dashboard** — Recharts widgets (queries, docs, tokens)
- [ ] **M6 — Stripe billing** — Free/Pro, checkout, portal, webhook sync, server-side gating
- [ ] **M7 — Polish pass** — error boundaries, toasts, mobile QA, SEO, README screenshots

## Deliberate stubs (to be replaced, not forgotten)

- **Google OAuth**: button wired to `signInWithOAuth` but credentials not yet
  added in the Supabase dashboard — shows an honest "not configured" toast (M2)
- **Invite emails are not sent** — invites produce a copyable link only; an
  email provider lands later
- Sidebar items Documents/Chat/Analytics are disabled "Soon" entries
- Dashboard stats hardcoded to 0; "Upload documents" button disabled until M3
- "Profile" menu item disabled ("Soon")

## Notes

- Project lives in `d:\Development\ProjectsFullStack\New folder` (user chose to build
  in the open workspace rather than the CLAUDE.md SaaS routing path)
- Folder name prevents `create-next-app` (npm name rules) — scaffolded manually,
  package name is `cortex`
- TypeScript pinned to `~5.9.0`: TS 6 breaks CSS side-effect imports and isn't
  Next 15's supported line. `eslint-config-next` pinned to `~15.5.0` to match
  Next — v16 is a native flat config and crashes under FlatCompat.
- shadcn/ui v4 CLI, radix base, **nova** preset (Lucide/Geist)
