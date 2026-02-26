import telebot
import os
from dotenv import load_dotenv
import time

load_dotenv()
token = os.getenv('TELEGRAM_BOT_TOKEN')
bot = telebot.TeleBot(token)

@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "Hello!")

print("Bot starting minimal polling...")
bot.polling(none_stop=True, timeout=30)
