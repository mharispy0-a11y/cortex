# Cortex — Build Progress

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
- [ ] **M2 — Auth + Workspaces** — Supabase auth (email + OAuth), workspace CRUD, invites, RLS policies, protected routes
- [ ] **M3 — Document ingestion** — upload → Storage → chunk → embed → pgvector, indexing status UI
- [ ] **M4 — RAG chat** — streaming chat, retrieval, inline citations, no-answer guardrail, history
- [ ] **M5 — Analytics dashboard** — Recharts widgets (queries, docs, tokens)
- [ ] **M6 — Stripe billing** — Free/Pro, checkout, portal, webhook sync, server-side gating
- [ ] **M7 — Polish pass** — error boundaries, toasts, mobile QA, SEO, README screenshots

## Deliberate stubs (to be replaced, not forgotten)

- "Sign in" / "Get started" link straight to `/dashboard` — real auth gate in M2
- Workspace switcher + user menu render mock data — wired to Supabase in M2
- Sidebar items Documents/Chat/Analytics/Settings are disabled "Soon" entries
- Dashboard stats hardcoded to 0; "Upload documents" button disabled until M3

## Notes

- Project lives in `d:\Development\ProjectsFullStack\New folder` (user chose to build
  in the open workspace rather than the CLAUDE.md SaaS routing path)
- Folder name prevents `create-next-app` (npm name rules) — scaffolded manually,
  package name is `cortex`
- TypeScript pinned to `~5.9.0`: TS 6 breaks CSS side-effect imports and isn't
  Next 15's supported line. `eslint-config-next` pinned to `~15.5.0` to match
  Next — v16 is a native flat config and crashes under FlatCompat.
- shadcn/ui v4 CLI, radix base, **nova** preset (Lucide/Geist)
