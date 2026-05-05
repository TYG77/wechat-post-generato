from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from wechatpy import WeChatClient
from wechatpy.exceptions import WeChatClientException
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os
from ai_service import AIService

app = Flask(__name__)
app.config.from_pyfile('config.py')

engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
Base = declarative_base()
Session = sessionmaker(bind=engine)
db_session = Session()

class Topic(Base):
    __tablename__ = 'topics'
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(20), default='pending')
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(DateTime, default=datetime.datetime.now)

class Article(Base):
    __tablename__ = 'articles'
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    summary = Column(String(500))
    cover_image = Column(String(500))
    status = Column(String(20), default='draft')
    topic_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(DateTime, default=datetime.datetime.now)

Base.metadata.create_all(engine)

wechat_client = None
ai_service = None

def init_wechat_client():
    global wechat_client
    try:
        wechat_client = WeChatClient(
            app.config['WECHAT_APP_ID'],
            app.config['WECHAT_APP_SECRET']
        )
        return True
    except Exception as e:
        print(f"微信客户端初始化失败: {e}")
        return False

def init_ai_service():
    global ai_service
    api_key = app.config.get('DOUBAN_API_KEY') or app.config.get('OPENAI_API_KEY')
    if app.config.get('DOUBAN_API_KEY'):
        ai_service = AIService(api_type='doubao', api_key=api_key)
    elif app.config.get('OPENAI_API_KEY'):
        ai_service = AIService(api_type='openai', api_key=api_key)
    else:
        ai_service = AIService(api_type='default')
    return ai_service

@app.route('/')
def index():
    topics = db_session.query(Topic).order_by(Topic.created_at.desc()).all()
    articles = db_session.query(Article).order_by(Article.created_at.desc()).all()
    return render_template('index.html', topics=topics, articles=articles)

@app.route('/topic/add', methods=['POST'])
def add_topic():
    data = request.get_json()
    topic = Topic(
        title=data['title'],
        description=data.get('description', '')
    )
    db_session.add(topic)
    db_session.commit()
    return jsonify({'success': True, 'topic': {'id': topic.id, 'title': topic.title}})

@app.route('/topic/<int:topic_id>/approve', methods=['POST'])
def approve_topic(topic_id):
    topic = db_session.query(Topic).get(topic_id)
    if topic:
        topic.status = 'approved'
        topic.updated_at = datetime.datetime.now()
        db_session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': '选题不存在'})

@app.route('/editor')
def editor():
    topic_id = request.args.get('topic_id')
    article_id = request.args.get('article_id')
    topic = None
    if topic_id:
        topic = db_session.query(Topic).get(topic_id)
    return render_template('editor.html', topic=topic, article_id=article_id)

@app.route('/article/save', methods=['POST'])
def save_article():
    data = request.get_json()
    article_id = data.get('id')
    
    if article_id:
        article = db_session.query(Article).get(article_id)
    else:
        article = Article()
    
    article.title = data['title']
    article.content = data['content']
    article.summary = data.get('summary', '')
    article.cover_image = data.get('cover_image', '')
    article.topic_id = data.get('topic_id')
    article.updated_at = datetime.datetime.now()
    
    if not article_id:
        db_session.add(article)
    
    db_session.commit()
    return jsonify({'success': True, 'article_id': article.id})

@app.route('/article/<int:article_id>')
def get_article(article_id):
    article = db_session.query(Article).get(article_id)
    if article:
        return jsonify({
            'id': article.id,
            'title': article.title,
            'content': article.content,
            'summary': article.summary,
            'cover_image': article.cover_image,
            'topic_id': article.topic_id
        })
    return jsonify({'success': False, 'message': '文章不存在'})

@app.route('/publish')
def publish_page():
    articles = db_session.query(Article).filter(Article.status.in_(['ready', 'draft'])).all()
    return render_template('publish.html', articles=articles)

@app.route('/publish/submit', methods=['POST'])
def submit_article():
    data = request.get_json()
    article_id = data['article_id']
    
    article = db_session.query(Article).get(article_id)
    if not article:
        return jsonify({'success': False, 'message': '文章不存在'})
    
    if not wechat_client and not init_wechat_client():
        return jsonify({'success': False, 'message': '微信客户端初始化失败，请检查配置'})
    
    try:
        article.status = 'ready'
        db_session.commit()
        return jsonify({'success': True, 'media_id': 'draft_created'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'提交失败: {str(e)}'})

@app.route('/publish/send', methods=['POST'])
def send_article():
    data = request.get_json()
    article_id = data['article_id']
    
    article = db_session.query(Article).get(article_id)
    if not article:
        return jsonify({'success': False, 'message': '文章不存在'})
    
    if not wechat_client and not init_wechat_client():
        return jsonify({'success': False, 'message': '微信客户端初始化失败，请检查配置'})
    
    try:
        result = wechat_client.material.add_news({
            'articles': [{
                'title': article.title,
                'thumb_media_id': '',
                'author': '',
                'digest': article.summary,
                'show_cover_pic': 1 if article.cover_image else 0,
                'content': article.content,
                'content_source_url': ''
            }]
        })
        
        article.status = 'published'
        db_session.commit()
        return jsonify({'success': True, 'result': result})
    except WeChatClientException as e:
        return jsonify({'success': False, 'message': f'微信API错误: {e.message}'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'发布失败: {str(e)}'})

@app.route('/ai/topic', methods=['POST'])
def ai_topic():
    data = request.get_json()
    keywords = data.get('keywords', '')
    count = data.get('count', 10)
    
    if not ai_service:
        init_ai_service()
    
    suggestions = ai_service.generate_topics(keywords, count)
    return jsonify({'success': True, 'suggestions': suggestions})

@app.route('/ai/article', methods=['POST'])
def ai_article():
    data = request.get_json()
    topic = data.get('topic', '')
    length = data.get('length', 'medium')
    
    if not topic:
        return jsonify({'success': False, 'message': '请提供选题'})
    
    if not ai_service:
        init_ai_service()
    
    content = ai_service.generate_article(topic, length)
    
    if content:
        summary = content[:200].replace('\n', ' ').strip() + '...' if len(content) > 200 else content
        return jsonify({'success': True, 'content': content, 'summary': summary})
    else:
        return jsonify({'success': False, 'message': '文章生成失败'})

if __name__ == '__main__':
    init_wechat_client()
    init_ai_service()
    app.run(host='0.0.0.0', port=5000, debug=True)