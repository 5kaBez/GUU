import requests
import os
from dotenv import load_dotenv

load_dotenv()
token = os.getenv('TELEGRAM_BOT_TOKEN')
url = f"https://api.telegram.org/bot{token}/getMe"

print(f"Testing URL: {url[:30]}...")
try:
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
