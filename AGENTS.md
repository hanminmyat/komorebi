<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## MCP Servers

### github
GitHub API integration — issues, PRs, code search, file operations.
Key tools: `issue_read`, `issue_write`, `pull_request_read`, `pull_request_review_write`, `search_code`, `search_issues`, `create_pull_request`, `merge_pull_request`, `get_file_contents`, `push_files`, `create_branch`, `run_secret_scanning`

---

## Skills

### markdown-creator (local)
Create and format Markdown documents — READMEs, CHANGELOGs, ADRs, how-to guides.
Templates: `readme.md`, `changelog.md`, `adr.md`, `how-to.md`
Trigger: "write a README", "draft a CHANGELOG", "create an ADR", "format this doc"
Location: `.claude/skills/markdown-creator/`

---

## Agents

| Agent | Best for | Model |
|-------|----------|-------|
| **General** (default) | Code generation, multi-step tasks, implementation | sonnet |
| **Explore** | Fast codebase search — find files, grep patterns, read content. Does NOT edit. | haiku |
| **code-reviewer** | Structured code review with feedback on bugs, perf, security | sonnet |

Use `subagent_type: "Explore"` for read-only searches to save tokens.

---

## Workflows

Multi-agent orchestration via the `Workflow` tool. Common patterns:

- **Understand** — parallel readers over subsystems → structured map
- **Design** — judge panel of N independent approaches → scored synthesis
- **Review** — dimensions → find → adversarially verify
- **Research** — multi-modal sweep → deep-read → synthesize
- **Migrate** — discover sites → transform each → verify

Use `pipeline()` for sequential stages, `parallel()` for barriers, `agent()` for individual subagents.

---

## Project Flow

```
Landing Page → Sign Up → Dashboard → Create Capsule → Album View
    │                              │                      │
    │                              │                      ├── Record audio
    │                              │                      └── Upload photos
    │                              │
    │                              ├── Step 1: Memory date (when did it happen?)
    │                              ├── Step 2: Title + description (use prompts if stuck)
    │                              └── Step 3: Capsule type (audio / photo / mixed)
```

### Key components

| Component | Responsibility |
|-----------|---------------|
| `Landing page` | Marketing — hero, how-it-works, capsule types, emotional CTA |
| `Dashboard` | Stats row (photos, recordings, capsules, % with media), capsule grid |
| `CreateCapsuleForm` | 3-step wizard: date → title/description → type |
| `MemoryPrompts` | 12 inspiration prompts for titles — dropdown, not AI |
| `CapsuleDetailPage` | Album cover card + masonry media album + add media section |
| `MediaAlbum` | Scrapbook-style display — photo frames with rotation, audio note cards |
| `AudioRecorder` | Record → blob → upload → save URL pipeline |
| `ImageUploader` | Drag-drop + client-side compression (max 1600px, JPEG 0.85) |

### Media limits

- Audio: 1 per capsule
- Images: 10 per capsule
- Media items: always ordered by `order_index`

---

## Project Conventions

- **Framework**: Next.js App Router + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Auth + Postgres + Storage)
- **Design tokens**: Use `text-muted`, `bg-primary`, `border-border` etc. — never hardcoded `text-gray-*` or `bg-black`
- **Rounded corners**: `rounded-xl` (cards), `rounded-2xl` (containers)
- **Shadows**: `shadow-primary/5`, `shadow-primary/10`, `shadow-primary/20`
- **Scope**: MVP only — see `CLAUDE.md` for allowed/not-allowed features
