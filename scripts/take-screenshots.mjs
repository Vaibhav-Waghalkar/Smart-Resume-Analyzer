import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:5175';
const OUT_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

const THEMES = ['dark', 'light'];

async function run() {
  console.log(`Starting automated screenshot capture from: ${BASE_URL}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      console.log(`\n📸 Capturing ${vp.name} [${theme}]...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.name === 'mobile',
        hasTouch: vp.name === 'mobile'
      });
      const page = await context.newPage();

      // Go to base URL
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      // Apply theme in localStorage
      await page.evaluate((th) => {
        localStorage.setItem('sra_theme', th);
        if (th === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);

      await page.waitForTimeout(600);

      // 1. Landing Page
      await page.screenshot({
        path: path.join(OUT_DIR, `landing_${theme}_${vp.name}.png`),
        fullPage: false
      });
      console.log(`  ✓ landing_${theme}_${vp.name}.png`);

      // 2. Dashboard
      if (vp.name === 'mobile') {
        await page.click('nav.fixed button:has-text("Dashboard")');
      } else {
        await page.click('header nav button:has-text("Dashboard")');
      }
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(OUT_DIR, `dashboard_${theme}_${vp.name}.png`),
        fullPage: false
      });
      console.log(`  ✓ dashboard_${theme}_${vp.name}.png`);

      // 3. Resume Analyzer
      if (vp.name === 'mobile') {
        await page.click('nav.fixed button:has-text("Resume")');
      } else {
        await page.click('header nav button:has-text("Resume Analyzer")');
      }
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(OUT_DIR, `analyzer_${theme}_${vp.name}.png`),
        fullPage: false
      });
      console.log(`  ✓ analyzer_${theme}_${vp.name}.png`);

      // 4. Mock Interview Setup / Chat
      if (vp.name === 'mobile') {
        await page.click('nav.fixed button:has-text("Mock")');
      } else {
        await page.click('header nav button:has-text("Mock Interview")');
      }
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(OUT_DIR, `interview_${theme}_${vp.name}.png`),
        fullPage: false
      });
      console.log(`  ✓ interview_${theme}_${vp.name}.png`);

      // 5. Progress Page with Heatmap & Charts
      if (vp.name === 'mobile') {
        await page.click('nav.fixed button:has-text("Progress")');
      } else {
        await page.click('header nav button:has-text("Progress & Streaks")');
      }
      await page.waitForTimeout(700);
      await page.screenshot({
        path: path.join(OUT_DIR, `progress_${theme}_${vp.name}.png`),
        fullPage: false
      });
      console.log(`  ✓ progress_${theme}_${vp.name}.png`);

      await context.close();
    }
  }

  await browser.close();
  console.log(`\n🎉 All screenshots saved successfully to ${OUT_DIR}`);
}

run().catch((err) => {
  console.error('Screenshot generation error:', err);
  process.exit(1);
});
