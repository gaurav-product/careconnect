# CareConnect — a product case study

**The brief:** build a platform that helps Indian families discover, evaluate, book and
manage home caregivers.
**What I shipped:** a post-discharge care accountability layer that supplies no caregivers
at all.
**Why:** the research said discovery was not the problem.

*Solo project — research, strategy, design, build, QA. Two iterations. No real users yet;
every unvalidated claim in this document is labelled.*

---

## 1 · The original brief

> Help Indian families **discover, evaluate, book and manage** home caregivers.

That is a marketplace. Marketplaces exist where matching is hard: where supply is scattered,
quality is unknowable, and the transaction is the bottleneck. The brief assumed all three.

## 2 · The assumption underneath it

**Finding a caregiver is the hard part.**

It is a reasonable assumption. India is ageing fast — the 60+ population is heading for
~230 million by 2036 and the 80+ group grows 279% between 2022 and 2050 <sup>A</sup>. Home
healthcare is a USD 6.4bn market growing at 12.9%, described by its own analysts as *"highly
fragmented"*, largely served by small local agencies and informal caregivers, with **no
dedicated national regulatory framework** <sup>B</sup>. Fragmented supply plus no standards
sounds exactly like a matching problem.

So I went looking for families who could not find a caregiver.

## 3 · The research

**Method, stated first because it is the biggest limitation:** secondary research only —
government releases, peer-reviewed studies, market research, provider documentation,
complaint boards. **No interviews.** Every source is graded A–D in
`docs/00-evidence-index.md`, and provider marketing is never quoted as a statistic. Where a
real product would have primary data, this project says **NOT YET VALIDATED**.

**What supply actually looks like.** One provider advertises 2,000+ caregivers across ten
cities with a three-hour allocation promise <sup>C</sup>. Another publishes an entry price
(*from ₹1,000/day*), 12-hour and 24-hour shift structures, police and Aadhaar verification,
and a **24-hour replacement turnaround** if the family is unhappy <sup>C</sup>. Add hospital
discharge desks, thousands of local agencies, and domestic-worker WhatsApp networks.

**What families describe instead.** Untrained and unprofessional staff; *"no experienced
staff available"* on the agreed date <sup>D</sup>. Helpers who *"disappear without notice"*,
triggering *"a scramble of phone calls to relatives, neighbours, and WhatsApp groups"*
<sup>C</sup>. Rotation with no handover, and switching agency meaning care *"effectively
resets to Day 1"* <sup>C</sup>. And underneath it: *"no contracts, background checks, or
formal oversight exist in many arrangements"*, so problems go unnoticed *"for months"*
<sup>C</sup>.

**And the supply side, which most people skip.** The attendant sits between a domestic
helper and a nurse — *"not clinical, but … trained"*. Crucially, **daily reporting is
already part of a good attendant's job** — a written medication list, a daily summary, a
named escalation contact <sup>C</sup>. Today it is done verbally, from memory, at the end of
a twelve-hour shift.

## 4 · The pivot

**INFERENCE:** for the metro, paying, smartphone-capable family this product targets,
discovery is not the binding constraint.

I want to be precise about the strength of that, because it is the load-bearing claim.
No source described a family unable to find an attendant — but that is **absence of
evidence, not evidence of absence**. Complaint boards collect people who got a bad service,
not people who got none, and English-language desk research skews metro. A family in a
tier-3 town who found nobody would be invisible to every source I read.

So I wrote the falsifier into the doc: *if ten discharge interviews find that four families
name finding an attendant as their hardest problem, this reframing is wrong and the
marketplace deserves reconsideration.*

The second input was strategic. Portea reportedly burned ~USD 93m; Papa raised USD 242m and
shut down over care quality; Elcare closed in 2024 while growing <sup>C</sup>. Four
unverified cases is not a base rate — but it is enough of a prior that **a one-person
project should not start by owning human supply.**

> **The brief was rejected.** Not because a marketplace is a bad business, but because it
> solves a problem the market has already solved, by taking on the cost structure that has
> repeatedly consumed capital here.

## 5 · The new problem

> A family can hire a home attendant within a day, but has no way to verify that the day's
> care actually happened, no early warning when it did not, and nothing that survives the
> attendant being replaced — which, in a workforce that rotates by design, is the normal
> case rather than the exception.

Two structural facts keep it that way. **The workforce churns by design** — agencies rotate
staff, attendants take leave, live-in work is hard; one provider's answer to churn is a
24-hour replacement promise, which fixes the vacancy and not the knowledge. And **the
knowledge lives in the attendant's head**; when they go, the routine, the quirks and the
doctor's last instruction go with them.

## 6 · Target user

I scored three segments across nine criteria (`docs/07`):

| | A · Away adult child | B · Post-hospitalisation | C · Elder self-serving |
| --- | --- | --- | --- |
| **Total /45** | 35 | **39** | 21 |

The useful finding was not "B wins". It was that **A and B are the same person in different
moments** — the away daughter *becomes* the post-discharge family for thirty days.

- A alone: a crowded field with a diffuse trigger. "I worry about my parents" is not a
  moment that makes anyone sign up on a Tuesday.
- B alone: a sharp trigger that ends.
- **The intersection:** an unmissable acquisition trigger *and* a persistent relationship.

Segment C was rejected outright — 18.7% of elderly Indians have no income <sup>A</sup>, and
app adoption among Hindi-first seniors is the market's proven weak point <sup>C</sup>.

**Beachhead: the adult child, in another city, arranging and paying for the first 30 days of
home care after a parent's discharge.**

## 7 · Competitive landscape

Families do not compare products; they compare coping strategies.

| Layer | Who | What they sell | The gap |
| --- | --- | --- | --- |
| Full-stack home healthcare | Portea, Care24, HCAH, Apollo, Antara | A trained-enough person, today | The unit is a *placement*, not an outcome |
| Subscription elder care | Samarth, Emoha, Anvayaa (₹3–25k/mo) | Reassurance via a care manager | The reassurance is a phone call, not a record |
| The offline default | WhatsApp, the neighbour, the discharge desk | Free, instant, socially normal | Nothing structured, nothing that survives the attendant leaving |

**Why they win** — read from their own pages rather than from a feature grid. They remove a
decision at the worst possible moment; they sell absolution rather than information (a named
Clinical Manager who calls, visits, and takes the problem away, reachable on WhatsApp); they
make churn *feel* solved with a 24-hour replacement; and hospital brands convert existing
trust for free.

**Their structural weakness is the flip side of that.** Quality is asserted at hiring and
then invisible; the family's only instrument is a phone call to someone who will ask someone
else. And their incentive is utilisation, which means rotating people — the very thing that
breaks continuity.

**The nearest adjacent product** is a *free* family care-coordination app <sup>C</sup>. It
validates the shape of the opportunity. It is built around the family and the elder;
CareConnect inverts that — the **paid attendant is the primary data-entry user** — and adds
accountability semantics a general tracker does not have: shifts, "could not do it and here
is why", unresolved alerts, and a handover artefact.

**Honest scoping:** two companies named in the brief (CareStride, Health24) did not surface
in desk research at all. I have recorded that they were looked for and not found rather than
padding the analysis. And "of the products I could find" is not a market census — in a
market this fragmented, a regional or agency-internal tool would not have appeared.

## 8 · Product strategy

> **CareConnect is the care record that stays with the patient, not the agency.**

**Value proposition:** a documented daily record of your parent's recovery, kept by whoever
is in the room — so you know what happened today, hear about problems the same hour, and
never start over when the attendant changes.

**Principles:** the record belongs to the patient, not to whoever is currently paid · five
minutes a shift or there is no product · "could not do it" is a first-class answer ·
escalate to a human, never interpret · be honest about what is not there.

**Who pays?** Five candidates were scored (`docs/08`). The family is assumed and is the
weakest evidence in the plan. The agency is *rejected* as first payer — it makes the record
belong to the party it might indict. The employer elder-care benefit is the most
under-explored option and the designated fallback. Insurers are not a payer today: Indian
health cover *"mostly cover[s] inpatient expenditure"* <sup>B</sup>, so nobody is paid to
prevent a readmission.

## 9 · The MVP

Every candidate faced one question: **remove it — does the core hypothesis become impossible
to test?**

**Kept (P0):** discharge-type care plan · attendant invite by 6-character code, no app
install · the shift model · logging with a mandatory reason for anything not done ·
deterministic alerts · acknowledge-then-close-with-a-note · the family's daily record · the
handover pack · bilingual attendant interface · roles and per-plan access · **append-only
corrections** (added in iteration 2).

**Cut, and the cuts are the interesting part:**

| Cut | Reason |
| --- | --- |
| Photo evidence | Feels essential; is not. Heavy on poor data, much heavier privacy obligation, and the wound photo already goes to the doctor on WhatsApp |
| Multiple family members | Improves the experience, does not test the hypothesis |
| Medicine stock | Real — the demo's own missed dose is a finished strip — but it is a second job bolted onto the first |
| Caregiver ratings | Not credible on one episode, and turns a trust product into a surveillance product |
| **In-app chat — permanently** | WhatsApp owns that conversation. Fighting for it is a fight we lose, and losing it takes the product down |
| **Caregiver booking** | The thing I was originally asked to build |

## 10 · UX

Two users, opposite conditions, one product. And one emotional constraint that ruled out the
obvious design: **this is somebody's parent** — a KPI dashboard would be efficient and
completely wrong.

**The family's screen** answers four questions in order: is someone with my parent right now
· is anything wrong · did today go well · is the week trending well. There is deliberately
**no vitals chart on the home screen**, because a trend line invites clinical interpretation
the product must not encourage.

**The attendant's screen is the entire app.** One screen, no navigation. Emergency call at
the top; the previous handover note before starting; medicines, tasks, readings, report a
problem; a sticky bar counting what is still unrecorded. Three decisions carry it:

- **Both languages, always** — *Given · दे दी* — because the phone is shared and a toggle
  demands a setup step from the person least invested in setup.
- **"Could not do · नहीं हुआ" is an equal-weight button** with a required one-line reason.
- **The bar to clear was WhatsApp**, not a competitor's app. Anything needing explanation
  was cut.

**Accessibility is measured, not asserted.** `npm run audit:a11y` drives seven signed-in
pages and checks contrast against the background actually painted behind each text node,
plus touch targets, labels, headings and landmarks. First run: **145 issues.** After fixes:
**0.** The largest cluster was secondary text at 4.40:1 — which carried every Hindi
sub-label on the attendant screen, the users least able to absorb low contrast.

## 11 · Key product decisions

| # | Decision | Trade-off accepted |
| --- | --- | --- |
| D-01 ↺ | **Reject the marketplace brief** | Gave up the larger, more obvious business |
| D-02 | Own no supply, ever | Cannot promise a replacement; looks less complete beside incumbents |
| D-04 | Beat WhatsApp on day one or don't ship | Several genuinely good features cut |
| D-05 | The attendant is the primary writing user | The data source has no financial stake — the biggest risk in the plan |
| D-07 | "Could not do it" with a mandatory reason | Slower to record a bad day |
| D-10 ↺ | Delivery stubbed **and shown inside the product** | The core promise is not fully delivered yet |
| D-17 ↺ | **Care entries append-only; corrections shown** | One more table, one more section on the family's screen |
| D-18 ↺ | **"Verified" renamed to "documented"** | A weaker-sounding metric, and a truer one |
| D-19 | Tell the attendant exactly what the family can see | More text on a small screen |
| D-22 ↺ | Downgraded three of my own conclusions | The story reads less punchy |

Twenty-two decisions with alternatives and evidence: `docs/15-decision-log.md`.

**The one I would defend hardest — D-07.** A checklist that only records success produces a
perfect record and a useless one. *"Strip finished, chemist was shut"* is a supply problem a
daughter in Bengaluru can fix in ten minutes. A blank tells her nothing, and a forced tick
teaches the attendant to lie. The reason field is where the early warning actually lives.

## 12 · Build

React 19 + Vite + TypeScript + Tailwind on the front; Express 5 + TypeScript + SQLite
behind; one process in production. Chosen so a reviewer can run it in two commands, not
because it is what a scaled version would use.

Real: cookie auth with bcrypt and role-scoped authorisation on every plan route; 17 tables
where nothing is deleted and nothing is silently rewritten; a deterministic alert engine (a
readable table of thresholds, no model); a handover snapshot on every attendant change;
first-party analytics that never touch free text.

Stubbed, and labelled inside the product: **WhatsApp/SMS delivery.** Every alert writes the
message a live deployment would send into an outbox the family can see, under a heading that
says it is not connected. Time-based checks run when someone opens the app rather than on a
scheduler — also disclosed.

## 13 · QA

**95 automated checks** — 65 unit and integration tests, 30 end-to-end journeys across
mobile and desktop, plus the accessibility sweep. Zero console errors on eleven captured
screens.

Across two iterations, QA changed the product five times. The three that mattered:

**① The handover pack lost the decisions.** (Iteration 1.) An E2E test walked a red flag from
report to resolution, then opened the pack — the decision was not there. The differentiator,
silently broken. Planning did not catch it; walking the journey did.

**② Care entries could be silently rewritten.** (Iteration 2, the technical audit.) Task and
dose logs were an upsert with no history. An attendant could record *"missed — strip
finished"* and change it to *"given"* before closing the shift, and the family would see only
the final value. **In a product whose only asset is the record, that made the record
unfalsifiable.** Entries are now append-only; the family's day record shows *previous → new*
with the time and the author. Five tests cover it.

**③ The security control created the worse risk.** (Iteration 1.) Rate limiting counted
*every* sign-in, so a family and their attendant on one home connection could lock themselves
out of a health record mid-crisis. Now only failures count.

Also fixed: dates rendering a day early outside IST; a failed save showing a 4.5-second toast
on a patchy connection (now a persistent bilingual banner); no `<h1>` on the attendant
screen; and nothing on screen telling the attendant what the family can see about them.

## 14 · Validation

The section a hiring manager should read first.

### Validated

| Claim | Evidence |
| --- | --- |
| The core flows work end to end on mobile and desktop | 95 automated checks, `docs/17` |
| A care entry cannot be silently rewritten | Append-only revision trail with tests |
| The interface clears mechanical accessibility checks | `npm run audit:a11y`, 0 issues |

**All three are engineering facts. None is product validation.**

### NOT YET VALIDATED

| Claim | Why it matters |
| --- | --- |
| Attendants will log a full shift unsupervised in under 5 minutes | If false, the product has no data and nothing else matters |
| Families will pay for a record unbundled from the caregiving | The weakest link — and the nearest adjacent product is free |
| The handover pack actually improves continuity | This is the positioning. Mechanism built, effect untested |
| Families prefer this to a WhatsApp group | The real incumbent |
| Discovery is not the binding constraint | INFERENCE from absence of evidence, with a written falsifier |

### Next experiments

Guides, protocols, consent language and pre-registered thresholds are written and unused in
`docs/19-validation-plan.md`:

- **E0 — ten discharge interviews.** Fail condition: 4 of 10 name *finding* an attendant as
  their hardest problem.
- **E1 — five attendants, three families, 14 days on the built MVP.** Fail condition: under
  50% shift close rate, or over 50% burst logging.
- **E2 — willingness to pay.** ₹399/month vs ₹999/episode vs free, as an honest commitment
  test that takes no money. A click is not revenue and the analysis says so.
- **E3 — handover value.** Randomised at attendant changes. 20 changes cannot produce
  significance; it is a directional test and is reported as one.

## 15 · Metrics

**North star: documented care days per active patient per week** — every must-not-miss item
recorded, ≥80% of the day recorded, no urgent alert left open.

**It used to be called "verified care days", and I changed it.** CareConnect cannot confirm
that a tablet was swallowed. It records what one person entered, at a time, under their name,
on a shift they had to start, with corrections kept. That is documentation with attribution.
Calling it verification would claim more than the product can do — and it would launder the
actual failure mode, which is plausible-but-false data rather than missing data.

The 80% floor is deliberate: real care is not complete, and demanding 100% would punish
honest recording.

**The guardrails matter more than the growth metrics**, because the real risk is not that
people ignore this product — it is that they use it dishonestly:

- attendant time per shift > 5 minutes → we are taxing an unpaid data source;
- burst logging > 30% of shifts → the record is memory, not observation;
- false-alert rate > 20% → alert fatigue, and families stop reading;
- privacy incidents > 0 → stops the roadmap.

**No number in this repository is a result.**

## 16 · Limitations

**Product** — no user research at all; two existential hypotheses untested; one family member
per plan; the episode ends at day 30 with no chronic-care mode.

**Technical** — WhatsApp/SMS delivery not connected; time-based alerts run when someone opens
the app, so a 2am alert waits; no offline logging; SQLite single-writer; no password reset,
no OTP login, no CSP header, no encryption at rest, no audit log of who *read* a record.

**Evidence** — market sizing is a chain of assumptions with two unsourced multipliers; three
conclusions were downgraded on re-audit and are labelled INFERENCE or OBSERVATION; two
competitors named in the brief were never found.

**Ethics** — not DPDP-compliant: no versioned consent record, no export or erasure flow, no
retention policy. And **the patient does not consent.** They are the data subject and not a
user. The MVP has no answer to that; it is named as unfinished business rather than solved.

## 17 · What I learned

**A brief is a hypothesis wearing a requirements document's clothes.** The temptation is to
accept the framing and compete on execution, because that is the fastest route to visible
progress. The value of the research phase was earning the right to reject the premise with
evidence rather than opinion.

**The unpaid user decides whether the product exists.** The family pays; the attendant
supplies every byte of value. Design for the payer and you get a beautiful dashboard with
nothing in it. That inversion produced almost every interface decision — and "five minutes a
shift" ended up as a guardrail metric that can stop the roadmap.

**A record of only successes is worse than no record.** The reasons are the product.

**Auditing your own work is a distinct skill from doing it.** The second iteration added no
features. It found that entries could be silently rewritten, that the north-star metric
claimed something the system cannot do, that 135 pieces of text failed contrast — mostly the
Hindi ones — and that three of my own conclusions were stated more strongly than their
evidence. None of that was visible while building. All of it was visible while auditing.

**Naming things honestly changes what you build next.** If the metric had stayed "verified",
the roadmap would have filled with proof mechanisms — photos, geofencing, timestamps the
attendant cannot control — most of which turn the product into surveillance and break the
data source. Renaming it kept that pressure off.

**What I would do differently:** talk to five families before writing any code; design the
attendant screen first rather than the exciting one; write the metric definitions before the
feature list; and audit the data model for integrity before building on top of it.

## 18 · What I would do next

**Stop building. Start interviewing.**

Two assumptions are existential and unvalidated, and neither is answered by more code. Six
weeks — E0, E1, E2, with E4 in parallel — costs no engineering, and the MVP in this
repository is what makes E1 and E3 possible at that price.

If the tests pass, in order: WhatsApp delivery and a scheduler (so the core promise is
actually delivered), offline logging, a second family member, then the agency channel — and
eventually the verified marketplace, built on data that exists only because the
accountability layer ran first. The original brief, earned rather than assumed.

If E1 fails, the product needs a different data source, which is a different product. If E2
fails while the free tier converts, the value is real but not purchasable alone, and the
next move is the employer benefit channel — not the agency, because that route trades away
the one thing that makes the record believable.

---

*Sources are graded A–D and indexed in `docs/00-evidence-index.md`, with a claim register
recording which of my own conclusions were downgraded on re-audit. No user interviews were
conducted; no traction, revenue or retention figures exist. Everything unvalidated is
labelled as such — including the two assumptions the whole product rests on.*
