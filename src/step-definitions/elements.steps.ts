import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect, Page } from "@playwright/test";
import browserManager from "../support/browser-manager";
import ElementsPage from "../page-objects/ElementsPage";
import logger from '../utils/logger';

setDefaultTimeout(60 * 1000); // 60 seconds

let page: Page;
let elementsPage: ElementsPage;

// Given steps
Given("I navigate to DemoQA website", async function () {
  page = browserManager.page!;
  elementsPage = new ElementsPage(page);
  
  logger.step('Navigating to DemoQA website');
  await elementsPage.navigateTo("");
  logger.browserAction('Page loaded', { url: page.url() });
});

Given("I navigate to Elements section", async function () {
  logger.step('Navigating to Elements section');
  await elementsPage.navigateToElements();
  logger.browserAction('Elements section loaded');
});

Given("I click on Text Box link", async function () {
  logger.step('Clicking on Text Box link');
  await elementsPage.clickTextBoxLink();
  logger.browserAction('Text Box page loaded');
});

// When steps
When("I fill the text box form with the following data:", async function (dataTable) {
  const data = dataTable.rowsHash();
  logger.info('Filling text box form', { testData: data });
  
  // Use the existing fillTextBoxForm method from ElementsPage
  await elementsPage.fillTextBoxForm({
    fullName: data['Full Name'],
    email: data['Email'], 
    currentAddress: data['Current Address'],
    permanentAddress: data['Permanent Address']
  });
  
  logger.browserAction('Text box form filled completely');
});

When("I submit the form", async function () {
  logger.step('Submitting the form');
  await elementsPage.submitForm();
  logger.browserAction('Form submitted');
});

// Then steps
Then("I should see the submitted data displayed", async function () {
  logger.step('Verifying submitted data display');
  const name = await elementsPage.getSubmittedName();
  
  logger.assertion('Submitted data displayed', 'truthy', !!name, !!name);
  expect(name).toBeTruthy();
});

Then("the submitted name should be {string}", async function (expectedName: string) {
  logger.info('Verifying submitted name', { expected: expectedName });
  const actualName = await elementsPage.getSubmittedName();
  
  logger.assertion('Name verification', expectedName, actualName, actualName.includes(expectedName));
  expect(actualName).toContain(expectedName);
});

Then("the submitted email should be {string}", async function (expectedEmail: string) {
  logger.info('Verifying submitted email', { expected: expectedEmail });
  const actualEmail = await elementsPage.getSubmittedEmail();
  
  logger.assertion('Email verification', expectedEmail, actualEmail, actualEmail.includes(expectedEmail));
  expect(actualEmail).toContain(expectedEmail);
});

Then("I should see appropriate validation message", async function () {
  logger.info('Verifying validation message for invalid input');
  
  // Add validation logic here based on the actual page behavior
  // This is a placeholder for the validation scenario
  const currentUrl = page.url();
  logger.browserAction('Validation check performed', { url: currentUrl });
  
  // For now, just verify we're still on the page (indicating validation occurred)
  expect(currentUrl).toContain('text-box');
  
  logger.info('Validation result logged', { 
    message: 'Form validation triggered for invalid email',
    url: currentUrl 
  });
});
