#!/usr/bin/env python3
# Simpler fix - direct replacements

with open('src/bot/telegram_bot.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix show_main_menu
result = []
in_main_menu = False
skip_until_next_def = False

for i, line in enumerate(lines):
    if 'def show_main_menu(user_id):' in line:
        in_main_menu = True
        # Write new function
        result.append('def show_main_menu(user_id):\n')
        result.append('    """Show main menu with beautiful buttons"""\n')
        result.append('    markup = types.ReplyKeyboardMarkup(row_width=2, resize_keyboard=True)\n')
        result.append('    markup.add(\n')
        result.append('        types.KeyboardButton("📅 Расписание"),\n')
        result.append('        types.KeyboardButton("👤 Профиль"),\n')
        result.append('        types.KeyboardButton("⚙️ Сервисы"),\n')
        result.append('        types.KeyboardButton("💭 Обратная связь")\n')
        result.append('    )\n')
        result.append('    \n')
        result.append('    text = (\n')
        result.append('        "🎓 <b>Главное меню</b>\\n\\n"\n')
        result.append('        "Выберите интересующий вас раздел:"\n')
        result.append('    )\n')
        result.append('    \n')
        result.append('    bot.send_message(user_id, text, reply_markup=markup, parse_mode="HTML")\n')
        result.append('\n')
        skip_until_next_def = True
    elif skip_until_next_def:
        if line.startswith('def '):
            skip_until_next_def = False
            result.append(line)
    else:
        result.append(line)

with open('src/bot/telegram_bot.py', 'w', encoding='utf-8') as f:
    f.writelines(result)

print("✓ Main menu fixed")
