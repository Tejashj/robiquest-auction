const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\tejas\\.gemini\\antigravity-ide\\brain\\5ce1c970-20b3-4f3e-a188-156be91b9ce0';

async function runRobiQuestVerification() {
  console.log('🚀 Starting Playwright RobiQuest 4-Team Platform Verification...');
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
    // 1. Navigate to home
    console.log('1. Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Capture Auction Admin (Auctioneer Desk)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'robiquest_auction_admin.png'),
      fullPage: false,
    });
    console.log('📸 Captured robiquest_auction_admin.png');

    // 2. Click Franchise / Team Bidder tab
    console.log('2. Switching to Team Bidder Panel...');
    await page.click('button:has-text("Franchise Bidder")');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'robiquest_team_bidder.png'),
      fullPage: false,
    });
    console.log('📸 Captured robiquest_team_bidder.png');

    // 3. Click Stadium Projector (4K) tab
    console.log('3. Switching to Stadium Projector (4K)...');
    await page.click('button:has-text("Stadium Projector")');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'robiquest_stadium_4k.png'),
      fullPage: false,
    });
    console.log('📸 Captured robiquest_stadium_4k.png');

    console.log('✅ All RobiQuest verification screenshots captured successfully!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    await browser.close();
  }
}

runRobiQuestVerification();
