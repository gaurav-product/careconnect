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


---

# Iteration 2 — audit, honesty and integrity pass

The second pass added no features. Every decision below came out of auditing what was
already there.

---

### D-17 ↺ REVERSAL · Care entries are append-only; corrections are shown, not hidden

- **Date** Iteration 2, from the technical audit.
- **Problem** Task and dose entries used an upsert. An attendant could record *"missed —
  strip finished"*, then change it to *"given"* before closing the shift, and the family
  would see only the final value. In a product whose entire asset is the record, that made
  the record **unfalsifiable**: any inconvenient entry could be quietly cleaned up.
- **Options** (a) leave it — corrections are normal and the last value is the truth;
  (b) forbid corrections once saved; (c) allow corrections and keep every earlier value.
- **Evidence** No external evidence needed. It is a property of the data model, and it
  contradicts the product's own promise (doc 08, principle 1).
- **Trade-off** (b) would have been simpler and much worse: an attendant who taps the
  wrong button on a small screen must be able to fix it, and a product that punishes
  correction produces avoidance. (c) costs one extra table and one extra section on the
  family's day screen.
- **Decision** (c). Every change to an existing entry appends to `care_log_revisions`, and
  the family's day record shows *previous → new* with the time and who made it.
- **Result** Implemented with five tests. The demo seeds a realistic correction — dinner
  recorded as refused, then changed to done when the patient ate late.
- **Revisit if** attendants report that visible corrections feel punitive (asked directly
  in doc 19, A2). The mitigation would be framing, not deletion.

---

### D-18 ↺ REVERSAL · "Verified care days" renamed to "documented care days"

- **Date** Iteration 2, from the evidence audit.
- **Problem** The north-star metric claimed more than the system can do. Nothing in
  CareConnect verifies that care happened; it records what one person typed.
- **Options** (a) keep the word and define it carefully in the docs; (b) build real
  verification — photos, geofencing, device readings; (c) rename to what it is.
- **Evidence** The definition itself. Also doc 15 D-05: any proof mechanism strong enough
  to justify "verified" pushes the product toward surveillance and threatens the data
  source.
- **Trade-off** "Verified" is a better word commercially. "Documented" is the true one.
- **Decision** (c), across the code, the API, the interface and every document — plus a
  card in the product explaining the difference to the family, and a written statement of
  what would let us honestly use "verified" later (a second independent signal).
- **Result** Renamed everywhere; the E2E suite asserts the product never says "verified".
- **Revisit if** a second independent signal exists for the same event.

---

### D-19 · Told the attendant exactly what the family can see

- **Date** Iteration 2, from the privacy and safety review.
- **Problem** The product asks a worker to generate a record about their own performance,
  which their employer's customer reads. Nothing on screen told them what was visible.
- **Options** (a) say nothing; (b) a privacy policy link; (c) a permanent, plain-language,
  bilingual statement on the shift screen.
- **Evidence** **ASSUMPTION (C13)** that unexplained logging reads as surveillance — named
  in the claim register as unvalidated, and asked directly in the attendant interview
  guide.
- **Trade-off** More text on a small screen.
- **Decision** (c): *what you record, the time, your name — no location, no camera, no
  microphone*, in English and Hindi, plus links to the full care plan so nothing about the
  patient is withheld from them either.
- **Result** Shipped. Also settled a related question: attendants can read the plan's alert
  history. **There is no secret file about a worker in this product.**

---

### D-20 · Failed saves stay on screen instead of a toast

- **Date** Iteration 2, from the accessibility review.
- **Problem** A failed entry showed a toast that vanished in 4.5 seconds. On a patchy
  connection the attendant looks away, the toast dies, and they believe it saved.
- **Options** (a) retry automatically; (b) queue offline; (c) a persistent banner until the
  next successful action.
- **Evidence** Poor connectivity is a stated design constraint (doc 05). Silent data loss
  is the worst possible failure for a record product.
- **Trade-off** (b) is the right long-term answer and is real work — a local queue, conflict
  rules, and a sync state to explain. It stays P1.
- **Decision** (c) now, (b) next: a bilingual banner that says the entry did not save,
  nothing was recorded, and to tap again when the signal returns.

---

### D-21 · Accessibility held to a measured bar, not an assertion

- **Date** Iteration 2.
- **Problem** Iteration 1 claimed "best-effort accessibility" with nothing measuring it.
- **Options** (a) keep asserting; (b) run a third-party audit tool; (c) write a small audit
  that checks the real pages and fails the build.
- **Decision** (c) — `npm run audit:a11y` computes contrast against the actually painted
  background for every text node, checks touch targets (44px on a phone, WCAG 2.1 AA's 24px
  on pointer screens), labelled controls, alt text, heading structure and landmarks, across
  seven signed-in pages.
- **Result** **145 issues on the first run, 0 after fixes.** The largest was secondary text
  at 4.40:1 — including every Hindi sub-label on the attendant screen, i.e. the users least
  able to absorb low contrast. Palette tokens changed; the claim is now measured.
- **Revisit** Still no testing with an actual assistive-technology user. That remains a
  stated gap, not a solved problem.

---

### D-22 · Downgraded three of my own conclusions

- **Date** Iteration 2, from the evidence audit.
- **Problem** Three claims were stated more strongly than the evidence carried: *"every
  well-funded attempt failed"* (four unverified cases), *"the only player that owns the
  record"* (a desk review, not a census), and *"no family described being unable to find an
  attendant"* (absence of evidence in sources that structurally exclude such families).
- **Options** (a) leave them — they are directionally right and read better; (b) qualify
  them in place.
- **Decision** (b), plus a claim register in doc 00 that grades all thirteen load-bearing
  conclusions and records which were downgraded and why.
- **Reason** The strategy does not actually need the stronger versions. It needs "owning
  supply has repeatedly proved capital-hungry, so a one-person project should not start
  there", which is defensible. Overstating it would hand an interviewer a free hit on the
  one thing this project is selling: that the reasoning can be trusted.


---

# Iteration 3 — MVP scope and validation readiness

---

### D-23 ↺ REVERSAL · Split the north star into "documented" and "complete" days

- **Date** Iteration 3, from re-reading the MVP objective.
- **Problem** The north star required a near-perfect day: every critical item recorded, ≥80%
  of the day recorded, no urgent alert open. But the MVP exists to answer *"will they keep a
  shared record at all?"* — and that metric would score a household that recorded something
  every day for two weeks, with a few honest misses, as an almost total failure.
- **Options** (a) keep the strict definition; (b) lower it to "≥1 care record for the day";
  (c) measure both, separately.
- **Evidence** No new external evidence — this is a definitional error caught by comparing
  the metric against the question it is supposed to answer. The first risk in this product
  is abandonment, not imperfection, and the metric was pointed at the wrong one.
- **Trade-off** A low bar looks unimpressive and can be gamed by a single entry a day. The
  guardrails (burst logging, attendant time, late-entry clustering) are what stop that, and
  "complete care days" now carries the quality signal that was lost.
- **Decision** (c). **Documented care days** is the north star; **complete care days** is
  the quality measure. The family's week strip went from two states to three — grey for
  nothing recorded, amber for recorded-with-something-important-missed, green for complete —
  because the amber case is the most actionable one and the old binary hid it.
- **Result** Implemented across the API, the interface and the docs, with unit tests for
  both definitions.
- **Revisit if** the pilot shows households hitting "documented" every day with a single
  token entry. That would mean the low bar is being gamed and the guardrails are not
  catching it.

---

### D-24 · Corrections do not ask the attendant "why"

- **Date** Iteration 3, from re-reading the data-model spec.
- **Problem** The revision model could carry an explicit *reason for the correction*,
  separate from the entry's own reason. Should changing an entry prompt for one?
- **Options** (a) require a reason on every correction; (b) optional field; (c) none — rely
  on the previous and new reason already stored.
- **Trade-off** (a) gives the cleanest audit trail and taxes the one user who has no stake
  in the product. The attendant is already the constrained user — a cheap phone, one hand
  free, five minutes total — and a correction is most often a mis-tap on a small screen.
  Charging them a paragraph for fixing a mis-tap trains them not to fix it, which is worse
  for the record than the missing metadata.
- **Decision** (c). The revision already stores the previous status **and its reason**
  alongside the new status and its reason, with the time and the author. For a
  status-changing correction the entry's own required reason supplies the explanation.
- **Reason** The audit need is met without adding friction to the data source the whole
  product depends on. **Revisit if** the pilot shows corrections that a family cannot make
  sense of from the previous/new pair alone.

---

### D-25 · Documentation reorganised, not expanded

- **Date** Iteration 3.
- **Problem** 24 flat numbered files in one folder reads as heavy, and a hiring manager
  opening the repo cannot tell where to start.
- **Options** (a) leave it; (b) delete the research docs to look leaner; (c) group into
  folders with an index.
- **Decision** (c). `research/`, `product/`, `decisions/`, `metrics/`, `validation/`,
  `engineering/`, `portfolio/`, with `docs/README.md` as the front door. **No document was
  deleted and no new analysis was written** — the only additions are the three operational
  pilot files, which are instruments rather than analysis.
- **Reason** (b) was tempting and wrong: the research *is* the case study's evidence base.
  The problem was navigability, not volume.


---

# Iteration 4 — final delivery

---

### D-26 · Documentation consistency is checked by a script, not by memory

- **Date** Iteration 4.
- **Problem** Facts that appear in many places — the test counts, the abandoned "verified"
  vocabulary, the screenshot count, every internal link — drift as the project changes. A
  portfolio repository fails the moment a reader finds two documents disagreeing, and the
  author is the last person to notice.
- **Options** (a) re-read everything before each delivery; (b) quote numbers in one place
  and link to it; (c) a script that fails when the repository contradicts itself.
- **Decision** (c), wired into `npm run verify`. It checks banned vocabulary ("verified care
  days", "DPDP-compliant", "HIPAA", "clinically validated") against a rule that allows a line
  only when it is *recording* the reversal; compares every quoted count against what the
  suite and the folders actually contain; resolves every internal link across all 34
  documents; and greps the app source for any claim to *verify* care.
- **Result** **21 real inconsistencies on the first run** — seven documents with stale test
  counts after the suite grew, seven broken folder links from the docs restructure, and a
  screenshot path left behind by a folder move that had silently split the evidence set in
  two. All fixed; the audit is now part of the definition of done.
- **Reason** (b) would have been cleaner engineering and worse writing — the numbers belong
  in the sentences that use them. Checking is cheaper than centralising.

---

### D-27 · Repository restructured to match how it will be read

- **Date** Iteration 4.
- **Problem** `src/` and a flat docs folder were fine for building and wrong for reading. A
  recruiter opening the repository could not tell where the product story started.
- **Decision** Application code to `app/`; documentation into `00-overview` … `10-evidence`,
  ordered the way the story is told rather than the way the files were written; screenshots
  into `10-evidence/` beside a note on what they do and do not prove; a CI workflow that
  runs the whole verification on every push.
- **Trade-off** Churn with no functional gain, and a real risk of silently breaking imports
  and links — which is why the full suite and the link audit were run immediately after.
- **What was NOT done** No document was deleted and no new analysis was written. The three
  documents added in this pass — product overview, glossary, PM interview story — exist
  because a reader needs an entry point, a vocabulary and a way to talk about the work, not
  to raise the file count.
