/**
 * Captures the screenshots used in the README and the case study, and fails loudly
 * if any page logs a console error along the way.
 * Usage: BASE_URL=http://localhost:4000 npx tsx scripts/screenshots.ts
 */
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:4000';
const OUT = path.resolve(process.cwd(), 'docs/screenshots');
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
  const correctedDay = fam.getByRole('link', { name: /Day 7:/ });
  if (await correctedDay.count()) {
    await correctedDay.click();
    await fam.waitForLoadState('networkidle');
    await shot(fam, '11-corrections', true);
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
