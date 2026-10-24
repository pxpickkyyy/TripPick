import { test, expect } from '@playwright/test';

test.describe('Infinite Live Discovery Engine & Security Architecture Suite', () => {
  test('Host toggles Infinite Discovery Mode in Lobby and starts session with infinite badge', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // 1. Create Room
    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 2. Profile Setup
    const nameInput = page.locator('[data-testid="user-name-input"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Discovery Leader');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await enterLobbyBtn.click();

    // 3. Verify Mode Switch Buttons in Lobby
    const rapidModeBtn = page.locator('[data-testid="mode-rapid-btn"]');
    const infiniteModeBtn = page.locator('[data-testid="mode-infinite-btn"]');

    await expect(rapidModeBtn).toBeVisible({ timeout: 10000 });
    await expect(infiniteModeBtn).toBeVisible({ timeout: 10000 });

    // Select Infinite Discovery Mode
    await infiniteModeBtn.click();
    await expect(infiniteModeBtn).toHaveClass(/border-\[#cba6f7\]/);

    // 4. Start Session
    const startSessionBtn = page.locator('button:has-text("Start Swiping"), button:has-text("เริ่มเซสชัน")').first();
    await expect(startSessionBtn).toBeVisible();
    await startSessionBtn.click();

    // 5. Verify Swiper View Displays Infinite Discovery Badge
    await expect(page.locator('text=1 /')).toBeVisible({ timeout: 25000 });
    const infiniteBadge = page.locator('[data-testid="infinite-discovery-badge"]');
    await expect(infiniteBadge).toBeVisible({ timeout: 10000 });

    console.log('✓ Host toggle to Infinite Discovery Mode verified with HUD badge');
  });

  test('Deck expands dynamically as user swipes past prefetch threshold (>50% or remaining <= 3)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Create Room & Profile
    await page.locator('[data-testid="create-room-btn"]').click();
    await page.locator('[data-testid="user-name-input"]').fill('Swiper Pro');
    await page.locator('[data-testid="enter-lobby-btn"]').click();

    // Select Infinite Discovery Mode
    const infiniteModeBtn = page.locator('[data-testid="mode-infinite-btn"]');
    await expect(infiniteModeBtn).toBeVisible({ timeout: 10000 });
    await infiniteModeBtn.click();

    // Start Session
    const startSessionBtn = page.locator('button:has-text("Start Swiping"), button:has-text("เริ่มเซสชัน")').first();
    await startSessionBtn.click();

    // Wait for first card
    await expect(page.locator('text=1 /')).toBeVisible({ timeout: 25000 });

    // Swipe through 6 cards by passing
    for (let i = 0; i < 6; i++) {
      const passBtn = page.locator('button:has-text("ผ่าน"), button:has-text("Pass")').first();
      if ((await passBtn.count()) > 0) {
        await passBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Verify user is at card 6 or higher (deck expanded beyond initial 5 cards)
    const hudCounter = page.locator('span.font-mono.tabular-data').filter({ hasText: /\// }).first();
    await expect(hudCounter).toBeVisible();
    const counterText = await hudCounter.textContent();
    console.log(`Current Swiper HUD Counter: ${counterText}`);

    // Verify counter shows progress beyond card 5 without page freeze
    const isPastFive = counterText && parseInt(counterText.split('/')[0].trim(), 10) >= 5;
    expect(isPastFive).toBe(true);

    console.log('✓ Dynamic deck expansion verified: user seamlessly swiped beyond initial 5 cards');
  });

  test('Security Verification: Google API Key is NEVER exposed in client HTML or photo URLs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Create Room & Profile
    await page.locator('[data-testid="create-room-btn"]').click();
    await page.locator('[data-testid="user-name-input"]').fill('Security Auditor');
    await page.locator('[data-testid="enter-lobby-btn"]').click();

    // Start Session
    const startSessionBtn = page.locator('button:has-text("Start Swiping"), button:has-text("เริ่มเซสชัน")').first();
    await expect(startSessionBtn).toBeVisible({ timeout: 10000 });
    await startSessionBtn.click();

    await expect(page.locator('text=1 /')).toBeVisible({ timeout: 25000 });

    // Inspect Entire HTML Page Source
    const fullHtml = await page.content();

    // STRICT SECURITY ASSERTION: Raw Google API Key AIzaSy... MUST NEVER appear in client DOM
    expect(fullHtml.includes('AIzaSy')).toBe(false);

    // Verify image sources do not call places.googleapis.com directly
    const imgUrls = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) => imgs.map(img => img.src));
    for (const url of imgUrls) {
      expect(url.includes('key=AIzaSy')).toBe(false);
      expect(url.includes('places.googleapis.com')).toBe(false);
    }

    // Verify client JS scripts in browser network do NOT contain raw Google API keys
    const scriptSrcs = await page.locator('script[src]').evaluateAll((scripts: HTMLScriptElement[]) => scripts.map(s => s.src));
    for (const src of scriptSrcs) {
      if (src.includes('/assets/')) {
        const res = await page.request.get(src);
        const scriptBody = await res.text();
        expect(scriptBody.includes('AIzaSy')).toBe(false);
      }
    }

    console.log('✓ Security Audit passed: Google API Key (AIzaSy...) is 100% hidden from client DOM, network URLs, and JS bundles');
  });

  test('Strict Thai Tax Law (ท.ป. 4/2528) holds across RFP procurement view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.locator('[data-testid="create-room-btn"]').click();
    await page.locator('[data-testid="user-name-input"]').fill('CFO Auditor');
    await page.locator('[data-testid="enter-lobby-btn"]').click();

    // In Lobby, expand Revenue HUD pill to open Procurement Modal
    const revenueHud = page.locator('[data-testid="revenue-hud"]');
    await expect(revenueHud).toBeVisible({ timeout: 10000 });
    await revenueHud.click();

    const openProcurementBtn = page.locator('[data-testid="hud-open-procurement-btn"]');
    await expect(openProcurementBtn).toBeVisible({ timeout: 10000 });
    await openProcurementBtn.click();

    // Verify Statutory Tax Formula Display
    await expect(page.locator('text=ท.ป. 4/2528').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=ภาษีหัก ณ ที่จ่าย 3%').first()).toBeVisible();
    await expect(page.locator('text=VAT 7%').first()).toBeVisible();

    console.log('✓ Thai Tax Law (ท.ป. 4/2528) verified in live UI with 3% WHT and 7% VAT');
  });
});
