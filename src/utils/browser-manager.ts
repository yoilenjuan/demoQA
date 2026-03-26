import { Browser, BrowserContext, Page, chromium, firefox, webkit, BrowserType } from 'playwright';
import { environment } from '@config/environment';
import { logger } from '@utils/logger';

/**
 * Centralized Browser Manager for Playwright
 * Provides managed browser instances with proper lifecycle handling
 */
export class BrowserManager {
  private static instance: BrowserManager;
  private browsers: Map<string, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();
  private pages: Map<string, Page> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  /**
   * Get browser type based on name
   */
  private getBrowserType(browserName: string): BrowserType {
    switch (browserName.toLowerCase()) {
      case 'chromium':
      case 'chrome':
        return chromium;
      case 'firefox':
        return firefox;
      case 'webkit':
      case 'safari':
        return webkit;
      default:
        logger.warn(`Unknown browser: ${browserName}, defaulting to chromium`);
        return chromium;
    }
  }

  /**
   * Launch a new browser instance
   */
  public async launchBrowser(
    browserName: string = environment.getBrowserConfig().browser,
    options: any = {}
  ): Promise<Browser> {
    const browserId = `${browserName}-${Date.now()}`;
    
    try {
      logger.info(`Launching browser: ${browserName}`, { browserId });
      
      const browserType = this.getBrowserType(browserName);
      const config = environment.getBrowserConfig();
      
      const launchOptions = {
        headless: config.headless,
        viewport: config.viewport,
        slowMo: config.slowMo || (environment.isCI() ? 0 : 100), // Use configured slow motion
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ],
        ...options
      };

      // Debug mode specific options
      if (config.debugStep) {
        launchOptions.slowMo = Math.max(launchOptions.slowMo || 0, 1500);
        launchOptions.devtools = !config.headless; // Open DevTools in debug mode
      }

      // Add Chrome-specific options
      if (browserName.toLowerCase().includes('chrome')) {
        launchOptions.args.push(
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor'
        );
      }

      const browser = await browserType.launch(launchOptions);
      this.browsers.set(browserId, browser);
      
      logger.info(`Browser launched successfully: ${browserName}`, { 
        browserId, 
        headless: config.headless 
      });
      
      return browser;
    } catch (error) {
      logger.error(`Failed to launch browser: ${browserName}`, { 
        browserId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Create a new browser context
   */
  public async createContext(
    browser: Browser,
    options: any = {}
  ): Promise<BrowserContext> {
    const contextId = `context-${Date.now()}`;
    
    try {
      logger.info('Creating browser context', { contextId });
      
      const config = environment.getConfig();
      const timeouts = environment.getTimeouts();
      
      const contextOptions = {
        viewport: {
          width: config.viewportWidth,
          height: config.viewportHeight
        },
        ignoreHTTPSErrors: true,
        acceptDownloads: true,
        recordVideo: environment.isCI() ? undefined : {
          dir: 'test-results/videos/',
          size: { width: 1280, height: 720 }
        },
        recordHar: environment.isCI() ? undefined : {
          path: `test-results/har/trace-${contextId}.har`
        },
        ...options
      };

      const context = await browser.newContext(contextOptions);
      
      // Set timeouts
      context.setDefaultTimeout(timeouts.default);
      context.setDefaultNavigationTimeout(timeouts.navigation);
      
      this.contexts.set(contextId, context);
      
      logger.info('Browser context created successfully', { contextId });
      
      return context;
    } catch (error) {
      logger.error('Failed to create browser context', { 
        contextId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Create a new page
   */
  public async createPage(context: BrowserContext): Promise<Page> {
    const pageId = `page-${Date.now()}`;
    
    try {
      logger.info('Creating new page', { pageId });
      
      const page = await context.newPage();
      
      // Set up page event listeners
      this.setupPageEventListeners(page, pageId);
      
      this.pages.set(pageId, page);
      
      logger.info('Page created successfully', { pageId });
      
      return page;
    } catch (error) {
      logger.error('Failed to create page', { 
        pageId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Set up page event listeners for logging and debugging
   */
  private setupPageEventListeners(page: Page, pageId: string): void {
    // Log console messages
    page.on('console', (msg) => {
      logger.debug(`Browser console [${msg.type()}]: ${msg.text()}`, { pageId });
    });

    // Log page errors
    page.on('pageerror', (error) => {
      logger.error(`Page error: ${error.message}`, { pageId, stack: error.stack });
    });

    // Log failed requests
    page.on('requestfailed', (request) => {
      logger.warn(`Request failed: ${request.url()}`, { 
        pageId, 
        method: request.method(),
        failure: request.failure()?.errorText 
      });
    });

    // Log response errors
    page.on('response', (response) => {
      if (response.status() >= 400) {
        logger.warn(`Response error: ${response.url()} [${response.status()}]`, {
          pageId,
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Log navigation events
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        logger.info(`Page navigated to: ${frame.url()}`, { pageId });
      }
    });
  }

  /**
   * Navigate to a URL with retry logic
   */
  public async navigateToUrl(
    page: Page, 
    url: string, 
    options: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; retries?: number } = {}
  ): Promise<void> {
    const { waitUntil = 'domcontentloaded', retries = 3 } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.info(`Navigating to URL (attempt ${attempt}/${retries}): ${url}`);
        
        const startTime = Date.now();
        await page.goto(url, { waitUntil, timeout: environment.getTimeouts().navigation });
        const duration = Date.now() - startTime;
        
        logger.performance('Page navigation', duration, { url, waitUntil });
        return;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Navigation attempt ${attempt} failed: ${(error as Error).message}`, { url, attempt });
        
        if (attempt < retries) {
          await this.delay(1000 * attempt); // Progressive delay
        }
      }
    }
    
    logger.error(`Failed to navigate to URL after ${retries} attempts: ${url}`, { 
      error: lastError?.message 
    });
    throw lastError || new Error(`Failed to navigate to ${url}`);
  }

  /**
   * Wait for a specified time
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close a specific page
   */
  public async closePage(pageId: string): Promise<void> {
    const page = this.pages.get(pageId);
    if (page) {
      await page.close();
      this.pages.delete(pageId);
      logger.info(`Page closed: ${pageId}`);
    }
  }

  /**
   * Close a specific context
   */
  public async closeContext(contextId: string): Promise<void> {
    const context = this.contexts.get(contextId);
    if (context) {
      await context.close();
      this.contexts.delete(contextId);
      logger.info(`Context closed: ${contextId}`);
    }
  }

  /**
   * Close a specific browser
   */
  public async closeBrowser(browserId: string): Promise<void> {
    const browser = this.browsers.get(browserId);
    if (browser) {
      await browser.close();
      this.browsers.delete(browserId);
      logger.info(`Browser closed: ${browserId}`);
    }
  }

  /**
   * Close all browsers, contexts, and pages
   */
  public async closeAll(): Promise<void> {
    logger.info('Closing all browser instances');
    
    // Close all pages
    for (const [pageId, page] of this.pages) {
      try {
        await page.close();
        logger.debug(`Page closed: ${pageId}`);
      } catch (error) {
        logger.warn(`Error closing page ${pageId}: ${(error as Error).message}`);
      }
    }
    this.pages.clear();

    // Close all contexts
    for (const [contextId, context] of this.contexts) {
      try {
        await context.close();
        logger.debug(`Context closed: ${contextId}`);
      } catch (error) {
        logger.warn(`Error closing context ${contextId}: ${(error as Error).message}`);
      }
    }
    this.contexts.clear();

    // Close all browsers
    for (const [browserId, browser] of this.browsers) {
      try {
        await browser.close();
        logger.debug(`Browser closed: ${browserId}`);
      } catch (error) {
        logger.warn(`Error closing browser ${browserId}: ${(error as Error).message}`);
      }
    }
    this.browsers.clear();
    
    logger.info('All browser instances closed');
  }

  /**
   * Get current number of active instances
   */
  public getActiveInstancesCount(): { browsers: number; contexts: number; pages: number } {
    return {
      browsers: this.browsers.size,
      contexts: this.contexts.size,
      pages: this.pages.size
    };
  }
}

// Export singleton instance
export const browserManager = BrowserManager.getInstance();