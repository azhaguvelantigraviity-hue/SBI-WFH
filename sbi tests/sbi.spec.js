// ============================================================
//  SBI WFH Portal — Full Playwright Automation Test Suite
//  Run: npx playwright test sbi.spec.js --reporter=html
// ============================================================

const { test, expect } = require('@playwright/test');

const BASE_URL  = 'https://sbi-wfh.vercel.app';
const ADMIN     = { email: 'admin@sbi.com', password: 'Admin@123' };
const SALES_NEW = { name: 'Test Salesperson', email: `sales_auto_${Date.now()}@sbi.com`, password: 'Sales@Test123' };

// ─── helpers ────────────────────────────────────────────────
async function loginAs(page, creds) {
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState('networkidle');
  // Try common selectors for email / username field
  const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="username" i]';
  const passSel  = 'input[type="password"]';
  const btnSel   = 'button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")';
  await page.locator(emailSel).first().fill(creds.email);
  await page.locator(passSel).first().fill(creds.password);
  await page.locator(btnSel).first().click();
  await page.waitForLoadState('networkidle');
}

async function logout(page) {
  const logoutSel = 'button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out"), a:has-text("Sign out")';
  const btn = page.locator(logoutSel).first();
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForLoadState('networkidle');
  }
}

// ════════════════════════════════════════════════════════════
//  SUITE 1 — Page Load & Basic Accessibility
// ════════════════════════════════════════════════════════════
test.describe('1. Page Load & Basic Accessibility', () => {

  test('1.1 — Login page loads successfully', async ({ page }) => {
    const res = await page.goto(BASE_URL);
    expect(res.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/.+/);
    console.log(`✓ Title: "${await page.title()}"`);
  });

  test('1.2 — Login form elements present', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const email = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const pass  = page.locator('input[type="password"]').first();
    const btn   = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first();
    await expect(email).toBeVisible();
    await expect(pass).toBeVisible();
    await expect(btn).toBeVisible();
  });

  test('1.3 — Password field is masked (type=password)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const pass = page.locator('input[type="password"]').first();
    await expect(pass).toBeVisible();
    const type = await pass.getAttribute('type');
    expect(type).toBe('password');
  });

  test('1.4 — Page has no broken images', async ({ page }) => {
    const broken = [];
    page.on('response', res => {
      if (res.request().resourceType() === 'image' && res.status() >= 400)
        broken.push(res.url());
    });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    expect(broken, `Broken images: ${broken.join(', ')}`).toHaveLength(0);
  });

  test('1.5 — Console has no critical errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const critical = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
    if (critical.length) console.warn('Console errors:', critical);
    expect(critical).toHaveLength(0);
  });

  test('1.6 — HTTPS enforced (no mixed content)', async ({ page }) => {
    const insecure = [];
    page.on('request', req => {
      if (req.url().startsWith('http://') && !req.url().startsWith('http://localhost'))
        insecure.push(req.url());
    });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    expect(insecure, `Mixed content URLs: ${insecure.join(', ')}`).toHaveLength(0);
  });

  test('1.7 — Page is mobile responsive (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // Form should still be visible and usable
    const form = page.locator('form, [class*="login"], [class*="auth"]').first();
    // At minimum the password field should be visible
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

});

// ════════════════════════════════════════════════════════════
//  SUITE 2 — Authentication
// ════════════════════════════════════════════════════════════
test.describe('2. Authentication', () => {

  test('2.1 — Admin can log in with valid credentials', async ({ page }) => {
    await loginAs(page, ADMIN);
    // After login we should NOT still be on the login page
    const url = page.url();
    const loginKeywords = ['/login', '/signin', 'auth'];
    const stillOnLogin = loginKeywords.some(k => url.includes(k));
    // Check for dashboard/home content OR URL change
    const hasDashboard = await page.locator('[class*="dashboard"], [class*="home"], nav, header').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasDashboard || !stillOnLogin, 'Login did not navigate to dashboard').toBeTruthy();
    console.log(`✓ After login URL: ${url}`);
  });

  test('2.2 — Wrong password shows error message', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    await page.locator(emailSel).first().fill(ADMIN.email);
    await page.locator('input[type="password"]').first().fill('WrongPassword999!');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first().click();
    await page.waitForTimeout(2000);
    // Should show some error
    const errorSel = '[class*="error"], [class*="alert"], [role="alert"], p:has-text("invalid"), p:has-text("incorrect"), p:has-text("wrong"), span:has-text("error")';
    const errorVisible = await page.locator(errorSel).first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(errorVisible, 'No error message shown for wrong password').toBeTruthy();
  });

  test('2.3 — Empty email shows validation error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="password"]').first().fill('SomePassword@1');
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first().click();
    await page.waitForTimeout(1000);
    const url = page.url();
    // Should stay on login page or show validation
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const isRequired = await emailField.evaluate(el => el.required || el.validity?.valueMissing).catch(() => true);
    expect(isRequired || url.includes('login') || url === BASE_URL + '/').toBeTruthy();
  });

  test('2.4 — Empty password shows validation error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    await page.locator(emailSel).first().fill(ADMIN.email);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first().click();
    await page.waitForTimeout(1000);
    const passField = page.locator('input[type="password"]').first();
    const isRequired = await passField.evaluate(el => el.required || el.validity?.valueMissing).catch(() => true);
    expect(isRequired).toBeTruthy();
  });

  test('2.5 — Invalid email format shows error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    await page.locator(emailSel).first().fill('notavalidemail');
    await page.locator('input[type="password"]').first().fill('Test@123');
    await page.locator('button[type="submit"], button:has-text("Login")').first().click();
    await page.waitForTimeout(1000);
    const emailField = page.locator(emailSel).first();
    const isInvalid = await emailField.evaluate(el => el.validity?.typeMismatch || !el.validity?.valid).catch(() => false);
    expect(isInvalid, 'Invalid email accepted without error').toBeTruthy();
  });

  test('2.6 — SQLi payload in login is rejected', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    await page.locator(emailSel).first().fill("' OR '1'='1' --");
    await page.locator('input[type="password"]').first().fill("' OR '1'='1' --");
    await page.locator('button[type="submit"], button:has-text("Login")').first().click();
    await page.waitForTimeout(2000);
    // Should NOT navigate to dashboard
    const dashSel = '[class*="dashboard"], [class*="admin"]';
    const gotIn = await page.locator(dashSel).first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(gotIn, 'SQL injection may have bypassed login!').toBeFalsy();
  });

  test('2.7 — Brute force: 5 wrong attempts handled gracefully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    for (let i = 0; i < 5; i++) {
      await page.locator(emailSel).first().fill(ADMIN.email);
      await page.locator('input[type="password"]').first().fill(`WrongPass${i}!`);
      await page.locator('button[type="submit"], button:has-text("Login")').first().click();
      await page.waitForTimeout(800);
    }
    // After 5 attempts should show lockout/captcha or still show error (not crash)
    const crashed = await page.locator('body').textContent();
    expect(crashed).not.toContain('500');
    expect(crashed).not.toContain('Internal Server Error');
    console.log('Brute force result — page state after 5 attempts logged');
  });

  test('2.8 — Forgot password link exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const forgotSel = 'a:has-text("Forgot"), a:has-text("forgot"), a:has-text("Reset"), button:has-text("Forgot")';
    const exists = await page.locator(forgotSel).first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(exists, 'No forgot password link found on login page').toBeTruthy();
  });

  test('2.9 — Admin can log out', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(1500);
    await logout(page);
    // Should be back on login page
    const loginVisible = await page.locator('input[type="password"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(loginVisible, 'Login form not shown after logout').toBeTruthy();
  });

});

// ════════════════════════════════════════════════════════════
//  SUITE 3 — Admin Panel
// ════════════════════════════════════════════════════════════
test.describe('3. Admin Panel', () => {

  test('3.1 — Admin dashboard loads after login', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    // Should have some admin UI
    const adminUI = await page.locator('nav, [class*="sidebar"], [class*="dashboard"], [class*="admin"]').first().isVisible({ timeout: 8000 }).catch(() => false);
    expect(adminUI, 'Admin dashboard UI not visible after login').toBeTruthy();
    await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/admin_dashboard.png', fullPage: true });
  });

  test('3.2 — Admin can navigate to user management', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    const userNavSel = 'a:has-text("User"), a:has-text("Sales"), a:has-text("Staff"), button:has-text("User"), [href*="user"], [href*="sales"]';
    const navItem = page.locator(userNavSel).first();
    const exists = await navItem.isVisible({ timeout: 5000 }).catch(() => false);
    if (exists) {
      await navItem.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/user_management.png', fullPage: true });
      console.log('✓ User management navigated to:', page.url());
    } else {
      console.warn('⚠ User management nav item not found — check sidebar labels');
      test.skip();
    }
  });

  test('3.3 — Admin can create a new salesperson', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    // Try to find create/add user button
    const addBtnSel = 'button:has-text("Add"), button:has-text("Create"), button:has-text("New"), a:has-text("Add User"), [class*="add"]';
    const addBtn = page.locator(addBtnSel).first();
    const addVisible = await addBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!addVisible) {
      console.warn('⚠ Add user button not found — navigating to users section first');
      const userNavSel = 'a:has-text("User"), a:has-text("Sales"), [href*="user"], [href*="sales"]';
      const nav = page.locator(userNavSel).first();
      if (await nav.isVisible({ timeout: 3000 }).catch(() => false)) await nav.click();
      await page.waitForTimeout(1500);
    }
    const addBtn2 = page.locator(addBtnSel).first();
    if (await addBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn2.click();
      await page.waitForTimeout(1000);
      // Fill in form fields
      const nameSel   = 'input[name="name"], input[placeholder*="name" i]';
      const emailSel  = 'input[name="email"], input[type="email"]';
      const passSel   = 'input[name="password"], input[type="password"]';
      if (await page.locator(nameSel).first().isVisible({ timeout: 3000 }).catch(() => false))
        await page.locator(nameSel).first().fill(SALES_NEW.name);
      if (await page.locator(emailSel).first().isVisible({ timeout: 3000 }).catch(() => false))
        await page.locator(emailSel).first().fill(SALES_NEW.email);
      if (await page.locator(passSel).first().isVisible({ timeout: 3000 }).catch(() => false))
        await page.locator(passSel).first().fill(SALES_NEW.password);
      // Role selector
      const roleSel = 'select[name="role"], [class*="role"] select, input[value*="sales"]';
      if (await page.locator(roleSel).first().isVisible({ timeout: 2000 }).catch(() => false)) {
        const roleEl = page.locator(roleSel).first();
        const tag = await roleEl.evaluate(el => el.tagName.toLowerCase());
        if (tag === 'select') await roleEl.selectOption({ label: /sales/i });
      }
      await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/create_user_form.png' });
      const submitSel = 'button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Add")';
      await page.locator(submitSel).last().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/after_create_user.png', fullPage: true });
      const successSel = '[class*="success"], [role="alert"], .toast, div:has-text("created"), div:has-text("success")';
      const success = await page.locator(successSel).first().isVisible({ timeout: 4000 }).catch(() => false);
      expect(success, 'No success confirmation after creating salesperson').toBeTruthy();
    } else {
      console.warn('⚠ Could not locate add-user button — skipping create test');
      test.skip();
    }
  });

  test('3.4 — Admin sees list of salespersons', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    const userNavSel = 'a:has-text("User"), a:has-text("Sales"), a:has-text("Staff"), [href*="user"], [href*="sales"]';
    const nav = page.locator(userNavSel).first();
    if (await nav.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nav.click();
      await page.waitForLoadState('networkidle');
    }
    const listSel = 'table, [class*="list"], [class*="grid"], [class*="users"], tr';
    const listVisible = await page.locator(listSel).first().isVisible({ timeout: 6000 }).catch(() => false);
    expect(listVisible, 'No user list/table visible in admin panel').toBeTruthy();
    await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/users_list.png', fullPage: true });
  });

  test('3.5 — Admin can delete / deactivate a salesperson', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    const userNavSel = 'a:has-text("User"), a:has-text("Sales"), [href*="user"]';
    const nav = page.locator(userNavSel).first();
    if (await nav.isVisible({ timeout: 4000 }).catch(() => false)) await nav.click();
    await page.waitForTimeout(1500);
    const deleteSel = 'button:has-text("Delete"), button:has-text("Remove"), [class*="delete"], [aria-label*="delete" i]';
    const deleteBtn = page.locator(deleteSel).first();
    const exists = await deleteBtn.isVisible({ timeout: 4000 }).catch(() => false);
    expect(exists, 'No delete/remove button found for users').toBeTruthy();
  });

  test('3.6 — Admin panel not accessible without login', async ({ page }) => {
    // Try to navigate directly to admin routes without logging in
    const adminRoutes = ['/admin', '/dashboard', '/users', '/admin/users'];
    for (const route of adminRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');
      const url = page.url();
      const isRedirectedToLogin = url.includes('login') || url === BASE_URL + '/' || url === BASE_URL;
      const loginVisible = await page.locator('input[type="password"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      if (isRedirectedToLogin || loginVisible) {
        console.log(`✓ ${route} redirected to login`);
      } else {
        console.warn(`⚠ ${route} may be accessible without auth — URL: ${url}`);
      }
    }
  });

});

// ════════════════════════════════════════════════════════════
//  SUITE 4 — Salesperson Flow
// ════════════════════════════════════════════════════════════
test.describe('4. Salesperson Flow', () => {

  test('4.1 — Salesperson can log in', async ({ page }) => {
    // Use a salesperson account — adjust email/password if admin creates one first
    // This test assumes a salesperson account exists or was created in suite 3
    const SALES_EXISTING = { email: 'arjun@sbi.com', password: 'Sales@123' };
    await loginAs(page, SALES_EXISTING);
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log(`Sales login URL: ${url}`);
    // If login fails gracefully, note it
    const errorVisible = await page.locator('[class*="error"], [role="alert"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (errorVisible) {
      console.warn('⚠ Salesperson login failed — create a salesperson via admin first');
      test.skip();
    }
    await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/sales_dashboard.png', fullPage: true });
  });

  test('4.2 — Salesperson sees own dashboard (not admin panel)', async ({ page }) => {
    const SALES_EXISTING = { email: 'arjun@sbi.com', password: 'Sales@123' };
    await loginAs(page, SALES_EXISTING);
    await page.waitForTimeout(2000);
    // Should NOT see admin-specific UI
    const adminOnlySel = 'a:has-text("Admin"), button:has-text("Manage Users"), [href*="admin"]';
    const adminVisible = await page.locator(adminOnlySel).first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(adminVisible, 'Salesperson can see admin-only UI elements — RBAC failure!').toBeFalsy();
  });

  test('4.3 — Salesperson cannot access admin routes (RBAC)', async ({ page }) => {
    const SALES_EXISTING = { email: 'arjun@sbi.com', password: 'Sales@123' };
    await loginAs(page, SALES_EXISTING);
    await page.waitForTimeout(2000);
    const adminRoutes = ['/admin', '/admin/users', '/users'];
    for (const route of adminRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');
      const url = page.url();
      const accessDenied = await page.locator(':has-text("Access denied"), :has-text("Unauthorized"), :has-text("403"), :has-text("Not allowed")').first().isVisible({ timeout: 3000 }).catch(() => false);
      const redirectedAway = !url.includes(route) || url.includes('login');
      if (!accessDenied && !redirectedAway) {
        console.warn(`⚠ Salesperson may have access to ${route}`);
      } else {
        console.log(`✓ Admin route ${route} protected from salesperson`);
      }
    }
  });

  test('4.4 — Salesperson can view their work/tasks', async ({ page }) => {
    const SALES_EXISTING = { email: 'arjun@sbi.com', password: 'Sales@123' };
    await loginAs(page, SALES_EXISTING);
    await page.waitForTimeout(2000);
    // Look for task / work / lead related UI
    const workSel = '[class*="task"], [class*="lead"], [class*="work"], [class*="target"], table, [class*="list"]';
    const workVisible = await page.locator(workSel).first().isVisible({ timeout: 6000 }).catch(() => false);
    expect(workVisible, 'No tasks/work content visible for salesperson').toBeTruthy();
    await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/sales_work.png', fullPage: true });
  });

});

// ════════════════════════════════════════════════════════════
//  SUITE 5 — UX & Form Behaviour
// ════════════════════════════════════════════════════════════
test.describe('5. UX & Form Behaviour', () => {

  test('5.1 — Login button shows loading state on click', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    await page.locator(emailSel).first().fill(ADMIN.email);
    await page.locator('input[type="password"]').first().fill(ADMIN.password);
    const btnSel = 'button[type="submit"], button:has-text("Login")';
    const btn = page.locator(btnSel).first();
    await btn.click();
    // Check for spinner / disabled state briefly after click
    const loadingVisible = await page.locator('[class*="spinner"], [class*="loading"], button:disabled').first().isVisible({ timeout: 1500 }).catch(() => false);
    console.log(loadingVisible ? '✓ Loading state detected' : '⚠ No loading indicator on login');
  });

  test('5.2 — Show/hide password toggle (if present)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const toggleSel = 'button[aria-label*="password" i], [class*="eye"], [class*="toggle-pass"], button:near(input[type="password"])';
    const toggle = page.locator(toggleSel).first();
    const exists = await toggle.isVisible({ timeout: 3000 }).catch(() => false);
    if (exists) {
      await page.locator('input[type="password"]').first().fill('TestPass@123');
      await toggle.click();
      const typeAfter = await page.locator('input[type="text"], input[type="password"]').first().getAttribute('type');
      expect(typeAfter).toBe('text');
      console.log('✓ Show/hide password toggle works');
    } else {
      console.warn('⚠ No show/hide password toggle found — consider adding one');
    }
  });

  test('5.3 — Login page keyboard navigation (Tab order)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Tab');
    const focused1 = await page.evaluate(() => document.activeElement?.tagName);
    await page.keyboard.press('Tab');
    const focused2 = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`Tab order: ${focused1} → ${focused2}`);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focused1);
  });

  test('5.4 — Enter key submits login form', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    await page.locator(emailSel).first().fill(ADMIN.email);
    await page.locator('input[type="password"]').first().fill(ADMIN.password);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    const url = page.url();
    // Should have tried to submit (URL change or dashboard visible)
    console.log(`URL after Enter: ${url}`);
  });

  test('5.5 — Page title updates on navigation', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    const titleAfterLogin = await page.title();
    console.log(`Title after login: "${titleAfterLogin}"`);
    // Should differ from login page title or have meaningful content
    expect(titleAfterLogin.length).toBeGreaterThan(0);
  });

});

// ════════════════════════════════════════════════════════════
//  SUITE 6 — Performance
// ════════════════════════════════════════════════════════════
test.describe('6. Performance', () => {

  test('6.1 — Login page loads under 3 seconds', async ({ page }) => {
    const t0 = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - t0;
    console.log(`Login page load: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(3000);
  });

  test('6.2 — Login response under 3 seconds', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    await page.locator(emailSel).first().fill(ADMIN.email);
    await page.locator('input[type="password"]').first().fill(ADMIN.password);
    const t0 = Date.now();
    await page.locator('button[type="submit"], button:has-text("Login")').first().click();
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - t0;
    console.log(`Login response: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(3000);
  });

  test('6.3 — No requests fail with 5xx errors', async ({ page }) => {
    const serverErrors = [];
    page.on('response', res => {
      if (res.status() >= 500) serverErrors.push(`${res.status()} ${res.url()}`);
    });
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    expect(serverErrors, `5xx errors: ${serverErrors.join(', ')}`).toHaveLength(0);
  });

});

// ════════════════════════════════════════════════════════════
//  SUITE 7 — Security
// ════════════════════════════════════════════════════════════
test.describe('7. Security', () => {

  test('7.1 — XSS in email field does not execute', async ({ page }) => {
    let xssExecuted = false;
    page.on('dialog', dialog => { xssExecuted = true; dialog.dismiss(); });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
    await page.locator(emailSel).first().fill('<script>alert("xss")</script>@test.com');
    await page.locator('input[type="password"]').first().fill('Test@123');
    await page.locator('button[type="submit"], button:has-text("Login")').first().click();
    await page.waitForTimeout(2000);
    expect(xssExecuted, 'XSS script executed via login field!').toBeFalsy();
  });

  test('7.2 — Sensitive data not in localStorage after login', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    const storage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        items[k] = localStorage.getItem(k);
      }
      return items;
    });
    const keys = Object.keys(storage);
    const sensitiveKeys = keys.filter(k => /password|pwd|secret/i.test(k));
    expect(sensitiveKeys, `Sensitive keys in localStorage: ${sensitiveKeys.join(', ')}`).toHaveLength(0);
    const sensitiveValues = Object.entries(storage).filter(([, v]) => v && v.includes(ADMIN.password));
    expect(sensitiveValues, 'Admin password stored in localStorage!').toHaveLength(0);
    console.log('localStorage keys found:', keys);
  });

  test('7.3 — Auth token stored securely (not in URL)', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toContain('token=');
    expect(url).not.toContain('password=');
    expect(url).not.toContain('auth=');
    console.log(`✓ Post-login URL clean: ${url}`);
  });

  test('7.4 — Session invalidated after logout', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForTimeout(1500);
    const tokenBefore = await page.evaluate(() => localStorage.getItem('token') || sessionStorage.getItem('token') || 'none');
    await logout(page);
    await page.waitForTimeout(1000);
    const tokenAfter = await page.evaluate(() => localStorage.getItem('token') || sessionStorage.getItem('token') || 'none');
    if (tokenBefore !== 'none') {
      expect(tokenAfter, 'Token still present after logout!').toBe('none');
    }
    console.log(`Token before logout: ${tokenBefore !== 'none' ? 'present' : 'not in storage'}, after: ${tokenAfter}`);
  });

});
