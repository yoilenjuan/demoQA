# GitHub Copilot Instructions for DemoQA Automation Framework

This is a production-ready test automation framework built with Playwright, Cucumber BDD, TypeScript, Serenity BDD, and comprehensive reporting capabilities.

## 🎯 Project Context

**Framework Type**: Enterprise Test Automation Framework  
**Primary Technologies**: Playwright, Cucumber BDD, TypeScript, Serenity BDD  
**Architecture**: Page Object Model with Actor Pattern  
**Target**: Cross-browser web application testing  

## 🏗️ Architecture Guidelines

When working on this project, follow these architectural principles:

### Page Object Model
- Extend `BasePage` class for all page objects
- Use meaningful locator naming conventions
- Implement proper wait strategies
- Group related functionality in page methods

### Step Definitions
- Keep steps atomic and reusable
- Use `CustomWorld` for sharing state
- Implement proper error handling
- Add descriptive logging

### Test Data Management
- Use `TestDataManager` for structured data
- Store test data in `src/test-data/` directory
- Generate dynamic test data when needed
- Environment-specific data variations

### Configuration Management
- Use `environment.ts` for centralized configuration
- Leverage environment variables for flexibility
- Validate configuration at startup
- Document all configuration options

## 🎨 Code Style & Patterns

### TypeScript Standards
- Use strict TypeScript configuration
- Implement proper type definitions
- Use async/await for all asynchronous operations
- Follow interface-based design

### Error Handling
- Implement comprehensive try-catch blocks
- Use descriptive error messages
- Log errors with context information
- Implement retry mechanisms where appropriate

### Logging Standards
- Use Winston logger throughout the framework
- Log at appropriate levels (error, warn, info, debug)
- Include contextual information in logs
- Structure logs for easy parsing

### Testing Patterns
```typescript
// Page Object Pattern
export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('#username');
  
  async login(credentials: UserCredentials): Promise<void> {
    await this.fill(this.usernameInput, credentials.username);
    // ... rest of implementation
  }
}

// Step Definition Pattern
Given('I am logged in as {string}', async function (this: CustomWorld, userType: string) {
  const credentials = this.getTestData<UserCredentials>(userType);
  const loginPage = new LoginPage(this.page);
  await loginPage.login(credentials);
});

// Actor Pattern (Serenity BDD)
await user.attemptsTo(
  Navigate.toLoginPage(),
  Fill.loginForm(credentials),
  Click.on(loginButton),
  Wait.forElement(dashboard)
);
```

## 📁 File Organization

### Directory Structure Guidelines
- `src/config/` - Configuration management
- `src/features/` - Cucumber feature files
- `src/page-objects/` - Page Object Model classes
- `src/step-definitions/` - Cucumber step implementations
- `src/support/` - Framework infrastructure
- `src/test-data/` - Test data files
- `src/utils/` - Utility classes and helpers

### Naming Conventions
- **Files**: kebab-case (`login-page.ts`)
- **Classes**: PascalCase (`LoginPage`)
- **Methods**: camelCase (`clickLoginButton`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- **Interfaces**: PascalCase with 'I' prefix (`IUserCredentials`)

## 🧪 Test Design Principles

### Feature Files (Gherkin)
```gherkin
@smoke @regression
Feature: User Authentication
  As a user
  I want to authenticate securely
  So that I can access my account

  Background:
    Given the application is accessible

  @critical
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to the dashboard
```

### Scenario Guidelines
- Use descriptive scenario names
- Follow Given-When-Then structure
- Tag scenarios appropriately
- Keep scenarios focused on single functionality

### Step Definition Guidelines
- Make steps reusable across features
- Use data tables for multiple test cases
- Implement proper assertions
- Add meaningful error messages

## 🔧 Development Guidelines

### Adding New Pages
1. Create page class extending `BasePage`
2. Define locators as private readonly properties
3. Implement page-specific methods
4. Add proper documentation and logging

### Adding New Features
1. Create feature file in `src/features/`
2. Implement corresponding step definitions
3. Add necessary page objects
4. Create test data if required
5. Update documentation

### Adding New Utilities
1. Place in appropriate `src/utils/` subdirectory
2. Follow single responsibility principle
3. Add comprehensive error handling
4. Include unit tests where applicable
5. Document public API

### Configuration Changes
1. Update `environment.ts` for new settings
2. Add to `.env.example` with documentation
3. Update validation logic
4. Document in README

## 📊 Reporting & Monitoring

### Report Integration
- Playwright HTML reports (built-in)
- Allure reports for detailed analysis
- Serenity BDD for business narratives
- JUnit XML for CI/CD integration

### Logging Strategy
- Use structured logging with Winston
- Log test steps and interactions
- Capture performance metrics
- Include error context and stack traces

### Artifact Management
- Screenshots on failures
- Video recordings for debugging
- Test execution logs
- Performance metrics

## 🚀 CI/CD Considerations

### Pipeline Integration
- GitHub Actions workflow included
- Support for multiple environments
- Parallel execution capabilities
- Comprehensive artifact collection

### Environment Management
- Environment-specific configurations
- Secure credential handling
- Dynamic test data generation
- Resource cleanup automation

## 🔍 Debugging Guidelines

### Local Debugging
```bash
# Run in headed mode
HEADLESS=false npm test

# Enable debug logging
DEBUG=1 npm test

# Run specific scenario
npx cucumber-js src/features/login.feature --tags "@debug"
```

### Troubleshooting Common Issues
- Browser installation problems
- Element timing issues
- Network connectivity problems
- Configuration validation errors

## 📚 Learning Resources

### Framework Documentation
- [README.md](./README.md) - Comprehensive setup guide
- [Playwright Docs](https://playwright.dev/) - Browser automation
- [Cucumber Docs](https://cucumber.io/docs/) - BDD framework
- [Serenity BDD Docs](https://serenity-bdd.github.io/) - Screenplay pattern

### Best Practices
- Follow the Page Object Model pattern
- Implement proper wait strategies
- Use meaningful test data
- Write descriptive error messages
- Maintain clean separation of concerns

## 🤝 Collaboration Guidelines

### Code Reviews
- Focus on maintainability and readability
- Ensure proper error handling
- Verify test coverage
- Check documentation updates

### Contributing
- Follow the contribution guidelines in README
- Write comprehensive tests
- Update documentation
- Follow coding standards

---

This framework is designed for enterprise-scale test automation. When making changes, consider scalability, maintainability, and production readiness.