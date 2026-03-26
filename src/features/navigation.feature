@navigation
Feature: Navigation
  As a user
  I want to navigate through the DemoQA application
  So that I can access different testing modules

  Background:
    Given I am on the DemoQA home page

  @smoke @critical
  Scenario: Navigate to main modules
    Then I should see all main category cards:
      | Elements                |
      | Forms                   |
      | Alerts, Frame & Windows |
      | Widgets                 |
      | Interactions            |
      | Book Store Application  |

  @smoke
  Scenario Outline: Access different modules
    When I click on the "<module>" card
    Then I should be redirected to the "<url>" page
    And the page should load without errors
    And the module header should display "<module>"

    Examples:
      | module                  | url           |
      | Elements                | /elements     |
      | Forms                   | /forms        |
      | Alerts, Frame & Windows | /alertsWindows|
      | Widgets                 | /widgets      |
      | Interactions            | /interaction  |

  @critical
  Scenario: Navigate to login page
    When I click on "Book Store Application"
    And I click on "Login"
    Then I should be on the login page
    And the login form should be visible
    And the "New User" button should be available

  @regression
  Scenario: Browser back navigation
    Given I have navigated from Home to Elements to Forms
    When I click the browser back button
    Then I should return to the Elements page
    And the page content should be preserved

  @negative
  Scenario: Invalid URL handling
    When I navigate to an invalid URL "/nonexistent-page"
    Then the system should handle the error gracefully
    And I should be able to return to valid content