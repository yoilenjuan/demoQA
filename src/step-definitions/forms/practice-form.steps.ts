import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { PracticeFormPage } from '../../page-objects/pages/forms/practiceFormPage';
import { logger } from '../../utils/logger';

/**
 * Step definitions for Practice Form Feature
 */

Given('I am on the Practice Form page', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Navigate to Practice Form page');

  const formPage = new PracticeFormPage(world.page);
  await world.page.goto('https://demoqa.com/automation-practice-form', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await world.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
    logger.debug('Network idle timeout on practice form — continuing');
  });

  await formPage.verifyPageLoaded();
  world.setTestData('formPage', formPage);
  logger.info('Practice Form page ready');
});

When('I fill in the first name {string} and last name {string}', async function (this: CustomWorld, firstName: string, lastName: string) {
  const world = this as CustomWorld;
  logger.step('Fill name fields', { firstName, lastName });
  const formPage = world.getTestData<PracticeFormPage>('formPage') ?? new PracticeFormPage(world.page);
  await formPage.fillName(firstName, lastName);
});

When('I fill in the email {string}', async function (this: CustomWorld, email: string) {
  const world = this as CustomWorld;
  logger.step('Fill email', { email });
  const formPage = world.getTestData<PracticeFormPage>('formPage') ?? new PracticeFormPage(world.page);
  await formPage.fillEmail(email);
});

When('I select gender {string}', async function (this: CustomWorld, gender: string) {
  const world = this as CustomWorld;
  logger.step('Select gender', { gender });
  const formPage = world.getTestData<PracticeFormPage>('formPage') ?? new PracticeFormPage(world.page);
  await formPage.selectGender(gender as 'Male' | 'Female' | 'Other');
});

When('I fill in the mobile number {string}', async function (this: CustomWorld, mobile: string) {
  const world = this as CustomWorld;
  logger.step('Fill mobile number', { mobile });
  const formPage = world.getTestData<PracticeFormPage>('formPage') ?? new PracticeFormPage(world.page);
  await formPage.fillMobile(mobile);
});

When('I submit the practice form', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Submit practice form');
  const formPage = world.getTestData<PracticeFormPage>('formPage') ?? new PracticeFormPage(world.page);
  await formPage.submitForm();
});

Then('the confirmation modal should appear', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Verify confirmation modal');
  const formPage = world.getTestData<PracticeFormPage>('formPage') ?? new PracticeFormPage(world.page);
  await formPage.verifyConfirmationModal();
});

Then('the confirmed student name should be {string}', async function (this: CustomWorld, expectedName: string) {
  const world = this as CustomWorld;
  logger.step('Verify confirmed student name', { expectedName });
  const formPage = world.getTestData<PracticeFormPage>('formPage') ?? new PracticeFormPage(world.page);
  const actualName = await formPage.getSubmittedValue('Student Name');
  expect(actualName.trim()).toBe(expectedName);
  logger.info('Student name confirmed', { actualName });
});

Then('the practice form should be displayed', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Verify practice form is displayed');
  const url = world.page.url();
  expect(url).toContain('automation-practice-form');
  const firstNameInput = world.page.locator('#firstName');
  await expect(firstNameInput).toBeVisible({ timeout: 5000 });
  logger.info('Practice form displayed');
});

Then('the submit button should be present', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Verify submit button is present');
  const submitBtn = world.page.locator('#submit');
  await expect(submitBtn).toBeVisible({ timeout: 5000 });
  logger.info('Submit button present');
});

Then('no premature validation errors should appear', async function (this: CustomWorld) {
  const world = this as CustomWorld;
  logger.step('Verify no premature validation errors');
  // The form fields should not have is-invalid class before submission
  const invalidFields = await world.page.locator('.is-invalid').count();
  expect(invalidFields).toBe(0);
  logger.info('No premature validation errors detected');
});
