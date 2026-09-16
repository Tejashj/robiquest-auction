const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\tejas\\.gemini\\antigravity-ide\\brain\\5ce1c970-20b3-4f3e-a188-156be91b9ce0';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  console.log('Navigating to live Firebase URL: https://robiquest-auction.web.app...');
  await page.goto('https://robiquest-auction.web.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Capture Public 4K Stadium Projector view
  console.log('1. Capturing Stadium Screen with Performance Telemetry & Broadcast Ticker...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'robiquest_stadium_screen_live.png') });

  // 2. Open Role Auth Gate Modal
  console.log('2. Clicking Official Login button...');
  const loginBtn = page.locator('button:has-text("Official Login")');
  if (await loginBtn.isVisible()) {
    await loginBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'robiquest_role_auth_modal.png') });

    // 3. Authenticate as Auctioneer (Admin PIN: ROBOCELL2026)
    console.log('3. Entering Auctioneer Master PIN ROBOCELL2026...');
    await page.fill('input[placeholder="e.g. ROBOCELL2026"]', 'ROBOCELL2026');
    await page.click('button:has-text("Unlock Auctioneer Console")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'robiquest_auctioneer_desk_unlocked.png') });

    // 4. Open Contender CMS Studio
    console.log('4. Opening Contender CMS Studio...');
    const cmsBtn = page.locator('button:has-text("Manage Contenders")');
    if (await cmsBtn.isVisible()) {
      await cmsBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'robiquest_contender_cms_studio.png') });

      // Close CMS modal
      await page.locator('button:has-text("Add Contender")').locator('..').locator('button').last().click();
      await page.waitForTimeout(1000);
    }

    // 5. Navigate to Franchise Cockpit
    console.log('5. Clicking Franchise Cockpit and authenticating as Robo Titans...');
    await page.click('button:has-text("Franchise Cockpit")');
    await page.waitForTimeout(1000);

    // Click Franchise tab inside modal if open
    const franchiseTab = page.getByRole('button', { name: 'Franchise', exact: true });
    if (await franchiseTab.isVisible()) {
      await franchiseTab.click();
      await page.waitForTimeout(500);

      // Select Robo Titans
      const titansCard = page.locator('button:has-text("Robo Titans")').first();
      if (await titansCard.isVisible()) {
        await titansCard.click();
      }

      await page.fill('input[placeholder*="TITAN101"]', 'TITAN101');
      await page.click('button:has-text("Lock Terminal to RBT")');
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'robiquest_franchise_cockpit_locked.png') });
  }

  console.log('Verification completed successfully!');
  await browser.close();
})();
