# 04 · Competitive analysis

The point of this document is not a feature grid. It is to answer one question: **is
there a defensible position that is not "supply more caregivers, better"?**

## The three real competitive sets

Families do not compare CareConnect to Portea. They compare it to *how they cope today*.
So the landscape has three layers, and the third is the one that matters most.

1. **Full-stack home healthcare** — Portea, Apollo Homecare, Care24, HCAH
2. **Subscription elder care** — Samarth, Emoha, Anvayaa, and a long tail
3. **The offline default** — WhatsApp, the neighbour, the hospital's referral, a phone
   call to the parent

## Layer 1 — full-stack home healthcare

| | Portea | Care24 | Apollo Homecare | HCAH |
| --- | --- | --- | --- | --- |
| Target customer | Family of a discharged or chronic patient | Same | Apollo's own discharge base | Hospital partners + families |
| Positioning | Broad home healthcare | Attendants and nurses on demand | Hospital brand extended home | "Hospital at home" clinical care |
| Model | Own/contract supply, per-visit and per-month | Same | Same, brand-led | Same, clinically led |
| Supply | Employed and contracted caregivers | 2,000+ caregivers, 10 cities (S14) | Apollo network | Clinical staff |
| Verification | Claimed | *"100% court & criminal verified"*, 70+ hours training (S14) | Brand-implied | Clinical credentialing |
| Booking | Callback → allocation | Callback; **3-hour allocation** claim (S14) | Callback | Referral |
| Post-booking experience | Care manager | Care manager | Care manager | Clinical case manager |
| Family visibility | Phone calls with the care manager | Phone calls with the care manager | Phone calls | Clinical reports |
| Replacement | *"Prompt replacement … in case the need arises"* (S14) | Same | Same | Same |

**Strengths.** They solve the thing a family panics about first: a trained-enough person,
today. Brand and hospital proximity make them the default at the discharge desk.

**Weaknesses, from their own customers.** Grade-D but specific and repeated (S13):
services delivered differently from what was sold; *"no experienced staff available"* on
the agreed date; *"staff is extremely unprofessional"* with inadequate training; refunds
pursued for months.

**The strategic weakness.** Their unit is a **placement**, not an outcome. Quality is
asserted at hiring and then invisible. Their own incentive is to keep utilisation high,
which means rotating people — the very thing that breaks continuity. And the model is
capital-hungry: Portea is reported to have burned ~USD 93m (C, S11).

**Market gap 1: nobody is accountable for what happened on Tuesday.**

## Layer 2 — subscription elder care

| | Samarth | Emoha | Anvayaa |
| --- | --- | --- | --- |
| Price | ~₹5,000–25,000/mo; app tier ₹4–10k (S10, S18) | from ~₹5,000/mo; ₹3–8k (S10, S18) | Custom, **3-month minimum** (S10) |
| Reach | 350+ cities | 200+ cities | 40+ cities, South-skewed |
| Core promise | Care counsellor, geriatric clinic links, emergency support | Emergency response, community programming, hospital tie-ups | 360° care manager: health, banking, legal, property |
| Named weaknesses (S10) | Quality varies by city tier; home care via partners; Android-only app | *"Burning cash"*; franchise model dilutes quality | Small scale; limited cities |

**Strengths.** They understood the real customer — the away adult child — earlier than
anyone else, and they sell reassurance rather than hours.

**Weaknesses.** The promise is human-mediated, so quality tracks how good your assigned
care manager is that month. Pricing is opaque (S10 calls out *"pricing opacity"*). And
the economics look strained: the community claim of Emoha spending ₹1.5 to earn ₹1
(C, S11) is unverified, but it is consistent with a model that pays humans to be
attentive.

**Market gap 2: the reassurance is a phone call, not a record.** If a family asks "was
the antibiotic given at 9pm on the 4th?", the honest answer from every layer-2 provider
is a phone call to someone who will ask someone else.

## The nearest adjacent product

**WiseCare** (C, S17) is the closest thing to CareConnect that exists: a **free** family
care-coordination app for elderly parents in India — medicine tracking with timestamps,
vitals with trends, refill alerts, document storage, an emergency card, and a "care
circle" with permissions. It coordinates *around* existing caregivers rather than
supplying them.

Taking it seriously matters more than dismissing it, so here is the honest read:

- It **validates the shape**: someone else independently concluded that the coordination
  layer, not supply, is the gap, and that it should sit on top of whoever the family
  already has.
- It is **built around the family and the elder**, and treats the paid attendant as one
  more member of a "care circle". CareConnect inverts that: the **paid attendant is the
  primary data-entry user**, and every design decision follows from their phone, their
  language and their five minutes.
- It is **condition-agnostic and open-ended** — a general tracker. CareConnect is anchored
  on a **bounded episode with a trigger** (a discharge), which is what makes setup a
  five-minute job with a real starting plan rather than an empty database.
- It has **no accountability semantics**: no shift, no "could not do it, and here is why",
  no unresolved-alert state, no handover artefact when the attendant changes.
- It is free, which tells you something about willingness to pay that doc 14's experiment
  E3 has to answer honestly.

Other apps in the family (S18) — Medisafe, MyTherapy, Ayu Health, Practo, panic buttons —
are either reminder tools for the elder (with the adoption problem S18 names directly) or
records for the doctor. None of them models "somebody was paid to be in the room".

## Layer 3 — the offline default, which is the real competitor

| Alternative | Why families use it | Why it fails | Grade |
| --- | --- | --- | --- |
| WhatsApp group with the attendant | Zero friction; everyone has it | Nothing is structured; a photo of a BP monitor is not a record; nothing survives the attendant leaving | C (S9) |
| Calling the parent to check | Feels like care, not surveillance | The parent under-reports to avoid worrying the child | OBSERVATION |
| A neighbour or relative looking in | Trusted eyes | Occasional, unstructured, socially expensive to ask repeatedly | C (S9) |
| Hospital referral | Free, immediate, feels endorsed | No vetting beyond the referral; no follow-through | C (S15) |
| Domestic-worker networks | Cheapest, fast | *"No contracts, background checks, or formal oversight"*; *"no accountability structure, no replacement guarantee"* | C (S9, S15) |

**This layer is free, instant and socially normal. Any product here must be better than
a WhatsApp group on day one, for a family in a crisis week.** That single constraint
killed several features that would otherwise have looked good in a PRD (see doc 15,
D-04).

## Where continuity actually breaks

S16 (a provider's blog — grade C, and its percentages are marketing that I do not quote)
usefully names four patterns that match everything else read:

1. **Rotation** — a different attendant every week or two, no written handover.
2. **Provider-hopping** — the family switches agency and care *"effectively resets to Day 1"*.
3. **Patchwork** — a day attendant, a night nurse and the family, none of them
   coordinated.
4. **The gap** — the attendant takes leave and the family manages alone, *"untrained,
   unprepared, and anxious"*.

**Market gap 3: not one player in any layer produces an artefact that survives the
caregiver changing.** The care record is held in the provider's CRM (if at all) and in the
outgoing attendant's memory.

## Positioning

Two axes that matter: **who owns supply** (nobody vs the provider) and **what the family
gets** (a person vs a verifiable record).

```
                    OWNS THE CARE RECORD
                              ▲
                              │
        CareConnect ●         │
     (no supply, owns         │
      the record)             │
                              │         ● HCAH / Apollo
                              │           (owns supply,
   WiseCare ●                 │            clinical reports)
   (no supply, general        │
    family tracker)           │         ● Portea / Care24
                              │           (owns supply,
        ──────────────────────┼──────────  record is internal)──▶
                              │                    OWNS SUPPLY
                              │         ● Samarth / Emoha / Anvayaa
        WhatsApp ●            │           (brokers supply,
        the neighbour ●       │            reassurance by phone)
                              │
```

**CareConnect's position:** the only player that owns the care record while owning no
supply — deliberately asset-light, deliberately complementary to whoever the family
already hired.

## Why this position is defensible (and where it is weak)

**Defensible because:**

- **Incumbents are structurally conflicted.** An agency that ships a tool showing exactly
  when its own attendant missed a dose is arming the customer against itself. They can
  build it; they will not want it to work well.
- **It compounds where they do not.** The value of the record grows with every day logged
  and every attendant change survived. Switching cost is the history.
- **It is capital-light in a market that has repeatedly proved capital-heavy is fatal**
  (S11, S12).

**Weak because:**

- **The data comes from a worker who does not pay for it.** If attendants do not log,
  there is no product. This is the single largest risk in the whole plan (doc 14, E2).
- **A free adjacent product already exists** (S17). Differentiation has to be felt, not
  argued.
- **An agency could bundle a good-enough version** for its own customers as a
  differentiator — the plausible fast-follow.
