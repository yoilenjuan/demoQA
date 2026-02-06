import { Before, After, BeforeAll, AfterAll, setDefaultTimeout, BeforeStep, AfterStep, Status } from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';
import browserManager from '../support/browser-manager';
import logger from '../utils/logger';
import config from '../config/config';

// Set default timeout for all steps
setDefaultTimeout(60 * 1000);

// Global variables
let currentScenarioId: string;
let scenarioStartTime: number;
let stepCounter: number = 0;

/**
 * Before All - Setup test environment
 */
BeforeAll(async function () {
  logger.info('🚀 Test suite started', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    baseUrl: config.baseURL,
    browser: config.browser
  });

  // Ensure directories exist
  const dirs = ['logs', 'reports/screenshots', 'reports/allure-results', 'reports/serenity'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Initialize allure environment - create environment.properties file
  const allureResultsDir = 'reports/allure-results';
  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }
  
  const environmentInfo = {
    'Base URL': config.baseURL,
    'Browser': config.browser,
    'Headless': config.headless.toString(),
    'Timeout': config.timeout.toString(),
    'Environment': process.env.NODE_ENV || 'test',
    'Node Version': process.version,
    'Test Start Time': new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(allureResultsDir, 'environment.properties'),
    Object.entries(environmentInfo)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
  );
});

/**
 * Before each scenario - Initialize test context
 */
Before(async function (scenario) {
  scenarioStartTime = Date.now();
  stepCounter = 0;
  
  // Start logging session
  currentScenarioId = logger.startScenario(scenario.pickle.name, getFeatureName(scenario));
  
  logger.info('📋 Scenario setup started', {
    scenarioName: scenario.pickle.name,
    tags: scenario.pickle.tags.map(tag => tag.name),
    uri: scenario.pickle.uri
  });

  // Initialize browser
  await browserManager.initialize();
  
  logger.browserAction('Browser initialized', {
    browserType: config.browser,
    headless: config.headless
  });
});

/**
 * Before each step - Log step start
 */
BeforeStep(async function (step) {
  stepCounter++;
  const stepText = step.pickleStep.text;
  
  logger.step(stepText, 'started');
  
  logger.debug('Step execution started', {
    stepNumber: stepCounter,
    stepText: stepText,
    stepType: step.pickleStep.type
  });
});

/**
 * After each step - Log step completion and capture screenshots
 */
AfterStep(async function (step) {
  const stepText = step.pickleStep.text;
  const stepStatus = step.result?.status === Status.PASSED ? 'passed' : 'failed';
  
  logger.step(stepText, stepStatus);
  
  // Capture screenshot for certain step types or on failure
  if (shouldCaptureScreenshot(step, stepText)) {
    await captureStepScreenshot(stepText, stepCounter, stepStatus);
  }
  
  if (step.result?.status !== Status.PASSED) {
    logger.error('Step failed', step.result?.message ? new Error(step.result.message) : undefined, {
      stepText: stepText,
      stepNumber: stepCounter,
      duration: step.result?.duration
    });
  }
});

/**
 * After each scenario - Cleanup and reporting
 */
After(async function (scenario) {
  const duration = Date.now() - scenarioStartTime;
  const scenarioStatus = scenario.result?.status === Status.PASSED ? 'passed' : 
                        scenario.result?.status === Status.FAILED ? 'failed' : 'skipped';
  
  // Capture final screenshot on failure
  if (scenarioStatus === 'failed') {
    await captureFailureScreenshot(scenario.pickle.name);
    
    // Log error details
    if (scenario.result?.message) {
      logger.error('Scenario failure details', new Error(scenario.result.message));
    }
  }

  // Log scenario completion
  logger.endScenario(
    scenarioStatus, 
    scenario.result?.message ? new Error(scenario.result.message) : undefined
  );

  logger.info('📊 Scenario completed', {
    scenarioName: scenario.pickle.name,
    status: scenarioStatus,
    duration: `${duration}ms`,
    steps: stepCounter,
    tags: scenario.pickle.tags.map(tag => tag.name)
  });

  // Close browser
  await browserManager.close();
  
  logger.browserAction('Browser closed', { duration: `${duration}ms` });
});

/**
 * After All - Cleanup test environment
 */
AfterAll(async function () {
  const totalDuration = Date.now() - (global as any).suiteStartTime;
  
  logger.info('🏁 Test suite completed', {
    timestamp: new Date().toISOString(),
    totalDuration: `${totalDuration}ms`
  });

  // Generate final reports
  logger.info('📈 Generating test reports...', {
    allureResults: 'reports/allure-results',
    serenityResults: 'reports/serenity',
    screenshots: 'reports/screenshots'
  });
});

/**
 * Helper functions
 */
function getFeatureName(scenario: any): string {
  const uri = scenario.pickle.uri || '';
  return path.basename(uri, '.feature').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function shouldCaptureScreenshot(step: any, stepText: string): boolean {
  // Capture on failure
  if (step.result?.status !== Status.PASSED) return true;
  
  // Capture on specific action steps
  const actionKeywords = ['click', 'navigate', 'submit', 'fill', 'select', 'verify', 'should see'];
  return actionKeywords.some(keyword => stepText.toLowerCase().includes(keyword));
}

async function captureStepScreenshot(stepText: string, stepNumber: number, status: string): Promise<void> {
  try {
    const page = browserManager.page;
    if (!page) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedStepText = stepText.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const fileName = `step_${stepNumber}_${sanitizedStepText}_${timestamp}`;
    const filePath = path.join('reports', 'screenshots', `${fileName}.png`);

    await page.screenshot({ 
      path: filePath, 
      fullPage: true,
      animations: 'disabled'
    });

    logger.screenshot(filePath, `step-${status}`);

    // Log screenshot info instead of attaching to Allure (to avoid compatibility issues)
    logger.info(`Screenshot captured for step ${stepNumber}`, {
      filePath,
      stepText: stepText.substring(0, 50),
      status
    });
    
  } catch (error) {
    logger.error('Failed to capture step screenshot', error as Error);
  }
}

async function captureFailureScreenshot(scenarioName: string): Promise<void> {
  try {
    const page = browserManager.page;
    if (!page) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedScenarioName = scenarioName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const fileName = `failure_${sanitizedScenarioName}_${timestamp}`;
    const filePath = path.join('reports', 'screenshots', `${fileName}.png`);

    await page.screenshot({ 
      path: filePath, 
      fullPage: true,
      animations: 'disabled'
    });

    logger.screenshot(filePath, 'failure');

    // Log failure screenshot info instead of attaching to Allure
    logger.info('Failure screenshot captured', {
      filePath,
      scenarioName: scenarioName.substring(0, 50)
    });
    
  } catch (error) {
    logger.error('Failed to capture failure screenshot', error as Error);
  }
}

// Store suite start time
(global as any).suiteStartTime = Date.now();

export {
  currentScenarioId,
  captureStepScreenshot,
  captureFailureScreenshot
};