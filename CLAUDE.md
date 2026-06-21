# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**komorebi** 
Meaning: Sunlight filtering through leaves.
Symbolism: Memories are not stored as perfect records—they appear gradually through stories, objects, and conversations.
Tagline: Turn family stories into living memories.


## Project Idea

Komorebi is an AI-assisted family memory platform that helps people preserve stories through guided conversations and meaningful objects.
Instead of storing voice notes and photos in disconnected folders, Komorebi transforms memories into a connected archive that can be rediscovered later.
The product is designed for the person holding the phone—not the storyteller.
Primary users:
- grandchildren
- adult children
- family archivists
Storytellers:
- grandparents
- parents
- relatives
- future self

- Memory > media
- Structure > storage
- Emotion > quantity
- Simplicity > features
- Bounded creation > infinite uploads

We are building a **memory structuring system**, not a media platform.
---

## Problem
Families rarely lose photos.
They lose:
context
meaning
stories behind objects
reasons events mattered
Current behavior: Take photos → Store → Forget
Record audio → Never revisit
Result: Family history slowly disappears.

## MVP Scope Lock

## 🟢 ALLOWED IN MVP

### Core Concept: Memory Capsules
- Create memory capsule
- Capsule types:
  - audio capsule
  - photo capsule
  - mixed capsule (optional, simple)

---

### Media Handling
- Audio recording + upload
- Image upload (optional per capsule)
- Max 5–10 media items per capsule
- Media ordering inside capsule


## ❌ NOT IN MVP

### AI Features
- transcription
- summarization
- search
- embeddings
- AI chat
- memory graph

### Media Platform Features
- photo galleries
- albums
- feed / timeline
- multi-user sharing
- tagging system

## Tech Stack Rules

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Supabase (Auth + DB + Storage)

### Storage
- Supabase Storage:
  - /audio
  - /images

### Memory Rules

Each collection:

- contains 1–10 media items max
- has a type:
  - audio
  - photo
  - mixed
- has metadata:
  - title
  - description (optional)
  - created_at

Media items:
- belong only to a capsule
- cannot exist independently
- must have order index

---

## Audio Pipeline (STRICT)

All audio flows must follow:

Record → Blob → Upload → Supabase Storage → Save URL → Attach to Capsule → Playback

No deviation allowed.

---

## Image Upload Rules

- Images are optional
- Max 10 per capsule
- Must be compressed on upload
- Must belong to capsule only
- No standalone image browsing allowed

---

## Claude Behavior Mode

Claude should behave as:

- senior full-stack engineer
- MVP-first builder
- strict scope enforcer
- simplicity-driven decision maker
- product-aware implementation agent

Avoid:
- overengineering
- speculative architecture
- unnecessary abstractions