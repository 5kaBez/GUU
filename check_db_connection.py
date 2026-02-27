import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

try:
    from src.config import DATABASE_PATH
    from src.database.models import Database
    
    print(f"DATABASE_PATH from config: {DATABASE_PATH}")
    db = Database()
    print(f"Database absolute path: {db.db_path}")
    
    # Test a simple query
    result = db.fetch_one("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if result:
        print("✅ Connection successful: 'users' table found.")
        count = db.fetch_one("SELECT COUNT(*) as count FROM users")
        print(f"✅ User count: {count['count']}")
    else:
        print("❌ 'users' table not found.")

    res_schedule = db.fetch_one("SELECT name FROM sqlite_master WHERE type='table' AND name='schedule'")
    if res_schedule:
        print("✅ 'schedule' table found.")
        count_s = db.fetch_one("SELECT COUNT(*) as count FROM schedule")
        print(f"✅ Schedule record count: {count_s['count']}")
    else:
        print("❌ 'schedule' table not found.")

except Exception as e:
    print(f"❌ Error during DB check: {e}")
    import traceback
    traceback.print_exc()
