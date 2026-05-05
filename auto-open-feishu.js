const { chromium } = require('playwright');

class FeishuAutoOpener {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  // 初始化浏览器
  async initBrowser() {
    try {
      console.log('🚀 正在启动浏览器...');
      
      // 使用最新安装的浏览器
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--start-maximized',
          '--disable-web-security',
          '--disable-features=TranslateUI',
          '--disable-component-extensions-with-background-pages'
        ]
      });

      // 创建上下文，启用持久化存储
      const context = await this.browser.newContext({
        viewport: { width: 1400, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      this.page = await context.newPage();
      
      // 设置超时时间
      this.page.setDefaultTimeout(60000);
      this.page.setDefaultNavigationTimeout(60000);
      
      console.log('✅ 浏览器启动成功');
      return true;
      
    } catch (error) {
      console.error('❌ 浏览器启动失败:', error.message);
      return false;
    }
  }

  // 打开飞书并自动登录
  async openFeishuWithAutoLogin() {
    if (!this.page) {
      console.log('⚠️ 请先初始化浏览器');
      return false;
    }

    try {
      console.log('🌐 正在打开飞书...');
      
      // 直接打开飞书文档首页
      await this.page.goto('https://www.feishu.cn/drive/home', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });

      console.log('✅ 飞书页面已加载');

      // 检查是否已登录
      const currentUrl = this.page.url();
      if (currentUrl.includes('auth') || currentUrl.includes('login')) {
        console.log('🔐 检测到需要登录，请在浏览器中完成登录操作');
        console.log('💡 登录完成后，页面将自动跳转到文档首页');
        
        // 等待用户手动登录
        await this.waitForLogin();
      } else {
        console.log('🎉 检测到您已登录，直接进入文档首页');
        this.isLoggedIn = true;
      }

      // 导航到文档管理界面
      await this.navigateToDocuments();
      
      return true;
      
    } catch (error) {
      console.error('❌ 打开飞书失败:', error.message);
      return false;
    }
  }

  // 等待用户登录
  async waitForLogin() {
    console.log('⏳ 等待登录完成...');
    
    try {
      // 等待页面跳转到文档首页
      await this.page.waitForFunction(
        () => window.location.href.includes('drive/home'),
        { timeout: 180000 } // 等待3分钟
      );
      
      this.isLoggedIn = true;
      console.log('✅ 登录完成');
      
    } catch (error) {
      console.log('⚠️ 登录等待超时，但继续执行');
    }
  }

  // 导航到文档管理
  async navigateToDocuments() {
    try {
      console.log('📁 正在导航到文档管理...');
      
      // 确保在文档首页
      if (!this.page.url().includes('drive/home')) {
        await this.page.goto('https://www.feishu.cn/drive/home');
      }

      // 等待页面完全加载
      await this.page.waitForTimeout(5000);

      console.log('🎯 文档管理界面已打开');
      console.log('\n📋 操作指南:');
      console.log('1. 在左侧菜单中找到"我的空间"');
      console.log('2. 查找包含"任务板"或"多维表格"的文档');
      console.log('3. 点击进入即可管理任务');
      
      return true;
      
    } catch (error) {
      console.error('❌ 导航失败:', error.message);
      return false;
    }
  }

  // 查找任务板多维表格
  async findTaskBoard() {
    if (!this.isLoggedIn) {
      console.log('⚠️ 请先完成登录');
      return false;
    }

    try {
      console.log('🔍 正在查找任务板...');
      
      // 尝试搜索任务板
      await this.page.click('[data-testid="search-input"]');
      await this.page.fill('[data-testid="search-input"]', '任务板');
      await this.page.keyboard.press('Enter');
      
      await this.page.waitForTimeout(3000);
      
      console.log('✅ 搜索完成，请查看搜索结果');
      return true;
      
    } catch (error) {
      console.log('⚠️ 自动搜索失败，请手动查找');
      return false;
    }
  }

  // 保持浏览器打开
  async keepBrowserOpen() {
    console.log('⏰ 浏览器将保持打开10分钟...');
    console.log('💡 完成操作后，浏览器将自动关闭');
    
    await this.page.waitForTimeout(600000); // 10分钟
    
    console.log('🔚 会话结束，关闭浏览器...');
    await this.close();
  }

  // 关闭浏览器
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ 浏览器已关闭');
    }
  }

  // 主执行函数
  async run() {
    console.log('🚀 开始全自动化飞书打开流程...\n');

    // 1. 初始化浏览器
    if (!await this.initBrowser()) {
      return;
    }

    // 2. 打开飞书并处理登录
    if (!await this.openFeishuWithAutoLogin()) {
      await this.close();
      return;
    }

    // 3. 尝试查找任务板
    await this.findTaskBoard();

    // 4. 保持浏览器打开
    await this.keepBrowserOpen();
  }
}

// 创建实例并运行
const feishuOpener = new FeishuAutoOpener();

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('未处理的错误:', error);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

// 执行自动化流程
feishuOpener.run().catch(error => {
  console.error('自动化流程执行失败:', error);
  process.exit(1);
});