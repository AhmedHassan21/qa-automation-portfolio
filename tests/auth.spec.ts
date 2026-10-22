import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS, INVALID_LOGIN } from './data';

let loginPage: LoginPage;
let inventoryPage: InventoryPage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  inventoryPage = new InventoryPage(page);
  await loginPage.open();
});

test.describe('Authentication', () => {
  test('valid user can log in and sees the inventory', async () => {
    await loginPage.loginAs(USERS.valid.username, USERS.valid.password);
    await inventoryPage.expectLoaded();
  });

  test('wrong password shows an error and stays on the login page', async ({ page }) => {
    await loginPage.loginAs(INVALID_LOGIN.username, INVALID_LOGIN.password);
    await loginPage.expectErrorContains(
      'Username and password do not match any user in this service'
    );
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
  });

  test('locked-out user is rejected with a clear message', async () => {
    await loginPage.loginAs(USERS.lockedOut.username, USERS.lockedOut.password);
    await loginPage.expectErrorContains('Sorry, this user has been locked out');
  });
});
