import requests
import json

class AIService:
    def __init__(self, api_type='doubao', api_key=None):
        self.api_type = api_type
        self.api_key = api_key
    
    def generate_topics(self, keywords, count=10):
        """AI生成选题建议"""
        if self.api_type == 'doubao' and self.api_key:
            return self._doubao_generate_topics(keywords, count)
        elif self.api_type == 'openai' and self.api_key:
            return self._openai_generate_topics(keywords, count)
        else:
            return self._default_generate_topics(keywords, count)
    
    def generate_article(self, topic, length='medium'):
        """AI生成文章内容"""
        if self.api_type == 'doubao' and self.api_key:
            return self._doubao_generate_article(topic, length)
        elif self.api_type == 'openai' and self.api_key:
            return self._openai_generate_article(topic, length)
        else:
            return self._default_generate_article(topic, length)
    
    def _doubao_generate_topics(self, keywords, count):
        """使用豆包API生成选题"""
        try:
            url = "https://api.doubao.com/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            prompt = f"请为我生成{count}个关于'{keywords}'的微信公众号选题建议，要求新颖有吸引力，每个选题单独一行。"
            data = {
                "model": "Doubao",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8
            }
            response = requests.post(url, headers=headers, json=data, timeout=30)
            result = response.json()
            if 'choices' in result:
                content = result['choices'][0]['message']['content']
                topics = [t.strip() for t in content.split('\n') if t.strip()]
                return topics[:count]
            return []
        except Exception as e:
            print(f"豆包API调用失败: {e}")
            return self._default_generate_topics(keywords, count)
    
    def _openai_generate_topics(self, keywords, count):
        """使用OpenAI API生成选题"""
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            prompt = f"请为我生成{count}个关于'{keywords}'的微信公众号选题建议，要求新颖有吸引力，每个选题单独一行。"
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8
            }
            response = requests.post(url, headers=headers, json=data, timeout=30)
            result = response.json()
            if 'choices' in result:
                content = result['choices'][0]['message']['content']
                topics = [t.strip() for t in content.split('\n') if t.strip()]
                return topics[:count]
            return []
        except Exception as e:
            print(f"OpenAI API调用失败: {e}")
            return self._default_generate_topics(keywords, count)
    
    def _default_generate_topics(self, keywords, count):
        """默认生成选题（模拟AI）"""
        templates = [
            f"{keywords}最新趋势分析",
            f"{keywords}入门指南",
            f"{keywords}实用技巧分享",
            f"{keywords}常见问题解答",
            f"{keywords}案例分析",
            f"如何快速掌握{keywords}",
            f"{keywords}学习心得分享",
            f"{keywords}避坑指南",
            f"{keywords}行业洞察",
            f"{keywords}深度解析",
            f"{keywords}实战经验总结",
            f"{keywords}入门到精通",
            f"{keywords}干货分享",
            f"{keywords}误区解读",
            f"{keywords}未来发展展望"
        ]
        return templates[:count]
    
    def _doubao_generate_article(self, topic, length):
        """使用豆包API生成文章"""
        try:
            url = "https://api.doubao.com/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            length_desc = {'short': '简短（约300字）', 'medium': '中等（约800字）', 'long': '详细（约1500字）'}
            prompt = f"请帮我写一篇关于'{topic}'的微信公众号文章，字数{length_desc[length]}，结构清晰，语言口语化，使用小标题分隔内容，结尾要有总结和互动引导。"
            data = {
                "model": "Doubao",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7
            }
            response = requests.post(url, headers=headers, json=data, timeout=60)
            result = response.json()
            if 'choices' in result:
                return result['choices'][0]['message']['content'].strip()
            return ""
        except Exception as e:
            print(f"豆包API调用失败: {e}")
            return self._default_generate_article(topic, length)
    
    def _openai_generate_article(self, topic, length):
        """使用OpenAI API生成文章"""
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            length_desc = {'short': '简短（约300字）', 'medium': '中等（约800字）', 'long': '详细（约1500字）'}
            prompt = f"请帮我写一篇关于'{topic}'的微信公众号文章，字数{length_desc[length]}，结构清晰，语言口语化，使用小标题分隔内容，结尾要有总结和互动引导。"
            data = {
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7
            }
            response = requests.post(url, headers=headers, json=data, timeout=60)
            result = response.json()
            if 'choices' in result:
                return result['choices'][0]['message']['content'].strip()
            return ""
        except Exception as e:
            print(f"OpenAI API调用失败: {e}")
            return self._default_generate_article(topic, length)
    
    def _default_generate_article(self, topic, length):
        """默认生成文章（模拟AI）"""
        articles = {
            'short': f"""## {topic}入门指南

大家好，今天来和大家聊聊{topic}。

### 什么是{topic}？
{topic}是近年来非常热门的一个话题，它涉及到我们生活的方方面面。

### 为什么要学习{topic}？
学习{topic}有很多好处，比如可以提升效率、增加知识储备等等。

### 如何入门{topic}？
入门{topic}其实很简单，关键在于持续学习和实践。

希望今天的分享对你有帮助！欢迎在评论区留言交流！""",
            'medium': f"""## {topic}入门到精通：一篇文章讲清楚

大家好！今天我们来深入聊聊{topic}这个话题。

### 一、{topic}是什么？
{topic}是当前非常热门的一个领域，越来越多的人开始关注和学习它。简单来说，{topic}就是...

### 二、为什么要学习{topic}？
学习{topic}有很多好处：提升效率、增加竞争力、开阔视野。

### 三、如何快速入门{topic}？
入门{topic}并不难，关键在于方法：基础学习、实践操作、持续学习。

### 四、学习{topic}的误区
- 急于求成，忽视基础
- 只学不用，缺乏实践

### 总结
{topic}是一个值得深入学习的领域。如果你觉得这篇文章有帮助，欢迎点赞转发！""",
            'long': f"""## {topic}深度解析：从入门到精通的完整指南

大家好！今天我来给大家做一个{topic}的全面入门指南。

### 第一章：{topic}概述
{topic}是一个广泛的概念，它涵盖了多个方面。在当今数字化时代，{topic}变得越来越重要。

### 第二章：{topic}入门指南
学习{topic}需要做好准备：明确目标、了解学习路径、准备学习资源。

### 第三章：进阶学习与提升
当你掌握了基础知识后，可以开始深入学习高级概念和最佳实践。

### 第四章：常见问题解答
Q：零基础可以学习{topic}吗？A：当然可以！只要有学习的热情和耐心。

### 总结
学习{topic}是一个长期的过程，需要耐心和坚持。欢迎在评论区留下你的学习心得！"""
        }
        return articles.get(length, articles['medium']).strip()
