# Schedule Bot - Telegram Bot for University Schedules

<div align="center">

![Schedule Bot](https://img.shields.io/badge/Schedule%20Bot-v1.0-blue)
![Python](https://img.shields.io/badge/Python-3.8%2B-green)
![Telegram](https://img.shields.io/badge/Telegram-Bot%20API-blue)
![License](https://img.shields.io/badge/License-MIT-green)

### 🎓 Convenient University Schedule Management in Telegram

A comprehensive Telegram bot for managing and displaying university schedules with flexible filtering and an admin panel for schedule management.

</div>

---

## 📋 Features

### Telegram Bot
- ✅ **Schedule Display** - View schedules in a clean table format
- ✅ **Filtering System** - Filter by:
  - Form of education (Full-time, Part-time, Distance)
  - Course (1-4)
  - Institute
  - Direction/Specialization
  - Group
  - Day of week
- ✅ **Navigation** - Move between days easily
- ✅ **User Preferences** - Save filter selections
- ✅ **Multi-language** - Full Russian language support

### Admin Panel
- 📊 **Dashboard** - Statistics and recent operations
- 📁 **Excel Upload** - Parse and upload schedule files
- 🗄️ **Database Management** - Clear, backup, and manage data
- 📋 **Operation Logs** - Track all administrator actions
- 🔐 **Password Protected** - Secure admin access

---

## 🛠️ Tech Stack

**Backend:**
- Python 3.8+
- pyTelegramBotAPI - Telegram bot framework
- Flask - Web framework for admin panel
- SQLite - Database
- Pandas & OpenPyXL - Excel parsing

**Frontend:**
- HTML5 / CSS3
- Vanilla JavaScript
- Responsive design

---

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Telegram Bot Token (from @BotFather)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Raspisanie
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your values:
   # - TELEGRAM_BOT_TOKEN: Get from @BotFather on Telegram
   # - ADMIN_PASSWORD: Create a secure password
   ```

5. **Initialize database**
   ```bash
   python main.py --init-db
   ```

---

## 🚀 Usage

### Start Telegram Bot
```bash
python main.py --mode bot
```

### Start Admin Panel
```bash
python main.py --mode admin
```
Then open `http://localhost:5000` in your browser.

### Initialize Database Only
```bash
python main.py --init-db
```

---

## 📖 Admin Panel Guide

### Login
- Default password is set in `.env` file (ADMIN_PASSWORD)

### Uploading Schedule
1. Click "Select Excel file"
2. Choose `.xlsx` or `.xls` file
3. Select mode:
   - **Append** - Add to existing schedules
   - **Replace** - Clear and load new data
4. Click "Upload"

### Backup Database
- Click "Create Backup" to save database copy
- Backups are stored in `data/backups/`

### View Operations
- Recent admin actions are shown in logs section

---

## 📂 Project Structure

```
Raspisanie/
├── src/
│   ├── bot/                    # Telegram bot code
│   │   ├── telegram_bot.py
│   │   └── __init__.py
│   ├── parser/                 # Excel parser
│   │   ├── schedule_parser.py
│   │   └── __init__.py
│   ├── database/               # Database models
│   │   ├── models.py
│   │   └── __init__.py
│   ├── admin/                  # Admin web panel
│   │   ├── app.py
│   │   ├── templates/
│   │   │   ├── login.html
│   │   │   └── dashboard.html
│   │   ├── static/
│   │   │   ├── style.css
│   │   │   ├── login.js
│   │   │   └── dashboard.js
│   │   └── __init__.py
│   ├── config.py               # Configuration
│   ├── utils.py                # Utilities & logging
│   └── __init__.py
├── data/
│   ├── schedule.db             # SQLite database
│   ├── uploads/                # Uploaded Excel files
│   └── backups/                # Database backups
├── logs/                       # Application logs
├── main.py                     # Entry point
├── requirements.txt            # Dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## 🗄️ Database Schema

### Users Table
- user_id (Telegram ID)
- Form of education
- Course
- Selected institute/direction/group
- Saved day selection

### Schedule Table
- Form of education
- Course
- Institute
- Direction
- Group name & number
- Day of week
- Lesson number & time
- Subject
- Teacher
- Room number
- Location

### Supporting Tables
- institutes
- directions
- groups
- admin_users
- parse_logs

---

## 🔐 Security

- Admin panel password protection (set in `.env`)
- Admin action logging
- Database backup functionality
- Input validation and sanitization

---

## 🐛 Troubleshooting

### Bot not responding
- Check TELEGRAM_BOT_TOKEN in `.env`
- Ensure bot token is correct (from @BotFather)
- Check internet connection

### Admin panel won't load
- Verify ADMIN_PASSWORD is set
- Check if port 5000 is not in use
- Try using a different port in config.py

### Excel upload fails
- Ensure file is `.xlsx` or `.xls` format
- Check that column names match expected format
- Review logs in `logs/parser.log`

---

## 📊 Excel File Format

Your Excel file should contain columns with names like:

```
форма обучения | курс | институт | направление | группа | день недели | 
номер пары | время пары | предмет | преподаватель | аудитория | место
```

Or English equivalents:
```
form_of_education | course | institute | direction | group_name | day_of_week |
lesson_number | lesson_time | subject | teacher | room_number | location
```

---

## 📝 Development Stages

- ✅ **Stage 1** - Core bot functions & database
- ✅ **Stage 2** - Filtering & user preferences  
- ✅ **Stage 3** - Admin panel & Excel parsing
- ⏳ **Stage 4** - Testing & deployment

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

---

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Made with ❤️ for students and universities**
