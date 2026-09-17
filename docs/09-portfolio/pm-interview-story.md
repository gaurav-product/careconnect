# The PM interview story

How to talk about CareConnect in an interview. The project's strength is not the app — it is
that every claim in it can be traced, attacked, and in several cases was already attacked by
the person who made it.

---

## The 60-second version

> I was asked to build a caregiver marketplace for Indian families. Two weeks of research
> talked me out of it.
>
> The assumption was that families struggle to find a caregiver. But one provider alone
> advertises 2,000+ caregivers across ten cities with a three-hour allocation promise;
> another publishes a 24-hour replacement guarantee. Between agencies, hospital discharge
> desks and WhatsApp networks, a family gets someone within a day. Nothing I read described
> a family that couldn't find an attendant.
>
> What they described was afterwards. The attendant vanished without notice. Nobody could
> say whether the 9pm antibiotic was given. When the agency rotated staff, care
> "effectively reset to Day 1."
>
> So the hard problem wasn't finding a person — it was knowing what happened after the
> person arrived, and keeping that knowledge when they left. I rebuilt it as a
> post-discharge accountability record that supplies no caregivers at all, built the MVP,
> and then spent two iterations auditing my own work. I have no users yet, and the two
> assumptions the product rests on are labelled unvalidated in the repo.

**Then stop.** The interviewer picks the thread.

---

## The five decisions to have ready

### 1 · Marketplace → accountability layer

**The move:** rejected the brief.
**Why:** discovery is served; the scarce good is knowing what the person did. And every
visible failure in this market — Portea's reported ~$93m burn, Papa's shutdown, Elcare's
2024 closure — was an operations failure from owning human supply, not a demand failure.
**The honest caveat, volunteered:** that's an inference from four unverified cases, and
"no source described a family who couldn't find someone" is absence of evidence, not
evidence of absence. So I wrote the falsifier into the doc: if four of ten discharge
interviews name *finding* an attendant as their hardest problem, I'm wrong.

### 2 · Verified → documented ↺

**The move:** renamed my own north-star metric to something less impressive.
**Why:** the system verifies nothing. It records what one person typed, at a time, under
their name. Calling that "verified" claims a check nobody performed.
**The part that makes it a product decision, not a vocabulary one:** naming it honestly
changed the roadmap. Chasing "verified" fills a product with proof mechanisms — photos,
geofencing, timestamps the worker can't control — most of which turn it into surveillance
and break the data source the whole thing depends on.

### 3 · Mutable → append-only ↺

**The move:** found and fixed a defect in my own data model.
**Why:** task and dose entries were an upsert with no history. An attendant could record
*"missed — strip finished"* and change it to *"given"* before closing the shift, invisibly.
**The line to use:** in a product whose only asset is a trustworthy record, that made the
record unfalsifiable. Corrections now keep the previous status and its reason, with the time
and author, shown to the family.
**And the counterweight:** I did *not* add a mandatory "why are you correcting this?" prompt.
The attendant is the constrained user — a cheap phone, one hand free. Charging them a
paragraph for fixing a mis-tap trains them not to fix it.

### 4 · Surveillance → documentation

**The move:** excluded GPS, geofencing, camera, microphone and facial recognition by policy,
not by omission.
**Why:** the person generating all the data is the one who doesn't pay for the product and
has the least power in the arrangement. A tool they experience as surveillance produces
false data, and no amount of design fixes that.
**What I shipped instead:** a permanent, bilingual statement on the shift screen telling the
attendant exactly what the family can see — what you record, the time, your name, and
nothing else. There is no secret file about a worker in this product.

### 5 · Feature breadth → focused MVP

**The move:** every candidate feature faced one question — remove it, does the core
hypothesis become impossible to test?
**What that cut:** photo evidence (the most viscerally convincing feature, cut for privacy
weight and poor connections), medicine stock, multiple family members, caregiver ratings,
and in-app chat **permanently** — WhatsApp already owns that conversation and fighting for
it is a fight you lose.

---

## Questions they will ask, and how to answer

**"You had no users. Why should I believe any of this?"**
> You shouldn't believe the user insights — check the sources. Everything is graded A–D,
> and three of my own conclusions were downgraded on re-audit. What I'd point to as evidence
> of judgment isn't the research; it's that I stopped building at the point where more code
> couldn't answer the open question, and wrote the interview guides instead.

**"Isn't this just a checklist app?"**
> The checklist is the input. The product is four things a checklist doesn't have: a shift
> boundary so every entry has an owner; a mandatory reason when something didn't happen,
> which is where the early warning lives; an append-only revision trail; and a handover
> artefact that outlives the person who created it. Remove any one and it collapses into a
> checklist — which is why all four are P0.

**"What if attendants just tick everything?"**
> Then the product is worthless, and that's the risk I'd test first. Nothing *prevents*
> fabrication — which is exactly why I renamed the metric. What exists is shift boundaries,
> timestamps, attribution, and an audit trail; what's measured is burst logging and attendant
> time per shift, both as guardrails that can stop the roadmap.

**"Who pays?"**
> The family, and that's the weakest link in the plan. I scored five payers. The agency is
> rejected as first payer — it makes the record belong to the party it might indict. The
> employer elder-care benefit is the fallback if families won't pay unbundled.

**"What would make you kill it?"**
> Two results. Under half of shifts closed in a fourteen-day unsupervised pilot means the
> data source doesn't hold. Under 10% of discharge-week families choosing a paid tier while
> the free tier converts means the value is real but not purchasable alone.

**"What did you get wrong?"**
> Three things, all caught by auditing rather than building. The metric measured the wrong
> risk — it required a near-perfect day, so a household using it consistently with a few
> honest misses scored as a failure. The data model let entries be silently rewritten. And
> 135 pieces of text failed contrast, mostly the Hindi ones, which is exactly backwards for
> the user who most needs them legible.

---

## What not to say

- Don't call the test suite "validation". Say **engineering validated**, and say that
  nothing is user validated.
- Don't quote the market size as if it supports the plan. It's USD 6.4bn and 84% of it is
  labour this product doesn't sell.
- Don't present the pilot as anything but designed. It has not been run.
- Don't say "users told me". No user has said anything.
- Don't defend the weak spots. **Volunteer them first** — saying "I did secondary research
  only, and here's the interview guide I'd run on Monday" before being asked converts the
  biggest weakness into evidence of judgment. Getting caught on it does the reverse.
