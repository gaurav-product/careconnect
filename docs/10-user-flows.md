# 10 · User flows

Three journeys carry the product: the family's setup, the attendant's shift, and the
handover. Everything else is a detail hanging off one of them.

---

## Flow 1 · Family, from discharge to a live plan

```
Discharge summary in hand
  │
  ├─ Sign up  (name · mobile · password · "I am a family member")
  │     └─ privacy note: what is stored, who can see it, "this is a prototype"
  │
  ├─ Step 1  Patient & discharge
  │     name · age · sex · city · hospital · procedure · discharge date (≤ today)
  │     doctor · local emergency contact
  │     "anything the attendant must know" ── free text, the thing only the family knows
  │
  ├─ Step 2  Recovery type
  │     ortho · cardiac · stroke · abdominal · general
  │     → seeds tasks (EN+HI), readings with normal bands, warning signs
  │     copy: "a starting point — check it against your discharge sheet"
  │
  ├─ Step 3  Medicines
  │     name · dose · times · instruction · ☐ must not be missed
  │     → plan created
  │
  └─ Land on Attendants, not on a dashboard
        └─ add attendant → 6-character code + one-tap WhatsApp message
```

**Why it lands on Attendants:** a plan with no attendant produces no data and therefore no
value. The last step of setup is the first step of activation.

**Edge cases**
| Case | Behaviour |
| --- | --- |
| Discharge date in the future | Rejected inline: "Discharge date cannot be in the future" |
| No medicines entered | Allowed — some discharges genuinely have none; tasks and warning signs still work |
| Attendant not hired yet | Plan sits ready; the dashboard says "No attendant added yet" with the action inline |
| Family signs up but is really an attendant | Role picker on sign-up; an attendant account cannot create plans and is told why |
| A second family member wants access | **Not in the MVP.** P1, and named as a gap |

---

## Flow 2 · Attendant, one shift

```
Opens the link the family sent  →  signs up as "an attendant"  →  enters the 6-char code
  │
  ▼
TODAY  (the only screen)
  ├─ Emergency: call the family  ── one tap, always at the top
  ├─ Full care plan · Medicines list  ── read anything, any time
  ├─ "Read this first" ── the previous attendant's handover note
  └─ [ Start my shift · ड्यूटी शुरू करें ]
        │
        ▼
   ON DUTY
     ├─ Medicines · दवाइयाँ      [Given · दे दी] [Not given · नहीं दी]
     │     └─ not given → reason sheet (required) → missed / refused
     ├─ Care tasks · देखभाल के काम  [Done · हो गया] [Could not · नहीं हुआ]
     │     └─ could not → reason sheet (required)
     ├─ Readings · रीडिंग          → number pad sheet; BP asks for both numbers
     │     └─ out of range → "the family has been alerted about this reading"
     ├─ Something wrong? → [Report a problem · समस्या बताएं]
     │     └─ tap a warning sign (or none) + describe → family alerted
     └─ sticky bar: "4 still to record · दर्ज करना बाकी"   [End shift · ड्यूटी खत्म]
             │
             ▼
        End-shift sheet
          ├─ warns how many items are unrecorded
          ├─ note for the next person (optional, encouraged)
          └─ closes the shift → critical items unrecorded raise a watch alert
```

**Edge cases**
| Case | Behaviour |
| --- | --- |
| Someone else already started this slot | Screen states who is on duty and to ask the family — no silent takeover |
| Attendant taps Start twice | Idempotent; the same shift is resumed |
| Shift already closed, one more thing to log | Refused with "start your next shift to keep recording" — a closed shift is a closed record |
| Network drops mid-entry | The call fails with "You appear to be offline"; nothing is silently lost, nothing is silently saved. **Offline queueing is P1 and named as a gap** |
| Attendant removed mid-shift | Access revoked immediately, open shift closed, handover written |
| Wrong entry | Re-tap the item within the same shift; the entry is overwritten, not duplicated |
| Not on any plan yet | Empty state that explains the invite code and links to the join screen |

---

## Flow 3 · Escalation, which is the product's reason to exist

```
Attendant reports "wound is red and warm"
  │  (or a reading lands outside the band, or a critical dose goes unrecorded for 90 min)
  ▼
ALERT raised  ── urgent | watch, deduplicated on its source
  ├─ written to the notification outbox (WhatsApp/SMS message composed, delivery NOT connected)
  └─ appears at the top of the family's Today screen, urgent first
        │
        ├─ [I have seen this]  → acknowledged, time-to-acknowledge recorded
        └─ [Close with a note] → note REQUIRED
              └─ the note lands in: the day record · the handover pack · the metrics
```

**Auto-resolution:** if the attendant records the dose that triggered a "not recorded"
alert, or starts the shift that triggered a "not started" alert, the alert closes itself
with a system note. Alerts the family must act on are never auto-closed.

**What the product deliberately does not do:** interpret the reading, suggest a diagnosis,
recommend a medicine, or call anyone. Both screens say so.

---

## Flow 4 · Attendant replacement — the differentiator

```
Family: Attendants → [End on this plan] → why are they leaving?
  │
  ├─ access revoked immediately
  ├─ any open shift closed
  └─ handover snapshot written  ← always, not optional
        │
        ▼
  New attendant added → new code → joins
        │
        ▼
  First screen shows: previous handover note + "Full care plan"
        │
        ▼
  HANDOVER PACK (one printable page)
    · the patient, the procedure, the house notes, the doctor, the emergency contact
    · warning signs, in English and Hindi
    · medicines with times, instructions, must-not-miss flags
    · the daily routine in both languages
    · the last 7 days: what was recorded, what went wrong, in day numbers
    · what was reported and WHAT THE FAMILY DECIDED  ← added after QA found it missing
    · the outgoing attendant's last note
    · anything still open
```

**Edge cases**
| Case | Behaviour |
| --- | --- |
| Attendant leaves with no replacement yet | Pack is stored; the dashboard shows nobody on duty; shift-not-started alerts stop firing because no active attendant exists |
| Two attendants (day and night) | Both hold active memberships; each owns their own slot |
| Family tries to remove themselves | Refused: "The plan owner cannot be removed" |
| Attendant returns later | Added again as a new membership; their earlier history stays intact under the old one |

---

## Flow 5 · Failure and empty states

| State | What the user sees |
| --- | --- |
| Not signed in, deep link opened | Sent to sign in, then returned to where they were going |
| Session expired | "Your session has expired. Please sign in again." |
| Wrong password | "That mobile number and password do not match" — never which half was wrong |
| Too many failed attempts | "Too many failed attempts. Please wait about N minutes." Successful sign-ins never count |
| No plans yet (family) | Empty state explaining when to set one up and what to have in hand |
| No plans yet (attendant) | Empty state explaining the invite code, with a button to the join screen |
| Bad invite code | "That invite code is not valid. Ask the family to send it again." |
| Used invite code | "That invite has already been used." |
| Plan belongs to someone else | 403 with "You do not have access to this care plan" |
| Plan does not exist | 404 with "That care plan does not exist" |
| Future date requested | "That day has not happened yet" |
| Server error | "Something went wrong on our side. Please try again." with a retry button |
| Offline | "You appear to be offline. Check your connection and try again." |
| Unknown URL | A real 404 page with a way back |
