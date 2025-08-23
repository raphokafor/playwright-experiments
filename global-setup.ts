import { chromium, FullConfig } from "@playwright/test";
import { Logger } from "./utils/logger";
import { DatabaseHelper } from "./utils/database";
import { ConfigManager } from "./utils/config";

async function globalSetup(config: FullConfig) {
  Logger.info("🚀 Starting global setup...");

  try {
    // Initialize test environment
    Logger.info("📋 Initializing test environment");
    Logger.info(`Environment: ${ConfigManager.getEnvironment()}`);
    Logger.info(`Base URL: ${ConfigManager.getBaseUrl()}`);
    Logger.info(`API Base URL: ${ConfigManager.getApiEndpoints().base}`);

    // Setup test database
    Logger.info("🗄️ Setting up test database");
    await DatabaseHelper.seedTestData();

    // Create a browser instance for authentication token generation
    Logger.info("🔐 Setting up authentication");
    const browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL: ConfigManager.getApiEndpoints().base,
    });

    // Get authentication token and store it for tests
    try {
      const page = await context.newPage();
      const response = await page.request.post("/auth/login", {
        data: ConfigManager.getTestCredentials(),
      });

      if (response.ok()) {
        const authData = await response.json();
        // Store auth token in environment for tests to use
        process.env.TEST_AUTH_TOKEN = authData.token;
        Logger.info("✅ Authentication token obtained and stored");
      } else {
        Logger.error(
          "❌ Failed to obtain authentication token",
          await response.text()
        );
      }
    } catch (error) {
      Logger.error("❌ Authentication setup failed", error);
    }

    await context.close();
    await browser.close();

    // Additional setup tasks
    Logger.info("⚙️ Running additional setup tasks");

    // Create any required test directories
    // await fs.mkdir('test-results/screenshots', { recursive: true });
    // await fs.mkdir('test-results/videos', { recursive: true });

    Logger.info("✅ Global setup completed successfully");
  } catch (error) {
    Logger.error("❌ Global setup failed", error);
    throw error;
  }
}

export default globalSetup;
