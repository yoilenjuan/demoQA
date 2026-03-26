@user-management
Feature: User Management
  As a test automation framework
  I want to manage test user data efficiently
  So that tests can run reliably with proper data rotation

  Background:
    Given the user management system is initialized
    And rotation parameters are configured:
      | maxUsersPerFile | 50   |
      | retentionDays   | 7    |
      | cleanupEnabled  | true |

  @skip
  Scenario: Create users within rotation limits
    Given the current rotation file has 45 users
    When 3 new users are created dynamically
    Then all users should be stored in the current rotation file
    And the rotation file should contain 48 users
    And no new rotation file should be created

  @skip
  Scenario: Automatic file rotation when limit reached
    Given the current rotation file has 49 users
    When 2 new users are created dynamically
    Then the first user should complete the current file
    And a new rotation file should be created for the second user
    And both rotation files should remain active
    And user lookup should work across both files

  @regression
  Scenario: Retrieve users from rotation storage
    Given users exist across multiple rotation files:
      | rotation_file   | user_count |
      | users_file_1    | 50         |
      | users_file_2    | 30         |
      | users_file_3    | 15         |
    When I request a previously created user
    Then the system should search across all active files
    And return the correct user data
    And performance should remain optimal

  @regression
  Scenario: Automatic cleanup of old rotation files
    Given rotation files exist with different ages:
      | file_name           | age_days |
      | users_rotation_1    | 10       |
      | users_rotation_2    | 5        |
      | users_rotation_3    | 2        |
    When the cleanup process runs
    Then files older than 7 days should be archived
    And files within retention period should remain active
    And the active file tracking should be updated

  @skip
  Scenario: Handle rotation file corruption gracefully
    Given a rotation file becomes corrupted
    When the system attempts to read user data
    Then a new rotation file should be created automatically
    And the corruption should be logged for investigation
    And user creation should continue without interruption
    And existing valid files should remain functional

  @regression
  Scenario: Concurrent user creation thread safety
    Given multiple test threads are creating users simultaneously
    When the rotation limit is reached during concurrent operations
    Then file rotation should be handled thread-safely
    And no user data should be lost or duplicated
    And each user should receive a unique identifier
    And the rotation sequence should be maintained properly

  @smoke @critical
  Scenario: End-to-end rotation lifecycle
    Given the user management system is ready
    When a complete test suite runs with rotation enabled
    Then users should be created dynamically as needed
    And rotation should happen transparently when limits are reached
    And cleanup should maintain system health automatically
    And all authentication tests should have access to valid users
    And no manual intervention should be required