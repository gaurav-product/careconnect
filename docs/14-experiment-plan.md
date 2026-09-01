# 14 · Experiment plan

The MVP exists to make these experiments cheap, not to substitute for them. They are
ordered by what would kill the product fastest — the cheapest way to be wrong is first.

---

## E1 · Do families actually experience this as a problem?

**Hypothesis** Families of a recently discharged parent, with the adult child living
elsewhere, describe verification and continuity — not finding an attendant — as their main
difficulty.

**User** 10 families whose parent was discharged in the last 30 days and who hired paid
home help. Recruited through orthopaedic and cardiac OPD waiting rooms in two Delhi
hospitals, plus one physiotherapist's referrals.

**Experiment** 30-minute unstructured interviews. No product shown, no leading questions.
Ask them to walk through the last week hour by hour. Count unprompted mentions of: finding
someone, trusting what happened, an attendant change, medicines, and being far away.

**Success metric** ≥ 7 of 10 raise verification or continuity unprompted before they raise
discovery.

**Failure threshold** ≥ 4 of 10 name finding an attendant as their hardest problem → the
original marketplace hypothesis was right and this repositioning is wrong.

**Expected learning** Whether doc 01's reframing survives contact with real families, and
in whose words the problem is actually described.

**Next action** Pass → E2. Fail → return to doc 07 and re-rank; the build is small enough
to be worth abandoning.

**Cost** ~1 week, no engineering.

---

## E2 · Will attendants log without a supervisor? *(the highest-risk test)*

**Hypothesis** An attendant will complete ≥ 80% of shifts with the full checklist recorded,
in under 5 minutes of interaction, with no supervision beyond the family's normal contact.

**User** 5 attendants across 3 families, recruited through one local agency, paid nothing
extra for participating.

**Experiment** 14 days of real use with the built MVP. Instrument shift close rate,
items-recorded ratio, median time in app per shift, and burst-logging (entries clustered
just before close). Interview each attendant on days 3 and 14.

**Success metric** ≥ 80% shift close rate, median under 5 minutes, burst logging under 30%
of shifts.

**Failure threshold** < 50% close rate, or > 50% burst logging → the record is not
trustworthy and the whole product is built on sand.

**Expected learning** Whether the data source holds without coercion; which specific
interactions cost time; whether "could not do" is used honestly or avoided.

**Next action** Pass → E3. Partial → reduce the checklist to critical items only and rerun.
Fail → the product needs a different data source (agency supervisor, family, or device),
which is a different product.

**Cost** ~3 weeks, no new engineering.

---

## E3 · Will a family pay for this, unbundled?

**Hypothesis** Families in the discharge week will pay ₹399/month for a verified record
they can see, separately from what they already pay the attendant.

**User** 40 families reached through hospital discharge desks and physiotherapist
referrals.

**Experiment** A fake-door test, run honestly: a one-page explanation and a real price
page. Choosing a plan reaches a screen that says the product is in a limited pilot, offers
a place on the waitlist, and takes no money. Two price cells — ₹399/month and ₹999 for the
30-day episode — plus a free cell as control.

**Success metric** ≥ 30% of those who read the page reach the price page, and ≥ 30% of
those choose a paid tier.

**Failure threshold** < 10% choose paid while the free tier converts strongly → the value
is real but not purchasable alone; pivot to agency-funded or insurer-funded distribution.

**Expected learning** Whether H5 — the weakest hypothesis in the plan — holds, and which
price frame (monthly versus per-episode) fits how families think about a bounded recovery.

**Next action** Pass → build WhatsApp delivery and run a paid pilot. Fail → E4 becomes the
priority.

**Cost** ~2 weeks. **Ethics note:** no card details are collected and no false claim of
availability is made; the waitlist is real and people on it are contacted.

---

## E4 · Do agencies see this as a threat or a differentiator?

**Hypothesis** Small and mid-sized agencies would offer CareConnect to families as a
selling point, because it makes their good attendants provable.

**User** 5 agency owners with 20–200 attendants, in Delhi NCR.

**Experiment** Structured conversations with a live demo, including deliberately showing
the screen where an agency's attendant missed a critical dose. Ask directly what they
would do if a family showed them that page.

**Success metric** ≥ 3 of 5 say they would pilot it; none say they would discourage
families from using it.

**Failure threshold** ≥ 3 of 5 say they would refuse to let attendants log → the
distribution path through agencies is closed and acquisition must be direct-to-family.

**Expected learning** Whether the conflict of interest identified in doc 04 is fatal or
exploitable, and whether agencies would pay for the workforce view later.

**Next action** Pass → design an agency-referral motion. Fail → double down on hospital and
physiotherapist referral.

**Cost** ~1 week.

---

## E5 · Does the handover pack actually protect continuity?

**Hypothesis** An incoming attendant who receives the handover pack reaches a verified care
day faster than one who does not.

**User** 20 attendant changes observed across pilot families.

**Experiment** Randomise at the change: half get the pack on their first screen, half get
only the outgoing attendant's last note (today's best case). Measure items-recorded ratio
and verified-day rate over the first 72 hours, plus family-reported confidence.

**Success metric** Continuity recovery ratio (doc 13) ≥ 0.9 in the pack group versus a
materially lower figure in the control.

**Failure threshold** No difference → the differentiator is a story, not a mechanism, and
positioning must move to daily visibility alone.

**Expected learning** Whether the strategic claim in doc 08 is mechanically true. This is
the experiment that either validates or destroys the positioning.

**Next action** Pass → make the pack the centre of the marketing and the onboarding. Fail →
re-examine what actually restores continuity; it may be a phone call between the two
attendants that the product should schedule rather than replace.

**Cost** Runs inside the pilot; the randomisation is a flag.

---

## Sequencing and cost

```
E1 (1wk, talk)  ──► E2 (3wk, use)  ──► E3 (2wk, pay)  ──► pilot ──► E5 (in pilot)
                                   └──► E4 (1wk, channel, parallel)
```

**Total to a go/no-go: about six weeks and no new engineering.** The MVP in this repository
is what makes E2 and E5 possible at that price. That is the argument for having stopped
building here: everything upstream of E1 is opinion, and six weeks of conversations would
be worth more than six more weeks of features.
