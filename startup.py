import subprocess
import sys
import time
from pathlib import Path

def main():
    project_root = Path(__file__).parent.absolute()
    
    print("=" * 50)
    print("🚀 Starting All Services...")
    print("=" * 50)
    
    # 1. Start Admin App
    print("\n[1/2] Starting Flask Admin App...")
    admin_proc = subprocess.Popen(
        [sys.executable, str(project_root / "src" / "admin" / "app.py")],
        cwd=str(project_root)
    )
    
    time.sleep(3) # Give it some time to bind the port
    
    # 2. Start Telegram Bot
    print("[2/2] Starting Telegram Bot...")
    bot_proc = subprocess.Popen(
        [sys.executable, str(project_root / "src" / "bot" / "telegram_bot.py")],
        cwd=str(project_root)
    )
    
    print("\n" + "=" * 50)
    print("✅ All services are running!")
    print(f"   - Admin / Mini App: http://127.0.0.1:5000")
    print("   - Telegram Bot: active")
    print("=" * 50)
    print("\nPress Ctrl+C to stop all services (if running in interactive terminal)")
    
    try:
        # Just keep them running
        while True:
            if admin_proc.poll() is not None:
                print("⚠️ Admin process exited. Restarting...")
                admin_proc = subprocess.Popen(
                    [sys.executable, str(project_root / "src" / "admin" / "app.py")],
                    cwd=str(project_root)
                )
            if bot_proc.poll() is not None:
                print("⚠️ Bot process exited. Restarting...")
                bot_proc = subprocess.Popen(
                    [sys.executable, str(project_root / "src" / "bot" / "telegram_bot.py")],
                    cwd=str(project_root)
                )
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nStopping services...")
        admin_proc.terminate()
        bot_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
