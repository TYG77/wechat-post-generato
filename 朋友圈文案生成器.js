#!/usr/bin/env node

/**
 * 朋友圈文案生成器
 * 每天生成7条文案，推送到飞书工作群
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 加载 prompt
const promptContent = fs.readFileSync(path.join(__dirname, '文案生成-prompt.txt'), 'utf8');

class WeChatPostGenerator {
  constructor() {
    this.config = {
      groupId: process.env.FEISHU_GROUP_ID || 'oc_c6064058c386334851ebf6ef97089d37',
      dataDir: path.join(__dirname, 'data'),
      // 豆包 API 配置
      doubaoApi: {
        apiKey: process.env.DOUBAO_API_KEY,
        endpointId: process.env.DOUBAO_ENDPOINT_ID,
        model: process.env.DOUBAO_MODEL || 'doubao-lite-128k'
      },
      // 飞书机器人配置
      feishu: {
        appId: process.env.FEISHU_APP_ID,
        appSecret: process.env.FEISHU_APP_SECRET
      }
    };

    // 确保数据目录存在
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }

  /**
   * 主流程
   */
  async run() {
    console.log('🎯 朋友圈文案生成器启动...');
    
    try {
      // 1. 生成文案
      console.log('📝 正在生成文案...');
      const posts = await this.generatePosts();
      
      // 2. 记录数据
      console.log('💾 正在记录数据...');
      await this.saveData(posts);
      
      // 3. 推送到飞书
      console.log('📢 正在推送到飞书...');
      await this.sendToLark(posts);
      
      console.log('✅ 完成！');
    } catch (error) {
      console.error('❌ 错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 生成文案
   */
  async generatePosts() {
    console.log('📝 正在调用 doubao-seed-2.0...');
    
    const { apiKey, endpointId, model } = this.config.doubaoApi;
    
    // 如果没有配置 API，先用模拟生成测试
    if (!apiKey || !endpointId || apiKey.includes('your_api_key_here')) {
      console.log('⚠️ 未配置 doubao API，使用测试数据');
      return this.generateMockPosts();
    }

    // 使用 HTTP 调用豆包 API
    try {
      console.log('📤 发送 prompt...');
      
      // 构建请求（使用 /responses 端点）
      const endpoint = `https://ark.cn-beijing.volces.com/api/v3/responses`;
      
      // 准备提示词
      const userPrompt = `请严格按照以下要求生成内容，只返回JSON格式，不要有其他文字：\n\n${promptContent}`;
      
      const requestBody = {
        model: 'doubao-seed-2-0-pro-260215',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: '你是一个专业的朋友圈文案助手，擅长生成温暖、有洞察力的文案。'
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: userPrompt
              }
            ]
          }
        ]
      };

      console.log('🔄 正在请求 AI 生成...');

      // 使用 fetch（Node.js 18+ 支持）
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API 响应失败:', response.status, errorText);
        throw new Error(`API 调用失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 API 返回数据:', JSON.stringify(data, null, 2));
      
      let aiResponse = '';
      
      // 解析 /responses 端点的响应格式
      if (data.output && data.output.length > 0) {
        // 找到 type 为 "message" 的输出项
        for (const outputItem of data.output) {
          if (outputItem.type === 'message' && outputItem.content && Array.isArray(outputItem.content)) {
            for (const contentItem of outputItem.content) {
              if (contentItem.type === 'output_text' && contentItem.text) {
                aiResponse = contentItem.text.trim();
                break;
              }
            }
            if (aiResponse) break;
          }
        }
      } else if (data.choices && data.choices.length > 0) {
        aiResponse = data.choices[0].message.content.trim();
      } else if (data.content) {
        aiResponse = data.content.trim();
      } else if (data.text) {
        aiResponse = data.text.trim();
      } else {
        throw new Error('无法解析 API 响应');
      }
      
      if (!aiResponse) {
        throw new Error('AI 返回内容为空');
      }
      
      console.log('✅ AI 回复已收到');
      
      // 尝试解析 JSON
      try {
        // 清理可能的 markdown 标记
        let jsonStr = aiResponse;
        if (jsonStr.includes('```json')) {
          jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
          jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }
        
        const result = JSON.parse(jsonStr);
        
        // 确保数据格式正确
        if (!result.date) result.date = new Date().toISOString().split('T')[0];
        if (!result.posts || !Array.isArray(result.posts)) {
          throw new Error('返回数据格式错误');
        }
        
        console.log('✨ 成功解析结果');
        return result;
        
      } catch (e) {
        console.log('⚠️ JSON 解析失败，尝试用测试数据');
        console.log('AI 原始回复:', aiResponse);
        return this.generateMockPosts();
      }

    } catch (error) {
      console.log('❌ 调用 API 失败:', error.message);
      console.log('使用测试数据代替');
      return this.generateMockPosts();
    }
  }

  /**
   * 生成模拟数据（用于测试）
   */
  generateMockPosts() {
    return {
      date: new Date().toISOString().split('T')[0],
      posts: [
        '🌟 今天的小确幸：阳光正好，微风不燥，努力的人运气不会太差～',
        '💼 专业不是炫技，是把简单的事重复做、重复的事用心做',
        '💰 赚钱不是目的，是拥有选择的权利和拒绝的勇气',
        '☕ 生活的美好，藏在每一个认真对待的当下',
        '🤔 我们无法改变风向，但可以调整风帆',
        '😂 成年人的世界，除了容易胖，其他都不容易',
        '📈 每天进步1%，一年后是37倍强！'
      ]
    };
  }

  /**
   * 保存数据
   */
  async saveData(posts) {
    const fileName = `posts-${posts.date}.json`;
    const filePath = path.join(this.config.dataDir, fileName);
    
    const data = {
      date: posts.date,
      timestamp: new Date().toISOString(),
      posts: posts.posts
    };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ 数据已保存到: ${filePath}`);
  }

  /**
   * 获取飞书 tenant_access_token
   */
  async getFeishuToken() {
    const { appId, appSecret } = this.config.feishu;
    
    if (!appId || !appSecret || appId.includes('your_app_id')) {
      console.log('⚠️ 未配置飞书 App ID/Secret');
      return null;
    }

    try {
      const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret
        })
      });

      const data = await response.json();
      if (data.code === 0) {
        return data.tenant_access_token;
      } else {
        console.log('❌ 获取飞书 Token 失败:', data.msg);
        return null;
      }
    } catch (error) {
      console.log('❌ 获取飞书 Token 异常:', error.message);
      return null;
    }
  }

  /**
   * 推送到飞书
   */
  async sendToLark(posts) {
    // 构建卡片消息
    const cardData = this.buildLarkCard(posts);
    
    console.log('📋 准备发送的卡片消息:');
    console.log(JSON.stringify(cardData, null, 2));
    
    // 获取 Token
    const token = await this.getFeishuToken();
    if (!token) {
      console.log('⚠️ 跳过飞书消息发送（未配置 App ID/Secret）');
      console.log(`📍 目标群: ${this.config.groupId}`);
      return;
    }

    try {
      console.log('🚀 正在发送到飞书群...');
      
      const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receive_id: this.config.groupId,
          msg_type: cardData.msg_type,
          content: JSON.stringify(cardData.card)
        })
      });

      const data = await response.json();
      if (data.code === 0) {
        console.log('✅ 飞书消息发送成功!');
        console.log(`📍 消息 ID: ${data.data.message_id}`);
      } else {
        console.log('❌ 飞书消息发送失败:', data.msg);
        console.log('   错误码:', data.code);
        console.log('💡 提示：请确认机器人已在群中，且有权限发送消息');
      }
    } catch (error) {
      console.log('❌ 发送飞书消息异常:', error.message);
    }
  }

  /**
   * 构建飞书卡片
   */
  buildLarkCard(posts) {
    const directions = ['🌟 励志', '💼 专业', '💰 赚钱', '☕ 生活', '🤔 思考', '😂 幽默', '📈 成长'];
    
    const content = posts.posts.map((post, index) => 
      `${directions[index]}\n${post}\n`
    ).join('\n');

    return {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true
        },
        header: {
          title: {
            tag: 'plain_text',
            content: `✨ ${posts.date} 朋友圈文案精选`
          }
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: content
            }
          },
          {
            tag: 'hr'
          },
          {
            tag: 'note',
            elements: [
              {
                tag: 'plain_text',
                content: '💡 小助理请从中挑选合适的文案发送朋友圈~'
              }
            ]
          }
        ]
      }
    };
  }
}

// 运行
if (require.main === module) {
  const generator = new WeChatPostGenerator();
  generator.run();
}

module.exports = WeChatPostGenerator;
