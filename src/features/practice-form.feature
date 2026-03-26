@forms
Feature: Practice Form
  As a user
  I want to fill out the Automation Practice Form on DemoQA
  So that I can verify form submission and data capture

  Background:
    Given I am on the Practice Form page

  @smoke
  Scenario: Successfully submit the practice form with required fields
    When I fill in the first name "John" and last name "Smith"
    And I select gender "Male"
    And I fill in the mobile number "0123456789"
    And I submit the practice form
    Then the confirmation modal should appear
    And the confirmed student name should be "John Smith"

  @regression
  Scenario: Practice form URL is accessible
    Then the practice form should be displayed
    And the submit button should be present

  @smoke
  Scenario Outline: Form fields accept valid input
    When I fill in the first name "<firstName>" and last name "<lastName>"
    And I fill in the email "<email>"
    Then no premature validation errors should appear

    Examples:
      | firstName | lastName | email               |
      | Alice     | Wonder   | alice@example.com   |
      | Bob       | Builder  | bob@example.com     |
