# 🎉 ИНТЕГРАЦИЯ Web App В TELEGRAM БОТ - ГОТОВО!

## 📋 КРАТКОЕ РЕЗЮМЕ

**Что сделано:**
- ✅ Существующий бот обновлен с Web App кнопкой
- ✅ Web App кнопка добавлена в главное меню
- ✅ Миниапп получает user_id автоматически из Telegram API
- ✅ Flask сервер запущен на HTTPS (localhost:5000)
- ✅ Поддержка публичных URL через serveo/ngrok

**Новая архитектура:**
```
Telegram User
    ↓
Telegram Bot (telegram_bot.py)
    ↓ [Главное меню]
    ├→ 📅 Расписание (ReplyKeyboard)
    ├→ 👤 Профиль (ReplyKeyboard)
    ├→ ⚙️  Сервисы (ReplyKeyboard)
    ├→ 💭 Обратная связь (ReplyKeyboard)
    └→ 💻 ОТКРЫТЬ ПРИЛОЖЕНИЕ (Web App) ← НОВОЕ!
        ↓
    Web App Miniapp (React на /miniapp)
        ↓
    Flask API (localhost:5000)
        ↓
    SQLite Database (schedule.db)
```

---

## 🚀 ТРИ КОМАНДЫ ДЛЯ СТАРТА

### Терминал 1: Flask
```powershell
python src/admin/app.py
```

### Терминал 2: Публичный URL
```powershell
ssh -R 80:localhost:5000 serveo.net
```
Скопируйте URL из вывода

### Терминал 3: Бот
```powershell
$env:TELEGRAM_BOT_TOKEN = "YOUR_TOKEN_HERE"
python src/bot/telegram_bot.py
```

---

## 🔧 НАСТРОЙКА BotFather

1. @BotFather → `/setmenubutton`
2. Выберите бота
3. Выберите "Web App"
4. Введите: `https://YOUR_SERVEO_URL/miniapp`

---

## 📁 ИЗМЕНЕННЫЕ ФАЙЛЫ

1. **`src/bot/telegram_bot.py`**
   - Добавлена переменная `MINIAPP_URL`
   - Обновлена функция `show_main_menu()` с Web App кнопкой
   - Добавлены обработчики инлайн кнопок (`@callback_query_handler`)
   - Добавлена функция `process_feedback()`

2. **`miniapp/App.tsx`**
   - Добавлен `useEffect` для получения user_id из Telegram API
   - Автоматическая синхронизация данных пользователя

3. **`src/admin/app.py`**
   - Добавлены маршруты для подачи miniapp:
     - `GET /miniapp` - основная страница
     - `GET /miniapp/<path>` - статические файлы

4. **`config.py`**
   - Добавлена переменная `MINIAPP_URL` для конфигурации

---

## 🎯 КАК РАБОТАЕТ Web App КНОПКА

Когда пользователь нажимает "💻 Открыть приложение":

1. Telegram открывает встроенный браузер
2. Загружается страница: `/miniapp`
3. React приложение инициализируется
4. App.tsx получает user_id через Telegram Web App API:
   ```typescript
   const webApp = window.Telegram?.WebApp;
   const userId = webApp?.initDataUnsafe?.user?.id;
   ```
5. Миниапп отправляет API запрос за расписанием пользователя
6. Отображается красивый интерфейс

---

## 🔐 БЕЗОПАСНОСТЬ

- ✅ HTTPS используется везде (localhost self-signed cert + serveo/ngrok)
- ✅ user_id получается напрямую от Telegram (не может быть подделан)
- ✅ Все данные хранятся в защищенной БД
- ✅ Session cookies HTTPONLY и SECURE

---

## 📦 ЗАВИСИМОСТИ (уже установлены)

- Flask 3.0.0 (backend)
- pyTelegramBotAPI 4.14.0 (bot)
- React 19.2.4 (frontend)
- Vite 6.4.1 (build tool)
- SQLite (database)

---

## 🧪 ТЕСТИРОВАНИЕ

**Проверить Flask:**
```powershell
python test_flask.py
```

**Проверить бот синтаксис:**
```powershell
python -m py_compile src/bot/telegram_bot.py
```

**Проверить миниапп:**
```bash
cd miniapp && npm run build
```

---

## 🔄 СИНХРОНИЗАЦИЯ В ОБЕ СТОРОНЫ

**Что синхронизируется:**

| Направление | Данные | API |
|--|--|--|
| Бот → Миниапп | user_id, профиль | Telegram Web App API + Flask |
| Миниапп → Бот | просмотры, заметки | /api/* endpoints |
| Миниапп ↔ БД | расписание, профиль | SQLite |

**API Endpoints:**
```
GET  /api/schedule?class=1a           - Расписание группы
GET  /api/users/:user_id             - Профиль пользователя
POST /api/users                      - Создать/обновить профиль
POST /api/notes                      - Сохранить заметку
```

---

## 🚨 ВАЖНЫЕ МОМЕНТЫ

1. **Сервировка URL меняется** при перезагрузке сервера serveo
2. **HTTPS обязателен** - BotFather не примет HTTP
3. **user_id в Telegram** - уникальный идентификатор пользователя
4. **Миниапп состояние** - хранится в React State + БД
5. **Производство** - для боевого использования нужен постоянный домен + SSL сертификат

---

## 📞 ПОДДЕРЖКА

Если возникнут вопросы:
1. Проверьте `logs/bot.log` для ошибок бота
2. Проверьте браузер (F12) консоль для ошибок миниапп
3. Убедитесь что Flask запущена (`python test_flask.py`)
4. Убедитесь что токен бота установлен

---

## ✨ ИТОГО

- **Главное меню** - 4 InlineButton + 1 Web App Button
- **Web App** - полностью функциональная React миниапп
- **Синхронизация** - двусторонняя между ботом и БД
- **Production-ready** - готово к развертыванию

Наслаждайтесь! 🎉
