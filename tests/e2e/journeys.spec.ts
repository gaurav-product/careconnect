import { expect, test, type Page } from '@playwright/test';

/**
 * These walk the two real jobs end to end: a family setting up an episode and
 * supervising it, and an attendant recording a shift on a phone.
 */

async function signIn(page: Page, phone: string, password = 'demo1234') {
  await page.goto('/login');
  await page.getByLabel('Mobile number').fill(phone);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.describe('the seeded episode', () => {
  test('a family member sees where the recovery stands and can open any day', async ({ page }) => {
    await signIn(page, '9810012345');
    await expect(page.getByRole('heading', { name: 'Your care plans' })).toBeVisible();
    await page.getByRole('link', { name: /Ramesh Iyer/ }).click();

    await expect(page.getByRole('heading', { name: 'Ramesh Iyer' })).toBeVisible();
    await expect(page.getByText(/Day 9 of 30/)).toBeVisible();
    await expect(page.getByText('Right now')).toBeVisible();

    await page.getByRole('link', { name: 'See the full day' }).click();
    await expect(page.getByRole('heading', { name: /^Day 9/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Medicines' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Who was on duty' })).toBeVisible();
  });

  test('the handover pack is complete enough to hand to a stranger', async ({ page }) => {
    await signIn(page, '9810012345');
    await page.getByRole('link', { name: /Ramesh Iyer/ }).click();
    await page.getByRole('link', { name: 'Handover pack' }).click();
    await expect(page.getByRole('heading', { name: 'Handover pack' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Warning signs/ })).toBeVisible();
    await expect(page.getByText('Rivaroxaban')).toBeVisible();
    await expect(page.getByText(/must not be missed/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'How the last week went' })).toBeVisible();
  });

  test('insights are labelled as definitions, not traction', async ({ page }) => {
    await signIn(page, '9810012345');
    await page.getByRole('link', { name: /Ramesh Iyer/ }).click();
    await page.getByRole('link', { name: 'Insights' }).click();
    await expect(page.getByText(/not evidence of real-world performance/)).toBeVisible();
    await expect(page.getByRole('heading', { name: /North star/ })).toBeVisible();
  });

  test('the attendant lands straight on the shift, not a dashboard', async ({ page }) => {
    await signIn(page, '9810055555');
    await expect(page.getByText('Ramesh Iyer')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Medicines/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Care tasks/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /End shift/ })).toBeVisible();
    // The whole shift screen must fit in a thumb-reachable phone flow: no nested menus.
    await expect(page.getByRole('button', { name: /Report a problem/ })).toBeVisible();
  });
});

test.describe('a family sets up a new episode and an attendant works it', () => {
  test('full journey from discharge to a resolved alert', async ({ browser }) => {
    const stamp = Date.now().toString().slice(-6);
    const familyPhone = `98${stamp.padStart(8, '9')}`.slice(0, 10);
    const attendantPhone = `97${stamp.padStart(8, '9')}`.slice(0, 10);

    const familyCtx = await browser.newContext();
    const family = await familyCtx.newPage();

    // 1. The daughter creates an account on the day of discharge.
    await family.goto('/register');
    await family.getByRole('button', { name: /A family member/ }).click();
    await family.getByLabel('Your name').fill('Test Daughter');
    await family.getByLabel('Mobile number').fill(familyPhone);
    await family.getByLabel('Password').fill('password123');
    await family.getByRole('button', { name: 'Create account' }).click();

    // 2. She sets up the plan from the discharge summary.
    await expect(family.getByRole('heading', { name: /Who is coming home/ })).toBeVisible();
    await family.getByLabel("Patient's name").fill('Test Patient');
    await family.getByLabel('Age').fill('72');
    await family.getByLabel('City they are recovering in').fill('New Delhi');
    await family.getByLabel('Surgery or condition').fill('Left knee replacement');
    await family.getByRole('button', { name: 'Continue' }).click();

    await expect(family.getByRole('heading', { name: /What kind of recovery/ })).toBeVisible();
    await family.getByRole('button', { name: /Hip \/ knee replacement/ }).click();
    await family.getByRole('button', { name: 'Continue' }).click();

    await expect(family.getByRole('heading', { name: /Medicines from the discharge sheet/ })).toBeVisible();
    await family.getByLabel('Medicine', { exact: true }).fill('Rivaroxaban');
    await family.getByLabel('Dose', { exact: true }).fill('10 mg');
    await family.getByLabel('Must not be missed').check();
    await family.getByRole('button', { name: 'Create care plan' }).click();

    // 3. She adds the attendant the agency sent and gets an invite code.
    await expect(family.getByRole('heading', { name: 'Add an attendant' })).toBeVisible();
    await family.getByLabel('Their name').fill('Test Attendant');
    await family.getByRole('button', { name: 'Create invite code' }).click();
    const code = (await family.locator('p.tracking-\\[0\\.3em\\]').first().innerText()).trim();
    expect(code).toHaveLength(6);

    // 4. The attendant joins on her own phone.
    const attCtx = await browser.newContext();
    const attendant = await attCtx.newPage();
    await attendant.goto('/register');
    await attendant.getByRole('button', { name: /An attendant/ }).click();
    await attendant.getByLabel('Your name').fill('Test Attendant');
    await attendant.getByLabel('Mobile number').fill(attendantPhone);
    await attendant.getByLabel('Password').fill('password123');
    await attendant.getByRole('button', { name: 'Create account' }).click();

    await expect(attendant.getByRole('heading', { name: /Join a patient/ })).toBeVisible();
    await attendant.getByLabel(/Invite code/).fill(code);
    await attendant.getByRole('button', { name: /Join/ }).click();

    // 5. She starts the shift and records the round.
    await expect(attendant.getByRole('button', { name: /Start my shift/ })).toBeVisible();
    await attendant.getByRole('button', { name: /Start my shift/ }).click();
    await expect(attendant.getByRole('button', { name: /End shift/ })).toBeVisible();

    const firstDone = attendant.getByRole('button', { name: /^Done/ }).first();
    await firstDone.click();
    await expect(attendant.getByText('done').first()).toBeVisible();

    // Something could not be done — the app insists on a reason.
    await attendant.getByRole('button', { name: /Could not/ }).first().click();
    await expect(attendant.getByRole('dialog')).toBeVisible();
    await attendant.getByRole('button', { name: /Save/ }).click();
    await expect(attendant.getByText(/Please write one line/)).toBeVisible();
    await attendant.getByLabel(/Reason/).fill('He said his knee hurt too much this morning');
    await attendant.getByRole('button', { name: /Save/ }).click();
    await expect(attendant.getByRole('dialog')).toBeHidden();

    // 6. She reports a warning sign, which is the moment the family needs.
    await attendant.getByRole('button', { name: /Report a problem/ }).click();
    await attendant.getByRole('button', { name: /Wound is red/ }).click();
    await attendant.getByLabel(/What did you see/).fill('The stitch line looks red and feels warm.');
    await attendant.getByRole('button', { name: /Tell the family/ }).click();
    await expect(attendant.getByText(/The family has been alerted/)).toBeVisible();

    // 7. The family sees it, and closing it requires saying what was done.
    await family.goto('/plans');
    await family.getByRole('link', { name: /Test Patient/ }).click();
    const redFlagAlert = family.locator('article', { hasText: 'Warning sign reported' });
    await expect(redFlagAlert).toBeVisible();
    await expect(redFlagAlert.getByText('Needs a decision')).toBeVisible();
    await redFlagAlert.getByRole('button', { name: 'Close with a note' }).click();
    await family.getByRole('button', { name: 'Save and close' }).click();
    await expect(family.getByText(/Add a short note/)).toBeVisible();
    await family.getByLabel('Your note').fill('Sent a photo to the surgeon; dressing change booked for tomorrow.');
    await family.getByRole('button', { name: 'Save and close' }).click();
    await expect(family.getByText(/Closed, with your note saved/)).toBeVisible();

    // 8. The decision is now part of the record the next attendant will read.
    await family.getByRole('link', { name: 'Handover pack' }).click();
    await expect(family.getByText(/stitch line looks red/).first()).toBeVisible();
    await expect(family.getByText(/Sent a photo to the surgeon/)).toBeVisible();

    await familyCtx.close();
    await attCtx.close();
  });
});

test.describe('honesty and safety, after the self-critique pass', () => {
  test('the attendant can always reach the full plan and sees what the app is not', async ({ page }) => {
    await signIn(page, '9810055555');
    await expect(page.getByRole('link', { name: /Full care plan/ })).toBeVisible();
    await expect(page.getByText(/does not give medical advice/)).toBeVisible();
    await page.getByRole('link', { name: /Full care plan/ }).click();
    await expect(page.getByRole('heading', { name: 'Handover pack' })).toBeVisible();
    await expect(page.getByText('Rivaroxaban')).toBeVisible();
  });

  test('the family is told the app does not diagnose', async ({ page }) => {
    await signIn(page, '9810012345');
    await page.getByRole('link', { name: /Ramesh Iyer/ }).click();
    await expect(page.getByText(/does not diagnose anything/)).toBeVisible();
  });

  test('the notification outbox admits that delivery is not connected', async ({ page }) => {
    await signIn(page, '9810012345');
    await page.getByRole('link', { name: /Ramesh Iyer/ }).click();
    await page.getByRole('link', { name: 'Insights' }).click();
    await expect(page.getByRole('heading', { name: /Notification outbox/ })).toBeVisible();
    await expect(page.getByText(/nothing is actually sent/)).toBeVisible();
  });
});

test.describe('the record cannot be quietly rewritten', () => {
  test('a correction keeps the earlier value, visible to the family', async ({ page }) => {
    await signIn(page, '9810012345');
    await page.getByRole('link', { name: /Ramesh Iyer/ }).click();
    // The seeded correction sits on day 7 of the episode.
    await page.getByRole('link', { name: /Day 7:/ }).click();
    await expect(page.getByRole('heading', { name: 'Corrections during the day' })).toBeVisible();
    await expect(page.getByText(/He said he was not hungry/)).toBeVisible();
    await expect(page.getByText(/cannot be tidied up after the fact/)).toBeVisible();
  });

  test('the north star says documented, never verified', async ({ page }) => {
    await signIn(page, '9810012345');
    await page.getByRole('link', { name: /Ramesh Iyer/ }).click();
    await page.getByRole('link', { name: 'Insights' }).click();
    await expect(page.getByRole('heading', { name: /North star — documented care days/ })).toBeVisible();
    await expect(page.getByText(/Calling that .verified. would claim more than the product can do/)).toBeVisible();
  });

  test('the attendant is told exactly what the family can see', async ({ page }) => {
    await signIn(page, '9810055555');
    await expect(page.getByText(/What the family can see/)).toBeVisible();
    await expect(page.getByText(/no location, no camera, no microphone/)).toBeVisible();
  });
});

test.describe('access control and continuity, end to end', () => {
  test('a family cannot open another family\'s care case', async ({ browser }) => {
    const stamp = Date.now().toString().slice(-6);
    const ctx = await browser.newContext();
    const outsider = await ctx.newPage();

    // First, learn a real plan URL as the legitimate owner.
    await signIn(outsider, '9810012345');
    await outsider.getByRole('link', { name: /Ramesh Iyer/ }).click();
    await outsider.waitForLoadState('networkidle');
    const planUrl = outsider.url();
    await outsider.getByRole('button', { name: 'Sign out' }).click();

    // Then sign in as an unrelated family account and try that exact URL.
    await outsider.goto('/register');
    await outsider.getByRole('button', { name: /A family member/ }).click();
    await outsider.getByLabel('Your name').fill('Unrelated Person');
    await outsider.getByLabel('Mobile number').fill(`96${stamp.padStart(8, '9')}`.slice(0, 10));
    await outsider.getByLabel('Password').fill('password123');
    await outsider.getByRole('button', { name: 'Create account' }).click();

    await outsider.goto(planUrl);
    await expect(outsider.getByText(/do not have access/i)).toBeVisible();
    await expect(outsider.getByText('Ramesh Iyer')).toHaveCount(0);

    await ctx.close();
  });

  test('a replacement attendant sees the previous attendant\'s handover on their first screen', async ({ browser }) => {
    // Builds its own episode: ending an attendant is destructive, and the shared demo
    // data is read by other tests.
    const stamp = Date.now().toString().slice(-6);
    const famCtx = await browser.newContext();
    const family = await famCtx.newPage();

    await family.goto('/register');
    await family.getByRole('button', { name: /A family member/ }).click();
    await family.getByLabel('Your name').fill('Handover Family');
    await family.getByLabel('Mobile number').fill(`94${stamp.padStart(8, '9')}`.slice(0, 10));
    await family.getByLabel('Password').fill('password123');
    await family.getByRole('button', { name: 'Create account' }).click();

    await family.getByLabel("Patient's name").fill('Handover Patient');
    await family.getByLabel('Age').fill('70');
    await family.getByLabel('City they are recovering in').fill('New Delhi');
    await family.getByLabel('Surgery or condition').fill('Hip replacement');
    await family.getByRole('button', { name: 'Continue' }).click();
    await family.getByRole('button', { name: /Hip \/ knee replacement/ }).click();
    await family.getByRole('button', { name: 'Continue' }).click();
    await family.getByLabel('Medicine', { exact: true }).fill('Rivaroxaban');
    await family.getByLabel('Dose', { exact: true }).fill('10 mg');
    await family.getByLabel('Must not be missed').check();
    await family.getByRole('button', { name: 'Create care plan' }).click();

    // First attendant joins, works a shift, and leaves a note for whoever is next.
    await family.getByLabel('Their name').fill('First Attendant');
    await family.getByRole('button', { name: 'Create invite code' }).click();
    const firstCode = (await family.locator('p.tracking-\\[0\\.3em\\]').first().innerText()).trim();

    const att1Ctx = await browser.newContext();
    const att1 = await att1Ctx.newPage();
    await att1.goto('/register');
    await att1.getByRole('button', { name: /An attendant/ }).click();
    await att1.getByLabel('Your name').fill('First Attendant');
    await att1.getByLabel('Mobile number').fill(`93${stamp.padStart(8, '9')}`.slice(0, 10));
    await att1.getByLabel('Password').fill('password123');
    await att1.getByRole('button', { name: 'Create account' }).click();
    await att1.getByLabel(/Invite code/).fill(firstCode);
    await att1.getByRole('button', { name: /Join/ }).click();
    await att1.getByRole('button', { name: /Start my shift/ }).click();
    await att1.getByRole('button', { name: /^Done/ }).first().click();
    await att1.getByRole('button', { name: /End shift/ }).click();
    await att1.getByLabel(/Note for the next person/).fill('He sleeps on the right side only. Walker is by the door.');
    await att1.getByRole('button', { name: /End shift · खत्म करें/ }).click();
    await expect(att1.getByText(/Shift closed/)).toBeVisible();

    // The family ends her — which must always write a handover.
    await family.goto('/plans');
    await family.getByRole('link', { name: /Handover Patient/ }).click();
    await family.getByRole('link', { name: 'Attendants' }).click();
    await family.getByRole('button', { name: 'End on this plan' }).first().click();
    await family.getByLabel(/Why are they leaving/).fill('Went back to her village');
    await family.getByRole('button', { name: 'End and save handover' }).click();
    await expect(family.getByText(/handover pack has been saved/i)).toBeVisible();

    // The replacement joins and is handed the context on her first screen.
    await family.getByRole('button', { name: 'Add an attendant' }).click();
    await family.getByLabel('Their name').fill('Replacement Attendant');
    await family.getByRole('button', { name: 'Create invite code' }).click();
    const secondCode = (await family.locator('p.tracking-\\[0\\.3em\\]').first().innerText()).trim();

    const att2Ctx = await browser.newContext();
    const att2 = await att2Ctx.newPage();
    await att2.goto('/register');
    await att2.getByRole('button', { name: /An attendant/ }).click();
    await att2.getByLabel('Your name').fill('Replacement Attendant');
    await att2.getByLabel('Mobile number').fill(`92${stamp.padStart(8, '9')}`.slice(0, 10));
    await att2.getByLabel('Password').fill('password123');
    await att2.getByRole('button', { name: 'Create account' }).click();
    await att2.getByLabel(/Invite code/).fill(secondCode);
    await att2.getByRole('button', { name: /Join/ }).click();

    // The knowledge survived the person leaving. That is the whole thesis.
    await expect(att2.getByText(/Read this first/)).toBeVisible();
    await expect(att2.getByText(/sleeps on the right side only/)).toBeVisible();

    await att2.getByRole('link', { name: /Full care plan/ }).click();
    await expect(att2.getByRole('heading', { name: 'Handover pack' })).toBeVisible();
    await expect(att2.getByText('Rivaroxaban').first()).toBeVisible();
    await expect(att2.getByRole('heading', { name: /Warning signs/ })).toBeVisible();

    await famCtx.close();
    await att1Ctx.close();
    await att2Ctx.close();
  });
});

test.describe('failure states', () => {
  test('a wrong password says so without leaking which field was wrong', async ({ page }) => {
    await signIn(page, '9810012345', 'wrongpassword');
    await expect(page.getByRole('alert')).toContainText(/do not match/);
  });

  test('an unknown invite code is explained, not swallowed', async ({ page }) => {
    await signIn(page, '9810055555');
    await page.goto('/join');
    await page.getByLabel(/Invite code/).fill('ZZZZZZ');
    await page.getByRole('button', { name: /Join/ }).click();
    await expect(page.getByRole('alert')).toContainText(/not valid/);
  });

  test('an unknown URL lands on a real page, not a blank screen', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.getByRole('heading', { name: /does not exist/ })).toBeVisible();
  });

  test('a signed-out visitor is sent to sign in rather than an error', async ({ page }) => {
    await page.goto('/p/pln_whatever');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});
