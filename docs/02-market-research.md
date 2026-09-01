# 02 · Market research

## Size, and why the headline number is misleading

| Measure | Figure | Source |
| --- | --- | --- |
| India home healthcare market, 2025 | USD 6.4bn | S4 |
| Same, 2033 (projected) | USD 16.8bn (12.9% CAGR) | S4 |
| Services share of that market, 2025 | 84% | S4 |
| Specialised senior-care market, 2036 (projected) | ~USD 35bn | S5 |
| Senior dependency ratio, 2021 → 2036 | 15.7% → 22.5% | S5 |

**FACT** The market is large and growing. **OBSERVATION** It is also the wrong number to
plan a product against, for two reasons.

First, **most of it is not addressable by software**. The 84% "services" share is nurses,
attendants, physiotherapists and equipment — labour and hardware, not subscriptions.

Second, **it is mostly informal**. S4 describes the sector as *"highly fragmented"*, with
*"a significant share of the market … still served by small local agencies and informal
caregivers"* lacking uniform training and quality standards, and constrained by *"the
absence of a dedicated national regulatory framework"*. The organised share is the
minority; it is the part that shows up in market reports.

## The number that actually matters for this product

CareConnect does not sell care. It sells a record of care. So the market is not "home
healthcare spend"; it is **the number of home-care episodes running at any moment where a
paying family member is not in the room**.

A transparent, clearly-labelled estimate — **ASSUMPTION-heavy, not a forecast**:

| Step | Value | Basis |
| --- | --- | --- |
| Indians aged 60+ | ~150m today, ~230m by 2036 | S1, S2 (FACT) |
| Share with supportive/palliative care needs | 12.2% | S3 (FACT) |
| → People needing supported care | ~18m | arithmetic |
| Share in households that can pay ₹35k+/month for an attendant | **2%** | **ASSUMPTION.** Anchored on: 78% have no pension and 70% depend on family (S5), so paying capacity sits with the adult child, not the elder. Not validated. |
| → Paying home-care households | ~360k | arithmetic |
| Share where the paying adult child lives in another city or country | **35%** | **ASSUMPTION.** No source gives this directly. Not validated. |
| → Beachhead-shaped households, at any time | **~125k** | arithmetic |
| Post-discharge episodes per year among them (assume 1.4 hospitalisations/yr) | **~175k episodes/yr** | **ASSUMPTION** |

At an indicative ₹399/month for a 30-day episode, that is a **serviceable revenue of
roughly ₹70 crore a year at 100% penetration** — which nobody gets. At a more sober 3%
of the addressable episodes, roughly **₹2 crore a year**. That is a modest business on
its own and a strong wedge into a much larger one (chronic care, agencies, insurers).

Stating that plainly is the point: this is a **wedge**, not a market-defining play, and
the model above is an arithmetic chain of assumptions, not a market study.

## Who pays for care in India today

- **FACT** 70% of elderly depend on family for daily maintenance; 78% have no pension
  (S5). **FACT** Only ~18% of the 60+ population had health insurance before the PMJAY
  expansion; PMJAY and private insurers *"mostly cover inpatient expenditure"* (S5).
- **Implication** Home care after discharge is almost entirely **out of pocket**, paid by
  an adult child, and it is the part of the recovery insurance does not touch. There is
  no payer to sell to yet — which is why the MVP is a direct-to-family product and not a
  B2B2C insurance play.

## Structural forces worth naming

**1. Nuclear households and internal migration.** The care recipient and the payer are
increasingly in different cities. S9 describes the resulting pattern directly: a parent
mentions the helper stopped coming, and the adult child runs a remote scramble by phone
and WhatsApp.

**2. Feminisation and dependency of ageing.** Women are 58% of the elderly and 54% of
elderly women are widows (S2); the report describes *"a predominance of widowed and
highly dependent very old women"* (S1). The typical patient in this market is an elderly
widow with limited independence — which shapes both the care plan and the interface.

**3. An unregulated, high-churn workforce.** No national framework (S4); training and
quality vary; agencies compete on price and availability. Nothing in the current
structure makes anyone accountable for continuity.

**4. Hospital-at-home is expanding.** Large networks are pushing care out of the ward
(S4). Every discharge that moves earlier makes the first 30 days at home more clinically
loaded, and more dependent on whoever is standing in the room.

## What the money has already tried, and what happened

| Attempt | Outcome | Source / grade |
| --- | --- | --- |
| Portea — full-stack home healthcare | Reported ~USD 93m burned | C (S11) |
| Emoha — subscription elder care | Community claim: *"spends ₹1.5 to earn ₹1"*; *"burning cash"* | C (S10, S11) |
| Papa (US analogue) — USD 242m raised | Shut down; care-quality problems cited | C (S11) |
| Elcare India — CareMates model | 200+ families, 11 cities, ~₹5 lakh monthly revenue, ~30% margins claimed; **ceased operations 2024** when scaling required "substantial investment in training, infrastructure, and manpower" | C (S12) |

These are grade-C figures and I do not present them as audited. But the *pattern* is
consistent and it is the single most important strategic input in this project:

> **Every well-funded attempt at Indian elder care has failed on the operations of
> supplying and quality-controlling human labour, not on demand.**

A product that owns supply inherits those economics. A product that owns the **record**
does not. That is the market read behind the strategy in doc 08.

## Regulatory context

- **DPDP Act 2023 + DPDP Rules 2025.** Health information requires explicit, informed
  consent; blanket or implied consent is invalid; data must be minimised to what the
  purpose needs; breaches are reportable within **72 hours**; organisations need a DPO
  and DPIAs for high-risk processing; individuals get access, correction and erasure
  (S20). Doc 16 lists what the MVP does and does not yet satisfy.
- **No home-care licensing regime.** There is no national registration or standard for
  home attendants (S4). CareConnect must therefore never imply that a caregiver is
  "verified" by anyone — it can only show what was recorded.
