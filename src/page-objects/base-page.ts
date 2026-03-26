import { Page, Locator } from 'playwright';
import { logger } from '@utils/logger';

/**
 * Base Page Object class with common functionality
 * All page objects should extend this class
 */
export abstract class BasePage {
  protected page: Page;
  protected url: string;

  constructor(page: Page, url: string = '') {
    this.page = page;
    this.url = url;
  }

  /**
   * Navigate to the page
   */
  async navigate(): Promise<void> {
    if (!this.url) {
      throw new Error('Page URL not defined');
    }
    
    logger.info(`Navigating to: ${this.url}`);
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await this.waitForPageLoad();
    logger.info(`Successfully navigated to: ${this.url}`);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      // Network idle is optional - some pages may have continuous network activity
      logger.debug('Network idle timeout reached, continuing...');
    });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    const title = await this.page.title();
    logger.debug(`Page title: ${title}`);
    return title;
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    const url = this.page.url();
    logger.debug(`Current URL: ${url}`);
    return url;
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    logger.debug(`Waiting for element to be visible`);
    await locator.waitFor({ state: 'visible', timeout });
    logger.debug(`Element is visible`);
  }

  /**
   * Click element with enhanced error handling
   */
  async click(locator: Locator, options?: { force?: boolean; timeout?: number }): Promise<void> {
    const elementText = await locator.textContent().catch(() => 'Unknown') || 'Unknown';
    logger.interaction(`Click`, elementText);
    
    await this.waitForElement(locator, options?.timeout);
    await locator.click({ force: options?.force });
    
    logger.interaction(`Clicked`, elementText);
  }

  /**
   * Fill input field
   */
  async fill(locator: Locator, value: string, options?: { clear?: boolean }): Promise<void> {
    logger.interaction(`Fill input`, `value: ${value}`);
    
    await this.waitForElement(locator);
    if (options?.clear) {
      await locator.clear();
    }
    await locator.fill(value);
    
    logger.interaction(`Filled input`, `value: ${value}`);
  }

  /**
   * Get element text
   */
  async getText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    const text = await locator.textContent() || '';
    logger.debug(`Element text: ${text}`);
    return text.trim();
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      const isVisible = await locator.isVisible();
      logger.debug(`Element visibility: ${isVisible}`);
      return isVisible;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    try {
      const isEnabled = await locator.isEnabled();
      logger.debug(`Element enabled: ${isEnabled}`);
      return isEnabled;
    } catch {
      return false;
    }
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    logger.interaction(`Scroll to element`);
    await locator.scrollIntoViewIfNeeded();
    logger.interaction(`Scrolled to element`);
  }

  /**
   * Wait for URL to contain specific text
   */
  async waitForUrl(urlPart: string, timeout: number = 30000): Promise<void> {
    logger.debug(`Waiting for URL to contain: ${urlPart}`);
    await this.page.waitForURL(`**/*${urlPart}*`, { timeout });
    logger.debug(`URL contains: ${urlPart}`);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    const screenshotPath = `reports/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    logger.info(`Screenshot taken: ${screenshotPath}`);
  }
}