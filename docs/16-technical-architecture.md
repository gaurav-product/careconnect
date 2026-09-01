# 16 · Technical architecture

## Shape

```
┌──────────────────────────┐        ┌───────────────────────────────────────┐
│  React 19 + Vite 8 + TS  │        │  Express 5 + TypeScript (tsx)         │
│  Tailwind 3              │  HTTP  │                                       │
│  react-router 7          │ ─────► │  routes/  auth · plans · care · family│
│                          │  JSON  │  services/ record · alerts · events   │
│  role-split UI:          │ cookie │  auth · rateLimit · templates · util  │
│   /plans… family         │        │                    │                  │
│   /duty    attendant     │        │                    ▼                  │
└──────────────────────────┘        │      better-sqlite3 (single file)     │
                                    └───────────────────────────────────────┘
        one process in production: Express serves dist/client and /api
```

## Choices, with the reason and the cost

| Choice | Why | What it costs |
| --- | --- | --- |
| **TypeScript both ends** | One language, shared domain types in `src/shared/types.ts`, no drift between API and UI | Not the Python/FastAPI stack I usually reach for |
| **SQLite via better-sqlite3** | Zero-setup for anyone cloning the repo; synchronous API keeps route handlers linear and readable; a single file is trivially backed up | Single-writer; no managed backups; would move to Postgres before real patients |
| **Express 5** | Async errors propagate to one handler; small enough to read end to end | — |
| **Vite + React 19** | Fast builds, ~318 KB bundle (~94 KB gzipped) | — |
| **Tailwind** | The design system lives in `tailwind.config.js` as named tokens rather than scattered hex values | Verbose class strings |
| **No state library** | A 30-item plan does not need a store; a 40-line `useApi` hook covers loading, empty, error and reload on every screen | Manual refetch after mutations |
| **Zod at every boundary** | One schema produces both the 400 status and the field-level message the UI renders | — |
| **First-party analytics** | No third-party script, no personal data leaving the deployment | No funnel UI; SQL only |

## Data model

Eleven tables, all keyed by `plan_id`, all timestamps stored as ISO-8601 UTC.

`users` · `care_plans` · `plan_members` · `medications` · `care_tasks` · `vital_checks` ·
`red_flags` · `shifts` · `task_logs` · `med_logs` · `vital_logs` · `observations` ·
`alerts` · `handovers` · `notifications` · `analytics_events`

Three invariants do most of the work:

- **`shifts` is unique on (plan, date, slot).** Two attendants cannot own the same slot, so
  "who was responsible" is always answerable.
- **`task_logs` is unique on (shift, task); `med_logs` on (medication, date, time).**
  Re-submitting corrects rather than duplicates — which matters on a flaky connection where
  a user taps twice.
- **Nothing is deleted.** Stopping a medicine sets `active = 0`; ending an attendant sets
  the membership to `ended`. The record can be read as it stood on any past day.

`handovers.snapshot` stores a **full JSON snapshot** at the moment of a change, deliberately
denormalised: the pack a new attendant received must be reproducible even after the plan is
edited later.

## API

Cookie-authenticated JSON. Every plan route resolves the caller's membership and role
before doing anything.

```
POST   /api/auth/register | login | logout        GET/PATCH /api/auth/me
GET    /api/plans                                  POST /api/plans
GET    /api/plans/templates
GET    /api/plans/:id                              PATCH /api/plans/:id
POST   /api/plans/:id/medications                  DELETE /api/plans/:id/medications/:medId
POST   /api/plans/:id/tasks                        DELETE /api/plans/:id/tasks/:taskId
GET    /api/plans/:id/members                      POST /api/plans/:id/members
POST   /api/plans/:id/members/:memberId/end        POST /api/invites/accept
GET    /api/plans/:id/today                        POST /api/plans/:id/shifts
POST   /api/shifts/:id/tasks | meds | vitals | close
POST   /api/plans/:id/observations
GET    /api/plans/:id/days/:date                   GET /api/plans/:id/alerts
POST   /api/alerts/:id/ack                         POST /api/alerts/:id/resolve
GET    /api/plans/:id/handover | handovers
GET    /api/plans/:id/metrics | notifications
POST   /api/events                                 GET /api/health
```

**Authorisation rules**, enforced server-side on every request:

- Only a `family` account can create a plan; attendants join by code.
- Only the `owner` can add or end members and change plan status.
- Only the attendant who owns the **open** shift can record care on it. Family members can
  add observations but cannot record care — the record would be worthless otherwise.
- Only `owner`/`family` can acknowledge or close alerts.
- An unknown plan returns 404; a plan that exists but is not yours returns 403.

## Alert engine

Two halves, both deterministic:

**Event-driven**, evaluated inside the write that causes them — a red flag reported, a
reading outside its band, a dose recorded as not given.

**Time-driven**, evaluated lazily in `sweepPlanAlerts()` whenever a family member loads the
plan: a shift not started by 08:00/20:00, a critical dose unrecorded 90 minutes past its
time.

**The lazy sweep is a known compromise.** In production these belong on a scheduler so an
alert fires whether or not anyone opens the app — which matters most at 2am, when nobody
is looking. The MVP keeps it in-process to stay a single deployable; the fix is a cron
worker calling the same function and is the first thing to build alongside WhatsApp
delivery.

Deduplication is by `(plan, type, source_id)` while an alert is unresolved, so reloading a
page never multiplies alerts. Recording the item that caused a time-driven alert
auto-resolves it.

## Notification outbox

Every alert writes the message a live deployment would push, with channel and recipient,
at status `queued_stub`. Nothing is sent. The family's Insights screen renders the outbox
under a heading that says it is not connected. Wiring a WhatsApp BSP means replacing one
function.

## Security

**Implemented**

- Passwords hashed with bcrypt (cost 10).
- Session as a signed JWT in an **HttpOnly, SameSite=Lax** cookie, `Secure` in production,
  30-day expiry. No token in `localStorage`, so an XSS cannot read the session.
- `JWT_SECRET` is mandatory in production — the server refuses to sign with a dev default.
- Every input validated with Zod; every SQL statement parameterised.
- Membership and role checked on every plan-scoped route.
- Failed-attempt rate limiting on credentials, per IP + number, clearing on success.
- `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`.
- Request body capped at 256 KB.
- Errors never leak stack traces; unhandled errors return a generic message and log server
  side.

**Not implemented, and needed before real patient data**

- No 2FA and no OTP login — a phone-number product in India should use OTP.
- No password reset flow at all.
- No CSRF token. SameSite=Lax plus a JSON-only API covers the common cases, not all.
- No Content-Security-Policy header.
- No audit log of *reads* — who viewed a patient's record and when.
- No encryption at rest; the SQLite file is plaintext on disk.
- Rate limiting is in-process, so it resets on restart and does not span instances.

## Privacy and DPDP posture

Under the DPDP Act 2023 and Rules 2025, health data needs explicit informed consent,
minimisation, breach reporting within 72 hours, and rights of access, correction and
erasure (S20).

**What the MVP does:** collects only what the care plan needs; scopes health data to active
members of one plan; keeps free text out of analytics entirely; states at sign-up what is
stored and who can see it; never sends personal data to a third party.

**What it does not do:** a formal consent record with timestamps and versioned notice; a
data-subject request flow (export and erasure); retention limits and automatic deletion
after an episode; a DPO or DPIA; breach detection and reporting; and — most significantly —
**any consent from the patient themselves**, who is the data subject and not a user
(doc 12, D-10).

## Deployment

**Local**

```bash
npm install
npm run seed        # RESET=1 npm run seed to rebuild
npm run dev         # api on :4000, web on :5173
```

**Production shape**

```bash
npm run build && npm start    # one process, Express serves dist/client and /api
```

Any container host (Render, Fly, Railway) with a persistent volume for the SQLite file, a
`JWT_SECRET`, and TLS terminated at the edge. Migration to Postgres is a driver swap plus a
migration runner; the schema is already portable SQL and the query layer is small.

## Testing

61 automated tests: unit tests for the pure logic (IST day boundaries, shift slots, vital
thresholds, the verified-care-day definition, display formatting), integration tests
against the real API and a throwaway database, and 24 Playwright journeys across a mobile
and a desktop viewport. Doc 17 has the detail.
