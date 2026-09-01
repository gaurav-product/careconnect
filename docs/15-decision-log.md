# 15 · Decision log

Chronological. The reversals matter more than the choices that went to plan, so they are
marked **↺ REVERSAL** and written up in full.

---

### D-01 ↺ REVERSAL · Reject caregiver discovery as the core problem

- **Decision** Abandon the marketplace concept the project started from.
- **Alternatives** (a) build the marketplace as briefed; (b) build a marketplace with better
  verification; (c) reposition entirely.
- **Evidence** Care24 alone advertises 2,000+ caregivers in ten cities with a three-hour
  allocation promise (S14); national providers, local agencies, hospital referrals and
  WhatsApp networks all produce someone within a day. Across every source read, no family
  described being unable to *find* an attendant — they described what happened afterwards
  (S9, S13, S15, S16).
- **Trade-off** The marketplace is the larger and more obvious business, and it is what the
  brief asked for. Rejecting it means giving up the transaction and the take rate.
- **Choice** (c). CareConnect becomes a post-placement accountability layer.
- **Reason** Building a marketplace would mean competing on supply against companies that
  have burned nine figures doing exactly that, to solve a problem the market has already
  solved. The scarce good is not a person in the room; it is knowing what that person did.

---

### D-02 · Do not own supply, at any point in the MVP

- **Decision** CareConnect never sources, vets, employs, schedules or guarantees a
  caregiver.
- **Alternatives** (a) a small vetted panel for credibility; (b) partner with one agency;
  (c) no supply at all.
- **Evidence** Portea reportedly burned ~USD 93m; Emoha is described in community analysis
  as spending ₹1.5 to earn ₹1; Papa raised USD 242m and shut down over care quality;
  Elcare closed in 2024 when scaling demanded "substantial investment in training,
  infrastructure, and manpower" (C-grade: S11, S12).
- **Trade-off** Without supply we cannot promise a replacement, which is a real family need,
  and we look less complete next to incumbents.
- **Choice** (c).
- **Reason** Every documented failure in this market is an operations failure, not a demand
  failure. Owning supply also creates the conflict that makes the record untrustworthy —
  we would be marking our own homework.

---

### D-03 · Beachhead is the intersection of two segments, not one

- **Decision** Target the adult child living away **who is in the first 30 days after a
  parent's discharge**.
- **Alternatives** (a) Segment A alone — away children generally; (b) Segment B alone —
  post-hospitalisation families; (c) the intersection.
- **Evidence** Scoring in doc 07: A wins on frequency and willingness to pay but has a
  diffuse trigger and a crowded field (S10, S17); B wins on pain, urgency and the absence
  of competitors, but ends.
- **Trade-off** A smaller starting market than either segment alone.
- **Choice** (c).
- **Reason** A wins acquisition, B wins urgency. The intersection is where an unmissable
  trigger meets a person with a smartphone and a budget.

---

### D-04 · Beat WhatsApp on day one, or do not ship

- **Decision** Every P0 feature had to be better than a WhatsApp message for a family in a
  crisis week.
- **Alternatives** (a) match incumbents feature for feature; (b) benchmark against the real
  incumbent, which is WhatsApp.
- **Evidence** Families coordinate care in WhatsApp groups and by phone today (S9); it is
  free, universal and socially normal.
- **Trade-off** Several genuinely good ideas — chat, photo logs, scheduling — were cut.
- **Choice** (b).
- **Reason** A product that is worse than a WhatsApp group in week one never gets to week
  four. In-app chat in particular was cut permanently: fighting WhatsApp for the
  conversation is a fight we lose, and losing it would take the whole product down.

---

### D-05 · The attendant is the primary user of the writing interface

- **Decision** Design the input flow entirely around the attendant, not the family.
- **Alternatives** (a) the family logs what they are told; (b) the elder self-reports; (c)
  the attendant logs.
- **Evidence** The family is not in the room; the elder under-reports and, per app reviews,
  does not adopt (S18); daily reporting is already part of a good attendant's job, done
  verbally (S21).
- **Trade-off** The data source is a worker with no financial stake in the product. If they
  do not log, there is no product (H6, E2).
- **Choice** (c).
- **Reason** Only one of the three is present when care happens.

---

### D-06 ↺ REVERSAL · Both languages at once, replacing a language toggle

- **Decision** Show English and Hindi together on every attendant action, instead of the
  toggle originally designed (and still present in the user record as a `lang` field).
- **Alternatives** (a) toggle; (b) auto-detect from the device; (c) both, always.
- **Evidence** Phones are shared in this context; the family may pick up the attendant's
  phone; reminder apps show poor adoption among Hindi-first users partly because setup
  never happens (S18).
- **Trade-off** More text on a small screen, and a slightly busier interface.
- **Choice** (c).
- **Reason** A toggle assumes one reader per device and requires a setup action from the
  person least invested in setup. Both languages remove a decision and serve every reader
  of that screen.

---

### D-07 · "Could not do it" is a first-class action with a mandatory reason

- **Decision** Every task and dose offers a negative action of equal visual weight, and it
  requires one line of explanation.
- **Alternatives** (a) checkbox only; (b) optional skip; (c) equal-weight negative action
  with a required reason.
- **Evidence** Care fails in ordinary ways — refusals, pain, a finished medicine strip.
  Every source describing what goes wrong describes a *reason*, not a blank (S13, S16).
- **Trade-off** Slower to record a bad day; a small risk that attendants avoid the negative
  action to dodge typing.
- **Choice** (c).
- **Reason** A record of only successes is worthless and dishonest. The reason field is
  where the early warning actually lives.

---

### D-08 · Deterministic thresholds, no model, no "AI"

- **Decision** Alerts come from a readable table of rules.
- **Alternatives** (a) ML risk scoring; (b) an LLM reading the notes; (c) fixed rules.
- **Evidence** No training data exists. Clinical inference is regulated. Trust in an alert
  depends on being able to explain it.
- **Trade-off** Less impressive; will miss patterns a model might catch.
- **Choice** (c).
- **Reason** A wrong threshold is a bug; a wrong inference about a patient is a liability.
  "Why did I get this alert?" must have a one-sentence answer.

---

### D-09 ↺ REVERSAL · Photo evidence cut from P0

- **Decision** No photo capture in the MVP.
- **Alternatives** (a) photos of wounds and meals as proof; (b) photos on red flags only;
  (c) none.
- **Evidence** Poor data connections; images of a person's body carry a much heavier
  consent and storage obligation under DPDP (S20); families already send wound photos to
  doctors on WhatsApp.
- **Trade-off** Loses the most viscerally convincing evidence in the product, and a wound
  photo is genuinely useful clinically.
- **Choice** (c), with (b) as the first P1 item.
- **Reason** It was cut on the removal test — the value proposition survives without it —
  and adding image handling to an unvalidated product buys privacy risk before evidence.

---

### D-10 ↺ REVERSAL · Notification delivery stubbed, and the stub made visible

- **Decision** Compose every WhatsApp/SMS message into a visible outbox; connect nothing.
- **Alternatives** (a) integrate a WhatsApp BSP; (b) claim it works; (c) stub it silently;
  (d) stub it and show the outbox in the product.
- **Evidence** WhatsApp Business messaging needs an account, template approval and a
  billing relationship — none available to a prototype.
- **Trade-off** The product's core promise — "you hear about it the same hour" — is not
  actually delivered.
- **Choice** (d).
- **Reason** (b) is dishonest and (c) hides a limitation from the person evaluating the
  product. Showing the composed messages makes the boundary explicit and makes the value of
  the integration obvious. The attendant-facing copy was rewritten in the same pass to stop
  promising delivery that does not happen.

---

### D-11 · Family must close alerts with a note

- **Decision** No dismiss button; closing requires a sentence.
- **Alternatives** (a) dismiss; (b) acknowledge only; (c) acknowledge, then close with a
  required note.
- **Evidence** Continuity breaks because decisions live in someone's memory or WhatsApp
  (S16, S9).
- **Trade-off** Friction on every alert; some families will resent it.
- **Choice** (c).
- **Reason** The note is the artefact. It is what makes the handover pack worth reading and
  what stops the alert list becoming a tray to be cleared.

---

### D-12 · TypeScript on both ends, SQLite, one process

- **Decision** React + Vite + Express + SQLite, one language, one deployable.
- **Alternatives** (a) FastAPI + Postgres (closer to my usual stack); (b) Next.js +
  Supabase; (c) single-language Node with SQLite.
- **Evidence** The reviewer of this repository must be able to run it with two commands. No
  concurrency requirement exists at prototype scale.
- **Trade-off** Not the stack a production version would use at scale.
- **Choice** (c), with the migration path to Postgres documented in doc 16.
- **Reason** `npm install && npm run seed && npm run dev` is the difference between a
  portfolio project that gets run and one that gets skimmed.

---

### D-13 ↺ REVERSAL · Fixed a timezone bug QA found in the display layer

- **Decision** Format every date explicitly in Asia/Kolkata.
- **Evidence** The dashboard rendered a 24 August discharge as "Sun, 23 Aug" for any viewer
  west of IST, because the formatter used the runtime's local zone.
- **Trade-off** None. This was a defect.
- **Reason** Worth logging because it is the class of bug that quietly destroys trust in a
  record product: a family seeing the wrong day would have no reason to believe anything
  else on the screen. Both the server-side day logic and the client-side formatting now
  have tests.

---

### D-14 ↺ REVERSAL · Added "what the family decided" to the handover pack

- **Decision** The pack carries recently resolved alerts with their resolution notes, not
  just what is still open.
- **Evidence** An end-to-end test walked a red flag from report to resolution and then
  checked the handover pack — and the decision was not there. Resolving an alert made it
  vanish from the artefact that exists to carry decisions forward.
- **Trade-off** A longer pack.
- **Reason** This was the product's central claim failing in its own test: without it, a new
  attendant would re-raise a question the family settled last week. Found by QA, not by
  planning — which is the honest version of the story.

---

### D-15 ↺ REVERSAL · Rate limiting counts failures only

- **Decision** Only failed sign-ins count toward the lockout; a success clears the counter.
- **Evidence** The first implementation counted every attempt, and the test suite locked
  itself out by signing in legitimately several times from one address.
- **Trade-off** Marginally weaker against a distributed attacker who occasionally succeeds.
- **Reason** A family and their attendant sharing a home connection would have locked
  themselves out of a health record during a crisis. The security control was creating the
  worse risk.

---

### D-16 · Stop building and start interviewing

- **Decision** Freeze the feature set at the MVP and put the next six weeks into E1–E5.
- **Alternatives** (a) build WhatsApp delivery and offline mode next; (b) add the care
  circle; (c) stop and test.
- **Evidence** H5 (willingness to pay) and H6 (attendants will log) are both unvalidated,
  and both are existential. Neither is answered by more code.
- **Trade-off** The product stays visibly incomplete.
- **Choice** (c).
- **Reason** Building past an unvalidated existential assumption is the most expensive
  mistake available. The MVP is exactly big enough to run the experiments that would settle
  it.
