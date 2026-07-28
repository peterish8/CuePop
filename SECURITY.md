# Security

Deckactive is shipped with a local demo account. Delete or reset `demo@cuepop.app` before exposing an installation to the public internet.

For a public or commercial deployment:

- terminate traffic with TLS and secure reverse-proxy defaults
- add IP-aware rate limiting for login, registration, uploads and room-code discovery
- store data in managed Postgres/object storage with backups and retention controls
- scan uploaded files and enforce storage quotas
- rotate presenter links after each event and avoid sharing controller-token URLs
- add email verification, password recovery and session-management controls
- run dependency, SAST, DAST and privacy reviews before launch
- test the exact multi-instance realtime topology under expected load

The included Socket.IO layer has per-connection event limiting, and public room payloads exclude attendee names and presenter notes. These controls are defense-in-depth, not a replacement for an edge security layer.

Please report security issues privately to the repository owner rather than opening a public issue with exploit details.
