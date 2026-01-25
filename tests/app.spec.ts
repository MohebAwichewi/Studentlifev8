import { test, expect } from '@playwright/test';

// Change this to 'http://localhost:3000' if testing locally, 
// or 'https://student-life.uk' to test the live site.
const URL = 'https://student-life.uk'; 

// ⚠️ ✅ PASTE A REAL BUSINESS ID FROM YOUR DATABASE HERE
// (Go to Prisma Studio, copy a real ID like "clq..." and paste it below)
const REAL_BUSINESS_ID = 'cmk5j5q8m0000cx6ssvab9dt9'; 

test('Home page should load and show title', async ({ page }) => {
  // 1. Go to the website
  await page.goto(URL);

  // 2. Check if the "Student.LIFE" logo exists
  await expect(page.getByText('Student.LIFE')).toBeVisible();

  // 3. Check if the "Join Now" button is there
  await expect(page.getByRole('button', { name: 'Join Now' })).toBeVisible();
});

test('Navigation to Login works', async ({ page }) => {
  await page.goto(URL);

  // 1. Click the "Log in" button
  await page.getByRole('button', { name: 'Log in' }).click();

  // 2. Wait for the modal or page to appear
  await expect(page.getByText('Welcome Back')).toBeVisible();
});

test('Business Profile loads correctly', async ({ page }) => {
  // ✅ UPDATED: Go to a REAL business page using the ID defined above
  await page.goto(`${URL}/business/${REAL_BUSINESS_ID}`);

  // ✅ UPDATED: We use /Active Offers/ (regex) to match "Active Offers (0)" or "Active Offers (5)"
  // This prevents it from failing just because the number is different.
  await expect(page.getByRole('heading', { name: /Active Offers/ })).toBeVisible();
});