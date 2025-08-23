import { Page } from "@playwright/test";

class LoginPage {
  constructor(readonly page: Page) {}

  async login(username: string, password: string) {
    await this.page.getByLabel("Username").fill(username);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Login" }).click();
  }
}

export default LoginPage;
