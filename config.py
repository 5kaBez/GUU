# Flask Configuration
FLASK_PORT = 5000
ADMIN_SECRET_KEY = 'super-secret-key-change-in-production'
ADMIN_PASSWORD = 'admin'

# Database
DATABASE_PATH = 'data/schedule.db'
BACKUP_DIR = 'data/backups'

# Telegram Bot Token
TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'  # Replace with your actual bot token

# API URLs
# For development with serveo:
# 1. Run: ssh -R 80:localhost:5000 serveo.net
# 2. Copy the URL from output
# 3. Paste it below (example: https://ba70c7965ee82a69-213-135-70-165.serveousercontent.com)
# For localhost (testing only):
# MINIAPP_URL = 'https://localhost:5000/miniapp'
# For production or with ngrok:
# Get your ngrok token from https://dashboard.ngrok.com/get-started/your-authtoken
# Then: ngrok http 5000
# Copy the URL and paste below

import os
MINIAPP_URL = os.getenv('MINIAPP_URL', 'https://guu-s41w.onrender.com/miniapp')

