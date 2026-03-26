import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { AlertsWindowsPage } from '../../page-objects/pages/alerts/alertsWindowsPage';
import { logger } from '../../utils/logger';

/**
 * Step definitions for Alerts, Frame & Windows Feature
 */

Given('I navigate to the Alerts page', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Navigate to Alerts page');
  const alertsPage = new AlertsWindowsPage(world.page);
  await alertsPage.navigateToAlerts();
  world.setTestData('alertsPage', alertsPage);
  logger.info('On Alerts page');
});

Given('I navigate to the Modal Dialogs page', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Navigate to Modal Dialogs page');
  const alertsPage = new AlertsWindowsPage(world.page);
  await alertsPage.navigateToModalDialogs();
  world.setTestData('alertsPage', alertsPage);
  logger.info('On Modal Dialogs page');
});

Given('I navigate to the Browser Windows page', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Navigate to Browser Windows page');
  const alertsPage = new AlertsWindowsPage(world.page);
  await alertsPage.navigateToBrowserWindows();
  world.setTestData('alertsPage', alertsPage);
  logger.info('On Browser Windows page');
});

When('I trigger and accept the simple alert', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Trigger and accept simple alert');
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  await alertsPage.triggerAndAcceptAlert();
});

Then('no error should be thrown', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Verify no error was thrown');
  // If we got here the dialog was handled gracefully
  const url = world.page.url();
  expect(url).toContain('demoqa.com');
  logger.info('No error thrown — dialog handled gracefully');
});

When('I trigger the confirm dialog and accept it', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Trigger and accept confirm dialog');
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  await alertsPage.triggerConfirmDialog(true);
});

When('I trigger the confirm dialog and dismiss it', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Trigger and dismiss confirm dialog');
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  await alertsPage.triggerConfirmDialog(false);
});

Then('the confirm result should display {string}', async function (this: CustomWorld, expectedText: string) {
  const world = this as CustomWorld;
  logger.step('Verify confirm result', { expectedText });
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  await alertsPage.verifyConfirmResult(expectedText);
});

When('I trigger the prompt dialog and enter {string}', async function (this: CustomWorld, inputValue: string) {
  const world = this as CustomWorld;
  logger.step('Trigger prompt dialog and enter value', { inputValue });
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  await alertsPage.triggerPromptDialog(inputValue);
});

Then('the prompt result should display {string}', async function (this: CustomWorld, expectedText: string) {
  const world = this as CustomWorld;
  logger.step('Verify prompt result', { expectedText });
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  await alertsPage.verifyPromptResult(expectedText);
});

When('I open the small modal', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Open small modal');
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  await alertsPage.showSmallModal();
});

Then('the modal title should be visible', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Verify modal title is visible');
  const modalTitle = world.page.locator('.modal-title');
  await expect(modalTitle).toBeVisible({ timeout: 5000 });
  logger.info('Modal title visible');
});

When('I close the modal', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Close modal');
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  await alertsPage.closeModal();
});

Then('the modal should be dismissed', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Verify modal is dismissed');
  const modal = world.page.locator('.modal-content');
  await expect(modal).not.toBeVisible({ timeout: 5000 });
  logger.info('Modal dismissed');
});

When('I click the new tab button', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Click new tab button');
  const alertsPage = world.getTestData<AlertsWindowsPage>('alertsPage') ?? new AlertsWindowsPage(world.page);
  const newTab = await alertsPage.openNewTab();
  world.setTestData('newTab', newTab);
});

Then('a new browser tab should be opened with valid content', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Verify new tab has valid content');
  const newTab = world.getTestData<import('@playwright/test').Page>('newTab');
  expect(newTab).toBeTruthy();
  if (newTab) {
    const url = newTab.url();
    expect(url.length).toBeGreaterThan(0);
    logger.info('New tab has valid content', { url });
    await newTab.close();
  }
});
