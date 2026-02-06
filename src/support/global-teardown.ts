import { FullConfig } from '@playwright/test';
import logger from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global teardown runs once after all tests
 */
async function globalTeardown(config: FullConfig) {
  const endTime = new Date().toISOString();

  logger.info('🏁 Global teardown started', { endTime });

  // Generate test execution summary
  const summary = {
    executionEndTime: endTime,
    totalProjects: config.projects.length,
    reportLocations: {
      allure: 'reports/allure-results',
      serenity: 'reports/serenity',
      playwright: 'reports/playwright-report',
      screenshots: 'reports/screenshots',
      logs: 'logs'
    },
    nextSteps: [
      'Run: npm run test:report - to view Allure report',
      'Run: npm run test:serenity - to view Serenity report',
      'Check: reports/playwright-report/index.html - for Playwright HTML report'
    ]
  };

  // Write summary file
  fs.writeFileSync(
    'reports/test-execution-summary.json',
    JSON.stringify(summary, null, 2)
  );

  // Count artifacts
  const artifactCounts = {
    screenshots: countFilesInDir('reports/screenshots', '.png'),
    videos: countFilesInDir('reports/videos', '.webm'),
    allureResults: countFilesInDir('reports/allure-results', '.json'),
    logFiles: countFilesInDir('logs', '.log')
  };

  logger.info('📊 Test execution completed', {
    summary,
    artifacts: artifactCounts
  });

  console.log('🏁 Global Test Teardown Completed');
  console.log('📊 Test Execution Summary:');
  console.log(`   📸 Screenshots: ${artifactCounts.screenshots}`);
  console.log(`   🎥 Videos: ${artifactCounts.videos}`);
  console.log(`   📋 Allure Results: ${artifactCounts.allureResults}`);
  console.log(`   📝 Log Files: ${artifactCounts.logFiles}`);
  console.log('');
  console.log('📈 View Reports:');
  console.log('   🔍 Allure: npm run test:report');
  console.log('   🎭 Serenity: npm run test:serenity');
  console.log('   🎪 Playwright: check reports/playwright-report/index.html');
}

function countFilesInDir(dir: string, extension: string): number {
  try {
    if (!fs.existsSync(dir)) return 0;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    return files
      .filter(file => file.isFile() && file.name.endsWith(extension))
      .length;
  } catch {
    return 0;
  }
}

export default globalTeardown;