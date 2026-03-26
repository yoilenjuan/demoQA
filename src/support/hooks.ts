import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import { logger } from '@utils/logger';
import { browserManager } from '@utils/browser-manager';
import { environment } from '@config/environment';

/**
 * Global test hooks for Cucumber BDD framework
 */

// Set default timeout FIRST, before any hooks
setDefaultTimeout(60 * 1000);

// Setup before all tests
BeforeAll(async function () {
  logger.info('='.repeat(80));
  logger.info('STARTING TEST EXECUTION');
  logger.info('='.repeat(80));
  
  const config = environment.getConfig();
  logger.info('Test Configuration:', {
    environment: config.environment,
    baseUrl: config.baseUrl,
    browser: config.browser,
    headless: config.headless,
    workers: config.workers,
    retries: config.retries,
    debugMode: {
      slowMo: config.slowMo,
      debugStep: config.debugStep
    }
  });

  // Log debug mode information
  if (!config.headless || config.slowMo > 0 || config.debugStep) {
    logger.warn('🔍 DEBUG MODE ENABLED', {
      headless: config.headless,
      slowMo: config.slowMo,
      debugStep: config.debugStep,
      message: 'Tests will run with visual debugging features'
    });
  }

  logger.info('Framework initialization completed');
});

// Before each scenario
Before(async function (this: CustomWorld, scenario) {
  this.scenario = scenario;
  
  logger.scenario(scenario.pickle.name, {
    feature: scenario.gherkinDocument.feature?.name,
    tags: scenario.pickle.tags.map(tag => tag.name)
  });

  // Initialize browser for the scenario
  await this.initializeBrowser();
  
  logger.info('Scenario setup completed', {
    scenarioName: scenario.pickle.name,
    feature: scenario.gherkinDocument.feature?.name
  });
});

// After each scenario
After(async function (this: CustomWorld, scenario) {
  const scenarioResult = scenario.result;
  const duration = scenarioResult?.duration?.seconds ? 
    Math.round(scenarioResult.duration.seconds * 1000) : 0;
  
  // Log scenario result
  const status = scenarioResult?.status === Status.PASSED ? 'PASSED' : 
                 scenarioResult?.status === Status.FAILED ? 'FAILED' : 'SKIPPED';
  
  logger.testResult(
    scenario.pickle.name, 
    status as 'PASSED' | 'FAILED' | 'SKIPPED', 
    duration,
    {
      feature: scenario.gherkinDocument.feature?.name,
      tags: scenario.pickle.tags.map(tag => tag.name)
    }
  );

  // Capture screenshot on failure
  if (scenarioResult?.status === Status.FAILED) {
    logger.error(`Scenario failed: ${scenario.pickle.name}`, {
      error: scenarioResult.message
    });
    
    const screenshotName = `failed-${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await this.captureScreenshot(screenshotName);
    
    // Attach screenshot to Cucumber report
    if (this.page && !this.page.isClosed()) {
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        this.attach(screenshot, 'image/png');
      } catch (error) {
        logger.warn('Failed to attach screenshot to report', { error: (error as Error).message });
      }
    }

    // Capture page source on failure - only if page is still active
    if (this.page && !this.page.isClosed()) {
      try {
        const pageSource = await this.page.content();
        this.attach(pageSource, 'text/html');
        logger.debug('Page source captured and attached to report');
      } catch (error) {
        logger.warn('Failed to attach page source to report', { error: (error as Error).message });
      }
    }

    // Capture console logs on failure
    // Note: Console logs would need to be collected during the test if needed
  }

  // Clean up browser instances
  await this.cleanup();
  
  logger.info('Scenario cleanup completed', {
    scenarioName: scenario.pickle.name,
    status,
    duration: `${duration}ms`
  });
});

// After all tests
AfterAll(async function () {
  logger.info('='.repeat(80));
  logger.info('TEST EXECUTION COMPLETED');
  logger.info('='.repeat(80));
  
  // Ensure all browsers are closed
  await browserManager.closeAll();
  
  const activeInstances = browserManager.getActiveInstancesCount();
  logger.info('Browser cleanup status:', activeInstances);
  
  if (activeInstances.browsers > 0 || activeInstances.contexts > 0 || activeInstances.pages > 0) {
    logger.warn('Some browser instances may not have been properly closed');
  }
  
  logger.info('Framework teardown completed');

  // Close logger to ensure all logs are flushed
  await logger.close();
});