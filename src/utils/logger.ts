import * as winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

/**
 * Logger configuration and setup
 */
class Logger {
  private logger: winston.Logger;
  private currentScenarioId: string | null = null;
  private currentFeature: string | null = null;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.metadata({ fillWith: ['scenarioId', 'feature', 'step', 'browser'] }),
        winston.format.printf(({ timestamp, level, message, metadata, stack }) => {
          const metaString = metadata && Object.keys(metadata).length > 0 
            ? ` [${Object.entries(metadata).map(([k, v]) => `${k}:${v}`).join(', ')}]` 
            : '';
          return `${timestamp} [${level.toUpperCase()}]${metaString} ${message}${stack ? '\n' + stack : ''}`;
        })
      ),
      transports: [
        // Console output for development
        new winston.transports.Console({
          level: process.env.CONSOLE_LOG_LEVEL || 'info',
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File output for all logs
        new winston.transports.File({
          filename: path.join('logs', 'test-execution.log'),
          level: 'debug',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          tailable: true
        }),
        // Separate file for errors
        new winston.transports.File({
          filename: path.join('logs', 'errors.log'),
          level: 'error',
          maxsize: 5 * 1024 * 1024, // 5MB
          maxFiles: 3
        }),
        // JSON format for structured logging
        new winston.transports.File({
          filename: path.join('logs', 'test-results.json'),
          level: 'info',
          format: winston.format.json(),
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5
        })
      ],
      exitOnError: false
    });
  }

  /**
   * Start a new test scenario logging session
   */
  startScenario(scenarioName: string, featureName: string): string {
    this.currentScenarioId = uuidv4();
    this.currentFeature = featureName;
    
    this.logger.info('Test scenario started', {
      scenarioId: this.currentScenarioId,
      feature: featureName,
      scenario: scenarioName,
      startTime: new Date().toISOString()
    });
    
    return this.currentScenarioId;
  }

  /**
   * End the current test scenario logging session
   */
  endScenario(status: 'passed' | 'failed' | 'skipped' = 'passed', error?: Error): void {
    if (!this.currentScenarioId) return;

    this.logger.info('Test scenario ended', {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      status,
      endTime: new Date().toISOString(),
      error: error?.message
    });

    if (error) {
      this.logger.error('Scenario failed with error', {
        scenarioId: this.currentScenarioId,
        feature: this.currentFeature,
        error: error.message,
        stack: error.stack
      });
    }

    this.currentScenarioId = null;
    this.currentFeature = null;
  }

  /**
   * Log a test step
   */
  step(stepText: string, status: 'started' | 'passed' | 'failed' = 'started'): void {
    this.logger.info(`Step ${status}: ${stepText}`, {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      step: stepText,
      stepStatus: status
    });
  }

  /**
   * Log browser action
   */
  browserAction(action: string, details?: any): void {
    this.logger.debug(`Browser action: ${action}`, {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      browserAction: action,
      details
    });
  }

  /**
   * Log screenshot capture
   */
  screenshot(filePath: string, reason: string = 'step'): void {
    this.logger.info(`Screenshot captured: ${reason}`, {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      screenshot: filePath,
      reason
    });
  }

  /**
   * Log assertion result
   */
  assertion(description: string, expected: any, actual: any, passed: boolean): void {
    const level = passed ? 'info' : 'warn';
    this.logger[level](`Assertion ${passed ? 'passed' : 'failed'}: ${description}`, {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      assertion: description,
      expected,
      actual,
      passed
    });
  }

  /**
   * Generic logging methods
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      ...meta
    });
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      ...meta
    });
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      ...meta
    });
  }

  error(message: string, error?: Error, meta?: any): void {
    this.logger.error(message, {
      scenarioId: this.currentScenarioId,
      feature: this.currentFeature,
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  }

  /**
   * Get current scenario ID
   */
  getCurrentScenarioId(): string | null {
    return this.currentScenarioId;
  }

  /**
   * Get current feature name
   */
  getCurrentFeature(): string | null {
    return this.currentFeature;
  }
}

// Singleton instance
const logger = new Logger();

export default logger;
export { Logger };