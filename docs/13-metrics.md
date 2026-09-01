# 13 · Metrics

**Nothing in this document is a result.** These are measurement definitions and target
thresholds for a product that has never been used by a real family. The Insights screen in
the app computes them over the seeded demo episode so that the definitions are executable
rather than aspirational — and it says so on the screen.

## North Star Metric

> **Verified care days per active patient per week.**

A day is **verified** when all three hold:

1. Every must-not-miss medicine and every important task for that day was recorded — none
   left blank, none missed.
2. At least 80% of everything expected that day was recorded.
3. No urgent alert from that day was left open.

### Why this one

- **It measures delivered value, not usage.** Sessions, logins and screen time measure our
  convenience. A verified day is the family's actual outcome: *today, care demonstrably
  happened and nothing dangerous is outstanding.*
- **It cannot be gamed by one side alone.** It needs the attendant to log, the plan to be
  real, and the family to close what they were alerted about. Any one party going quiet
  moves the number.
- **It survives the attendant changing** — the point of the product — because it is
  measured per patient, not per caregiver.

### Why the 80% floor and not 100%

Real care is not complete. A patient refuses a bath; a physiotherapy set is skipped
because the leg hurts. Demanding 100% would either punish honest recording or push
attendants to tick everything, destroying the data. The critical items are the hard gate;
the rest is a completeness floor.

**Target:** ≥ 5 verified days in every 7, from day 3 of an episode onward. **Not yet
validated.**

## Activation

> **The family sees their first complete daily record within 48 hours of creating the plan.**

Activation is not sign-up and not plan creation — it is the first time the promise is
actually delivered. It requires the full chain to work: plan created → attendant invited →
code redeemed → shift started → shift closed → family opens the day.

**Target:** ≥ 60% of created plans activate within 48 hours. **Not yet validated.**

**Leading sub-metrics** (each is a place the chain breaks, and each has its own fix):

| Step | Event | Why it would fail |
| --- | --- | --- |
| Plan created | `care_plan_created` | Setup too long, or attempted without the discharge sheet |
| Attendant invited | `attendant_invited` | Family postpones, or has not hired anyone yet |
| Code redeemed | `invite_accepted` | Attendant cannot or will not sign up — **the most likely break** |
| First shift closed | `shift_closed` | Logging feels pointless or too slow |
| Family opens the day | `day_record_viewed` | Nothing prompted them; delivery is not connected |

## Engagement

The two behaviours that matter, one per side:

| Metric | Definition | Target |
| --- | --- | --- |
| **Shift close rate** | Shifts properly closed ÷ shifts started | ≥ 85% |
| **Family read days** | Days per week the family opens the record or an alert | ≥ 4 of 7 |
| Handover note rate | Closed shifts carrying a note for the next person | ≥ 60% |
| Reason completeness | Not-done entries with a usable reason (the field is mandatory, so this measures *quality*, sampled manually) | ≥ 80% |

All **not yet validated**.

## Retention

A 30-day episode has a built-in end, so retention has to be defined in two horizons:

- **Within-episode:** the share of plans still recording on day 21. **Target ≥ 50%.** This
  is the honest test of whether the habit holds after the initial fear fades.
- **Across-episode:** the share of families who convert to ongoing care after day 30, or
  who return within twelve months for another episode. **Target ≥ 20% within 12 months.**

**Why they would return:** the record is where the medicines, the routine and every
decision already live. Starting again elsewhere means retyping the discharge sheet.

## Quality

| Metric | Definition | Target |
| --- | --- | --- |
| **Missed critical items per episode** | Must-not-miss medicines or important tasks recorded as missed | Tracked, not targeted — a lower number may mean better care *or* worse honesty |
| **Median time to acknowledge an urgent alert** | Alert raised → family acknowledges | < 60 minutes while delivery is stubbed; < 15 minutes once WhatsApp is live |
| **Alert resolution rate** | Alerts closed with a note ÷ alerts raised | ≥ 90% within 24 hours |
| **Handover completeness** | Attendant changes where a pack was generated and opened by the incoming attendant | ≥ 80% |
| **Continuity recovery** | Verified-day rate in the 3 days after an attendant change ÷ the 3 days before | ≥ 0.9 |

That last one is the direct measure of the differentiator, and the metric I would defend
hardest in a review: it asks whether the handover pack actually protects care quality
across a change, which is the entire strategic claim.

## Guardrails — the metrics that say "stop"

| Guardrail | Threshold | What it would mean |
| --- | --- | --- |
| **Attendant time per shift** | median > 5 minutes | We are taxing an unpaid data source; the model breaks |
| **Burst logging** | > 30% of shifts where all entries land within 5 minutes of close | Recording after the fact from memory, or fabricating — the record's credibility is gone |
| **False-alert rate** | > 20% of urgent alerts closed with "nothing was wrong" | Alert fatigue; families stop reading |
| **Alert volume** | > 3 alerts per family per day sustained | Same, from the other direction |
| **Attendant churn after adoption** | attendants leaving plans faster than a matched baseline | The tool is being experienced as surveillance |
| **Blank-reason rate** | reasons under 5 characters trending up | Compliance without communication; the field has become a toll |

The first two exist because the biggest risk in this product is not that people ignore it.
It is that they use it dishonestly, which would produce a beautiful dashboard describing
care that never happened.

## Instrumentation

Events are written first-party into the same SQLite database — no third-party analytics,
nothing leaving the deployment. Every event carries a name, a user id, a plan id, a role,
and low-cardinality properties only. **No patient names, no notes, no readings, no free
text ever enter analytics.**

`account_created` · `signed_in` · `care_plan_created` · `care_plan_setup_completed` ·
`medication_added` · `medication_stopped` · `task_added` · `attendant_invited` ·
`invite_accepted` · `shift_started` · `task_logged` · `medication_logged` · `vital_logged`
· `observation_reported` · `shift_closed` · `alert_acknowledged` · `alert_resolved` ·
`day_record_viewed` · `handover_pack_viewed` · `attendant_ended` · `care_plan_status_changed`

Client-side events post to `/api/events`; server-side events are written inline with the
action so a failed analytics write can never break a care action.

## What the demo numbers are

The Insights screen shows real computations over **seeded fictional data**: nine days of a
fabricated episode including a deliberate bad day and an attendant replacement. They
demonstrate that the definitions are implementable. **They are not evidence about
anything.** No real family has used this product.
