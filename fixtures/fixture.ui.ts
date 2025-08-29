import { test as base, Page } from "@playwright/test";
import LoginPage from "../pages/login.page";
import DashboardPage from "../pages/dashboard.page";

type Fixtures = {
  page: Page;
  pageWithMonitoring: Page;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await use(page);
  },
  pageWithMonitoring: [
    async ({ page }, use, testInfo) => {
      const failedRequests: {
        url: string;
        status: number;
        headers: Record<string, string>;
        method: string;
        statusText: string;
        testName: string;
        testFile: string;
        testLine: number;
        timeStamp: string;
      }[] = [];
      // setup monitoring
      page.on("response", async (response) => {
        const url = response.url();
        const status = response.status();
        const headers = await response.allHeaders();
        const method = response.request().method();
        const statusText = response.statusText();
        const testName = testInfo.title;
        const testFile = testInfo.file;
        const testLine = testInfo.line;
        const timeStamp = new Date().toISOString();

        if (status >= 400) {
          failedRequests.push({
            url,
            status,
            headers,
            method,
            statusText,
            testName,
            testFile,
            testLine,
            timeStamp,
          });
        }
      });
      await use(page);

      // teardown monitoring
      if (failedRequests.length > 0) {
        testInfo.attach("failed-requests.json", {
          body: JSON.stringify(failedRequests, null, 2),
          contentType: "application/json",
        });
        throw new Error("Looks like there are some failed requests");
      }
    },
    // auto: true means that the fixture will be automatically created and destroyed for each testt
    { auto: true },
  ],
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from "@playwright/test";
