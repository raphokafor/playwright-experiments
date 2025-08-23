import { test, expect } from "../../fixtures/api-base";
import { TestDataGenerator } from "../../utils/test-data";

test.describe("Users API", () => {
  test("should get user profile", async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.get("/users/profile");

    await authenticatedApiClient.expectResponse(response, 200);
    const user = await authenticatedApiClient.getJson(response);

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("email");
  });

  test("should update user profile", async ({ authenticatedApiClient }) => {
    const updateData = {
      email: TestDataGenerator.generateEmail(),
    };

    const response = await authenticatedApiClient.put(
      "/users/profile",
      updateData
    );

    await authenticatedApiClient.expectResponse(response, 200);
    const updatedUser = await authenticatedApiClient.getJson(response);

    expect(updatedUser.email).toBe(updateData.email);
  });

  test("should list users for admin", async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.get("/users");

    await authenticatedApiClient.expectResponse(response, 200);
    const users = await authenticatedApiClient.getJson(response);

    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });
});
