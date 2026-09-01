# 08 · Product strategy

## What CareConnect became

**CareConnect is no longer a caregiver marketplace.**

> **CareConnect is the care record that stays with the patient, not the agency.**

It sits on top of whatever attendant a family has already hired — from a national
provider, a local agency, or a neighbour's cousin — and turns the first thirty days after
a hospital discharge into something the family can actually see.

## Target user

**One persona: Ananya.** The adult child, living in another city, who is arranging and
paying for home care after a parent's hospital discharge, and who is not in the room.

Not the elder. Not the agency. Not the hospital. Not the family caregiver doing the work
themselves. Each of those is a different product, and doc 07 says why.

## The job

> When my parent comes home from hospital and someone I barely know is responsible for
> them all day, I want to know that today's care actually happened and be told
> immediately when it did not — so I can act on information instead of imagination.

## Problem statement

> An Indian family can hire a home attendant within a day, but has no way to verify that
> the day's care actually happened, no early warning when it did not, and nothing that
> survives the attendant being replaced — which, in a workforce that rotates constantly,
> is the normal case rather than the exception.

## Value proposition

> **A verified daily record of your parent's recovery, kept by whoever is in the room —
> so you know what happened today, hear about problems the same hour, and never start
> over when the attendant changes.**

## Product hypothesis

> **If** a family sets up a shift-level care plan at discharge and their attendant can
> record it in under five minutes a shift,
> **then** the family will experience the record and its exception alerts as worth paying
> for — visible as ≥60% of trial families reaching day 7 with a majority of days verified,
> and ≥30% saying they would pay ₹399/month,
> **because** the alternative is asking a parent who under-reports and an attendant whose
> word cannot be checked.

Numbers here are **targets to test, not results**. Nothing has been validated with real
users.

## Product principles

**1. The record belongs to the patient, not to whoever is currently paid.**
Every design choice bends toward surviving the attendant, the agency and the app itself.
This is why the handover pack is a first-class object rather than an export.

**2. Five minutes a shift, or there is no product.**
The attendant is the data source and does not pay us. Any feature that costs them time
must earn it back for them within the same shift.

**3. "Could not do it" is a first-class answer.**
A product that only records success trains people to lie. A missed task with an honest
reason is more valuable than a checkbox — it is often the earliest signal that something
is wrong.

**4. Escalate to a human; never interpret.**
CareConnect flags what was recorded against what was expected. It never diagnoses,
advises or triages. Every alert ends in a person making a decision, and the product says
so on both the family's and the attendant's screen.

**5. Be honest about what is not there.**
The notification outbox is shown in the app precisely because delivery is not connected.
Uncertainty is displayed, not hidden — including on the Insights screen, which says in
plain words that its numbers describe a seeded demo.

## Non-goals — what the MVP explicitly does not solve

| Not solving | Why |
| --- | --- |
| **Finding or booking a caregiver** | Discovery is not scarce (doc 01), and owning supply is what has killed the funded attempts (doc 02) |
| **Payments to attendants or agencies** | Adds compliance, disputes and no learning about the core hypothesis |
| **Any clinical judgement** | Interpreting a wound or a reading is regulated, dangerous, and someone else's job |
| **Emergency response** | An ambulance is not a feature. The attendant screen says so, in two languages |
| **A patient-facing app** | The elder is not a user; app adoption among Hindi-first seniors is the market's proven weak point (S18) |
| **Real-time WhatsApp/SMS delivery** | Needs a BSP account and template approval; stubbed and visibly labelled in the MVP |
| **Supporting the unpaid family caregiver** | Real need (S7), different product, no payer |
| **Agency workforce management** | Makes the agency the customer and destroys the record's credibility |
| **Multi-patient or institutional use** | One patient, one episode, one family |

## Why this can win

- **Structural conflict of interest protects it.** An agency that ships a tool showing
  when its own attendant missed a dose is arming the customer against itself.
- **The asset is compounding and portable.** Value grows with days logged and attendant
  changes survived. The switching cost is the history.
- **The economics are the opposite of the graveyard.** No caregivers on the balance sheet,
  no allocation desk, no supply guarantee — the three things that have consumed capital
  in this market (S11, S12).

## Why it might not

- **The data source is a worker who does not pay for it.** If attendants do not log,
  nothing else matters (H6).
- **Willingness to pay for unbundled reassurance is unproven** (H5), and a free adjacent
  product already exists (S17).
- **An agency could bundle a good-enough version.** The defence is that families, not
  agencies, must own the record — which is a positioning bet, not a moat.
- **The episode ends.** A 30-day product has 30-day retention unless the chronic-care
  transition works.

## Sequence, if the tests pass

1. **Now — MVP** One episode, one family, one or more attendants. Prove the record gets
   created and read.
2. **Next — reliability** WhatsApp delivery, offline logging, a second family member, a
   Hindi-only mode, photo evidence for wounds.
3. **Then — continuity as a business** Agency-facing view *paid for by the family*;
   attendants carrying a portable work record between families.
4. **Later — the sequel** The verified marketplace (O2), built on data that only exists
   because O1 ran first.
