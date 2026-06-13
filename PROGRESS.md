# Cortex — Build Progress

**Live preview:** https://getcortex.netlify.app — running **M2**: Supabase auth
(email/password), multi-tenant workspaces with RLS, invites via copyable link.
Still a WIP demo: Google OAuth pending credentials, no document upload yet.
Deployed via Netlify CLI (`netlify deploy --prod`); Netlify env carries the
Supabase publishable key only — the secret key never leaves `.env.local`.
Connect the repo in the Netlify dashboard later for CI/CD.

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
- [x] **M2 — Auth + Workspaces** *(verified: 13/13 RLS isolation checks + 8/8 browser E2E checks + manual round-trip)*
  - `@supabase/ssr` cookie sessions, middleware session refresh + `/dashboard`·`/settings`·`/onboarding`·`/invite` route protection
  - Migration `db/migrations/0001_auth_workspaces.sql`: profiles (signup trigger + moddatetime), workspaces, members, invites
  - RLS on every table; SECURITY DEFINER helpers break policy recursion; all INSERTs have WITH CHECK
  - `create_workspace()` RPC (avoids trigger-vs-RETURNING read-back race) + `accept_workspace_invite()` RPC
  - Partial unique index blocks duplicate pending invites (case-insensitive)
  - Login/signup (email+password, Zod + RHF), onboarding, settings w/ members + copyable invite links
  - `npm run test:rls` — two-user tenant-isolation proof: **13/13 passed** against the live project
  - `scripts/e2e-smoke.ts` — headless-Chrome UI flow (login → onboarding →
    create → invite → accept → sign out): **8/8 passed**
  - Verified finding: plain `.insert().select()` on workspaces **fails** with an
    RLS violation (RETURNING is checked before the AFTER-INSERT membership
    trigger fires) — `create_workspace()` RPC is the required path, app uses it
  - Post-QA fixes: marketing header is auth-aware ("Open dashboard" when signed
    in), sidebar logo links to /dashboard, marketing CTAs point at /signup
- [ ] **M3 — Document ingestion** — upload → Storage → chunk → embed → pgvector, indexing status UI
- [ ] **M4 — RAG chat** — streaming chat, retrieval, inline citations, no-answer guardrail, history
- [ ] **M5 — Analytics dashboard** — Recharts widgets (queries, docs, tokens)
- [ ] **M6 — Stripe billing** — Free/Pro, checkout, portal, webhook sync, server-side gating
- [ ] **M7 — Polish pass** — error boundaries, toasts, mobile QA, SEO, README screenshots

## Deliberate stubs (to be replaced, not forgotten)

- **Google OAuth**: button is guarded by `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED`.
  When the flag is absent or not `"true"` the button shows a toast ("Google
  sign-in is coming soon — use email for now") and **never** calls
  `signInWithOAuth` or navigates to supabase.co. Enable by: (1) configure the
  Google provider in the Supabase dashboard, (2) set the flag to `"true"` in
  Netlify environment variables, (3) redeploy.
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
