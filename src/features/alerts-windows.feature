@alerts-windows
Feature: Alerts, Frame & Windows
  As a user
  I want to interact with browser alerts, windows and modal dialogs on DemoQA
  So that I can verify browser-level interactions

  Background:
    Given I am on the DemoQA home page

  @smoke
  Scenario: Accept a simple browser alert
    Given I navigate to the Alerts page
    When I trigger and accept the simple alert
    Then no error should be thrown

  @smoke
  Scenario: Confirm dialog accepted
    Given I navigate to the Alerts page
    When I trigger the confirm dialog and accept it
    Then the confirm result should display "You selected Ok"

  @smoke
  Scenario: Confirm dialog dismissed
    Given I navigate to the Alerts page
    When I trigger the confirm dialog and dismiss it
    Then the confirm result should display "You selected Cancel"

  @smoke
  Scenario: Prompt dialog accepts user input
    Given I navigate to the Alerts page
    When I trigger the prompt dialog and enter "DemoQA Test"
    Then the prompt result should display "You entered DemoQA Test"

  @smoke
  Scenario: Small modal dialog opens and closes
    Given I navigate to the Modal Dialogs page
    When I open the small modal
    Then the modal title should be visible
    When I close the modal
    Then the modal should be dismissed

  @smoke
  Scenario: New browser tab opens from Browser Windows
    Given I navigate to the Browser Windows page
    When I click the new tab button
    Then a new browser tab should be opened with valid content
