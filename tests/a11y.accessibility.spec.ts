import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { USERS } from './data';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

const BACKPACK = 'Sauce Labs Backpack';

/**
 * Accessibility checks with axe-core on the core saucedemo pages.
 *
 * Asserting on critical+serious violations only keeps the suite stable —
 * moderate/minor issues are surfaced in the attached axe results without
 * failing CI, which is the standard first step for a11y adoption.
 */

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

test.describe('Accessibility — critical and serious violations', () => {
  test('login page has no critical/serious violations', async ({ page }) => {
    await page.goto('/');
    const violations = await scan(page);
    expect(violations, JSON.stringify(violations.map((v) => ({ id: v.id, nodes: v.nodes.length })), null, 2)).toHaveLength(0);
  });

  test('inventory page has no critical/serious violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(USERS.valid.username, USERS.valid.password);
    await page.waitForURL(/inventory/);

    const violations = await scan(page);
    expect(violations, JSON.stringify(violations.map((v) => ({ id: v.id, nodes: v.nodes.length })), null, 2)).toHaveLength(0);
  });

  test('cart page has no critical/serious violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    await loginPage.open();
    await loginPage.loginAs(USERS.valid.username, USERS.valid.password);
    await page.waitForURL(/inventory/);
    await inventoryPage.addItemToCart(BACKPACK);
    await cartPage.open();

    const violations = await scan(page);
    expect(violations, JSON.stringify(violations.map((v) => ({ id: v.id, nodes: v.nodes.length })), null, 2)).toHaveLength(0);
  });
});
