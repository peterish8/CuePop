# Current State

- Milestone: M001
- Status: implementation and source-level verification complete; dependency-backed build/runtime verification blocked by npm registry availability in the build container
- Default demo credentials: `demo@cuepop.app` / `demo1234`
- Local runtime: custom Next.js Node server + Socket.IO + SQLite
- Production migration boundary: `src/lib/db.ts`, `src/lib/uploads.ts`, and `src/lib/live/*`
- Verification details: `VERIFICATION.md`
