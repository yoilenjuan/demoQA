require('dotenv').config();

const common = {
  requireModule: [
    'ts-node/register',
    'tsconfig-paths/register'
  ],
  require: [
    'src/step-definitions/**/*.ts',
    'src/support/hooks.ts',
    'src/support/world.ts'
  ],
  format: [
    'progress-bar',
    'allure-cucumberjs/reporter:reports/allure-stream',
    'json:reports/cucumber-report.json',
    'html:reports/cucumber-report.html',
    '@cucumber/pretty-formatter'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  timeout: 60000, // 60 segundos para cada step
  retry: 1,         // Retry once on flaky failures (e.g. transient "page closed" errors)
};

const profiles = {
  default: {
    ...common,
    paths: ['src/features/**/*.feature'],
    tags: 'not @skip and not @manual'
  },
  
  debug: {
    ...common,
    paths: ['src/features/**/*.feature'],
    tags: 'not @skip and not @manual',
    format: [
      'progress-bar',
      '@cucumber/pretty-formatter'
    ],
    formatOptions: {
      ...common.formatOptions,
      colorsEnabled: true
    }
  },
  
  smoke: {
    ...common,
    paths: ['src/features/**/*.feature'],
    tags: '@smoke and not @skip'
  },
  
  regression: {
    ...common,
    paths: ['src/features/**/*.feature'], 
    tags: '@regression and not @skip'
  },
  
  critical: {
    ...common,
    paths: ['src/features/**/*.feature'],
    tags: '@critical and not @skip'
  },
  
  parallel: {
    ...common,
    paths: ['src/features/**/*.feature'],
    tags: 'not @skip and not @manual',
    parallel: 2
  }
};

module.exports = profiles;