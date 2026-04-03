import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.navigate('/login');
  }

  get emailInput() {
    return this.page.getByLabel('Email');
  }

  get passwordInput() {
    return this.page.getByLabel('Password');
  }

  get submitButton() {
    return this.page.locator('form button[type="submit"]');
  }

  get errorMessage() {
    return this.page.locator('[role="alert"]');
  }

  get oopsEmoji() {
    return this.page.locator('text=🫣');
  }

  get tryAgainButton() {
    return this.page.getByRole('button', { name: 'Try Again' });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
