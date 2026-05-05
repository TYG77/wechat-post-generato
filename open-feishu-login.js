const { chromium } = require('playwright');

async function openFeishuLogin() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized', '--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    // 启用持久化存储，避免重复登录
    storageState: 'feishu-auth.json'
  });
  
  const page = await context.newPage();
  
  console.log('🚀 正在打开飞书登录页面...');
  
  // 直接打开飞书登录页面
  await page.goto('https://www.feishu.cn/auth/?redirect_uri=https%3A%2F%2Fwww.feishu.cn%2Fdrive%2Fhome');
  
  console.log('✅ 飞书登录页面已打开');
  console.log('📝 登录提示:');
  console.log('1. 请在打开的浏览器窗口中输入您的飞书账号');
  console.log('2. 完成登录后，页面将跳转到飞书文档首页');
  console.log('3. 登录信息将自动保存，下次无需重复登录');
  
  // 等待登录页面加载
  await page.waitForTimeout(5000);
  
  // 检查是否已经登录
  try {
    const currentUrl = page.url();
    if (currentUrl.includes('drive/home')) {
      console.log('🎉 检测到您可能已经登录，正在跳转到文档首页...');
    } else {
      console.log('🔐 请手动完成登录操作...');
      
      // 等待用户手动登录
      await page.waitForTimeout(30000); // 等待30秒让用户登录
      
      // 保存登录状态
      await context.storageState({ path: 'feishu-auth.json' });
      console.log('💾 登录状态已保存');
    }
  } catch (error) {
    console.log('⚠️ 登录状态检查有异常，但继续执行:', error.message);
  }
  
  // 确保跳转到文档首页
  await page.goto('https://www.feishu.cn/drive/home');
  console.log('📁 飞书文档首页已打开');
  
  // 显示操作指南
  console.log('\n🎯 下一步操作指南:');
  console.log('1. 在左侧菜单中找到"我的空间"');
  console.log('2. 查找包含"任务板"或"多维表格"的文档');
  console.log('3. 点击进入即可查看和管理任务');
  
  // 保持浏览器打开更长时间
  console.log('\n⏰ 浏览器将保持打开5分钟，请完成您的操作...');
  await page.waitForTimeout(300000); // 等待5分钟
  
  console.log('🔚 会话即将结束，浏览器将关闭...');
  await browser.close();
}

openFeishuLogin().catch(error => {
  console.error('❌ 打开飞书时出现错误:', error.message);
  console.log('💡 可能的解决方案:');
  console.log('1. 检查网络连接');
  console.log('2. 确认飞书网站可访问');
  console.log('3. 尝试手动访问 https://www.feishu.cn');
});