import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from 'playwright';
import { browserManager } from '@utils/browser-manager';
import { logger } from '@utils/logger';
import { environment } from '@config/environment';

export interface CustomWorldOptions extends IWorldOptions {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  testData?: any;
  scenario?: any;
}

/**
 * Custom Cucumber World for sharing state between step definitions
 * Provides managed browser instances and test context
 */
export class CustomWorld extends World {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public testData: Map<string, any> = new Map();
  public scenario: any;

  constructor(options: CustomWorldOptions) {
    super(options);
    logger.debug('CustomWorld instantiated', { 
      scenarioName: (options as any).pickle?.name 
    });
  }

  /**
   * Initialize browser for the test scenario
   */
  async initializeBrowser(browserName?: string): Promise<void> {
    try {
      const browser = browserName || environment.getBrowserConfig().browser;
      logger.info(`Initializing browser for scenario: ${this.scenario?.pickle?.name}`, { browser });

      // Launch browser
      this.browser = await browserManager.launchBrowser(browser);
      
      // Create context
      this.context = await browserManager.createContext(this.browser);
      
      // Create page
      this.page = await browserManager.createPage(this.context);
      
      logger.info('Browser initialized successfully', { 
        browserName: browser,
        scenarioName: this.scenario?.pickle?.name 
      });
      
    } catch (error) {
      logger.error('Failed to initialize browser', { 
        error: (error as Error).message,
        scenarioName: this.scenario?.pickle?.name 
      });
      throw error;
    }
  }

  /**
   * Capture screenshot with descriptive name
   */
  async captureScreenshot(name: string): Promise<string | null> {
    if (!this.page) {
      logger.warn('Cannot capture screenshot: page not initialized');
      return null;
    }

    try {
      const screenshotPath = `${environment.getConfig().screenshotsPath}/${name}-${Date.now()}.png`;
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      logger.info(`Screenshot captured: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      logger.error('Failed to capture screenshot', { 
        name, 
        error: (error as Error).message 
      });
      return null;
    }
  }

  /**
   * Store test data for sharing between steps
   */
  setTestData(key: string, value: any): void {
    this.testData.set(key, value);
    logger.debug(`Test data stored: ${key}`, { value });
  }

  /**
   * Retrieve test data
   */
  getTestData<T>(key: string): T | undefined {
    const value = this.testData.get(key) as T;
    logger.debug(`Test data retrieved: ${key}`, { value });
    return value;
  }

  /**
   * Clear all test data
   */
  clearTestData(): void {
    this.testData.clear();
    logger.debug('Test data cleared');
  }

  /**
   * Clean up browser instances
   */
  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up browser instances for scenario', { 
        scenarioName: this.scenario?.pickle?.name 
      });

      // Close page first, checking if it exists and is not already closed
      if (this.page && !this.page.isClosed()) {
        try {
          await this.page.close();
          logger.debug('Page closed successfully during cleanup');
        } catch (pageError) {
          logger.warn('Error closing page during cleanup', { error: pageError });
        }
      }
      
      // Close context, checking if it exists
      if (this.context) {
        try {
          await this.context.close();
          logger.debug('Context closed successfully during cleanup');
        } catch (contextError) {
          logger.warn('Error closing context during cleanup', { error: contextError });
        }
      }
      
      // Close browser, checking if it exists
      if (this.browser) {
        try {
          await this.browser.close();
          logger.debug('Browser closed successfully during cleanup');
        } catch (browserError) {
          logger.warn('Error closing browser during cleanup', { error: browserError });
        }
      }

      this.clearTestData();
      
      logger.info('Browser cleanup completed successfully');
    } catch (error) {
      logger.error('Error during browser cleanup', { 
        error: (error as Error).message 
      });
    }
  }
}

// Set the custom world constructor
setWorldConstructor(CustomWorld);