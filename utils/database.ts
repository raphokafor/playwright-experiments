interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
}

export class DatabaseHelper {
  static async seedTestData(): Promise<void> {
    console.log("Seeding test data...");
  }

  static async cleanupTestData(): Promise<void> {
    console.log("Cleaning up test data...");
  }

  static async executeQuery(query: string): Promise<any> {
    console.log(`Executing query: ${query}`);
    return {};
  }

  static async createTestUser(): Promise<UserData> {
    return {
      id: `test-${Date.now()}`,
      username: `testuser-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      password: "testpassword123",
    };
  }
}
