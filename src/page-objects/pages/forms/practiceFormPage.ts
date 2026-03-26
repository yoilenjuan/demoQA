import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';
import { BasePage } from '../../base-page';
import { logger } from '@utils/logger';

/**
 * Practice Form Page Object for DemoQA Forms module
 * URL: https://demoqa.com/automation-practice-form
 */
export class PracticeFormPage extends BasePage {
  // Personal info
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly mobileInput: Locator;

  // Submit button
  private readonly submitButton: Locator;

  // Confirmation modal
  private readonly confirmationModal: Locator;
  private readonly modalCloseButton: Locator;
  private readonly modalTable: Locator;

  constructor(page: Page) {
    super(page, 'https://demoqa.com/automation-practice-form');

    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#userEmail');
    this.mobileInput = page.locator('#userNumber');

    this.submitButton = page.locator('#submit');

    this.confirmationModal = page.locator('.modal-content');
    this.modalCloseButton = page.locator('#closeLargeModal');
    this.modalTable = page.locator('.table-responsive');
  }

  /**
   * Verify the practice form page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    logger.info('Verifying Practice Form page is loaded');
    await this.waitForElement(this.firstNameInput);
    await this.waitForElement(this.lastNameInput);
    await this.waitForElement(this.submitButton);
    logger.info('Practice Form page loaded successfully');
  }

  /**
   * Fill first and last name
   */
  async fillName(firstName: string, lastName: string): Promise<void> {
    logger.info('Filling name fields', { firstName, lastName });
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
  }

  /**
   * Fill email
   */
  async fillEmail(email: string): Promise<void> {
    logger.info('Filling email', { email });
    await this.fill(this.emailInput, email);
  }

  /**
   * Select gender by value: 'Male' | 'Female' | 'Other'
   */
  async selectGender(gender: 'Male' | 'Female' | 'Other'): Promise<void> {
    logger.info('Selecting gender', { gender });
    const label = this.page.locator(`label[for="gender-radio-${gender === 'Male' ? 1 : gender === 'Female' ? 2 : 3}"]`);
    await label.click();
  }

  /**
   * Fill mobile number
   */
  async fillMobile(mobile: string): Promise<void> {
    logger.info('Filling mobile', { mobile });
    await this.fill(this.mobileInput, mobile);
  }

  /**
   * Fill current address
   */
  async fillCurrentAddress(address: string): Promise<void> {
    logger.info('Filling current address');
    const currentAddressInput = this.page.locator('#currentAddress');
    await this.fill(currentAddressInput, address);
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    logger.info('Submitting practice form');
    // Scroll to submit button to avoid ad overlays
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
  }

  /**
   * Verify the confirmation modal appeared after successful submission
   */
  async verifyConfirmationModal(): Promise<void> {
    logger.info('Verifying confirmation modal');
    await expect(this.confirmationModal).toBeVisible({ timeout: 10000 });
    await expect(this.modalTable).toBeVisible({ timeout: 5000 });
    logger.info('Confirmation modal verified');
  }

  /**
   * Get submitted data from the confirmation modal table
   */
  async getSubmittedValue(label: string): Promise<string> {
    const row = this.page.locator(`.table-responsive tr`, { hasText: label });
    const cell = row.locator('td').nth(1);
    return cell.innerText();
  }

  /**
   * Close the confirmation modal
   */
  async closeModal(): Promise<void> {
    logger.info('Closing confirmation modal');
    await this.modalCloseButton.click();
  }

  /**
   * Check if the form page is at the expected URL
   */
  async verifyUrl(): Promise<void> {
    const url = await this.getCurrentUrl();
    expect(url).toContain('automation-practice-form');
  }
}
