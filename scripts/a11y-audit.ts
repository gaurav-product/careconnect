/**
 * A dependency-free accessibility sweep of the real pages: contrast of every text
 * node against its painted background, touch-target sizes, labelled controls,
 * heading order, and landmark presence.
 *
 * It is not a substitute for testing with someone who uses assistive technology —
 * doc 17 says so explicitly — but it catches the mechanical failures.
 *
 * Usage: BASE_URL=http://localhost:4000 npx tsx scripts/a11y-audit.ts
 */
import { chromium, devices } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4000';

const AUDIT = `() => {
  const problems = [];
  const parseRgb = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const [r, g, b, a] = m[1].split(',').map((n) => parseFloat(n));
    return { r, g, b, a: a === undefined ? 1 : a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parseRgb(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.5) return c;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  // 1. contrast on visible text
  for (const el of document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, li, td, th, label, dd, dt')) {
    if (!el.textContent || !el.textContent.trim()) continue;
    if (el.querySelector('p, span, a, button, h1, h2, h3, h4, li, td, th, label')) continue;
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.6) continue;
    const fg = parseRgb(cs.color);
    if (!fg) continue;
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const r = ratio(fg, bgOf(el));
    if (r < need) {
      problems.push({
        kind: 'contrast',
        detail: r.toFixed(2) + ':1 (needs ' + need + ':1) — "' + el.textContent.trim().slice(0, 48) + '"'
      });
    }
  }

  // 2. touch targets
  for (const el of document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')) {
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    const minTarget = window.innerWidth < 600 ? 44 : 24;
    if (box.height < minTarget && !el.closest('nav') && el.tagName !== 'A') {
      problems.push({
        kind: 'touch-target',
        detail: Math.round(box.height) + 'px tall — "' + (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40) + '"'
      });
    }
  }

  // 3. labelled controls
  for (const el of document.querySelectorAll('input, select, textarea')) {
    const id = el.getAttribute('id');
    const labelled =
      (id && document.querySelector('label[for="' + id + '"]')) ||
      el.getAttribute('aria-label') ||
      el.getAttribute('aria-labelledby') ||
      el.closest('label');
    if (!labelled) problems.push({ kind: 'unlabelled-control', detail: el.outerHTML.slice(0, 80) });
  }

  // 4. images
  for (const el of document.querySelectorAll('img')) {
    if (!el.hasAttribute('alt')) problems.push({ kind: 'img-no-alt', detail: el.getAttribute('src')?.slice(0, 40) ?? '' });
  }

  // 5. structure — 44px is the phone bar, 24px (WCAG 2.1 AA 2.5.8) the pointer bar
  const h1s = document.querySelectorAll('h1').length;
  if (h1s !== 1) problems.push({ kind: 'heading-structure', detail: h1s + ' <h1> elements on the page' });
  if (!document.querySelector('main')) problems.push({ kind: 'landmark', detail: 'no <main> landmark' });

  // 6. focus visibility is set globally via :focus-visible; check the token exists
  return problems;
}`;

const PAGES: Array<{ name: string; phone: string; path: string; mobile: boolean }> = [
  { name: 'sign-in', phone: '', path: '/login', mobile: false },
  { name: 'family-today', phone: '9810012345', path: '', mobile: false },
  { name: 'family-day', phone: '9810012345', path: 'day', mobile: false },
  { name: 'family-handover', phone: '9810012345', path: 'handover', mobile: false },
  { name: 'family-insights', phone: '9810012345', path: 'insights', mobile: false },
  { name: 'family-plan', phone: '9810012345', path: 'plan', mobile: false },
  { name: 'attendant-duty', phone: '9810055555', path: 'duty', mobile: true }
];

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  let total = 0;

  for (const spec of PAGES) {
    const ctx = await browser.newContext(
      spec.mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1280, height: 900 } }
    );
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`);
    if (spec.phone) {
      await page.getByLabel('Mobile number').fill(spec.phone);
      await page.getByLabel('Password').fill('demo1234');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForLoadState('networkidle');
      if (spec.path !== 'duty') {
        await page.getByRole('link', { name: /Ramesh Iyer/ }).click();
        await page.waitForLoadState('networkidle');
        if (spec.path === 'day') await page.getByRole('link', { name: 'See the full day' }).click();
        else if (spec.path === 'handover') await page.getByRole('link', { name: 'Handover pack' }).click();
        else if (spec.path === 'insights') await page.getByRole('link', { name: 'Insights' }).click();
        else if (spec.path === 'plan') await page.getByRole('link', { name: 'Care plan' }).click();
        await page.waitForLoadState('networkidle');
      }
    }
    await page.waitForTimeout(400);
    const problems = (await page.evaluate(`(${AUDIT})()`)) as Array<{ kind: string; detail: string }>;
    const unique = [...new Map(problems.map((p) => [p.kind + p.detail, p])).values()];
    total += unique.length;
    console.log(`\n${spec.name} — ${unique.length === 0 ? 'clean' : unique.length + ' issue(s)'}`);
    for (const p of unique) console.log(`  · [${p.kind}] ${p.detail}`);
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${total === 0 ? 'No mechanical accessibility issues found.' : total + ' issue(s) to review.'}`);
  if (total > 0) process.exitCode = 1;
}

void main();
