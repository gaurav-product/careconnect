# Glossary

Terms mean exactly this across the product, the code and every document. Where a word was
changed, the reason is recorded — the vocabulary is part of the product judgment.

## Product vocabulary

**Care case / care plan** — one recovery episode: a patient, a procedure, a discharge date,
and the medicines, tasks, readings and warning signs that follow from it. In the code the
table is `care_plans`; in the interface it is "care plan".

**Attendant** — the paid person physically with the patient. Never "caregiver", "resource"
or "user" in the interface. They are the primary data-entry user and they do not pay us.

**Shift** — a bounded period of duty: one attendant, one date, one slot (day 07:00–18:59 IST,
night the remainder). Every care entry belongs to a shift, which is what makes "who was
responsible" answerable.

**Care entry** — one recorded item: a dose, a task, a reading or an observation, with a
status, an author and a timestamp.

**Could not do** — a first-class entry status, not a failure. Requires a one-line reason.
A record of only successes is worse than no record.

**Red flag / warning sign** — a pre-agreed symptom the attendant taps to escalate. Never
generated or interpreted by the product.

**Alert** — a deterministic flag raised by a rule anyone can read. Three states: open →
acknowledged → resolved. Resolving requires a note, which becomes part of the handover.

**Handover pack** — the one-page artefact generated whenever an attendant leaves: the plan,
the warning signs, the last week, and every decision the family has already made.

**Revision** — a correction to an entry that was already recorded. The previous status and
reason are kept forever alongside the new ones.

## Metric vocabulary

**Documented care day** *(north star)* — a calendar day with **at least one** care record.
Deliberately a low bar: the first question is whether the record gets kept at all.

**Complete care day** *(quality)* — a day where every must-not-miss item was recorded, at
least 80% of the day's expected items were recorded, and no urgent alert was left open.

**~~Verified care day~~** — **abandoned.** ↺ The system verifies nothing. It records what a
person typed. Using "verified" would claim a check nobody performed, and would push the
roadmap toward proof mechanisms — photos, geofencing — that turn the product into
surveillance. See [decision D-18](../05-decisions/decision-log.md).

**Burst logging** — a shift where every entry lands in the few minutes before close. A
guardrail: it suggests the record is recollection rather than observation.

## Evidence vocabulary

Used consistently in every research document:

| Label | Means |
| --- | --- |
| **FACT** | Supported by a grade A or B source, quoted with figure and year |
| **OBSERVATION** | A pattern seen repeatedly across weaker sources; real, not quantified |
| **INFERENCE** | A conclusion drawn from evidence that does not directly state it |
| **HYPOTHESIS** | A testable belief the product rests on, with a named experiment |
| **ASSUMPTION** | Taken as true without evidence, listed so it can be attacked |
| **ANECDOTAL** | A single account. Evidence a thing *happens*, never how often |

## Validation vocabulary

The distinction that matters most in this repository:

| Label | Means |
| --- | --- |
| **Implemented** | The feature exists in the product |
| **Engineering validated** | System behaviour has been tested — automated tests pass |
| **User validated** | Real users produced evidence |
| **Unvalidated** | The hypothesis has not been tested |
| **Inconclusive** | Evidence exists but does not resolve the question |

**"Tests passed" is never "users love it."** Everything in CareConnect is Implemented and
Engineering validated. Nothing is User validated.

## Source grades

**A** government, multilateral or peer-reviewed · **B** commercial research house or
established news outlet · **C** industry participant, commercially motivated · **D** an
individual anecdote. Provider marketing is never quoted as a statistic.
