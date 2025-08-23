import { test, expect } from "../../fixtures/api-base";
import { TestDataGenerator } from "../../utils/test-data";

test.describe("Authentication API", () => {
  test("should login with valid credentials", async ({ apiClient }) => {
    // Arrange test creds
    const credentials = {
      username: "admin",
      password: "admin123",
    };

    const response = await apiClient.post("/auth/login", credentials);

    await apiClient.expectResponse(response, 200);
    const data = await apiClient.getJson(response);

    expect(data).toHaveProperty("token");
    expect(data.user).toHaveProperty("username", credentials.username);
  });

  test("should reject invalid credentials", async ({ apiClient }) => {
    const invalidCredentials = {
      username: "invalid",
      password: "wrong",
    };

    const response = await apiClient.post("/auth/login", invalidCredentials);
    await apiClient.expectResponse(response, 401);
  });

  test("should register new user", async ({ apiClient }) => {
    const newUser = TestDataGenerator.generateUser();

    const response = await apiClient.post("/auth/register", newUser);

    await apiClient.expectResponse(response, 201);
    const data = await apiClient.getJson(response);

    expect(data.user).toHaveProperty("id");
    expect(data.user.username).toBe(newUser.username);
  });
});
