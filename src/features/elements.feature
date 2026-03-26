@elements
Feature: Elements
  As a user
  I want to interact with various UI elements
  So that I can test different element behaviors

  Background:
    Given I am on the Elements page

  @smoke @critical
  Scenario: Fill and submit Text Box form
    Given I navigate to the Text Box section
    When I fill the form with:
      | Full Name           | John Doe                 |
      | Email               | john.doe@example.com     |
      | Current Address     | 123 Main St, City, ST   |
      | Permanent Address   | 456 Oak Ave, Town, ST   |
    And I submit the form
    Then I should see the submitted data displayed
    And the output should contain "John Doe"
    And the output should contain "john.doe@example.com"

  @regression
  Scenario: Text Box with empty fields
    Given I navigate to the Text Box section
    When I submit the form without filling any fields
    Then the form should accept empty submission
    # Note: DemoQA does not enforce required field validation

  @regression
  Scenario: Text Box with invalid email format
    Given I navigate to the Text Box section
    When I enter "invalid-email-format" in the email field
    And I submit the form
    Then the form should accept the invalid email
    # Note: DemoQA does not validate email format on frontend

  @smoke
  Scenario: CheckBox selection behavior
    Given I navigate to the Check Box section
    When I expand the checkbox tree
    And I select the "Home" checkbox
    Then all child checkboxes should be selected automatically
    And the result should display the selected items

  @regression
  Scenario: CheckBox deselection behavior
    Given I navigate to the Check Box section
    And the "Home" checkbox and all children are selected
    When I deselect the "Home" checkbox
    Then all child checkboxes should be deselected
    And the result should be cleared

  @smoke
  Scenario: Radio Button selection
    Given I navigate to the Radio Button section
    When I select the "Yes" radio button
    Then "Yes" should be selected
    And the result should display "You have selected Yes"
    When I select the "Impressive" radio button
    Then "Impressive" should be selected
    And "Yes" should no longer be selected

  @regression
  Scenario: Web Tables - Add new record
    Given I navigate to the Web Tables section
    When I click the "Add" button
    And I fill the registration form with:
      | First Name | Jane       |
      | Last Name  | Smith      |
      | Email      | jane@test.com |
      | Age        | 25         |
      | Salary     | 50000      |
      | Department | Testing    |
    And I submit the form
    Then the new record should appear in the table
    And the record should contain "Jane Smith"

  @regression
  Scenario: Web Tables - Delete record
    Given I navigate to the Web Tables section
    And there is at least one record in the table
    When I click the delete button for the first record
    Then the record should be removed from the table

  @regression
  Scenario: Web Tables - Search functionality
    Given I navigate to the Web Tables section
    When I enter "Cierra" in the search box
    Then only records containing "Cierra" should be displayed
    And other records should be hidden

  @smoke
  Scenario Outline: Button interactions
    Given I navigate to the Buttons section
    When I perform a "<action>" on the "<button>" button
    Then I should see the corresponding "<message>" message

    Examples:
      | action      | button         | message                    |
      | click       | Click Me       | You have done a dynamic click |
      | right-click | Right Click Me | You have done a right click   |
      | double-click| Double Click Me| You have done a double click  |