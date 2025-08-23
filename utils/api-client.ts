import { APIRequestContext, expect } from "@playwright/test";
import { ConfigManager } from "./config";

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  static create(request: APIRequestContext): ApiClient {
    return new ApiClient(request);
  }

  async get(endpoint: string, options?: { headers?: Record<string, string> }) {
    const response = await this.request.get(
      `${ConfigManager.getApiEndpoints().base}${endpoint}`,
      {
        headers: options?.headers,
      }
    );
    return response;
  }

  async post(
    endpoint: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ) {
    const response = await this.request.post(
      `${ConfigManager.getApiEndpoints().base}${endpoint}`,
      {
        data,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      }
    );
    return response;
  }

  async put(
    endpoint: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ) {
    const response = await this.request.put(
      `${ConfigManager.getApiEndpoints().base}${endpoint}`,
      {
        data,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      }
    );
    return response;
  }

  async delete(
    endpoint: string,
    options?: { headers?: Record<string, string> }
  ) {
    const response = await this.request.delete(
      `${ConfigManager.getApiEndpoints().base}${endpoint}`,
      {
        headers: options?.headers,
      }
    );
    return response;
  }

  async expectResponse(response: any, expectedStatus: number = 200) {
    expect(response.status()).toBe(expectedStatus);
    return response;
  }

  async getJson(response: any) {
    return await response.json();
  }
}
