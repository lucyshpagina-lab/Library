import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.navigate('/register');
  }

  get usernameInput() {
    return this.page.getByLabel('Username');
  }

  get emailInput() {
    return this.page.getByLabel('Email');
  }

  get passwordInput() {
    return this.page.getByLabel('Password', { exact: true });
  }

  get confirmPasswordInput() {
    return this.page.getByLabel('Repeat Password');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Create Account' });
  }

  get errorMessage() {
    return this.page.locator('[role="alert"]');
  }

  async register(username: string, email: string, password: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.submitButton.click();
  }
}
