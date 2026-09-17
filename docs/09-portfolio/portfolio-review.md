# Portfolio review

Written by putting on the least generous hat available: an APM hiring manager with forty
portfolios to get through, who has seen a hundred "I built an app" projects and is looking
for a reason to stop reading.

## Scores

| Dimension | Score | Reasoning |
| --- | --- | --- |
| **Problem selection** | 8/10 | A real, large, underserved problem with a sharp trigger, and — crucially — one the candidate arrived at by rejecting the brief rather than accepting it. Loses points because the problem was still selected from a desk, not from a person. |
| **User understanding** | 6/10 | The two-sided read is genuinely good: designing for the attendant as the primary writing user is the insight most people miss. But every persona is a composite from secondary sources. There is no moment in this project where a real user surprised the candidate — and that is what user understanding usually means. |
| **Research rigor** | 8/10 | Graded sources, a claim register that downgrades three of the author's own conclusions, vendor marketing never quoted as data, and a written falsifier for the central claim. Strong for secondary research. Capped because secondary research is the ceiling here. |
| **Competitive thinking** | 8/10 | Three layers with the offline default treated as the real competitor; "why they win" analysed from their own pages; the free adjacent product engaged with rather than dismissed; two brief-named companies reported as not found rather than padded. |
| **Product strategy** | 8/10 | "Own the record, not the supply" is a clear, defensible, falsifiable thesis with an explicit rejection of the obvious alternative and a payer analysis that names the weakest link. |
| **Prioritization** | 9/10 | The removal test is applied ruthlessly and the cuts are documented with reasons — including a permanent non-goal (in-app chat) argued from competitive reality. Cutting photo evidence, the most persuasive feature, takes discipline. |
| **UX** | 8/10 | Two genuinely different interfaces for two genuinely different contexts; bilingual by default rather than by toggle; "could not do it" as a first-class action; measured accessibility rather than asserted. Untested with a real user, which is the ceiling. |
| **Technical understanding** | 8/10 | Working full-stack MVP with role-scoped authorisation, an append-only audit trail, correct IST handling and 142 automated checks. Architecture choices are justified by constraints and their costs are named. |
| **Metrics** | 9/10 | The north-star rename from "verified" to "documented" is the strongest single artefact in the project: it is a candidate reducing their own product's claim because the claim was not true. Guardrails are aimed at dishonest use rather than low usage. |
| **Experimentation** | 7/10 | Well-designed experiments with pre-registered thresholds, ethical guardrails, and an honest statement that 20 handovers cannot produce significance. Scores 7 and not 9 because **none has been run**. |
| **Execution** | 9/10 | Research through to a working, tested, documented product with two full iterations, in a scope one person can defend line by line. |
| **Communication** | 9/10 | The docs are readable, the reasoning is followable, and the case study leads with the reversal instead of the feature list. |
| **Honesty / credibility** | 10/10 | Zero fabricated evidence. Limitations are in the product interface, not just the appendix. The candidate downgraded their own claims on re-audit and renamed their own metric to something less impressive. This is rare. |

**Overall: 8.2 / 10 — strong portfolio piece. Would interview.**

The score is dragged down by exactly one thing, and it is the same thing everywhere: no
contact with a real user. The score is held up by something rarer than research: the
project is *auditable*. Every claim can be traced, attacked, and in several cases has
already been attacked by the author.

## Top 5 strengths

1. **It rejects its own brief, with evidence and a written falsifier.** Most portfolios
   execute the prompt. This one investigates it, kills it, and records the conditions under
   which the rejection would be wrong.
2. **The metric rename.** Going from "verified care days" to "documented care days" — and
   explaining in the product why the first word was a claim the system cannot support — is
   the single most credible thing in the repository.
3. **The unpaid user is the design centre.** Recognising that the attendant supplies all the
   value while the family pays, and letting that determine the interface, the metric
   guardrails and the roadmap, is senior-level thinking.
4. **QA that changes the product, not just the code.** The handover pack losing resolved
   decisions, and care entries being silently rewritable, were both strategic defects found
   by walking the journey and auditing the data model.
5. **Documented uncertainty as a feature.** The notification outbox is displayed inside the
   product precisely because delivery does not work.

## Top 5 weaknesses

1. **No primary research.** Every user insight is second-hand. The guides are written and
   unused, which is better than nothing and is not the same as evidence.
2. **The two existential hypotheses are untested.** Attendant adoption and willingness to
   pay. Both could be answered in six weeks; neither has been.
3. **The core promise is not fully delivered.** "You hear about problems the same hour"
   depends on WhatsApp delivery that is stubbed and on time-based checks that only run when
   someone opens the app. It is disclosed everywhere, which is honest — but a hiring manager
   will still note that the headline value is incomplete.
4. **The market sizing is a chain of assumptions.** Two of the four multipliers have no
   source. It is labelled as such, but it cannot support a real investment argument.
5. **The patient never consents.** An elderly person is the subject of a record kept about
   them by paid staff at their children's request, and the product has no answer. It is
   named as unfinished business rather than solved.

## Top 5 interviewer questions, and the answers I would give

**Q1. "You had no users. Why should I believe any of this?"**
> You shouldn't believe the user insights — believe the reasoning and check the sources.
> Every claim is graded A–D, three of my own conclusions were downgraded on re-audit, and
> the two assumptions the product rests on are labelled unvalidated in the README, the case
> study and the interface. What I'd point to as evidence of judgment isn't the research;
> it's that I stopped building at the point where more code couldn't answer the open
> questions, and wrote the interview guides instead.

**Q2. "Isn't this just a checklist app?"**
> The checklist is the input, not the product. The product is four things a checklist
> doesn't have: a shift boundary so every entry has an owner; a mandatory reason when
> something didn't happen, which is where the early warning actually lives; an append-only
> revision trail so an entry can't be quietly rewritten; and a handover artefact that
> outlives the person who created it. Take any one away and it collapses into a checklist —
> which is why all four are P0.

**Q3. "What if attendants just tick everything?"**
> Then the product is worthless, and that's the risk I'd test first. Three things push
> against it: "could not do it" is an equal-weight button rather than a failure state; the
> reason field is short and in their own language; and burst logging is a guardrail metric
> that can stop the roadmap. But I want to be precise — nothing prevents fabrication, which
> is exactly why I renamed the metric from verified to documented. The product claims
> attribution and an audit trail. It does not claim truth.

**Q4. "Why wouldn't Portea or Antara just build this?"**
> They could build it in a quarter. The bet is that they can't build it *credibly*, because
> a supplier's record of its own performance is the document a worried family has least
> reason to trust — and because their commercial incentive is utilisation, which means
> rotating staff, which is the thing that breaks continuity in the first place. I'd call
> that a positioning bet, not a moat, and I'd say so on the slide.

**Q5. "What would make you kill this?"**
> Two results. If under half of shifts get closed in a fourteen-day unsupervised pilot, the
> data source doesn't hold and the product has nothing to stand on. And if under 10% of
> discharge-week families choose a paid tier while the free tier converts well, then the
> value is real but not purchasable unbundled — at which point I'd move to the employer
> benefit channel, not the agency channel, because selling to agencies destroys the one
> thing that makes the record believable.

## Biggest credibility risk

**Being read as a project that "did research" when it did desk research.**

The mitigation is already in place — the grading, the claim register, the unvalidated
labels — but the risk is presentational. In an interview, the first sentence about research
should be *"I did secondary research only, and here's the interview guide I'd run on
Monday"*, said before anyone asks. Volunteering the limitation converts the biggest
weakness into evidence of judgment; being caught on it does the reverse.

## Most important improvement

**Run E0 and E1 — ten family interviews and a five-attendant pilot.**

Nothing else moves any score. It would take Research rigor from 8 to 9, User understanding
from 6 to 9, and Experimentation from 7 to 9 — and it would turn the honest line "I have no
users" into "here is what five attendants actually did with it for two weeks", which is a
different conversation entirely.

Everything needed to run it exists: the product works, the guides are written, the
thresholds are pre-registered, and the events are already instrumented.
