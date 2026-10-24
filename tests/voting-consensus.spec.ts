import { test, expect } from '@playwright/test';

test.describe('Voting & Consensus Engine Suite', () => {
  test('Solo user passes on all cards -> never shows 6/5 and allows confirming top AI venue', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');

    // 1. Create Room
    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 2. Profile
    const nameInput = page.locator('[data-testid="user-name-input"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Solo Host');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await enterLobbyBtn.click();

    // 3. Lobby -> Start Session
    const startSessionBtn = page.locator('button:has-text("Start Swiping"), button:has-text("เริ่มเซสชัน")').first();
    await expect(startSessionBtn).toBeVisible({ timeout: 10000 });
    await startSessionBtn.click();

    // 4. Wait for Swiper deck
    await expect(page.locator('text=1 /')).toBeVisible({ timeout: 25000 });

    // 5. Pass on all cards until the deck is complete
    while (true) {
      const passBtn = page.locator('button:has-text("ผ่าน"), button:has-text("Pass")').first();
      if ((await passBtn.count()) === 0) break;
      await passBtn.click();
      await page.waitForTimeout(400);
    }

    // 6. Verify 6 / 5 NEVER exists
    await page.waitForTimeout(500);
    const counter6of5 = page.locator('text=6 / 5');
    expect(await counter6of5.count()).toBe(0);

    // 7. Verify solo user is NOT stuck on "รอสมาชิกท่านอื่น"
    const pageText = await page.content();
    expect(pageText.includes('ระบบกำลังรอสมาชิกท่านอื่น')).toBe(false);

    // 8. Verify Round Complete card with Top AI recommendation is visible
    const topVenueBtn = page.locator('[data-testid="select-top-venue-btn"]');
    await expect(topVenueBtn).toBeVisible();
    await expect(page.locator('text=สิ้นสุดรอบการโหวต')).toBeVisible();

    // 9. Clicking confirm top venue transitions directly to MatchOverlayView
    await topVenueBtn.click();
    await expect(page.locator('text=บรรลุฉันทามติเอกฉันท์ 100%!')).toBeVisible({ timeout: 5000 });
    console.log('✓ Solo user pass flow verified: zero 6/5 overflow, zero waiting-for-others hang, smooth top pick confirmation');
  });

  test('Solo user: liking a destination immediately triggers Unanimous Match Overlay', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');

    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await createBtn.click();

    const nameInput = page.locator('[data-testid="user-name-input"]');
    await nameInput.fill('Solo Liker');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await enterLobbyBtn.click();

    const startSessionBtn = page.locator('button:has-text("Start Swiping"), button:has-text("เริ่มเซสชัน")').first();
    await expect(startSessionBtn).toBeVisible({ timeout: 10000 });
    await startSessionBtn.click();

    await expect(page.locator('text=1 /')).toBeVisible({ timeout: 25000 });

    // Like first destination
    const likeBtn = page.locator('button:has-text("ถูกใจ"), button:has-text("Like")').first();
    await expect(likeBtn).toBeVisible();
    await likeBtn.click();

    // Verify Match Overlay appeared
    await expect(page.locator('text=บรรลุฉันทามติเอกฉันท์ 100%!')).toBeVisible({ timeout: 5000 });
    console.log('✓ Solo liking triggers immediate 100% consensus match');
  });

  test('Reset session returns room to lobby and resets swipes cleanly', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');

    const createBtn = page.locator('[data-testid="create-room-btn"]');
    await createBtn.click();

    const nameInput = page.locator('[data-testid="user-name-input"]');
    await nameInput.fill('Reset Tester');

    const enterLobbyBtn = page.locator('[data-testid="enter-lobby-btn"]');
    await enterLobbyBtn.click();

    const startSessionBtn = page.locator('button:has-text("Start Swiping"), button:has-text("เริ่มเซสชัน")').first();
    await expect(startSessionBtn).toBeVisible({ timeout: 10000 });
    await startSessionBtn.click();

    await expect(page.locator('text=1 /')).toBeVisible({ timeout: 25000 });

    // Pass all cards to reach the round complete view
    while (true) {
      const passBtn = page.locator('button:has-text("ผ่าน"), button:has-text("Pass")').first();
      if ((await passBtn.count()) === 0) break;
      await passBtn.click();
      await page.waitForTimeout(400);
    }

    // Click restart round button
    const restartBtn = page.locator('[data-testid="restart-round-btn"]');
    await expect(restartBtn).toBeVisible();
    await restartBtn.click();

    // Verify back in Lobby
    await expect(page.locator('button:has-text("Start Swiping"), button:has-text("เริ่มเซสชัน")').first()).toBeVisible({ timeout: 5000 });
    console.log('✓ Reset session successfully moves back to lobby cleanly');
  });
});
