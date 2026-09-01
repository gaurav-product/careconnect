# 09 · Product requirements

**Product:** CareConnect — post-discharge care accountability layer
**Status:** MVP built; no real-user validation
**Owner:** single builder wearing PM, design, engineering and QA hats

---

## 1. Scope in one paragraph

A family member sets up a 30-day care plan on the day of a hospital discharge, starting
from a template for that kind of recovery and edited against their own discharge summary.
They invite the attendant they have already hired with a six-character code. The attendant
opens a phone-shaped screen, starts a shift, and records medicines, care tasks and
readings — including what could not be done and why. Anything outside the plan raises an
alert the family must acknowledge and close with a note. When the attendant is replaced,
a handover pack carries the plan, the last week and every decision already made to
whoever comes next.

## 2. The removal test

Every P0 feature had to answer: **if we remove this, does the core value proposition
fail?** Anything that answered "no" was cut to P1. The cuts are as informative as the
keeps.

### P0 — the value proposition fails without these

| # | Feature | Remove it and… |
| --- | --- | --- |
| P0-1 | **Care plan setup from a discharge-type template** — patient, procedure, discharge date, medicines with times and a "must not be missed" flag, task routine by shift, readings with normal bands, warning signs | …there is nothing to verify care *against*. A log with no plan is a diary. **KEEP** |
| P0-2 | **Attendant invite by code, no app install** | …the data source never arrives. An attendant on a shared ₹9,000 phone will not install an app for someone else's family. **KEEP** |
| P0-3 | **Shift model — start, record, close with a handover note** | …entries have no owner and no boundary; "who was on duty when this was missed" becomes unanswerable, and accountability collapses. **KEEP** |
| P0-4 | **Logging with a mandatory reason for anything not done** | …the record only contains successes, which trains people to lie and destroys the early-warning value. **KEEP** |
| P0-5 | **Deterministic alerting** — red flag reported, reading out of range, critical medicine unrecorded, shift not started, shift closed with critical items unrecorded | …the family has to remember to check a dashboard. Exception-driven is the whole point (H4). **KEEP** |
| P0-6 | **Alert acknowledge → close with a note** | …decisions live in someone's WhatsApp and are lost at the next attendant change. The note *is* the continuity artefact. **KEEP** |
| P0-7 | **Family daily record** — what was expected, what happened, what was missed and why, who was on duty | …there is no answer to "how was today?", which is the question being sold. **KEEP** |
| P0-8 | **Handover pack, generated on attendant change** | …the differentiator disappears and CareConnect becomes a general tracker in a category that already has a free one. **KEEP** |
| P0-9 | **Bilingual attendant interface (English + Hindi on every action)** | …the primary data source cannot read the buttons. This is not localisation polish; it is the input layer. **KEEP** |
| P0-10 | **Accounts, roles and per-plan access** | …health information about a named person has no boundary. Non-negotiable. **KEEP** |

### Cut from P0 during the removal test

| Feature | Why it was cut |
| --- | --- |
| **Photo evidence of wounds and meals** | Feels essential; is not. It adds upload weight on poor data, and creates a much heavier privacy obligation (images of a person's body). The text red flag carries the signal; the photo goes to the doctor on WhatsApp today and can keep doing so. → **P1** |
| **Multiple family members / care circle** | The buyer is one person. A second sibling improves the experience and does not test the hypothesis. → **P1** |
| **Medicine stock tracking** | The demo's own missed dose was caused by a finished strip, so it is clearly real — but it is a second job (inventory) bolted onto the first. → **P1** |
| **Doctor follow-up scheduling** | A calendar. Calendars exist. → **P2** |
| **Attendant ratings** | Cannot be credible on one episode's data, and turns a trust product into a surveillance product on day one. → **P2** |
| **In-app chat** | Directly competes with WhatsApp, where the family already talks to the attendant. Losing that fight would cost the whole product. → **never** |

### P1 — important, not essential

WhatsApp/SMS alert delivery (currently a visible stub) · offline shift logging with queued
sync · additional family members with roles · photo attachment on a red flag · medicine
stock and refill alerts · Hindi-only mode toggle · weekly summary the family can forward
to the doctor · agency view, paid for by the family · export the full record as a PDF.

### P2 — future

Portable attendant work record across families · verified marketplace built on episode
data (O2) · chronic-care mode after day 30 · insurer or hospital distribution · vitals
device integration · regional languages beyond Hindi.

## 3. Functional requirements

### FR-1 Accounts and access
- Sign up with a 10-digit Indian mobile number, a name, a password of at least 8
  characters, and a role of family or attendant.
- Session is a signed, HttpOnly, SameSite=Lax cookie, valid 30 days.
- Failed sign-in attempts are rate-limited per number and IP; successful sign-ins are not
  counted.
- A user sees only the plans they are an active member of. Every plan route enforces
  membership and role.

### FR-2 Care plan setup
- Three steps: patient and discharge details → recovery type → medicines.
- Five recovery templates (orthopaedic, cardiac, stroke, abdominal/general surgery,
  general recovery). Each seeds care tasks in English and Hindi, readings with normal
  bands, and warning signs.
- Discharge date cannot be in the future. Episode length 7–90 days, default 30.
- Medicines take a name, dose, one to six daily times, an instruction and a **must not be
  missed** flag.
- The family can add or stop medicines and tasks at any time. Stopping is a
  deactivation — history is never deleted.
- The setup screen states that the template is a starting point and the discharge summary
  is authoritative.

### FR-3 Attendants
- The owner adds an attendant by name (phone and agency optional) and receives a
  six-character invite code, with a one-tap copy of a WhatsApp-ready message.
- An attendant redeems a code once; a used or ended code is refused with an explanation.
- Maximum four attendants per plan, to keep the roster meaningful.
- Ending an attendant revokes access immediately, closes any open shift, and **always**
  writes a handover snapshot.

### FR-4 The shift
- The day shift is 07:00–18:59 IST; the night shift is the remainder. All dates are IST
  calendar days.
- One shift per plan per date per slot. A second attendant attempting to start the same
  slot is refused with an explanation.
- The attendant's screen shows only that slot's tasks, that slot's doses, the readings due,
  the warning signs, and the previous handover note.
- Closing a shift accepts an optional note for the next person and reports how many items
  were left unrecorded.
- A closed shift accepts no further entries.

### FR-5 Recording
- Task: done · could not do · not needed. Anything other than done requires a reason.
- Medicine: given · not given · refused · held on doctor's advice. Anything other than
  given requires a reason.
- Readings: blood pressure (both numbers required), sugar, temperature, SpO₂, pulse,
  weight.
- Any entry can be corrected within the same shift; corrections overwrite rather than
  duplicate.
- Only the attendant on the open shift may record care. Family members may add
  observations at any time.

### FR-6 Alerts
Deterministic rules only, no inference:

| Trigger | Severity |
| --- | --- |
| Warning sign reported by attendant or family | The severity set on that warning sign |
| Reading outside the plan's normal band | Watch |
| Reading inside a hard clinical band (SpO₂ < 90, temp ≥ 102 or ≤ 95 °F, sugar < 60 or > 400, pulse > 130 or < 45, systolic ≥ 180 or ≤ 90, diastolic ≥ 120 or ≤ 50) | Urgent |
| A must-not-miss medicine not recorded 90 minutes past its time | Urgent |
| Any other medicine not recorded 90 minutes past its time | Watch |
| Medicine recorded as not given or refused | Urgent if critical, else watch |
| No shift started by 08:00 (day) or 20:00 (night) | Watch |
| Shift closed with critical items unrecorded | Watch |

- Alerts deduplicate on their source; recording the item afterwards auto-resolves the
  alert it caused.
- The family acknowledges an alert, and closes it **with a mandatory note** that becomes
  part of the record and the handover pack.
- Every alert also writes the message a live deployment would send. Delivery is not
  connected, and the app says so.

### FR-7 Family record
- Today: who is on duty, open alerts sorted urgent-first, today's progress, and a
  seven-day strip marking verified days.
- Any day: shifts with handover notes, every dose and task with status and reason,
  readings with out-of-range marking, observations, and that day's alerts.
- Insights: the measurement definitions from doc 13 computed over this episode, labelled
  as describing the demo rather than real performance.

### FR-8 Handover pack
On one page, printable: the patient and their context; warning signs in both languages;
medicines with times and instructions; the daily routine in both languages; the last seven
days with what went wrong; **what was reported and what the family decided**; the outgoing
attendant's last note; and anything still open. Readable by the family and by any active
attendant.

## 4. Non-functional requirements

- **Mobile first.** The attendant flow is designed at 360 px and tested at Pixel 7 size;
  primary actions are at least 44 px tall.
- **Accessibility.** Semantic landmarks and headings, labels tied to every input, visible
  focus rings, `aria-live` for toasts, `aria-invalid`/`aria-describedby` on errors, a skip
  link, no colour-only status, reduced-motion respected.
- **Performance.** The client bundle is ~318 KB (~94 KB gzipped); every screen is a single
  round trip.
- **Errors.** Every failure is a sentence a worried person can act on. No raw status
  codes, no silent failures, and a retry path on every load error.
- **Privacy.** Health information is visible only to active members of that plan. Analytics
  store event names and low-cardinality properties — never names, notes or readings.

## 5. Acceptance criteria for "the MVP is done"

1. A family can go from sign-up to a live plan with an attendant invited in under five
   minutes, using only a discharge summary.
2. An attendant can join with a code and complete a full shift — meds, tasks, a reading, a
   red flag, a close-out note — on a phone-sized screen, without training.
3. Every alert rule fires, deduplicates, auto-resolves where appropriate, and requires a
   note to close.
4. Ending an attendant revokes access and produces a handover pack that contains the plan,
   the week, and the decisions already taken.
5. Every core flow, failure state and edge case in doc 17 passes on mobile and desktop.
6. No console errors on any screen; automated tests green.
7. Nothing in the product or its documentation claims traction that does not exist.

**All seven are met.** What is *not* met, and cannot be by building alone, is any evidence
that real families and attendants would use it — which is doc 14's job.
