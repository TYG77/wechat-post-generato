const { chromium } = require('playwright');

async function openLOL() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  await page.goto('https://lol.qq.com');
  
  console.log('英雄联盟官网已成功打开！');
  
  // 保持浏览器打开
  await page.waitForTimeout(60000); // 等待60秒
  
  await browser.close();
}

openLOL().catch(console.error);