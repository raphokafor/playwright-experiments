import { expect, test } from "../../fixtures/fixture.ui";

test("Login with valid credentials", async ({ page, dashboardPage }) => {
  await page.goto("https://playwright.dev/");
  await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
});
