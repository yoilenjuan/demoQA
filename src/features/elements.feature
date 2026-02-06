@smoke @elements @ui-testing
Feature: DemoQA Elements - Text Box
  As a user
  I want to fill and submit a text box form
  So that I can verify the form submission works correctly

  @smoke @critical @DEMO-001
  Scenario: Successfully submit text box form with valid data
    Given I navigate to DemoQA website
    And I navigate to Elements section
    And I click on Text Box link
    When I fill the text box form with the following data:
      | Full Name           | John Doe                     |
      | Email               | john.doe@example.com         |
      | Current Address     | 123 Main Street              |
      | Permanent Address   | 456 Oak Avenue               |
    And I submit the form
    Then I should see the submitted data displayed
    And the submitted name should be "Name:John Doe"
    And the submitted email should be "Email:john.doe@example.com"

  @regression @medium @DEMO-002
  Scenario: Submit text box form with only required fields
    Given I navigate to DemoQA website
    And I navigate to Elements section
    And I click on Text Box link
    When I fill the text box form with the following data:
      | Full Name           | Jane Smith                   |
      | Email               | jane.smith@example.com       |
    And I submit the form
    Then I should see the submitted data displayed
    And the submitted name should be "Name:Jane Smith"

  @regression @edge-case @DEMO-003
  Scenario: Verify form validation with invalid email
    Given I navigate to DemoQA website
    And I navigate to Elements section
    And I click on Text Box link
    When I fill the text box form with the following data:
      | Full Name           | Test User                    |
      | Email               | invalid-email                |
      | Current Address     | Test Address                 |
    And I submit the form
    Then I should see appropriate validation message
