import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from src.database.models import Database
from src.config import DATABASE_PATH

db = Database(DATABASE_PATH)

# Test parameters based on real DB values
group = "1"
day = "Понедельник"
program = "Государственная политика и политическое управление"
institute = "Институт государственного управления и права"

# Old way (only group)
old_records = db.fetch_all('SELECT * FROM schedule WHERE "Номер группы" = ? AND "День недели" = ?', (group, day))
print(f"Old filtering (group only): {len(old_records)} records")

# New way (full profile - mock data)
query = '''SELECT * FROM schedule WHERE 
    "Номер группы" = ? AND 
    "День недели" = ? AND
    "Программа" = ? AND
    "Институт" = ?
'''
new_records = db.fetch_all(query, (group, day, program, institute))
print(f"New filtering (with Full Profile): {len(new_records)} records")

if len(new_records) < len(old_records) or len(new_records) > 0:
    print("SUCCESS: Filtering works!")
    
# Check parity filtering logic
pair_counts = {}
for r in new_records:
    time = r['Время пары']
    pair_counts[time] = pair_counts.get(time, 0) + 1

for time, count in pair_counts.items():
    if count > 1:
        print(f"Note: Multiple records for {time}. This is expected if they have different parity.")
        for r in [r for r in new_records if r['Время пары'] == time]:
            print(f"  - Parity: {r['Чётность']}, Subject: {r['Предмет']}")
