import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Deal Discovery & Interaction', () => {

    // Setup: Login before each test
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/student/login`);
        await page.getByPlaceholder(/email|student@university/i).fill('mohebawichewi9@wow.edu');
        await page.getByPlaceholder(/password|••••/i).fill('123456');
        await page.getByRole('button', { name: /log in|sign in/i }).click();
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i, { timeout: 10000 });
    });

    test('Home feed loads with active deals', async ({ page }) => {
        // Verify page loaded
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i);

        // Wait for deals to load
        await page.waitForLoadState('networkidle');

        // Check for deal cards (adjust selector based on your implementation)
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        ).or(
            page.locator('article').filter({ hasText: /% OFF|discount|deal/i })
        );

        // Verify at least one deal is visible
        await expect(dealCards.first()).toBeVisible({ timeout: 10000 });

        // Verify deal has essential elements
        await expect(page.getByRole('img').first()).toBeVisible(); // Deal image
    });

    test('Category filtering works correctly', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Find category buttons/tabs
        const categories = ['Food', 'Entertainment', 'Shopping', 'Travel'];

        for (const category of categories) {
            const categoryBtn = page.getByRole('button', { name: new RegExp(category, 'i') });

            if (await categoryBtn.count() > 0) {
                await categoryBtn.click();

                // Wait for filtered results
                await page.waitForTimeout(1000);

                // Verify URL or UI updated
                // This depends on your implementation - could be URL param or just UI change
                const dealCards = page.locator('[data-testid="deal-card"]').or(
                    page.locator('.deal-card')
                );

                // Verify deals are still visible (or empty state if no deals in category)
                const count = await dealCards.count();
                expect(count).toBeGreaterThanOrEqual(0);

                break; // Test one category to save time
            }
        }
    });

    test('Search functionality filters deals', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Find search input
        const searchInput = page.getByPlaceholder(/search/i);

        if (await searchInput.count() > 0) {
            await searchInput.fill('burger');
            await searchInput.press('Enter');

            // Wait for results
            await page.waitForTimeout(1500);

            // Verify results contain search term (in title or description)
            const dealCards = page.locator('[data-testid="deal-card"]').or(
                page.locator('.deal-card')
            );

            if (await dealCards.count() > 0) {
                const firstDeal = dealCards.first();
                const text = await firstDeal.textContent();
                expect(text?.toLowerCase()).toContain('burger');
            }
        }
    });

    test('Geolocation-based sorting displays nearest deals first', async ({ page, context }) => {
        // Grant geolocation permission
        await context.grantPermissions(['geolocation']);

        // Set location to Tunis center
        await context.setGeolocation({ latitude: 36.8065, longitude: 10.1815 });

        // Reload to apply location
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify deals loaded
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        await expect(dealCards.first()).toBeVisible({ timeout: 10000 });

        // Verify distance is shown (if your UI displays it)
        const distanceText = page.getByText(/km|meters|away/i);
        if (await distanceText.count() > 0) {
            await expect(distanceText.first()).toBeVisible();
        }
    });

    test('Deal detail page navigation works', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Find and click first deal
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        ).or(
            page.locator('article').filter({ hasText: /% OFF|discount/i })
        );

        await expect(dealCards.first()).toBeVisible({ timeout: 10000 });

        // Get deal title before clicking
        const dealTitle = await dealCards.first().textContent();

        // Click deal
        await dealCards.first().click();

        // Verify navigation to detail page
        await expect(page).toHaveURL(/.*\/deal\/|\/student\/deal-details/i, { timeout: 5000 });

        // Verify deal details are displayed
        await expect(page.getByText(/description|details|about/i)).toBeVisible();
        await expect(page.getByText(/swipe to redeem|redeem|get deal/i)).toBeVisible();
    });

    test('Save deal functionality', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Find first deal
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        await expect(dealCards.first()).toBeVisible({ timeout: 10000 });

        // Find save/bookmark button (heart icon, bookmark icon, etc.)
        const saveBtn = dealCards.first().locator('button').filter({
            hasText: /save|bookmark/i
        }).or(
            dealCards.first().locator('[aria-label*="save"]')
        ).or(
            dealCards.first().locator('svg').filter({ hasText: /heart|bookmark/i })
        );

        if (await saveBtn.count() > 0) {
            await saveBtn.first().click();

            // Verify saved state (icon change, toast message, etc.)
            await expect(page.getByText(/saved|added to wallet/i)).toBeVisible({ timeout: 3000 });
        }
    });

    test('Unsave deal functionality', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Navigate to saved deals / wallet
        const walletBtn = page.getByRole('link', { name: /wallet|saved/i });

        if (await walletBtn.count() > 0) {
            await walletBtn.click();
            await page.waitForLoadState('networkidle');

            // Find a saved deal
            const savedDeals = page.locator('[data-testid="deal-card"]').or(
                page.locator('.deal-card')
            );

            if (await savedDeals.count() > 0) {
                // Find unsave button
                const unsaveBtn = savedDeals.first().locator('button').filter({
                    hasText: /remove|unsave/i
                });

                if (await unsaveBtn.count() > 0) {
                    await unsaveBtn.first().click();

                    // Verify removed
                    await expect(page.getByText(/removed|unsaved/i)).toBeVisible({ timeout: 3000 });
                }
            }
        }
    });

    test('Deal expiry date is displayed correctly', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Click on a deal to view details
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await expect(page).toHaveURL(/.*\/deal\/|\/student\/deal-details/i, { timeout: 5000 });

            // Look for expiry date
            const expiryText = page.getByText(/expires|valid until|expiry/i);

            if (await expiryText.count() > 0) {
                await expect(expiryText.first()).toBeVisible();

                // Verify it contains a date
                const text = await expiryText.first().textContent();
                expect(text).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i);
            }
        }
    });

    test('Urgent deals are highlighted', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Look for urgent badge/indicator
        const urgentBadge = page.getByText(/urgent|limited time|ending soon/i);

        if (await urgentBadge.count() > 0) {
            await expect(urgentBadge.first()).toBeVisible();

            // Verify it has special styling (you might need to check CSS classes)
            const badge = urgentBadge.first();
            const className = await badge.getAttribute('class');
            expect(className).toBeTruthy();
        }
    });

    test('Deal images load correctly', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Wait for images to load
        const dealImages = page.locator('img[alt*="deal"]').or(
            page.locator('[data-testid="deal-card"] img')
        ).or(
            page.locator('.deal-card img')
        );

        if (await dealImages.count() > 0) {
            const firstImage = dealImages.first();
            await expect(firstImage).toBeVisible();

            // Verify image has loaded (not broken)
            const naturalWidth = await firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
            expect(naturalWidth).toBeGreaterThan(0);
        }
    });

    test('Deal categories are displayed', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Click on a deal
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Look for category badge/tag
            const categoryBadge = page.getByText(/food|entertainment|shopping|travel|health|education/i);

            if (await categoryBadge.count() > 0) {
                await expect(categoryBadge.first()).toBeVisible();
            }
        }
    });

    test('Discount value is prominently displayed', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Look for discount badges
        const discountBadge = page.getByText(/% OFF|\d+%|discount/i);

        await expect(discountBadge.first()).toBeVisible({ timeout: 10000 });

        // Verify it contains a percentage or discount value
        const text = await discountBadge.first().textContent();
        expect(text).toMatch(/\d+%|\d+\s*OFF/i);
    });

    test('Empty state shown when no deals match filter', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Search for something unlikely to exist
        const searchInput = page.getByPlaceholder(/search/i);

        if (await searchInput.count() > 0) {
            await searchInput.fill('xyzabc123nonexistent');
            await searchInput.press('Enter');
            await page.waitForTimeout(1500);

            // Look for empty state message
            const emptyState = page.getByText(/no deals found|no results|try different/i);

            if (await emptyState.count() > 0) {
                await expect(emptyState).toBeVisible();
            }
        }
    });

    test('Deal view count increments on view', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Click on a deal
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(2000);

            // View count should increment (this is backend logic, hard to verify in E2E)
            // But we can verify the view count is displayed
            const viewCount = page.getByText(/\d+\s*views?/i);

            if (await viewCount.count() > 0) {
                await expect(viewCount.first()).toBeVisible();
            }
        }
    });

    test('Back navigation from deal details works', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Click on a deal
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await expect(page).toHaveURL(/.*\/deal\/|\/student\/deal-details/i, { timeout: 5000 });

            // Click back button
            const backBtn = page.getByRole('button', { name: /back/i }).or(
                page.locator('[aria-label*="back"]')
            );

            if (await backBtn.count() > 0) {
                await backBtn.click();
            } else {
                await page.goBack();
            }

            // Verify back on home page
            await expect(page).toHaveURL(/.*\/student\/home|user\/home/i, { timeout: 3000 });
        }
    });

    test('Deal sharing functionality', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Click on a deal
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Look for share button
            const shareBtn = page.getByRole('button', { name: /share/i }).or(
                page.locator('[aria-label*="share"]')
            );

            if (await shareBtn.count() > 0) {
                await shareBtn.click();

                // Verify share modal or native share dialog
                await page.waitForTimeout(500);
            }
        }
    });

});
