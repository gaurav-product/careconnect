# Evidence

What is actually in this folder, and what it does and does not prove.

## Screenshots

`screenshots/` holds **18 images, all captured automatically from the running
application** by `npm run shots`. The script drives a real browser through real flows —
including registering a family, building a care plan and having an attendant join — and
**fails if any page logs a console error**. Nothing here is a mockup, a design comp, or a
hand-edited image.

| # | Screen | Shows |
| --- | --- | --- |
| 01 | Sign in | Entry point, demo credentials |
| 02 | Family dashboard | Who is on duty, open alerts, today's progress, the week strip |
| 03 | Day record | Every dose and task with status and reason, who was on duty |
| 04 | Handover pack | The artefact that outlives the attendant |
| 05 | Attendants | Roster, invite codes, ending an attendant |
| 06 | Insights | Documented vs complete days, guardrail metrics, the stubbed outbox |
| 07 | Attendant shift | The whole attendant app, bilingual, on a phone |
| 08 | Report a problem | Warning-sign chips and free text, in both languages |
| 09 | Could not + reason | The mandatory-reason sheet |
| 10 | Family dashboard, mobile | The same dashboard at phone width |
| 11 | Corrections | An earlier value struck through, with time and author |
| 12 | Create care case | Step 1 of setup, from a discharge summary |
| 13 | Choose recovery type | The five starter templates |
| 14 | Care plan medicines | Dose times and must-not-miss flags |
| 15 | Invite code | The 6-character code and the WhatsApp message |
| 16 | Attendant join | Code entry, bilingual |
| 17 | Attendant before shift | "Read this first" and Start my shift |
| 18 | Family on tablet | The 820px layout |

**What they prove:** the product exists and these screens work.
**What they do not prove:** that anyone wants it.

## What counts as evidence in this project

| Kind | Where | Status |
| --- | --- | --- |
| Source research | [`02-research/evidence-index.md`](../02-research/evidence-index.md) | Graded A–D; three conclusions downgraded on re-audit |
| Automated tests | [`08-engineering/testing.md`](../08-engineering/testing.md) | **Engineering validated** |
| Accessibility sweep | `npm run audit:a11y` | Measured, 0 issues — not a WCAG certification |
| Screenshots | here | Real, from the product |
| User research | — | **None. No interviews, no pilot, no users** |
| Pilot results | [`07-validation/evidence-table.md`](../07-validation/evidence-table.md) | Template only. **Empty, because the pilot has not run** |

## The distinction this folder exists to protect

**Engineering validated ≠ user validated.** Everything here is the first. Nothing is the
second. A passing test suite says the software does what I told it to; it says nothing
about whether a family in Delhi would use it, or whether an attendant would keep logging
after week one.
