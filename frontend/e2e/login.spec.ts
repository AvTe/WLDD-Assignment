import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should navigate to login page and login with demo credentials', async ({ page }) => {
    // Navigate to the root, which should redirect to login if not authenticated
    await page.goto('/');

    // Ensure we are redirecting to login page or already on it
    await page.waitForURL('**/login');

    // Click on the "Use Demo App" button 
    const demoButton = page.locator('button:has-text("Use Demo App")');
    if (await demoButton.isVisible()) {
      await demoButton.click();
    } else {
      // Manual login logic (if demo button is missing for any reason in the UI)
      await page.fill('input[type="email"]', 'demo@tasktracker.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
    }

    // After login, we should be redirected to the dashboard or root displaying Dashboard
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveTitle(/Dashboard/);
  });
});
