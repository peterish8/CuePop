# CuePop Live Presentation MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-shaped, locally runnable CuePop MVP with a cinematic landing page, image-first deck editor, QR joining, synchronized presenter/stage/attendee/remote surfaces, live polling, and downloadable keepsake cards.

**Architecture:** Next.js App Router renders all UI and HTTP APIs. A custom Node server hosts Next.js and Socket.IO, while a focused SQLite repository owns durable domain data. The browser uses typed REST helpers for workspace actions and Socket.IO events for live-room state.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Motion, shadcn-style source components, Socket.IO, better-sqlite3, bcryptjs, Zod, QRCode React, Vitest.

## Global Constraints

- `npm install && npm run dev` must start the complete project without external services.
- Attendees join without accounts and never receive attendee-name lists.
- Host, stage, attendee, and phone-remote surfaces remain independent.
- Uploaded content is image-first; PowerPoint editing and AI are excluded.
- UI uses restrained dark cinematic marketing visuals and quieter production workspace surfaces.
- Live commands and voting are validated on the server.

---

### Task 1: Foundation, tokens, and persistence

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `components.json`, `.gitignore`
- Create: `server.ts`, `src/app/layout.tsx`, `src/app/globals.css`
- Create: `src/lib/db.ts`, `src/lib/schema.ts`, `src/lib/auth.ts`, `src/lib/utils.ts`
- Test: `src/lib/__tests__/schema.test.ts`

**Interfaces:**
- Produces `getDb()`, `initializeDatabase()`, auth cookie helpers, and shared domain types.

- [ ] Add package scripts and exact runtime dependencies.
- [ ] Define database tables and automatic seed data for `demo@cuepop.app / demo1234`.
- [ ] Define CuePop visual tokens and base typography.
- [ ] Add a schema test that initializes an isolated SQLite database and confirms the demo deck seed.
- [ ] Run `npm install` and `npm test`.

### Task 2: Auth and workspace APIs

**Files:**
- Create: `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/me/route.ts`
- Create: `src/app/api/decks/route.ts`, `src/app/api/decks/[deckId]/route.ts`
- Create: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- Create: `src/app/workspace/page.tsx`, `src/components/app-shell.tsx`

**Interfaces:**
- Consumes auth and repository helpers.
- Produces authenticated deck list/create/update/delete operations.

- [ ] Implement cookie-based login, registration, logout, and current-user lookup.
- [ ] Implement authenticated deck CRUD.
- [ ] Build responsive auth screens and workspace shell.
- [ ] Verify seeded login and deck creation manually with HTTP requests.

### Task 3: Image-first deck builder

**Files:**
- Create: `src/app/api/uploads/route.ts`, `src/app/api/media/[...path]/route.ts`
- Create: `src/app/api/decks/[deckId]/items/route.ts`, `src/app/api/decks/[deckId]/items/[itemId]/route.ts`, `src/app/api/decks/[deckId]/reorder/route.ts`
- Create: `src/app/workspace/decks/[deckId]/page.tsx`
- Create: `src/components/deck-builder.tsx`, `src/components/moment-editor.tsx`, `src/components/file-dropzone.tsx`

**Interfaces:**
- Produces ordered `DeckItem[]` records with slide, poll, or quiz payloads.

- [ ] Validate and store image uploads under `data/uploads`.
- [ ] Implement item create, update, delete, and reorder endpoints.
- [ ] Build storyboard, upload, preview, and poll/quiz configuration UI.
- [ ] Verify a deck can mix uploaded slides and interactive moments.

### Task 4: Authoritative realtime room server

**Files:**
- Create: `src/lib/live/types.ts`, `src/lib/live/service.ts`, `src/lib/live/socket-server.ts`, `src/lib/live/socket-client.ts`
- Create: `src/app/api/live/start/route.ts`, `src/app/api/live/[code]/route.ts`
- Test: `src/lib/live/__tests__/service.test.ts`

**Interfaces:**
- Produces `RoomSnapshot`, `HostCommand`, and Socket.IO event contracts.

- [ ] Implement session creation with public code and controller token.
- [ ] Implement attendee join, unique voting, host command validation, and room snapshots.
- [ ] Mount Socket.IO on the custom HTTP server.
- [ ] Test state transitions and duplicate-vote rejection.

### Task 5: Presenter, stage, attendee, and phone remote

**Files:**
- Create: `src/app/present/[code]/page.tsx`, `src/app/stage/[code]/page.tsx`, `src/app/join/[code]/page.tsx`, `src/app/remote/[code]/page.tsx`
- Create: `src/components/live/presenter-console.tsx`, `src/components/live/stage-view.tsx`, `src/components/live/attendee-view.tsx`, `src/components/live/remote-control.tsx`, `src/components/live/qr-panel.tsx`

**Interfaces:**
- Consumes live socket contracts and room snapshots.

- [ ] Build the host console with previous/next/open/close/reveal/end commands.
- [ ] Build projector-safe join, slide, question, and result modes.
- [ ] Build attendee join, waiting, voting, submitted, reveal, and ended states.
- [ ] Build a compact phone controller using the same private token.
- [ ] Verify synchronization across four browser tabs.

### Task 6: Keepsakes and reporting

**Files:**
- Create: `src/app/api/live/[code]/report/route.ts`
- Create: `src/components/keepsake-designer.tsx`, `src/components/report-panel.tsx`
- Integrate: `src/components/live/attendee-view.tsx`, `src/components/live/presenter-console.tsx`

**Interfaces:**
- Produces anonymized aggregate report data and client-generated PNG keepsakes.

- [ ] Add three curated keepsake designs and browser Canvas PNG export.
- [ ] Add aggregate counts, response rates, and per-option result summaries.
- [ ] Ensure attendee names are excluded from stage and public report payloads.

### Task 7: Cinematic marketing landing page

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/marketing/*`
- Create: `public/art/*.svg`

**Interfaces:**
- Produces a responsive landing page linking to the seeded demo and registration.

- [ ] Build the restrained Harness/Vercel/OpenAI-inspired narrative sections.
- [ ] Add editable SVG signal-path, three-surface, keepsake, and auditorium artwork.
- [ ] Add reduced-motion-safe scroll reveals and precise hover interactions.
- [ ] Validate desktop and mobile hierarchy without generic gradient-blob decoration.

### Task 8: Quality, documentation, and package

**Files:**
- Create: `README.md`, `.env.example`, `Dockerfile`
- Create: `src/app/not-found.tsx`, `src/app/error.tsx`
- Modify: all files as required by build and lint fixes.

**Interfaces:**
- Produces a documented ZIP artifact.

- [ ] Add setup, demo credentials, LAN QR testing, architecture, and deployment notes.
- [ ] Run `npm test`, `npm run typecheck`, and `npm run build`.
- [ ] Perform a four-surface smoke test.
- [ ] Remove generated caches and package the repository as `cuepop-mvp.zip`.
