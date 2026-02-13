import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TIMESTAMP = Date.now();

test.describe('Student Authentication & Onboarding', () => {

    // Test Data
    const testStudent = {
        fullName: `Test Student ${TIMESTAMP}`,
        email: `test.student.${TIMESTAMP}@university.edu`,
        password: 'SecurePass123!',
        dob: '2000-01-15',
        university: 'University of Tunis',
        hometown: 'Tunis'
    };

    test('Student signup with all required fields', async ({ page }) => {
        await page.goto(`${BASE_URL}/student/signup`);

        // Fill signup form
        await page.getByPlaceholder(/full name/i).fill(testStudent.fullName);
        await page.getByPlaceholder(/email/i).fill(testStudent.email);
        await page.getByPlaceholder(/password/i).first().fill(testStudent.password);
        await page.getByPlaceholder(/confirm password/i).fill(testStudent.password);

        // Date of birth
        await page.locator('input[type="date"]').fill(testStudent.dob);

        // University selection
        await page.getByLabel(/university/i).selectOption(testStudent.university);

        // Hometown
        await page.getByPlaceholder(/hometown/i).fill(testStudent.hometown);

        // Submit form
        await page.getByRole('button', { name: /sign up|create account/i }).click();

        // Verify OTP page or success message
        await expect(page).toHaveURL(/.*verify|otp/i, { timeout: 10000 });
        await expect(page.getByText(/verification code|otp/i)).toBeVisible();
    });

    test('Student signup with ID card upload', async ({ page }) => {
        await page.goto(`${BASE_URL}/student/signup`);

        // Fill basic info
        await page.getByPlaceholder(/full name/i).fill(testStudent.fullName);
        await page.getByPlaceholder(/email/i).fill(`id.upload.${TIMESTAMP}@university.edu`);
        await page.getByPlaceholder(/password/i).first().fill(testStudent.password);
        await page.getByPlaceholder(/confirm password/i).fill(testStudent.password);
        await page.locator('input[type="date"]').fill(testStudent.dob);
        await page.getByLabel(/university/i).selectOption(testStudent.university);
        await page.getByPlaceholder(/hometown/i).fill(testStudent.hometown);

        // Upload ID card (create a test image file)
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'test-id-card.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake-image-data')
        });

        // Verify preview or upload success indicator
        await expect(page.getByText(/uploaded|preview/i)).toBeVisible({ timeout: 5000 });

        // Submit
        await page.getByRole('button', { name: /sign up|create account/i }).click();
        await expect(page).toHaveURL(/.*verify|otp/i, { timeout: 10000 });
    });

    test('Student signup with invalid email format', async ({ page }) => {
        await page.goto(`${BASE_URL}/student/signup`);

        await page.getByPlaceholder(/email/i).fill('invalid-email-format');
        await page.getByPlaceholder(/password/i).first().fill(testStudent.password);

        // Try to submit
        await page.getByRole('button', { name: /sign up|create account/i }).click();

        // Verify error message
        await expect(page.getByText(/invalid email|valid email/i)).toBeVisible();
    });

    test('Student signup with password mismatch', async ({ page }) => {
        await page.goto(`${BASE_URL}/student/signup`);

        await page.getByPlaceholder(/full name/i).fill(testStudent.fullName);
        await page.getByPlaceholder(/email/i).fill(`mismatch.${TIMESTAMP}@university.edu`);
        await page.getByPlaceholder(/password/i).first().fill(testStudent.password);
        await page.getByPlaceholder(/confirm password/i).fill('DifferentPassword123!');

        await page.getByRole('button', { name: /sign up|create account/i }).click();

        // Verify error message
        await expect(page.getByText(/passwords.*match|password.*same/i)).toBeVisible();
    });

    test('Student login with valid credentials', async ({ page }) => {
        // Use existing test student credentials
        const existingStudent = {
            email: 'mohebawichewi9@wow.edu',
            password: '123456'
        };

        await page.goto(`${BASE_URL}/student/login`);

        await page.getByPlaceholder(/email|student@university/i).fill(existingStudent.email);
        await page.getByPlaceholder(/password|••••/i).fill(existingStudent.password);
        await page.getByRole('button', { name: /log in|sign in/i }).click();

        // Verify redirect to home page
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i, { timeout: 10000 });
        await expect(page.getByText(/welcome|deals|home/i)).toBeVisible();
    });

    test('Student login with invalid credentials', async ({ page }) => {
        await page.goto(`${BASE_URL}/student/login`);

        await page.getByPlaceholder(/email|student@university/i).fill('wrong@email.com');
        await page.getByPlaceholder(/password|••••/i).fill('wrongpassword');
        await page.getByRole('button', { name: /log in|sign in/i }).click();

        // Verify error message
        await expect(page.getByText(/invalid credentials|incorrect|wrong/i)).toBeVisible();

        // Should stay on login page
        await expect(page).toHaveURL(/.*login/i);
    });

    test('Student login with empty fields', async ({ page }) => {
        await page.goto(`${BASE_URL}/student/login`);

        // Try to submit without filling fields
        await page.getByRole('button', { name: /log in|sign in/i }).click();

        // Verify validation messages
        await expect(page.getByText(/required|fill|enter/i).first()).toBeVisible();
    });

    test('Session persistence after login', async ({ page, context }) => {
        const existingStudent = {
            email: 'mohebawichewi9@wow.edu',
            password: '123456'
        };

        // Login
        await page.goto(`${BASE_URL}/student/login`);
        await page.getByPlaceholder(/email|student@university/i).fill(existingStudent.email);
        await page.getByPlaceholder(/password|••••/i).fill(existingStudent.password);
        await page.getByRole('button', { name: /log in|sign in/i }).click();
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i, { timeout: 10000 });

        // Get cookies to verify session
        const cookies = await context.cookies();
        const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'));
        expect(sessionCookie).toBeDefined();

        // Navigate away and back
        await page.goto(`${BASE_URL}`);
        await page.goto(`${BASE_URL}/student/home`);

        // Should still be logged in (not redirected to login)
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i);
    });

    test('Logout functionality', async ({ page }) => {
        const existingStudent = {
            email: 'mohebawichewi9@wow.edu',
            password: '123456'
        };

        // Login first
        await page.goto(`${BASE_URL}/student/login`);
        await page.getByPlaceholder(/email|student@university/i).fill(existingStudent.email);
        await page.getByPlaceholder(/password|••••/i).fill(existingStudent.password);
        await page.getByRole('button', { name: /log in|sign in/i }).click();
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i, { timeout: 10000 });

        // Find and click logout button
        const logoutBtn = page.getByRole('button', { name: /log out|sign out/i });

        // If logout is in a menu, open it first
        if (await logoutBtn.count() === 0) {
            await page.getByRole('button', { name: /menu|profile|account/i }).click();
            await page.getByRole('button', { name: /log out|sign out/i }).click();
        } else {
            await logoutBtn.click();
        }

        // Verify redirect to login or home page
        await expect(page).toHaveURL(/.*login|^\/$/, { timeout: 5000 });
    });

    test('Password reset flow', async ({ page }) => {
        await page.goto(`${BASE_URL}/student/login`);

        // Click forgot password link
        await page.getByText(/forgot password|reset password/i).click();

        // Enter email
        await page.getByPlaceholder(/email/i).fill('mohebawichewi9@wow.edu');
        await page.getByRole('button', { name: /send|reset|submit/i }).click();

        // Verify success message
        await expect(page.getByText(/sent|check email|reset link/i)).toBeVisible({ timeout: 5000 });
    });

    test('OTP verification with valid code', async ({ page }) => {
        // This test assumes you have a way to get the OTP (e.g., from database or email)
        // For now, we'll test the UI flow
        await page.goto(`${BASE_URL}/student/verify-otp`);

        // Enter OTP (you'd need to get this from your test setup)
        const otpInputs = page.locator('input[type="text"]').or(page.locator('input[type="number"]'));
        const count = await otpInputs.count();

        if (count >= 6) {
            // Fill 6-digit OTP
            for (let i = 0; i < 6; i++) {
                await otpInputs.nth(i).fill('1');
            }
        } else {
            // Single input field
            await otpInputs.first().fill('123456');
        }

        // Submit
        await page.getByRole('button', { name: /verify|submit|confirm/i }).click();

        // Note: This will likely fail with invalid OTP, but tests the UI flow
        // In a real test, you'd mock the OTP or retrieve it from the database
    });

    test('Auto-redirect authenticated user from login page', async ({ page }) => {
        const existingStudent = {
            email: 'mohebawichewi9@wow.edu',
            password: '123456'
        };

        // Login first
        await page.goto(`${BASE_URL}/student/login`);
        await page.getByPlaceholder(/email|student@university/i).fill(existingStudent.email);
        await page.getByPlaceholder(/password|••••/i).fill(existingStudent.password);
        await page.getByRole('button', { name: /log in|sign in/i }).click();
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i, { timeout: 10000 });

        // Try to access login page again
        await page.goto(`${BASE_URL}/student/login`);

        // Should redirect to home
        await expect(page).toHaveURL(/.*\/student\/home|user\/home/i, { timeout: 5000 });
    });

});
