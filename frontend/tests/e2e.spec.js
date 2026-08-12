import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SkillForge-AI/);
});

test('sidebar navigation works', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Click the Evolution Lab tab
  await page.click('text=Evolution Lab');

  // Expect the page to show Evolution Lab title
  await expect(page.locator('h1')).toContainText('Evolution Lab');
});
