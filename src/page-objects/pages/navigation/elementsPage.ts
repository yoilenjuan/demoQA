import { Page, Locator } from 'playwright';
import { BasePage } from '../../base-page';
import { logger } from '@utils/logger';

/**
 * Elements Page Object for DemoQA application
 */
export class ElementsPage extends BasePage {
  // Navigation menu
  private readonly leftMenu: Locator;
  private readonly textBoxMenuItem: Locator;
  private readonly checkBoxMenuItem: Locator;
  private readonly radioButtonMenuItem: Locator;
  private readonly webTablesMenuItem: Locator;
  private readonly buttonsMenuItem: Locator;
  private readonly linksMenuItem: Locator;
  private readonly brokenLinksMenuItem: Locator;
  private readonly uploadDownloadMenuItem: Locator;
  private readonly dynamicPropertiesMenuItem: Locator;

  // Text Box elements
  private readonly fullNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly currentAddressInput: Locator;
  private readonly permanentAddressInput: Locator;
  private readonly submitButton: Locator;
  private readonly outputPanel: Locator;

  constructor(page: Page) {
    super(page, 'https://demoqa.com/elements');
    
    // Navigation menu locators — scoped to left panel to avoid ad element matches
    this.leftMenu = page.locator('.left-pannel');
    this.textBoxMenuItem = page.locator('.left-pannel').getByText('Text Box', { exact: true });
    this.checkBoxMenuItem = page.locator('.left-pannel').getByText('Check Box', { exact: true });
    this.radioButtonMenuItem = page.locator('.left-pannel').getByText('Radio Button', { exact: true });
    this.webTablesMenuItem = page.locator('.left-pannel').getByText('Web Tables', { exact: true });
    this.buttonsMenuItem = page.locator('.left-pannel').getByText('Buttons', { exact: true });
    this.linksMenuItem = page.locator('.left-pannel').getByText('Links', { exact: true });
    this.brokenLinksMenuItem = page.locator('.left-pannel').getByText('Broken Links - Images', { exact: true });
    this.uploadDownloadMenuItem = page.locator('.left-pannel').getByText('Upload and Download', { exact: true });
    this.dynamicPropertiesMenuItem = page.locator('.left-pannel').getByText('Dynamic Properties', { exact: true });

    // Text Box form locators
    this.fullNameInput = page.locator('#userName');
    this.emailInput = page.locator('#userEmail');
    this.currentAddressInput = page.locator('#currentAddress');
    this.permanentAddressInput = page.locator('#permanentAddress');
    this.submitButton = page.locator('#submit');
    this.outputPanel = page.locator('#output');
  }

  /**
   * Verify Elements page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    logger.info('Verifying Elements page is loaded');
    
    await this.waitForElement(this.leftMenu);
    
    const currentUrl = await this.getCurrentUrl();
    
    if (!currentUrl.includes('/elements')) {
      throw new Error(`Expected URL to contain '/elements', got: ${currentUrl}`);
    }
    
    logger.info('Elements page loaded successfully');
  }

  /**
   * Click Text Box menu item
   */
  async clickTextBoxMenuItem(): Promise<void> {
    logger.info('Clicking Text Box menu item');
    await this.textBoxMenuItem.evaluate(el => (el as HTMLElement).click());
    await this.page.waitForURL('**/text-box**', { timeout: 30000 });
    logger.info('Navigated to Text Box page');
  }

  /**
   * Click Check Box menu item  
   */
  async clickCheckBoxMenuItem(): Promise<void> {
    logger.info('Clicking Check Box menu item');
    await this.checkBoxMenuItem.evaluate(el => (el as HTMLElement).click());
    await this.page.waitForURL('**/checkbox**', { timeout: 30000 });
    logger.info('Navigated to Check Box page');
  }

  /**
   * Click Radio Button menu item
   */
  async clickRadioButtonMenuItem(): Promise<void> {
    logger.info('Clicking Radio Button menu item');
    await this.radioButtonMenuItem.evaluate(el => (el as HTMLElement).click());
    await this.page.waitForURL('**/radio-button**', { timeout: 30000 });
    logger.info('Navigated to Radio Button page');
  }

  /**
   * Click Web Tables menu item
   */
  async clickWebTablesMenuItem(): Promise<void> {
    logger.info('Clicking Web Tables menu item');
    await this.webTablesMenuItem.evaluate(el => (el as HTMLElement).click());
    await this.page.waitForURL('**/webtables**', { timeout: 30000 });
    logger.info('Navigated to Web Tables page');
  }

  /**
   * Click Buttons menu item
   */
  async clickButtonsMenuItem(): Promise<void> {
    logger.info('Clicking Buttons menu item');
    await this.buttonsMenuItem.evaluate(el => (el as HTMLElement).click());
    await this.page.waitForURL('**/buttons**', { timeout: 30000 });
    logger.info('Navigated to Buttons page');
  }

  /**
   * Fill Text Box form
   */
  async fillTextBoxForm(data: {
    fullName: string;
    email: string; 
    currentAddress: string;
    permanentAddress: string;
  }): Promise<void> {
    logger.info('Filling Text Box form', data);
    
    await this.fill(this.fullNameInput, data.fullName);
    await this.fill(this.emailInput, data.email);
    await this.fill(this.currentAddressInput, data.currentAddress);
    await this.fill(this.permanentAddressInput, data.permanentAddress);
    
    logger.info('Text Box form filled successfully');
  }

  /**
   * Submit Text Box form
   */
  async submitTextBoxForm(): Promise<void> {
    logger.info('Submitting Text Box form');
    await this.click(this.submitButton);
    await this.waitForElement(this.outputPanel);
    logger.info('Text Box form submitted successfully');
  }

  /**
   * Get Text Box form output
   */
  async getTextBoxOutput(): Promise<string> {
    logger.info('Getting Text Box output');
    await this.waitForElement(this.outputPanel);
    const output = await this.getText(this.outputPanel);
    logger.info(`Text Box output retrieved: ${output.substring(0, 100)}...`);
    return output;
  }

  /**
   * Verify Text Box output contains expected data
   */
  async verifyTextBoxOutput(expectedData: {
    fullName: string;
    email: string;
    currentAddress: string;
    permanentAddress: string;
  }): Promise<boolean> {
    logger.info('Verifying Text Box output');
    
    const output = await this.getTextBoxOutput();
    
    const checks = {
      fullName: output.includes(expectedData.fullName),
      email: output.includes(expectedData.email),
      currentAddress: output.includes(expectedData.currentAddress),
      permanentAddress: output.includes(expectedData.permanentAddress)
    };
    
    const allValid = Object.values(checks).every(check => check);
    
    logger.info('Text Box output verification result', { 
      allValid, 
      checks 
    });
    
    return allValid;
  }

  /**
   * Get all menu items
   */
  async getMenuItems(): Promise<string[]> {
    logger.info('Getting all menu items');
    
    const menuItems = [
      this.textBoxMenuItem,
      this.checkBoxMenuItem,
      this.radioButtonMenuItem,
      this.webTablesMenuItem,
      this.buttonsMenuItem,
      this.linksMenuItem,
      this.brokenLinksMenuItem,
      this.uploadDownloadMenuItem,
      this.dynamicPropertiesMenuItem
    ];

    const itemTexts: string[] = [];
    for (const item of menuItems) {
      try {
        if (await this.isVisible(item)) {
          const text = await this.getText(item);
          itemTexts.push(text);
        }
      } catch (error) {
        logger.debug(`Could not get text for menu item: ${(error as Error).message}`);
      }
    }
    
    logger.info(`Found ${itemTexts.length} menu items`, { items: itemTexts });
    return itemTexts;
  }

  /**
   * Verify menu item is visible
   */
  async verifyMenuItemVisible(itemText: string): Promise<boolean> {
    logger.info(`Verifying menu item '${itemText}' is visible`);
    
    const itemLocator = this.page.locator(`text=${itemText}`);
    const isVisible = await this.isVisible(itemLocator);
    
    logger.info(`Menu item '${itemText}' visibility: ${isVisible}`);
    return isVisible;
  }
}