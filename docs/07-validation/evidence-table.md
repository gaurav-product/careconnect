# Evidence table

The template for writing up the pilot. **Empty, because the pilot has not run.**

Its only job is to keep two things apart that are very easy to blur:

| What happened | What we think it means |
| --- | --- |
| Observable. Someone else running the same pilot would write the same sentence. | Interpretation. Could be wrong. Carries a confidence level. |

Most bad product research fails here — an observation gets written down already wrapped in
its explanation, and the explanation is never tested again.

## The table

| # | Observation (what happened) | Evidence (where it came from) | Interpretation (what we think it means) | Confidence | Product implication |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

**Confidence vocabulary** — use exactly these, and nothing softer:

| Level | Means |
| --- | --- |
| **High** | Seen in every household, consistent across instrumentation and interview |
| **Medium** | Seen in most, or seen in all but only through one kind of evidence |
| **Low** | Seen once, or the evidence is a single person's account |
| **Speculative** | We are guessing at a cause. Flag it and design the next test |

## Worked examples of the standard

These are **illustrations of the writing standard, not findings.** Nothing below happened.

| Observation | Evidence | Interpretation | Confidence | Implication |
| --- | --- | --- | --- | --- |
| *Illustrative:* two of three households had a day with no entries in week two | Instrumentation | Novelty may fade once the acute phase passes | Low — could equally be that the patient improved and there was less to record | Ask about week-two days at close-out before changing anything |
| *Illustrative:* one attendant recorded every item within four minutes of shift close, on nine of eleven shifts | `analytics_events` timestamps | Entries are being made from memory at the end rather than as care happens | Medium | Burst logging is a guardrail breach. Do not "fix" it with nagging — ask her why, at close-out |

Notice what the interpretation column does **not** do in either row: it does not state a
cause as fact, and it does not jump to a feature.

## Rules for filling this in

1. **Write the observation before you know what it means.** If you cannot state it without
   an explanation attached, it is not an observation yet.
2. **n=3 is n=3.** "Two of three families", never "67%".
3. **A quote is verbatim or it is not a quote.**
4. **Anything the researcher helped with is a usability failure**, recorded as one.
5. **Negative results get the same word count as positive ones.** More, if the pilot failed.
6. **No implication may be "add a feature" on Low or Speculative confidence.** The only
   legitimate implication at that level is another question.

## After the table

Update the tracker in [19-validation-plan.md](../07-validation/validation-plan.md). A row moves to
*Validated* or *Invalidated* only when its Evidence column names data that exists. If the
result is genuinely mixed, the verdict is **Inconclusive** — which is a real answer and
should be written as one, not softened into a qualified pass.
