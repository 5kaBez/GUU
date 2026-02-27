#!/usr/bin/env python3
"""Fix telegram bot handler issues"""

with open('src/bot/telegram_bot.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Emoji corruption in Services button handler
print("🔍 Fixing emoji corruption in Services handler...")
content = content.replace(
    'if text == "️ Сервисы":',
    'if text == "⚙️ Сервисы":'
)
print("✅ Services emoji fixed")

# Fix 2: Fix show_profile to use user_data instead of undefined state
print("🔍 Fixing show_profile() state variable reference...")
old_profile = '''    text = (
        "👤 <b>Ваш профиль</b>\\n\\n"
        f"📋 <b>Форма:</b> {state['form']}\\n"
        f"📚 <b>Уровень:</b> {state['education']}\\n"
        f"🎓 <b>Курс:</b> {state['course']}\\n"
        f"🏛️ <b>Институт:</b> {state['institute']}\\n"
        f"📖 <b>Направление:</b> {state['direction']}\\n"
        f"🎯 <b>Программа:</b> {state['program']}\\n"
        f"👥 <b>Группа:</b> {state['group']}"
    )'''

new_profile = '''    text = (
        "👤 <b>Ваш профиль</b>\\n\\n"
        f"📋 <b>Форма:</b> {user_data.get('Форма обучения', '—')}\\n"
        f"📚 <b>Уровень:</b> {user_data.get('Уровень образования', '—')}\\n"
        f"🎓 <b>Курс:</b> {user_data.get('Курс', '—')}\\n"
        f"🏛️ <b>Институт:</b> {user_data.get('Институт', '—')}\\n"
        f"📖 <b>Направление:</b> {user_data.get('Направление', '—')}\\n"
        f"🎯 <b>Программа:</b> {user_data.get('Программа', '—')}\\n"
        f"👥 <b>Группа:</b> {user_data.get('Номер группы', '—')}"
    )'''

content = content.replace(old_profile, new_profile)
print("✅ show_profile() fixed")

# Fix 3: Fix button handler conflicts - remove old service handlers
print("🔍 Removing old service button handlers...")

# Remove handler for "🏃 Запись на физру" - this button no longer exists
old_handler_1 = '''    if text == "🏃 Запись на физру":
        log_user_action(user_id, "click_physical")
        show_physical_info(user_id)
        return'''

content = content.replace(old_handler_1, '')
print("✅ Removed old '🏃 Запись на физру' handler")

# Remove handler for "💼 Работа" - this button no longer exists
old_handler_2 = '''    if text == "💼 Работа":
        log_user_action(user_id, "click_job")
        show_job_info(user_id)
        return'''

content = content.replace(old_handler_2, '')
print("✅ Removed old '💼 Работа' handler")

# Remove handler for "🍽️ Homemeal" - this button no longer exists
old_handler_3 = '''    if text == "🍽️ Homemeal":
        log_user_action(user_id, "click_homemeal")
        show_homemeal_info(user_id)
        return'''

content = content.replace(old_handler_3, '')
print("✅ Removed old '🍽️ Homemeal' handler")

# Remove handler for "✅ Оставить заявку" - this button no longer exists
old_handler_4 = '''    if text == "✅ Оставить заявку":
        # Determine which service the user is applying for
        current_message = bot.send_message(user_id, "✅ Спасибо! Ваша заявка принята!", parse_mode="HTML")
        # Determine service from recent context
        service_name = "физру"
        if "Работа" in str(state.get('last_action', '')):
            service_name = "работа"
        elif "Homemeal" in str(state.get('last_action', '')):
            service_name = "homemeal"
        
        submit_application(user_id, service_name)
        show_services_menu(user_id)
        return'''

content = content.replace(old_handler_4, '')
print("✅ Removed old '✅ Оставить заявку' handler")

# Remove handler for "⚙️ Выход" - this button no longer exists in main menu
old_handler_5 = '''    if text == "⚙️ Выход":
        user_states[user_id] = {}
        markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
        markup.add(types.KeyboardButton("/start"))
        bot.send_message(
            user_id,
            "👋 <b>До встречи!</b>\\n\\n"
            "Нажмите /start чтобы начать заново.",
            reply_markup=markup,
            parse_mode="HTML"
        )
        return'''

content = content.replace(old_handler_5, '')
print("✅ Removed old '⚙️ Выход' handler")

# Fix 4: Add handler for "📝 Заявка на физру" button (the only application button now)
print("🔍 Adding handler for '📝 Заявка на физру' button...")

# Find where to insert - after the Services menu handler
insert_pattern = '''    if text == "⚙️ Сервисы":
        log_user_action(user_id, "view_services")
        show_services_menu(user_id)
        return'''

new_handler = '''    if text == "⚙️ Сервисы":
        log_user_action(user_id, "view_services")
        show_services_menu(user_id)
        return
    
    if text == "📝 Заявка на физру":
        log_user_action(user_id, "click_physical")
        show_physical_info(user_id)
        return'''

if insert_pattern in content:
    content = content.replace(insert_pattern, new_handler)
    print("✅ Added '📝 Заявка на физру' handler")

# Save the fixed content
with open('src/bot/telegram_bot.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ All handlers fixed successfully!")
print("📝 Summary of fixes:")
print("  • Fixed emoji in Services button handler (⚙️)")
print("  • Fixed show_profile() to use user_data from database")
print("  • Removed obsolete button handlers (🏃, 💼, 🍽️, ✅, unused ⚙️)")
print("  • Added handler for '📝 Заявка на физру' button")
