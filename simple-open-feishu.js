const { chromium } = require('playwright');

async function simpleOpenFeishu() {
  console.log('🚀 正在使用简单方法打开飞书...');
  
  try {
    // 使用最简单的配置启动浏览器
    const browser = await chromium.launch({ 
      headless: false,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // 设置较短的超时时间
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    console.log('✅ 浏览器启动成功');
    console.log('🌐 正在加载飞书页面...');
    
    // 直接打开飞书首页（不等待完全加载）
    await page.goto('https://www.feishu.cn', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ 飞书首页已打开');
    console.log('💡 请在浏览器中手动完成以下操作:');
    console.log('1. 点击右上角"登录"按钮');
    console.log('2. 输入您的飞书账号密码');
    console.log('3. 登录后点击"文档"进入文档管理');
    console.log('4. 查找任务板多维表格');
    
    // 保持浏览器打开
    console.log('⏰ 浏览器将保持打开，请完成您的操作...');
    
    // 简单的保持打开逻辑
    let keepOpen = true;
    const interval = setInterval(() => {
      if (keepOpen) {
        console.log('🔄 浏览器保持打开中...');
      }
    }, 30000); // 每30秒提示一次
    
    // 监听页面关闭事件
    page.on('close', () => {
      console.log('🔚 检测到页面关闭，准备结束程序...');
      keepOpen = false;
      clearInterval(interval);
    });
    
    // 等待用户操作，不自动关闭
    await new Promise(resolve => {
      // 用户可以通过关闭浏览器来结束程序
      page.on('close', resolve);
      
      // 或者等待较长时间后自动结束
      setTimeout(() => {
        if (keepOpen) {
          console.log('⏰ 长时间无操作，程序即将结束...');
          keepOpen = false;
          resolve();
        }
      }, 600000); // 10分钟后自动结束
    });
    
    console.log('🔚 关闭浏览器...');
    await browser.close();
    
  } catch (error) {
    console.error('❌ 打开飞书时出现错误:', error.message);
    console.log('💡 建议手动访问: https://www.feishu.cn');
  }
}

// 运行简单打开方法
simpleOpenFeishu().catch(console.error);