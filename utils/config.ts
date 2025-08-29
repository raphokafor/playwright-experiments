export class ConfigManager {
  static getBaseUrl(): string {
    return process.env.BASE_URL || "https://jsonplaceholder.typicode.com";
  }

  static getEnvironment(): string {
    return process.env.NODE_ENV || "development";
  }

  static getTestCredentials(): { username: string; password: string } {
    return {
      username: process.env.TEST_USERNAME || "admin",
      password: process.env.TEST_PASSWORD || "admin123",
    };
  }

  static getBrowserConfig(): object {
    return {
      headless: process.env.CI === "true",
      timeout: parseInt(process.env.BROWSER_TIMEOUT || "30000"),
    };
  }

  static getApiEndpoints(): Record<string, string> {
    const baseUrl =
      process.env.API_BASE_URL || "https://jsonplaceholder.typicode.com";
    return {
      base: baseUrl,
      auth: `${baseUrl}/auth`,
      users: `${baseUrl}/users`,
      dashboard: `${baseUrl}/dashboard`,
    };
  }

  static getApiTimeout(): number {
    return parseInt(process.env.API_TIMEOUT || "30000");
  }

  static getApiRetries(): number {
    return parseInt(process.env.API_RETRIES || "2");
  }
}
