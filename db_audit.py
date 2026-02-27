import sqlite3
from pathlib import Path
import sys

# Add parent directory to path for imports
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from src.config import DATABASE_PATH

def audit():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("--- Database Audit ---")
    
    # Check column names
    cursor.execute("PRAGMA table_info(schedule)")
    cols = [row['name'] for row in cursor.fetchall()]
    print(f"Schedule Columns: {cols}")
    
    # Check for trailing spaces in 'Институт' or 'Программа'
    print("\nSample values with raw representation:")
    for col in ['Институт', 'Номер группы', 'Чётность', 'Недели']:
        if col in cols:
            cursor.execute(f'SELECT DISTINCT "{col}" FROM schedule LIMIT 5')
            vals = [row[0] for row in cursor.fetchall()]
            print(f"  {col}: {vals!r}")

    # Check a specific user profile if exists
    cursor.execute("SELECT * FROM users LIMIT 1")
    user = cursor.fetchone()
    if user:
        print(f"\nSample User Profile: {dict(user)}")
    
    conn.close()

if __name__ == "__main__":
    audit()
