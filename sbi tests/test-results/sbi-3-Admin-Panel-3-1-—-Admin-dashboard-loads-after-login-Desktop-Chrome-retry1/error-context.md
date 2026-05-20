# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sbi.spec.js >> 3. Admin Panel >> 3.1 — Admin dashboard loads after login
- Location: sbi.spec.js:235:3

# Error details

```
Error: Admin dashboard UI not visible after login

expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
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
        - textbox "you@company.com" [ref=e35]: admin@sbi.com
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]: Password*
          - generic [ref=e39]:
            - textbox "••••••••" [ref=e40]: Admin@123
            - button "Show password" [ref=e41] [cursor=pointer]:
              - img [ref=e42]
        - generic [ref=e45]:
          - generic [ref=e46] [cursor=pointer]:
            - checkbox "Remember me" [checked] [ref=e47]
            - generic [ref=e48]: Remember me
          - button "Forgot password?" [ref=e49] [cursor=pointer]
      - button "Signing in..." [disabled] [ref=e50]
    - paragraph [ref=e51]: Secure JWT Authentication
```

# Test source

```ts
  140 |   });
  141 | 
  142 |   test('2.3 — Empty email shows validation error', async ({ page }) => {
  143 |     await page.goto(BASE_URL);
  144 |     await page.waitForLoadState('networkidle');
  145 |     await page.locator('input[type="password"]').first().fill('SomePassword@1');
  146 |     await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first().click();
  147 |     await page.waitForTimeout(1000);
  148 |     const url = page.url();
  149 |     // Should stay on login page or show validation
  150 |     const emailField = page.locator('input[type="email"], input[name="email"]').first();
  151 |     const isRequired = await emailField.evaluate(el => el.required || el.validity?.valueMissing).catch(() => true);
  152 |     expect(isRequired || url.includes('login') || url === BASE_URL + '/').toBeTruthy();
  153 |   });
  154 | 
  155 |   test('2.4 — Empty password shows validation error', async ({ page }) => {
  156 |     await page.goto(BASE_URL);
  157 |     await page.waitForLoadState('networkidle');
  158 |     const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
  159 |     await page.locator(emailSel).first().fill(ADMIN.email);
  160 |     await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first().click();
  161 |     await page.waitForTimeout(1000);
  162 |     const passField = page.locator('input[type="password"]').first();
  163 |     const isRequired = await passField.evaluate(el => el.required || el.validity?.valueMissing).catch(() => true);
  164 |     expect(isRequired).toBeTruthy();
  165 |   });
  166 | 
  167 |   test('2.5 — Invalid email format shows error', async ({ page }) => {
  168 |     await page.goto(BASE_URL);
  169 |     await page.waitForLoadState('networkidle');
  170 |     const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
  171 |     await page.locator(emailSel).first().fill('notavalidemail');
  172 |     await page.locator('input[type="password"]').first().fill('Test@123');
  173 |     await page.locator('button[type="submit"], button:has-text("Login")').first().click();
  174 |     await page.waitForTimeout(1000);
  175 |     const emailField = page.locator(emailSel).first();
  176 |     const isInvalid = await emailField.evaluate(el => el.validity?.typeMismatch || !el.validity?.valid).catch(() => false);
  177 |     expect(isInvalid, 'Invalid email accepted without error').toBeTruthy();
  178 |   });
  179 | 
  180 |   test('2.6 — SQLi payload in login is rejected', async ({ page }) => {
  181 |     await page.goto(BASE_URL);
  182 |     await page.waitForLoadState('networkidle');
  183 |     const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
  184 |     await page.locator(emailSel).first().fill("' OR '1'='1' --");
  185 |     await page.locator('input[type="password"]').first().fill("' OR '1'='1' --");
  186 |     await page.locator('button[type="submit"], button:has-text("Login")').first().click();
  187 |     await page.waitForTimeout(2000);
  188 |     // Should NOT navigate to dashboard
  189 |     const dashSel = '[class*="dashboard"], [class*="admin"]';
  190 |     const gotIn = await page.locator(dashSel).first().isVisible({ timeout: 3000 }).catch(() => false);
  191 |     expect(gotIn, 'SQL injection may have bypassed login!').toBeFalsy();
  192 |   });
  193 | 
  194 |   test('2.7 — Brute force: 5 wrong attempts handled gracefully', async ({ page }) => {
  195 |     await page.goto(BASE_URL);
  196 |     await page.waitForLoadState('networkidle');
  197 |     const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
  198 |     for (let i = 0; i < 5; i++) {
  199 |       await page.locator(emailSel).first().fill(ADMIN.email);
  200 |       await page.locator('input[type="password"]').first().fill(`WrongPass${i}!`);
  201 |       await page.locator('button[type="submit"], button:has-text("Login")').first().click();
  202 |       await page.waitForTimeout(800);
  203 |     }
  204 |     // After 5 attempts should show lockout/captcha or still show error (not crash)
  205 |     const crashed = await page.locator('body').textContent();
  206 |     expect(crashed).not.toContain('500');
  207 |     expect(crashed).not.toContain('Internal Server Error');
  208 |     console.log('Brute force result — page state after 5 attempts logged');
  209 |   });
  210 | 
  211 |   test('2.8 — Forgot password link exists', async ({ page }) => {
  212 |     await page.goto(BASE_URL);
  213 |     await page.waitForLoadState('networkidle');
  214 |     const forgotSel = 'a:has-text("Forgot"), a:has-text("forgot"), a:has-text("Reset"), button:has-text("Forgot")';
  215 |     const exists = await page.locator(forgotSel).first().isVisible({ timeout: 5000 }).catch(() => false);
  216 |     expect(exists, 'No forgot password link found on login page').toBeTruthy();
  217 |   });
  218 | 
  219 |   test('2.9 — Admin can log out', async ({ page }) => {
  220 |     await loginAs(page, ADMIN);
  221 |     await page.waitForTimeout(1500);
  222 |     await logout(page);
  223 |     // Should be back on login page
  224 |     const loginVisible = await page.locator('input[type="password"]').first().isVisible({ timeout: 5000 }).catch(() => false);
  225 |     expect(loginVisible, 'Login form not shown after logout').toBeTruthy();
  226 |   });
  227 | 
  228 | });
  229 | 
  230 | // ════════════════════════════════════════════════════════════
  231 | //  SUITE 3 — Admin Panel
  232 | // ════════════════════════════════════════════════════════════
  233 | test.describe('3. Admin Panel', () => {
  234 | 
  235 |   test('3.1 — Admin dashboard loads after login', async ({ page }) => {
  236 |     await loginAs(page, ADMIN);
  237 |     await page.waitForTimeout(2000);
  238 |     // Should have some admin UI
  239 |     const adminUI = await page.locator('nav, [class*="sidebar"], [class*="dashboard"], [class*="admin"]').first().isVisible({ timeout: 8000 }).catch(() => false);
> 240 |     expect(adminUI, 'Admin dashboard UI not visible after login').toBeTruthy();
      |                                                                   ^ Error: Admin dashboard UI not visible after login
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
  335 |     expect(exists, 'No delete/remove button found for users').toBeTruthy();
  336 |   });
  337 | 
  338 |   test('3.6 — Admin panel not accessible without login', async ({ page }) => {
  339 |     // Try to navigate directly to admin routes without logging in
  340 |     const adminRoutes = ['/admin', '/dashboard', '/users', '/admin/users'];
```