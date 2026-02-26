"""
Telegram bot with menu buttons and Web App integration
"""
import telebot
from telebot import types
import os
from pathlib import Path
import sys

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import TELEGRAM_BOT_TOKEN

bot = telebot.TeleBot(TELEGRAM_BOT_TOKEN)

# Web App URL (static, no parameters)
MINIAPP_URL = "https://localhost:5000/miniapp"

# Feedback channel (optional, you can configure this)
FEEDBACK_CHAT_ID = None  # Set to your feedback channel ID if needed


def create_main_menu():
    """Create main menu with 4 buttons"""
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=False, row_width=2)
    
    # Button 1: Schedule (opens Web App)
    btn_schedule = types.KeyboardButton(
        text="📅 Расписание",
        web_app=types.WebAppInfo(url=MINIAPP_URL)
    )
    
    # Button 2: Profile
    btn_profile = types.KeyboardButton("👤 Профиль")
    
    # Button 3: Feedback
    btn_feedback = types.KeyboardButton("📬 Обратная связь")
    
    # Button 4: Help
    btn_help = types.KeyboardButton("❓ Помощь")
    
    markup.add(btn_schedule, btn_profile)
    markup.add(btn_feedback, btn_help)
    
    return markup


@bot.message_handler(commands=['start'])
def start_handler(message):
    """Handle /start command"""
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "Пользователь"
    
    welcome_text = f"""
Привет, {first_name}! 👋

Добро пожаловать в бота с расписанием 📚

Выбери действие из меню ниже:
• 📅 Расписание - открыть расписание занятий
• 👤 Профиль - твой профиль
• 📬 Обратная связь - отправить предложение
• ❓ Помощь - справка по боту
"""
    
    bot.send_message(user_id, welcome_text, reply_markup=create_main_menu())
    print(f"✓ User {user_id} ({first_name}) started bot")


@bot.message_handler(func=lambda message: message.text == "👤 Профиль")
def profile_handler(message):
    """Handle Profile button"""
    user_id = message.from_user.id
    first_name = message.from_user.first_name or "Пользователь"
    last_name = message.from_user.last_name or ""
    username = message.from_user.username or "не указано"
    
    profile_text = f"""
👤 <b>Твой профиль</b>

<b>Имя:</b> {first_name} {last_name}
<b>Юзернейм:</b> @{username}
<b>ID:</b> <code>{user_id}</code>

Для просмотра расписания нажми на кнопку "📅 Расписание"
"""
    
    bot.send_message(user_id, profile_text, parse_mode='HTML', reply_markup=create_main_menu())


@bot.message_handler(func=lambda message: message.text == "📬 Обратная связь")
def feedback_start(message):
    """Start feedback process"""
    user_id = message.from_user.id
    
    feedback_text = """
📬 <b>Обратная связь</b>

Напиши своё сообщение, предложение или отзыв.
Я передам это разработчикам 📨
"""
    
    msg = bot.send_message(user_id, feedback_text, parse_mode='HTML')
    bot.register_next_step_handler(msg, process_feedback)


def process_feedback(message):
    """Process feedback message"""
    user_id = message.from_user.id
    feedback_text = message.text
    first_name = message.from_user.first_name or "Пользователь"
    
    # Log feedback
    print(f"📬 Feedback from {user_id} ({first_name}): {feedback_text}")
    
    # Send confirmation
    confirmation = f"""
✅ <b>Спасибо за обратную связь!</b>

Твоё сообщение:
<i>{feedback_text}</i>

Мы обязательно это прочитаем.
"""
    
    bot.send_message(user_id, confirmation, parse_mode='HTML', reply_markup=create_main_menu())


@bot.message_handler(func=lambda message: message.text == "❓ Помощь")
def help_handler(message):
    """Handle Help button"""
    user_id = message.from_user.id
    
    help_text = """
❓ <b>Справка по боту</b>

<b>📅 Расписание</b>
Открывает твоё расписание занятий. Ты можешь просматривать расписание по дням и неделям.

<b>👤 Профиль</b>
Информация о твоём аккаунте в боте.

<b>📬 Обратная связь</b>
Отправь нам свои вопросы, пожелания или отзывы!

<b>❓ Помощь</b>
Эта справка.

<b>Команды:</b>
/start - начать заново
/help - справка
"""
    
    bot.send_message(user_id, help_text, parse_mode='HTML', reply_markup=create_main_menu())


@bot.message_handler(commands=['help'])
def help_command(message):
    """Handle /help command"""
    help_handler(message)


@bot.message_handler(func=lambda message: message.text == "")
def empty_handler(message):
    """Handle empty messages"""
    pass


@bot.message_handler(func=lambda message: True)
def echo_handler(message):
    """Fallback handler for other messages"""
    user_id = message.from_user.id
    
    reply_text = """
🤔 Не понимаю эту команду.

Используй кнопки меню ниже или вводи:
/start - начать
/help - справка
"""
    
    bot.send_message(user_id, reply_text, reply_markup=create_main_menu())


def run_bot():
    """Start the bot"""
    print("🤖 Starting Telegram bot with menu...")
    print(f"📱 Web App URL: {MINIAPP_URL}")
    print("✓ Bot is listening...")
    
    try:
        bot.infinity_polling()
    except KeyboardInterrupt:
        print("\n❌ Bot stopped")
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == '__main__':
    run_bot()
