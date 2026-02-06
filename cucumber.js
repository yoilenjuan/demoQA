module.exports = {
  default: {
    features: ["src/features/**/*.feature"],
    require: [
      "src/support/hooks.ts",
      "src/step-definitions/**/*.ts"
    ],
    requireModule: ["ts-node/register"],
    format: [
      "progress-bar",
      "html:reports/cucumber-report.html",
      "json:reports/cucumber-report.json"
    ],
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
  },
  smoke: {
    features: ["src/features/**/*.feature"],
    require: [
      "src/support/hooks.ts",
      "src/step-definitions/**/*.ts"
    ],
    requireModule: ["ts-node/register"],
    tags: "@smoke and not @skip",
    format: [
      "progress-bar",
      "html:reports/smoke-report.html",
      "json:reports/smoke-report.json"
    ]
  },
  regression: {
    features: ["src/features/**/*.feature"],
    require: [
      "src/support/hooks.ts",
      "src/step-definitions/**/*.ts"
    ],
    requireModule: ["ts-node/register"],
    tags: "@regression and not @skip",
    format: [
      "progress-bar",
      "html:reports/regression-report.html",
      "json:reports/regression-report.json"
    ]
  },
  critical: {
    features: ["src/features/**/*.feature"],
    require: [
      "src/support/hooks.ts",
      "src/step-definitions/**/*.ts"
    ],
    requireModule: ["ts-node/register"],
    tags: "@critical and not @skip",
    format: [
      "progress-bar",
      "html:reports/critical-report.html"
    ]
  }
};
