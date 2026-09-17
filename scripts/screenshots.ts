/**
 * Captures the screenshots used in the README and the case study, and fails loudly
 * if any page logs a console error along the way.
 * Usage: BASE_URL=http://localhost:4000 npx tsx scripts/screenshots.ts
 */
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:4000';
const OUT = path.resolve(process.cwd(), 'docs/10-evidence/screenshots');
fs.mkdirSync(OUT, { recursive: true });

const problems: string[] = [];

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const phone = await browser.newContext({ ...devices['Pixel 7'] });

  for (const ctx of [desktop, phone]) {
    ctx.on('weberror', (e) => problems.push(`page error: ${e.error().message}`));
  }

  const shot = async (page: any, name: string, fullPage = false) => {
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
    console.log(`  ✓ ${name}.png`);
  };

  const signIn = async (page: any, phoneNumber: string) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel('Mobile number').fill(phoneNumber);
    await page.getByLabel('Password').fill('demo1234');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForLoadState('networkidle');
  };

  // --- family, on a laptop ---
  const fam = await desktop.newPage();
  fam.on('console', (m: any) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  await fam.goto(`${BASE}/login`);
  await shot(fam, '01-sign-in');
  await signIn(fam, '9810012345');
  await fam.getByRole('link', { name: /Ramesh Iyer/ }).click();
  await fam.waitForLoadState('networkidle');
  await shot(fam, '02-family-dashboard', true);

  await fam.getByRole('link', { name: 'See the full day' }).click();
  await fam.waitForLoadState('networkidle');
  await shot(fam, '03-day-record', true);

  // The day that carries a correction — the record's integrity story.
  await fam.goto(`${BASE}/plans`);
  await fam.getByRole('link', { name: /Ramesh Iyer/ }).click();
  await fam.waitForLoadState('networkidle');
  // Find the day that actually carries a correction, by asking the API rather than
  // guessing at a label — the screenshot must show the real thing.
  const correctedUrl = await fam.evaluate(async () => {
    const links = Array.from(document.querySelectorAll('a[href*="/day/"]')) as HTMLAnchorElement[];
    for (const a of links.reverse()) {
      const [, planId, , date] = a.pathname.split('/').filter(Boolean).slice(0, 4) as string[];
      const res = await fetch(`/api/plans/${planId}/days/${date}`, { credentials: 'same-origin' });
      if (!res.ok) continue;
      const day = await res.json();
      if (day.revisions?.length) return a.pathname;
    }
    return null;
  });
  if (correctedUrl) {
    await fam.goto(`${BASE}${correctedUrl}`);
    await fam.waitForLoadState('networkidle');
    await shot(fam, '11-corrections', true);
  } else {
    console.log('  – no corrected day in the demo data, skipping 11-corrections');
  }

  await fam.getByRole('link', { name: 'Handover pack' }).click();
  await fam.waitForLoadState('networkidle');
  await shot(fam, '04-handover-pack', true);

  await fam.getByRole('link', { name: 'Attendants' }).click();
  await fam.waitForLoadState('networkidle');
  await shot(fam, '05-attendants', true);

  await fam.getByRole('link', { name: 'Insights' }).click();
  await fam.waitForLoadState('networkidle');
  await shot(fam, '06-insights', true);

  // --- attendant, on a phone ---
  const att = await phone.newPage();
  att.on('console', (m: any) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  await signIn(att, '9810055555');
  await att.waitForLoadState('networkidle');
  await shot(att, '07-attendant-shift', true);

  await att.getByRole('button', { name: /Report a problem/ }).click();
  await shot(att, '08-attendant-report');
  await att.getByRole('button', { name: 'Cancel' }).click();

  const couldNot = att.getByRole('button', { name: /Could not/ }).first();
  if (await couldNot.count()) {
    await couldNot.click();
    await shot(att, '09-attendant-reason');
    await att.getByRole('button', { name: /Cancel/ }).first().click();
  } else {
    console.log('  – no pending task on this shift, skipping 09-attendant-reason');
  }

  // --- the family dashboard on a phone, since that is where most of it is read ---
  const famPhone = await phone.newPage();
  famPhone.on('console', (m: any) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  await signIn(famPhone, '9810012345');
  await famPhone.getByRole('link', { name: /Ramesh Iyer/ }).click();
  await famPhone.waitForLoadState('networkidle');
  await shot(famPhone, '10-family-dashboard-mobile', true);

  // --- screens that only exist for a brand-new attendant: captured by actually
  // --- creating an episode, so every image is from the running product.
  const newFam = await desktop.newPage();
  newFam.on('console', (m: any) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  const stamp = `${Date.now()}`.slice(-9);

  await newFam.goto(`${BASE}/register`);
  await newFam.getByRole('button', { name: /A family member/ }).click();
  await newFam.getByLabel('Your name').fill('Demo Daughter');
  await newFam.getByLabel('Mobile number').fill(`9${stamp}`);
  await newFam.getByLabel('Password').fill('password123');
  await newFam.getByRole('button', { name: 'Create account' }).click();
  await newFam.waitForLoadState('networkidle');
  await shot(newFam, '12-create-care-case', true);

  await newFam.getByLabel("Patient's name").fill('Demo Patient');
  await newFam.getByLabel('Age').fill('71');
  await newFam.getByLabel('City they are recovering in').fill('New Delhi');
  await newFam.getByLabel('Surgery or condition').fill('Right hip replacement');
  await newFam.getByRole('button', { name: 'Continue' }).click();
  await shot(newFam, '13-choose-recovery-type', true);
  await newFam.getByRole('button', { name: /Hip \/ knee replacement/ }).click();
  await newFam.getByRole('button', { name: 'Continue' }).click();
  await newFam.getByLabel('Medicine', { exact: true }).fill('Rivaroxaban');
  await newFam.getByLabel('Dose', { exact: true }).fill('10 mg');
  await newFam.getByLabel('Must not be missed').check();
  await shot(newFam, '14-care-plan-medicines', true);
  await newFam.getByRole('button', { name: 'Create care plan' }).click();

  await newFam.getByLabel('Their name').fill('Demo Attendant');
  await newFam.getByRole('button', { name: 'Create invite code' }).click();
  await shot(newFam, '15-invite-code', true);
  const inviteCode = (await newFam.locator('p.tracking-\\[0\\.3em\\]').first().innerText()).trim();

  const newAtt = await phone.newPage();
  newAtt.on('console', (m: any) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  await newAtt.goto(`${BASE}/register`);
  await newAtt.getByRole('button', { name: /An attendant/ }).click();
  await newAtt.getByLabel('Your name').fill('Demo Attendant');
  await newAtt.getByLabel('Mobile number').fill(`8${stamp}`);
  await newAtt.getByLabel('Password').fill('password123');
  await newAtt.getByRole('button', { name: 'Create account' }).click();
  await shot(newAtt, '16-attendant-join', true);
  await newAtt.getByLabel(/Invite code/).fill(inviteCode);
  await newAtt.getByRole('button', { name: /Join/ }).click();
  await newAtt.waitForLoadState('networkidle');
  await shot(newAtt, '17-attendant-before-shift', true);

  // --- a tablet layout, from the real app
  const tablet = await browser.newContext({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2 });
  const tabPage = await tablet.newPage();
  tabPage.on('console', (m: any) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  await signIn(tabPage, '9810012345');
  await tabPage.getByRole('link', { name: /Ramesh Iyer/ }).click();
  await tabPage.waitForLoadState('networkidle');
  await shot(tabPage, '18-family-tablet', true);
  await tablet.close();

  await browser.close();

  if (problems.length) {
    console.error('\nBrowser problems found:');
    for (const p of [...new Set(problems)]) console.error(`  ✗ ${p}`);
    process.exitCode = 1;
  } else {
    console.log('\nNo console or page errors on any captured screen.');
  }
}

void main();
