#!/usr/bin/env node
/**
 * Assertion Quality Metrics Analyzer
 * Analyzes all TypeScript source files in 'src/' and categorizes
 * every Playwright/Jest expect() assertion into three types:
 *
 *   Content-based  — text, value, URL, string equality checks
 *   Structural     — element visibility, interactivity, count/threshold checks
 *   Defensive      — negative states, error conditions, boundary/integrity checks
 *
 * Usage:  node scripts/analyze-assertions.js [--verbose]
 */

const fs = require('fs');
const path = require('path');

const VERBOSE = process.argv.includes('--verbose');

// ─── Patterns ────────────────────────────────────────────────────────────────

const PATTERNS = {
  contentBased: [
    /toContainText\s*\(/g,
    /toHaveText\s*\(/g,
    /toHaveURL\s*\(/g,
    /toHaveValue\s*\(/g,
    /toHaveTitle\s*\(/g,
    /toMatchSnapshot\s*\(/g,
    /\.toBe\s*\(\s*['"`]/g,             // toBe('string')
    /\.toEqual\s*\(\s*['"`]/g,          // toEqual('string')
    /\.toContain\s*\(\s*['"`]/g,        // toContain('string')
    /\.toMatch\s*\(\//g,                // toMatch(/regex/)
    /expect\s*\(\s*\[.+\]\s*\)\.toContain/g,  // expect([list]).toContain(value)
    /\.toBe\s*\(\s*expectedName\b/g,    // dynamic string comparison
  ],
  structural: [
    /\btoBeVisible\b/g,
    /\btoBeEnabled\b/g,
    /\btoBeDisabled\b/g,
    /\btoBeChecked\b/g,
    /\btoBeAttached\b/g,
    /\btoHaveCount\b/g,
    /\btoBeGreaterThan\b/g,
    /\btoBeGreaterThanOrEqual\b/g,
    /\btoBeLessThan\b/g,
    /\btoBeLessThanOrEqual\b/g,
    /\.isVisible\s*\(\s*\)/g,
    /\.count\s*\(\s*\)\s*[><=]/g,
  ],
  defensive: [
    /\.not\s*\.\s*toBeVisible\b/g,
    /\.not\s*\.\s*toHaveClass\b/g,
    /\.not\s*\.\s*toBe\b/g,
    /\.not\s*\.\s*toBeChecked\b/g,
    /\.not\s*\.\s*toBeEnabled\b/g,
    /\.toBe\s*\(\s*false\s*\)/g,
    /\.toBe\s*\(\s*0\s*\)/g,
    /\.toBe\s*\(\s*true\s*\)/g,         // boolean condition checks (errorFound, onLoginPage, etc.)
    /\.toBe\s*\(\s*\d+\s*\)/g,          // exact integer: .toBe(5)
    /expect\s*\(.*?Found\s*\)\.toBe/g,
    /expect\s*\(.*?Page\s*\)\.toBe/g,
    /expect\s*\(.*?Indicators?\s*\)\.toBe/g,
    /expect\s*\(.*?Integrity\s*\)\.toBe/g,
    /expect\s*\(.*?Valid\s*\)\.toBe/g,
    /expect\s*\(.*?Restarted\s*\)\.toBe/g,
    /expect\s*\(.*?Responsive\s*\)\.toBe/g,
    /expect\s*\(.*?Loaded\s*\)\.toBe/g,
    /expect\s*\(.*?Supported\s*\)\.toBe/g,
    /expect\s*\(.*?Available\s*\)\.toBe/g,
  ]
};

// ─── File walker ─────────────────────────────────────────────────────────────

function walkDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', 'playwright-ui-wrapper'].includes(entry.name)) {
      walkDir(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── Counter ─────────────────────────────────────────────────────────────────

function countMatches(content, patterns) {
  let total = 0;
  const hits = [];
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = [...content.matchAll(regex)];
    if (matches.length > 0) {
      total += matches.length;
      if (VERBOSE) hits.push({ pattern: pattern.source, count: matches.length });
    }
  }
  return { count: total, hits };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const srcDir = path.join(__dirname, '..', 'src');
const files = walkDir(srcDir);

let totals = { contentBased: 0, structural: 0, defensive: 0 };
const fileResults = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  const cb = countMatches(content, PATTERNS.contentBased);
  const st = countMatches(content, PATTERNS.structural);
  const df = countMatches(content, PATTERNS.defensive);

  totals.contentBased += cb.count;
  totals.structural   += st.count;
  totals.defensive    += df.count;

  if (VERBOSE && (cb.count + st.count + df.count) > 0) {
    fileResults.push({ file: relPath, contentBased: cb.count, structural: st.count, defensive: df.count });
  }
}

const total = totals.contentBased + totals.structural + totals.defensive;
const pct = (n) => total === 0 ? '0.0' : (n / total * 100).toFixed(1);

// ─── Output ──────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║       ASSERTION QUALITY METRICS — DemoQA Framework       ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');
console.log(`  Files analyzed : ${files.length}`);
console.log(`  Source path    : ${srcDir}\n`);
console.log('  ┌─────────────────┬───────┬────────────┐');
console.log('  │ Type            │ Count │ Percentage │');
console.log('  ├─────────────────┼───────┼────────────┤');
console.log(`  │ Content-based   │  ${String(totals.contentBased).padStart(4)} │    ${String(pct(totals.contentBased)).padStart(5)}% │`);
console.log(`  │ Structural      │  ${String(totals.structural).padStart(4)} │    ${String(pct(totals.structural)).padStart(5)}% │`);
console.log(`  │ Defensive       │  ${String(totals.defensive).padStart(4)} │    ${String(pct(totals.defensive)).padStart(5)}% │`);
console.log('  ├─────────────────┼───────┼────────────┤');
console.log(`  │ TOTAL           │  ${String(total).padStart(4)} │    100.0%  │`);
console.log('  └─────────────────┴───────┴────────────┘\n');
console.log('  Interpretation:');
console.log(`    Content-based  (${pct(totals.contentBased)}%): Text/value equality — higher = stronger functional validation`);
console.log(`    Structural     (${pct(totals.structural)}%): Element state — indicates UI stability coverage`);
console.log(`    Defensive      (${pct(totals.defensive)}%): Negative paths — indicates robustness of error handling`);

if (VERBOSE && fileResults.length > 0) {
  console.log('\n  Per-file breakdown:');
  console.log('  ┌────────────────────────────────────────────┬───────┬──────┬──────┐');
  console.log('  │ File                                       │  CB   │  ST  │  DF  │');
  console.log('  ├────────────────────────────────────────────┼───────┼──────┼──────┤');
  for (const r of fileResults.sort((a, b) => (b.contentBased + b.structural + b.defensive) - (a.contentBased + a.structural + a.defensive))) {
    const name = r.file.replace(/\\/g, '/').replace('src/', '').slice(0, 42).padEnd(42);
    console.log(`  │ ${name} │  ${String(r.contentBased).padStart(4)} │ ${String(r.structural).padStart(4)} │ ${String(r.defensive).padStart(4)} │`);
  }
  console.log('  └────────────────────────────────────────────┴───────┴──────┴──────┘');
}

console.log('');

// ─── Exit with metrics object for programmatic use ────────────────────────────
process.exitCode = 0;
module.exports = { totals, total, files: files.length };
