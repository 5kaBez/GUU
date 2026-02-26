import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Project root
BASE_DIR = Path(__file__).resolve().parent.parent

# Admin Configuration
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')
ADMIN_SECRET_KEY = os.getenv('ADMIN_SECRET_KEY', 'dev-secret-key-change-in-production')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

# Database Configuration
DATABASE_PATH = os.getenv('DATABASE_PATH', str(BASE_DIR / 'data' / 'schedule.db'))
DATABASE_URL = f'sqlite:///{DATABASE_PATH.replace(chr(92), "/")}'

# Flask Configuration
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
FLASK_PORT = int(os.environ.get('PORT', os.getenv('FLASK_PORT', 5000)))

# MiniApp Configuration
# Local development - access directly from browser
MINIAPP_URL = os.getenv('MINIAPP_URL', 'http://localhost:5001/miniapp')

# Upload Configuration
UPLOAD_DIR = BASE_DIR / 'data' / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Backup Configuration
BACKUP_DIR = BASE_DIR / 'data' / 'backups'
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# Logging
LOG_DIR = BASE_DIR / 'logs'
LOG_DIR.mkdir(exist_ok=True)

# Data directories
DATA_DIR = BASE_DIR / 'data'
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR = DATA_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)
BACKUP_DIR = DATA_DIR / 'backups'
BACKUP_DIR.mkdir(exist_ok=True)

# Schedule display configuration
SCHEDULE_START_HOUR = 9
SCHEDULE_END_HOUR = 21
LESSON_TIME_SLOTS = {
    1: ('09:00', '10:30'),
    2: ('10:45', '12:15'),
    3: ('12:55', '14:25'),
    4: ('14:35', '16:05'),
    5: ('16:15', '17:45'),
    6: ('18:00', '19:30'),
    7: ('19:45', '21:15'),
}
