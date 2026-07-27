# CuePop Live Presentation MVP Design

## Product boundary

CuePop is a responsive web application with four independent surfaces: marketing, host workspace, live stage, and attendee/remote controls. The downloadable project must work after `npm install && npm run dev` without a hosted dependency.

## Runtime architecture

The app uses Next.js App Router for pages and route handlers, a custom Node server with Socket.IO for live synchronization, and SQLite for local persistence. Uploaded slide images are written to `data/uploads` and served through a guarded route handler. A production deployment can move the same domain interfaces to hosted Postgres/object storage, while the included local adapter keeps the repository immediately runnable.

## Live room model

Each session has a short public code and a private controller token. Attendees use the public code; presenter and remote surfaces require the token. The server owns the canonical room state and broadcasts snapshots after every accepted command or vote. The room state machine is: `join -> presenting -> active -> closed -> revealed -> ended`.

## Core user flows

1. A host registers or uses the seeded demo account.
2. The host creates a deck, uploads image slides, reorders items, and inserts polls or quizzes.
3. Starting a live session produces attendee, stage, presenter, and phone-remote URLs plus a QR code.
4. Attendees join without accounts, optionally provide a name, and vote once per live moment.
5. The host opens, closes, and reveals moments while stage and attendee screens remain synchronized.
6. When the session ends, named attendees select and download a curated keepsake card.

## Visual system

The marketing site uses cinematic black negative space, editorial typography, matte product surfaces, restrained ice-cyan lighting, and product-derived SVG artwork. The application shell is quieter and denser, using shadcn-style primitives and beUI-inspired Motion interactions only where state changes benefit from animation.

## Security and constraints

Passwords are hashed with bcrypt. Auth sessions and live controller secrets are random tokens. Host-only APIs check the authenticated user. Public room payloads omit attendee names. Uploads accept common image MIME types with a 10 MB limit. Votes are unique by attendee and item. The bundled runtime targets demonstrations and small real events; the domain model is prepared for a hosted realtime/database adapter before claiming a verified 500-person production deployment.
