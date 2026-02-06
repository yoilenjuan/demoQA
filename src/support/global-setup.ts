import { FullConfig } from '@playwright/test';
import logger from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  const startTime = new Date().toISOString();
  
  // Create necessary directories
  const directories = [
    'reports',
    'reports/allure-results',
    'reports/serenity', 
    'reports/screenshots',
    'reports/videos',
    'logs'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

  // Initialize environment info for Allure
  const environmentInfo = {
    'Test Start Time': startTime,
    'Base URL': process.env.BASE_URL || 'https://demoqa.com',
    'Browser': process.env.BROWSER || 'chromium',
    'Headless Mode': process.env.HEADLESS || 'true',
    'Environment': process.env.NODE_ENV || 'test',
    'Test Environment': process.env.TEST_ENV || 'local',
    'Node Version': process.version,
    'Platform': process.platform,
    'Workers': config.workers?.toString() || 'auto',
    'Retries': config.projects[0]?.retries?.toString() || '0',
    'Timeout': config.timeout?.toString() || '30000'
  };

  // Write environment info for Allure
  const allureResultsDir = 'reports/allure-results';
  if (fs.existsSync(allureResultsDir)) {
    fs.writeFileSync(
      path.join(allureResultsDir, 'environment.properties'), 
      Object.entries(environmentInfo)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')
    );
  }

  // Write environment JSON for other tools
  fs.writeFileSync(
    'reports/environment.json',
    JSON.stringify(environmentInfo, null, 2)
  );

  logger.info('🚀 Global setup completed', {
    startTime,
    directories: directories.length,
    environment: environmentInfo
  });

  console.log('🚀 Global Test Setup Completed');
  console.log(`📊 Environment: ${environmentInfo.Environment}`);
  console.log(`🌐 Base URL: ${environmentInfo['Base URL']}`);
  console.log(`🔧 Workers: ${environmentInfo.Workers}`);
}

export default globalSetup;