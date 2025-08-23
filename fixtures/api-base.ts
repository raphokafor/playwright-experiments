import { test as base, APIRequestContext } from "@playwright/test";
import { ApiClient } from "../utils/api-client";
import { ConfigManager } from "../utils/config";

type ApiFixtures = {
  apiClient: ApiClient;
  authenticatedApiClient: ApiClient;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ playwright }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL: ConfigManager.getApiEndpoints().base,
    });
    const apiClient = ApiClient.create(requestContext);
    await use(apiClient);
    await requestContext.dispose();
  },

  authenticatedApiClient: async ({ playwright }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL: ConfigManager.getApiEndpoints().base,
    });

    // Authenticate and get token
    const authResponse = await requestContext.post("/auth/login", {
      data: ConfigManager.getTestCredentials(),
    });
    const authData = await authResponse.json();

    // Create authenticated context
    const authenticatedContext = await playwright.request.newContext({
      baseURL: ConfigManager.getApiEndpoints().base,
      extraHTTPHeaders: {
        Authorization: `Bearer ${authData.token}`,
      },
    });

    const apiClient = ApiClient.create(authenticatedContext);
    await use(apiClient);
    await authenticatedContext.dispose();
    await requestContext.dispose();
  },
});

export { expect } from "@playwright/test";
