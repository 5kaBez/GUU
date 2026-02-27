#!/usr/bin/env python3
"""
Telegram bot for University Schedules - Fully Functional Version
Includes:
- Main menu with 5 buttons
- WebApp integration (Schedule & App)
- Profile view
- Feedback system
- Activity logging
"""

import telebot
from telebot import types
import logging
from pathlib import Path
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database.models import Database
from config import MINIAPP_URL, TELEGRAM_BOT_TOKEN, DATABASE_PATH

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize bot
if not TELEGRAM_BOT_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN not found in .env")
    sys.exit(1)

bot = telebot.TeleBot(TELEGRAM_BOT_TOKEN)
db = Database(DATABASE_PATH)

# --- UTILS ---

def log_user_activity(user_id, action, details=None):
    """Log user action to database"""
    try:
        db.execute('''
            INSERT INTO user_activity (user_id, action, details, timestamp)
            VALUES (?, ?, ?, datetime('now'))
        ''', (user_id, action, details))
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")

# --- KEYBOARDS ---

def get_main_menu():
    """Create main menu keyboard with 5 buttons"""
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    
    btn_schedule = types.KeyboardButton("📅 Расписание")
    btn_profile = types.KeyboardButton("👤 Профиль")
    btn_services = types.KeyboardButton("⚙️ Сервисы")
    btn_feedback = types.KeyboardButton("💭 Обратная связь")
    btn_app = types.KeyboardButton("💻 ПРИЛОЖЕНИЕ", web_app=types.WebAppInfo(url=MINIAPP_URL))
    
    markup.add(btn_schedule, btn_profile)
    markup.add(btn_services, btn_feedback)
    markup.add(btn_app)
    
    return markup

def get_schedule_menu():
    """Menu for schedule selection"""
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("🗓️ Сегодня"),
        types.KeyboardButton("🌅 Завтра"),
        types.KeyboardButton("📅 На неделю"),
        types.KeyboardButton("🔙 Назад")
    )
    return markup

def get_services_menu():
    """Submenu for services"""
    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("🏃 Физкультура"),
        types.KeyboardButton("🔙 Назад")
    )
    return markup

# --- HANDLERS ---

@bot.message_handler(commands=['start'])
def handle_start(message):
    """Start command handler"""
    user_id = message.from_user.id
    username = message.from_user.username or "User"
    first_name = message.from_user.first_name or ""
    last_name = message.from_user.last_name or ""
    
    try:
        # Check and create user
        user = db.fetch_one('SELECT * FROM users WHERE user_id = ?', (user_id,))
        if not user:
            db.execute('''
                INSERT INTO users 
                (user_id, username, first_name, last_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
            ''', (user_id, username, first_name, last_name))
            logger.info(f"New user: {user_id} (@{username})")
        
        log_user_activity(user_id, 'session_start', f'username=@{username}')
        
        welcome_text = (
            f"🎓 <b>Привет, {first_name}!</b>\n\n"
            "Добро пожаловать в систему «ГУУ Расписание».\n\n"
            "Выберите интересующий вас раздел в меню ниже:"
        )
        
        bot.send_message(user_id, welcome_text, parse_mode="HTML", reply_markup=get_main_menu())
        
    except Exception as e:
        logger.error(f"Error in /start: {e}", exc_info=True)
        bot.send_message(user_id, "❌ Произошла ошибка при запуске бота. Обратитесь к разработчику.")

@bot.message_handler(func=lambda m: m.text == "📅 Расписание")
def handle_schedule_menu(message):
    user_id = message.from_user.id
    log_user_activity(user_id, 'click_schedule_menu')
    bot.send_message(user_id, "📅 <b>Расписание</b>\n\nВыберите период:", parse_mode="HTML", reply_markup=get_schedule_menu())

@bot.message_handler(func=lambda m: m.text == "👤 Профиль")
def handle_profile(message):
    user_id = message.from_user.id
    log_user_activity(user_id, 'click_profile')
    
    user = db.fetch_one('SELECT * FROM users WHERE user_id = ?', (user_id,))
    if not user:
        bot.send_message(user_id, "❌ Профиль не найден. Попробуйте /start")
        return
        
    profile_status = "✅ Заполнен" if user.get('profile_completed') else "⚠️ Не заполнен"
    
    # Format name specifically to avoid "None None"
    fname = user.get('first_name') or message.from_user.first_name or ""
    lname = user.get('last_name') or message.from_user.last_name or ""
    full_user_name = f"{fname} {lname}".strip() or "Студент"
    
    profile_text = (
        f"👤 <b>Ваш профиль</b>\n"
        f"━━━━━━━━━━━━━━━\n"
        f"<b>Статус:</b> {profile_status}\n"
        f"<b>Имя:</b> {full_user_name}\n"
        f"<b>Группа:</b> <code>{user.get('Номер группы') or '—'}</code>\n"
        f"<b>Институт:</b> {user.get('Институт') or '—'}\n"
        f"<b>Курс:</b> {user.get('Курс') or '—'}\n"
        f"━━━━━━━━━━━━━━━\n\n"
        f"<i>Для изменения данных используйте наше <b>Приложение</b>.</i>"
    )
    
    markup = types.InlineKeyboardMarkup()
    markup.add(types.InlineKeyboardButton("⚙️ Редактировать в приложении", web_app=types.WebAppInfo(url=MINIAPP_URL)))
    
    bot.send_message(user_id, profile_text, parse_mode="HTML", reply_markup=markup)

@bot.message_handler(func=lambda m: m.text == "⚙️ Сервисы")
def handle_services(message):
    user_id = message.from_user.id
    log_user_activity(user_id, 'click_services')
    bot.send_message(user_id, "⚙️ <b>Наши сервисы</b>\n\nВыберите раздел:", parse_mode="HTML", reply_markup=get_services_menu())

@bot.message_handler(func=lambda m: m.text == "🏃 Физкультура")
def handle_phys(message):
    user_id = message.from_user.id
    log_user_activity(user_id, 'click_phys_info')
    text = (
        "🏃 <b>Расписание Физкультуры</b>\n\n"
        "Занятия проходят в спортивном комплексе ГУУ.\n"
        "Не забудьте спортивную форму и сменную обувь!"
    )
    bot.send_message(user_id, text, parse_mode="HTML")

@bot.message_handler(func=lambda m: m.text == "🔙 Назад")
def handle_back(message):
    user_id = message.from_user.id
    bot.send_message(user_id, "Возвращаемся в главное меню...", reply_markup=get_main_menu())

@bot.message_handler(func=lambda m: m.text == "💭 Обратная связь")
def handle_feedback_start(message):
    user_id = message.from_user.id
    log_user_activity(user_id, 'click_feedback')
    msg = bot.send_message(user_id, "💭 <b>Обратная связь</b>\n\nНапишите ваш вопрос или предложение:", parse_mode="HTML", reply_markup=types.ReplyKeyboardRemove())
    bot.register_next_step_handler(msg, handle_feedback_process)

def handle_feedback_process(message):
    user_id = message.from_user.id
    try:
        db.execute('INSERT INTO feedback (user_id, message) VALUES (?, ?)', (user_id, message.text))
        log_user_activity(user_id, 'submit_feedback')
        bot.send_message(user_id, "✅ Спасибо за ваш отзыв! Мы ознакомимся с ним.", reply_markup=get_main_menu())
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        bot.send_message(user_id, "❌ Не удалось сохранить отзыв.", reply_markup=get_main_menu())

@bot.message_handler(commands=['help'])
def handle_help(message):
    help_text = (
        "<b>Справка:</b>\n"
        "• Нажмите 📅 Расписание для просмотра занятий.\n"
        "• Нажмите 👤 Профиль для просмотра своих данных.\n"
        "• Используйте /start для перезапуска."
    )
    bot.send_message(message.from_user.id, help_text, parse_mode="HTML", reply_markup=get_main_menu())

@bot.message_handler(func=lambda m: True)
def handle_unknown(message):
    bot.send_message(message.from_user.id, "Пожалуйста, используйте кнопки меню или /help.", reply_markup=get_main_menu())

# --- MAIN ---

def main():
    logger.info("=" * 50)
    logger.info("Telegram Bot Starting...")
    logger.info(f"Using MINIAPP_URL: {MINIAPP_URL}")
    logger.info("=" * 50)
    
    try:
        bot.infinity_polling(timeout=20, long_polling_timeout=10)
    except Exception as e:
        logger.error(f"Fatal bot error: {e}", exc_info=True)
    finally:
        logger.info("Telegram Bot Stopped")

if __name__ == '__main__':
    main()
