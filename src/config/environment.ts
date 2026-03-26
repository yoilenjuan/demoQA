import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvironmentConfig {
  // Base configuration
  baseUrl: string;
  environment: string;
  
  // Browser configuration
  headless: boolean;
  browser: 'chromium' | 'firefox' | 'webkit';
  viewportWidth: number;
  viewportHeight: number;
  slowMo: number;
  debugStep: boolean;
  
  // Test configuration
  defaultTimeout: number;
  actionTimeout: number;
  navigationTimeout: number;
  
  // Parallel execution
  workers: number;
  retries: number;
  
  // Logging configuration
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logToFile: boolean;
  logFilePath: string;
  
  // Reporting configuration
  allureResultsDir: string;
  
  // Test data configuration
  testDataPath: string;
  screenshotsPath: string;
  downloadsPath: string;
}

/**
 * Centralized Environment Configuration Manager
 * Provides type-safe access to environment variables with defaults
 */
class Environment {
  private readonly config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): EnvironmentConfig {
    const isCI = process.env.CI === 'true';
    
    return {
      // Base configuration
      baseUrl: process.env.BASE_URL || 'https://demoqa.com',
      environment: process.env.ENVIRONMENT || 'dev',
      
      // Browser configuration
      headless: isCI ? true : (process.env.HEADLESS !== 'false'),
      browser: (process.env.BROWSER as any) || 'chromium',
      viewportWidth: parseInt(process.env.VIEWPORT_WIDTH || '1280'),
      viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT || '720'),
      slowMo: parseInt(process.env.SLOW_MO || '0'),
      debugStep: process.env.DEBUG_STEP === 'true',
      
      // Test configuration
      defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
      actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '10000'),  
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
      
      // Parallel execution
      workers: isCI ? parseInt(process.env.CI_WORKERS || '2') : parseInt(process.env.WORKERS || '1'),
      retries: isCI ? parseInt(process.env.CI_RETRIES || '2') : parseInt(process.env.RETRIES || '0'),
      
      // Logging configuration
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
      logToFile: process.env.LOG_TO_FILE === 'true',
      logFilePath: process.env.LOG_FILE_PATH || 'logs/test-execution.log',
      
      // Reporting configuration
      allureResultsDir: process.env.ALLURE_RESULTS_DIR || 'reports/allure-results',
      
      // Test data configuration
      testDataPath: process.env.TEST_DATA_PATH || 'src/test-data',
      screenshotsPath: process.env.SCREENSHOTS_PATH || 'reports/screenshots',
      downloadsPath: process.env.DOWNLOADS_PATH || 'test-results/downloads'
    };
  }

  /**
   * Get the complete environment configuration
   */
  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Get base URL for the application under test
   */
  public getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Get current environment (dev, test, staging, prod)
   */
  public getEnvironment(): string {
    return this.config.environment;
  }

  /**
   * Check if running in CI environment
   */
  public isCI(): boolean {
    return process.env.CI === 'true';
  }

  /**
   * Check if running in headless mode
   */
  public isHeadless(): boolean {
    return this.config.headless;
  }

  /**
   * Get browser configuration
   */
  public getBrowserConfig() {
    return {
      browser: this.config.browser,
      headless: this.config.headless,
      viewport: {
        width: this.config.viewportWidth,
        height: this.config.viewportHeight
      },
      slowMo: this.config.slowMo,
      debugStep: this.config.debugStep
    };
  }

  /**
   * Get timeout configuration
   */
  public getTimeouts() {
    return {
      default: this.config.defaultTimeout,
      action: this.config.actionTimeout,
      navigation: this.config.navigationTimeout
    };
  }

  /**
   * Get parallel execution configuration
   */
  public getParallelConfig() {
    return {
      workers: this.config.workers,
      retries: this.config.retries
    };
  }

  /**
   * Validate environment configuration
   */
  public validateConfig(): void {
    const requiredVars = ['BASE_URL'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (this.config.viewportWidth < 320 || this.config.viewportHeight < 240) {
      throw new Error('Viewport dimensions are too small');
    }

    if (this.config.defaultTimeout < 1000) {
      throw new Error('Default timeout is too small');
    }
  }
}

// Export singleton instance
export const environment = new Environment();

// Validate configuration on module load
environment.validateConfig();