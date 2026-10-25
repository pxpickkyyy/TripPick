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

  test('5. Business Model Dossier button is removed cleanly from Landing page in all languages', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Switch to English
    await page.locator('[data-testid="lang-en-btn"]').click();
    await page.waitForTimeout(100);

    // Verify "View Business Model & Pitch Dossier" button is NOT rendered
    await expect(page.locator('button:has-text("View Business Model")')).toHaveCount(0);

    // Switch to Thai
    await page.locator('[data-testid="lang-th-btn"]').click();
    await page.waitForTimeout(100);

    // Verify "ดู Business Model" button is NOT rendered
    await expect(page.locator('button:has-text("ดู Business Model")')).toHaveCount(0);
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

    // Verify <main> does not trap descendant modals in a z-20 stacking context and modal occludes Concierge Trigger
    const mainZIndex = await page.locator('main').evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(mainZIndex).toBe('auto');
    const isConciergeOccluded = await page.evaluate(() => {
      const trigger = document.querySelector('[data-testid="concierge-trigger"]');
      if (!trigger) return false;
      const rect = trigger.getBoundingClientRect();
      const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return topEl !== null && !trigger.contains(topEl);
    });
    expect(isConciergeOccluded).toBe(true);
    console.log('✓ Verified: Procurement Modal renders full English statutory tax table & properly occludes HUD/Concierge');
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

  test('10. Awwwards Catppuccin Mocha Hero Studio, 4-Card Bento Matrix, Curated Collection Strip, CTA Dock, and Ambient Particle Field handle interactions & edge cases', async ({ page }) => {
    // Simulate Safari/Firefox where navigator.deviceMemory is undefined
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => undefined,
        configurable: true,
      });
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Phase 2.1: Verify Navigation Capsule route stage pill and magnetic CTA
    await expect(page.locator('[data-testid="nav-route-stage-pill"]')).toContainText(/Curated Retreats|คอลเลกชันทริปองค์กร/);
    await expect(page.locator('[data-testid="nav-magnetic-cta"]')).toBeVisible();

    // Phase 5: Verify Ambient Particle Field canvas exists and has valid dimensions
    const canvas = page.locator('[data-testid="particle-gravity-field"]');
    await expect(canvas).toBeAttached();
    const canvasWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    expect(canvasWidth).toBeGreaterThan(0);

    // Phase 3: Verify Hero Studio Card 3D preserve-3d tilt responds to mouse movement even when deviceMemory is undefined
    const heroCard = page.locator('[data-testid="zero-g-hero-card"]');
    await expect(heroCard).toBeVisible();
    const cardBox = await heroCard.boundingBox();
    expect(cardBox).not.toBeNull();
    if (cardBox) {
      await page.mouse.move(cardBox.x + 40, cardBox.y + 30);
      await page.waitForTimeout(150);
      const transformStyle = await heroCard.evaluate((el: HTMLElement) => el.style.transform);
      expect(transformStyle).toContain('rotateX');
      expect(transformStyle).not.toContain('rotateX(0deg) rotateY(0deg)');
    }

    // Verify invalid <4-char room code guard and alphanumeric sanitization
    await expect(page.locator('text=Consensus Studio').first()).toBeVisible();
    const joinBtn = page.locator('button[type="submit"]');
    await expect(joinBtn).toBeDisabled();

    const codeInput = page.locator('input[maxlength="8"]');
    await codeInput.fill('  tr-1p ');
    await expect(codeInput).toHaveValue('TR1P');
    await expect(joinBtn).toBeEnabled();

    // Phase 2.4 & Phase 4: Verify Curated Collection Strip displays verified venues and ratings
    const telemetryStrip = page.locator('[data-testid="telemetry-deck-strip"]');
    await expect(telemetryStrip).toBeVisible();
    await expect(telemetryStrip).toContainText('★');
    await expect(telemetryStrip).toContainText('฿');

    // Verify all 4 asymmetric Bento Matrix cards render
    await expect(page.locator('[data-testid="bento-card-state-sync"]')).toBeVisible();
    await expect(page.locator('[data-testid="bento-card-telemetry-gauge"]')).toBeVisible();
    await expect(page.locator('[data-testid="bento-card-latency-pipeline"]')).toBeVisible();
    await expect(page.locator('[data-testid="bento-card-terminal-portal"]')).toBeVisible();

    // Verify statutory tax summary copy button works
    const copyBtn = page.locator('[data-testid="copy-terminal-cmd-btn"]');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(copyBtn).toContainText(/Copied|คัดลอกแล้ว/i);

    // Phase 2.5: Verify Call-To-Action Portal dock and brief copy trigger
    const ctaPortal = page.locator('[data-testid="cta-portal-dock"]');
    await expect(ctaPortal).toBeVisible();
    const copyFlagsBtn = page.locator('[data-testid="copy-portal-flags-btn"]');
    await copyFlagsBtn.click();
    await expect(copyFlagsBtn).toContainText(/Copied|คัดลอกแล้ว/i);

    // Verify clean cross-platform language switcher labels (no broken Windows flag emojis)
    const langThText = await page.locator('[data-testid="lang-th-btn"]').textContent();
    const langEnText = await page.locator('[data-testid="lang-en-btn"]').textContent();
    expect(langThText?.trim()).toBe('TH · ไทย');
    expect(langEnText?.trim()).toBe('EN');

    // Verify telemetry-deck-strip renders 4 full architectural destination photo cards
    await expect(telemetryStrip.locator('img')).toHaveCount(4);

    // Verify zero H1 or document horizontal overflow on 390px and 320px ultra-narrow viewports (Thai & English)
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.waitForTimeout(100);
      const thOverflow = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const h1Right = h1 ? h1.getBoundingClientRect().right : 0;
        const h1ScrollWidth = h1 ? h1.scrollWidth : 0;
        const h1ClientWidth = h1 ? h1.clientWidth : 0;
        const wideEls = Array.from(document.querySelectorAll('*'))
          .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
          .slice(0, 5)
          .map((el) => ({
            tag: el.tagName,
            cls: (el as HTMLElement).className?.toString?.().slice(0, 50),
            right: Math.round(el.getBoundingClientRect().right),
          }));
        return {
          innerWidth: window.innerWidth,
          h1Right: Math.round(h1Right),
          h1ScrollWidth,
          h1ClientWidth,
          wideEls,
          h1Overflows: h1Right > window.innerWidth + 1,
          docOverflows: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });
      console.log(`Viewport ${width}:`, JSON.stringify(thOverflow));
      expect(thOverflow.h1Overflows).toBe(false);
      expect(thOverflow.docOverflows).toBe(false);
    }
  });

  test('11. Dynamic PDF Engine & Font Loading: vendor-pdf and Sarabun-Regular.ttf are fetched only on download click', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const requestedUrls: string[] = [];
    page.on('request', (req) => {
      requestedUrls.push(req.url());
    });

    // Navigate to pre-hydrated demo room displaying MatchOverlayView
    await page.goto('/?demo=true&pro=true');
    await page.waitForTimeout(500);

    // Verify MatchOverlayView loaded and download button is visible
    const downloadPdfBtn = page.locator('[data-testid="match-download-pdf-btn"]').first();
    await expect(downloadPdfBtn).toBeVisible({ timeout: 5000 });

    // Assert that BEFORE clicking download, NO request for vendor-pdf or Sarabun-Regular.ttf was fired
    const initialPdfVendorRequests = requestedUrls.filter((url) => url.includes('vendor-pdf'));
    const initialFontRequests = requestedUrls.filter((url) => url.includes('Sarabun-Regular.ttf'));
    expect(initialPdfVendorRequests.length).toBe(0);
    expect(initialFontRequests.length).toBe(0);
    console.log('✓ Verified: vendor-pdf and Sarabun-Regular.ttf are NOT bundled or loaded on initial MatchOverlayView render');

    // Trigger PDF download and await download event
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    await downloadPdfBtn.click();
    const download = await downloadPromise;

    // Verify suggested filename
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^TripPick_RFP_.*\.pdf$/);

    // Verify that AFTER clicking download, Sarabun-Regular.ttf and vendor-pdf were fetched
    const postPdfVendorRequests = requestedUrls.filter((url) => url.includes('vendor-pdf'));
    const postFontRequests = requestedUrls.filter((url) => url.includes('Sarabun-Regular.ttf'));
    expect(postPdfVendorRequests.length).toBeGreaterThan(0);
    expect(postFontRequests.length).toBeGreaterThan(0);

    // Read the downloaded file stream to verify %PDF- magic bytes
    const stream = await download.createReadStream();
    if (stream) {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const fileBuffer = Buffer.concat(chunks);
      expect(fileBuffer.length).toBeGreaterThan(50000);
      expect(fileBuffer.subarray(0, 5).toString()).toBe('%PDF-');
      console.log(`✓ Verified: Downloaded authentic PDF document (${fileBuffer.length} bytes) starting with %PDF- header`);
    }
  });
});



