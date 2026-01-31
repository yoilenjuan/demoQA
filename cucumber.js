module.exports = {
  default: {
    require: ["src/step-definitions/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: [
      "progress-bar",
      "html:reports/cucumber-report.html",
      "json:reports/cucumber-report.json"
    ],
    formatOptions: {
      snippetInterface: "async-await"
    }
  }
};
