# 18 · Learnings

## 1. The brief was the first thing to test

The project began with a concept — a caregiver discovery and booking platform — and the
strongest thing research did was kill it. Care24 advertises 2,000+ caregivers and a
three-hour allocation promise (S14). Every family in every source found someone. Not one
described being unable to.

The lesson is uncomfortable and generalisable: **a brief is a hypothesis wearing a
requirements document's clothes.** The temptation is to accept the framing and compete on
execution, because that is the fastest route to visible progress. The whole value of the
research phase was earning the right to say "the premise is wrong" with evidence rather
than opinion.

## 2. Every failure in this market was operational, not demand-side

Portea reportedly burned ~USD 93m; Papa raised USD 242m and shut down; Elcare closed in
2024 while growing (C-grade sources: S11, S12). Demand was never the problem. **Owning the
supply of human labour was.**

That single pattern determined the strategy more than any user insight: build the layer
that has no caregivers on the balance sheet. It also produced the sharpest strategic
question in the project — *if the money has been made and lost on supply, what is the
asset that is not supply?* The answer, the record, is the whole product.

## 3. The unpaid user determines whether the product exists

The family pays. The attendant supplies every byte of value. Design for the payer and you
get a beautiful dashboard with no data in it.

Almost every interface decision — one screen, both languages always, 56 px buttons, "could
not do it" as a first-class answer, five minutes a shift as a **guardrail metric that stops
the roadmap** — follows from taking that seriously. And the biggest open risk (H6, E2) is
about them, not about the customer.

## 4. A record of only successes is worse than no record

The instinct is a checklist: tick what was done. The insight is that **the reasons are the
product**. "Strip finished, chemist was shut" is a problem a family can solve in ten
minutes from another city. A blank tells them nothing, and a forced tick teaches the
attendant to lie.

This is the decision I would defend hardest in an interview, because it looks like a small
interaction choice and is actually the difference between a compliance tool and an early
warning system.

## 5. QA found the strategic bug, not a cosmetic one

An end-to-end test walked a red flag from report to resolution and then opened the handover
pack. The decision was not there. Resolving an alert made it disappear from the exact
artefact whose purpose is carrying decisions forward — the differentiator, silently broken.

Planning did not catch it. Design review did not catch it. **Walking the whole journey in a
browser did.** Two other real defects came from the same pass: dates rendering a day early
outside IST, and a security control that would have locked a family out of a health record
during a crisis.

## 6. Showing the gap beat hiding it

WhatsApp delivery could not be built — it needs a business account and template approval.
Three options existed: claim it works, hide it, or show it. The product now writes every
message it *would* send into a visible outbox, under a heading that says it is not
connected.

That turned out to be better product thinking, not just honesty: the outbox makes the value
of the integration concrete, and it is the single most persuasive artefact for anyone
deciding what to build next.

## 7. Sizing a wedge honestly makes it smaller and more useful

The India home healthcare market is USD 6.4bn (S4). That number is true and useless — 84%
of it is labour and equipment this product does not sell.

Working the funnel down to episodes-with-an-away-payer produced ~₹70 crore at full
penetration and ~₹2 crore at a realistic share, off a chain of explicitly labelled
assumptions. That is a modest number, and writing it down honestly is what makes the
sequencing argument (wedge now, marketplace later) credible instead of hand-waved.

## What I would do differently

- **Talk to five families before writing any code.** Every hypothesis in doc 07 could have
  been sharpened in a week of conversations. The build is defensible as an instrument for
  experiments E2 and E5 — but only because it stopped early.
- **Design the attendant screen first.** I designed the family dashboard first because it
  is the exciting one, then had to fight my own layout assumptions to get to a
  one-screen attendant flow. The constrained user should have set the constraints.
- **Write the metric definitions before the features.** The verified-care-day definition
  clarified the P0 list retroactively. Written first, it would have saved a pass.
- **Test the artefact, not the endpoint.** The handover bug existed because I tested that
  the API returned a pack, not that the pack contained what a human needed.

## What I got right

- Rejecting the brief with evidence rather than instinct, and writing the rejection down as
  a decision (D-01) rather than quietly changing course.
- Choosing the intersection of two segments rather than picking one, once the scoring
  showed A and B were the same person in different moments.
- Applying the removal test ruthlessly to P0 and recording what was cut and why — the cuts
  are more informative than the keeps.
- Refusing to fabricate results. Every number in this repository is either sourced,
  computed from seeded data and labelled as such, or marked **Not yet validated**.

## Open questions I cannot answer by building

1. **Will attendants log without supervision?** (E2) If not, nothing else matters.
2. **Will families pay for reassurance unbundled from service?** (E3) The weakest link, and
   a free adjacent product already exists (S17).
3. **Does the handover pack actually protect continuity, or does it just look like it
   should?** (E5) This is the positioning, mechanically tested.
4. **Do agencies block this or sell it?** (E4) Decides whether distribution is direct or
   channel.
5. **How does the patient consent to being recorded?** Unresolved, and the honest answer is
   that the MVP has no answer.

---

# The skeptical interviewer

Fifteen questions a good PM interviewer would ask, answered as honestly as the evidence
allows. Where the honest answer is weak, it is marked **UNVALIDATED** rather than dressed
up.

**1. Why this problem?**
Because the evidence contradicted the brief. Supply is abundant — one provider advertises
2,000+ caregivers and three-hour allocation (C-grade, their own marketing); every source
describing family pain describes what happened *after* the attendant arrived. The gap is
between placing a person and knowing what that person did.

**2. Why this user?**
The adult child living elsewhere is the only actor who is simultaneously anxious, paying,
and digitally capable. The elder scores 1 on both willingness to pay and digital access;
the local sibling has line of sight and needs less; the agency is conflicted. Segment
scoring is in doc 07.

**3. Why now?**
Three things converge: migration has separated payer from patient at scale; hospital-at-home
is pushing discharges earlier, so the first 30 days at home are more clinically loaded; and
70% of elders depend on family while 78% have no pension, so the adult child is the
purchaser by default. None of this is new *this quarter* — the honest version is that the
conditions have been building for a decade and there is no sharp "now".

**4. Why not caregiver discovery?**
It is served — by agencies, hospital desks, national providers and WhatsApp networks — and
serving it better means owning supply, which is where the visible capital in this market has
gone (INFERENCE from four unverified cases; doc 00, C8). **Caveat:** discovery may genuinely
be unsolved in tier-3 and rural India, where willingness to pay and digital access are also
lowest. This product does not claim to have answered that.

**5. Why wouldn't Portea build this?**
They could, in a quarter. They won't build it *well*, because a supplier's record of its own
performance is the one document a worried family has least reason to believe — and because
their commercial incentive is utilisation, which means rotating staff, which is what breaks
continuity. HCAH's own answer to churn is a 24-hour replacement promise: fix the vacancy,
not the knowledge. **This is a positioning bet, not a moat.**

**6. Why wouldn't hospitals build this?**
Some will try. They own the trigger and carry readmission risk. But a hospital's tool stops
at its own patients and its own liability posture, and there is no payment reform in India
making home-recovery documentation a P&L line for them yet. The realistic outcome is that a
hospital becomes a *distribution channel*, not a competitor.

**7. Why wouldn't WhatsApp solve this?**
For coordination it already does, and the product deliberately does not fight it (D-04,
D-09: in-app chat is a permanent non-goal). What WhatsApp cannot do is produce a structured
record: no expectation to measure against, no shift boundary, no attribution, no
"unresolved" state, and nothing that survives the attendant leaving. A photo of a BP monitor
in a group chat is not a record.

**8. Who pays?**
The family, in the current design — and that is the weakest link (H5, **UNVALIDATED**).
Doc 08 now scores five payers. The fallback if families won't pay unbundled is the employer
elder-care benefit, not the agency, because the agency route trades away the product's only
defensible asset.

**9. Why would attendants cooperate?**
Three arguments, none tested: daily reporting is already part of a good attendant's job and
is currently done verbally from memory; "could not do it" gives them a legitimate way to say
something was impossible, which today is their word against the family's; and the record is
evidence of work done, which nothing in this market currently gives them. **UNVALIDATED —
this is experiment E1, the highest-risk test in the plan.** If it fails, the product needs a
different data source, which is a different product.

**10. What prevents fake logging?**
Partly nothing, and the product says so. What exists: shift boundaries, per-entry
timestamps, attribution to a named person, and an append-only revision trail so an entry
cannot be quietly rewritten. What is measured: burst logging (everything entered in the five
minutes before close) and late-entry clustering, both as guardrails that can stop the
roadmap. What is *not* claimed: verification — which is exactly why the north-star metric
was renamed from "verified" to "documented" (D-18). Stronger proof mechanisms — photos,
geofencing — mostly convert the product into surveillance and would break the data source.

**11. What happens when a caregiver doesn't show?**
A watch alert fires when no shift has started by 08:00 or 20:00 IST, and the family sees
"nobody has started the day shift" on their home screen. **The honest limitation:** that
check runs when a family member opens the app, not on a scheduler, and the WhatsApp delivery
that would push it is stubbed. So today the product tells a family who looks. That is a real
hole in the core promise, it is documented in the product itself, and it is the first thing
to build after validation.

**12. What is actually verified?**
Nothing. That is the point of D-18. What is *documented* is: who was on duty, when they
started and closed, what they recorded against a plan the family wrote, what they said when
something could not be done, and every correction they made. Attribution and an audit trail,
not verification.

**13. What's the moat?**
At this stage: none worth the word. What exists is a compounding asset (the record's value
grows with every day logged and every attendant change survived, and switching means
retyping the discharge sheet), a structural conflict that makes incumbents bad at this, and
an operating model that does not require capital they have already proven willing to burn.
Anyone claiming a moat on an unlaunched product with no users is selling something.

**14. What would kill the product?**
In order: attendants not logging (E1); families not paying unbundled while a free
alternative exists (E2); an incumbent bundling a good-enough version into an existing
relationship — Antara already sells to exactly this beachhead with a hospital brand behind
it; and a safety incident where a family relied on an alert that never arrived because
delivery is stubbed. The last is the reason the stub is displayed in the product rather
than hidden.

**15. What evidence is missing?**
All of the primary evidence. No interviews, no pilot, no usage, no willingness-to-pay
signal, no test of whether the handover pack changes anything. Thirteen load-bearing claims
are graded in doc 00; three are hypotheses the product rests on and one is an assumption
about attendants that could invalidate the data source. The interview guides are written
(doc 19) and unused. **Six weeks of conversations would be worth more than six weeks of
features, which is why the build stopped.**

---

## The one-line version

> The research said the problem was not finding a caregiver — it was knowing what the
> caregiver did, and keeping that knowledge when they leave. So the product stopped being a
> marketplace and became a record that outlives whoever is currently in the room.
