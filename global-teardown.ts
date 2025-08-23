import { FullConfig } from "@playwright/test";
import { Logger } from "./utils/logger";
import { DatabaseHelper } from "./utils/database";

async function globalTeardown(config: FullConfig) {
  Logger.info("🧹 Starting global teardown...");

  try {
    // Clean up test database
    Logger.info("🗄️ Cleaning up test database");
    await DatabaseHelper.cleanupTestData();

    // Clear authentication token
    Logger.info("🔐 Clearing authentication data");
    delete process.env.TEST_AUTH_TOKEN;

    // Additional cleanup tasks
    Logger.info("🧽 Running additional cleanup tasks");

    // Clean up temporary files, logs, etc.
    // await fs.rmdir('temp-test-files', { recursive: true });

    // Generate test summary report
    Logger.info("📊 Generating test summary");
    Logger.info(`Test run completed at: ${new Date().toISOString()}`);

    Logger.info("✅ Global teardown completed successfully");
  } catch (error) {
    Logger.error("❌ Global teardown failed", error);
    // Don't throw error to avoid masking test failures
  }
}

export default globalTeardown;
