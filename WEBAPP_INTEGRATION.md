# 🚀 Интеграция Web App в Telegram Бота

## ✅ Что было сделано:

1. ✓ Flask сервер на HTTPS (localhost:5000)
2. ✓ React миниапп со ссылкой на /miniapp
3. ✓ Обновлен бот с Web App кнопкой в главное меню
4. ✓ Web App кнопка автоматически получает user_id от Telegram

---

## 🎯 БЫСТРЫЙ СТАРТ (3 шага)

### Шаг 1️⃣: Запустить Flask сервер
```bash
python src/admin/app.py
```
✓ Flask запустится на https://localhost:5000

### Шаг 2️⃣: Запустить Telegram бот
```bash
python src/bot/telegram_bot.py
```
✓ Бот начнет слушать команды

### Шаг 3️⃣: Получить публичный URL (для BotFather)

**Вариант A: Через serveo (рекомендуется для разработки)**
```bash
ssh -R 80:localhost:5000 serveo.net
```
Вы получите URL вроде:
```
https://xxxxxxxx-xxx-xxx-xxx-xxxxxx.serveousercontent.com
```
Скопируйте этот URL

**Вариант B: Через ngrok (если у вас есть аккаунт)**
```bash
ngrok http 5000
```

**Вариант C: Для локального тестирования**
Используйте: `https://localhost:5000/miniapp`
(работает только для тестирования на том же компьютере)

---

## 📱 Как подключить Web App к BotFather

### Способ 1: Через Menu Button (Рекомендуется)

1. Откройте BotFather в Telegram: `@BotFather`
2. Отправьте: `/setmenubutton`
3. Выберите свого бота
4. Выберите "Web App"
5. Введите URL из Шага 3 выше:
   ```
   https://xxxxxxxx-xxx-xxx-xxx-xxxxxx.serveousercontent.com/miniapp
   ```

### Способ 2: Через команду

В BotFather:
```
/setmenubutton
(выберите бота)
Web App
https://YOUR_PUBLIC_URL/miniapp
```

---

## 🔄 Синхронизация данных в обе стороны

### Текущая синхронизация:
- ✅ Бот → Миниапп: user_id передается автоматически через Telegram Web App API
- ✅ Миниапп → Бот: Данные сохраняются в БД

### Планируемая синхронизация:
- 📋 Профиль пользователя (форма, курс, группа)
- 📅 История просмотров расписания
- 📝 Заметки к расписанию
- ⭐ Избранные дни/пары

---

## 🎓 Структура главного меню

После обновления, меню выглядит так:

```
🎓 ГЛАВНОЕ МЕНЮ

[💻 Открыть приложение (Web App)]  ← Новая кнопка!

[📅 Расписание]  [👤 Профиль]
[⚙️  Сервисы]     [💭 Обратная связь]
```

Когда пользователь нажимает "💻 Открыть приложение":
1. Открывается Web App в встроенном браузере Telegram
2. Миниапп получает user_id от Telegram API
3. Синхронизирует данные из БД
4. Показывает красивый интерфейс с расписанием

---

## ⚙️ Конфигурация

### В файле `config.py`:

```python
# Для serveo:
MINIAPP_URL = 'https://xxxxxxxx-xxx-xxx-xxx-xxxxxx.serveousercontent.com/miniapp'

# Для ngrok:
MINIAPP_URL = 'https://xxxx-xx-xxx-xxx.ngrok.io/miniapp'

# Для localhost (тестирование):
MINIAPP_URL = 'https://localhost:5000/miniapp'
```

Обновите `MINIAPP_URL` на ваш публичный URL перед использованием BotFather.

---

## 🐛 Решение проблем

### Проблема: "URL is invalid (https is required)"
**Решение:** Используйте publicHTTPS URL (serveo, ngrok), не localhost

### Проблема: Миниапп не загружается
**Проверка:**
```bash
python test_flask.py
```
Должено вывести:
```
✓ Root endpoint: 200
✓ Miniapp endpoint: 200
```

### Проблема: Бот не запускается
**Проверка:**
1. `TELEGRAM_BOT_TOKEN` установлен в .env
2. Flask запущена на порте 5000
3. Проверьте логи: `logs/bot.log`

---

## 📚 API endpoints (для будущих интеграций)

```
GET  /api/schedule?class=1a              → Расписание группы
POST /api/users                           → Сохранить профиль
GET  /api/users/:user_id                  → Получить профиль
POST /api/notes                           → Сохранить заметку
```

---

## 💡 Советы

1. **Serveo URL менится** при каждом переподключении → Используйте ngrok для стабильности
2. **Localhost SSL warning** → Нормально, это самоподписанный сертификат
3. **Миниапп синхронизация** → Происходит автоматически через Telegram Web App API
4. **CORS** → Уже настроен для работы с локальным сервером

---

## 🎉 Готово!

Теперь у тебя есть:
- ✅ Telegram бот с меню
- ✅ Web App кнопка в меню
- ✅ Красивая миниапп с расписанием
- ✅ Синхронизация данных в обе стороны
- ✅ Публичный HTTPS URL для BotFather

Enjoy! 🚀
