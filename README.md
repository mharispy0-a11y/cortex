# Cortex

> Chat with your knowledge.

**Live preview:** https://getcortex.netlify.app *(Milestone 2 — real auth + multi-tenant workspaces with RLS; document ingestion and chat land in M3–M4)*

Cortex is a multi-tenant SaaS where teams upload documents and chat with an AI
that answers **only** from their uploaded knowledge (retrieval-augmented
generation), with inline source citations.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) · TypeScript strict |
| Styling | Tailwind CSS v4 · shadcn/ui |
| Animation | Framer Motion (reduced-motion aware) |
| Auth + DB | Supabase (Postgres, Auth, Storage, RLS) — *from Milestone 2* |
| Vectors | pgvector — *from Milestone 3* |
| AI | Anthropic API (streaming) — *from Milestone 4* |
| Billing | Stripe subscriptions — *from Milestone 6* |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys as milestones require them
npm run dev
```

Open http://localhost:3000 — the landing page. The app shell lives at `/dashboard`.

### Google OAuth

Disabled by default. The button shows a toast and **never** redirects to
Supabase until you enable it:

1. Go to your Supabase dashboard → **Authentication → Providers → Google** and
   add your OAuth client ID + secret.
2. Add your production URL to **Authentication → URL Configuration → Redirect URLs**.
3. Set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` in your Netlify environment
   variables (or `.env.local` for local dev).
4. Redeploy.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Project layout

```
app/
  (marketing)/      # public pages — landing
  (app)/            # product shell — sidebar + topbar, dashboard
components/
  ui/               # shadcn primitives + logo
  features/         # feature-scoped components (marketing/, shell/)
  motion/           # animation primitives (fade-in, stagger, page-transition)
lib/                # shared utilities
server/  db/        # reserved for API logic & schema (Milestones 2–3)
```

## Status

Milestone 1 (foundation) complete — see [PROGRESS.md](PROGRESS.md) for the
roadmap and the list of deliberate stubs.
