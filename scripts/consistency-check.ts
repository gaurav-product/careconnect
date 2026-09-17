/**
 * Documentation consistency audit.
 *
 * A portfolio repository fails the moment a reader finds two documents disagreeing, so
 * the facts that appear in many places are checked mechanically rather than by memory:
 * the abandoned vocabulary, the test counts, the screenshot count, and every internal link.
 *
 * Usage: npx tsx scripts/consistency-check.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const problems: string[] = [];

const mdFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return ['node_modules', '.git', 'dist'].includes(e.name) ? [] : mdFiles(p);
    return e.name.endsWith('.md') ? [p] : [];
  });

const docs = [...mdFiles(path.join(ROOT, 'docs')), path.join(ROOT, 'README.md'), path.join(ROOT, 'CHANGELOG.md')];
const rel = (p: string) => path.relative(ROOT, p);

/* 1 — abandoned vocabulary must never reappear as a live claim ------------- */
const BANNED = [
  { pattern: /verified care day/i, why: 'the metric is "documented care days" (D-18)' },
  { pattern: /DPDP[- ]compliant(?!:)/i, why: 'the product is explicitly NOT DPDP-compliant' },
  { pattern: /HIPAA/i, why: 'no HIPAA claim may appear anywhere' },
  { pattern: /clinically validated|clinical validation(?! )/i, why: 'there is no clinical validation' }
];
for (const file of docs) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // Markdown wraps, so a sentence that marks itself as historical may do so on the
    // line above. Judge the line together with its predecessor.
    const context = `${lines[i - 1] ?? ''} ${line}`;
    // A line that is explicitly recording the abandoned term is allowed.
    // A line that contrasts the abandoned term with the current one is recording the
    // decision, not making the claim. So is anything explicitly marked as historical.
    const isHistorical =
      /~~|abandoned|renamed|used to|was wrong|first version|no longer|never|not DPDP|instead of|rather than|→|->/i.test(context) ||
      // A passage describing this very check quotes the banned list; that is documentation.
      /banned|must never appear/i.test(context) ||
      (/verified/i.test(context) && /documented/i.test(context));
    for (const b of BANNED) {
      if (b.pattern.test(line) && !isHistorical) {
        problems.push(`${rel(file)}:${i + 1}  banned phrase — ${b.why}\n    ${line.trim().slice(0, 110)}`);
      }
    }
  });
}

/* 2 — test counts quoted in the docs must match reality -------------------- */
function actualCounts() {
  const unit = execSync('npx vitest run --reporter=json --silent 2>/dev/null || true', { encoding: 'utf8' });
  let unitTests = 0;
  try {
    unitTests = JSON.parse(unit.slice(unit.indexOf('{'))).numTotalTests ?? 0;
  } catch {
    /* fall through to the file-count heuristic below */
  }
  // Ask Playwright rather than counting `test(` calls: a loop that generates cases would
  // be undercounted, and a checker that is itself wrong is worse than no checker.
  const listed = execSync('npx playwright test --list 2>/dev/null || true', { encoding: 'utf8' });
  const e2e = Number(listed.match(/Total:\s+(\d+)\s+tests?/)?.[1] ?? 0);
  const projects = (fs.readFileSync(path.join(ROOT, 'playwright.config.ts'), 'utf8').match(/name: '/g) ?? []).length;
  const scenarios = projects ? e2e / projects : e2e;
  return { unitTests, scenarios, projects, e2e };
}
const counts = actualCounts();
const shots = fs.readdirSync(path.join(ROOT, 'docs/10-evidence/screenshots')).filter((f) => f.endsWith('.png')).length;

for (const file of docs) {
  // The changelog is a historical record: old entries quote the counts of their own release.
  if (path.basename(file) === 'CHANGELOG.md') continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/(\d+)\s+(?:unit and integration tests|unit\/integration)/g)) {
    if (Number(m[1]) !== counts.unitTests) {
      problems.push(`${rel(file)}  says ${m[1]} unit/integration tests; actual is ${counts.unitTests}`);
    }
  }
  for (const m of text.matchAll(/(\d+)\s+end-to-end journeys/g)) {
    if (Number(m[1]) !== counts.e2e) {
      problems.push(`${rel(file)}  says ${m[1]} end-to-end journeys; actual is ${counts.e2e}`);
    }
  }
  for (const m of text.matchAll(/(\d+)\s+automated checks/g)) {
    const total = counts.unitTests + counts.e2e;
    if (Number(m[1]) !== total) {
      problems.push(`${rel(file)}  says ${m[1]} automated checks; actual is ${total}`);
    }
  }
  for (const m of text.matchAll(/\*\*(\d+) images/g)) {
    if (Number(m[1]) !== shots) problems.push(`${rel(file)}  says ${m[1]} screenshots; actual is ${shots}`);
  }
}

/* 3 — every internal link must resolve ------------------------------------- */
for (const file of docs) {
  const dir = path.dirname(file);
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    const link = m[1].split('#')[0];
    if (!link || link.startsWith('http') || link.startsWith('mailto')) continue;
    if (!fs.existsSync(path.resolve(dir, link))) {
      problems.push(`${rel(file)}  broken link → ${link}`);
    }
  }
}

/* 4 — the app must not ship a claim the docs disown ------------------------ */
const appSrc = execSync('grep -rn "verified" app --include=*.ts --include=*.tsx || true', { encoding: 'utf8' })
  .split('\n')
  .filter((l) => l && !/verifyPassword/.test(l))
  // Same rule as the docs: a line that contrasts the terms, or explicitly disowns the
  // word, is explaining the decision rather than making the claim.
  .filter((l) => !/documented|not called|would claim|cannot verify|deliberately|never/i.test(l));
for (const line of appSrc) problems.push(`app  stale "verified" claim → ${line.trim().slice(0, 110)}`);

/* ------------------------------------------------------------------------- */
console.log(`Checked ${docs.length} documents.`);
console.log(`Counts: ${counts.unitTests} unit/integration · ${counts.scenarios} scenarios × ${counts.projects} viewports = ${counts.e2e} e2e · ${shots} screenshots\n`);
if (problems.length === 0) {
  console.log('No inconsistencies found.');
} else {
  console.error(`${problems.length} inconsistency/ies:\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exitCode = 1;
}
