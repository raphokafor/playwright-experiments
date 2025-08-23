import {
  Page,
  Request,
  Response as PlaywrightResponse,
} from "@playwright/test";

interface RequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export class ApiHelper {
  static async makeRequest(
    options: RequestOptions
  ): Promise<globalThis.Response> {
    const response = await fetch(options.url, {
      method: options.method || "GET",
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    return response;
  }

  static async setupMockResponse(
    page: Page,
    url: string,
    response: any
  ): Promise<void> {
    await page.route(url, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  static async interceptAndModifyRequest(
    page: Page,
    pattern: string,
    modifier: Function
  ): Promise<void> {
    await page.route(pattern, async (route) => {
      const request = route.request();
      const modifiedRequest = modifier(request);
      await route.continue(modifiedRequest);
    });
  }
}
