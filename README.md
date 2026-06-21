# Komorebi

> 木漏れ日 — Sunlight filtering through leaves.

Families rarely lose photos. They lose the **context**, **meaning**, and **stories** behind them.

Komorebi turns family stories into living memory capsules — structured archives of voice recordings, photos, and the moments that made them matter.

![Landing page desktop](public/landing-desktop.png)

---

## How it works

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Landing     │────▶│  Dashboard       │────▶│  Create capsule  │
│  page        │     │  (stats + grid)  │     │  (3-step wizard) │
└──────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  Album view      │
                                              │  (media + play)  │
                                              └─────────────────┘
```

**The flow:**

1. **Landing page** — learn about Komorebi, see capsule types (audio / photo / mixed)
2. **Sign up** — create an account
3. **Dashboard** — view stats (photos, recordings, capsules), see all capsules
4. **Create a capsule** — 3-step wizard:
   - **When?** — pick the memory date (or skip if unknown)
   - **What?** — title + optional description (use memory prompts if stuck)
   - **How?** — choose capsule type (audio / photo / mixed)
5. **Album view** — scrapbook-style display with photo frames and audio cards
6. **Add media** — record audio or upload photos (1 audio max, 10 photos max)
7. **Done** — the capsule is preserved, structured, and ready to rediscover

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### 1. Clone and install

```bash
git clone <repo-url>
cd komorebi
npm install
```

### 2. Start the local backend

```bash
supabase start
```

This runs Postgres + Auth locally and prints your API credentials.

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in the values from the `supabase start` output:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-output>
```

### 4. Disable email confirmation

In the local Supabase dashboard ([http://localhost:54323](http://localhost:54323)):

1. Go to **Authentication → Providers → Email**
2. Toggle OFF **"Confirm email"**

This allows signup → auto-login during development without a mail provider.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (Auth + Postgres + Storage) |
| Audio | MediaRecorder API — Opus codec, 96kbps, mono |
| Images | Client-side compression (max 1600px, JPEG 0.85) |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page (hero, how-it-works, capsule types, CTA)
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── globals.css               # Design tokens, theme
│   ├── dashboard/
│   │   ├── page.tsx              # Stats row + capsule grid
│   │   └── loading.tsx           # Skeleton loader
│   ├── capsules/
│   │   ├── new/
│   │   │   └── page.tsx          # Create capsule (3-step wizard)
│   │   └── [id]/
│   │       ├── page.tsx          # Album view (cover card + media album)
│   │       └── loading.tsx       # Skeleton loader
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── not-found.tsx
│   └── auth/callback/route.ts    # OAuth code exchange
├── components/
│   ├── Logo.tsx                  # Shared brand logo
│   ├── CapsuleCard.tsx           # Dashboard capsule card
│   ├── CreateCapsuleForm.tsx     # 3-step wizard: date → title → type
│   ├── AudioRecorder.tsx         # Record → blob → upload pipeline
│   ├── ImageUploader.tsx         # Drag-drop + client-side compression
│   ├── MediaAlbum.tsx            # Masonry scrapbook (photo frames + audio cards)
│   ├── MemoryPrompts.tsx         # 12 title inspiration prompts
│   ├── DeleteCapsuleButton.tsx   # Confirm + delete
│   ├── MediaList.tsx             # Ordered media list with drag handles
│   └── LogoutButton.tsx
├── lib/supabase/
│   ├── client.ts                 # Browser client
│   ├── server.ts                 # Server client
│   └── middleware.ts             # Session refresh
└── middleware.ts                  # Auth middleware

supabase/
├── config.toml                   # Local Supabase config
└── migrations/                   # Database schema
    ├── ..._create_capsules.sql
    ├── ..._create_storage_buckets.sql
    └── ..._add_memory_date.sql
```

---

## Data model

```
capsules
├── id            uuid (PK)
├── user_id       uuid (FK → auth.users)
├── title         text
├── description   text (nullable)
├── type          text ('audio' | 'photo' | 'mixed')
├── memory_date   date (nullable)
└── created_at    timestamptz

media_items
├── id            uuid (PK)
├── capsule_id    uuid (FK → capsules)
├── type          text ('audio' | 'image')
├── url           text (Supabase Storage public URL)
└── order_index   integer
```

**Rules:**
- Each capsule: 1 audio max, 10 images max
- Media items belong to a capsule only — no standalone browsing
- Audio pipeline: Record → Blob → Upload → Storage → URL → Capsule → Playback

---

## Design system

The project uses a warm, organic color palette defined as CSS custom properties in `globals.css`.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | `#B8845C` | `#D4A07A` | CTAs, links, icons |
| `--secondary` | `#D4956B` | `#D4A88C` | Supporting accents |
| `--accent` | `#5B8C7A` | `#7BAF94` | Tertiary, audio theme |
| `--surface` | `#F2EDE4` | `#1C211E` | Card backgrounds |
| `--background` | `#FAF8F4` | `#141816` | Page background |
| `--muted` | `#8C7E6E` | `#9A9488` | Secondary text |

Use Tailwind tokens (`text-primary`, `bg-surface`, `border-border`) — never hardcoded `text-gray-*` or `bg-black`.

---

## Development tools

This project is configured for [Claude Code](https://claude.ai/code) with the following tools:

### MCP Servers

| Server | Purpose |
|--------|---------|
| **github** | Issues, PRs, code search, file operations |
| **playwright** | Browser automation, screenshots, E2E testing |
| **magic** | 21st.dev UI component search and generation |

### Agents

| Agent | Use for |
|-------|---------|
| General | Code generation, multi-step implementation |
| Explore | Fast read-only codebase search |
| code-reviewer | Structured review feedback |

### Skills

| Skill | Use for |
|-------|---------|
| markdown-creator | Creating READMEs, CHANGELOGs, ADRs, guides |
| ui-ux-pro-max | UI component building and refinement |

See [`AGENTS.md`](./AGENTS.md) for full reference.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `GITHUB_PAT` | No | GitHub token for MCP tools |
| `MAGIC_API_KEY` | No | 21st.dev API key for magic MCP |

---

## License

Private — not for distribution.
