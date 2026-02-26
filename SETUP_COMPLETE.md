# Schedule Bot Project - Setup Summary

## 🎉 Project Successfully Created!

Your **Schedule Bot** (Расписание) project has been fully scaffolded with all components ready to go.

---

## 📊 Project Overview

**Schedule Bot** is a comprehensive Telegram bot system for managing university schedules with:

- 📱 **Telegram Bot** - User-facing schedule viewer with filtering
- 💼 **Admin Panel** - Web-based schedule management interface
- 📊 **Parser** - Excel file import with intelligent column mapping  
- 🗄️ **SQLite Database** - Persistent data storage
- 🔐 **Authentication** - Secure admin access

---

## 📁 Project Structure

```
Raspisanie/
├── src/
│   ├── bot/                    # Telegram bot implementation
│   │   ├── telegram_bot.py    # Main bot logic
│   │   └── __init__.py
│   ├── parser/                 # Excel parser module
│   │   ├── schedule_parser.py # Parser implementation
│   │   └── __init__.py
│   ├── database/               # Database layer
│   │   ├── models.py          # SQLite models
│   │   └── __init__.py
│   ├── admin/                  # Admin web panel (Flask)
│   │   ├── app.py             # Flask application
│   │   ├── templates/         # HTML templates
│   │   │   ├── login.html
│   │   │   └── dashboard.html
│   │   ├── static/            # CSS & JavaScript
│   │   │   ├── style.css
│   │   │   ├── login.js
│   │   │   └── dashboard.js
│   │   └── __init__.py
│   ├── config.py              # Configuration management
│   ├── utils.py               # Utilities (logging, etc)
│   └── __init__.py
├── data/                      # Data directory
│   ├── schedule.db           # SQLite database (created on init)
│   ├── uploads/              # Uploaded Excel files
│   └── backups/              # Database backups
├── logs/                      # Application logs
├── main.py                   # Main entry point
├── requirements.txt          # Python dependencies
├── .env                      # Environment config (configured)
├── .env.example              # Environment template
├── .gitignore               # Git ignore rules
├── README.md                # Full documentation
├── QUICKSTART.md            # Quick start guide
├── DEVELOPMENT.md           # Development notes
├── verify_setup.py          # Setup verification script
└── LICENSE                  # MIT License
```

---

## ✅ Verification Results

```
✅ All Python packages installed
✅ Project structure complete
✅ All required modules created
✅ Environment file configured
✅ Ready to initialize database
```

---

## 🚀 Getting Started

### 1. **Configure Environment** (✅ Already Done)
Your `.env` file is ready with default values:
- `ADMIN_PASSWORD=admin123` (Change this!)
- `TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here` (Add your bot token)

### 2. **Get Your Telegram Bot Token**
- Open Telegram and search for `@BotFather`
- Send `/newbot` and follow instructions
- Copy your bot token and add to `.env`:
```env
TELEGRAM_BOT_TOKEN=your_token_here
```

### 3. **Initialize Database**
```bash
python main.py --init-db
```

This creates `schedule.db` with all required tables.

### 4. **Start Using**

**Option A: Run Telegram Bot**
```bash
python main.py --mode bot
```

**Option B: Run Admin Panel**
```bash
python main.py --mode admin
# Open browser: http://localhost:5000
# Password: admin123
```

**Option C: Run Both (Two Terminals)**
```bash
# Terminal 1
python main.py --mode bot

# Terminal 2
python main.py --mode admin
```

---

## 🔑 Key Features

### Telegram Bot Features
- `/start` - Main menu with button interface
- `/help` - Help and usage information
- `/schedule` - View your schedule
- Multi-step filter selection
- Save filter preferences
- Day navigation (previous/next)

### Admin Panel Features
- 📊 **Dashboard** - Statistics and logs
- 📁 **Upload** - Parse Excel schedule files
- 🔄 **Modes** - Append or replace schedule data
- 💾 **Backup** - Create database backups
- 📋 **Logs** - Track all operations
- 🔐 **Secure** - Password protected

---

## 📊 Database Structure

### Tables Created
- **users** - Telegram users and their preferences
- **schedule** - Schedule entries with full details
- **institutes** - University institutes
- **directions** - Study directions/specializations
- **groups** - Student groups
- **admin_users** - Administrator accounts
- **parse_logs** - Upload operation history

---

## 📝 Excel File Format

Your schedule Excel files should contain columns like:

```
форма обучения | курс | институт | направление | группа | день недели | 
номер пары | время пары | предмет | преподаватель | аудитория | место
```

Or English version:
```
form_of_education | course | institute | direction | group_name | day_of_week |
lesson_number | lesson_time | subject | teacher | room_number | location
```

The parser intelligently maps column names!

---

## 🔐 Security Notes

1. **Change Admin Password** - Update `ADMIN_PASSWORD` in `.env`
2. **Secure Bot Token** - Keep TELEGRAM_BOT_TOKEN private
3. **Database Backups** - Admin panel can create automatic backups
4. **Logging** - All admin actions are logged

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](README.md) | Complete documentation |
| [QUICKSTART.md](QUICKSTART.md) | Quick setup guide |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Development notes |
| [config.py](src/config.py) | Configuration options |

---

## 🔧 Dependencies Installed

```
✅ pyTelegramBotAPI - Telegram bot framework
✅ Flask - Web framework for admin panel
✅ openpyxl - Excel file parsing
✅ pandas - Data manipulation
✅ python-dotenv - Environment variables
✅ SQLAlchemy - Database ORM (optional)
✅ pytest - Testing framework (optional)
```

Run `pip list` to verify all packages are installed.

---

## 🎯 Next Steps

1. **Update Telegram Token**
   ```bash
   # Edit .env and add your bot token
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklmNOpqrSTUvwxyz123456789
   ```

2. **Initialize Database**
   ```bash
   python main.py --init-db
   ```

3. **Prepare Excel Schedule**
   - Create Excel file with proper columns
   - Save in `data/uploads/` or use admin panel to upload

4. **Start Bot**
   ```bash
   python main.py --mode bot
   ```

5. **Upload Schedules**
   - Open admin panel: http://localhost:5000
   - Login with password from `.env`
   - Upload your Excel schedule file

6. **Test in Telegram**
   - Find your bot on Telegram
   - Send `/start` to begin
   - Select schedule using filters

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "TELEGRAM_BOT_TOKEN not set" | Add token to `.env` file |
| Admin panel won't load | Check if port 5000 is free |
| Database errors | Run `python main.py --init-db` |
| Bot not responding | Verify bot token is correct |
| Excel upload fails | Check column names match expected format |

---

## 📞 Support

For issues or questions:
1. Check `README.md` for detailed documentation
2. Review `verify_setup.py` output for setup issues
3. Check log files in `logs/` directory
4. Review error messages in console output

---

## 📋 Development Stages

- ✅ **Stage 1** - Core bot & database (COMPLETE)
- ✅ **Stage 2** - Filtering & navigation (COMPLETE)
- ✅ **Stage 3** - Admin panel (COMPLETE)
- ⏳ **Stage 4** - Testing & deployment (IN PROGRESS)

---

## 💡 Tips & Best Practices

1. **Use Virtual Environment** - Already set up in `.venv/`
2. **Regular Backups** - Use admin panel to backup database
3. **Monitor Logs** - Check `logs/` folder for issues
4. **Test Excel Format** - Verify file format before uploading
5. **Secure Passwords** - Change default admin password
6. **Update Dependencies** - Run `pip install -r requirements.txt` regularly

---

## 🎓 Learning Path

For understanding the project:

1. Start with `main.py` - Entry point
2. Review `src/config.py` - Configuration
3. Check `src/bot/telegram_bot.py` - Bot logic
4. See `src/admin/app.py` - Web admin panel
5. Study `src/parser/schedule_parser.py` - Excel parsing
6. Examine `src/database/models.py` - Database structure

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## 🎉 Ready to Go!

Your **Schedule Bot** project is fully set up and ready for development. Follow the "Next Steps" section above to get started.

**Happy coding! 🚀**

---

*Created: February 17, 2026*
*Project: Schedule Bot v1.0*
*Status: Ready for Database Initialization*
