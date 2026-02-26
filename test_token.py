import telebot
import os
from dotenv import load_dotenv

load_dotenv()
token = os.getenv('TELEGRAM_BOT_TOKEN')
print(f"Testing token: {token[:10]}...")

try:
    bot = telebot.TeleBot(token)
    me = bot.get_me()
    print(f"Successfully logged in as: {me.username}")
except Exception as e:
    print(f"Error: {e}")
