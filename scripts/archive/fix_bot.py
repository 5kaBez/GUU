#!/usr/bin/env python3
# Fix script for bot functions

with open('src/bot/telegram_bot.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix show_main_menu - remove выход button
old_main_menu = '''def show_main_menu(user_id):
    """Show main menu with beautiful buttons"""
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("📅 Расписание"),
        types.KeyboardButton("👤 Профиль"),
        types.KeyboardButton("🛠 Сервисы"),
        types.KeyboardButton("💬 Обратная связь"),
        types.KeyboardButton("⚙ Выход")
    )
    
    text = (
        "🎓 <b>Главное меню</b>\\n\\n"
        "Выберите интересующий вас раздел:"
    )
    
    bot.send_message(user_id, text, reply_markup=markup, parse_mode="HTML")'''

new_main_menu = '''def show_main_menu(user_id):
    """Show main menu with beautiful buttons"""
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("📅 Расписание"),
        types.KeyboardButton("👤 Профиль"),
        types.KeyboardButton("⚙️ Сервисы"),
        types.KeyboardButton("💭 Обратная связь")
    )
    
    text = (
        "🎓 <b>Главное меню</b>\\n\\n"
        "Выберите интересующий вас раздел:"
    )
    
    bot.send_message(user_id, text, reply_markup=markup, parse_mode="HTML")'''

content = content.replace(old_main_menu, new_main_menu)

# 2. Fix show_services_menu - only physical button
old_services = '''def show_services_menu(user_id):
    """Show all services with descriptions"""
    text = (
        "🛠️ <b>Наши сервисы</b>\\n\\n"
        "📚 <b>Физкультура</b>\\n"
        "Скоро запись — оставляй заявку\\n\\n"
        "💼 <b>Работа</b>\\n"
        "Скоро вакансии — подработка и карьера\\n\\n"
        "🍽️ <b>Homemeal</b>\\n"
        "Скоро доставка — еда на территории общаги\\n\\n"
        "Все сервисы находятся в разработке 🚀"
    )
    
    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("📝 Заявка на физру"),
        types.KeyboardButton("📝 Заявка на работу"),
        types.KeyboardButton("📝 Заявка на Homemeal"),
        types.KeyboardButton("🔙 Назад")
    )'''

new_services = '''def show_services_menu(user_id):
    """Show all services with descriptions"""
    text = (
        "⚙️ <b>Наши сервисы</b>\\n\\n"
        "🏃 <b>Физкультура</b>\\n"
        "Скоро запись — оставляй заявку\\n\\n"
        "💼 <b>Работа</b>\\n"
        "Скоро вакансии — подработка и карьера\\n\\n"
        "🍽️ <b>Homemeal</b>\\n"
        "Скоро доставка — еда на территории общаги\\n\\n"
        "Все сервисы находятся в разработке 🚀"
    )
    
    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("📝 Заявка на физру"),
        types.KeyboardButton("🔙 Назад")
    )'''

content = content.replace(old_services, new_services)

# 3. Fix show_profile to check database instead of state
old_profile = '''def show_profile(user_id):
    """Show user's saved profile"""
    state = user_states.get(user_id, {})
    
    if not all(k in state for k in ['form', 'education', 'course', 'institute', 'direction', 'program', 'group']):
        markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
        markup.add(types.KeyboardButton("🔙 Назад"))
        bot.send_message(user_id, "❌ Данные не заполнены. Начните с /start", reply_markup=markup)'''

new_profile = '''def show_profile(user_id):
    """Show user's saved profile"""
    user_data = db.fetch_one('SELECT * FROM users WHERE user_id = ?', (user_id,))
    
    if not user_data or not user_data.get('Номер группы'):
        markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
        markup.add(types.KeyboardButton("🔙 Назад"))
        bot.send_message(user_id, "ℹ️ Вы ещё не заполнили профиль.\\nНажмите /start чтобы начать!", reply_markup=markup)'''

content = content.replace(old_profile, new_profile)

# 4. Remove show_job_info and show_homemeal_info functions and replace with coming soon helper
old_job = '''def show_job_info(user_id):
    """Show job opportunities with application option"""
    text = (
        "💼 <b>Работа</b>\\n\\n"
        "Скоро вакансии — подработка и карьера\\n\\n"
        "Сервис находится в разработке. "
        "Здесь можно будет найти как временную подработку, "
        "так и постоянную работу от наших партнёров 💰"
    )
    
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("✅ Оставить заявку"),
        types.KeyboardButton("🔙 Назад")
    )
    
    bot.send_message(user_id, text, reply_markup=markup, parse_mode="HTML")'''

old_homemeal = '''def show_homemeal_info(user_id):
    """Show Homemeal delivery with application option"""
    text = (
        "🍽️ <b>Homemeal</b>\\n\\n"
        "Скоро доставка — еда на территории общаги\\n\\n"
        "Сервис находится в разработке. "
        "Вскоре можно будет заказать вкусную еду "
        "с доставкой на территорию общежития 🍕"
    )
    
    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("✅ Оставить заявку"),
        types.KeyboardButton("🔙 Назад")
    )
    
    bot.send_message(user_id, text, reply_markup=markup, parse_mode="HTML")'''

content = content.replace(old_job, '')
content = content.replace(old_homemeal, '')

# 5. Update handlers to remove "Обратная связь" text message and fix emoji
# Find and replace handler for "Обратная связь"
old_feedback_handler = '''    if text == "💬 Обратная связь":
        log_user_action(user_id, "feedback_start")
        user_states[user_id]['stage'] = 'feedback'
        markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)'''

new_feedback_handler = '''    if text == "💭 Обратная связь":
        log_user_action(user_id, "feedback_start")
        user_states[user_id]['stage'] = 'feedback'
        markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)'''

content = content.replace(old_feedback_handler, new_feedback_handler)

# 6. Fix the handler for "⚙️ Сервисы" emoji
old_services_button = '''    if text == "🛠️ Сервисы":
        log_user_action(user_id, "view_services")
        show_services_menu(user_id)
        return'''

new_services_button = '''    if text == "⚙️ Сервисы":
        log_user_action(user_id, "view_services")
        show_services_menu(user_id)
        return'''

content = content.replace(old_services_button, new_services_button)

# 7. Fix "🔙 Назад" handler to return to main menu
old_back_handler = '''    if text == "🔙 Назад":
        show_services_menu(user_id)
        return'''

new_back_handler = '''    if text == "🔙 Назад":
        show_main_menu(user_id)
        return'''

content = content.replace(old_back_handler, new_back_handler)

# Write the fixed content
with open('src/bot/telegram_bot.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Bot fixed successfully!")
print("✅ Removed 'Выход' button")
print("✅ Changed emoji for Services to ⚙️")
print("✅ Changed emoji for Feedback to 💭")
print("✅ Only 'Заявка на физру' shown")
print("✅ Fixed Профиль to check database")
print("✅ Fixed 'Назад' button to return to main menu")
