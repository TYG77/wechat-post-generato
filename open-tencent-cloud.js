const { chromium } = require('playwright');

async function openTencentCloud() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  await page.goto('https://cloud.tencent.com');
  
  console.log('腾讯云网页已成功打开！');
  
  // 保持浏览器打开
  await page.waitForTimeout(60000); // 等待60秒
  
  await browser.close();
}

openTencentCloud().catch(console.error);