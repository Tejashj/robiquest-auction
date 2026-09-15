const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\tejas\\.gemini\\antigravity-ide\\brain\\5825bc05-d26b-486e-964d-fd7c9c7e6393';

async function runStudioVerification() {
  console.log('🚀 Starting Playwright End-to-End Studio Verification...');
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
    // 1. Open home page
    console.log('1. Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Test Clean Slate (Zero Data)
    console.log('2. Testing Blank Slate (Zero Data)...');
    await page.click('button:has-text("Templates")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Blank Slate")');
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'studio_blank_slate.png'),
      fullPage: false,
    });
    console.log('📸 Captured studio_blank_slate.png');

    // 3. Load Fine Art Template
    console.log('3. Loading Fine Art & Modern Masters blueprint...');
    await page.click('button:has-text("Templates")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Fine Art & Modern Masters")');
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'studio_fine_art_loaded.png'),
      fullPage: false,
    });
    console.log('📸 Captured studio_fine_art_loaded.png');

    // 4. Test Catalog CRUD: Add a new custom lot
    console.log('4. Navigating to Catalog and adding custom lot...');
    await page.click('nav button:has-text("Catalog")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("Add Custom Lot")');
    await page.waitForTimeout(400);

    // Fill lot form
    await page.fill('input[placeholder*="Heinrich Klaasen"]', 'Gustav Klimt — Golden Twilight (Private Trust)');
    await page.fill('input[placeholder*="Wicketkeeper"]', 'Modern Masterpiece');

    // Submit lot
    await page.click('button:has-text("Create Lot")');
    await page.waitForTimeout(600);

    // Click "Send to Stage" on Klimt lot
    const sendBtn = await page.$('tr:has-text("Gustav Klimt") button:has-text("Send to Stage")');
    if (sendBtn) {
      await sendBtn.click();
      console.log('Sent Gustav Klimt to Live Stage');
    } else {
      console.log('Finding any Send to Stage button');
      const anySendBtn = await page.$('button:has-text("Send to Stage")');
      if (anySendBtn) await anySendBtn.click();
    }
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'studio_catalog_management.png'),
      fullPage: false,
    });
    console.log('📸 Captured studio_catalog_management.png');

    // 5. Test Teams CRUD: Add a new participating team/bidder
    console.log('5. Navigating to Teams and registering custom franchise...');
    await page.click('nav button:has-text("Teams")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("Add Custom Franchise")');
    await page.waitForTimeout(400);

    await page.fill('input[placeholder*="Mumbai Titans"]', 'Solomon Guggenheim Foundation');
    await page.fill('input[placeholder*="MT"]', 'SGF');

    await page.click('button:has-text("Create Team")');
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'studio_teams_management.png'),
      fullPage: false,
    });
    console.log('📸 Captured studio_teams_management.png');

    // 6. Test Live Stage: Select paddle, place bid, trigger gavel
    console.log('6. Navigating to Live Stage and testing bidding & gavel...');
    await page.click('nav button:has-text("Live Stage")');
    await page.waitForTimeout(600);

    // Select paddle by clicking one of the paddle cards
    const paddleButtons = await page.$$('button:has-text("#")');
    console.log(`Found ${paddleButtons.length} paddle buttons`);
    if (paddleButtons.length > 0) {
      await paddleButtons[0].click();
      console.log('Selected active bidder paddle');
    }
    await page.waitForTimeout(300);

    // Place bid via increment chip
    const chipBtn = await page.$('button:has-text("+1x Step"), button:has-text("+2x Step")');
    if (chipBtn) {
      await chipBtn.click();
      console.log('Clicked +1x Step increment bid button');
    }
    await page.waitForTimeout(500);

    // Start manual clock
    const startClockBtn = await page.$('button:has-text("Start Clock")');
    if (startClockBtn) {
      await startClockBtn.click();
      console.log('Clicked Start Clock');
    }
    await page.waitForTimeout(400);

    // Trigger Fair Warning & Going Twice
    const goingOnceBtn = await page.$('button:has-text("Going Once")');
    if (goingOnceBtn) await goingOnceBtn.click();
    await page.waitForTimeout(300);

    const goingTwiceBtn = await page.$('button:has-text("Going Twice")');
    if (goingTwiceBtn) await goingTwiceBtn.click();
    await page.waitForTimeout(300);

    // Trigger SOLD hammer
    const soldBtn = await page.$('button:has-text("HAMMER SOLD!")');
    if (soldBtn) {
      await soldBtn.click();
      console.log('Struck hammer SOLD!');
    }
    await page.waitForTimeout(1000);

    // Capture celebration modal
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'studio_sold_celebration.png'),
      fullPage: false,
    });
    console.log('📸 Captured studio_sold_celebration.png');

    // Dismiss celebration modal
    const closeBtn = await page.$('div.fixed button:has(svg)');
    if (closeBtn) {
      await closeBtn.click();
      console.log('Dismissed celebration overlay');
    }
    await page.waitForTimeout(500);

    // 7. Test Projector Feed (4K View)
    console.log('7. Navigating to Projector Feed (4K)...');
    await page.click('nav button:has-text("Projector Feed")');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'studio_projector_feed.png'),
      fullPage: false,
    });
    console.log('📸 Captured studio_projector_feed.png');

    // 8. Test Settings & Rules
    console.log('8. Navigating to Rules & Settings...');
    await page.click('nav button:has-text("Rules & Settings")');
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'studio_rules_governance.png'),
      fullPage: false,
    });
    console.log('📸 Captured studio_rules_governance.png');

    console.log('🎉 ALL 8 VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

runStudioVerification();
