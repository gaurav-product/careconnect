# LinkedIn post

## The post (~1,600 characters)

> I set out to build a marketplace for home caregivers in India. Two weeks of research
> talked me out of it.
>
> The assumption was that families struggle to *find* a caregiver. Then I looked: one
> provider alone advertises 2,000+ caregivers across 10 cities with a 3-hour allocation
> promise. Agencies, hospital discharge desks, WhatsApp networks — a family gets someone
> within a day.
>
> Nothing I read described a family that couldn't find an attendant.
>
> What they described was afterwards. The attendant vanished without notice. Nobody could
> say whether the 9pm antibiotic was actually given. When the agency rotated staff, care
> "effectively reset to Day 1."
>
> The hard problem wasn't finding a person. It was knowing what happened after the person
> arrived — and keeping that knowledge when they left.
>
> So CareConnect became a post-discharge accountability layer. It supplies no caregivers at
> all. It sits on top of whoever the family already hired and turns the 30 days after a
> hospital discharge into a record the family can actually read.
>
> The decision I'd defend hardest: **"Could not do it" is a first-class button**, with a
> required one-line reason.
>
> A checklist that only records success produces a perfect record and a useless one.
> "Strip finished, chemist was shut" is a problem a daughter in Bengaluru can fix in ten
> minutes. A blank tick tells her nothing — and teaches the attendant to lie.
>
> Then I built it: React + Express, 95 automated checks, two QA passes.
>
> The second pass found the one that mattered. Care entries could be silently rewritten —
> "missed, strip finished" could quietly become "given" before the shift closed. In a
> product whose only asset is a trustworthy record, that made the record unfalsifiable.
> Entries are now append-only; corrections show the earlier value.
>
> I also renamed my own north-star metric. "Verified care days" became "documented care
> days" — because the system cannot verify that a tablet was swallowed. It records what one
> person typed, at a time, under their name. Calling that "verified" claims more than the
> product can do.
>
> What I still don't know: whether attendants will log without supervision, and whether
> families will pay for this unbundled from the caregiving itself. No users yet. Both
> labelled unvalidated in the repo.
>
> Next six weeks are interviews, not features.
>
> Repo: [GITHUB LINK]
> Case study: [CASE STUDY LINK]
>
> #ProductManagement #HealthTech #India #ProductStrategy

---

## Notes before posting

- Replace both link placeholders. Do not post with `[GITHUB LINK]` in the text.
- **Claim nothing about traction.** There are no users, no revenue, no retention data. The
  post's credibility rests on the reversal and the honesty, not on numbers.
- If someone asks "did you talk to users?", the answer is: no, secondary research only, and
  the interview guides are in `docs/19-validation-plan.md`. Say it before they ask — it
  converts the biggest weakness into evidence of judgment.
- If it needs to be shorter, cut the metric-rename paragraph and keep the audit-trail one;
  the concrete defect lands harder with a general audience than the vocabulary argument.
