import { defineConfig, devices } from "@playwright/test";
import * as path from 'path';

export default defineConfig({
  testDir: "./src/features",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60 * 1000, // 60 seconds
  expect: {
    timeout: 10 * 1000 // 10 seconds for assertions
  },
  reporter: [
    ["html", { 
      outputFolder: "reports/playwright-report",
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ["json", { outputFile: "reports/results.json" }],
    ["junit", { outputFile: "reports/junit-results.xml" }],
    ["allure-playwright", {
      outputFolder: "reports/allure-results",
      detail: true,
      suiteTitle: false
    }],
    ["line"]
  ],
  use: {
    baseURL: process.env.BASE_URL || "https://demoqa.com",
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
    launchOptions: {
      slowMo: parseInt(process.env.SLOW_MO || '0')
    },
    contextOptions: {
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 720 }
    }
  },
  projects: [
    {
      name: "chromium-smoke",
      testMatch: /.*\.feature$/,
      use: { 
        ...devices["Desktop Chrome"],
        channel: 'chrome'
      },
      metadata: {
        type: 'smoke-tests'
      }
    },
    {
      name: "chromium-regression", 
      testMatch: /.*\.feature$/,
      use: { 
        ...devices["Desktop Chrome"],
        channel: 'chrome'
      },
      metadata: {
        type: 'regression-tests'
      }
    },
    {
      name: "firefox",
      testMatch: /.*\.feature$/,
      use: { ...devices["Desktop Firefox"] },
      metadata: {
        type: 'cross-browser'
      }
    },
    {
      name: "webkit",
      testMatch: /.*\.feature$/,
      use: { ...devices["Desktop Safari"] },
      metadata: {
        type: 'cross-browser'
      }
    },
    {
      name: "mobile-chrome",
      testMatch: /.*\.feature$/,
      use: { ...devices["Pixel 5"] },
      metadata: {
        type: 'mobile-tests'
      }
    }
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./src/support/global-setup.ts'),
  globalTeardown: require.resolve('./src/support/global-teardown.ts'),
  
  webServer: undefined
});
