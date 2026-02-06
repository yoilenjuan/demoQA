import { configure, StreamReporter } from '@serenity-js/core';
import { Photographer, TakePhotosOfFailures, TakePhotosOfInteractions } from '@serenity-js/web';
import { PlaywrightOptions } from '@serenity-js/playwright';
import config from './config';

/**
 * Serenity/JS Configuration
 */
export const serenityConfig = configure({
  // Core Serenity configuration
  crew: [
    // Console reporter for real-time feedback
    '@serenity-js/console-reporter',
    
    // Serenity BDD reporter for rich HTML reports
    [ '@serenity-js/serenity-bdd', {
      specDirectory: 'src/features',
      outputDirectory: 'reports/serenity'
    }],
    
    // Photographer for screenshots
    [ Photographer.whoWill(TakePhotosOfFailures), {
      photoNamingStrategy: {
        prefix: 'failure',
        suffix: 'screenshot'
      }
    }],
    
    [ Photographer.whoWill(TakePhotosOfInteractions), {
      photoNamingStrategy: {
        prefix: 'interaction',
        suffix: 'screenshot'
      }
    }],
    
    // Stream reporter for structured output
    StreamReporter.withDefaultColourSupport()
      .thatReportsActivityFinished()\n      .thatReportsArtifacts()\n      .thatReportsTestResults()
  ],

  // Playwright configuration for Serenity
  playwright: {
    baseURL: config.baseURL,
    headless: config.headless,
    slowMo: config.slowMo,
    timeout: config.timeout,
    screenshot: 'only-on-failure',
    video: config.videoOnFailure ? 'retain-on-failure' : 'off',
    trace: 'on-first-retry'
  } as PlaywrightOptions,

  // Test execution configuration
  defaultTimeout: config.timeout,
  
  // Reporting configuration
  outputDirectory: 'reports/serenity',
  
  // Environment information
  environment: {
    BASE_URL: config.baseURL,
    BROWSER: config.browser,
    HEADLESS: config.headless.toString(),
    NODE_ENV: process.env.NODE_ENV || 'test',
    TEST_ENV: process.env.TEST_ENV || 'local'
  }
});

export default serenityConfig;