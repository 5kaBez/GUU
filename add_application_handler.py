#!/usr/bin/env python3
"""Fix application submission handler"""

with open('src/bot/telegram_bot.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add handler for "✅ Оставить заявку" button
print("🔍 Adding handler for '✅ Оставить заявку' button...")

# Find the correct place to insert - after the 📝 Заявка на физру handler
insert_after = '''    if text == "📝 Заявка на физру":
        log_user_action(user_id, "click_physical")
        show_physical_info(user_id)
        return'''

new_handler = '''    if text == "📝 Заявка на физру":
        log_user_action(user_id, "click_physical")
        show_physical_info(user_id)
        return
    
    if text == "✅ Оставить заявку":
        log_user_action(user_id, "submit_application")
        submit_application(user_id, "физру")
        bot.send_message(user_id, "✅ <b>Спасибо! Ваша заявка принята!</b>\n\nМы свяжемся с вами в ближайшее время.", parse_mode="HTML")
        show_main_menu(user_id)
        return'''

if insert_after in content:
    content = content.replace(insert_after, new_handler)
    print("✅ Added handler for '✅ Оставить заявку' button")
else:
    print("❌ Could not find insertion point")

# Save the fixed content
with open('src/bot/telegram_bot.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Application handler added successfully!")
