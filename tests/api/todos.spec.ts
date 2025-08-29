import { test, expect } from "../../fixtures/fixture.api";

test.describe("Users API", () => {
  test("should get user profile", async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.get("/todos/1");

    await authenticatedApiClient.expectResponse(response, 200);
    const todo = await authenticatedApiClient.getJson(response);

    console.log(todo);

    expect(todo).toHaveProperty("id");
    expect(todo).toHaveProperty("title");
    expect(todo).toHaveProperty("completed");
  });
});
