import { Page } from "@playwright/test";

export class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page, baseURL: string = "https://demoqa.com") {
    this.page = page;
    this.baseURL = baseURL;
  }

  /**
   * Navigate to a specific path
   */
  async navigateTo(path: string = ""): Promise<void> {
    const url = `${this.baseURL}${path}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
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
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Click on element
   */
  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Fill text input
   */
  async fillText(selector: string, text: string): Promise<void> {
    await this.page.fill(selector, text);
  }

  /**
   * Get text from element
   */
  async getText(selector: string): Promise<string> {
    return await this.page.textContent(selector) || "";
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(fileName: string): Promise<void> {
    await this.page.screenshot({ path: `reports/screenshots/${fileName}.png` });
  }
}

export default BasePage;
