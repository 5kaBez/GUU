#!/usr/bin/env python3
# More comprehensive fix

with open('src/bot/telegram_bot.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix show_services_menu - remove extra buttons
old = '''    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("📝 Заявка на физру"),
        types.KeyboardButton("📝 Заявка на работу"),
        types.KeyboardButton("📝 Заявка на Homemeal"),
        types.KeyboardButton("🔙 Назад")
    )
    
    bot.send_message(user_id, text, reply_markup=markup, parse_mode="HTML")'''

new = '''    markup = types.ReplyKeyboardMarkup(row_width=1, resize_keyboard=True)
    markup.add(
        types.KeyboardButton("📝 Заявка на физру"),
        types.KeyboardButton("🔙 Назад")
    )
    
    bot.send_message(user_id, text, reply_markup=markup, parse_mode="HTML")'''

content = content.replace(old, new)

# 2. Fix services_menu title emoji
old2 = '''def show_services_menu(user_id):
    """Show all services with descriptions"""
    text = (
        "🛠️ <b>Наши сервисы</b>\\n\\n"'''

new2 = '''def show_services_menu(user_id):
    """Show all services with descriptions"""
    text = (
        "⚙️ <b>Наши сервисы</b>\\n\\n"'''

content = content.replace(old2, new2)

# 3. Remove the job and homemeal functions completely
# Find show_job_info and delete until next def
lines = content.split('\n')
new_lines = []
skip = False
for i, line in enumerate(lines):
    if 'def show_job_info(user_id):' in line:
        skip = True
    elif skip and line.startswith('def '):
        skip = False
    
    if not skip:
        new_lines.append(line)

content = '\n'.join(new_lines)

# Remove duplicate show_homemeal if it exists (should be gone)
while 'def show_homemeal_info' in content:
    idx = content.find('def show_homemeal_info')
    next_def = content.find('\ndef ', idx + 1)
    if next_def == -1:
        next_def = len(content)
    content = content[:idx] + content[next_def:]

# 4. Fix handlers for "⚙️ Сервисы" instead of "🛠️ Сервисы"
content = content.replace('if text == "🛠️ Сервисы":', 'if text == "⚙️ Сервисы":')
content = content.replace('if text == "🛠 Сервисы":', 'if text == "⚙️ Сервисы":')

# 5. Fix feedback emoji
content = content.replace('if text == "💬 Обратная связь":', 'if text == "💭 Обратная связь":')

# 6. Fix back button to return to main menu not services
content = content.replace(
    '''    if text == "🔙 Назад":
        show_services_menu(user_id)
        return''',
    '''    if text == "🔙 Назад":
        show_main_menu(user_id)
        return'''
)

# Write the fixed content
with open('src/bot/telegram_bot.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Services handlers fixed")
print("✓ Removed extra service buttons") 
print("✓ Fixed emoji")
print("✓ Fixed back button")
