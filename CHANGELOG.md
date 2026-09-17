# Changelog

All notable changes to CareConnect. This is a portfolio project, so entries record
*product* decisions alongside code.

## [1.0.0] — 2026-09-17

Final delivery pass: coverage for every required workflow, a repository organised for
reading, and a mechanical guard against the documentation drifting from the product.
**No new product features.**

### Added — test coverage for the full definition of done
- **A failed save is proven to stay visible.** The test aborts the request mid-round, checks
  the bilingual banner appears, waits six seconds (longer than a toast lives), confirms it is
  still there and that the item still offers the action — then restores the connection and
  confirms the same tap works and the warning clears.
- **The Hindi flow is tested as a flow**, not as a translation: every action label, the
  report sheet, no horizontal overflow, and the attendant's own Hindi words arriving on the
  family's screen.
- **Metrics are proven to come from records** — documented days moves from 0 to 1 after a
  single task is recorded, while complete days correctly does not.
- **Phone widths 375 / 390 / 430 px** are checked for horizontal overflow and for any control
  measured outside the viewport.
- 63 end-to-end journeys (21 scenarios × phone, tablet, desktop), up from 51.

### Added — one-command verification and CI
- `npm run verify` — typecheck, build, unit and integration tests, end-to-end across three
  viewports, the accessibility sweep and the consistency audit.
- `npm run reset-demo` — rebuild the demo episode from scratch.
- `.github/workflows/verify.yml` — the same checks on every push and pull request.

### Added — a guard against the docs drifting from the product
- `npm run audit:consistency` checks banned vocabulary, every quoted count, every internal
  link across 34 documents, and the app source for any claim to *verify* care.
- **It found 21 real inconsistencies on its first run**, all fixed. (D-26)

### Changed — repository organised for reading
- Application code moved to `app/`; documentation regrouped into `00-overview` …
  `10-evidence` in the order the story is told; screenshots into `10-evidence/`. (D-27)
- Added a product overview, a glossary (product, metric, evidence and validation
  vocabulary), a PM interview story, and a note on what the evidence proves and does not.

### Fixed
- The screenshot script was still writing to the pre-restructure folder, which had silently
  split the evidence set in two.
- The corrections screenshot depended on guessing a day label; it now asks the API which day
  actually carries a revision.
- **18 screenshots**, all regenerated from the running application in one pass, with zero
  console errors.

## [0.3.0] — 2026-09-17

MVP scope check against the build specification, and preparation for a real-world pilot.
**No new product features.**

### Changed — the north star was pointed at the wrong risk
- **Split "documented care days" from "complete care days".** The north star required a
  near-perfect day, so a household that recorded something every day for two weeks with a
  few honest misses would have scored as an almost total failure. The MVP's first risk is
  **abandonment**, not imperfection. Documented (≥1 care record for the day) is now the
  north star; complete (every must-not-miss item, ≥80% recorded, no urgent alert open) is
  tracked separately as the quality measure. (D-23)
- The family's week strip went from two states to three — **grey** nothing recorded,
  **amber** recorded with something important missed, **green** complete — because the amber
  case is the most actionable and the binary version hid it.

### Added — validation kit, so the pilot can be run rather than improvised
- `docs/07-validation/pilot-runbook.md` — recruitment, setup day, the fourteen days, the rule
  that the researcher must not prop the pilot up, four triggers that stop it early, and how
  to write it up when n=3.
- `docs/07-validation/participant-materials.md` — attendant and family one-pagers (Hindi first
  for the attendant), three spoken consent scripts including one for the **patient**, and a
  daily observation log with a no-coaching protocol.
- `docs/07-validation/evidence-table.md` — the template that keeps *what happened* apart from
  *what we think it means*, with a confidence vocabulary and a rule that no Low-confidence
  observation may imply a feature.

### Fixed
- **A test I wrote mutated shared demo data.** A new end-to-end journey ended the seeded
  attendant, breaking three later tests in other viewport projects. The journey now builds
  its own family, plan and two attendants.
- Adding a medicine or task surfaced failures only in a toast that disappears; both sheets
  now keep a persistent "Not saved — …" banner.

### Added — test coverage for the definition of done
- End-to-end: **a family cannot open another family's care case**, and **a replacement
  attendant sees the previous attendant's handover note on their first screen**.
- A third Playwright project at tablet size (820×1180).
- 65 → **70** unit and integration tests; 30 → **51** end-to-end journeys.

### Changed — documentation reorganised, not expanded
- `docs/` grouped into `research/`, `product/`, `decisions/`, `metrics/`, `validation/`,
  `engineering/` and `portfolio/`, with `docs/README.md` as the front door. No document was
  deleted and no new analysis was written. (D-25)

### Deliberately not built
No item from the excluded list was added. Specifically considered and declined: a mandatory
"reason for this correction" prompt — the revision already stores the previous status *and*
its reason, and charging the attendant a paragraph for fixing a mis-tap trains them not to
fix it. (D-24)

## [0.2.0] — 2026-09-02

An audit, honesty and integrity pass. **No new features.** Everything below came out of
auditing what was already there.

### Fixed — record integrity
- **Care entries could be silently rewritten.** Task and dose logs were an upsert with no
  history: an attendant could record *"missed — strip finished"* and change it to *"given"*
  before closing the shift, invisibly. In a product whose only asset is the record, that
  made the record unfalsifiable. Entries are now append-only — every change writes the
  previous status, previous reason, time and author to `care_log_revisions`, and the
  family's day record renders *previous → new*. Re-submitting an identical value writes no
  revision, so a double tap on a slow connection is not logged as a correction. (D-17)

### Changed — the north-star metric now says what it means
- **"Verified care days" → "documented care days"**, across the code, the API, the interface
  and every document. CareConnect cannot confirm that a tablet was swallowed; it records what
  one person entered, at a time, under their name, with corrections kept. The Insights screen
  explains the difference to the family, and the docs state what would let us honestly use
  "verified" later — a second independent signal for the same event. (D-18)

### Fixed — accessibility, measured rather than asserted
- Added `npm run audit:a11y`: drives seven signed-in pages and checks contrast against the
  background actually painted behind every text node, plus touch targets (44px on a phone,
  WCAG 2.1 AA's 24px on pointer screens), labelled controls, alt text, heading structure and
  landmarks.
- **145 issues on the first run, 0 after fixes.** The largest cluster was secondary text at
  4.40:1 — which carried every Hindi sub-label on the attendant screen. Secondary text
  `#6B7C76 → #5C6C66`; warning text `#9A6B08 → #8C6105`; minimum control heights 40/44/56px;
  a real `<h1>` on the duty screen; a `<main>` landmark on the auth screens. (D-21)

### Added — for the attendant
- A persistent, bilingual "your last entry did not save" banner replacing a 4.5-second toast.
  On a patchy connection the attendant looks away, the toast dies, and they believe it saved.
  (D-20)
- A permanent statement of **what the family can see** — what you record, the time, your name;
  no location, no camera, no microphone — with links to the full care plan and handover, so
  nothing about the patient is withheld from them either. There is no secret file about a
  worker in this product. (D-19)

### Changed — evidence and claims
- Added a **claim register** to `docs/02-research/evidence-index.md` grading all 13 load-bearing
  conclusions, and downgraded three that were stated more strongly than their evidence:
  *"every well-funded attempt failed"* → an INFERENCE from four unverified cases; *"the only
  player"* → an OBSERVATION from a desk review, not a census; *"no family described being
  unable to find an attendant"* → absence of evidence, with the scope narrowed to metro
  paying families and a falsifier written in. (D-22)
- Refreshed the competitive analysis with HCAH's published shift structure, ₹1,000/day entry
  price, verification claims and 24-hour replacement promise, and with Antara Senior Care —
  a Max-group player already selling to exactly this beachhead. Added a "why they win"
  analysis in place of a feature grid.
- Recorded that **CareStride and Health24**, named in the brief, did not surface in desk
  research at all — rather than padding the analysis with a guess.

### Added — documentation
- `docs/07-validation/validation-plan.md`: family, attendant and hospital/agency interview guides
  written around past behaviour; an observation protocol with explicit no-coaching rules;
  research consent and privacy guidance that collects no clinical detail; three experiment
  designs with **pre-registered thresholds labelled as proposed, not results**; and an
  experiment tracker where every row currently reads *Not started · Inconclusive*.
- `docs/09-portfolio/portfolio-review.md`: the project scored 1–10 across 13 dimensions as a hiring
  manager would, with the five questions an interviewer would ask and the answers to give.
- `docs/09-portfolio/linkedin-carousel.md`: an 11-slide carousel outline with visuals and source
  references per slide.
- `docs/09-portfolio/learnings.md` now answers 15 skeptical-interviewer questions, marking the weak
  answers UNVALIDATED rather than dressing them up.
- `docs/03-strategy/product-strategy.md` now scores five candidate payers — family, agency, hospital,
  employer, insurer — and names the employer benefit as the fallback if families will not
  pay unbundled.

### Testing
- 60 → **65** unit and integration tests; 24 → **30** end-to-end journeys; plus the
  accessibility sweep. All passing.

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
