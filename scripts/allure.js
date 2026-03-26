/**
 * Allure CLI helper — bypasses Node.js 22 spawn EINVAL on Windows (.bat files)
 * and ensures JAVA_HOME is set correctly regardless of terminal environment.
 *
 * Also injects Allure enrichment files before generating:
 *   - allure-results/categories.json   (failure classification)
 *   - allure-results/environment.properties (suite metadata)
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const JAVA_HOME = 'C:\\Program Files\\Eclipse Adoptium\\jre-21.0.10.7-hotspot';
const alureBat  = path.join(__dirname, '..', 'node_modules', 'allure-commandline', 'dist', 'bin', 'allure.bat');
const args      = process.argv.slice(2);
const isGenerate = args[0] === 'generate';

// ─── Pre-generate enrichment ─────────────────────────────────────────────────
if (isGenerate) {
  const resultsDir = path.join(__dirname, '..', 'allure-results');
  fs.mkdirSync(resultsDir, { recursive: true });

  // 1. Inject categories.json for failure classification
  const categoriesSrc = path.join(__dirname, '..', 'allure-categories.json');
  const categoriesDst = path.join(resultsDir, 'categories.json');
  if (fs.existsSync(categoriesSrc)) {
    fs.copyFileSync(categoriesSrc, categoriesDst);
    console.log('[allure.js] ✓ categories.json injected into allure-results/');
  }

  // 2. Write environment.properties (dynamic — reflects current run configuration)
  const envPropsPath = path.join(resultsDir, 'environment.properties');
  const browser = process.env.BROWSER || 'chromium';
  const headless = process.env.HEADLESS !== 'false' ? 'true' : 'false';
  const parallel = process.env.PARALLEL === '2' ? 'true' : 'false';
  const node = process.version;
  const now = new Date().toISOString().split('T')[0];

  const envProps = [
    `Framework=Playwright + Cucumber BDD + TypeScript`,
    `Browser=${browser.charAt(0).toUpperCase() + browser.slice(1)}`,
    `Headless=${headless}`,
    `Parallel=2 workers`,
    `Node.js=${node}`,
    `Playwright=1.43.1`,
    `Cucumber.js=10.8.0`,
    `Environment=dev`,
    `BaseURL=https://demoqa.com`,
    `ReportDate=${now}`,
    `Retry=1`,
  ].join('\n');

  fs.writeFileSync(envPropsPath, envProps, 'utf-8');
  console.log('[allure.js] ✓ environment.properties written to allure-results/');
}

// ─── Run Allure CLI ──────────────────────────────────────────────────────────
const result = spawnSync(alureBat, args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    JAVA_HOME,
    PATH: `${JAVA_HOME}\\bin;${process.env.PATH || ''}`,
  },
});

process.exit(result.status ?? 0);

