@authentication
Feature: Authentication
  As a user
  I want to authenticate with the DemoQA application
  So that I can access protected features

  Background:
    Given I am on the login page

  @smoke @critical
  Scenario: Successful login with valid credentials
    Given I have valid user credentials
    When I enter my username and password
    And I click the login button
    Then I should be logged in successfully
    And I should see the user profile page
    And my username should be visible in the interface

  @negative @critical
  Scenario: Login fails with invalid credentials
    When I enter invalid username "wronguser" and password "wrongpass"
    And I click the login button
    Then I should see an error message
    And I should remain on the login page
    And no session should be created

  @negative
  Scenario: Login validation with empty fields
    When I leave the username field empty
    And I leave the password field empty
    And I click the login button
    Then I should see validation errors for required fields
    And the login should not proceed

  @smoke
  Scenario: Successful logout
    Given I am logged in with valid credentials
    When I click the logout button
    Then I should be logged out
    And I should be redirected to the login page
    And no active session should remain

  @regression
  Scenario: User registration with valid data
    Given I am on the registration page
    When I fill in all required registration fields with valid data
    And I submit the registration form
    Then my user data should be stored for future tests
    # Note: Success depends on manual reCAPTCHA completion