# 11 · Information architecture

## Two apps in one URL space

The family and the attendant do not share an interface, because they do not share a
context. One is reading on a laptop between meetings; the other is standing in a bedroom
with wet hands. The router sends each role to its own home.

```
/                       → redirects by role
/login  /register  /join

FAMILY
/plans                  the episodes this person owns
/plans/new              3-step setup wizard
/p/:planId              TODAY          ← home
/p/:planId/day/:date    one day, in full
/p/:planId/plan         the care plan (edit medicines and routine)
/p/:planId/team         attendants, invites, endings, handover history
/p/:planId/handover     the handover pack (printable)
/p/:planId/insights     measurement definitions computed over this episode

ATTENDANT
/duty                   TODAY — the whole app
/p/:planId/handover     read-only, reached as "Full care plan"
/p/:planId/plan         read-only, reached as "Medicines list"
```

## The family's information hierarchy

Ordered by what a frightened person needs first, not by data structure:

1. **Is someone with my parent right now?** — one line, top of the screen.
2. **Is anything wrong?** — open alerts, urgent first, each with the action that closes it.
3. **Did today go well?** — recorded-of-expected, with the next doses due.
4. **Is the week trending well?** — a seven-day strip where a day is one dot.
5. Everything else lives behind the tabs.

A deliberate omission: **there is no chart of vitals on the home screen.** A trend line
invites the family to interpret clinical data, which is precisely what principle 4 says
the product must not encourage. Readings appear in the day record and in the handover, in
context, with out-of-range clearly marked.

## The attendant's information hierarchy

One screen, no navigation, ordered by the shift itself:

1. **Emergency call** — always reachable, never buried.
2. **The plan and the medicine list** — readable at any time, especially on day one.
3. **The last handover note** — the first thing before starting.
4. **Start shift** — nothing is recorded until this happens, and the screen says so.
5. **Medicines → tasks → readings** — the actual order of a round.
6. **Report a problem** — visually distinct, in a warm-red card.
7. **End shift** — sticky at the bottom with a live count of what is unrecorded.

## The data model, in the family's language

```
Care plan  (one recovery episode: the patient, the procedure, 30 days)
  ├── Members         owner · family · attendant   (invite, active, ended)
  ├── Medicines       name, dose, times, must-not-miss
  ├── Care tasks      title EN + HI, window, important?
  ├── Readings        type, times, normal band
  ├── Warning signs   label EN + HI, urgent | watch
  ├── Shifts          date + slot + who, opened, closed, handover note
  │     ├── Task entries      done | could not | not needed  (+ reason)
  │     ├── Medicine entries  given | not given | refused | held  (+ reason)
  │     └── Readings          value(s), out-of-range flag
  ├── Observations    red flag or free text, from attendant or family
  ├── Alerts          type, severity, open → acknowledged → resolved (+ note)
  ├── Notifications   the message that would have been sent (stub)
  └── Handovers       a full snapshot, written whenever a member ends
```

Two structural choices carry most of the product's meaning:

- **The shift owns the entries.** Not the day, not the person — the shift. That is what
  makes "who was on duty when this was missed" answerable, and it is why closing a shift
  is a real state change rather than a UI convenience.
- **Nothing is deleted.** Stopping a medicine deactivates it; ending an attendant ends a
  membership. The record can always be read as it stood on any day, which is the entire
  promise.

## Naming

The interface uses the words families use, not the words the schema uses.

| In the code | On the screen |
| --- | --- |
| care_plan | "care plan" · "the plan" |
| plan_member (attendant) | "attendant" — never "caregiver", "resource" or "user" |
| task_log status `missed` | "could not do" for the attendant; "missed" in the family's record |
| alert severity `urgent` / `watch` | "Needs a decision" / "Worth a look" |
| verified care day | "verified day", always defined on the same screen it appears |
| handover | "handover pack" |

The alert severities are the clearest example of writing for the reader: `urgent` is
accurate for a rules engine and useless to a daughter at 11pm, because it does not say
what to do. "Needs a decision" does.
