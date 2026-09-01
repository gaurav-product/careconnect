# CareConnect — a product case study

**The assignment:** build a platform that helps Indian families discover, evaluate, book
and manage home caregivers.
**What I shipped:** a post-discharge care accountability layer that supplies no caregivers
at all.
**Why:** the research said discovery was not the problem.

*Solo project. Research, strategy, design, build and QA. No real users yet — every
unvalidated claim in this document is labelled.*

---

## 1 · Context

India is ageing quickly. The 60+ population is heading for roughly **230 million by 2036**
and will pass the child population by **2046**; the 80+ group — the one that actually needs
hands-on help — grows **279% between 2022 and 2050** (S1, S2).

Two facts about who pays shape everything downstream. **70% of elderly Indians depend on
family for daily maintenance and 78% have no pension** (S5). And migration has separated the
payer from the patient: the person buying the care is increasingly an adult child in
another city.

The home healthcare market is about **USD 6.4bn and compounding at 12.9%**, but it is
*"highly fragmented"*, largely served by *"small local agencies and informal caregivers"*
with no uniform standards and **no dedicated national regulatory framework** (S4).

So: money, urgency, no rules, and a buyer who is not in the room.

## 2 · Problem

The brief assumed the scarce thing was **supply discovery**. I went looking for evidence
and found the opposite.

Care24 alone advertises **2,000+ caregivers across ten cities with a three-hour allocation
promise** (S14). Portea, Apollo Homecare and HCAH operate nationally. Every hospital
neighbourhood has local agencies, the discharge desk hands out numbers, and domestic-worker
WhatsApp networks fill gaps within hours. **Across every source I read, no family described
being unable to find an attendant.**

What they described was everything after that:

- *"Staff is extremely unprofessional"*; attendants not adequately trained; *"no experienced
  staff available"* on the agreed date (S13).
- Helpers who *"disappear without notice"*, triggering *"a scramble of phone calls to
  relatives, neighbours, and WhatsApp groups"* (S9).
- Rotation with no handover; switching agency means care *"effectively resets to Day 1"*;
  when an attendant takes leave the family manages *"untrained, unprepared, and anxious"*
  (S16).
- *"No contracts, background checks, or formal oversight exist in many arrangements"*, so
  problems go unnoticed *"for months"* (S9). Informal hiring provides *"no accountability
  structure, no replacement guarantee"* (S15).

**Reframed problem:**

> A family can buy a body in the room within a day. What they cannot buy is confidence that
> the right care happened today, or a way to keep the plan intact when that body is
> replaced next week.

## 3 · Research

**Method, stated honestly:** secondary research only — government releases, peer-reviewed
studies, market research, provider documentation, complaint boards. **No interviews.**
Every source is graded A–D in `docs/00-evidence-index.md`; provider marketing is never
quoted as a statistic. Where a real product would have primary data, this project says
*Not yet validated* rather than inventing a number.

I researched both sides deliberately, because the supply side is the one everyone forgets.

**Demand side.** The away adult child copes today with unscheduled video calls, a neighbour
looking in, and an evening phone call to a parent who under-reports to avoid worrying them
(S9). The register in these sources is guilt and helplessness — not price sensitivity.

**Supply side.** The attendant sits between a domestic helper and a nurse: *"not clinical,
but … trained"* (S21). Crucially, **daily reporting is already part of the job** — good
practice expects a written medication list, a daily summary and a named escalation contact
(S21). Today it is done verbally, from memory, at the end of a twelve-hour shift. She works
on a cheap Android phone, reads Hindi first, and is rotated between cases by design.

## 4 · Key insights

**① Discovery is solved; verification is not.** Supply is abundant. What is missing is any
evidence of what happened on Tuesday.

**② Continuity is the base case, not the exception.** Agencies rotate, attendants take
leave, live-in work is hard. Yet **not one player in any layer produces an artefact that
survives the caregiver changing.** The care knowledge lives in the outgoing attendant's
head and leaves with her.

**③ Every well-funded attempt failed on operations, not demand.** Portea reportedly burned
~USD 93m; Emoha is described as spending ₹1.5 to earn ₹1; Papa raised USD 242m and shut
down over care quality; Elcare closed in 2024 while growing (C-grade: S11, S12). Owning
human supply is what kills companies here.

**④ The person who generates the data does not pay for it.** The family buys; the attendant
supplies every byte of value. Design for the payer and you get a beautiful dashboard with
nothing in it.

**⑤ Medicines are the sharp edge of the first week.** Reconciling the pre-admission regimen
against the discharge prescription is the named failure point (S19), against a background
of **33.7% polypharmacy and 28.8% potentially inappropriate medications** among urban
Indian older adults (S6).

## 5 · Competitive landscape

Families do not compare products; they compare coping strategies. Three layers:

| Layer | Who | What they sell | The gap |
| --- | --- | --- | --- |
| Full-stack home healthcare | Portea, Care24, Apollo, HCAH | A trained-enough person, today | The unit is a *placement*, not an outcome. Quality is asserted at hiring, then invisible |
| Subscription elder care | Samarth, Emoha, Anvayaa (₹3,000–25,000/mo) | Reassurance via a care manager | The reassurance is a phone call, not a record |
| The offline default | WhatsApp, the neighbour, the hospital referral | Free, instant, socially normal | Nothing structured, nothing that survives the attendant leaving |

The nearest adjacent product is **WiseCare** (S17): a free family care-coordination app —
medicines, vitals, documents, a care circle. It validates the shape of the opportunity, and
it is built around the family and the elder. CareConnect inverts that: the **paid attendant
is the primary data-entry user**, the product is anchored on a **bounded episode with a
trigger**, and it has accountability semantics — shifts, "could not do it and here is why",
unresolved alerts, and a handover artefact — that a general tracker does not.

**Position:** the only player that owns the care record while owning no supply. Incumbents
are structurally conflicted — an agency shipping a tool that shows when its own attendant
missed a dose is arming the customer against itself.

## 6 · Problem prioritisation

I scored three segments across nine criteria (full table in `docs/07`):

| | A · Away adult child | B · Post-hospitalisation | C · Elder self-serving |
| --- | --- | --- | --- |
| **Total /45** | 35 | **39** | 21 |

The scoring produced a better answer than "B wins": **A and B are the same person in
different moments.** The away daughter *becomes* the post-discharge family for thirty days.

- A alone: crowded field, diffuse trigger — "I worry about my parents" is not a moment.
- B alone: sharp trigger, but the episode ends and so does the reason to pay.
- **The intersection:** an unmissable acquisition trigger plus a persistent relationship.

Segment C was rejected outright — 18.7% of elderly Indians have no income (S1), and app
adoption among Hindi-first seniors is the market's proven weak point (S18).

I then tested the five starting hypotheses:

| | Verdict |
| --- | --- |
| H1 · Finding caregivers is a major problem | **REJECTED** — supply is abundant and fast |
| H2 · Trust and verification beat discovery | **ACCEPTED, reframed** — from *identity* verification (table stakes) to **delivery** verification |
| H3 · Continuity and replacement are major | **ACCEPTED** — and it is the differentiator |
| H4 · Away families need visibility | **ACCEPTED, conditionally** — only if exception-driven, not a dashboard |
| H5 · Families will pay for trust | **UNPROVEN — the weakest link in the plan** |

Five opportunity spaces were ranked (docs/07). The winner was the accountability layer.
A verified marketplace scored second and was deferred precisely because it needs O1's data
and would require owning supply — the thing that has killed everyone.

## 7 · Product strategy

> **CareConnect is the care record that stays with the patient, not the agency.**

**Target user:** the adult child, in another city, arranging and paying for the first 30
days of home care after a parent's discharge.

**Value proposition:** a verified daily record of your parent's recovery, kept by whoever is
in the room — so you know what happened today, hear about problems the same hour, and never
start over when the attendant changes.

**Principles**

1. The record belongs to the patient, not to whoever is currently paid.
2. Five minutes a shift, or there is no product.
3. "Could not do it" is a first-class answer.
4. Escalate to a human; never interpret.
5. Be honest about what is not there.

**Non-goals, stated up front:** no caregiver sourcing or booking; no payments; no clinical
judgement; no emergency response; no patient-facing app; no support for the unpaid family
caregiver; no agency workforce tooling.

## 8 · MVP

Every candidate feature faced one question: **remove it — does the core value proposition
fail?**

**Kept (P0):** discharge-type care plan · attendant invite by code, no app install · the
shift model · logging with a mandatory reason for anything not done · deterministic alerts ·
acknowledge-then-close-with-a-note · the family's daily record · the handover pack ·
bilingual attendant interface · roles and per-plan access.

**Cut, and why the cuts are the interesting part:**

| Cut | Reason |
| --- | --- |
| Photo evidence | Feels essential; is not. Heavy on poor data, much heavier privacy obligation, and the wound photo already goes to the doctor on WhatsApp → P1 |
| Multiple family members | Improves the experience, does not test the hypothesis → P1 |
| Medicine stock tracking | Real (the demo's own missed dose is a finished strip) but it is a second job bolted on → P1 |
| Attendant ratings | Not credible on one episode, and turns a trust product into a surveillance product → P2 |
| **In-app chat** | **Never.** WhatsApp already owns that conversation; fighting for it is a fight we lose, and losing it takes the product down |

## 9 · UX

Two users, opposite conditions, one product.

**The emotional constraint that ruled out the obvious design:** this is somebody's parent. A
dashboard aesthetic — dense KPI tiles, chart grids, cool greys — would be efficient and
completely wrong. So: deep green on warm sand, terracotta only for things that need a
decision, and status never carried by colour alone.

**The family's screen** answers, in order: is someone with my parent right now → is anything
wrong → did today go well → is the week trending well. There is deliberately **no vitals
chart on the home screen**, because a trend line invites clinical interpretation the product
must not encourage.

**The attendant's screen is the entire app.** One screen, no navigation. Emergency call at
the top; the previous handover note before starting; then medicines, tasks, readings, report
a problem; a sticky bar counting what is still unrecorded.

Three decisions carry it:

- **Both languages, always** — *Given · दे दी* — because the phone is shared and a toggle
  assumes one reader and demands a setup step from the person least invested in setup.
- **"Could not do · नहीं हुआ" is an equal-weight button** with a required one-line reason.
- **The bar to clear was WhatsApp**, not a competitor's app. Anything that needed explaining
  got cut.

## 10 · Key product decisions

| # | Decision | Trade-off accepted |
| --- | --- | --- |
| D-01 ↺ | Reject the marketplace brief | Gave up the larger, more obvious business and the take rate |
| D-02 | Own no supply, ever | Cannot promise a replacement; looks less complete beside incumbents |
| D-03 | Beachhead = A ∩ B | A smaller starting market than either segment alone |
| D-04 | Beat WhatsApp on day one or don't ship | Several genuinely good features cut |
| D-05 | The attendant is the primary writing user | The data source has no financial stake — the biggest risk in the plan |
| D-06 ↺ | Both languages at once, replacing a toggle | A busier small screen |
| D-07 | "Could not do it" with a mandatory reason | Slower to record a bad day |
| D-08 | Deterministic thresholds, no model | Less impressive; will miss what a model might catch |
| D-09 ↺ | Photos cut from P0 | Loses the most viscerally convincing evidence |
| D-10 ↺ | Notification delivery stubbed **and shown in the product** | The core promise is not actually delivered yet |
| D-11 | Alerts close with a mandatory note | Friction on every alert |
| D-16 | Stop building; go interview | The product stays visibly incomplete |

Full reasoning, alternatives and evidence for all sixteen: `docs/15-decision-log.md`.

## 11 · Build

React 19 + Vite + TypeScript + Tailwind on the front; Express 5 + TypeScript + SQLite
behind; one process in production. Chosen so a reviewer can run it in two commands, not
because it is what a scaled version would use.

What is real: cookie-based auth with bcrypt and role-scoped authorisation on every route;
16 tables where nothing is ever deleted; a deterministic alert engine; a handover snapshot
written on every attendant change; first-party analytics that never touch free text.

What is stubbed, and labelled in the product: **WhatsApp/SMS delivery.** Every alert writes
the message a live deployment would send into an outbox the family can see, under a heading
that says it is not connected. Time-based alert checks run lazily on page load rather than
on a scheduler — also documented.

## 12 · Testing

**60 unit and integration tests + 24 end-to-end journeys** across mobile and desktop
viewports, all passing, with zero console errors on ten captured screens.

The end-to-end suite walks the whole thing: register → build a plan from a discharge summary
→ invite an attendant → attendant joins by code → starts a shift → records a dose → is
blocked from recording a miss without a reason → reports a warning sign → family sees the
alert → is blocked from closing it without a note → closes it → **the decision appears in
the handover pack.**

## 13 · Iterations

QA changed the product three times, and the first two were not cosmetic.

**① The handover pack lost the decisions.** The end-to-end test resolved a red-flag alert
and then opened the pack. The decision was not there — resolving an alert removed it from
the exact artefact that exists to carry decisions forward. The differentiator, silently
broken, caught by walking the journey rather than by testing the endpoint. The pack now
carries resolved alerts with their notes.

**② Dates were a day early outside IST.** A 24 August discharge displayed as "Sun, 23 Aug"
because the formatter used the runtime's timezone. In a product whose only asset is a
trustworthy record, a wrong date poisons everything else on the screen.

**③ The security control created the worse risk.** Rate limiting counted *every* sign-in, so
a family and their attendant on one home connection could lock themselves out of a health
record during a crisis. Now only failures count, and a success clears the counter.

Then a self-critique pass added what an honest health product needs: a standing "this is not
medical advice and not an emergency service" statement in both languages; access to the full
care plan from the attendant's phone; a plain-language privacy note at sign-up; and the
corrected copy that had promised delivery which does not happen.

## 14 · Metrics framework

**North Star: verified care days per active patient per week** — a day where every
must-not-miss item was recorded, at least 80% of the day was recorded, and no urgent alert
was left open.

It measures delivered value rather than usage, cannot be moved by one party alone, and
survives the attendant changing. The 80% floor is deliberate: demanding 100% would punish
honest recording and push attendants to tick everything.

**Activation:** the family sees a complete daily record within 48 hours — which requires the
whole chain, including the step most likely to break (the attendant redeeming the code).

**The guardrails are the part I would defend hardest**, because the real risk is not that
people ignore the product — it is that they use it dishonestly:

- attendant time per shift > 5 minutes → we are taxing an unpaid data source;
- burst logging (everything entered in the five minutes before close) > 30% → the record is
  memory, not observation;
- false-alert rate > 20% → alert fatigue, and families stop reading.

Every number in `docs/13` is a definition and a target. **None is a result.**

## 15 · What I would do next

**Stop building. Start interviewing.** Two existential assumptions are unvalidated and
neither is answered by more code:

1. **E2 — will attendants log without supervision?** 5 attendants, 3 families, 14 days on
   the built MVP. If close rate is under 50% or burst logging over 50%, the product is built
   on sand.
2. **E3 — will families pay unbundled?** An honest fake-door at ₹399/month and ₹999 per
   episode against a free control. This tests H5, the weakest link, against a market where
   the nearest product is free.
3. **E5 — does the handover pack actually protect continuity?** Randomise at attendant
   changes; measure verified-day recovery in the first 72 hours. This validates or destroys
   the positioning.

Also E1 (10 discharge interviews, to check the reframing survives contact with reality) and
E4 (5 agency conversations, to learn whether distribution runs through them or around them).

**Six weeks, no new engineering.** That is the argument for stopping where this MVP stops.

If the tests pass: WhatsApp delivery, offline logging, a second family member, then the
agency channel and eventually the verified marketplace — built on data that only exists
because the accountability layer ran first.

## 16 · What I learned

**A brief is a hypothesis wearing a requirements document's clothes.** The most valuable
output of the research phase was earning the right to reject the premise with evidence.

**The unpaid user decides whether the product exists.** The family pays; the attendant
supplies every byte of value. That inversion produced almost every interface decision, and
"five minutes a shift" ended up as a guardrail metric that can stop the roadmap.

**A record of only successes is worse than no record.** The reasons are the product.
"Strip finished, chemist was shut" is a problem a family can fix in ten minutes from another
city; a blank tells them nothing, and a forced tick teaches people to lie.

**QA found the strategic bug.** Not a rendering glitch — the differentiator, silently broken.
Planning did not catch it; walking the whole journey in a browser did.

**Showing the gap beat hiding it.** The visible notification outbox is more honest *and*
better product thinking than a stub nobody can see.

**What I would do differently:** talk to five families before writing any code; design the
attendant screen first rather than the exciting one; write the metric definitions before the
feature list; and test the artefact a human receives, not the endpoint that produces it.

---

*Sources are graded and indexed in `docs/00-evidence-index.md`. No user interviews were
conducted; no traction, revenue or retention figures exist. Everything unvalidated is
labelled as such — including the two assumptions the whole product rests on.*
