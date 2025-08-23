# Experimental Automation Suite

A comprehensive end-to-end testing framework built with Playwright, designed for robust web application testing with modern tooling and best practices.

## Table of Contents

- [Why Playwright?](#why-playwright)
- [Setup & Installation](#setup--installation)
- [Framework Architecture](#framework-architecture)
- [Key Features](#key-features)
- [Running Tests](#running-tests)
- [Test Configuration](#test-configuration)
- [Fixtures & Page Object Model](#fixtures--page-object-model)
- [Authentication & State Management](#authentication--state-management)
- [Error Handling & Logging](#error-handling--logging)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Contributing](#contributing)

## Why Playwright?

Playwright was chosen for this framework due to its superior capabilities over other testing tools:

### 🚀 **Multi-Browser Support**

- **Cross-browser testing**: Chromium, Firefox, and WebKit support
- **Real browser engines**: Tests run in actual browser instances, not simulations
- **Mobile testing**: Built-in mobile device emulation

### ⚡ **Performance & Reliability**

- **Auto-waiting**: Smart waits for elements without explicit timeouts
- **Parallel execution**: Run tests concurrently across multiple browsers
- **Fast execution**: Optimized for speed with minimal flakiness

### 🔧 **Developer Experience**

- **Modern API**: Async/await support with intuitive syntax
- **Rich tooling**: Built-in test generator, trace viewer, and debugging tools
- **TypeScript first**: Full TypeScript support out of the box

### 🎯 **Advanced Testing Features**

- **Network interception**: Mock API responses and monitor network traffic
- **Visual testing**: Screenshot comparison and visual regression testing
- **Test isolation**: Each test runs in isolation with fresh browser context

## Setup & Installation

### Prerequisites

- **Node.js** 22.0.0+ (see `.nvmrc`)
- **npm** or **yarn**

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd automation
   ```

2. **Install Node.js version**

   ```bash
   nvm use
   # or
   nvm install 22.0.0
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Install Playwright browsers**

   ```bash
   npx playwright install
   ```

5. **Verify installation**
   ```bash
   npm test
   ```

## Framework Architecture

```
automation/
├── .github/workflows/        # CI/CD pipeline configurations
├── fixtures/                 # Test fixtures and mock data
├── pages/                    # Page Object Model classes
├── tests/                    # Test specifications
├── tests-examples/           # Example tests and demos
├── playwright-report/        # Generated test reports
├── test-results/            # Test execution artifacts
└── playwright.config.ts     # Main configuration file
```

## Key Features

### 🎯 **Test Organization**

- **Modular structure**: Tests organized by feature/domain
- **Page Object Model**: Reusable page components in `pages/` directory
- **Fixtures**: Shared test data and setup in `fixtures/` directory

### 🔧 **Configuration Management**

- **Environment-specific configs**: Different settings for CI vs local
- **Browser matrix**: Test across multiple browsers and devices
- **Parallel execution**: Optimized worker configuration

### 📊 **Reporting & Debugging**

- **HTML reports**: Rich, interactive test reports
- **Trace viewer**: Step-by-step execution analysis
- **Screenshots**: Automatic failure screenshots
- **Video recording**: Full test execution recordings

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report

# Show trace viewer
npm run test:trace

# Stress testing (multiple iterations)
npm run test:stress
```

### Advanced Execution Options

```bash
# Run specific test file
npx playwright test tests/example.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with specific workers
npx playwright test --workers=4

# Run tests with specific timeout
npx playwright test --timeout=30000
```

## Test Configuration

The framework is configured via `playwright.config.ts`:

### Key Configuration Options

- **Test Directory**: `./tests` - Main test location
- **Parallel Execution**: Fully parallel test execution
- **Retry Strategy**: 2 retries on CI, 0 retries locally
- **Browser Matrix**: Chromium (default), Firefox, Safari (configurable)
- **Trace Collection**: Enabled on first retry for debugging

### Environment Variables

```bash
# CI environment detection
CI=true                    # Enables CI-specific settings

# Base URL for application under test
BASE_URL=http://localhost:3000

# Browser selection
BROWSER=chromium          # chromium, firefox, webkit
```

## Fixtures & Page Object Model

### Fixtures Directory

The `fixtures/` directory is designed to contain:

```typescript
// fixtures/test-data.ts
export const testUsers = {
  admin: { username: "admin", password: "admin123" },
  user: { username: "user", password: "user123" },
};

// fixtures/mock-responses.ts
export const mockApiResponses = {
  users: [{ id: 1, name: "John Doe" }],
  products: [{ id: 1, name: "Sample Product" }],
};
```

### Page Object Model

The `pages/` directory structure for maintainable test code:

```typescript
// pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

## Authentication & State Management

### Storage State Authentication

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Welcome")).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
```

### Using Authentication in Tests

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
```

## Error Handling & Logging

### Console Error Monitoring

```typescript
// Global error handler
test.beforeEach(async ({ page }) => {
  // Monitor console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`Console error: ${msg.text()}`);
    }
  });

  // Monitor page errors
  page.on("pageerror", (error) => {
    console.log(`Page error: ${error.message}`);
  });

  // Monitor request failures
  page.on("requestfailed", (request) => {
    console.log(`Request failed: ${request.url()}`);
  });
});
```

### Custom Logging

```typescript
// utils/logger.ts
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || "");
  }

  static error(message: string, error?: any) {
    console.error(
      `[ERROR] ${new Date().toISOString()}: ${message}`,
      error || ""
    );
  }

  static debug(message: string, data?: any) {
    if (process.env.DEBUG) {
      console.log(
        `[DEBUG] ${new Date().toISOString()}: ${message}`,
        data || ""
      );
    }
  }
}
```

## CI/CD Integration

### GitHub Actions

The framework includes a complete CI/CD pipeline (`.github/workflows/playwright.yml`):

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### CI Optimizations

- **Dependency caching**: Faster builds with npm cache
- **Browser installation**: Automated browser setup
- **Artifact uploads**: Test reports and traces saved
- **Parallel execution**: Optimized worker configuration

## Best Practices

### 🎯 **Test Writing**

1. **Use descriptive test names**

   ```typescript
   test("should allow user to add items to shopping cart", async ({ page }) => {
     // Test implementation
   });
   ```

2. **Leverage auto-waiting**

   ```typescript
   // Good: Playwright waits automatically
   await page.getByRole("button", { name: "Submit" }).click();

   // Avoid: Manual waits
   await page.waitForTimeout(5000);
   ```

3. **Use meaningful locators**

   ```typescript
   // Good: Semantic locators
   await page.getByRole("button", { name: "Add to Cart" });
   await page.getByLabel("Email address");

   // Avoid: CSS selectors when possible
   await page.click(".btn-primary");
   ```

### 🔧 **Framework Usage**

1. **Organize tests by feature**
2. **Use Page Object Model for reusability**
3. **Implement proper error handling**
4. **Monitor console errors and network failures**
5. **Use storage state for authentication**

### 📊 **Debugging**

1. **Use trace viewer for complex failures**

   ```bash
   npm run test:trace
   ```

2. **Enable headed mode for development**

   ```bash
   npx playwright test --headed --debug
   ```

3. **Use screenshots for visual debugging**
   ```typescript
   await page.screenshot({ path: "debug.png" });
   ```

## Contributing

### Development Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/new-test-suite
   ```

2. **Write tests following conventions**
3. **Run tests locally**

   ```bash
   npm test
   ```

4. **Submit pull request**

### Code Standards

- Use TypeScript for all test files
- Follow Page Object Model pattern
- Include proper error handling
- Add meaningful test descriptions
- Maintain fixture data in `fixtures/` directory

---

## Author

**Raphael Okafor Jr**

## License

ISC License

---
