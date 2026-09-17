# 17 · Testing

**Status: 70 unit and integration tests + 72 end-to-end journeys (24 scenarios × phone,
tablet and desktop) + a mechanical accessibility sweep of 7 signed-in pages + a
documentation consistency audit. All passing. No console or page errors on any of the 18
captured screens; 0 accessibility issues; 0 documentation inconsistencies.**

```
npm test            # 70 tests, ~5s
npm run test:e2e    # 51 journeys across phone (Pixel 7), tablet (820×1180) and desktop
npm run audit:a11y  # contrast, touch targets, labels, headings, landmarks
npm run shots       # captures the screenshots and fails on any console error
```

Every required end-to-end workflow has a test behind it. Each runs on all three viewports.

| # | Required workflow | Covered by |
| --- | --- | --- |
| 01 | Family creates case | full journey · fresh-episode helper |
| 02 | Family creates care plan | full journey |
| 03 | Family generates join code | full journey |
| 04 | Attendant joins with valid code | full journey |
| 05 | Invalid join code fails | "an unknown invite code is explained, not swallowed" |
| 06 | Attendant starts shift | full journey |
| 07 | Attendant records completed care | full journey |
| 08 | "Could not" **with** a reason is accepted | full journey · "a missing reason is rejected" |
| 09 | "Could not" **without** a reason is rejected | "a missing reason is rejected and nothing is recorded" |
| 10 | Family sees the attendant's record | full journey |
| 11 | Problem report reaches the family | full journey · the Hindi test asserts it in the attendant's own words |
| 12 | Handover is created | "a replacement attendant sees the previous handover" |
| 13 | Next attendant sees the handover | same |
| 14 | Correction creates revision history | "a correction keeps the earlier value" |
| 15 | Metrics come from the underlying records | "documented days moves only after care is actually recorded" |
| 16 | A deterministic alert appears | full journey |
| 17 | Unauthorised case access fails | "a family cannot open another family's care case" |
| 18 | A failed save produces a persistent error | "the attendant keeps a visible warning long after a toast would have gone" |
| 19 | Mobile attendant flow works | every scenario runs on Pixel 7, plus explicit 375 / 390 / 430 px checks |
| 20 | Hindi attendant flow works | "every action the attendant needs is readable in Hindi" |

## What is tested, and why that

Test effort went where being wrong would be most expensive: the rules that decide whether a
family is alerted, the boundaries that decide who can write to a patient's record, and the
date arithmetic that decides which day a night-shift entry belongs to.

### Unit — the pure logic (`tests/unit`, `tests/client`)

| Area | Cases |
| --- | --- |
| IST day boundaries | 20:00 UTC is already tomorrow in IST; discharge day is day 1; adding days across a month end |
| Shift slots | 07:00 and 18:59 are day; 19:00 and 03:00 are night; every task window maps to exactly one shift |
| Vital thresholds | Outside the family's band; hard clinical bands escalating even with no band set; both blood-pressure numbers checked |
| Documented care day (north star) | Any single record counts the day — a task, a dose, a reading or an observation; a day with nothing recorded does not; an imperfect day with honest misses still counts |
| Complete care day (quality) | Complete day passes; missed critical fails; unrecorded critical fails; open urgent alert fails; resolved urgent alert passes; below the 80% floor fails; an empty day never counts |
| Display formatting | IST dates render on the right day; dose times read as "9:00 pm"; readings never show `98.39999999999999` |

### Integration — the API against a real database (`tests/server`)

Each file gets a throwaway SQLite file, so tests exercise real SQL, real constraints and
real transactions.

| Area | Cases |
| --- | --- |
| Auth | Malformed number and short password rejected with field-level messages; duplicate number refused; wrong password does not reveal which half was wrong; session cookie is HttpOnly + SameSite; protected routes 401; sign-out clears; repeated failures rate-limited; **repeated successes are not** |
| Plans | Missing essentials rejected; future discharge date rejected; template seeds tasks, readings and warning signs bilingually; owner sees the plan, a stranger gets 403, an unknown plan 404; stopping a medicine keeps history; an attendant account cannot create a plan |
| Invites | Code redeemed once; reuse 409s; unknown code 404s with a human message; four-attendant cap |
| Shifts | Slot-scoped view; start is idempotent; a second attendant on the same slot 409s; a family member cannot record care; a missed item without a reason is rejected; a dose submitted twice produces one entry; a time not on the schedule is rejected |
| Escalation | Red flag raises an urgent alert; out-of-range reading alerts and in-range does not; BP needs both numbers; acknowledge then close-with-note; closing without a note rejected; an attendant cannot close an alert; closing a shift with critical items unrecorded raises an alert; a closed shift refuses further entries |
| Continuity | Handover pack contains plan, week and warning signs; ending an attendant revokes access, closes the shift and writes a handover; the owner cannot be removed; the record stays readable after they leave |
| Metrics | Computed within bounds; future and malformed dates rejected; the API exposes `documented_care_days` and no longer exposes `verified_care_days` |
| **Record integrity** | Changing a task entry keeps the earlier status *and* the earlier reason; re-submitting the same value records no revision; changing a dose entry keeps the earlier value; corrections are visible to the family **and** to the attendant who made them; a corrected day is scored on its final state |

### End-to-end — real journeys in a real browser (`tests/e2e`)

Run against a production build on a freshly seeded database, on a Pixel 7 viewport and a
1280×900 desktop.

1. Family signs in, reads today, opens a full day.
2. The handover pack is complete enough to hand to a stranger.
3. Insights are labelled as definitions, not traction.
4. The attendant lands straight on the shift, not a dashboard.
5. **The full journey:** register → set up a plan from a discharge summary → invite an
   attendant → attendant registers and joins by code → starts a shift → records a dose →
   fails to record a miss without a reason → records it with one → reports a warning sign →
   family sees the alert → cannot close it without a note → closes it with one → the
   decision appears in the handover pack.
6. The attendant can always reach the full plan and is told what the app is not.
7. The family is told the app does not diagnose.
8. The notification outbox admits delivery is not connected.
9. A correction keeps the earlier value and shows it to the family, with the original
reason struck through.
10. The north star says "documented" and explains why it is not "verified".
11. The attendant is told exactly what the family can see.
12–15. Failure states: wrong password, unknown invite code, unknown URL, deep link while
signed out.

## Accessibility sweep

`npm run audit:a11y` drives the real pages in a browser and checks, for every visible text
node, the contrast against the background actually painted behind it — plus touch targets,
labelled controls, alt text, heading structure and landmarks, on seven signed-in pages
across a phone and a desktop viewport.

| Run | Issues |
| --- | --- |
| First run (iteration 2, before fixes) | **145** |
| After fixes | **0** |

What the 145 were, and why they mattered:

| Count | Issue | Consequence |
| --- | --- | --- |
| ~135 | Secondary text at **4.40:1** (needs 4.5:1) | This token carried every Hindi sub-label on the attendant screen, every dose instruction and every medicine strength — the smallest text, read by the users least able to absorb low contrast, often on a cheap screen in a dim room |
| 5 | Small controls 32–36 px tall | Below the 44 px phone bar |
| 1 | Warning-badge text at 4.39:1 | The "worth a look" state |
| 1 | Attendant screen had **no `<h1>`** | A screen-reader user landed on a page with no title |
| 1 | Sign-in screen had no `<main>` landmark | No skip destination |

Fixes: secondary text `#6B7C76 → #5C6C66` (≥4.8:1 on every surface it is painted on),
warning text `#9A6B08 → #8C6105`, minimum control heights of 40/44/56 px by size, a real
`<h1>` on the duty screen, and a `<main>` landmark on the auth screens.

The audit holds each context to the right bar rather than the flattering one: **44 px touch
targets on a phone** (mobile best practice) and **24 px on pointer screens** (WCAG 2.1 AA
2.5.8) — the standard, not a number chosen to make the report look clean.

## Manual QA pass

Both roles walked on a Pixel-7 viewport and a laptop, with a script capturing every screen
and failing on any console or page error.

| Check | Result |
| --- | --- |
| Console and page errors on 10 captured screens | **0** |
| Responsive behaviour at 375 / 390 / 430 px, tablet and desktop | Automated: no horizontal overflow, and every visible control measured to be inside the viewport |
| Keyboard-only navigation | Passes; skip link works; focus rings visible on both backgrounds |
| Loading, empty and error states on every screen | Present on all |
| Forms reject bad input inline with usable messages | Yes |
| Buttons that do nothing | None. Every control performs a real action or is absent |

## Defects found and fixed

### Iteration 4

| # | Severity | Found by | Defect | Fix |
| --- | --- | --- | --- | --- |
| 23 | **P1** | Consistency audit (new) | **Seven documents quoted stale test counts** and seven folder links broke in the docs restructure — exactly the kind of drift a reader finds before the author does | `npm run audit:consistency`, now part of `npm run verify` |
| 24 | **P2** | Screenshot script | After the docs moved, screenshots were still being written to the old folder, so the evidence set silently split in two | Output path fixed; all 18 images regenerated in one run |
| 25 | **P2** | Screenshot script | The corrections screenshot depended on guessing a day label, so it silently skipped when the label changed | It now asks the API which day actually carries a revision |

### Iteration 3

| # | Severity | Found by | Defect | Fix |
| --- | --- | --- | --- | --- |
| 18 | **P1** | Re-reading the MVP objective | The north star required a near-perfect day, so a household recording every day with a few honest misses scored as a failure — the metric was pointed at imperfection when the first risk is abandonment | Split into documented (north star) and complete (quality) care days; three-state week strip (D-23) |
| 19 | **P1** | E2E authoring | **A new test mutated shared demo data** — ending the seeded attendant broke three later tests in other viewport projects. A test suite that only passes in one order is not a test suite | The handover journey now builds its own family, plan and two attendants |
| 20 | **P2** | Spec review | No end-to-end coverage that one family cannot open another's care case, despite it being enforced server-side | Added, across all three viewports |
| 21 | **P2** | Spec review | Tablet viewport never tested | Added a third Playwright project at 820×1180 |
| 22 | **P2** | Spec review | Adding a medicine or task showed failures only in a toast that disappears | Persistent "Not saved — …" banner inside both sheets |

### Iteration 2

| # | Severity | Found by | Defect | Fix |
| --- | --- | --- | --- | --- |
| 11 | **P0 — blocks the product's claim** | Technical audit | **Care entries could be silently rewritten.** Task and dose logs were an upsert with no history, so "missed — strip finished" could become "given" before the shift closed, invisibly. The record was unfalsifiable | Append-only `care_log_revisions`; corrections shown to the family with previous → new, time and author; 5 tests (D-17) |
| 12 | **P1** | Evidence audit | The north-star metric claimed **verification** the system cannot perform | Renamed to documented care days across code, API, UI and docs, with an in-product explanation and an E2E assertion (D-18) |
| 13 | **P1** | Accessibility sweep | 135 instances of secondary text below AA contrast, including every Hindi label on the attendant screen | Palette tokens darkened; audit script added to the repo (D-21) |
| 14 | **P1** | Accessibility sweep | The attendant screen had no `<h1>`; the auth screens had no `<main>` | Both added |
| 15 | **P1** | Accessibility review | A failed save showed a 4.5-second toast — on a patchy connection the attendant would believe it saved | Persistent bilingual "did not save" banner until the next success (D-20) |
| 16 | **P2** | Privacy review | Nothing told the attendant what the family can see about them | Permanent bilingual transparency statement on the shift screen (D-19) |
| 17 | **P2** | Evidence audit | Three conclusions stated more strongly than their evidence | Qualified in place; claim register added grading all 13 load-bearing claims (D-22) |

### Iteration 1

| # | Severity | Found by | Defect | Fix |
| --- | --- | --- | --- | --- |
| 1 | **Critical** | Screenshot review | Dates rendered one day early for any viewer west of IST — a 24 Aug discharge showed as "Sun, 23 Aug" | Format explicitly in `Asia/Kolkata`; regression test added (D-13) |
| 2 | **High** | E2E journey | Resolving an alert removed the decision from the handover pack — the product's central claim failing in its own test | Pack now carries recently resolved alerts with their notes (D-14) |
| 3 | **High** | Test suite locking itself out | Rate limiting counted successful sign-ins, so a family and attendant on one connection could be locked out of a health record | Count failures only; clear on success (D-15) |
| 4 | Medium | Screenshot review | A temperature displayed as `98.39999999999999` | `readingValue()` formatter + test |
| 5 | Medium | Console check | `/api/auth/me` returned 401 on every signed-out page load, filling the console with red herrings | Signed-out is a normal state: 200 with `{user: null}` |
| 6 | Medium | Self-critique | A new attendant could not reach the full care plan from their phone — the continuity promise, unreachable by the person who needs it | "Full care plan" and "Medicines list" links on the duty screen |
| 7 | Medium | Self-critique | No standing statement that the product is not medical advice and not an emergency service | Permanent bilingual footer on the attendant screen; a line above the family's alerts |
| 8 | Medium | Self-critique | Attendant copy promised the alert "reaches them even if they are in another city" while delivery was stubbed | Copy corrected; visible outbox added (D-10) |
| 9 | Low | Self-critique | No plain-language statement at sign-up of what is stored and who can see it | Added, with a note that this is a prototype and not for real patient data |
| 10 | Low | Screenshot review | The handover pack listed problems by ISO date instead of day number | Uses "Day 6", which is how families and attendants speak |

## The self-critique, in full

| Question | Honest answer |
| --- | --- |
| Does it solve the selected problem? | Yes for verification and continuity, **partly** for early warning — the alert exists, the delivery does not (D-10) |
| Is the target user obvious? | Yes. The family screens speak to a daughter in another city; the attendant screen could not be mistaken for anything else |
| Is core value delivered in minutes? | Setup is ~5 minutes; the first fully documented day arrives after one shift. Seeded data shows the end state immediately |
| Is anything unnecessary? | Insights sits closer to a PM artefact than a family need. Kept, labelled, and flagged in doc 18 |
| Does it feel trustworthy? | The warm palette, the plain language and the visible limitations help. The absence of a password reset does not |
| Does it differentiate? | Yes — the handover pack and the shift model exist nowhere else in this market (doc 04) |
| Are there misleading claims? | None found. Every number in the product is labelled as demo data; the stub is displayed |
| Safety or privacy risks? | Yes, and named: no patient consent step; no data-subject rights flow; no encryption at rest; no audit of reads |
| Would a real user understand what to do? | Family, probably. Attendant, unknown — **that is experiment E2, and it is the biggest open question** |
| Would an interviewer understand the decisions? | That is what docs 15 and the case study are for |

### Issues raised and their disposition

**Critical — all fixed:** the timezone defect; the missing decisions in the handover pack.

**High — all fixed:** the rate-limiting lockout; the attendant's lack of access to the plan;
the absence of a safety statement; the overstated delivery promise.

**Medium — fixed:** float display; console noise; privacy statement at sign-up; day numbers
in the pack.

**Medium — accepted, not fixed, and named as gaps:** no offline logging; time-based alerts
evaluated lazily instead of on a scheduler; a single family member per plan; no password
reset.

**Low — deliberately not done:** animation polish, an icon set, a marketing landing page,
dark mode. None of them change whether the product works, and doc 14's experiments are
worth more than all of them combined.

## What is not tested

- **Nothing has been tested with a real family or a real attendant.** Every usability claim
  here is a designer's judgement, not a finding.
- No load or concurrency testing; SQLite's single-writer limit is untested under
  contention.
- No screen-reader testing with an assistive-technology user, and no formal WCAG audit —
  the accessibility work is best-effort, not certified.
- No penetration testing.
- No cross-browser testing beyond Chromium.
