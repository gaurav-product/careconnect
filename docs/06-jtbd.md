# 06 · Jobs to be done

## The primary job

> **When** my parent comes home from hospital and someone I barely know is now
> responsible for them all day,
> **I want to** know that today's care actually happened and be told immediately when
> something is wrong,
> **so I can** stop interrogating my father and the attendant, and act on real
> information instead of my imagination.

### The forces on this job (Switch framework)

| Force | What it looks like here |
| --- | --- |
| **Push** (the pain of today) | Nobody can answer "was the 9pm antibiotic given?"; the attendant left last week and everything reset; a fever was noticed two days late |
| **Pull** (the promise of the new) | One page that says what happened today, and a message when it did not |
| **Anxiety** (what makes them hesitate) | "Will the attendant actually use it?" · "Will she feel spied on and quit?" · "Is my father's health data safe?" · "Another app in a week I can barely cope with" |
| **Habit** (the incumbent's grip) | WhatsApp works, everyone has it, and the evening phone call feels like care |

**The design consequence:** the anxieties are all about the attendant and about effort,
not about features. That is why onboarding is a five-minute wizard, why the attendant
flow is bilingual and thumb-sized, and why the product ships with warning signs already
filled in for the type of surgery.

## Secondary job — the attendant

> **When** I start a shift with a patient I do not know well,
> **I want to** see exactly what is expected today and record what I actually did,
> **so I can** do the job right and not be blamed for things that were not my fault.

This job is usually ignored, and it is the one the whole data model depends on. It is why
"could not do it" is a first-class button with a reason field rather than a failure
state, and why the last attendant's handover note is the first thing on the screen.

## Third job — whoever comes next

> **When** I take over a patient somebody else was looking after,
> **I want to** know the routine, the medicines, the warning signs and what has already
> gone wrong,
> **so I can** be useful on day one instead of day four.

This is the job that no product in the market currently serves at all (doc 04), and it is
the one that makes CareConnect's data compound rather than depreciate.

## Jobs deliberately not served

| Job | Why not |
| --- | --- |
| "Find me an attendant by tomorrow" | Discovery is not scarce (doc 01); serving it means owning supply, which is what has killed everyone else (doc 02) |
| "Tell me whether this wound is infected" | Clinical judgement. CareConnect escalates to a human; it never interprets |
| "Handle the emergency" | An ambulance is not a software feature. The product says so on the attendant's screen |
| "Help me, the daughter-in-law, cope with doing the caring myself" | A real and severe problem (S7), and a different product |
| "Manage my agency's workforce" | Makes the agency the customer and destroys the record's credibility |

## The job story that decides the interface

> **When** it is 9:40pm, my shift is nearly over, my phone has one bar and the patient
> refused his tablet an hour ago,
> **I want to** record what happened in under a minute in words I can find quickly,
> **so I can** finish and go home.

If the product fails that moment, everything upstream of it is decoration.
