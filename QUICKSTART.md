# Schedule Bot - Quick Start Guide

## 🚀 Installation & Setup

### Step 1: Clone Repository
```bash
cd c:\Users\калькулятор\Desktop\project\Raspisanie
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment
```bash
# Copy example to .env
copy .env.example .env

# Edit .env file and add:
# 1. TELEGRAM_BOT_TOKEN - Get from @BotFather
# 2. ADMIN_PASSWORD - Create a strong password
```

### Step 5: Initialize Database
```bash
python main.py --init-db
```

---

## 📱 Running the Application

### Option A: Run Telegram Bot
```bash
python main.py --mode bot
```

### Option B: Run Admin Panel
```bash
python main.py --mode admin
# Open: http://localhost:5000
```

### Option C: Run Both (in separate terminals)
Terminal 1:
```bash
python main.py --mode bot
```

Terminal 2:
```bash
python main.py --mode admin
```

---

## 📋 Excel File Format

Your schedule Excel file should contain:

```
День недели | Номер пары | Время пары | Предмет | Преподаватель | Кабинет | Форма обучения | Курс | Институт | Направление | Группа
```

---

## 🔑 Default Credentials

**Admin Panel:**
- Password: Set in `.env` file (ADMIN_PASSWORD)
- URL: http://localhost:5000

---

## 📞 Troubleshooting

1. **Bot not starting**: Check TELEGRAM_BOT_TOKEN in .env
2. **Admin panel won't load**: Ensure port 5000 is available
3. **Excel upload fails**: Verify file format and column names

More details in README.md

---

**Ready to go! 🎉**
