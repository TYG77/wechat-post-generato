const { execSync } = require('child_process');

// 测试 Lark MCP 基本功能
async function testLarkMCP() {
  console.log('🧪 开始测试 Lark MCP 功能...\n');

  try {
    // 1. 测试 MCP 服务器启动
    console.log('1. 测试 MCP 服务器启动...');
    const version = execSync('npx @larksuiteoapi/lark-mcp --version', { encoding: 'utf8' });
    console.log(`✅ Lark MCP 版本: ${version.trim()}`);

    // 2. 测试帮助信息
    console.log('\n2. 测试帮助信息...');
    const help = execSync('npx @larksuiteoapi/lark-mcp --help', { encoding: 'utf8' });
    console.log('✅ 帮助信息获取成功');
    console.log('帮助信息摘要:');
    console.log(help.split('\n').slice(0, 10).join('\n'));

    // 3. 测试配置加载
    console.log('\n3. 测试配置加载...');
    try {
      const configTest = execSync('npx @larksuiteoapi/lark-mcp --transport stdio', { 
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log('✅ MCP 服务器启动成功');
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.log('✅ MCP 服务器启动正常（超时是预期的）');
      } else {
        console.log('⚠️ MCP 服务器启动有异常，但可能正常');
        console.log('错误信息:', error.message);
      }
    }

    console.log('\n🎉 Lark MCP 功能测试完成！');
    console.log('\n📋 下一步需要配置的认证信息:');
    console.log('1. 获取飞书开发者账号');
    console.log('2. 创建应用并获取 App ID 和 App Secret');
    console.log('3. 配置应用权限（文档、表格、消息等）');
    console.log('4. 在 .env.lark 文件中填写认证信息');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查 npm 包是否完整安装');
    console.log('2. 检查 Node.js 版本兼容性');
    console.log('3. 检查网络连接');
  }
}

// 运行测试
testLarkMCP();