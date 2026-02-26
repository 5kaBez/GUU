#!/bin/bash
# 🚀 Быстрый старт интеграции Web App

echo "======================================"
echo "📱 Telegram Bot + Web App Integration"
echo "======================================"
echo ""

# Шаг 1: Проверка окружения
echo "✓ Step 1: Checking environment..."
if ! command -v python &> /dev/null; then
    echo "❌ Python not found"
    exit 1
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "⚠️  WARNING: TELEGRAM_BOT_TOKEN not set"
    echo "   Set it with: export TELEGRAM_BOT_TOKEN=your_token_here"
    echo ""
fi

# Шаг 2: Запуск Flask
echo "✓ Step 2: Starting Flask server..."
echo "   Running: python src/admin/app.py"
python src/admin/app.py &
FLASK_PID=$!
echo "   Flask PID: $FLASK_PID"
sleep 3

# Шаг 3: Тестирование Flask
echo "✓ Step 3: Testing Flask..."
python test_flask.py
if [ $? -ne 0 ]; then
    echo "❌ Flask test failed"
    kill $FLASK_PID
    exit 1
fi

# Шаг 4: Info о serveo
echo ""
echo "✓ Step 4: Getting public URL..."
echo ""
echo "═══════════════════════════════════════════════"
echo "🌐 ПОЛУЧЕНИЕ ПУБЛИЧНОГО URL"
echo "═══════════════════════════════════════════════"
echo ""
echo "Откройте НОВЫЙ терминал и выполните:"
echo ""
echo "   ssh -R 80:localhost:5000 serveo.net"
echo ""
echo "Вы получите URL вроде:"
echo "   https://xxxxxxxx-xxx-xxx.serveousercontent.com"
echo ""
echo "═══════════════════════════════════════════════"
echo ""
echo "ЗАТЕМ:"
echo "1. Скопируйте этот URL"
echo "2. Добавьте /miniapp в конец"
echo "   Пример: https://xxxxxxxx-xxx-xxx.serveousercontent.com/miniapp"
echo "3. Откройте BotFather (@BotFather в Telegram)"
echo "4. Отправьте: /setmenubutton"
echo "5. Выберите вашего бота"
echo "6. Выберите 'Web App'"
echo "7. Введите URL с шага 2"
echo ""
echo "═══════════════════════════════════════════════"
echo ""

# Шаг 5: Информация о токене
echo ""
echo "⚠️  ВАЖНО: Установите токен бота"
echo ""
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "1. Получите токен от @BotFather"
    echo "2. Установите переменную окружения:"
    echo ""
    echo "   export TELEGRAM_BOT_TOKEN='your_token_here'"
    echo ""
    echo "3. ЗАТЕМ запустите бота:"
    echo "   python src/bot/telegram_bot.py"
fi

echo ""
echo "✅ Flask server is running on https://localhost:5000"
echo ""
echo "Нажмите Ctrl+C чтобы остановить Flask"
echo ""

wait $FLASK_PID
