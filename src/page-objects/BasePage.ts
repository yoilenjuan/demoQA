import { Page } from "@playwright/test";
import logger from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page, baseURL: string = "https://demoqa.com") {
    this.page = page;
    this.baseURL = baseURL;
  }

  /**
   * Navigate to a specific path with enhanced logging and traceability
   */
  async navigateTo(path: string = ""): Promise<void> {
    const url = `${this.baseURL}${path}`;
    
    logger.browserAction('Navigation started', { url, path });
    
    await this.page.goto(url, { 
      waitUntil: "domcontentloaded",
      timeout: 30000
    });
    
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    
    logger.browserAction('Navigation completed', { 
      finalUrl: this.page.url(),
      title: await this.page.title()
    });
  }

  /**
   * Get the current page URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for element to be visible with enhanced error handling
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    logger.browserAction('Waiting for element', { selector, timeout });
    
    try {
      await this.page.waitForSelector(selector, { timeout });
      logger.browserAction('Element found', { selector });
    } catch (error) {
      logger.error('Element not found', error as Error, { selector, timeout });
      throw error;
    }
  }

  /**
   * Click on element with enhanced logging
   */
  async click(selector: string): Promise<void> {
    logger.browserAction('Clicking element', { selector });
    
    await this.waitForElement(selector);
    await this.page.click(selector);
    
    logger.browserAction('Element clicked', { selector });
  }

  /**
   * Fill text input with enhanced validation
   */
  async fillText(selector: string, text: string): Promise<void> {
    logger.browserAction('Filling text', { selector, text: text.substring(0, 50) + (text.length > 50 ? '...' : '') });
    
    await this.waitForElement(selector);
    await this.page.fill(selector, text);
    
    // Verify the text was filled correctly
    const actualValue = await this.page.inputValue(selector);
    if (actualValue !== text) {
      logger.warn('Text fill verification failed', { 
        expected: text, 
        actual: actualValue,
        selector
      });
    }
    
    logger.browserAction('Text filled', { selector, verified: actualValue === text });
  }

  /**
   * Get text from element with error handling
   */
  async getText(selector: string): Promise<string> {
    logger.browserAction('Getting text', { selector });
    
    await this.waitForElement(selector);
    const text = await this.page.textContent(selector) || "";
    
    logger.browserAction('Text retrieved', { selector, text: text.substring(0, 100) });
    
    return text;
  }

  /**
   * Check if element is visible with detailed logging
   */
  async isVisible(selector: string, timeout: number = 2000): Promise<boolean> {
    logger.browserAction('Checking visibility', { selector, timeout });
    
    try {
      await this.page.waitForSelector(selector, { timeout, state: 'visible' });
      logger.browserAction('Element is visible', { selector });
      return true;
    } catch {
      logger.browserAction('Element is not visible', { selector });
      return false;
    }
  }

  /**
   * Take screenshot with metadata
   */
  async takeScreenshot(fileName: string, reason: string = 'manual'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFileName = `${fileName}_${timestamp}.png`;
    const filePath = path.join('reports', 'screenshots', fullFileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await this.page.screenshot({ 
      path: filePath,
      fullPage: true,
      animations: 'disabled'
    });
    
    logger.screenshot(filePath, reason);
    
    // Log screenshot capture info
    logger.info(`Screenshot captured: ${fileName}`, {
      filePath,
      reason,
      timestamp
    });
    
    return filePath;
  }
}

export default BasePage;
