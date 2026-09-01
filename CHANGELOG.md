# Changelog

All notable changes to CareConnect. This is a portfolio project, so entries record
*product* decisions alongside code.

## [0.1.0] — 2026-09-01

The first complete MVP: research, strategy, design, build, QA and documentation.

### Strategy
- **Rejected the original brief.** Discovery of caregivers was found not to be the scarce
  good; CareConnect was repositioned from a caregiver marketplace to a post-discharge care
  accountability layer (decision D-01).
- Selected the beachhead as the intersection of two segments — the adult child living away
  **and** the first 30 days after a discharge (D-03).
- Tested the five starting hypotheses: H1 rejected, H2 accepted with a reframe, H3 and H4
  accepted, H5 recorded as unproven and existential.

### Added — product
- Three-step care plan setup with five recovery templates (orthopaedic, cardiac, stroke,
  abdominal, general), seeding bilingual tasks, readings with normal bands and warning
  signs.
- Attendant invites by 6-character code with a one-tap WhatsApp message; no app install.
- Shift model: start, record, close with a handover note; one attendant per slot per day.
- Recording of medicines, tasks and readings, with a **mandatory reason** for anything not
  done.
- Deterministic alert engine — red flags, out-of-range readings (including hard clinical
  bands), unrecorded critical doses, shifts not started, shifts closed incomplete — with
  deduplication and auto-resolution.
- Alert acknowledgement and close-with-a-required-note.
- Family daily record, 7-day verified-day strip, and an Insights screen computing the
  metric definitions over the episode.
- **Handover pack**, generated on every attendant change and readable by both roles.
- Bilingual (English + Hindi) attendant interface, shown simultaneously rather than behind
  a toggle.
- Notification outbox: every alert composes the message a live deployment would send, at
  status `queued_stub`, displayed in-app under a heading stating delivery is not connected.

### Added — engineering
- Express 5 + TypeScript API over SQLite (16 tables), React 19 + Vite + Tailwind client,
  one process in production.
- Cookie sessions (bcrypt + JWT, HttpOnly, SameSite=Lax), role-scoped authorisation on
  every plan route, Zod validation at every boundary.
- First-party analytics with 21 event types and no free text.
- Seed script producing a fictional 9-day episode including a deliberate bad day and an
  attendant replacement.
- 60 unit and integration tests; 24 Playwright journeys across mobile and desktop; a
  screenshot script that fails on any console error.

### Fixed — found by QA
- **Handover pack lost resolved decisions.** Resolving an alert removed it from the
  artefact whose purpose is carrying decisions forward. The pack now carries recently
  resolved alerts with their notes (D-14).
- **Dates rendered one day early outside IST** — a 24 August discharge displayed as
  23 August. All dates now formatted explicitly in Asia/Kolkata, with regression tests
  (D-13).
- **Rate limiting counted successful sign-ins**, so a family and attendant sharing a
  connection could be locked out of a health record. Only failures count; a success clears
  the counter (D-15).
- Readings displayed floating-point artefacts (`98.39999999999999`).
- `/api/auth/me` returned 401 on every signed-out page load, filling the browser console;
  signed-out is now a normal 200 response with a null user.
- Attendants could not reach the full care plan from their phone.
- Attendant copy promised alert delivery that does not happen.
- The handover pack listed problems by ISO date instead of day number.

### Added — after the self-critique pass
- A standing bilingual statement on the attendant screen that CareConnect is not medical
  advice and not an emergency service.
- A line above the family's alerts stating the product does not diagnose.
- A plain-language note at sign-up covering what is stored, who can see it, and that this
  is a prototype.
- Credential rate limiting.

### Documentation
- 19 documents covering discovery, market, users, competitors, personas, JTBD,
  opportunity analysis, strategy, PRD, flows, IA, design, metrics, experiments, the
  decision log, architecture, testing and learnings.
- A graded evidence index (A–D) for every source used.
- A portfolio case study and LinkedIn material.

### Known limitations
- No real users, no interviews, no traction. H5 and H6 remain unvalidated.
- WhatsApp/SMS delivery stubbed; time-based alerts evaluated lazily rather than on a
  scheduler; no offline logging; single family member per plan; no password reset.
- Not DPDP-compliant, and there is no consent step involving the patient.
