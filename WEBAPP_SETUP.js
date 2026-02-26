/**
 * Web App Setup Guide for Telegram Bot
 * 
 * STEP 1: Get Public URL via serveo
 * ================================
 * 
 * Open PowerShell and run:
 * ssh -R 80:localhost:5000 serveo.net
 * 
 * You'll get output like:
 * "Forwarding HTTP traffic from https://xxxxxxxxxx.serveousercontent.com"
 * 
 * Copy this URL (without the trailing slash)
 * Example: https://ba70c7965ee82a69-213-135-70-165.serveousercontent.com
 * 
 * 
 * STEP 2: Create Web App in BotFather
 * ===================================
 * 
 * Go to BotFather in Telegram
 * Send: /newapp
 * 
 * Fill in:
 * - App name: Расписание
 * - Short name: raspisanie
 * - App URL: https://YOUR_SERVEO_URL/miniapp
 * 
 * Example:
 * App URL: https://ba70c7965ee82a69-213-135-70-165.serveousercontent.com/miniapp
 * 
 * Save and get username of your Web App
 * 
 * 
 * STEP 3: Add Web App Button to Bot Menu
 * ======================================
 * 
 * In BotFather send: /setmenubutton
 * Select your bot
 * When asked "what should the menu button open?", select "Web App"
 * Enter the Web App URL from Step 2
 * 
 * 
 * STEP 4: (Alternative) Add Web App Button in Code
 * =================================================
 * 
 * If you want to add it directly in the bot code:
 * 
 * from telebot import types
 * 
 * # In your main menu function:
 * web_app_btn = types.InlineKeyboardButton(
 *     "💻 Открыть приложение",
 *     web_app=types.WebAppInfo(url="https://YOUR_SERVEO_URL/miniapp")
 * )
 * 
 * 
 * IMPORTANT NOTES:
 * ===============
 * 
 * 1. Flask MUST be running on localhost:5000
 * 2. Serveo URL is temporary - when you restart serveo, you get a new URL
 * 3. For production, use proper HTTPS URL (buy domain, SSL cert)
 * 4. Self-signed certificates work with serveo tunnels
 * 5. User ID from Telegram is automatically passed through Web App API
 * 
 */

const SETUP_NOTES = `
QUICK START:
1. Terminal 1: python src/admin/app.py  (Flask on :5000)
2. Terminal 2: ssh -R 80:localhost:5000 serveo.net  (Get public URL)
3. Copy the URL from step 2
4. Paste into BotFather menu button settings
5. Done!
`;
