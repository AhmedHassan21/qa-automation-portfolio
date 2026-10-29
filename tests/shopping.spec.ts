import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS, CHECKOUT_INFO } from './data';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.loginAs(USERS.valid.username, USERS.valid.password);
});

test.describe('Inventory', () => {
  test('sorting by price low to high orders all products correctly', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectLoaded();

    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.prices();

    const expected = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(expected);
  });

  test('sorting by name A to Z orders all products correctly', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectLoaded();

    // The default inventory order is already A to Z, so sorting 'az' alone
    // would pass with a dead control. Sort Z-A first, assert the flip, then
    // restore A-Z and assert — both passing proves the control works.
    await inventoryPage.sortBy('za');
    const namesZA = await inventoryPage.names();
    const expectedZA = [...namesZA].sort((a, b) => b.localeCompare(a));
    expect(namesZA).toEqual(expectedZA);

    await inventoryPage.sortBy('az');
    const namesAZ = await inventoryPage.names();
    const expectedAZ = [...namesAZ].sort((a, b) => a.localeCompare(b));
    expect(namesAZ).toEqual(expectedAZ);
  });
});

test.describe('Shopping flow', () => {
  test('full purchase: add two items, checkout, order confirmation', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addItemToCart(BACKPACK);
    await inventoryPage.addItemToCart(BIKE_LIGHT);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await cartPage.open();
    await cartPage.expectItemCount(2);
    await cartPage.startCheckout();

    await checkoutPage.fillForm(CHECKOUT_INFO);
    await checkoutPage.continue();
    await checkoutPage.finish();

    await checkoutPage.expectOrderComplete();
  });

  test('checkout form rejects a missing postal code', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addItemToCart(BACKPACK);
    await cartPage.open();
    await cartPage.startCheckout();

    await checkoutPage.fillForm({
      firstName: CHECKOUT_INFO.firstName,
      lastName: CHECKOUT_INFO.lastName,
    });
    await checkoutPage.continue();

    await checkoutPage.expectErrorContains('Error: Postal Code is required');
  });
});
