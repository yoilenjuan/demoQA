/**
 * Cucumber Configuration - Setup for Multiple Feature Files
 * 
 * HOW TO ADD NEW FEATURE FILES:
 * =============================
 * 1. Create a new .feature file in src/features/ directory
 *    Example: src/features/newFeature.feature
 * 
 * 2. Create corresponding .steps.ts file in src/step-definitions/ directory
 *    Example: src/step-definitions/newFeature.steps.ts
 *    (Must follow naming pattern: [name].steps.ts)
 * 
 * 3. Add BOTH files to the arrays below:
 *    - Add to featureFiles array (lines ~23)
 *    - Add to stepFiles array (lines ~28)
 * 
 * 4. Run: npm test
 * 
 * EXAMPLE OF ADDING A NEW FEATURE:
 * ================================
 * Feature file: src/features/buttons.feature
 * Step file: src/step-definitions/buttons.steps.ts
 * 
 * In cucumber.js, add:
 * const featureFiles = [
 *   "src/features/elements.feature",
 *   "src/features/buttons.feature"    <-- NEW
 * ];
 * 
 * const stepFiles = [
 *   "src/step-definitions/elements.steps.ts",
 *   "src/step-definitions/buttons.steps.ts"  <-- NEW
 * ];
 */

// Feature files to execute (add new .feature files here)
const featureFiles = [
  "src/features/elements.feature"
];

// Step definition files (add new .steps.ts files here)
const stepFiles = [
  "src/step-definitions/elements.steps.ts"
];

// Hooks must load AFTER step definitions to avoid Cucumber initialization errors
const hookFiles = [
  "src/support/hooks.ts"
];

// Common configuration applied to all profiles
const commonConfig = {
  requireModule: ["ts-node/register"],
  formatOptions: {
    snippetInterface: "async-await"
  },
  dryRun: false,
  failFast: false,
  strict: false,
  worldParameters: {
    baseUrl: process.env.BASE_URL || "https://demoqa.com",
    browser: process.env.BROWSER || "chromium",
    headless: process.env.HEADLESS !== "false"
  }
};

module.exports = {
  default: {
    features: featureFiles,
    require: [...stepFiles, ...hookFiles],
    format: [
      "progress-bar",
      "html:reports/cucumber-report.html",
      "json:reports/cucumber-report.json"
    ],
    ...commonConfig
  },
  smoke: {
    features: featureFiles,
    require: [...stepFiles, ...hookFiles],
    tags: "@smoke and not @skip",
    format: [
      "progress-bar",
      "html:reports/smoke-report.html",
      "json:reports/smoke-report.json"
    ],
    ...commonConfig
  },
  regression: {
    features: featureFiles,
    require: [...stepFiles, ...hookFiles],
    tags: "@regression and not @skip",
    format: [
      "progress-bar",
      "html:reports/regression-report.html",
      "json:reports/regression-report.json"
    ],
    ...commonConfig
  },
  critical: {
    features: featureFiles,
    require: [...stepFiles, ...hookFiles],
    tags: "@critical and not @skip",
    format: [
      "progress-bar",
      "html:reports/critical-report.html"
    ],
    ...commonConfig
  }
};
