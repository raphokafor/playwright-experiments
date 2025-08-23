import { Page } from "@playwright/test";

class DashboardPage {
  constructor(readonly page: Page) {}

  // getters for page elements (page elements are lazy loaded)
  welcomeMessage = () => this.page.getByText("Welcome");
  logoutButton = () => this.page.getByRole("button", { name: "Logout" });

  async getTitle() {
    return await this.page.title();
  }
}

export default DashboardPage;
