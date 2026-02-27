#!/usr/bin/env python3
"""
Startup script to run both Flask admin app and Telegram bot concurrently
"""

import sys
from pathlib import Path
import threading
import time

# Add parent directories to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / 'src'))

from src.admin.app import run_admin_app
from src.bot.telegram_bot import bot, logger

def run_admin():
    """Run Flask admin app in a separate thread"""
    logger.info("Starting Flask Admin Panel...")
    try:
        run_admin_app(debug=False, port=5000)
    except Exception as e:
        logger.error(f"Admin app error: {e}", exc_info=True)

def run_bot_polling():
    """Run Telegram bot in main thread"""
    logger.info("Starting Telegram Bot...")
    try:
        bot.infinity_polling(timeout=10, long_polling_timeout=5)
    except Exception as e:
        logger.error(f"Bot error: {e}", exc_info=True)

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("STARTING SCHEDULE BOT SYSTEM")
    logger.info("Admin Panel: http://localhost:5000")
    logger.info("=" * 60)
    
    # Start admin app in a separate thread
    admin_thread = threading.Thread(target=run_admin, daemon=True)
    admin_thread.start()
    
    # Give admin app time to start
    time.sleep(2)
    
    try:
        # Run bot in main thread
        run_bot_polling()
    except KeyboardInterrupt:
        logger.info("System stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
