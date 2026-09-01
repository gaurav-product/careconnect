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

## The one-line version

> The research said the problem was not finding a caregiver — it was knowing what the
> caregiver did, and keeping that knowledge when they leave. So the product stopped being a
> marketplace and became a record that outlives whoever is currently in the room.
