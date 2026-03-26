import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';
import { BasePage } from '../../base-page';
import { logger } from '@utils/logger';

/**
 * Alerts, Frame & Windows Page Object for DemoQA
 * URL: https://demoqa.com/alertsWindows
 */
export class AlertsWindowsPage extends BasePage {
  // Alert buttons
  private readonly alertButton: Locator;
  private readonly confirmButton: Locator;
  private readonly promptButton: Locator;

  // Result display
  private readonly confirmResult: Locator;
  private readonly promptResult: Locator;

  // Browser windows buttons
  private readonly newTabButton: Locator;

  // Modal buttons
  private readonly smallModalButton: Locator;
  private readonly largeModalButton: Locator;
  private readonly modalCloseButton: Locator;
  private readonly smallModalTitle: Locator;
  private readonly largeModalTitle: Locator;

  constructor(page: Page) {
    super(page, 'https://demoqa.com/alertsWindows');

    this.alertButton = page.locator('#alertButton');
    this.confirmButton = page.locator('#confirmButton');
    this.promptButton = page.locator('#promtButton');

    this.confirmResult = page.locator('#confirmResult');
    this.promptResult = page.locator('#promptResult');

    this.newTabButton = page.locator('#tabButton');

    this.smallModalButton = page.locator('#showSmallModal');
    this.largeModalButton = page.locator('#showLargeModal');
    this.modalCloseButton = page.locator('#closeSmallModal, #closeLargeModal').first();
    this.smallModalTitle = page.locator('.modal-title');
    this.largeModalTitle = page.locator('.modal-title');
  }

  /**
   * Verify the alerts section page is loaded
   */
  async verifyAlertsPageLoaded(): Promise<void> {
    logger.info('Verifying Alerts page');
    await this.waitForElement(this.alertButton);
    logger.info('Alerts page loaded');
  }

  /**
   * Trigger a simple alert and auto-accept it
   */
  async triggerAndAcceptAlert(): Promise<void> {
    logger.info('Triggering alert and accepting');
    this.page.once('dialog', async dialog => {
      logger.info('Alert message', { message: dialog.message() });
      await dialog.accept();
    });
    await this.alertButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Trigger a confirm dialog, accept or dismiss it
   */
  async triggerConfirmDialog(accept: boolean): Promise<void> {
    logger.info('Triggering confirm dialog', { accept });
    this.page.once('dialog', async dialog => {
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
    await this.confirmButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify the confirm result text
   */
  async verifyConfirmResult(expectedText: string): Promise<void> {
    logger.info('Verifying confirm result', { expectedText });
    await expect(this.confirmResult).toContainText(expectedText);
  }

  /**
   * Trigger a prompt dialog with a given input value
   */
  async triggerPromptDialog(inputValue: string): Promise<void> {
    logger.info('Triggering prompt dialog', { inputValue });
    this.page.once('dialog', async dialog => {
      await dialog.accept(inputValue);
    });
    await this.promptButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify the prompt result text
   */
  async verifyPromptResult(expectedText: string): Promise<void> {
    logger.info('Verifying prompt result', { expectedText });
    await expect(this.promptResult).toContainText(expectedText);
  }

  /**
   * Open new tab and verify it opens
   */
  async openNewTab(): Promise<Page> {
    logger.info('Opening new tab');
    const newTabPromise = this.page.context().waitForEvent('page');
    await this.newTabButton.click();
    const newTab = await newTabPromise;
    await newTab.waitForLoadState('domcontentloaded');
    logger.info('New tab opened', { url: newTab.url() });
    return newTab;
  }

  /**
   * Show the small modal and verify it is visible
   */
  async showSmallModal(): Promise<void> {
    logger.info('Opening small modal');
    await this.smallModalButton.click();
    await expect(this.smallModalTitle).toBeVisible({ timeout: 5000 });
    logger.info('Small modal opened');
  }

  /**
   * Show the large modal and verify it is visible
   */
  async showLargeModal(): Promise<void> {
    logger.info('Opening large modal');
    await this.largeModalButton.click();
    await expect(this.largeModalTitle).toBeVisible({ timeout: 5000 });
    logger.info('Large modal opened');
  }

  /**
   * Close the currently open modal
   */
  async closeModal(): Promise<void> {
    logger.info('Closing modal');
    await this.modalCloseButton.click();
  }

  /**
   * Navigate to the Alerts sub-section
   */
  async navigateToAlerts(): Promise<void> {
    await this.page.goto('https://demoqa.com/alerts', { waitUntil: 'domcontentloaded' });
    logger.info('Navigated to Alerts page');
  }

  /**
   * Navigate to the Browser Windows sub-section
   */
  async navigateToBrowserWindows(): Promise<void> {
    await this.page.goto('https://demoqa.com/browser-windows', { waitUntil: 'domcontentloaded' });
    logger.info('Navigated to Browser Windows page');
  }

  /**
   * Navigate to the Frames sub-section
   */
  async navigateToFrames(): Promise<void> {
    await this.page.goto('https://demoqa.com/frames', { waitUntil: 'domcontentloaded' });
    logger.info('Navigated to Frames page');
  }

  /**
   * Navigate to the Modal Dialogs sub-section
   */
  async navigateToModalDialogs(): Promise<void> {
    await this.page.goto('https://demoqa.com/modal-dialogs', { waitUntil: 'domcontentloaded' });
    logger.info('Navigated to Modal Dialogs page');
  }
}
