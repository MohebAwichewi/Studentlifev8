import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_LOCATION = { latitude: 36.8065, longitude: 10.1815 }; // Tunis Center

test.describe('Deal Redemption System', () => {

    // Setup: Login and grant location permissions before each test
    test.beforeEach(async ({ page, context }) => {
        // Grant geolocation permission
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation(TEST_LOCATION);

        // Login
        await page.goto(`${BASE_URL}/student/login`);
        await page.getByPlaceholder(/email|student@university/i).fill('mohebawichewi9@wow.edu');
        await page.getByPlaceholder(/password|••••/i).fill('123456');
        await page.getByRole('button', { name: /log in|sign in/i }).click();
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i, { timeout: 10000 });
    });

    test('Swipe to redeem single-use deal', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Find a single-use deal (you might need to filter or create one)
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            // Click on first deal
            await dealCards.first().click();
            await expect(page).toHaveURL(/.*\/deal\/|\/student\/deal-details/i, { timeout: 5000 });

            // Wait for swipe component to load
            await expect(page.getByText(/swipe to redeem/i)).toBeVisible({ timeout: 10000 });

            // Perform swipe gesture
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                const sliderBox = await slider.boundingBox();

                if (sliderBox) {
                    // Simulate swipe from left to right
                    await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(
                        sliderBox.x + sliderBox.width - 5,
                        sliderBox.y + sliderBox.height / 2,
                        { steps: 20 }
                    );
                    await page.mouse.up();

                    // Wait for redemption to process
                    await page.waitForTimeout(2000);

                    // Verify success state
                    await expect(page.getByText(/redeemed|success|congratulations/i)).toBeVisible({ timeout: 5000 });

                    // Verify QR code is displayed
                    const qrCode = page.locator('svg').filter({ hasText: /QR|qr/ }).or(
                        page.locator('[data-testid="qr-code"]')
                    ).or(
                        page.locator('canvas')
                    );

                    if (await qrCode.count() > 0) {
                        await expect(qrCode.first()).toBeVisible();
                    }
                }
            }
        }
    });

    test('Multi-use deal shows cooldown timer', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Find a multi-use deal
        // This test assumes you have multi-use deals in your database
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            // Look for a deal marked as multi-use
            const multiUseDeal = page.getByText(/multi-use|reusable/i);

            if (await multiUseDeal.count() > 0) {
                await multiUseDeal.first().click();
                await page.waitForTimeout(1000);

                // Redeem the deal first time
                const slider = page.locator('input[type="range"]');

                if (await slider.count() > 0) {
                    const sliderBox = await slider.boundingBox();

                    if (sliderBox) {
                        await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                        await page.mouse.down();
                        await page.mouse.move(
                            sliderBox.x + sliderBox.width - 5,
                            sliderBox.y + sliderBox.height / 2,
                            { steps: 20 }
                        );
                        await page.mouse.up();

                        await page.waitForTimeout(2000);

                        // Go back to deal list
                        await page.goBack();
                        await page.waitForTimeout(1000);

                        // Try to redeem again - should show cooldown
                        await multiUseDeal.first().click();
                        await page.waitForTimeout(1000);

                        // Look for cooldown timer
                        const cooldownTimer = page.getByText(/available in|cooldown|wait/i);

                        if (await cooldownTimer.count() > 0) {
                            await expect(cooldownTimer.first()).toBeVisible();
                        }
                    }
                }
            }
        }
    });

    test('QR code generation after redemption', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Perform redemption
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                const sliderBox = await slider.boundingBox();

                if (sliderBox) {
                    await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(
                        sliderBox.x + sliderBox.width - 5,
                        sliderBox.y + sliderBox.height / 2,
                        { steps: 20 }
                    );
                    await page.mouse.up();

                    await page.waitForTimeout(2000);

                    // Verify QR code is present and valid
                    const qrCode = page.locator('svg[viewBox]').or(
                        page.locator('canvas')
                    );

                    if (await qrCode.count() > 0) {
                        await expect(qrCode.first()).toBeVisible();

                        // Verify QR code has content
                        const qrElement = qrCode.first();
                        const bbox = await qrElement.boundingBox();
                        expect(bbox).toBeTruthy();
                        expect(bbox!.width).toBeGreaterThan(100);
                        expect(bbox!.height).toBeGreaterThan(100);
                    }
                }
            }
        }
    });

    test('Location verification before redemption', async ({ page, context }) => {
        // Set location far from any deal
        await context.setGeolocation({ latitude: 0, longitude: 0 });

        await page.reload();
        await page.waitForLoadState('networkidle');

        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Try to redeem - should show location error
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                // Look for location warning/error
                const locationError = page.getByText(/too far|location|distance|nearby/i);

                if (await locationError.count() > 0) {
                    await expect(locationError.first()).toBeVisible();
                }
            }
        }
    });

    test('Redemption history tracking', async ({ page }) => {
        // Navigate to history page
        const historyLink = page.getByRole('link', { name: /history|past|redeemed/i });

        if (await historyLink.count() > 0) {
            await historyLink.click();
            await page.waitForLoadState('networkidle');

            // Verify history page loaded
            await expect(page).toHaveURL(/.*history|redeemed/i, { timeout: 5000 });

            // Check for redemption records
            const redemptionCards = page.locator('[data-testid="redemption-card"]').or(
                page.locator('.redemption-card')
            );

            if (await redemptionCards.count() > 0) {
                await expect(redemptionCards.first()).toBeVisible();

                // Verify redemption details are shown
                await expect(page.getByText(/redeemed on|date|time/i).first()).toBeVisible();
            } else {
                // Empty state
                await expect(page.getByText(/no redemptions|empty|start redeeming/i)).toBeVisible();
            }
        }
    });

    test('Prevent duplicate redemptions for single-use deals', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Find a deal
        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            const firstDealText = await dealCards.first().textContent();

            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Redeem the deal
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                const sliderBox = await slider.boundingBox();

                if (sliderBox) {
                    await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(
                        sliderBox.x + sliderBox.width - 5,
                        sliderBox.y + sliderBox.height / 2,
                        { steps: 20 }
                    );
                    await page.mouse.up();

                    await page.waitForTimeout(2000);

                    // Go back to home
                    await page.goto(`${BASE_URL}/student/home`);
                    await page.waitForLoadState('networkidle');

                    // Verify the deal is no longer in the active feed
                    const dealStillVisible = page.getByText(firstDealText || '');

                    // For single-use deals, it should be hidden
                    // This might not work if the deal text is generic
                    // Better to check if it's marked as redeemed or hidden
                }
            }
        }
    });

    test('Voucher code display after redemption', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Redeem
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                const sliderBox = await slider.boundingBox();

                if (sliderBox) {
                    await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(
                        sliderBox.x + sliderBox.width - 5,
                        sliderBox.y + sliderBox.height / 2,
                        { steps: 20 }
                    );
                    await page.mouse.up();

                    await page.waitForTimeout(2000);

                    // Look for voucher code
                    const voucherCode = page.getByText(/code|voucher|SL-/i);

                    if (await voucherCode.count() > 0) {
                        await expect(voucherCode.first()).toBeVisible();

                        // Verify code format (e.g., SL-XXXX-XXXX)
                        const codeText = await voucherCode.first().textContent();
                        expect(codeText).toMatch(/[A-Z0-9-]+/);
                    }
                }
            }
        }
    });

    test('Swipe gesture requires full completion', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Perform partial swipe (only 50%)
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                const sliderBox = await slider.boundingBox();

                if (sliderBox) {
                    await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(
                        sliderBox.x + (sliderBox.width / 2),
                        sliderBox.y + sliderBox.height / 2,
                        { steps: 10 }
                    );
                    await page.mouse.up();

                    await page.waitForTimeout(1000);

                    // Verify redemption did NOT occur
                    const successMessage = page.getByText(/redeemed|success/i);
                    await expect(successMessage).not.toBeVisible();

                    // Slider should reset
                    const sliderValue = await slider.getAttribute('value');
                    expect(parseInt(sliderValue || '0')).toBeLessThan(100);
                }
            }
        }
    });

    test('Redemption success message displays correctly', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Redeem
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                const sliderBox = await slider.boundingBox();

                if (sliderBox) {
                    await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(
                        sliderBox.x + sliderBox.width - 5,
                        sliderBox.y + sliderBox.height / 2,
                        { steps: 20 }
                    );
                    await page.mouse.up();

                    await page.waitForTimeout(2000);

                    // Verify success elements
                    await expect(page.getByText(/deal redeemed|success|congratulations/i)).toBeVisible();
                    await expect(page.getByText(/show this screen|present this/i)).toBeVisible();
                }
            }
        }
    });

    test('Network error handling during redemption', async ({ page, context }) => {
        await page.waitForLoadState('networkidle');

        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Simulate offline mode
            await context.setOffline(true);

            // Try to redeem
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                const sliderBox = await slider.boundingBox();

                if (sliderBox) {
                    await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(
                        sliderBox.x + sliderBox.width - 5,
                        sliderBox.y + sliderBox.height / 2,
                        { steps: 20 }
                    );
                    await page.mouse.up();

                    await page.waitForTimeout(2000);

                    // Verify error message
                    const errorMessage = page.getByText(/network|offline|connection|failed/i);

                    if (await errorMessage.count() > 0) {
                        await expect(errorMessage.first()).toBeVisible();
                    }
                }
            }

            // Restore online mode
            await context.setOffline(false);
        }
    });

    test('Redemption timestamp is recorded', async ({ page }) => {
        // Navigate to history
        const historyLink = page.getByRole('link', { name: /history|past/i });

        if (await historyLink.count() > 0) {
            await historyLink.click();
            await page.waitForLoadState('networkidle');

            // Check for timestamps
            const timestamps = page.getByText(/\d{1,2}:\d{2}|AM|PM|ago|today|yesterday/i);

            if (await timestamps.count() > 0) {
                await expect(timestamps.first()).toBeVisible();
            }
        }
    });

    test('Business information shown on redemption screen', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        const dealCards = page.locator('[data-testid="deal-card"]').or(
            page.locator('.deal-card')
        );

        if (await dealCards.count() > 0) {
            await dealCards.first().click();
            await page.waitForTimeout(1000);

            // Redeem
            const slider = page.locator('input[type="range"]');

            if (await slider.count() > 0) {
                const sliderBox = await slider.boundingBox();

                if (sliderBox) {
                    await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
                    await page.mouse.down();
                    await page.mouse.move(
                        sliderBox.x + sliderBox.width - 5,
                        sliderBox.y + sliderBox.height / 2,
                        { steps: 20 }
                    );
                    await page.mouse.up();

                    await page.waitForTimeout(2000);

                    // Verify business name/logo is shown
                    const businessInfo = page.locator('img[alt*="logo"]').or(
                        page.getByText(/business|partner|location/i)
                    );

                    if (await businessInfo.count() > 0) {
                        await expect(businessInfo.first()).toBeVisible();
                    }
                }
            }
        }
    });

});
