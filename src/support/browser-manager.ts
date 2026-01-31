import { Browser, BrowserContext, Page, chromium, firefox, webkit } from "@playwright/test";
import config from "../config/config";

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  public page: Page | null = null;

  async initialize(): Promise<void> {
    const browserType = config.browser.toLowerCase();

    switch (browserType) {
      case "firefox":
        this.browser = await firefox.launch({ headless: config.headless });
        break;
      case "webkit":
        this.browser = await webkit.launch({ headless: config.headless });
        break;
      case "chromium":
      default:
        this.browser = await chromium.launch({ headless: config.headless });
        break;
    }

    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    if (config.slowMo > 0) {
      this.page.context().browser()?.close();
      this.browser = await chromium.launch({
        headless: config.headless,
        slowMo: config.slowMo
      });
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();
    }
  }

  async navigateTo(url: string): Promise<void> {
    if (!this.page) throw new Error("Page not initialized");
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async close(): Promise<void> {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

export default new BrowserManager();
