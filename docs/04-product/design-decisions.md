# 12 · Design decisions

## The brief the visual design had to satisfy

Two users, one product, opposite conditions:

- A 41-year-old professional reading on a laptop or a phone, anxious, short of time,
  scanning for "is anything wrong".
- A 34-year-old attendant on a cheap Android phone, Hindi-first, hands busy, standing in
  somebody's bedroom at 9:40pm.

And one emotional constraint that ruled out the obvious approach: **this is somebody's
parent.** A dashboard aesthetic — dense KPI tiles, chart grids, cool greys and electric
blues — would be efficient and completely wrong. It would make a father look like a
system under monitoring.

## D-01 · A warm, domestic palette instead of clinical blue

Deep green (`#2E7D5B`) on a warm sand ground (`#FBF8F3`), with terracotta (`#C4441F`) for
things that need a decision and amber for things worth a look.

- Green reads as care and safety in Indian visual culture and avoids hospital blue, which
  carries exactly the association the family is trying to get away from.
- Sand is warmer than white, reduces glare on a cheap screen in a dim room, and keeps
  white cards visually distinct without borders doing all the work.
- Terracotta rather than pure red: alarming enough to stop scrolling, not the colour of a
  cardiac monitor.
- Status is never carried by colour alone — every state also has a word.

Contrast was designed for AA: ink `#12211C` on sand is ~15:1; white on green-500 is
~4.9:1; terracotta on its 50-tint is ~5.1:1.

## D-02 · Two typographic scales in one product

The family's screens use a normal information density. The attendant's screen uses larger
type, 56 px action buttons, and one card per item. The same component library serves both;
only the size and density change. A single "responsive" treatment would have compromised
both.

## D-03 · Both languages, always, on the attendant's screen

Not a language toggle. Every action carries English and Hindi at once: **Given · दे दी**,
**Could not · नहीं हुआ**.

- A toggle assumes one reader per phone. In this market the phone is shared, the family
  sometimes picks it up, and a supervisor may check the screen. Both languages at once is
  the only setting that works for all of them.
- It also removes a setup step from someone who has no reason to invest in setup.
- Care tasks carry `title_en` and `title_hi` as first-class fields, so a family adding a
  custom task can type the Hindi themselves; if they do not, the English is reused rather
  than a machine translation being invented.

## D-04 · The attendant's whole app is one screen

No navigation, no tabs, no menus. Emergency call → plan links → shift state → medicines →
tasks → readings → report → end shift. Two links out of it, both read-only.

The bar this had to clear was not "better than Portea's app". It was **better than a
WhatsApp message**, for someone with no incentive to learn a tool. Anything that needed
explaining was cut.

## D-05 · "Could not do" is a button, not a failure

Every task and dose offers two equal-weight actions. The negative one opens a sheet that
asks *"What happened? · क्या हुआ?"* and requires one line.

This is the most important interaction decision in the product. A checklist that only
records success produces a perfect record and a useless one. The reason field is where the
early warning actually lives — *"strip finished, chemist was shut"* is a supply problem the
family can fix in ten minutes, and it is invisible in every alternative on the market.

The copy under the field — *"the family will read this line"* — is deliberate: it sets the
expectation that this is communication, not confession.

## D-06 · Closing an alert requires a note

The family cannot dismiss an alert. They can say they have seen it, and they can close it
**with a sentence about what they did**.

- It stops the alert list becoming a notification tray people clear reflexively.
- It captures the decision at the moment it is made, in the words of the person who made
  it.
- It is the artefact that makes the handover pack worth reading: *"Sent a photo to Dr
  Menon. He added Augmentin and asked for a dressing change tomorrow."*

The cost is friction on every alert. That is the right trade for a product whose asset is
the record.

## D-07 · Templates that start the plan, and say they are only a start

Five recovery templates seed tasks, readings with normal bands, and warning signs, in both
languages.

- **Why templates at all:** setup happens in the worst hour of a family's month. A blank
  form loses them; a plausible plan they can edit does not.
- **Why they are framed as a starting point, twice:** the templates encode routine care —
  mobilisation, hydration, wound checks, escalation triggers — not prescriptions. The
  setup screen and the care-plan screen both state that the discharge summary is
  authoritative. CareConnect never generates a clinical plan.

## D-08 · Deterministic rules, never inference

The alert engine is a table of thresholds a person can read (doc 09, FR-6). No model, no
scoring, no "AI".

- A family can be told exactly why they were alerted, which is the only way an alert
  earns trust.
- A wrong threshold is a bug that can be fixed. A wrong inference is a liability.
- It keeps the product firmly on the "record and escalate" side of the medical-device
  line.

Hard clinical bands (SpO₂ < 90, temp ≥ 102 °F, and so on) escalate to urgent regardless of
what the family configured, because a family setting a wide "normal" band should not be
able to switch off a genuinely dangerous reading.

## D-09 · Time is India Standard Time, everywhere

Care days are IST calendar days; shifts are 07:00–18:59 and the remainder. The database
stores UTC instants and derives IST days in one helper used everywhere.

This is not a detail: a night-shift entry at 01:00 IST belongs to the day it happened in
the house, not the previous UTC day. **QA caught the client-side half of this bug** — dates
were rendering one day early for any viewer west of IST, so a discharge on 24 August
displayed as 23 August. Both halves now have tests.

## D-10 · The patient is not a user, and the product says so

Ramesh never opens CareConnect. He is the subject of a record kept about him, by paid
staff, at his children's request. That is a real dignity question, and the honest answer
in the MVP is a partial one:

- The plan carries a free-text field for what the attendant must know, written in the
  family's voice, which tends to produce respect rather than surveillance language.
- The product records **care actions**, not the patient's behaviour: there is no location,
  no camera, no movement tracking, no "did he leave the room" log.
- Photo capture was cut from P0 partly for this reason (doc 09).
- **Gap:** there is no consent step involving the patient. A production version needs one,
  and doc 18 lists it as unfinished business rather than pretending it is solved.

## D-11 · Every error is a sentence, not a code

Errors are written for someone who is worried and busy. *"Please say briefly why it could
not be done — the family will see this."* *"Another attendant has already started this
shift. Ask the family to check the roster."* Server messages are written to be shown to
users directly; the client never invents its own text for a server failure.

## D-12 · Showing what is missing

The Insights screen carries a card titled **"Notification outbox — not connected"**, listing
the WhatsApp messages a live deployment would have sent. Insights itself opens by saying
its numbers describe the seeded demo and not real performance.

Hiding the stub would have made the product look more finished and been a lie. Showing it
makes the boundary of the prototype part of the interface — and, incidentally, makes the
delivery integration's value obvious to anyone evaluating what to build next.

## Accessibility

- Landmarks and a skip link; one `h1` per screen; headings in order.
- Every input has a real `<label>`; errors are tied by `aria-describedby` and marked with
  `aria-invalid`; toasts are in an `aria-live` region.
- Visible focus rings everywhere, using the brand green with an offset so they survive on
  both card and page backgrounds.
- Selected states use `aria-pressed` rather than colour alone; the week strip's dots carry
  `aria-label`s.
- Touch targets on the attendant flow are 56 px; nothing critical is smaller than 44 px.
- `prefers-reduced-motion` is respected.
- **Gap:** no screen-reader testing with a real user of assistive technology, and no formal
  WCAG audit. Doc 17 records this honestly rather than claiming compliance.
