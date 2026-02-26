#!/usr/bin/env python3
"""
Run all services: Admin Flask, MiniApp HTTP server, and Telegram bot
"""

import subprocess
import sys
import time
import threading
from pathlib import Path

def run_command(cmd, name):
    """Run a command in subprocess"""
    print(f"\n{'='*50}")
    print(f"Starting: {name}")
    print(f"Command: {' '.join(cmd)}")
    print(f"{'='*50}\n")
    
    try:
        subprocess.run(cmd, cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print(f"\n{name} stopped by user")
    except Exception as e:
        print(f"Error running {name}: {e}")

def main():
    # Start MiniApp HTTP server in background
    miniapp_proc = subprocess.Popen(
        [sys.executable, 'miniapp_http_server.py'],
        cwd=Path(__file__).parent
    )
    print("[OK] MiniApp HTTP server started (port 5001)")
    time.sleep(2)
    
    # Start Telegram bot
    bot_proc = subprocess.Popen(
        [sys.executable, 'src/bot/telegram_bot.py'],
        cwd=Path(__file__).parent
    )
    print("[OK] Telegram bot started")
    
    try:
        print("\n" + "="*50)
        print("Services running:")
        print("  - MiniApp HTTP: http://localhost:5001/miniapp")
        print("  - Telegram Bot: polling updates")
        print("="*50)
        print("\nPress Ctrl+C to stop all services\n")
        
        # Wait indefinitely
        miniapp_proc.wait()
    except KeyboardInterrupt:
        print("\n\nStopping all services...")
        miniapp_proc.terminate()
        bot_proc.terminate()
        
        # Wait for graceful shutdown
        time.sleep(2)
        miniapp_proc.kill()
        bot_proc.kill()
        print("All services stopped")
        sys.exit(0)

if __name__ == '__main__':
    main()
