import { Page } from "@playwright/test";
import BasePage from "./BasePage";

export class ElementsPage extends BasePage {
  // Locators
  private readonly textBoxLink = "//span[text()='Text Box']";
  private readonly fullNameInput = "#fullName";
  private readonly emailInput = "#email";
  private readonly currentAddressInput = "textarea[placeholder='Current address']";
  private readonly permanentAddressInput = "textarea[placeholder='Permanent address']";
  private readonly submitButton = "button[id='submit']";

  // Results
  private readonly outputName = "#output #name";
  private readonly outputEmail = "#output #email";
  private readonly outputCurrentAddress = "#output #currentAddress";
  private readonly outputPermanentAddress = "#output #permanentAddress";

  constructor(page: Page) {
    super(page, "https://demoqa.com");
  }

  /**
   * Navigate to Elements section
   */
  async navigateToElements(): Promise<void> {
    await this.navigateTo("/elements");
  }

  /**
   * Click on Text Box link
   */
  async clickTextBoxLink(): Promise<void> {
    await this.click(this.textBoxLink);
    await this.waitForElement(this.fullNameInput);
  }

  /**
   * Fill Text Box form
   */
  async fillTextBoxForm(userData: {
    fullName: string;
    email: string;
    currentAddress: string;
    permanentAddress: string;
  }): Promise<void> {
    await this.fillText(this.fullNameInput, userData.fullName);
    await this.fillText(this.emailInput, userData.email);
    await this.fillText(this.currentAddressInput, userData.currentAddress);
    await this.fillText(this.permanentAddressInput, userData.permanentAddress);
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    await this.click(this.submitButton);
  }

  /**
   * Get submitted name
   */
  async getSubmittedName(): Promise<string> {
    return await this.getText(this.outputName);
  }

  /**
   * Get submitted email
   */
  async getSubmittedEmail(): Promise<string> {
    return await this.getText(this.outputEmail);
  }

  /**
   * Get submitted current address
   */
  async getSubmittedCurrentAddress(): Promise<string> {
    return await this.getText(this.outputCurrentAddress);
  }

  /**
   * Get submitted permanent address
   */
  async getSubmittedPermanentAddress(): Promise<string> {
    return await this.getText(this.outputPermanentAddress);
  }
}

export default ElementsPage;
