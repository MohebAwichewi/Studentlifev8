# Testing & QA Implementation - README

## Overview

This document provides instructions for running the comprehensive test suite implemented for the Student Life dashboard as part of Phase 5: Testing & Quality Assurance.

## Test Suites Created

### 1. **Student Authentication Tests** (`tests/student-auth.spec.ts`)
- Student signup with all required fields
- ID card upload functionality
- Email validation
- Password mismatch detection
- Login with valid/invalid credentials
- Session persistence
- Logout functionality
- Password reset flow
- OTP verification
- Auto-redirect for authenticated users

### 2. **Deal Discovery Tests** (`tests/deal-discovery.spec.ts`)
- Home feed loading with active deals
- Category filtering
- Search functionality
- Geolocation-based sorting
- Deal detail page navigation
- Save/unsave deals
- Deal expiry display
- Urgent deal highlighting
- Image loading verification
- Empty state handling
- View count tracking
- Back navigation
- Deal sharing

### 3. **Redemption System Tests** (`tests/redemption.spec.ts`)
- Swipe-to-redeem for single-use deals
- Multi-use deal cooldown timer
- QR code generation
- Location verification
- Redemption history tracking
- Duplicate redemption prevention
- Voucher code display
- Partial swipe rejection
- Success message display
- Network error handling
- Timestamp recording
- Business information display

### 4. **API Tests** (`tests/api.spec.ts`)
- Authentication endpoints (student, business, admin)
- Deal endpoints (list, details, redeem)
- Admin statistics API
- SQL injection prevention
- XSS prevention
- Rate limiting
- CORS headers
- Performance benchmarks
- Error handling
- Malformed JSON handling

### 5. **Full Lifecycle Test** (`tests/full-lifecycle.spec.ts`)
- Complete user journey: Business creates deal → Admin approves → Student redeems

## Running Tests

### Prerequisites

```bash
# Ensure Playwright is installed
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests with browser visible
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Debug tests
npm run test:debug

# Run specific test suites
npm run test:auth          # Authentication tests only
npm run test:deals         # Deal discovery tests only
npm run test:redemption    # Redemption tests only
npm run test:api           # API tests only
npm run test:full          # Full lifecycle test

# View test report
npm run test:report
```

### Running Tests on Different Browsers

```bash
# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run on all browsers
npx playwright test --project=chromium --project=firefox --project=webkit
```

## Test Configuration

Tests are configured in `playwright.config.ts`:

- **Test Directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel Execution**: Enabled
- **Retries**: 2 on CI, 0 locally
- **Reporter**: HTML report

## Environment Setup

### Local Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Update test URLs** in test files if needed:
   ```typescript
   const BASE_URL = 'http://localhost:3000';
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

### Production Testing

1. Update `BASE_URL` in test files to production URL:
   ```typescript
   const BASE_URL = 'https://student-life.uk';
   ```

2. Run tests against production:
   ```bash
   npm test
   ```

## Test Data Requirements

### Database Setup

Ensure your test database has:

1. **Test Student Account**:
   - Email: `mohebawichewi9@wow.edu`
   - Password: `123456`

2. **Test Business Account**:
   - Email: `mohebawichewi9@gmail.com`
   - Password: `xnxxxnxx11`

3. **Admin Account**:
   - Email: `admin@student-life.uk`
   - Password: `admin123`

4. **Active Deals**: At least a few active deals in the database

### Geolocation

Tests use Tunis Center coordinates:
- Latitude: `36.8065`
- Longitude: `10.1815`

## Continuous Integration

### GitHub Actions Setup

Create `.github/workflows/test.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

The report includes:
- Test results (pass/fail)
- Screenshots on failure
- Video recordings
- Execution time
- Error traces

## Debugging Failed Tests

### 1. Run in Headed Mode
```bash
npm run test:headed
```

### 2. Use Debug Mode
```bash
npm run test:debug
```

### 3. Check Screenshots
Failed tests automatically capture screenshots in `test-results/`

### 4. View Trace
```bash
npx playwright show-trace trace.zip
```

## Best Practices

1. **Keep tests independent**: Each test should be able to run standalone
2. **Use data-testid attributes**: Add `data-testid` to critical UI elements
3. **Avoid hard-coded waits**: Use `waitForLoadState`, `waitForSelector` instead of `waitForTimeout`
4. **Clean up test data**: Remove test accounts/deals created during tests
5. **Mock external services**: Use Playwright's request interception for third-party APIs

## Known Issues & Limitations

1. **OTP Verification**: Tests can't verify real OTP codes without email access
2. **File Uploads**: Uses mock file data, not real images
3. **Payment Processing**: Stripe integration not tested (removed in WIN migration)
4. **Push Notifications**: Mobile push notifications require physical devices

## Next Steps

1. **Expand Coverage**: Add more edge cases and error scenarios
2. **Performance Tests**: Implement load testing with k6 or Artillery
3. **Accessibility Tests**: Add axe-core for automated a11y testing
4. **Visual Regression**: Implement screenshot comparison tests
5. **Mobile App Tests**: Set up Detox or Appium for React Native testing

## Support

For issues or questions:
- Check test output and error messages
- Review Playwright documentation: https://playwright.dev
- Check test implementation in `tests/` directory

## Summary

This comprehensive test suite ensures:
- ✅ All critical user flows are tested
- ✅ API endpoints are validated
- ✅ Security vulnerabilities are checked
- ✅ Performance benchmarks are met
- ✅ Cross-browser compatibility is verified

Run tests regularly during development and before each deployment to maintain code quality and catch regressions early.
