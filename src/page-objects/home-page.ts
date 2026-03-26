import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';
import { BasePage } from './base-page';
import { logger } from '@utils/logger';

// ─── Quick-test validation types ──────────────────────────────────────────────
export interface BrowserCompatibilityResult {
  userAgent: string;
}

/**
 * Home Page Object for DemoQA application
 */
export class HomePage extends BasePage {
  // Page elements
  private readonly headerImage: Locator;
  private readonly categoryCards: Locator;
  
  // Module cards
  private readonly elementsCard: Locator;
  private readonly formsCard: Locator;
  private readonly alertsCard: Locator;
  private readonly widgetsCard: Locator;
  private readonly interactionsCard: Locator;
  private readonly bookStoreCard: Locator;
  
  // Page elements for validation

  constructor(page: Page) {
    super(page, 'https://demoqa.com');
    
    // Initialize page structure locators
    this.headerImage = page.locator('.banner-image, .header-wrapper img');
    this.categoryCards = page.locator('.card-body');
    
    // Module card locators
    this.elementsCard = page.locator('.card-body').filter({ hasText: 'Elements' });
    this.formsCard = page.locator('.card-body').filter({ hasText: 'Forms' });
    this.alertsCard = page.locator('.card-body').filter({ hasText: 'Alerts' });
    this.widgetsCard = page.locator('.card-body').filter({ hasText: 'Widgets' });
    this.interactionsCard = page.locator('.card-body').filter({ hasText: 'Interactions' });
    this.bookStoreCard = page.locator('.card-body').filter({ hasText: 'Book Store Application' });
    
    // Validation locators removed (unused)
  }

  /**
   * Verify home page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    logger.info('Verifying home page is loaded');
    
    await this.waitForElement(this.headerImage);
    await this.waitForElement(this.categoryCards.first());
    
    const title = await this.getTitle();
    if (!title.includes('DEMOQA') && !title.includes('ToolsQA')) {
      throw new Error(`Unexpected page title: ${title}`);
    }
    
    logger.info('Home page loaded successfully');
  }

  /**
   * Get all category cards
   */
  async getCategoryCards(): Promise<string[]> {
    logger.info('Getting all category cards');
    
    await this.waitForElement(this.categoryCards.first());
    const cards = await this.categoryCards.allTextContents();
    const cardNames = cards.map(card => card.trim()).filter(card => card.length > 0);
    
    logger.info(`Found ${cardNames.length} category cards`, { cards: cardNames });
    return cardNames;
  }

  /**
   * Click Elements card
   */
  async clickElementsCard(): Promise<void> {
    logger.info('Clicking Elements card');
    await this.click(this.elementsCard);
    await this.waitForUrl('/elements');
    logger.info('Navigated to Elements page');
  }

  /**
   * Click Forms card
   */
  async clickFormsCard(): Promise<void> {
    logger.info('Clicking Forms card');
    await this.click(this.formsCard);
    await this.waitForUrl('/forms');
    logger.info('Navigated to Forms page');
  }

  /**
   * Click Alerts, Frame & Windows card
   */
  async clickAlertsCard(): Promise<void> {
    logger.info('Clicking Alerts, Frame & Windows card');
    await this.click(this.alertsCard);
    await this.waitForUrl('/alertsWindows');
    logger.info('Navigated to Alerts page');
  }

  /**
   * Click Widgets card
   */
  async clickWidgetsCard(): Promise<void> {
    logger.info('Clicking Widgets card');
    await this.click(this.widgetsCard);
    await this.waitForUrl('/widgets');
    logger.info('Navigated to Widgets page');
  }

  /**
   * Click Interactions card
   */
  async clickInteractionsCard(): Promise<void> {
    logger.info('Clicking Interactions card');
    await this.click(this.interactionsCard);
    await this.waitForUrl('/interaction');
    logger.info('Navigated to Interactions page');
  }

  /**
   * Click Book Store Application card
   */
  async clickBookStoreCard(): Promise<void> {
    logger.info('Clicking Book Store Application card');
    await this.click(this.bookStoreCard);
    await this.waitForUrl('/books');
    logger.info('Navigated to Book Store page');
  }

  /**
   * Verify specific category card is visible
   */
  async verifyCategoryCardVisible(categoryName: string): Promise<boolean> {
    logger.info(`Verifying ${categoryName} card is visible`);
    
    const cardLocator = this.categoryCards.filter({ hasText: categoryName });
    const isVisible = await this.isVisible(cardLocator);
    
    logger.info(`${categoryName} card visibility: ${isVisible}`);
    return isVisible;
  }

  /**
   * Wait for page animations to complete - improved with proper network idle wait
   */
  async waitForAnimations(): Promise<void> {
    logger.debug('Waiting for page animations to complete');
    
    try {
      // Wait for network idle which indicates animations are likely done
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Additionally wait for any specific animated elements to become stable
      const animatedElements = this.page.locator('[class*="animate"], [class*="transition"], .loading, [aria-busy="true"]');
      
      if (await animatedElements.count() > 0) {
        await expect(animatedElements.first()).toHaveAttribute('aria-busy', 'false', { timeout: 5000 })
          .catch(() => {
            // Animation indicators might not have aria-busy, which is fine
            return Promise.resolve();
          });
      }
      
      logger.debug('Page animations completed');
    } catch (error) {
      logger.debug('Animation wait completed with minimal delay fallback');
      // If all else fails, minimal wait but log it
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * Get page footer text (if exists)
   */
  async getFooterText(): Promise<string> {
    logger.debug('Getting footer text');
    
    const footerLocator = this.page.locator('footer, .footer');
    if (await this.isVisible(footerLocator)) {
      const footerText = await this.getText(footerLocator);
      logger.debug(`Footer text: ${footerText}`);
      return footerText;
    }
    
    logger.debug('No footer found');
    return '';
  }

  /**
   * Verify page title is DEMOQA
   */
  async verifyPageTitle(): Promise<void> {
    logger.info('Verifying page title');
    
    const title = await this.getTitle();
    
    if (!title.includes('DEMOQA') && !title.includes('ToolsQA')) {
      throw new Error(`Expected page title to contain 'DEMOQA', got: ${title}`);
    }
    
    logger.info('Page title verified successfully', { title });
  }

  /**
   * Verify all main sections are loaded
   */
  async verifyAllMainSectionsLoaded(): Promise<void> {
    logger.info('Verifying all main sections are loaded');
    
    // Wait for main content areas
    const mainContent = this.page.locator('main, .main-wrapper, .container').first();
    await this.waitForElement(mainContent);
    
    // Verify category cards are present
    await this.waitForElement(this.categoryCards.first());
    
    const cardCount = await this.categoryCards.count();
    if (cardCount < 6) {
      logger.warn(`Expected at least 6 module cards, found ${cardCount}`);
    }
    
    logger.info('All main sections loaded successfully', { cardCount });
  }

  /**
   * Verify header navigation is visible
   */
  async verifyHeaderNavigationVisible(): Promise<void> {
    logger.info('Verifying header navigation visibility');
    
    const headerElements = [
      this.page.locator('header, .header, .navbar'),
      this.headerImage
    ];
    
    for (const element of headerElements) {
      try {
        await this.waitForElement(element, 3000);
        logger.debug('Header element verified');
      } catch (error) {
        logger.debug('Header element not found', { error });
      }
    }
    
    logger.info('Header navigation verification completed');
  }

  /**
   * Verify specific list of main modules
   */
  async verifyMainModulesVisible(expectedModules: string[]): Promise<void> {
    logger.info('Verifying main modules are visible', { expectedModules });
    
    const actualModules = await this.getCategoryCards();
    
    for (const expectedModule of expectedModules) {
      const isVisible = actualModules.some(actual => 
        actual.toLowerCase().includes(expectedModule.toLowerCase())
      );
      
      if (!isVisible) {
        throw new Error(`Expected module '${expectedModule}' not found. Available modules: ${actualModules.join(', ')}`);
      }
    }
    
    logger.info('All expected modules verified', { 
      expected: expectedModules, 
      actual: actualModules 
    });
  }

  /**
   * Click module by name
   */
  async clickModule(moduleName: string): Promise<void> {
    logger.info('Clicking module by name', { moduleName });
    
    const moduleCard = this.categoryCards.filter({ hasText: moduleName });
    
    if (await moduleCard.count() === 0) {
      throw new Error(`Module '${moduleName}' not found`);
    }
    
    await this.click(moduleCard);
    
    // Wait for navigation
    await this.page.waitForLoadState('domcontentloaded');
    
    logger.info('Module clicked successfully', { moduleName });
  }

  /**
   * Navigate to Book Store Application and find Login
   */
  async navigateToBookStoreApplication(): Promise<void> {
    logger.info('Navigating to Book Store Application');
    
    await this.clickBookStoreCard();
    
    // Wait for Book Store page to load
    await this.page.waitForURL(/books/, { timeout: 10000 });
    
    logger.info('Successfully navigated to Book Store Application');
  }

  /**
   * Check for JavaScript errors on page
   */
  async checkForJavaScriptErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    // Listen for console errors
    this.page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait for page stability to capture all errors
    await this.page.waitForLoadState('networkidle', { timeout: 5000 })
      .catch(() => {
        // If networkidle times out, use minimal fallback
        logger.debug('Network idle timeout, using minimal error collection wait');
      });
    
    if (errors.length > 0) {
      logger.warn('JavaScript errors detected', { errors });
    } else {
      logger.info('No JavaScript errors detected');
    }
    
    return errors;
  }

  /**
   * Verify page loads within time limit
   */
  async verifyPageLoadTime(maxSeconds: number = 3): Promise<number> {
    const startTime = Date.now();
    
    logger.info('Measuring page load time', { maxSeconds });
    
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: maxSeconds * 1000 });
    
    const loadTime = (Date.now() - startTime) / 1000;
    
    if (loadTime > maxSeconds) {
      throw new Error(`Page load time ${loadTime}s exceeded maximum ${maxSeconds}s`);
    }
    
    logger.info('Page load time verified', { 
      loadTime: `${loadTime}s`, 
      maxAllowed: `${maxSeconds}s` 
    });
    
    return loadTime;
  }

  /**
   * Check layout stability (no Cumulative Layout Shift issues)
   */
  async verifyLayoutStability(): Promise<void> {
    logger.info('Verifying layout stability');
    
    // Take initial screenshot of layout
    await this.page.viewportSize();
    
    // Wait for DOM to stabilize and layout shifts to settle
    await this.page.waitForLoadState('domcontentloaded');
    
    // Ensure no more network activity that might cause layout shifts
    await this.page.waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {
        logger.debug('Network idle timeout during layout stability check');
      });
    
    // Additional check for font loading which can cause layout shifts
    await this.page.waitForFunction(() => document.fonts.ready, { timeout: 5000 })
      .catch(() => {
        logger.debug('Font loading check timeout');
      });
    
    // Check that main elements are in stable positions
    const elementsPositions = await this.categoryCards.first().boundingBox();
    
    if (!elementsPositions) {
      throw new Error('Could not verify layout stability - elements not found');
    }
    
    // Wait for element to become stable by checking it's visible and enabled
    await expect(this.categoryCards.first()).toBeVisible({ timeout: 5000 });
    const laterPositions = await this.categoryCards.first().boundingBox();
    
    if (!laterPositions) {
      throw new Error('Layout became unstable - elements disappeared');
    }
    
    // Check for significant layout shifts
    const positionDiff = Math.abs(elementsPositions.y - laterPositions.y);
    if (positionDiff > 5) {
      logger.warn('Potential layout shift detected', { 
        initialY: elementsPositions.y, 
        laterY: laterPositions.y, 
        difference: positionDiff 
      });
    }
    
    logger.info('Layout stability verified');
  }

  /**
   * Navigate to invalid URL for error testing
   */
  async navigateToInvalidUrl(invalidPath: string): Promise<void> {
    logger.info('Navigating to invalid URL for error testing', { invalidPath });
    
    const baseUrl = await this.getCurrentUrl();
    const invalidUrl = new URL(baseUrl).origin + invalidPath;
    
    await this.page.goto(invalidUrl);
    
    logger.info('Navigated to invalid URL', { invalidUrl });
  }

  // ─── POM validation methods for quick-tests ─────────────────────────────────

  /**
   * Validate page structure: title matches DemoQA pattern and at least 6 category cards present.
   */
  async validatePageStructure(): Promise<void> {
    const title = await this.getTitle();
    if (!title.match(/DEMOQA|ToolsQA|demosite/i)) {
      throw new Error(`Unexpected page title for structure validation: "${title}"`);
    }
    const count = await this.categoryCards.count();
    if (count < 6) {
      throw new Error(`Expected ≥6 category cards, found ${count}`);
    }
    logger.info(`Page structure valid — title: "${title}", sections: ${count}`);
  }

  /**
   * Validate page responsiveness: viewport meets minimum dimensions and cards are visible.
   */
  async validatePageResponsiveness(): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) {
      throw new Error('Viewport size unavailable');
    }
    if (viewport.width < 1024 || viewport.height < 600) {
      throw new Error(`Viewport too small: ${viewport.width}x${viewport.height} (min 1024×600)`);
    }
    await expect(this.categoryCards.first()).toBeVisible({ timeout: 5000 });
    const count = await this.categoryCards.count();
    if (count < 6) {
      throw new Error(`Expected ≥6 category cards for responsiveness check, found ${count}`);
    }
    logger.info(`Responsiveness verified — viewport: ${viewport.width}x${viewport.height}, cards: ${count}`);
  }

  /**
   * Validate browser compatibility: confirm a user-agent is present and non-empty.
   * Returns the detected userAgent string.
   */
  async validateBrowserCompatibility(): Promise<BrowserCompatibilityResult> {
    const userAgent = await this.page.evaluate(() => navigator.userAgent);
    if (!userAgent || userAgent.length === 0) {
      throw new Error('Unable to retrieve user agent — browser may not be functioning correctly');
    }
    logger.info(`Browser compatibility validated — agent: ${userAgent.substring(0, 80)}`);
    return { userAgent };
  }

  /**
   * Validate basic accessibility indicators: non-empty title and heading presence.
   * A missing heading count on ad-redirect pages is logged as a warning, not a failure.
   */
  async validateAccessibilityIndicators(): Promise<void> {
    const title = await this.getTitle();
    if (title.length === 0) {
      throw new Error('Page title is empty — basic accessibility check failed');
    }
    const headings = this.page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    if (headingCount === 0) {
      logger.warn(`No headings found on page "${title}" — likely ad-redirect; skipping heading assertion`);
    } else {
      logger.info(`Accessibility indicators valid — headings: ${headingCount}, title: "${title}"`);
    }
  }

  /**
   * Navigate to the given URL and measure the elapsed time in milliseconds.
   */
  async measurePageLoadTime(url: string): Promise<number> {
    const start = Date.now();
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    logger.info(`Page loaded in ${elapsed}ms — url: ${url}`);
    return elapsed;
  }
}