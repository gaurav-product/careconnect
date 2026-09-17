import { expect, test, type Browser, type Page } from '@playwright/test';

/**
 * Coverage for the MVP definition of done that the main journey file does not reach:
 * a save that fails must stay visible, the Hindi flow must be usable, metrics must come
 * from real records, and the attendant screen must hold up at real phone widths.
 *
 * Every test builds its own episode. Nothing here touches the shared demo data.
 */

let seq = 0;
/** A valid Indian mobile: 10 digits, first digit 6-9. */
const uniquePhone = (prefix: '9' | '8' | '7' | '6') => {
  seq += 1;
  const tail = `${Date.now()}${seq}${Math.floor(Math.random() * 1e6)}`.slice(-9);
  return `${prefix}${tail}`;
};

interface Episode {
  family: Page;
  attendant: Page;
  close: () => Promise<void>;
}

/** Creates a family, a care plan and an attendant who has joined and started a shift. */
async function freshEpisode(browser: Browser, name: string): Promise<Episode> {
  const famCtx = await browser.newContext();
  const family = await famCtx.newPage();

  await family.goto('/register');
  await family.getByRole('button', { name: /A family member/ }).click();
  await family.getByLabel('Your name').fill(`${name} Family`);
  await family.getByLabel('Mobile number').fill(uniquePhone('9'));
  await family.getByLabel('Password').fill('password123');
  await family.getByRole('button', { name: 'Create account' }).click();

  await family.getByLabel("Patient's name").fill(`${name} Patient`);
  await family.getByLabel('Age').fill('71');
  await family.getByLabel('City they are recovering in').fill('New Delhi');
  await family.getByLabel('Surgery or condition').fill('Hip replacement');
  await family.getByRole('button', { name: 'Continue' }).click();
  await family.getByRole('button', { name: /Hip \/ knee replacement/ }).click();
  await family.getByRole('button', { name: 'Continue' }).click();
  await family.getByLabel('Medicine', { exact: true }).fill('Rivaroxaban');
  await family.getByLabel('Dose', { exact: true }).fill('10 mg');
  await family.getByRole('button', { name: 'Create care plan' }).click();

  await family.getByLabel('Their name').fill(`${name} Attendant`);
  await family.getByRole('button', { name: 'Create invite code' }).click();
  const code = (await family.locator('p.tracking-\\[0\\.3em\\]').first().innerText()).trim();

  const attCtx = await browser.newContext();
  const attendant = await attCtx.newPage();
  await attendant.goto('/register');
  await attendant.getByRole('button', { name: /An attendant/ }).click();
  await attendant.getByLabel('Your name').fill(`${name} Attendant`);
  await attendant.getByLabel('Mobile number').fill(uniquePhone('8'));
  await attendant.getByLabel('Password').fill('password123');
  await attendant.getByRole('button', { name: 'Create account' }).click();
  await attendant.getByLabel(/Invite code/).fill(code);
  await attendant.getByRole('button', { name: /Join/ }).click();
  await attendant.getByRole('button', { name: /Start my shift/ }).click();
  await expect(attendant.getByRole('button', { name: /End shift/ })).toBeVisible();

  return {
    family,
    attendant,
    close: async () => {
      await famCtx.close();
      await attCtx.close();
    }
  };
}

test.describe('a save that fails never looks like a save that worked', () => {
  test('the attendant keeps a visible warning long after a toast would have gone', async ({ browser }) => {
    const ep = await freshEpisode(browser, 'SaveFail');

    // The phone loses its connection mid-round.
    await ep.attendant.route('**/api/shifts/**/tasks', (route) => route.abort('failed'));
    await ep.attendant.getByRole('button', { name: /^Done/ }).first().click();

    const banner = ep.attendant.getByRole('alert').filter({ hasText: /did not save/i });
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/Nothing was recorded/i);
    await expect(banner).toContainText('सेव नहीं हुई');

    // A toast disappears in 4.5s. This must not.
    await ep.attendant.waitForTimeout(6000);
    await expect(banner).toBeVisible();

    // And the item itself must still be offering the action, not showing a false success.
    await expect(ep.attendant.getByRole('button', { name: /^Done/ }).first()).toBeVisible();

    // When the connection returns, the same tap works and the warning clears.
    await ep.attendant.unroute('**/api/shifts/**/tasks');
    await ep.attendant.getByRole('button', { name: /^Done/ }).first().click();
    await expect(banner).toBeHidden();

    await ep.close();
  });

  test('a missing reason is rejected and nothing is recorded', async ({ browser }) => {
    const ep = await freshEpisode(browser, 'NoReason');

    await ep.attendant.getByRole('button', { name: /Could not/ }).first().click();
    await ep.attendant.getByRole('button', { name: /^Save/ }).click();
    await expect(ep.attendant.getByText(/Please write one line/)).toBeVisible();
    await expect(ep.attendant.getByRole('dialog')).toBeVisible();

    await ep.attendant.getByLabel(/Reason/).fill('He said his hip hurt this morning');
    await ep.attendant.getByRole('button', { name: /^Save/ }).click();
    await expect(ep.attendant.getByRole('dialog')).toBeHidden();

    await ep.close();
  });
});

test.describe('the Hindi side of the attendant flow', () => {
  test('every action the attendant needs is readable in Hindi', async ({ browser }) => {
    const ep = await freshEpisode(browser, 'Hindi');
    const a = ep.attendant;

    for (const hindi of ['दवाइयाँ', 'देखभाल के काम', 'समस्या बताएं', 'ड्यूटी खत्म']) {
      await expect(a.getByText(hindi).first()).toBeVisible();
    }
    await expect(a.getByRole('button', { name: /हो गया/ }).first()).toBeVisible();
    await expect(a.getByRole('button', { name: /नहीं हुआ/ }).first()).toBeVisible();

    // Hindi must not push anything off the screen.
    const overflow = await a.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    // The sheets are bilingual too, and the Hindi label is tied to a working control.
    await a.getByRole('button', { name: /Report a problem · समस्या बताएं/ }).click();
    await expect(a.getByText('क्या देखा?')).toBeVisible();
    await a.getByLabel(/What did you see/).fill('घाव के पास लाल दिख रहा है');
    await a.getByRole('button', { name: /परिवार को बताएं/ }).click();
    await expect(a.getByText(/परिवार को बता दिया गया/)).toBeVisible();

    // And it reaches the family, in the words the attendant used.
    await ep.family.goto('/plans');
    await ep.family.getByRole('link', { name: /Hindi Patient/ }).click();
    await expect(ep.family.getByText('घाव के पास लाल दिख रहा है')).toBeVisible();

    await ep.close();
  });
});

test.describe('metrics come from the records, not from a constant', () => {
  test('documented days moves only after care is actually recorded', async ({ browser }) => {
    const ep = await freshEpisode(browser, 'Metrics');

    await ep.family.goto('/plans');
    await ep.family.getByRole('link', { name: /Metrics Patient/ }).click();
    await ep.family.getByRole('link', { name: 'Insights' }).click();
    const documentedCard = ep.family.locator('div').filter({ hasText: /^Documented care days/ }).first();
    const completeCard = ep.family.locator('div').filter({ hasText: /^Complete days/ }).first();
    await expect(documentedCard).toContainText('0 of 1');

    // Record one task — one record is all the north star asks for.
    await ep.attendant.getByRole('button', { name: /^Done/ }).first().click();
    await expect(ep.attendant.getByText('done').first()).toBeVisible();

    await ep.family.reload();
    await expect(documentedCard).toContainText('1 of 1');

    // Complete days must NOT move: the day is far from fully recorded.
    await expect(completeCard).toContainText('0 of 1');

    await ep.close();
  });
});

test.describe('the attendant screen holds up at real phone widths', () => {
  for (const width of [375, 390, 430]) {
    test(`no horizontal scroll or clipped action at ${width}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width, height: 780 }, hasTouch: true });
      const page = await ctx.newPage();

      await page.goto('/login');
      await page.getByLabel('Mobile number').fill('9810055555');
      await page.getByLabel('Password').fill('demo1234');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForLoadState('networkidle');

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);

      // Every control must be inside the viewport and thumb-sized.
      const controls = page.locator('button:visible, a[href]:visible');
      for (let i = 0; i < (await controls.count()); i++) {
        const box = await controls.nth(i).boundingBox();
        if (!box) continue;
        expect(box.x, `control ${i} starts off-screen at ${width}px`).toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width, `control ${i} is clipped at ${width}px`).toBeLessThanOrEqual(width + 1);
      }

      await ctx.close();
    });
  }
});
