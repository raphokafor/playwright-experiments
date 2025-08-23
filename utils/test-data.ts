import * as fs from "fs";

interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
}

export class TestDataGenerator {
  static generateUser(): UserData {
    const timestamp = Date.now();
    return {
      id: `user-${timestamp}`,
      username: `testuser${timestamp}`,
      email: this.generateEmail(),
      password: "TestPassword123!",
    };
  }

  static generateEmail(): string {
    const timestamp = Date.now();
    return `test${timestamp}@example.com`;
  }

  static generateRandomString(length: number): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateTestId(): string {
    return `test-${Date.now()}-${this.generateRandomString(6)}`;
  }

  static loadTestDataFromFile(filename: string): any {
    try {
      const data = fs.readFileSync(filename, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to load test data from ${filename}:`, error);
      return {};
    }
  }
}
