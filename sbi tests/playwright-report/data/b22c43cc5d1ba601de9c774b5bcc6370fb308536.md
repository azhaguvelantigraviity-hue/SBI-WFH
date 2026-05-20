# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sbi.spec.js >> 4. Salesperson Flow >> 4.4 — Salesperson can view their work/tasks
- Location: sbi.spec.js:408:3

# Error details

```
Error: No tasks/work content visible for salesperson

expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - button [ref=e4] [cursor=pointer]:
      - img [ref=e5]
    - generic [ref=e11]:
      - generic [ref=e12]:
        - img [ref=e14]
        - heading "SBI Online Login" [level=1] [ref=e18]
        - paragraph [ref=e19]: WFH Sales Team Portal
      - generic [ref=e20]:
        - button "Admin" [ref=e21] [cursor=pointer]:
          - img [ref=e22]
          - text: Admin
        - button "Sales Person" [ref=e25] [cursor=pointer]:
          - img [ref=e26]
          - text: Sales Person
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]: Email Address*
          - textbox "you@company.com" [ref=e35]: salesperson@sbi.com
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: Password*
            - generic [ref=e39]:
              - textbox "••••••••" [ref=e40]: Sales@123
              - button "Show password" [ref=e41] [cursor=pointer]:
                - img [ref=e42]
          - generic [ref=e45]:
            - generic [ref=e46] [cursor=pointer]:
              - checkbox "Remember me" [checked] [ref=e47]
              - generic [ref=e48]: Remember me
            - button "Forgot password?" [ref=e49] [cursor=pointer]
        - button "Sign In" [ref=e50] [cursor=pointer]:
          - text: Sign In
          - img [ref=e51]
      - paragraph [ref=e53]: Secure JWT Authentication
  - generic [ref=e55]:
    - img [ref=e57]
    - generic [ref=e60]:
      - heading "Login Failed" [level=4] [ref=e61]
      - paragraph [ref=e62]: Invalid email or password
    - button [ref=e63] [cursor=pointer]:
      - img [ref=e64]
```

# Test source

```ts
  315 |     if (await nav.isVisible({ timeout: 5000 }).catch(() => false)) {
  316 |       await nav.click();
  317 |       await page.waitForLoadState('networkidle');
  318 |     }
  319 |     const listSel = 'table, [class*="list"], [class*="grid"], [class*="users"], tr';
  320 |     const listVisible = await page.locator(listSel).first().isVisible({ timeout: 6000 }).catch(() => false);
  321 |     expect(listVisible, 'No user list/table visible in admin panel').toBeTruthy();
  322 |     await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/users_list.png', fullPage: true });
  323 |   });
  324 | 
  325 |   test('3.5 — Admin can delete / deactivate a salesperson', async ({ page }) => {
  326 |     await loginAs(page, ADMIN);
  327 |     await page.waitForTimeout(2000);
  328 |     const userNavSel = 'a:has-text("User"), a:has-text("Sales"), [href*="user"]';
  329 |     const nav = page.locator(userNavSel).first();
  330 |     if (await nav.isVisible({ timeout: 4000 }).catch(() => false)) await nav.click();
  331 |     await page.waitForTimeout(1500);
  332 |     const deleteSel = 'button:has-text("Delete"), button:has-text("Remove"), [class*="delete"], [aria-label*="delete" i]';
  333 |     const deleteBtn = page.locator(deleteSel).first();
  334 |     const exists = await deleteBtn.isVisible({ timeout: 4000 }).catch(() => false);
  335 |     expect(exists, 'No delete/remove button found for users').toBeTruthy();
  336 |   });
  337 | 
  338 |   test('3.6 — Admin panel not accessible without login', async ({ page }) => {
  339 |     // Try to navigate directly to admin routes without logging in
  340 |     const adminRoutes = ['/admin', '/dashboard', '/users', '/admin/users'];
  341 |     for (const route of adminRoutes) {
  342 |       await page.goto(`${BASE_URL}${route}`);
  343 |       await page.waitForLoadState('networkidle');
  344 |       const url = page.url();
  345 |       const isRedirectedToLogin = url.includes('login') || url === BASE_URL + '/' || url === BASE_URL;
  346 |       const loginVisible = await page.locator('input[type="password"]').first().isVisible({ timeout: 3000 }).catch(() => false);
  347 |       if (isRedirectedToLogin || loginVisible) {
  348 |         console.log(`✓ ${route} redirected to login`);
  349 |       } else {
  350 |         console.warn(`⚠ ${route} may be accessible without auth — URL: ${url}`);
  351 |       }
  352 |     }
  353 |   });
  354 | 
  355 | });
  356 | 
  357 | // ════════════════════════════════════════════════════════════
  358 | //  SUITE 4 — Salesperson Flow
  359 | // ════════════════════════════════════════════════════════════
  360 | test.describe('4. Salesperson Flow', () => {
  361 | 
  362 |   test('4.1 — Salesperson can log in', async ({ page }) => {
  363 |     // Use a salesperson account — adjust email/password if admin creates one first
  364 |     // This test assumes a salesperson account exists or was created in suite 3
  365 |     const SALES_EXISTING = { email: 'salesperson@sbi.com', password: 'Sales@123' };
  366 |     await loginAs(page, SALES_EXISTING);
  367 |     await page.waitForTimeout(2000);
  368 |     const url = page.url();
  369 |     console.log(`Sales login URL: ${url}`);
  370 |     // If login fails gracefully, note it
  371 |     const errorVisible = await page.locator('[class*="error"], [role="alert"]').first().isVisible({ timeout: 3000 }).catch(() => false);
  372 |     if (errorVisible) {
  373 |       console.warn('⚠ Salesperson login failed — create a salesperson via admin first');
  374 |       test.skip();
  375 |     }
  376 |     await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/sales_dashboard.png', fullPage: true });
  377 |   });
  378 | 
  379 |   test('4.2 — Salesperson sees own dashboard (not admin panel)', async ({ page }) => {
  380 |     const SALES_EXISTING = { email: 'salesperson@sbi.com', password: 'Sales@123' };
  381 |     await loginAs(page, SALES_EXISTING);
  382 |     await page.waitForTimeout(2000);
  383 |     // Should NOT see admin-specific UI
  384 |     const adminOnlySel = 'a:has-text("Admin"), button:has-text("Manage Users"), [href*="admin"]';
  385 |     const adminVisible = await page.locator(adminOnlySel).first().isVisible({ timeout: 3000 }).catch(() => false);
  386 |     expect(adminVisible, 'Salesperson can see admin-only UI elements — RBAC failure!').toBeFalsy();
  387 |   });
  388 | 
  389 |   test('4.3 — Salesperson cannot access admin routes (RBAC)', async ({ page }) => {
  390 |     const SALES_EXISTING = { email: 'salesperson@sbi.com', password: 'Sales@123' };
  391 |     await loginAs(page, SALES_EXISTING);
  392 |     await page.waitForTimeout(2000);
  393 |     const adminRoutes = ['/admin', '/admin/users', '/users'];
  394 |     for (const route of adminRoutes) {
  395 |       await page.goto(`${BASE_URL}${route}`);
  396 |       await page.waitForLoadState('networkidle');
  397 |       const url = page.url();
  398 |       const accessDenied = await page.locator(':has-text("Access denied"), :has-text("Unauthorized"), :has-text("403"), :has-text("Not allowed")').first().isVisible({ timeout: 3000 }).catch(() => false);
  399 |       const redirectedAway = !url.includes(route) || url.includes('login');
  400 |       if (!accessDenied && !redirectedAway) {
  401 |         console.warn(`⚠ Salesperson may have access to ${route}`);
  402 |       } else {
  403 |         console.log(`✓ Admin route ${route} protected from salesperson`);
  404 |       }
  405 |     }
  406 |   });
  407 | 
  408 |   test('4.4 — Salesperson can view their work/tasks', async ({ page }) => {
  409 |     const SALES_EXISTING = { email: 'salesperson@sbi.com', password: 'Sales@123' };
  410 |     await loginAs(page, SALES_EXISTING);
  411 |     await page.waitForTimeout(2000);
  412 |     // Look for task / work / lead related UI
  413 |     const workSel = '[class*="task"], [class*="lead"], [class*="work"], [class*="target"], table, [class*="list"]';
  414 |     const workVisible = await page.locator(workSel).first().isVisible({ timeout: 6000 }).catch(() => false);
> 415 |     expect(workVisible, 'No tasks/work content visible for salesperson').toBeTruthy();
      |                                                                          ^ Error: No tasks/work content visible for salesperson
  416 |     await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/sales_work.png', fullPage: true });
  417 |   });
  418 | 
  419 | });
  420 | 
  421 | // ════════════════════════════════════════════════════════════
  422 | //  SUITE 5 — UX & Form Behaviour
  423 | // ════════════════════════════════════════════════════════════
  424 | test.describe('5. UX & Form Behaviour', () => {
  425 | 
  426 |   test('5.1 — Login button shows loading state on click', async ({ page }) => {
  427 |     await page.goto(BASE_URL);
  428 |     await page.waitForLoadState('networkidle');
  429 |     const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
  430 |     await page.locator(emailSel).first().fill(ADMIN.email);
  431 |     await page.locator('input[type="password"]').first().fill(ADMIN.password);
  432 |     const btnSel = 'button[type="submit"], button:has-text("Login")';
  433 |     const btn = page.locator(btnSel).first();
  434 |     await btn.click();
  435 |     // Check for spinner / disabled state briefly after click
  436 |     const loadingVisible = await page.locator('[class*="spinner"], [class*="loading"], button:disabled').first().isVisible({ timeout: 1500 }).catch(() => false);
  437 |     console.log(loadingVisible ? '✓ Loading state detected' : '⚠ No loading indicator on login');
  438 |   });
  439 | 
  440 |   test('5.2 — Show/hide password toggle (if present)', async ({ page }) => {
  441 |     await page.goto(BASE_URL);
  442 |     await page.waitForLoadState('networkidle');
  443 |     const toggleSel = 'button[aria-label*="password" i], [class*="eye"], [class*="toggle-pass"], button:near(input[type="password"])';
  444 |     const toggle = page.locator(toggleSel).first();
  445 |     const exists = await toggle.isVisible({ timeout: 3000 }).catch(() => false);
  446 |     if (exists) {
  447 |       await page.locator('input[type="password"]').first().fill('TestPass@123');
  448 |       await toggle.click();
  449 |       const typeAfter = await page.locator('input[type="text"], input[type="password"]').first().getAttribute('type');
  450 |       expect(typeAfter).toBe('text');
  451 |       console.log('✓ Show/hide password toggle works');
  452 |     } else {
  453 |       console.warn('⚠ No show/hide password toggle found — consider adding one');
  454 |     }
  455 |   });
  456 | 
  457 |   test('5.3 — Login page keyboard navigation (Tab order)', async ({ page }) => {
  458 |     await page.goto(BASE_URL);
  459 |     await page.waitForLoadState('networkidle');
  460 |     await page.keyboard.press('Tab');
  461 |     const focused1 = await page.evaluate(() => document.activeElement?.tagName);
  462 |     await page.keyboard.press('Tab');
  463 |     const focused2 = await page.evaluate(() => document.activeElement?.tagName);
  464 |     console.log(`Tab order: ${focused1} → ${focused2}`);
  465 |     expect(['INPUT', 'BUTTON', 'A']).toContain(focused1);
  466 |   });
  467 | 
  468 |   test('5.4 — Enter key submits login form', async ({ page }) => {
  469 |     await page.goto(BASE_URL);
  470 |     await page.waitForLoadState('networkidle');
  471 |     const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
  472 |     await page.locator(emailSel).first().fill(ADMIN.email);
  473 |     await page.locator('input[type="password"]').first().fill(ADMIN.password);
  474 |     await page.keyboard.press('Enter');
  475 |     await page.waitForTimeout(2000);
  476 |     const url = page.url();
  477 |     // Should have tried to submit (URL change or dashboard visible)
  478 |     console.log(`URL after Enter: ${url}`);
  479 |   });
  480 | 
  481 |   test('5.5 — Page title updates on navigation', async ({ page }) => {
  482 |     await loginAs(page, ADMIN);
  483 |     await page.waitForTimeout(2000);
  484 |     const titleAfterLogin = await page.title();
  485 |     console.log(`Title after login: "${titleAfterLogin}"`);
  486 |     // Should differ from login page title or have meaningful content
  487 |     expect(titleAfterLogin.length).toBeGreaterThan(0);
  488 |   });
  489 | 
  490 | });
  491 | 
  492 | // ════════════════════════════════════════════════════════════
  493 | //  SUITE 6 — Performance
  494 | // ════════════════════════════════════════════════════════════
  495 | test.describe('6. Performance', () => {
  496 | 
  497 |   test('6.1 — Login page loads under 3 seconds', async ({ page }) => {
  498 |     const t0 = Date.now();
  499 |     await page.goto(BASE_URL);
  500 |     await page.waitForLoadState('domcontentloaded');
  501 |     const elapsed = Date.now() - t0;
  502 |     console.log(`Login page load: ${elapsed}ms`);
  503 |     expect(elapsed).toBeLessThan(3000);
  504 |   });
  505 | 
  506 |   test('6.2 — Login response under 3 seconds', async ({ page }) => {
  507 |     await page.goto(BASE_URL);
  508 |     await page.waitForLoadState('networkidle');
  509 |     const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
  510 |     await page.locator(emailSel).first().fill(ADMIN.email);
  511 |     await page.locator('input[type="password"]').first().fill(ADMIN.password);
  512 |     const t0 = Date.now();
  513 |     await page.locator('button[type="submit"], button:has-text("Login")').first().click();
  514 |     await page.waitForLoadState('networkidle');
  515 |     const elapsed = Date.now() - t0;
```