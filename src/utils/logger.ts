import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { environment } from '@config/environment';

/**
 * Production-ready Winston Logger Configuration
 * Provides structured logging with different levels and formats
 */
class Logger {
  private readonly logger: winston.Logger;
  private readonly logDir: string;

  constructor() {
    this.logDir = path.dirname(environment.getConfig().logFilePath);
    this.ensureLogDirectory();
    this.logger = this.createLogger();
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Create Winston logger instance with proper configuration
   */
  private createLogger(): winston.Logger {
    const config = environment.getConfig();
    
    // Custom format for better readability
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        const metaString = Object.keys(meta).length > 0 ? ` | Meta: ${JSON.stringify(meta)}` : '';
        const stackString = stack ? `\n${stack}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}${stackString}`;
      })
    );

    const transports: winston.transport[] = [
      // Console transport with colors
      new winston.transports.Console({
        level: config.logLevel,
        format: winston.format.combine(
          winston.format.colorize(),
          customFormat
        )
      })
    ];

    // File transport (if enabled)
    if (config.logToFile) {
      transports.push(
        new winston.transports.File({
          filename: config.logFilePath,
          level: config.logLevel,
          format: customFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        })
      );
      
      // Error-specific log file
      transports.push(
        new winston.transports.File({
          filename: path.join(this.logDir, 'error.log'),
          level: 'error',
          format: customFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 3
        })
      );
    }

    return winston.createLogger({
      level: config.logLevel,
      format: customFormat,
      defaultMeta: {
        service: 'automation-framework',
        environment: config.environment,
        timestamp: new Date().toISOString()
      },
      transports,
      // Handle exceptions and rejections
      exceptionHandlers: config.logToFile ? [
        new winston.transports.File({ 
          filename: path.join(this.logDir, 'exceptions.log') 
        })
      ] : [],
      rejectionHandlers: config.logToFile ? [
        new winston.transports.File({ 
          filename: path.join(this.logDir, 'rejections.log') 
        })
      ] : [],
      exitOnError: false
    });
  }

  /**
   * Log error messages
   */
  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * Log warning messages
   */
  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log info messages
   */
  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log debug messages
   */
  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log test step information
   */
  public step(stepName: string, meta?: any): void {
    this.info(`STEP: ${stepName}`, meta);
  }

  /**
   * Log test scenario information
   */
  public scenario(scenarioName: string, meta?: any): void {
    this.info(`SCENARIO: ${scenarioName}`, meta);
  }

  /**
   * Log performance metrics
   */
  public performance(action: string, duration: number, meta?: any): void {
    this.info(`PERFORMANCE: ${action} took ${duration}ms`, meta);
  }

  /**
   * Log page interactions
   */
  public interaction(action: string, element?: string, meta?: any): void {
    const elementInfo = element ? ` on element: ${element}` : '';
    this.info(`INTERACTION: ${action}${elementInfo}`, meta);
  }

  /**
   * Log test results
   */
  public testResult(testName: string, status: 'PASSED' | 'FAILED' | 'SKIPPED', duration?: number, meta?: any): void {
    const time = duration ? ` in ${duration}ms` : '';
    const logLevel = status === 'FAILED' ? 'error' : 'info';
    this.logger[logLevel](`TEST RESULT: ${testName} - ${status}${time}`, meta);
  }

  /**
   * Cleanup and close logger
   */
  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.end(() => {
        resolve();
      });
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for creating child loggers
export { Logger };