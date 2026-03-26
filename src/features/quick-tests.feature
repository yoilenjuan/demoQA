@quick-tests
Feature: Quick Test Scenarios
  Simple scenarios to verify basic functionality

  @smoke
  Scenario: Basic page validation
    Given I perform basic page validation
    Then the page should be responsive
    And the page structure should be valid

  @smoke 
  Scenario: Browser compatibility test
    Given I test browser compatibility
    Then the application should function correctly

  @smoke
  Scenario: Page load performance test
    Given I verify page load performance
    Then load time should be acceptable

  @smoke
  Scenario: Accessibility validation
    Given I check accessibility features
    Then the page should be accessible

