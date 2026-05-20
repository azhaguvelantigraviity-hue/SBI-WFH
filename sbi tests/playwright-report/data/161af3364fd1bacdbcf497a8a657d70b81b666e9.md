# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sbi.spec.js >> 3. Admin Panel >> 3.5 — Admin can delete / deactivate a salesperson
- Location: sbi.spec.js:325:3

# Error details

```
Error: No delete/remove button found for users

expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - img [ref=e8]
          - generic [ref=e12]:
            - heading "SBI Online Login" [level=1] [ref=e13]
            - paragraph [ref=e14]: WFH PORTAL
        - generic [ref=e17]: Administrator
      - navigation [ref=e18]:
        - generic [ref=e19]:
          - heading "Overview" [level=3] [ref=e20]
          - button "Dashboard" [ref=e22] [cursor=pointer]:
            - img [ref=e25]
            - generic [ref=e30]: Dashboard
        - generic [ref=e31]:
          - heading "Team" [level=3] [ref=e32]
          - button "Sales Persons 2" [ref=e34] [cursor=pointer]:
            - img [ref=e36]
            - generic [ref=e41]: Sales Persons
            - generic [ref=e42]: "2"
        - generic [ref=e43]:
          - heading "Leads" [level=3] [ref=e44]
          - generic [ref=e45]:
            - button "All Leads" [ref=e46] [cursor=pointer]:
              - img [ref=e48]
              - generic [ref=e51]: All Leads
            - button "Assign Leads" [ref=e52] [cursor=pointer]:
              - img [ref=e54]
              - generic [ref=e57]: Assign Leads
            - button "Exception/Followup" [ref=e58] [cursor=pointer]:
              - img [ref=e60]
              - generic [ref=e62]: Exception/Followup
        - generic [ref=e63]:
          - heading "Quality" [level=3] [ref=e64]
          - button "QD Management" [ref=e66] [cursor=pointer]:
            - img [ref=e68]
            - generic [ref=e71]: QD Management
        - generic [ref=e72]:
          - heading "Analytics" [level=3] [ref=e73]
          - button "Reports" [ref=e75] [cursor=pointer]:
            - img [ref=e77]
            - generic [ref=e80]: Reports
        - generic [ref=e81]:
          - heading "System" [level=3] [ref=e82]
          - button "Settings" [ref=e84] [cursor=pointer]:
            - img [ref=e86]
            - generic [ref=e89]: Settings
      - generic [ref=e91]:
        - generic [ref=e93]: SA
        - generic [ref=e95]:
          - heading "System Admin" [level=4] [ref=e96]
          - paragraph [ref=e97]: admin
        - button "Logout" [ref=e98] [cursor=pointer]:
          - img [ref=e99]
    - generic [ref=e102]:
      - banner [ref=e103]:
        - heading "Dashboard" [level=2] [ref=e104]
        - generic [ref=e105]:
          - generic [ref=e106]:
            - img [ref=e107]
            - textbox "Search anything..." [ref=e110]
          - generic [ref=e111]:
            - button [ref=e112] [cursor=pointer]:
              - img [ref=e113]
            - button [ref=e120] [cursor=pointer]:
              - img [ref=e121]
          - generic [ref=e125]:
            - generic [ref=e126]:
              - heading "System Admin" [level=4] [ref=e127]
              - paragraph [ref=e128]: Administrator
            - generic [ref=e129]: SA
      - main [ref=e130]:
        - generic [ref=e131]:
          - generic [ref=e133]:
            - heading "Admin Overview" [level=2] [ref=e134]
            - paragraph [ref=e135]: Real-time performance metrics across all channels
          - generic [ref=e136]:
            - generic [ref=e139]:
              - generic [ref=e140]:
                - paragraph [ref=e141]: Total Leads
                - heading "0" [level=3] [ref=e142]
              - img [ref=e144]
            - generic [ref=e149]:
              - generic [ref=e150]:
                - paragraph [ref=e151]: Eligible Cases
                - heading "0" [level=3] [ref=e152]
              - img [ref=e154]
            - generic [ref=e159]:
              - generic [ref=e160]:
                - paragraph [ref=e161]: Dispatched
                - heading "0" [level=3] [ref=e162]
              - img [ref=e164]
            - generic [ref=e169] [cursor=pointer]:
              - generic [ref=e170]:
                - paragraph [ref=e171]: Follow-ups
                - heading "0" [level=3] [ref=e172]
              - img [ref=e174]
            - generic [ref=e179] [cursor=pointer]:
              - generic [ref=e180]:
                - paragraph [ref=e181]: Exceptions
                - heading "0" [level=3] [ref=e182]
              - img [ref=e184]
            - generic [ref=e188]:
              - generic [ref=e189]:
                - paragraph [ref=e190]: Net Incentives
                - heading "₹0.0K" [level=3] [ref=e191]
              - img [ref=e193]
          - generic [ref=e196]:
            - generic [ref=e197]:
              - generic "Recent Lead Activity" [ref=e198]:
                - generic [ref=e199]:
                  - table [ref=e200]:
                    - rowgroup [ref=e201]:
                      - row "Customer Status Agent Time" [ref=e202]:
                        - columnheader "Customer" [ref=e203]
                        - columnheader "Status" [ref=e204]
                        - columnheader "Agent" [ref=e205]
                        - columnheader "Time" [ref=e206]
                    - rowgroup
                  - generic [ref=e207]:
                    - generic [ref=e208]: ○
                    - paragraph [ref=e209]: No records found
              - generic [ref=e210]:
                - generic "Top Performing Agents" [ref=e211]
                - generic "Quick Actions" [ref=e213]:
                  - generic [ref=e214]:
                    - button "Upload Data" [ref=e215] [cursor=pointer]:
                      - img [ref=e216]
                      - generic [ref=e219]: Upload Data
                    - button "Assign Leads" [ref=e220] [cursor=pointer]:
                      - img [ref=e221]
                      - generic [ref=e225]: Assign Leads
                    - button "View Reports" [ref=e226] [cursor=pointer]:
                      - img [ref=e227]
                      - generic [ref=e230]: View Reports
                    - button "System Settings" [ref=e231] [cursor=pointer]:
                      - img [ref=e232]
                      - generic [ref=e234]: System Settings
            - generic [ref=e235]:
              - generic "Live Call Tracking" [ref=e236]:
                - button "View Full Logs" [ref=e238] [cursor=pointer]
              - generic [ref=e239]:
                - img [ref=e241]
                - generic [ref=e244]:
                  - heading "Quarterly Target" [level=3] [ref=e245]
                  - paragraph [ref=e246]: You've reached 84% of the team goal for June 2025.
                  - button "Manage Incentives" [ref=e249] [cursor=pointer]
  - generic [ref=e251]:
    - img [ref=e253]
    - generic [ref=e255]:
      - heading "Welcome back!" [level=4] [ref=e256]
      - paragraph [ref=e257]: Successfully signed in.
    - button [ref=e258] [cursor=pointer]:
      - img [ref=e259]
```

# Test source

```ts
  235 |   test('3.1 — Admin dashboard loads after login', async ({ page }) => {
  236 |     await loginAs(page, ADMIN);
  237 |     await page.waitForTimeout(2000);
  238 |     // Should have some admin UI
  239 |     const adminUI = await page.locator('nav, [class*="sidebar"], [class*="dashboard"], [class*="admin"]').first().isVisible({ timeout: 8000 }).catch(() => false);
  240 |     expect(adminUI, 'Admin dashboard UI not visible after login').toBeTruthy();
  241 |     await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/admin_dashboard.png', fullPage: true });
  242 |   });
  243 | 
  244 |   test('3.2 — Admin can navigate to user management', async ({ page }) => {
  245 |     await loginAs(page, ADMIN);
  246 |     await page.waitForTimeout(2000);
  247 |     const userNavSel = 'a:has-text("User"), a:has-text("Sales"), a:has-text("Staff"), button:has-text("User"), [href*="user"], [href*="sales"]';
  248 |     const navItem = page.locator(userNavSel).first();
  249 |     const exists = await navItem.isVisible({ timeout: 5000 }).catch(() => false);
  250 |     if (exists) {
  251 |       await navItem.click();
  252 |       await page.waitForLoadState('networkidle');
  253 |       await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/user_management.png', fullPage: true });
  254 |       console.log('✓ User management navigated to:', page.url());
  255 |     } else {
  256 |       console.warn('⚠ User management nav item not found — check sidebar labels');
  257 |       test.skip();
  258 |     }
  259 |   });
  260 | 
  261 |   test('3.3 — Admin can create a new salesperson', async ({ page }) => {
  262 |     await loginAs(page, ADMIN);
  263 |     await page.waitForTimeout(2000);
  264 |     // Try to find create/add user button
  265 |     const addBtnSel = 'button:has-text("Add"), button:has-text("Create"), button:has-text("New"), a:has-text("Add User"), [class*="add"]';
  266 |     const addBtn = page.locator(addBtnSel).first();
  267 |     const addVisible = await addBtn.isVisible({ timeout: 5000 }).catch(() => false);
  268 |     if (!addVisible) {
  269 |       console.warn('⚠ Add user button not found — navigating to users section first');
  270 |       const userNavSel = 'a:has-text("User"), a:has-text("Sales"), [href*="user"], [href*="sales"]';
  271 |       const nav = page.locator(userNavSel).first();
  272 |       if (await nav.isVisible({ timeout: 3000 }).catch(() => false)) await nav.click();
  273 |       await page.waitForTimeout(1500);
  274 |     }
  275 |     const addBtn2 = page.locator(addBtnSel).first();
  276 |     if (await addBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
  277 |       await addBtn2.click();
  278 |       await page.waitForTimeout(1000);
  279 |       // Fill in form fields
  280 |       const nameSel   = 'input[name="name"], input[placeholder*="name" i]';
  281 |       const emailSel  = 'input[name="email"], input[type="email"]';
  282 |       const passSel   = 'input[name="password"], input[type="password"]';
  283 |       if (await page.locator(nameSel).first().isVisible({ timeout: 3000 }).catch(() => false))
  284 |         await page.locator(nameSel).first().fill(SALES_NEW.name);
  285 |       if (await page.locator(emailSel).first().isVisible({ timeout: 3000 }).catch(() => false))
  286 |         await page.locator(emailSel).first().fill(SALES_NEW.email);
  287 |       if (await page.locator(passSel).first().isVisible({ timeout: 3000 }).catch(() => false))
  288 |         await page.locator(passSel).first().fill(SALES_NEW.password);
  289 |       // Role selector
  290 |       const roleSel = 'select[name="role"], [class*="role"] select, input[value*="sales"]';
  291 |       if (await page.locator(roleSel).first().isVisible({ timeout: 2000 }).catch(() => false)) {
  292 |         const roleEl = page.locator(roleSel).first();
  293 |         const tag = await roleEl.evaluate(el => el.tagName.toLowerCase());
  294 |         if (tag === 'select') await roleEl.selectOption({ label: /sales/i });
  295 |       }
  296 |       await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/create_user_form.png' });
  297 |       const submitSel = 'button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Add")';
  298 |       await page.locator(submitSel).last().click();
  299 |       await page.waitForTimeout(2000);
  300 |       await page.screenshot({ path: '/home/claude/sbi-tests/screenshots/after_create_user.png', fullPage: true });
  301 |       const successSel = '[class*="success"], [role="alert"], .toast, div:has-text("created"), div:has-text("success")';
  302 |       const success = await page.locator(successSel).first().isVisible({ timeout: 4000 }).catch(() => false);
  303 |       expect(success, 'No success confirmation after creating salesperson').toBeTruthy();
  304 |     } else {
  305 |       console.warn('⚠ Could not locate add-user button — skipping create test');
  306 |       test.skip();
  307 |     }
  308 |   });
  309 | 
  310 |   test('3.4 — Admin sees list of salespersons', async ({ page }) => {
  311 |     await loginAs(page, ADMIN);
  312 |     await page.waitForTimeout(2000);
  313 |     const userNavSel = 'a:has-text("User"), a:has-text("Sales"), a:has-text("Staff"), [href*="user"], [href*="sales"]';
  314 |     const nav = page.locator(userNavSel).first();
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
> 335 |     expect(exists, 'No delete/remove button found for users').toBeTruthy();
      |                                                               ^ Error: No delete/remove button found for users
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
  415 |     expect(workVisible, 'No tasks/work content visible for salesperson').toBeTruthy();
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
```