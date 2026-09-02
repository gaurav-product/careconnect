# 03 · User research

## Method, and its honest limits

**No primary research was conducted.** No interviews, no surveys, no diary studies, no
usability tests with real families or attendants. The guides that would fix this —
family, attendant and hospital/agency interview scripts, an observation protocol and
consent guidance — are written and ready in
[19-validation-plan.md](19-validation-plan.md). None has been used. This document is a synthesis of
secondary sources: peer-reviewed studies, government data, journalism, provider
documentation, and public complaints.

That limit is load-bearing, so it is stated everywhere it matters:

- Where a real study would report a percentage, this document reports **Not yet
  validated**.
- Anecdotes from complaint boards are evidence that a failure mode **exists**, never
  evidence of **frequency**.
- Doc 14 turns the largest of these gaps into cheap experiments that would run before any
  further building.

## Demand side: who is on the other end of the phone

### Segment A — the adult child who lives elsewhere

**FACT** Internal and international migration has separated payer from patient at scale;
elderly parents in India increasingly live alone or with only a spouse (S1). **FACT** 70%
of the elderly depend on family for daily maintenance (S5).

What sources describe them doing (**OBSERVATION**, C-grade, S9):

- Hiring through *"a recommendation from the hospital, a contact shared by a neighbour, a
  number found on a notice board"* (S15).
- Supervising by **unscheduled video calls**, asking a neighbour to look in, and calling
  the parent to ask whether the medicine was taken.
- Discovering problems late: *"small amounts of cash going missing or unexplained
  household expenses often go unnoticed for months"* (S9).
- Re-hiring in a panic when a helper vanishes: *"a scramble of phone calls to relatives,
  neighbours, and WhatsApp groups"* (S9).

The emotional register in these sources is consistent: **guilt and helplessness rather
than dissatisfaction with price**. That is a strong signal for a product that sells
confidence, and a warning for one that sells cheapness.

### Segment B — the family arranging care after a hospitalisation

**OBSERVATION** The discharge moment is an unusually well-defined trigger. Sources
describe what a family must arrange, usually within 24 hours (S19):

- Reconcile the pre-admission medicines against the new discharge prescription — named as
  *the* critical failure point, where *"old routines continu[e] alongside new
  prescriptions; doubled or missed doses"*.
- Know the warning signs that mean "go back to hospital".
- Set up the room, the walker, the commode.
- Find and brief an attendant, starting the same day.

**FACT** The medication risk is not hypothetical: 33.7% polypharmacy, 28.8% on a
potentially inappropriate medication, 19.7% self-medicating among urban Indian older
adults (S6).

### Segment C — the elderly person arranging their own care

**FACT** 18.7% of the elderly have no income; over 40% are in the poorest wealth quintile
(S1). **FACT** They are also the least likely to transact on a smartphone: app reviewers
note that reminder apps show *"poor adoption among Hindi-first seniors"* and that panic
buttons fail because *"adoption is the problem"* — the person does not use them at the
moment they matter (C, S18).

**ASSUMPTION** A minority of urban, financially independent elders would buy and use such
a product themselves. Not validated, and not the beachhead — see doc 07.

### The family caregiver who is doing the care

**FACT** A scoping review of 27 Indian studies of dementia family caregivers reports
physical and emotional burnout, and unmet needs for **information, training, respite,
and professional support**; some caregivers resort to *"inappropriate coercive measures,
such as seclusion, sedatives, and environmental restraints"* for want of guidance (S7).

That is a real and severe problem. It is deliberately **out of scope** — see the
non-goals in doc 08.

## Supply side: the attendant

This is the user everyone building in this space forgets, and the one whose behaviour
determines whether the product has any data at all.

What sources establish:

- **The role sits between a domestic helper and a nurse** — personal care, mobility,
  medication reminders, basic observation, *"not clinical, but … trained"* (C, S21).
- **The expected output already includes reporting.** S21 lists what a family should
  insist on: written medication lists, *"daily summary reporting (not optional)"*, a named
  escalation contact, and clear protocols for absence. In other words, **the job already
  contains the data entry — it is simply done verbally, or not at all.**
- **Churn is structural.** Rotation every week or two, provider-hopping, leave gaps
  (C, S16); helpers who *"disappear without notice"* (C, S9).
- **Trust runs one way.** Verification is something done *to* attendants — court and
  criminal checks, training certificates (C, S14). Nothing in the market gives an
  attendant a record of having done the job well.

### The three constraints that shaped the attendant interface

1. **A cheap Android phone, often shared, frequently on patchy data.** Design for large
   targets, few screens, and small payloads.
2. **Hindi-first, and reads English slowly.** Every action label in CareConnect's
   attendant flow carries both languages simultaneously rather than hiding one behind a
   toggle — a shared phone can be picked up by the family, the day attendant and the
   night attendant within an hour.
3. **The attendant is not the customer, and knows it.** If logging feels like surveillance
   with no upside, it gets falsified or skipped. So the design gives them three things
   the current market does not: a "not done, and here is why" option that is a legitimate
   answer rather than a failure; a handover note that makes their next shift easier; and a
   record that follows them as evidence of work done.

**HYPOTHESIS (H6, added during research)** An attendant will log reliably only if a shift
costs under five minutes of total interaction and "could not do it" is a first-class
answer. **Not yet validated** — experiment E2 in doc 14.

## What I did not learn, and would need to

| Unknown | Why it matters | How to close it |
| --- | --- | --- |
| Do families actually notice care gaps today, or only crises? | Determines whether the value is felt daily or only after an incident | E1: 10 discharge interviews |
| Will attendants log without a supervisor standing over them? | The whole record depends on it | E2: concierge pilot, 5 attendants, 14 days |
| Who pays — the away child, or the local sibling? | Changes onboarding and pricing | E1 + E3 |
| Do agencies see this as a threat or a selling point? | Decides whether distribution is B2C or through agencies | E4: 5 agency conversations |
| Does the elder object to being logged? | Consent and dignity risk | E1, and a consent screen in the plan setup |

Every one of these is answerable for less than the cost of a week of engineering, which
is the strongest argument for having stopped building where this MVP stops. Doc 19 turns
each row of this table into a specific question in a specific guide.
