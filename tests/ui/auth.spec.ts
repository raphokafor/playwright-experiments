import { expect, test } from "../../fixtures/ui-base";

test("Login with valid credentials", async ({
  page,
  loginPage,
  dashboardPage,
}) => {
  await page.goto("http://localhost:3000");
  await loginPage.login("admin", "admin123");
  await expect(dashboardPage.welcomeMessage()).toBeVisible();
});
