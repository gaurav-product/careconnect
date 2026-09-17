# Pilot runbook — 5 attendants × 3 families × 14 days

**Status: NOT STARTED.** Nothing in this document has happened. It exists so the pilot can
be run by a person with a calendar rather than improvised.

The purpose is **not** statistical proof. Three families cannot produce that, and any
number from this pilot quoted as a rate would be dishonest. The purpose is to find out
whether the thing works at all, in the specific ways listed in "What would stop the pilot"
below.

---

## What this pilot is trying to learn

In priority order. If only the first is answered, the pilot was still worth running.

1. **Will an attendant record a shift, unsupervised, in under five minutes?** (E1)
2. **Does the family read it, and does reading it change anything they do?**
3. **Does the handover pack help a replacement attendant?** (E3 — only if a change happens
   naturally; do not engineer one)
4. **Does anyone feel surveilled, exposed or blamed?**

Willingness to pay (E2) is **not** tested here. Asking three pilot families to pay while
they are doing you a favour produces a polite answer, not a real one. E2 runs separately,
with strangers.

---

## Before day 1

### Recruitment

| Who | How many | Where from | Screen out |
| --- | --- | --- | --- |
| Families | 3 | Orthopaedic/cardiac OPD waiting rooms; one physiotherapist's referrals | Anyone without paid home help; anyone whose parent is in a facility |
| Attendants | 5 | Through the families' own agencies, plus 1–2 hired directly | Anyone whose agency required them to take part |

**Three families, five attendants** is deliberate: it means at least two households run day
and night attendants, which is where handover actually gets exercised.

### Non-negotiables before anyone starts

- [ ] **Attendants are paid** for the time the pilot costs them, whether or not they
      complete it, and regardless of what they record.
- [ ] **Participation is voluntary and not arranged by an employer.** Confirm this with the
      attendant privately, not in front of the agency or the family.
- [ ] The consent script (see [participant materials](../07-validation/participant-materials.md)) is spoken
      to each participant, in their language, and their agreement recorded in the log.
- [ ] The family has told the **patient** what is happening, in words the patient
      understands, and the patient has not objected. *The patient is the subject of this
      record and is not a user — if they object, that household does not enter the pilot.*
- [ ] Each household has a named fallback: if CareConnect is down or confusing, they carry
      on exactly as they did before. **The pilot must never be the only path to care.**

### Setup day (about 45 minutes per household)

1. Sit with the family and build the care plan from their **own discharge summary**. Do not
   supply content. If the template is wrong for them, that is a finding — write it down.
2. Watch them invite the attendant. Time it. Say nothing.
3. Hand the attendant their one-pager and walk them through the app **once, for two
   minutes**. Then stop talking.
4. Record the baseline: how do they coordinate care today? Who calls whom, and when?
5. Leave. Do not check in for 72 hours.

---

## During the 14 days

### The researcher's job is to not help

The single biggest threat to this pilot is the researcher propping it up. An attendant who
logs because someone messages them daily tells you nothing about whether attendants log.

**Rules:**
- No daily reminders. No "did you record today?" messages. Ever.
- If a participant asks for help, answer the question asked and **log it as a usability
  failure**, with the exact words they used.
- If nobody records anything for three days, do not intervene. **That is the result.**
- One scheduled check-in on **day 3** and one on **day 14**. Nothing in between unless the
  participant initiates it.

### What gets collected, and from where

| Signal | Source | Effort |
| --- | --- | --- |
| Shift close rate, items recorded, time in app, burst logging, corrections | Already instrumented — `analytics_events` | None |
| Documented care days, complete days | The Insights screen | None |
| Failed saves | `care_entry_corrected` + the "did not save" banner being seen | None |
| Every unprompted message a participant sends | Screenshot it, verbatim | Daily, 2 min |
| Observations during the two visits | [Daily log](../07-validation/participant-materials.md) | 2 × 30 min |

Pull the metrics **once, on day 15**. Watching the dashboard daily creates pressure to
intervene.

### Day 3 check-in (15 minutes, each participant separately)

Attendant: *"Show me what you did yesterday."* Then watch, silently. Ask only: what was
annoying? what did you not understand? did you skip anything, and why?

Family: *"When did you last open it, and what did you do next?"* The second half of that
question is the one that matters — reading without acting means the record is interesting
but not useful.

### Day 14 close-out (30 minutes each)

- What would you miss if it disappeared tomorrow?
- What did you stop doing because of it? (If nothing, say so in the writeup.)
- Attendant only: **did anything about this feel like being watched?** Ask it plainly, and
  give them room to say yes.
- Family only: did you ever act on something you saw here? Walk me through it.
- Both: would you keep using it? Why not?

---

## What would stop the pilot early

Stop and fix before continuing if any of these happen:

| Trigger | Why it stops everything |
| --- | --- |
| A family relies on an alert that never arrived | Delivery is stubbed. If a household is treating the app as a safety net, tell them immediately and in writing that it is not one |
| An attendant is disciplined or dismissed over something in the record | The product created a workplace harm. Stop, investigate, and do not resume with that agency |
| A patient objects to being recorded | That household exits the pilot, same day, no persuasion |
| Data from one household becomes visible to another | Stop everything, fix, restart |

None of these are hypothetical risks worth glossing over: the first is a live limitation of
the current build, and the second is the predictable failure mode of any tool that documents
a worker's performance for their employer's customer.

---

## After: writing it up honestly

Fill the [evidence table](../07-validation/evidence-table.md) before drawing any conclusion. Separate **what
happened** from **what we think it means**, and keep them in different columns.

**Rules for the writeup:**
- Three families is n=3. Write "two of three families", never "67%".
- If the pilot failed, the writeup says the pilot failed, in the first paragraph.
- A participant who dropped out is reported, with their reason if they gave one.
- Anything the researcher helped with is a usability failure, not a success.
- Quotes are verbatim, or they are not quotes.

Then update the tracker in [19-validation-plan.md](../07-validation/validation-plan.md) — a row moves to
*Validated* or *Invalidated* only when the evidence column names data that exists.
