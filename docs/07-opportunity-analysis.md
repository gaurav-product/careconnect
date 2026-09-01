# 07 · Opportunity analysis

This document does three things: scores the segments, tests the starting hypotheses
against the evidence, and ranks five opportunity spaces down to one.

---

## Part 1 — Segment scoring

Scored 1–5. Scores are **judgements from the evidence in docs 01–04**, not measurements;
the reasoning column is the part that matters, and it is where an interviewer should push.

| Criterion | A · Adult child living away | B · Post-hospitalisation family | C · Elder arranging own care |
| --- | --- | --- | --- |
| **Pain** | 4 — chronic anxiety, guilt, late discovery (S9) | **5** — acute, time-boxed, with a clinical downside | 3 — real, but often framed as independence rather than pain |
| **Frequency** | **5** — every single day of the episode | 3 — episodic, 1–2 hospitalisations a year | 4 — daily |
| **Urgency** | 3 — chronic urgency is easy to postpone | **5** — the decision is made within 24 hours of discharge | 2 — rarely acts before a crisis |
| **Existing alternatives** | 2 — phone calls, WhatsApp, a neighbour, subscription eldercare (S10) | **4** — almost nothing structured exists for the first 30 days | 3 — reminder apps with poor adoption (S18) |
| **Willingness to pay** | **5** — already paying ₹35k–75k/month (S8) and paying for reassurance today | 4 — spending heavily and fear-driven, but for a bounded period | 1 — 18.7% have no income; 78% no pension (S1, S5) |
| **Digital accessibility** | **5** — smartphone-native, often the household's most digital person | **5** — same person, in a different moment | 1 — the binding constraint in every source (S18) |
| **Market opportunity** | **5** — largest and growing with migration | 4 — large but each customer is time-bounded | 2 — small paying subset |
| **Competitive intensity** (5 = least crowded) | 2 — Samarth, Emoha, Anvayaa, WiseCare all aimed here | **4** — nobody owns the discharge-to-day-30 window | 3 |
| **MVP feasibility** | 4 | **5** — a bounded episode with a natural trigger and a natural end | 2 — needs elder-facing UX and probably hardware |
| **Total (45)** | **35** | **39** | **21** |

### Reading the scores

The scores say something more useful than "B wins": **A and B are the same person in
different moments.** Ananya *is* Segment A. On the day her father is discharged, she
becomes Segment B for thirty days.

- **Segment A alone** is a crowded market (S10, S17) with a diffuse trigger — "I worry
  about my parents" is not a moment that makes anyone sign up on a Tuesday.
- **Segment B alone** is a sharp trigger with a churn problem: the episode ends and so
  does the reason to pay.
- **The intersection** gives a sharp acquisition trigger *and* a persistent relationship:
  acquire at discharge, when urgency is maximal, then keep the plan alive for whatever
  chronic care follows.

**Beachhead: the adult child living away who is arranging and supervising the first 30
days of post-hospital home care for a parent (A ∩ B).**

Segment C is explicitly rejected as a beachhead — not because the need is small but
because willingness and ability to pay and digital accessibility both score 1, and no
amount of good design fixes an elder who will not open the app at the moment it matters
(S18).

---

## Part 2 — Testing the starting hypotheses

### H1 · Finding caregivers is a major problem

- **Evidence for:** Quality of who you find is genuinely bad and inconsistent (S13, S4).
  Informal channels offer no vetting (S15).
- **Evidence against:** Supply is abundant and fast — Care24 alone advertises 2,000+
  caregivers across ten cities with a three-hour allocation (S14); national providers,
  local agencies, hospital referrals and WhatsApp networks all deliver someone within a
  day. No source describes a family unable to find anyone.
- **Confidence: high that this is NOT the core problem.**
- **Remaining uncertainty:** likely to be false in metros, may be genuinely true in tier-3
  and rural areas — where willingness to pay and digital access are also lowest.
- **Verdict: REJECTED as the core problem.** This is the finding that ends the original
  CareConnect concept.
- **Validation if you disagree:** ask 20 families how long it took to find someone versus
  how long it took to trust them. If find-time dominates, I am wrong.

### H2 · Trust and verification are larger problems than discovery

- **Evidence for:** Complaints are about the person who arrived, not about finding one
  (S13). Informal hiring offers *"no accountability structure, no replacement guarantee"*
  (S15). Providers compete explicitly on verification claims (S14), which is what you do
  when trust is the scarce good.
- **Evidence against:** "Verification" as the market means it — police and court checks —
  is already sold by every organised provider. It is table stakes, not a wedge.
- **Confidence: high, with an important correction.** The gap is not *pre-hire background
  checking*; it is **ongoing verification that the care is being delivered**. Background
  checks tell you who someone is. They tell you nothing about whether the antibiotic was
  given at 9pm.
- **Verdict: ACCEPTED, reframed** — from identity verification to **delivery verification**.
- **Validation:** offer families two mock products, one with certified background checks
  and one with a daily verified record. Measure which they choose.

### H3 · Caregiver continuity and replacement are major recurring problems

- **Evidence for:** Four named failure patterns — rotation, provider-hopping, patchwork,
  the leave gap (S16). Helpers *"disappear without notice"*, triggering a WhatsApp scramble
  (S9). Providers advertise replacement as a feature (S14), which tells you it happens
  often. Attrition is a structural feature of this workforce (S4).
- **Evidence against:** The vendor-published quantifications of the harm (S16) are
  marketing, so the *size* of the effect is unestablished. It is also possible that
  families have simply accepted churn as normal and do not experience it as a problem to
  be solved.
- **Confidence: high that it happens; medium that families would pay to fix it.**
- **Verdict: ACCEPTED, and it is the differentiator** — nobody in any layer produces an
  artefact that survives the attendant changing (doc 04).
- **Validation:** E5 in doc 14 — measure whether an incoming attendant who gets a handover
  pack logs more completely in their first 72 hours than one who does not.

### H4 · Families living away need better visibility into care

- **Evidence for:** The entire coping repertoire described in S9 is a substitute for
  visibility — unscheduled video calls, neighbours dropping in, phone interrogation.
  Problems going unnoticed *"for months"* (S9). Subscription providers sell exactly this
  and charge ₹3,000–25,000/month for it (S10).
- **Evidence against:** Visibility without action is just anxiety with better data. And
  WiseCare already offers a free version of visibility (S17), which caps what "visibility"
  alone is worth.
- **Confidence: high on the need, medium on it being sufficient.**
- **Verdict: ACCEPTED, with a condition** — visibility is only valuable when it is
  **exception-driven**. A dashboard the family must remember to check is a fifth WhatsApp
  group. This is why the product's core unit is an **alert with a required resolution
  note**, not a feed.

### H5 · Families will pay for a more trustworthy and transparent experience

- **Evidence for:** ₹35,000–75,000/month is already being spent on the attendant (S8), and
  ₹3,000–25,000/month on subscription reassurance (S10) — which is close to a direct proof
  that reassurance is a purchasable good in this market.
- **Evidence against:** They pay for reassurance **bundled with service**. Nobody has shown
  that families will pay for reassurance **unbundled**. And the nearest product is free
  (S17).
- **Confidence: LOW. This is the weakest link in the entire plan.**
- **Verdict: UNPROVEN — and it is the thing to test before writing more code.**
- **Validation:** E3 in doc 14 — a real price page in front of real discharge-week
  families, measuring intent to pay, not satisfaction.

### H6 · (added) Attendants will log reliably if it costs under five minutes a shift

- **Evidence for:** Daily reporting is already an expected part of a good attendant's job
  (S21); today it is verbal. Attendants have an unserved interest in provable work.
- **Evidence against:** None found, in either direction. This is a genuine unknown.
- **Confidence: LOW.** If this is false, the product has no data and nothing else matters.
- **Validation:** E2 in doc 14 — 5 attendants, 14 days, measure shift-close rate and
  time-in-app without anyone standing over them.

---

## Part 3 — Five opportunity spaces, ranked

### O1 · Post-discharge care accountability layer ← **selected**

| | |
| --- | --- |
| **Target user** | Adult child, away, arranging the first 30 days after discharge |
| **Trigger** | The discharge itself — a dated, unambiguous moment |
| **Problem** | No way to know whether today's care happened; no early warning; nothing survives the attendant changing |
| **Workaround** | Phone calls, WhatsApp, a neighbour |
| **Why it fails** | Unstructured, un-timestamped, invisible to whoever comes next, and dependent on a patient who under-reports |
| **Solution** | Turn the discharge sheet into a shift-level plan; the attendant logs it in under five minutes; the family gets a verified daily record, exception alerts, and a handover pack that outlives the attendant |
| **User value** | High — replaces guessing with evidence at the moment of maximum fear |
| **Business value** | Medium-high — sharp acquisition trigger, upgrade path into chronic care, agency and insurer channels later |
| **Competitive intensity** | Low — nobody owns this window (doc 04) |
| **Technical complexity** | Low |
| **Operational complexity** | Low — no supply to manage |
| **Differentiation** | High — the only asset-light player that owns the record |
| **Evidence strength** | Medium-high — failure modes well documented; willingness to pay unproven |

### O2 · Verified attendant marketplace with quality scores

Target: same family, at hire time. Solution: a marketplace where attendants carry a
portable, verified track record. **Rejected as first move:** it requires owning supply,
which is precisely what has consumed USD 93m at Portea and closed Elcare (S11, S12); it
also has a cold-start problem — the ratings are worthless until thousands of episodes
exist. **But it is the natural sequel to O1**, because O1 generates exactly that data.

### O3 · Medication safety for older adults at home

Strong evidence: 33.7% polypharmacy, 28.8% potentially inappropriate medications, 19.7%
self-medicating (S6); medication reconciliation is the named first-week failure point
(S19). **Rejected as a standalone product:** doing it properly means clinical
interpretation — interaction checking, deprescribing advice — which is regulated
territory, needs a pharmacist in the loop, and carries real harm risk. As a **feature
inside O1** (critical medicines, missed-dose alerts) it delivers most of the value with
none of the liability.

### O4 · Family caregiver support and training

Strong evidence of need: unmet needs for information, training and respite across 27
studies (S7). **Rejected:** the user has no budget (they are the substitute for a paid
attendant), the value is diffuse, and content products are hard to make sticky. High
social value, poor first business.

### O5 · Agency operations SaaS

Sell rostering, attendance and reporting to the thousands of small agencies (S4).
**Rejected as first move:** it makes the agency the customer, which means the record
belongs to the party it might indict — destroying the credibility that is CareConnect's
whole asset. Viable as a **channel** later, once families demand the record and agencies
adopt it to win business.

### The ranking

| Rank | Opportunity | Why it lands here |
| --- | --- | --- |
| **1** | **O1 · Post-discharge accountability layer** | Sharpest trigger, real gap, asset-light, differentiated, feasible for one person to build |
| 2 | O2 · Verified marketplace | Bigger prize, but needs O1's data first and owning supply is fatal early |
| 3 | O3 · Medication safety | Best evidence base, worst risk profile standalone; ships as a feature of O1 |
| 4 | O5 · Agency SaaS | Good business, wrong customer for now; becomes a distribution channel |
| 5 | O4 · Caregiver support | Highest social value, no payer |

**Selected: O1.** Everything in docs 08–17 is the consequence of that choice.
