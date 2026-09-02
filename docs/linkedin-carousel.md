# LinkedIn carousel — 11 slides

**Format:** 1080 × 1350 (4:5). Brand: deep green `#1C5C44` on warm sand `#EAEEEA`, ink
`#0F1A16`, ochre `#8C6105` reserved for the two reversal slides. One idea per slide;
nothing smaller than 28pt.

**Caption:** use the LinkedIn post in `linkedin-post.md`, trimmed to the first six
paragraphs plus the links.

---

### Slide 1 — The idea I started with

**Headline:** Build a marketplace for home caregivers in India.

- The brief: help families discover, evaluate, book and manage caregivers.
- It sounded obvious. That was the problem.

**Visual:** the four-step brief as a flow — Discover → Evaluate → Book → Manage — in flat
grey, deliberately lifeless.
**Source:** `docs/01-problem-discovery.md`

---

### Slide 2 — The assumption underneath it

**Headline:** That finding a caregiver is the hard part.

- Every marketplace assumes the scarce thing is supply discovery.
- Nobody had checked whether it was scarce here.

**Visual:** one sentence centred on an empty field — "Finding a caregiver is the hard part"
— with a thin ochre underline.
**Source:** `docs/01-problem-discovery.md`

---

### Slide 3 — What the research showed

**Headline:** Supply isn't scarce. It's abundant.

- One provider: 2,000+ caregivers, 10 cities, 3-hour allocation.
- Agencies, hospital desks, WhatsApp networks — someone arrives within a day.
- Not one source described a family that couldn't find an attendant.

**Visual:** horizontal bar chart — time-to-find an attendant by channel, in hours, all bars
short.
**Source:** `docs/00-evidence-index.md` (S14, S22), `docs/04-competitive-analysis.md`

---

### Slide 4 — The real problem

**Headline:** They could find a person. They couldn't verify a day.

- "Staff extremely unprofessional." "No experienced staff available."
- Helpers "disappear without notice."
- Switch agency and care "effectively resets to Day 1."

**Visual:** three complaint quotes stacked as cards, each tagged with its source grade
(C / D) — the grading itself is part of the point.
**Source:** `docs/01-problem-discovery.md`

---

### Slide 5 — The pivot ↺

**Headline:** I killed the marketplace.

- Owning caregiver supply is where the money in this market has gone.
- The scarce good isn't a person in the room. It's knowing what they did.

**Visual:** the Slide 1 flow struck through in ochre, with one line beneath it:
*"Own the record, not the supply."*
**Source:** `docs/15-decision-log.md` (D-01, D-02)

---

### Slide 6 — What CareConnect became

**Headline:** A post-discharge care record. No caregivers supplied.

- Sits on top of whoever the family already hired.
- 30 days after a hospital discharge.
- For the adult child who lives in another city.

**Visual:** product screenshot — the family's Today screen, in a laptop frame.
**Source:** `docs/08-product-strategy.md`

---

### Slide 7 — How the workflow actually runs

**Headline:** One screen for the person in the room.

- Start shift → medicines → tasks → readings → report a problem → end shift.
- Every action in English and Hindi, at once. The phone is shared.
- Under five minutes, or there is no product.

**Visual:** the attendant shift screen in a phone frame, with the bilingual buttons
circled.
**Source:** `docs/12-design-decisions.md` (D-03, D-04)

---

### Slide 8 — What I deliberately didn't build

**Headline:** The cuts are the decisions.

- ❌ In-app chat — WhatsApp already owns that conversation. Fighting for it loses.
- ❌ Photo proof — heavy on poor data, much heavier privacy cost.
- ❌ Caregiver ratings — turns a trust product into a surveillance product.
- ❌ Caregiver booking — the thing I was originally asked to build.

**Visual:** four struck-through feature cards, each with its one-line reason.
**Source:** `docs/09-prd.md`

---

### Slide 9 — What QA caught ↺

**Headline:** The record could be silently rewritten.

- "Missed — strip finished" could quietly become "given" before the shift closed.
- In a product whose only asset is a trustworthy record, that made it unfalsifiable.
- Entries are now append-only. Corrections show the earlier value, with the time and who
  made it.

**Visual:** the corrections card from the day record — struck-through "missed — he said he
was not hungry" → "done".
**Source:** `docs/15-decision-log.md` (D-17), `docs/17-testing.md`

---

### Slide 10 — What remains unvalidated

**Headline:** No users. Two open questions that could kill it.

- Will attendants log without supervision? **Unvalidated.**
- Will families pay for this unbundled? **Unvalidated.**
- I also renamed my own metric: "verified" → "documented", because the system verifies
  nothing.

**Visual:** the validation table — three green "validated" rows (all engineering), four
amber "not yet validated" rows (all product).
**Source:** `docs/19-validation-plan.md`, `docs/13-metrics.md` (D-18)

---

### Slide 11 — What I learned

**Headline:** A brief is a hypothesis wearing a requirements doc's clothes.

- The person who generates the value often isn't the person who pays for it.
- A record of only successes is worse than no record.
- Stop building when more code can't answer the open question.

**Visual:** three lines on the sand ground, generous leading, repo link at the base.
**Source:** `docs/18-learnings.md`

---

## Chart data available in the repo

| Slide | Chart | Data |
| --- | --- | --- |
| 3 | Time-to-find by channel | `docs/01-problem-discovery.md` supply table |
| 4 | Complaint themes | `docs/00-evidence-index.md` (S13, S16, S9) |
| 10 | Validated vs unvalidated | `docs/19-validation-plan.md` Part C |

## Rules for this carousel

- No invented numbers on any slide. Every figure traces to a graded source.
- Slides 5 and 9 are the two that make the piece work — the two reversals. If the deck has
  to shrink, everything else goes first.
- Do not add a "results" slide. There are none.
