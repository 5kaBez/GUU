#!/usr/bin/env python3
"""
Main entry point to run the Telegram bot
"""

import sys
from pathlib import Path

# Add parent directories to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / 'src'))

from src.bot.telegram_bot import bot, logger

if __name__ == '__main__':
    logger.info("=" * 50)
    logger.info("Telegram Bot Starting...")
    logger.info("=" * 50)
    
    try:
        bot.infinity_polling(timeout=10, long_polling_timeout=5)
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
