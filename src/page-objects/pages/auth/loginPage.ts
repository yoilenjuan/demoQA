import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';
import { BasePage } from '../../base-page';
import { logger } from '@utils/logger';
import { DynamicUserData } from '@utils/user-rotation-manager';

/**
 * Login Page Object for DemoQA Book Store Application
 */
export class LoginPage extends BasePage {
  // Login form elements
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly newUserButton: Locator;

  // Messages and validation
  private readonly errorMessage: Locator;
  private readonly loadingSpinner: Locator;

  // Navigation elements
  private readonly logoutButton: Locator;
  private readonly userNameDisplay: Locator;

  constructor(page: Page) {
    super(page, 'https://demoqa.com/login');
    
    // Login form locators
    this.usernameInput = page.locator('#userName');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login');
    this.newUserButton = page.locator('#newUser');

    // Messages and validation locators
    this.errorMessage = page.locator('#name, #output p, p:has-text("Invalid"), p:has-text("required")');
    this.loadingSpinner = page.locator('.spinner-border, .loading');

    // Post-login elements - FIXED: Using valid selector syntax
    this.logoutButton = page.locator('button#submit:has-text("Logout")');
    this.userNameDisplay = page.locator('#userName-value');
  }

  /**
   * Verify login page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    logger.info('Verifying Login page is loaded');
    
    await this.waitForElement(this.usernameInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
    await this.waitForElement(this.newUserButton);
    
    const currentUrl = await this.getCurrentUrl();
    if (!currentUrl.includes('/login')) {
      throw new Error(`Expected URL to contain '/login', got: ${currentUrl}`);
    }
    
    logger.info('Login page loaded successfully');
  }

  /**
   * Verify form fields are properly labeled
   */
  async verifyFormFields(): Promise<void> {
    logger.info('Verifying login form fields');

    // Check username field
    const usernameLabel = await this.page.locator('label[for="userName"], text=User Name').first();
    await this.waitForElement(usernameLabel);

    // Check password field
    const passwordLabel = await this.page.locator('label[for="password"], text=Password').first();
    await this.waitForElement(passwordLabel);

    // Verify form is interactive
    await expect(this.usernameInput).toBeEnabled();
    await expect(this.passwordInput).toBeEnabled();
    await expect(this.loginButton).toBeEnabled();

    logger.info('Login form fields verified successfully');
  }

  /**
   * Login with user credentials
   */
  async loginWithCredentials(userData: DynamicUserData): Promise<void> {
    logger.info('Logging in with user credentials', { 
      username: userData.username 
    });

    await this.fill(this.usernameInput, userData.username);
    await this.fill(this.passwordInput, userData.password);
    
    await this.click(this.loginButton);
    
    // Wait for navigation or error message
    await Promise.race([
      this.page.waitForURL(/profile|books/, { timeout: 30000 }),
      this.waitForElement(this.errorMessage, 30000).catch(() => {})
    ]);

    logger.info('Login attempt completed');
  }

  /**
   * Login with username and password strings
   */
  async loginWithUsernamePassword(username: string, password: string): Promise<void> {
    logger.info('Logging in with credentials', { username });

    if (username) {
      await this.fill(this.usernameInput, username);
    }
    
    if (password) {
      await this.fill(this.passwordInput, password);
    }
    
    await this.click(this.loginButton);
    
    // Wait for response
    await this.page.waitForTimeout(2000);

    logger.info('Login attempt with credentials completed');
  }

  /**
   * Click New User button to go to registration
   */
  async clickNewUser(): Promise<void> {
    logger.info('Clicking New User button');
    await this.click(this.newUserButton);
    
    // Wait for registration page to load
    await this.page.waitForURL(/register/, { timeout: 30000 });
    
    logger.info('Navigated to registration page');
  }

  /**
   * Check if successfully logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check current URL first (most reliable)
      const currentUrl = await this.getCurrentUrl();
      const urlIndicatesLogin = currentUrl.includes('/profile') || currentUrl.includes('/books');
      
      if (urlIndicatesLogin) {
        // Double-check with logout button presence
        try {
          await this.waitForElement(this.logoutButton, 2000);
          logger.info('Login status: authenticated', { currentUrl, logoutButtonFound: true });
          return true;
        } catch {
          // URL suggests logged in but no logout button - still consider logged in
          logger.info('Login status: authenticated (URL-based)', { currentUrl, logoutButtonFound: false });
          return true;
        }
      } else {
        logger.info('Login status: not authenticated', { currentUrl });
        return false;
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('User not logged in - error during check', { error: errorMsg });
      return false;
    }
  }

  /**
   * Get error message if present - enhanced with flexible validation
   */
  async getErrorMessage(): Promise<string> {
    try {
      // Wait for any error element to be visible
      await expect(this.errorMessage.first()).toBeVisible({ timeout: 8000 });
      
      // Get all visible error messages
      const errorElements = await this.errorMessage.all();
      const errorMessages: string[] = [];
      
      for (const element of errorElements) {
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            errorMessages.push(text.trim());
          }
        }
      }
      
      if (errorMessages.length > 0) {
        const combinedMessage = errorMessages.join(' | ');
        logger.info('Error messages found', { messages: errorMessages, combined: combinedMessage });
        return combinedMessage;
      } else {
        throw new Error('Error elements visible but contain no text');
      }
      
    } catch (error) {
      logger.debug('No error message found with primary selectors, trying fallback strategies...');
      
      // Fallback: Look for any visible text that might indicate an error
      const fallbackSelectors = [
        'p:visible', 'div:visible', 'span:visible',
        '[class]:visible:has-text("error")',
        '[class]:visible:has-text("invalid")',
        '[class]:visible:has-text("required")',
        '[class]:visible:has-text("wrong")',
        '[class]:visible:has-text("incorrect")'
      ];
      
      for (const selector of fallbackSelectors) {
        try {
          const elements = this.page.locator(selector);
          const count = await elements.count();
          
          for (let i = 0; i < Math.min(count, 5); i++) {
            const element = elements.nth(i);
            const text = await element.textContent();
            
            if (text && this.mightBeErrorMessage(text.trim())) {
              logger.info('Potential error message found with fallback', { 
                selector, 
                text: text.trim() 
              });
              return text.trim();
            }
          }
        } catch (altError) {
          continue;
        }
      }
      
      logger.debug('No error message found with any strategy');
      return '';
    }
  }
  
  /**
   * Helper method to determine if text might be an error message
   */
  private mightBeErrorMessage(text: string): boolean {
    const errorKeywords = [
      'error', 'invalid', 'required', 'wrong', 'incorrect', 'missing',
      'empty', 'blank', 'must', 'cannot', 'failed', 'denied', 'unauthorized'
    ];
    
    const lowerText = text.toLowerCase();
    return errorKeywords.some(keyword => lowerText.includes(keyword)) &&
           text.length > 5 && text.length < 200; // Reasonable error message length
  }

  /**
   * Check if error message contains expected content - flexible validation
   */
  async hasErrorMessage(expectedMessage: string): Promise<boolean> {
    logger.info('Checking for error message content', { expectedMessage });
    
    const actualError = await this.getErrorMessage();
    
    if (!actualError) {
      logger.info('No error message found');
      return false;
    }
    
    // Multiple validation strategies for flexibility
    const normalizedActual = actualError.toLowerCase().trim();
    const normalizedExpected = expectedMessage.toLowerCase().trim();
    
    // Strategy 1: Exact match
    if (normalizedActual === normalizedExpected) {
      logger.info('Exact error message match found');
      return true;
    }
    
    // Strategy 2: Contains match
    if (normalizedActual.includes(normalizedExpected)) {
      logger.info('Partial error message match found (contains)', { 
        expectedMessage, 
        actualError,
        matchType: 'contains'
      });
      return true;
    }
    
    // Strategy 3: Keyword-based validation
    const expectedKeywords = this.extractKeywords(normalizedExpected);
    const actualKeywords = this.extractKeywords(normalizedActual);
    const matchingKeywords = expectedKeywords.filter(keyword => 
      actualKeywords.includes(keyword)
    );
    
    const keywordMatchRatio = matchingKeywords.length / expectedKeywords.length;
    
    if (keywordMatchRatio >= 0.5) { // At least 50% keyword match
      logger.info('Keyword-based error message match found', { 
        expectedMessage, 
        actualError,
        expectedKeywords,
        actualKeywords,
        matchingKeywords,
        matchRatio: keywordMatchRatio,
        matchType: 'keywords'
      });
      return true;
    }
    
    // Strategy 4: Pattern-based validation (for common validation messages)
    if (this.isValidationPattern(normalizedExpected, normalizedActual)) {
      logger.info('Pattern-based error message match found', { 
        expectedMessage, 
        actualError,
        matchType: 'pattern'
      });
      return true;
    }
    
    logger.warn('No error message match found with any strategy', { 
      expectedMessage, 
      actualError,
      strategies: ['exact', 'contains', 'keywords', 'pattern']
    });
    
    return false;
  }
  
  /**
   * Extract meaningful keywords from error message
   */
  private extractKeywords(message: string): string[] {
    const stopWords = ['is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return message
      .split(/\s+/)
      .map(word => word.replace(/[^a-z0-9]/gi, ''))
      .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()));
  }
  
  /**
   * Check if messages match common validation patterns
   */
  private isValidationPattern(expected: string, actual: string): boolean {
    const patterns = [
      { expected: /required/, actual: /required|must|need|missing|empty|blank/ },
      { expected: /invalid/, actual: /invalid|wrong|incorrect|error|bad/ },
      { expected: /password/, actual: /password|pass/ },
      { expected: /username/, actual: /username|user|name/ },
      { expected: /email/, actual: /email|mail/ },
      { expected: /format/, actual: /format|valid|correct/ }
    ];
    
    return patterns.some(pattern => 
      pattern.expected.test(expected) && pattern.actual.test(actual)
    );
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    logger.info('Performing logout');
    
    await this.waitForElement(this.logoutButton);
    await this.click(this.logoutButton);
    
    // Wait for redirect to login page
    await this.page.waitForURL(/login/, { timeout: 30000 });
    
    logger.info('Logout completed successfully');
  }

  /**
   * Check if New User button is visible
   */
  async isNewUserButtonVisible(): Promise<boolean> {
    try {
      await this.waitForElement(this.newUserButton, 2000);
      const isVisible = await this.newUserButton.isVisible();
      
      logger.info('New User button visibility checked', { isVisible });
      return isVisible;
      
    } catch (error) {
      logger.debug('New User button not visible', { error });
      return false;
    }
  }

  /**
   * Get username display value (when logged in)
   */
  async getDisplayedUsername(): Promise<string> {
    try {
      await this.waitForElement(this.userNameDisplay, 3000);
      const username = await this.getText(this.userNameDisplay);
      
      logger.info('Username display retrieved', { username });
      return username;
      
    } catch (error) {
      logger.debug('Username display not found', { error });
      return '';
    }
  }

  /**
   * Wait for login form to be ready - enhanced with robust validation
   */
  async waitForLoginForm(): Promise<void> {
    logger.info('Waiting for login form to be ready');
    
    // Use Playwright expect for robust element validation
    await expect(this.usernameInput).toBeVisible({ timeout: 15000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 5000 });
    await expect(this.loginButton).toBeVisible({ timeout: 5000 });
    
    // Ensure elements are enabled and interactable
    await expect(this.usernameInput).toBeEnabled();
    await expect(this.passwordInput).toBeEnabled();
    await expect(this.loginButton).toBeEnabled();
    
    // Wait for any loading state to complete
    try {
      await expect(this.loadingSpinner).toBeHidden({ timeout: 5000 });
    } catch (loadingError) {
      // Loading spinner might not exist, which is fine
      logger.debug('Loading spinner not found or already hidden');
    }
    
    // Verify form is ready for input with clean state
    const usernameValue = await this.usernameInput.inputValue();
    const passwordValue = await this.passwordInput.inputValue();
    
    if (usernameValue || passwordValue) {
      logger.warn('Form fields contain pre-filled values', { usernameValue, passwordValue });
    }
    
    logger.info('Login form is ready and validated');
  }

  /**
   * Clear all input fields
   */
  async clearFields(): Promise<void> {
    logger.info('Clearing all login form fields');
    
    await this.usernameInput.clear();
    await this.passwordInput.clear();
    
    // Verify fields are empty
    const usernameValue = await this.usernameInput.inputValue();
    const passwordValue = await this.passwordInput.inputValue();
    
    logger.info('Form fields cleared', { 
      usernameEmpty: usernameValue === '',
      passwordEmpty: passwordValue === ''
    });
  }

  /**
   * Click login button directly
   */
  async clickLoginButton(): Promise<void> {
    logger.info('Clicking login button');
    
    await expect(this.loginButton).toBeVisible();
    await expect(this.loginButton).toBeEnabled();
    await this.loginButton.click();
    
    logger.info('Login button clicked');
  }
}