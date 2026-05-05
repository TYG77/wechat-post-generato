const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 8080;

// 创建一个简单的服务器，用于保持应用运行
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('朋友圈文案生成器正在运行！\n\n每天早上9点自动生成并推送文案到飞书群。');
});

server.listen(PORT, () => {
  console.log(`✅ 服务器已启动，端口: ${PORT}`);
  console.log('📅 正在初始化定时任务...');
  
  // 立即运行一次生成
  runGenerator();
  
  // 设置定时任务：每天早上9点运行
  setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 每天早上9点整运行
    if (hours === 9 && minutes === 0) {
      console.log('⏰ 定时任务触发，正在生成文案...');
      runGenerator();
    }
  }, 60000); // 每分钟检查一次
  
  console.log('✅ 定时任务已设置，每天9点自动运行');
});

function runGenerator() {
  const scriptPath = path.join(__dirname, 'wechat-post-generator.js');
  console.log('🚀 正在运行文案生成器...');
  
  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ 生成失败:', error);
      return;
    }
    if (stderr) {
      console.error('⚠️ 警告:', stderr);
    }
    console.log('✅ 生成完成:', stdout);
  });
}
