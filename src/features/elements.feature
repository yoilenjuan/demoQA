Feature: DemoQA Elements - Text Box
  As a user
  I want to fill and submit a text box form
  So that I can verify the form submission works correctly

  Scenario1: Successfully submit text box form with valid data
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
