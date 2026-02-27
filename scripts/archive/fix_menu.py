#!/usr/bin/env python3
# Quick fix script

with open('src/bot/telegram_bot.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find show_main_menu and replace it
output = []
i = 0
while i < len(lines):
    if 'def show_main_menu(user_id):' in lines[i]:
        # Insert new function
        output.append('def show_main_menu(user_id):\n')
        output.append('    """Show main menu with beautiful buttons"""\n')
        output.append('    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)\n')
        output.append('    markup.add(\n')
        output.append('        types.KeyboardButton("📅 Расписание"),\n')
        output.append('        types.KeyboardButton("👤 Профиль"),\n')
        output.append('        types.KeyboardButton("🛠 Сервисы"),\n')
        output.append('        types.KeyboardButton("💬 Обратная связь"),\n')
        output.append('        types.KeyboardButton("⚙ Выход")\n')
        output.append('    )\n')
        output.append('    \n')
        output.append('    text = (\n')
        output.append('        "🎓 <b>Главное меню</b>\\n\\n"\n')
        output.append('        "Выберите интересующий вас раздел:"\n')
        output.append('    )\n')
        output.append('    \n')
        output.append('    bot.send_message(user_id, text, reply_markup=markup, parse_mode="HTML")\n')
        
        # Skip old function lines until next def
        i += 1
        while i < len(lines) and not lines[i].startswith('def '):
            i += 1
        i -= 1  # Back up one
    else:
        output.append(lines[i])
    i += 1

with open('src/bot/telegram_bot.py', 'w', encoding='utf-8') as f:
    f.writelines(output)

print("✓ Menu fixed")
