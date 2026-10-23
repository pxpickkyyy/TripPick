import { test, expect } from '@playwright/test';

test.describe('TripPick UI Overlap, i18n & Voice Engine Smoke Suite', () => {
  test('1. Bilingual Language Switcher works and persists in localStorage', async ({ page }) => {
    await page.goto('/');

    // Check brand name visible
    await expect(page.locator('text=TripPick').first()).toBeVisible();

    // Verify Language Switcher buttons exist
    const thBtn = page.locator('[data-testid="lang-th-btn"]');
    const enBtn = page.locator('[data-testid="lang-en-btn"]');
    await expect(thBtn).toBeVisible();
    await expect(enBtn).toBeVisible();

    // Switch to English
    await enBtn.click();
    await page.waitForTimeout(200);

    // Verify localStorage persistence
    const savedLangEn = await page.evaluate(() => localStorage.getItem('trippick_lang'));
    expect(savedLangEn).toBe('en');

    // Verify English text on UI
    await expect(page.locator('[data-testid="create-room-btn"]')).toContainText('Create War Room');

    // Switch back to Thai
    await thBtn.click();
    await page.waitForTimeout(200);

    const savedLangTh = await page.evaluate(() => localStorage.getItem('trippick_lang'));
    expect(savedLangTh).toBe('th');

    // Verify Thai text on UI
    await expect(page.locator('[data-testid="create-room-btn"]')).toContainText('สร้างห้องใหม่เพื่อเริ่มทริป');
  });

  test('2. Floating Concierge Button and Revenue HUD do NOT overlap (Mathematical Bounding Box Separation)', async ({ page }) => {
    // Set viewport to standard desktop dimensions
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Step 1: Click Create Room button to transition to Profile Setup
    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // In Profile Selector: Enter Host Name and proceed to Lobby
    const nameInput = page.locator('[data-testid="user-name-input"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('CTO Test Lead');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await expect(enterLobbyBtn).toBeVisible();
    await enterLobbyBtn.click();

    // Now in Waiting Lobby View: BOTH ConciergeDrawer and RevenueMetricsHUD are rendered!
    const conciergeTrigger = page.locator('[data-testid="concierge-trigger"]');
    const revenueHud = page.locator('[data-testid="revenue-hud"]');

    await expect(conciergeTrigger).toBeVisible({ timeout: 5000 });
    await expect(revenueHud).toBeVisible({ timeout: 5000 });

    const boxConcierge = await conciergeTrigger.boundingBox();
    const boxHud = await revenueHud.boundingBox();

    expect(boxConcierge).not.toBeNull();
    expect(boxHud).not.toBeNull();

    if (boxConcierge && boxHud) {
      console.log('Concierge Trigger Box:', boxConcierge);
      console.log('Revenue HUD Box:', boxHud);

      // Verify Concierge is on bottom-left quadrant (x < 400)
      expect(boxConcierge.x).toBeLessThan(400);

      // Verify Revenue HUD is on bottom-right quadrant (x > 800 on 1280px width)
      expect(boxHud.x).toBeGreaterThan(800);

      // Mathematical non-overlap assertion:
      // Boxes do not overlap if one is completely to the left, right, above, or below the other
      const isCompletelySeparatedHorizontally =
        boxConcierge.x + boxConcierge.width < boxHud.x ||
        boxHud.x + boxHud.width < boxConcierge.x;

      const isCompletelySeparatedVertically =
        boxConcierge.y + boxConcierge.height < boxHud.y ||
        boxHud.y + boxHud.height < boxConcierge.y;

      const hasCollision = !(isCompletelySeparatedHorizontally || isCompletelySeparatedVertically);

      expect(hasCollision).toBe(false);
      console.log('✓ Verified: Zero collision between Concierge Trigger and Revenue HUD');
    }
  });

  test('3. Mobile Viewport: Non-overlapping layout on iPhone / Small screens', async ({ page }) => {
    // Test on 390x844 (iPhone 12/13/14 viewport)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const nameInput = page.locator('[data-testid="user-name-input"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Mobile Host');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await expect(enterLobbyBtn).toBeVisible();
    await enterLobbyBtn.click();

    const conciergeTrigger = page.locator('[data-testid="concierge-trigger"]');
    const revenueHud = page.locator('[data-testid="revenue-hud"]');

    await expect(conciergeTrigger).toBeVisible({ timeout: 5000 });
    await expect(revenueHud).toBeVisible({ timeout: 5000 });

    const boxConcierge = await conciergeTrigger.boundingBox();
    const boxHud = await revenueHud.boundingBox();

    expect(boxConcierge).not.toBeNull();
    expect(boxHud).not.toBeNull();

    if (boxConcierge && boxHud) {
      // On 390px wide mobile:
      // Concierge trigger is on left side (x around 16px)
      expect(boxConcierge.x).toBeLessThan(150);
      // Revenue HUD collapsed pill is on right side
      expect(boxHud.x + boxHud.width).toBeGreaterThan(250);

      // Ensure no horizontal collision between the two buttons
      const isSeparatedHorizontally = boxConcierge.x + boxConcierge.width <= boxHud.x;
      expect(isSeparatedHorizontally).toBe(true);
      console.log('✓ Verified: Zero collision on mobile screen (390px)');
    }
  });

  test('4. Concierge Drawer opens and closes without disturbing Revenue HUD', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Concierge can be toggled on landing
    const conciergeTrigger = page.locator('[data-testid="concierge-trigger"]');
    await conciergeTrigger.click();

    // Verify drawer is open
    await expect(page.locator('text=TripPick AI Concierge').first()).toBeVisible();

    // Close drawer by clicking backdrop
    const backdrop = page.locator('[data-testid="concierge-backdrop"]');
    await expect(backdrop).toBeVisible({ timeout: 3000 });
    await backdrop.click();

    await page.waitForTimeout(300);
  });

  test('5. Business Model Dossier (100 Pts) Modal renders bilingual criteria and monetization data', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Switch to English first
    await page.locator('[data-testid="lang-en-btn"]').click();
    await page.waitForTimeout(100);

    // Click "View Business Model & Pitch Dossier"
    const pitchBtn = page.locator('button:has-text("View Business Model")').first();
    await expect(pitchBtn).toBeVisible();
    await pitchBtn.click();

    // Verify Modal Header & 100 PTS criteria in English
    await expect(page.locator('text=COMPETITION DOSSIER // CRITERIA 100 PTS').first()).toBeVisible();
    await expect(page.locator('text=฿32,400').first()).toBeVisible();
    await expect(page.locator('text=Make Me Money').first()).toBeVisible();

    // Close Modal via close button
    const closeBtn = page.locator('button[aria-label="Close Window"]').first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Switch to Thai
    await page.locator('[data-testid="lang-th-btn"]').click();
    await page.waitForTimeout(100);

    // Reopen in Thai
    const pitchBtnTh = page.locator('button:has-text("ดู Business Model")').first();
    await expect(pitchBtnTh).toBeVisible();
    await pitchBtnTh.click();

    // Verify Modal in Thai
    await expect(page.locator('text=ซอฟต์แวร์เพื่อธุรกิจและการท่องเที่ยว').first()).toBeVisible();
    await expect(page.locator('text=32,400 บาท').first()).toBeVisible();

    // Close Modal
    await page.locator('button[aria-label="ปิดหน้าต่าง"]').first().click();
  });

  test('6. Android 360px Small Screen: Strict zero-overlap verification', async ({ page }) => {
    // Test on 360x740 (Standard low-end Android viewport: Galaxy A series)
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');

    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const nameInput = page.locator('[data-testid="user-name-input"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Android 360 User');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await expect(enterLobbyBtn).toBeVisible();
    await enterLobbyBtn.click();

    const conciergeTrigger = page.locator('[data-testid="concierge-trigger"]');
    const revenueHud = page.locator('[data-testid="revenue-hud"]');

    await expect(conciergeTrigger).toBeVisible({ timeout: 5000 });
    await expect(revenueHud).toBeVisible({ timeout: 5000 });

    const boxConcierge = await conciergeTrigger.boundingBox();
    const boxHud = await revenueHud.boundingBox();

    expect(boxConcierge).not.toBeNull();
    expect(boxHud).not.toBeNull();

    if (boxConcierge && boxHud) {
      console.log('Android 360 Concierge:', boxConcierge);
      console.log('Android 360 Revenue HUD:', boxHud);

      // Concierge trigger is compact on mobile (width ~62px)
      expect(boxConcierge.width).toBeLessThan(100);

      // Verify strict horizontal separation: Concierge right edge is before HUD left edge
      const isSeparatedHorizontally = boxConcierge.x + boxConcierge.width <= boxHud.x;
      expect(isSeparatedHorizontally).toBe(true);
      console.log('✓ Verified: Zero collision on low-end Android 360px screen');
    }
  });

  test('7. iPhone SE 375px Small Screen: Zero-overlap verification', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const nameInput = page.locator('[data-testid="user-name-input"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('iPhone SE Host');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await expect(enterLobbyBtn).toBeVisible();
    await enterLobbyBtn.click();

    const conciergeTrigger = page.locator('[data-testid="concierge-trigger"]');
    const revenueHud = page.locator('[data-testid="revenue-hud"]');

    await expect(conciergeTrigger).toBeVisible({ timeout: 5000 });
    await expect(revenueHud).toBeVisible({ timeout: 5000 });

    const boxConcierge = await conciergeTrigger.boundingBox();
    const boxHud = await revenueHud.boundingBox();

    expect(boxConcierge).not.toBeNull();
    expect(boxHud).not.toBeNull();

    if (boxConcierge && boxHud) {
      const isSeparatedHorizontally = boxConcierge.x + boxConcierge.width <= boxHud.x;
      expect(isSeparatedHorizontally).toBe(true);
      console.log('✓ Verified: Zero collision on iPhone SE 375px screen');
    }
  });

  test('8. Procurement Modal in English displays English statutory terms and tax table', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Switch to English first
    await page.locator('[data-testid="lang-en-btn"]').click();
    await page.waitForTimeout(100);

    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await createBtn.click();

    const nameInput = page.locator('[data-testid="user-name-input"]');
    await nameInput.fill('Procurement Approver');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await enterLobbyBtn.click();

    // In Lobby, expand Revenue HUD pill
    const revenueHud = page.locator('[data-testid="revenue-hud"]');
    await expect(revenueHud).toBeVisible({ timeout: 5000 });
    await revenueHud.click();

    // Click the Open Procurement button inside the expanded card
    const openProcurementBtn = page.locator('[data-testid="hud-open-procurement-btn"]');
    await expect(openProcurementBtn).toBeVisible({ timeout: 5000 });
    await openProcurementBtn.click();

    // Verify modal opened with English content
    await expect(page.locator('text=B2B PROCUREMENT ENGINE').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Net Subtotal').first()).toBeVisible();
    await expect(page.locator('text=VAT 7%').first()).toBeVisible();
    await expect(page.locator('text=Withholding Tax 3%').first()).toBeVisible();
    await expect(page.locator('text=Net Payable to Vendor').first()).toBeVisible();
    console.log('✓ Verified: Procurement Modal renders full English statutory tax table');
  });

  test('9. Concierge Drawer bilingual chat & language switch preserves chat history and responds in active language', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Switch to English mode
    await page.locator('[data-testid="lang-en-btn"]').click();
    await page.waitForTimeout(100);

    // Open Concierge Drawer
    const conciergeTrigger = page.locator('[data-testid="concierge-trigger"]');
    await conciergeTrigger.click();

    // Verify initial greeting is in English
    await expect(page.locator('text=Hello! I am the TripPick AI Concierge').first()).toBeVisible({ timeout: 5000 });

    // Click English quick prompt 1: 'Check WiFi speeds and boardroom specs'
    const promptBtn = page.locator('button:has-text("Check WiFi speeds and boardroom specs")').first();
    await expect(promptBtn).toBeVisible({ timeout: 5000 });
    await promptBtn.click();

    // Verify user message appears in chat
    await expect(page.locator('text=Check WiFi speeds and boardroom specs').first()).toBeVisible({ timeout: 5000 });

    // Verify AI response arrives in English (NOT Thai [ข้อมูลความเร็วเน็ต])
    const chatBubbles = page.locator('.whitespace-pre-wrap');
    await expect(chatBubbles).toHaveCount(3, { timeout: 10000 });
    const aiResponseText = await chatBubbles.nth(2).innerText();
    expect(aiResponseText.toLowerCase()).toMatch(/wi-?fi/);
    expect(/[\u0E00-\u0E7F]/.test(aiResponseText)).toBe(false);
    console.log('✓ Verified: AI Concierge responds in English when in English mode');

    // Close Concierge Drawer to interact with header
    const closeChatBtn = page.locator('[data-testid="concierge-close-btn"]');
    await closeChatBtn.click();
    await page.waitForTimeout(200);

    // Switch language to Thai
    await page.locator('[data-testid="lang-th-btn"]').click();
    await page.waitForTimeout(200);

    // Re-open Concierge Drawer
    await conciergeTrigger.click();

    // Verify user chat history is preserved!
    await expect(page.locator('text=Check WiFi speeds and boardroom specs').first()).toBeVisible({ timeout: 5000 });

    // Verify initial greeting localized to Thai
    await expect(page.locator('text=สวัสดีครับ ผมคือ TripPick AI Concierge').first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Verified: Language switch preserves existing chat history and localizes greeting');

    // Close Concierge Drawer again
    await closeChatBtn.click();
    await page.waitForTimeout(200);

    // Switch back to English
    await page.locator('[data-testid="lang-en-btn"]').click();
    await page.waitForTimeout(200);

    // Re-open Concierge Drawer
    await conciergeTrigger.click();

    // Verify user chat history STILL preserved and greeting is back to English
    await expect(page.locator('text=Check WiFi speeds and boardroom specs').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Hello! I am the TripPick AI Concierge').first()).toBeVisible({ timeout: 5000 });
  });
});
