# LinkedIn material

## The post (~1,450 characters)

> I set out to build a marketplace for home caregivers in India. The research killed it in
> week one.
>
> The assumption was that families struggle to *find* a caregiver. Then I read the market:
> one provider alone advertises 2,000+ caregivers across 10 cities with a 3-hour allocation
> promise. Local agencies, hospital referral desks, WhatsApp networks — a family gets
> someone within a day.
>
> Nobody in any source I read said they couldn't find an attendant.
>
> They said this instead: the attendant vanished without notice. Nobody could tell whether
> the 9pm antibiotic was actually given. When the agency rotated staff, care "effectively
> reset to Day 1."
>
> So the problem isn't discovery. It's that **nothing survives the caregiver changing** —
> and in a workforce that rotates by design, that's the normal case, not the exception.
>
> I rebuilt it as a care record instead of a marketplace. It supplies no caregivers at all.
> It sits on top of whoever the family already hired, and it turns the 30 days after a
> hospital discharge into something the family can actually see.
>
> One decision I'd defend in any interview: **"Could not do it" is a first-class button**,
> with a required one-line reason.
>
> A checklist that only records success produces a perfect record and a useless one.
> "Strip finished, chemist was shut" is a problem a daughter in Bengaluru can fix in ten
> minutes. A blank tick tells her nothing — and teaches the attendant to lie.
>
> What I learned: the person who *generates* the value often isn't the person who *pays*
> for it. The family pays; the attendant supplies every byte of data. Design for the payer
> and you get a beautiful dashboard with nothing in it.
>
> No users yet. Two assumptions still unvalidated, both labelled in the repo. Next six
> weeks are interviews, not features.
>
> Repo: [GITHUB LINK]
> Demo: [DEMO LINK]
>
> #ProductManagement #HealthTech #India #ProductStrategy

---

## Carousel outline (11 slides, 1080×1350)

| # | Slide | Visual |
| --- | --- | --- |
| 1 | **"I built a caregiver marketplace. The research killed it."** | Title, brand green on sand |
| 2 | The brief: discover → evaluate → book → manage caregivers | Four-box flow, greyed out |
| 3 | **Assumption:** finding a caregiver is the hard part | Big statement slide |
| 4 | What the market actually looks like: 2,000+ caregivers, 10 cities, 3-hour allocation — one provider | Bar chart: supply channels vs time-to-find (hours) |
| 5 | What families actually complain about | Horizontal bar chart of complaint themes: quality · continuity · no visibility · refunds |
| 6 | **The reframe:** you can buy a body in the room. You can't buy proof | Quote slide |
| 7 | Segment scoring: A 35 / **B 39** / C 21 — and why A ∩ B wins | Grouped bar chart across the 9 criteria |
| 8 | The five hypotheses and their verdicts (1 rejected, 3 accepted, 1 unproven) | Verdict table |
| 9 | What I built: shift → record → alert → **handover pack** | Product screenshot (attendant screen, phone frame) |
| 10 | The decision I'd defend: "Could not do it" is a button, not a failure | Screenshot of the reason sheet |
| 11 | What's unvalidated, and the 6-week test plan · repo link | Honest-limits slide |

**Chart data available in-repo:** segment scores (`docs/07`), complaint themes
(`docs/00-evidence-index.md` + `docs/01`), test counts (`docs/17`), metric definitions
(`docs/13`).

---

## Notes before posting

- Replace both link placeholders. Do not post with `[GITHUB LINK]` in the text.
- **Claim nothing about traction.** There are no users, no revenue and no retention data.
  The post's credibility rests on the reversal and the honesty, not on numbers.
- If someone asks "did you talk to users?", the answer is no — secondary research only,
  and the interview plan is `docs/14-experiment-plan.md`. Say it plainly; it is the
  strongest possible answer to that question.
