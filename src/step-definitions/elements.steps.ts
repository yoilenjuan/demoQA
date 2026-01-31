import { Given, When, Then, Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import { expect, Page } from "@playwright/test";
import browserManager from "../support/browser-manager";
import ElementsPage from "../page-objects/ElementsPage";

setDefaultTimeout(60 * 1000); // 60 seconds

let page: Page;
let elementsPage: ElementsPage;

Before(async function () {
  await browserManager.initialize();
  page = browserManager.page!;
  elementsPage = new ElementsPage(page);
});

After(async function () {
  await browserManager.close();
});

// Given steps
Given("I navigate to DemoQA website", async function () {
  await elementsPage.navigateTo("");
});

Given("I navigate to Elements section", async function () {
  await elementsPage.navigateToElements();
});

Given("I click on Text Box link", async function () {
  await elementsPage.clickTextBoxLink();
});

// When steps
When("I fill the text box form with the following data:", async function (dataTable: any) {
  const userData = dataTable.rowsHash();
  await elementsPage.fillTextBoxForm({
    fullName: userData["Full Name"],
    email: userData["Email"],
    currentAddress: userData["Current Address"],
    permanentAddress: userData["Permanent Address"]
  });
});

When("I submit the form", async function () {
  await elementsPage.submitForm();
});

// Then steps
Then("I should see the submitted data displayed", async function () {
  const name = await elementsPage.getSubmittedName();
  expect(name).toBeTruthy();
});

Then("the submitted name should be {string}", async function (expectedName: string) {
  const name = await elementsPage.getSubmittedName();
  expect(name).toContain(expectedName);
});

Then("the submitted email should be {string}", async function (expectedEmail: string) {
  const email = await elementsPage.getSubmittedEmail();
  expect(email).toContain(expectedEmail);
});
