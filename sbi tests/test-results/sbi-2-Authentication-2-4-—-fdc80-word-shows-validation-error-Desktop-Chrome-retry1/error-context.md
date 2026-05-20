# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sbi.spec.js >> 2. Authentication >> 2.4 — Empty password shows validation error
- Location: sbi.spec.js:155:3

# Error details

```
Error: expect(received).toBeTruthy()

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
          - textbox "you@company.com" [ref=e35]: admin@sbi.com
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: Password*
            - generic [ref=e39]:
              - textbox "••••••••" [ref=e40]
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
      - paragraph [ref=e62]: Password is required
    - button [ref=e63] [cursor=pointer]:
      - img [ref=e64]
```

# Test source

```ts
  64  |     expect(type).toBe('password');
  65  |   });
  66  | 
  67  |   test('1.4 — Page has no broken images', async ({ page }) => {
  68  |     const broken = [];
  69  |     page.on('response', res => {
  70  |       if (res.request().resourceType() === 'image' && res.status() >= 400)
  71  |         broken.push(res.url());
  72  |     });
  73  |     await page.goto(BASE_URL);
  74  |     await page.waitForLoadState('networkidle');
  75  |     expect(broken, `Broken images: ${broken.join(', ')}`).toHaveLength(0);
  76  |   });
  77  | 
  78  |   test('1.5 — Console has no critical errors', async ({ page }) => {
  79  |     const errors = [];
  80  |     page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  81  |     await page.goto(BASE_URL);
  82  |     await page.waitForLoadState('networkidle');
  83  |     const critical = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
  84  |     if (critical.length) console.warn('Console errors:', critical);
  85  |     expect(critical).toHaveLength(0);
  86  |   });
  87  | 
  88  |   test('1.6 — HTTPS enforced (no mixed content)', async ({ page }) => {
  89  |     const insecure = [];
  90  |     page.on('request', req => {
  91  |       if (req.url().startsWith('http://') && !req.url().startsWith('http://localhost'))
  92  |         insecure.push(req.url());
  93  |     });
  94  |     await page.goto(BASE_URL);
  95  |     await page.waitForLoadState('networkidle');
  96  |     expect(insecure, `Mixed content URLs: ${insecure.join(', ')}`).toHaveLength(0);
  97  |   });
  98  | 
  99  |   test('1.7 — Page is mobile responsive (375px)', async ({ page }) => {
  100 |     await page.setViewportSize({ width: 375, height: 812 });
  101 |     await page.goto(BASE_URL);
  102 |     await page.waitForLoadState('networkidle');
  103 |     // Form should still be visible and usable
  104 |     const form = page.locator('form, [class*="login"], [class*="auth"]').first();
  105 |     // At minimum the password field should be visible
  106 |     await expect(page.locator('input[type="password"]').first()).toBeVisible();
  107 |   });
  108 | 
  109 | });
  110 | 
  111 | // ════════════════════════════════════════════════════════════
  112 | //  SUITE 2 — Authentication
  113 | // ════════════════════════════════════════════════════════════
  114 | test.describe('2. Authentication', () => {
  115 | 
  116 |   test('2.1 — Admin can log in with valid credentials', async ({ page }) => {
  117 |     await loginAs(page, ADMIN);
  118 |     // After login we should NOT still be on the login page
  119 |     const url = page.url();
  120 |     const loginKeywords = ['/login', '/signin', 'auth'];
  121 |     const stillOnLogin = loginKeywords.some(k => url.includes(k));
  122 |     // Check for dashboard/home content OR URL change
  123 |     const hasDashboard = await page.locator('[class*="dashboard"], [class*="home"], nav, header').first().isVisible({ timeout: 5000 }).catch(() => false);
  124 |     expect(hasDashboard || !stillOnLogin, 'Login did not navigate to dashboard').toBeTruthy();
  125 |     console.log(`✓ After login URL: ${url}`);
  126 |   });
  127 | 
  128 |   test('2.2 — Wrong password shows error message', async ({ page }) => {
  129 |     await page.goto(BASE_URL);
  130 |     await page.waitForLoadState('networkidle');
  131 |     const emailSel = 'input[type="email"], input[name="email"], input[placeholder*="email" i]';
  132 |     await page.locator(emailSel).first().fill(ADMIN.email);
  133 |     await page.locator('input[type="password"]').first().fill('WrongPassword999!');
  134 |     await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').first().click();
  135 |     await page.waitForTimeout(2000);
  136 |     // Should show some error
  137 |     const errorSel = '[class*="error"], [class*="alert"], [role="alert"], p:has-text("invalid"), p:has-text("incorrect"), p:has-text("wrong"), span:has-text("error")';
  138 |     const errorVisible = await page.locator(errorSel).first().isVisible({ timeout: 5000 }).catch(() => false);
  139 |     expect(errorVisible, 'No error message shown for wrong password').toBeTruthy();
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
> 164 |     expect(isRequired).toBeTruthy();
      |                        ^ Error: expect(received).toBeTruthy()
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
```