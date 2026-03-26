# 🚀 DemoQA Test Automation Framework

[![CI/CD Pipeline](https://github.com/your-org/demoqa-automation-framework/workflows/Test%20Automation%20CI/CD%20Pipeline/badge.svg)](https://github.com/your-org/demoqa-automation-framework/actions)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.19.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.43.1-green.svg)](https://playwright.dev/)

A production-ready test automation framework built with **Playwright**, **Cucumber BDD**, **TypeScript**, **Serenity BDD**, and **Allure Reporting**. This framework is designed to be stable, secure, scalable, and enterprise-ready.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Writing Tests](#-writing-tests)
- [Running Tests](#-running-tests)
- [Reporting](#-reporting)
- [CI/CD Integration](#-cicd-integration)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

### 🎯 **Core Technologies**
- **Playwright 1.43.1** - Cross-browser automation (Chromium, Firefox, WebKit)
- **Cucumber BDD 10.3.1** - Behavior-Driven Development with Gherkin syntax
- **TypeScript 5.4.5** - Type-safe development with strict mode
- **Serenity BDD 3.18.1** - Actor-based testing patterns and rich reporting
- **Allure Reporting 2.9.0** - Comprehensive test reports with screenshots

### 🏗️ **Architecture**
- **Page Object Model (POM)** - Maintainable page abstractions
- **Actor Pattern** - Serenity BDD's screenplay pattern implementation
- **Centralized Configuration** - Environment-based settings management
- **Browser Management** - Automated browser lifecycle handling
- **Custom World** - Cucumber context management

### 🔧 **Enterprise Features**
- **Parallel Execution** - Configurable worker threads
- **Cross-browser Testing** - Chrome, Firefox, Safari, Edge support  
- **Mobile Testing** - Mobile device simulation
- **CI/CD Ready** - GitHub Actions workflow included
- **Logging & Monitoring** - Winston-based structured logging
- **Test Data Management** - JSON-based test data with utilities
- **Error Handling** - Comprehensive retry mechanisms
- **Security** - Secure credential management

### 📊 **Reporting & Analytics**
- **HTML Reports** - Playwright's built-in HTML reports
- **Allure Reports** - Rich interactive test reports
- **Serenity Reports** - Business-readable test documentation
- **JUnit XML** - CI/CD integration format
- **JSON Results** - Programmatic test analysis
- **Screenshots & Videos** - Visual failure evidence
- **Performance Metrics** - Test execution timing

## 📋 Prerequisites

### Required Software
- **Node.js**: `18.19.x` (LTS)
- **npm**: `9.x` or higher
- **Git**: Latest version

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free disk space

### Development Environment
- **VS Code** (recommended) with extensions:
  - Playwright Test for VS Code
  - Cucumber (Gherkin) Full Support
  - TypeScript Importer

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/demoqa-automation-framework.git
cd demoqa-automation-framework
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Playwright Browsers
```bash
npx playwright install
```

### 4. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# BASE_URL=https://demoqa.com
# BROWSER=chromium
# HEADLESS=false
```

### 5. Run Sample Tests
```bash
# Run smoke tests
npm run test:smoke

# Run all tests  
npm test

# Run with UI mode
npm run test:ui
```

### 6. View Reports
```bash
# Open HTML report
npx playwright show-report

# Generate and view Allure report
npm run test:report
```

## 📁 Project Structure

```
demoqa-automation-framework/
├── 📁 src/
│   ├── 📁 config/           # Configuration management
│   │   └── environment.ts   # Environment configuration
│   ├── 📁 features/         # Cucumber feature files
│   │   ├── home-navigation.feature
│   │   └── elements-functionality.feature
│   ├── 📁 page-objects/     # Page Object Model classes
│   │   ├── base-page.ts     # Base page abstraction
│   │   ├── home-page.ts     # Home page implementation
│   │   └── elements-page.ts # Elements page implementation
│   ├── 📁 step-definitions/  # Cucumber step implementations
│   │   ├── home-navigation.steps.ts
│   │   └── elements-functionality.steps.ts
│   ├── 📁 support/          # Test infrastructure
│   │   ├── world.ts         # Cucumber World implementation
│   │   ├── hooks.ts         # Test hooks and setup
│   │   ├── actors.ts        # Serenity Actor implementations
│   │   ├── global-setup.ts  # Global test setup
│   │   └── global-teardown.ts # Global test cleanup
│   ├── 📁 test-data/        # Test data files
│   │   └── users.json       # Sample user data
│   └── 📁 utils/            # Utility classes
│       ├── browser-manager.ts    # Browser lifecycle management
│       ├── logger.ts            # Winston logging utility  
│       └── test-data-manager.ts # Test data utilities
├── 📁 reports/             # Generated reports
│   ├── 📁 html-report/     # Playwright HTML reports
│   ├── 📁 allure-results/  # Allure test results
│   └── 📁 serenity/        # Serenity BDD reports
├── 📁 test-results/        # Test artifacts
│   ├── 📁 videos/          # Test execution videos
│   └── 📁 screenshots/     # Failure screenshots
├── 📁 logs/               # Application logs
├── 📁 .github/            # GitHub Actions workflows
│   └── 📁 workflows/
│       └── test-automation.yml
├── 📄 playwright.config.ts      # Playwright configuration
├── 📄 cucumber.config.js        # Cucumber configuration
├── 📄 serenity.config.ts        # Serenity BDD configuration
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 package.json              # Node.js dependencies
└── 📄 .env.example              # Environment template
```

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Application Configuration
BASE_URL=https://demoqa.com
ENVIRONMENT=dev

# Browser Configuration  
BROWSER=chromium
HEADLESS=false
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=720

# Test Configuration
DEFAULT_TIMEOUT=30000
ACTION_TIMEOUT=10000
NAVIGATION_TIMEOUT=30000
WORKERS=1
RETRIES=0

# CI Configuration
CI_HEADLESS=true
CI_WORKERS=2  
CI_RETRIES=2

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=logs/test-execution.log

# Reporting Configuration
ALLURE_RESULTS_DIR=reports/allure-results
SERENITY_OUTPUT_DIR=reports/serenity
```

### Browser Configuration
The framework supports multiple browsers:
- **Chromium/Chrome** - Default, fastest execution
- **Firefox** - Cross-browser compatibility
- **WebKit/Safari** - Apple ecosystem testing
- **Mobile Chrome** - Mobile device simulation
- **Mobile Safari** - iOS device simulation

### Timeout Configuration
- **Test Timeout**: 60 seconds per test
- **Expect Timeout**: 10 seconds for assertions
- **Action Timeout**: 10 seconds for interactions
- **Navigation Timeout**: 30 seconds for page loads

## ✍️ Writing Tests

### Feature Files (Gherkin)
```gherkin
@smoke @regression
Feature: User Login Functionality
  As a user
  I want to log into the application
  So that I can access my account

  Background:
    Given I am on the login page

  @critical
  Scenario: Successful login with valid credentials
    When I enter username "testuser@example.com"
    And I enter password "ValidPassword123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see the welcome message
```

### Step Definitions (TypeScript)
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '@support/world';
import { LoginPage } from '@pages/auth/loginPage';

Given('I am on the login page', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
  await loginPage.verifyPageLoaded();
});

When('I enter username {string}', async function (this: CustomWorld, username: string) {
  const loginPage = this.getTestData<LoginPage>('loginPage')!;
  await loginPage.enterUsername(username);
});
```

### Page Objects
```typescript
import { Page, Locator } from 'playwright';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page, '/login');
    
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
  }

  async enterUsername(username: string): Promise<void> {
    await this.fill(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.click(this.loginButton);
  }
}
```

### Serenity Actors
```typescript
import { Actor } from '@serenity-js/core';
import { Navigate, Fill, Click, See } from '@support/actors';

// Using the Actor pattern
const user = Actors.called('TestUser', page);

await user.attemptsTo(
  Navigate.toLoginPage(),
  Fill.field('#username').with('testuser@example.com'),
  Fill.field('#password').with('password123'),
  Click.on('#login-button'),
  Wait.forElement('.dashboard')
);

const isDashboardVisible = await user.attemptsTo(
  See.element('.dashboard')
);
```

## 🏃‍♂️ Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:smoke        # Smoke tests only
npm run test:regression   # Regression tests only  
npm run test:critical     # Critical tests only
npm run test:parallel     # Run tests in parallel

# Run with specific browser
BROWSER=firefox npm test
BROWSER=webkit npm test

# Run with UI mode (interactive)
npm run test:ui

# Run specific feature
npx cucumber-js src/features/login.feature

# Run tests with specific tags
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@regression and not @skip"
```

### Debug Mode
```bash
# Run in headed mode (see browser)
HEADLESS=false npm test

# Run with debugging
DEBUG=1 npm test

# Run single test with debugging
npx cucumber-js src/features/login.feature --tags "@debug"
```

### Environment-Specific Runs
```bash
# Test against different environments
BASE_URL=https://staging.demoqa.com npm test
BASE_URL=https://prod.demoqa.com npm run test:smoke

# Override configuration
WORKERS=4 RETRIES=1 npm test
```

## 📊 Reporting

### HTML Reports
Playwright generates comprehensive HTML reports automatically:
```bash
# View latest HTML report
npx playwright show-report

# Generate report from specific results
npx playwright show-report test-results/
```

### Allure Reports
Rich interactive reports with detailed test analytics:
```bash
# Generate and serve Allure report
npm run test:report

# Generate report only
npx allure generate reports/allure-results --clean -o reports/allure-report

# Serve existing report
npx allure serve reports/allure-results
```

### Serenity BDD Reports
Business-readable documentation with actor narratives:
```bash
# Generate Serenity report
npm run test:serenity

# View Serenity report
open reports/serenity/index.html
```

### Report Features
- **Test Execution Timeline**
- **Failure Screenshots** 
- **Video Recordings**
- **Console Logs**
- **Performance Metrics**
- **Cross-browser Results**
- **Historical Trends** (in CI/CD)
- **Flaky Test Detection**

## 🔄 CI/CD Integration

### GitHub Actions
The framework includes a production-ready GitHub Actions workflow:

#### Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

#### Pipeline Stages
1. **Setup & Validation** - Dependency installation and validation
2. **Build & Compile** - TypeScript compilation and configuration validation
3. **Smoke Tests** - Quick validation tests (Chromium, Firefox)
4. **Regression Tests** - Full test suite (Chromium, Firefox, WebKit)
5. **Report Generation** - Consolidated reporting and artifacts
6. **Cleanup** - Resource cleanup and notifications

#### Workflow Features
- **Parallel Execution** - Multiple browsers simultaneously
- **Artifact Management** - Test results, reports, and logs
- **Pull Request Comments** - Automatic test result summaries
- **Failure Notifications** - Team alerts on main branch failures
- **Security Scanning** - npm audit integration

### Other CI/CD Platforms

#### Jenkins
```groovy
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test:smoke'
            }
            parallel {
                stage('Chrome') {
                    steps {
                        sh 'BROWSER=chromium npm test'
                    }
                }
                stage('Firefox') { 
                    steps {
                        sh 'BROWSER=firefox npm test'
                    }
                }
            }
        }
    }
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'reports',
                reportFiles: 'index.html',
                reportName: 'Test Report'
            ])
        }
    }
}
```

#### Azure DevOps
```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '18.19.x'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: $(nodeVersion)
  
- script: npm ci
  displayName: 'Install Dependencies'

- script: npx playwright install --with-deps
  displayName: 'Install Browsers'

- script: npm run test:smoke
  displayName: 'Run Smoke Tests'
  env:
    CI: true
    HEADLESS: true

- task: PublishTestResults@2
  inputs:
    testResultsFiles: 'reports/junit-report.xml'
  condition: always()
```

## 🎯 Best Practices

### Test Design
- **Write descriptive scenario names** that explain business value
- **Use Background steps** for common setup
- **Keep scenarios focused** on single functionality
- **Use data tables** for multiple similar test cases
- **Tag scenarios appropriately** (@smoke, @regression, @critical)

### Page Objects
- **Inherit from BasePage** for common functionality
- **Use meaningful locator names** that describe the element
- **Implement wait strategies** for dynamic content
- **Return page objects** from navigation methods
- **Validate page state** in constructors or verify methods

### Step Definitions
- **Keep steps simple** and focused on single actions
- **Reuse common steps** across multiple features
- **Use custom world** for sharing state between steps
- **Implement proper error handling** with meaningful messages
- **Add logging** for debugging and monitoring

### Configuration
- **Use environment variables** for configuration
- **Separate test data** by environment
- **Implement configuration validation** at startup
- **Document all configuration options**
- **Use secure credential management**

### Parallel Execution
- **Avoid shared state** between tests
- **Use unique test data** for parallel runs
- **Implement proper cleanup** in hooks
- **Configure appropriate worker count** based on resources
- **Monitor resource usage** during parallel execution

## 🔧 Troubleshooting

### Common Issues

#### Browser Installation Issues
```bash
# Clear Playwright cache
npx playwright install --force

# Install system dependencies (Linux)
npx playwright install-deps

# Check browser installation
npx playwright install --dry-run
```

#### Test Timeouts
```bash
# Increase timeouts in configuration
DEFAULT_TIMEOUT=60000
ACTION_TIMEOUT=15000
NAVIGATION_TIMEOUT=45000

# Run tests in headed mode to debug
HEADLESS=false npm test
```

#### Element Not Found
- Verify locators in browser developer tools
- Add explicit waits for dynamic content
- Check for iframe context switches
- Validate page load state before interactions

#### Flaky Tests
- Implement proper wait strategies
- Use retry mechanisms for API calls
- Add test data cleanup
- Monitor for race conditions

#### CI/CD Failures
- Check browser dependencies
- Verify environment variables
- Review resource limits
- Check network connectivity

### Debug Mode
```bash
# Enable debug logging
DEBUG=pw:* npm test

# Run with inspector
PWDEBUG=1 npm test

# Capture trace for debugging
PLAYWRIGHT_TRACE=on npm test
```

### Performance Optimization
- Use appropriate wait strategies
- Minimize browser restarts
- Optimize CI/CD pipeline caching
- Monitor test execution metrics
- Implement parallel execution

## 🔐 Security Considerations

### Credential Management
- Never commit credentials to version control
- Use environment variables for sensitive data
- Implement secure credential rotation
- Use CI/CD secret management

### Test Data Security  
- Avoid using production data in tests
- Implement test data anonymization
- Clean up test data after execution
- Use secure test environments

### Browser Security
- Keep browsers updated
- Use secure browser configurations
- Implement proper HTTPS handling
- Monitor for security vulnerabilities

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Make your changes
5. Run tests: `npm test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards
- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write comprehensive tests for new features
- Update documentation for changes
- Follow semantic versioning

### Pull Request Process
- Ensure all tests pass
- Update documentation as needed
- Add/update test cases for new features
- Get approval from code owners
- Squash commits before merging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/demoqa-automation-framework/issues)
- **Discussions**: [Ask questions or share ideas](https://github.com/your-org/demoqa-automation-framework/discussions)
- **Wiki**: [Additional documentation](https://github.com/your-org/demoqa-automation-framework/wiki)

### Resources
- [Playwright Documentation](https://playwright.dev/)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Serenity BDD Documentation](https://serenity-bdd.github.io/docs/serenity/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Allure Framework](https://docs.qameta.io/allure/)

---

**Built with ❤️ by the QA Automation Team**

*This framework is production-ready and battle-tested in enterprise environments.*