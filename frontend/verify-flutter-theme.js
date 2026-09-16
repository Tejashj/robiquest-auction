const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\tejas\\.gemini\\antigravity-ide\\brain\\5ce1c970-20b3-4f3e-a188-156be91b9ce0';
const TARGET_URL = 'https://robiquest-auction.web.app';

async function runThemeVerification() {
  console.log('🚀 Running Playwright Flutter ThemeData Verification against ' + TARGET_URL);
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    // 1. Stadium Screen (Default view)
    console.log('1. Loading Stadium Screen...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'flutter_theme_stadium_screen.png'),
      fullPage: false,
    });
    console.log('📸 Captured flutter_theme_stadium_screen.png');

    // 2. Open Role Auth Gate Modal
    console.log('2. Opening Role Sign-In Modal...');
    await page.click('button:has-text("Official Login"), button:has-text("Role Sign-In")');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'flutter_theme_role_auth_modal.png'),
      fullPage: false,
    });
    console.log('📸 Captured flutter_theme_role_auth_modal.png');

    // 3. Authenticate as Franchise Bidder (TITAN101)
    console.log('3. Authenticating as Franchise Team...');
    await page.click('button:has-text("Franchise")');
    await page.waitForTimeout(600);
    await page.click('button:has-text("Auto-Fill")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Lock Terminal to")');
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'flutter_theme_franchise_cockpit.png'),
      fullPage: false,
    });
    console.log('📸 Captured flutter_theme_franchise_cockpit.png');

    // 4. Switch to Auctioneer Desk and authenticate
    console.log('4. Authenticating as Auctioneer Official...');
    await page.click('button:has-text("Auctioneer Desk")');
    await page.waitForTimeout(1000);
    
    // Fill admin PIN if prompted
    const quickFill = await page.$('button:has-text("Quick Fill"), button:has-text("Auto-Fill (ROBOCELL2026)")');
    if (quickFill) {
      await quickFill.click();
      await page.waitForTimeout(400);
      await page.click('button:has-text("Unlock Official Desk"), button:has-text("Unlock Auctioneer Console")');
      await page.waitForTimeout(1500);
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'flutter_theme_auctioneer_desk.png'),
      fullPage: false,
    });
    console.log('📸 Captured flutter_theme_auctioneer_desk.png');

    // 5. Open Contender CMS Studio
    console.log('5. Opening Contender CMS Studio...');
    const manageBtn = await page.$('button:has-text("Manage Contenders")');
    if (manageBtn) {
      await manageBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'flutter_theme_contender_studio.png'),
        fullPage: false,
      });
      console.log('📸 Captured flutter_theme_contender_studio.png');
    }

    console.log('🎉 Verification complete! All screenshots saved in artifact directory.');
  } catch (err) {
    console.error('❌ Verification error:', err);
  } finally {
    await browser.close();
  }
}

runThemeVerification();
