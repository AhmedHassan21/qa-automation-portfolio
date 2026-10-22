import { type Page, type Locator, expect } from '@playwright/test';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  async fillForm(form: Partial<CheckoutForm>) {
    if (form.firstName !== undefined) await this.firstNameInput.fill(form.firstName);
    if (form.lastName !== undefined) await this.lastNameInput.fill(form.lastName);
    if (form.postalCode !== undefined) await this.postalCodeInput.fill(form.postalCode);
  }

  async continue() {
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  async expectErrorContains(text: string) {
    await expect(this.errorMessage).toContainText(text);
  }

  async expectOrderComplete() {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
