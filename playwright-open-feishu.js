const { chromium } = require('playwright');

console.log('🚀 明确使用 Playwright 打开飞书...');
console.log('📋 Playwright 版本:', require('playwright/package.json').version);

async function playwrightOpenFeishu() {
  let browser = null;
  
  try {
    console.log('1. 正在启动 Playwright 浏览器...');
    
    // 明确使用 Playwright 启动浏览器
    browser = await chromium.launch({
      headless: false,
      executablePath: 'C:\\Users\\Administrator.SY-202401121900\\AppData\\Local\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe',
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    console.log('✅ Playwright 浏览器启动成功');
    
    console.log('2. 创建页面上下文...');
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    console.log('3. 使用 Playwright 导航到飞书...');
    await page.goto('https://www.feishu.cn', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('✅ 飞书页面加载成功');
    console.log('📊 当前URL:', page.url());
    
    console.log('4. Playwright 功能验证:');
    
    // 验证 Playwright 功能
    const title = await page.title();
    console.log('   - 页面标题:', title);
    
    const url = page.url();
    console.log('   - 当前URL:', url);
    
    console.log('🎯 Playwright 功能完全可用！');
    
    console.log('\n📋 下一步操作:');
    console.log('1. 在浏览器中登录飞书');
    console.log('2. 访问开放平台获取 App ID 和 Secret');
    console.log('3. 配置 Lark MCP 插件');
    
    // 保持浏览器打开
    console.log('\n⏰ Playwright 浏览器将保持打开...');
    
    // 简单的保持打开逻辑
    await new Promise((resolve) => {
      // 监听页面关闭
      page.on('close', () => {
        console.log('🔚 检测到页面关闭');
        resolve();
      });
      
      // 10分钟后自动结束
      setTimeout(() => {
        console.log('⏰ 长时间运行结束');
        resolve();
      }, 600000);
    });
    
  } catch (error) {
    console.error('❌ Playwright 执行错误:', error.message);
    
    // 尝试使用默认路径
    console.log('💡 尝试使用默认浏览器路径...');
    
    if (browser) {
      await browser.close();
    }
    
    // 重新尝试
    await retryWithDefaultPath();
    
  } finally {
    if (browser) {
      console.log('🔚 关闭 Playwright 浏览器...');
      await browser.close();
    }
  }
}

async function retryWithDefaultPath() {
  console.log('🔄 使用默认路径重试...');
  
  try {
    const browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    await page.goto('https://www.feishu.cn');
    
    console.log('✅ 使用默认路径成功打开飞书');
    
    // 保持打开
    await new Promise(resolve => setTimeout(resolve, 300000));
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ 重试失败:', error.message);
  }
}

// 执行 Playwright 打开
playwrightOpenFeishu().catch(error => {
  console.error('Playwright 执行失败:', error);
});