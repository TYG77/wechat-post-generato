const { chromium } = require('playwright');

async function openFeishu() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 打开飞书官网
  await page.goto('https://www.feishu.cn');
  console.log('飞书官网已打开');
  
  // 等待页面加载
  await page.waitForTimeout(3000);
  
  // 尝试点击登录按钮（如果有）
  try {
    await page.click('text=登录');
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('未找到登录按钮，继续访问文档');
  }
  
  // 直接访问飞书文档
  await page.goto('https://feishu.cn/drive/home');
  console.log('飞书文档首页已打开');
  
  // 等待页面加载
  await page.waitForTimeout(5000);
  
  console.log('请手动登录并找到任务板的多维表格');
  console.log('通常路径：文档 → 我的空间 → 找到包含多维表格的文档');
  
  // 保持浏览器打开更长时间以便操作
  await page.waitForTimeout(120000); // 等待2分钟
  
  await browser.close();
}

openFeishu().catch(console.error);