import { test, expect } from './setup';

test.describe('Demo App', () => {
  test('should load the page successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should display the page title', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await expect(page).toHaveTitle(/WebGL Preview/);
  });

  test('should display the canvas element', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
  });

  test('should show loading status initially', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const status = page.locator('#status');
    await expect(status).toBeVisible();
  });
});
