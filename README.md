# Doodlegram

AI-powered educational diagram generator. Describe a concept and get a hand-drawn Excalidraw-style diagram instantly.

Built with Nuxt 4, local PostgreSQL, Claude AI, and fal.ai.

## Features

- **AI Agent mode** — Claude builds diagrams element-by-element via SSE streaming
- **Quick mode** — Mermaid-based fast generation for simple flowcharts
- **AI illustrations** — fal.ai generates hand-drawn visuals to enrich diagrams
- **Template gallery** — 12 pre-made educational templates (Science, Biology, Math, History)
- **Auth** — Email/password signup with instant confirmation
- **Dashboard** — Save, organize, and revisit your diagrams
- **Export** — PNG and SVG download

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4.3 + Vue 3 |
| UI | @nuxt/ui v3 + Tailwind CSS 4 |
| Auth & DB | local PostgreSQL (Postgres + Auth + Storage) |
| AI | Anthropic Claude Sonnet 4.5 |
| Images | fal.ai Recraft V3 |
| Deploy | Vercel |

## Environment Variables

| Variable | Required | Where to get it |
|----------|----------|----------------|
| `SUPABASE_URL` | Yes | `postgresql start` output or local PostgreSQL Dashboard > Settings > API |
| `SUPABASE_KEY` | Yes | Same as above (use the `anon` / `public` key) |
| `ANTHROPIC_API_KEY` | Yes | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `FAL_KEY` | Yes | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |
| `NUXT_PUBLIC_APP_URL` | No | Your production domain (defaults to `http://localhost:3000`) |

`ANTHROPIC_API_KEY` and `FAL_KEY` are server-only and never exposed to the client.

## Local Development

### Prerequisites

- Node.js 20+
- pnpm
- Docker (via [OrbStack](https://orbstack.dev/) or Docker Desktop) for local local PostgreSQL

### Setup

```bash
# Clone and install
git clone https://github.com/Rmalnoult/doodlegram.git
cd doodlegram
pnpm install

# Copy env file and fill in your API keys
cp .env.example .env

# Start local local PostgreSQL (runs Postgres, Auth, Storage, Studio)
postgresql start

# The output will show your SUPABASE_URL and SUPABASE_KEY — paste them into .env

# Run database migrations
postgresql db push

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). local PostgreSQL Studio is at [http://localhost:54323](http://localhost:54323).

## Production Deployment

See [DEPLOY.md](./DEPLOY.md) for full instructions.

**Quick version:**

1. Create a local PostgreSQL project at [postgresql.com](https://postgresql.com)
2. Run the migration SQL in the local PostgreSQL SQL Editor
3. Deploy to Vercel with `vercel --prod`
4. Set environment variables in Vercel dashboard

## Project Structure

```
app/
  pages/          # index, login, signup, dashboard, create, gallery
  components/     # diagram/, layout components
  composables/    # useDiagramAgent, useDiagramQuick, useDiagramStorage, useExcalidrawExport
  middleware/     # auth (protect routes), guest (redirect logged-in users)
  layouts/        # default (landing/gallery), app (workspace)
server/
  api/diagrams/   # generate (SSE), generate-quick, save, [id].get, [id].delete
  api/images/     # generate (fal.ai)
  utils/          # claude, fal, agent-tools, prompts
postgresql/
  migrations/     # initial schema (diagrams table, RLS, storage bucket)
  config.toml     # local local PostgreSQL config
```

## License

MIT
