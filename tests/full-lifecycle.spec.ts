import { test, expect } from '@playwright/test';

// --- CONFIGURATION ---
const BASE_URL = 'http://localhost:3000'; // Change if your port is different
const TIMESTAMP = Date.now(); // Unique ID for this test run
const DEAL_TITLE = `Auto-Test Deal ${TIMESTAMP}`;

// Credentials
const ADMIN = { email: 'admin@student-life.uk', pass: 'admin123' };
const BUSINESS = { email: 'mohebawichewi9@gmail.com', pass: 'xnxxxnxx11' };
const STUDENT = { email: 'mohebawichewi9@wow.edu', pass: '123456' };

// Location (Tunis Center - Matches your default map center)
// ⚠️ Ensure your Business Account has a location added near here!
const TEST_LOCATION = { latitude: 36.8065, longitude: 10.1815 }; 

test.describe.serial('Full App Lifecycle: Create -> Approve -> Redeem', () => {

  // -----------------------------------------------------------------------
  // 1. BUSINESS: Create a New Deal
  // -----------------------------------------------------------------------
  test('Step 1: Business creates a deal', async ({ page }) => {
    await page.goto(`${BASE_URL}/business/login`);
    
    // Login
    await page.getByPlaceholder('name@company.com').fill(BUSINESS.email);
    await page.getByPlaceholder('••••••••').fill(BUSINESS.pass);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for Dashboard
    await expect(page).toHaveURL(/.*\/business\/dashboard/);
    
    // Open "Create Deal" Modal (or Navigate to Add Page)
    // Adjust selector based on your exact UI (Modal vs Page)
    // Assuming you implemented the 'New Deal' button in the dashboard:
    const newDealBtn = page.getByRole('button', { name: /New Deal/i });
    
    // Fallback: If button isn't visible, go to direct URL
    if (await newDealBtn.count() > 0) {
        await newDealBtn.click();
    } else {
        await page.goto(`${BASE_URL}/business/add-deal`);
    }

    // Fill Form
    await page.getByPlaceholder('e.g. 2-for-1 Burgers').fill(DEAL_TITLE);
    await page.getByPlaceholder('e.g. 20% OFF').fill('50% OFF');
    // Using generic selectors for date since type="date" can be tricky
    await page.locator('input[type="date"]').fill('2026-12-31'); 
    await page.locator('textarea').first().fill('This is an automated test deal description.');
    
    // Submit
    await page.getByRole('button', { name: /Publish/i }).click();

    // Verify Success Alert or Redirect
    // Playwright handles dialogs automatically, but we check for UI changes
    // Waiting for modal to close or redirect
    await page.waitForTimeout(2000); 
    
    console.log(`✅ Deal Created: "${DEAL_TITLE}"`);
  });

  // -----------------------------------------------------------------------
  // 2. ADMIN: Approve the Deal
  // -----------------------------------------------------------------------
  test('Step 2: Admin approves the deal', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);

    // Login
    await page.getByPlaceholder('admin@student-life.uk').fill(ADMIN.email);
    await page.getByPlaceholder('••••••••').fill(ADMIN.pass);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // Switch to Offers/Deals Tab if needed (based on your layout default is Overview)
    // If your "Pending Deals" are on the Overview tab:
    await expect(page.getByText(DEAL_TITLE)).toBeVisible();

    // Click "Approve" (The Checkmark or Approve button next to the specific deal)
    // We locate the row containing our DEAL_TITLE, then find the button inside it
    const dealRow = page.locator('tr', { hasText: DEAL_TITLE });
    const approveBtn = dealRow.getByRole('button', { name: /Approve|✓/i });
    
    await approveBtn.click();
    
    // Wait for it to disappear from Pending
    await expect(dealRow).toBeHidden();
    
    console.log(`✅ Deal Approved: "${DEAL_TITLE}"`);
  });

  // -----------------------------------------------------------------------
  // 3. STUDENT: Redeem the Deal
  // -----------------------------------------------------------------------
  test('Step 3: Student redeems the deal', async ({ context, page }) => {
    // 🌍 MOCK GEOLOCATION (Crucial for SwipeRedeem)
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(TEST_LOCATION);

    await page.goto(`${BASE_URL}/student/login`);

    // Login
    await page.getByPlaceholder('student@university.edu').fill(STUDENT.email);
    await page.getByPlaceholder('••••••••').fill(STUDENT.pass);
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/.*\/student\/home/);

    // Find the Deal (It might be in "Trending" or we assume it's at the top)
    // We search for the specific title we created
    await page.reload(); // Refresh to ensure new data is fetched
    await page.getByText(DEAL_TITLE).first().click();

    // Now on Deal Details Page
    // Wait for Swipe Component to initialize and get Location
    await expect(page.getByText('Swipe to Redeem')).toBeVisible({ timeout: 10000 });

    // 👆 PERFORM THE SWIPE ACTION
    const slider = page.locator('input[type="range"]'); // The invisible slider overlay
    const sliderBox = await slider.boundingBox();

    if (sliderBox) {
        // Simulating drag from 0% to 100%
        await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(sliderBox.x + sliderBox.width - 5, sliderBox.y + sliderBox.height / 2, { steps: 10 });
        await page.mouse.up();
    }

    // Verify Success State
    await expect(page.getByText('DEAL REDEEMED')).toBeVisible();
    await expect(page.getByText('Show this screen')).toBeVisible();

    console.log(`✅ Deal Redeemed Successfully!`);
  });

});