# SBI WFH Portal — Playwright Test Suite

## Setup (one-time)

```bash
# 1. Install Node if not already installed (https://nodejs.org)

# 2. Install Playwright + Chromium
npm init -y
npm install --save-dev @playwright/test
npx playwright install chromium

# 3. Copy both files into your project folder:
#    sbi.spec.js
#    playwright.config.js
```

## Run all tests

```bash
npx playwright test sbi.spec.js --reporter=html
```

Opens an HTML report at `report/index.html` when done.

## Run a single suite

```bash
npx playwright test sbi.spec.js --grep "2. Authentication"
```

## Run headful (see the browser)

```bash
npx playwright test sbi.spec.js --headed --slow-mo=500
```

## Before running Suite 3 & 4

Suite 3 (Admin — create salesperson) and Suite 4 (Salesperson flow) need
a real salesperson account. Either:

- Let Suite 3.3 auto-create one, then update `SALES_EXISTING` in Suite 4
- Or manually create a salesperson via the admin UI and put their
  credentials in the `SALES_EXISTING` object at the top of Suite 4 tests.

## Screenshots

Saved to `sbi-tests/screenshots/` on key steps:
- `admin_dashboard.png`
- `user_management.png`
- `create_user_form.png`
- `after_create_user.png`
- `users_list.png`
- `sales_dashboard.png`
- `sales_work.png`
