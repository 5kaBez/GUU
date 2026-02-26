#!/usr/bin/env python3
"""
Check what courses have Predprinimatelstvo
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from database.models import Database

db = Database()

program = "Предпринимательство"

query = '''
    SELECT DISTINCT "Курс" FROM schedule 
    WHERE "Программа" = ?
    ORDER BY "Курс"
'''

result = db.fetch_all(query, (program,))

print(f"Courses available for program '{program}':")
for r in result:
    print(f"  - Course {r['Курс']}")
print()

# Check which combination has data
query2 = '''
    SELECT DISTINCT "Курс", "Номер группы" FROM schedule 
    WHERE "Программа" = ?
    ORDER BY "Курс", "Номер группы"
'''

result2 = db.fetch_all(query2, (program,))
print(f"All group-course combinations for '{program}':")
for r in result2:
    print(f"  - Course {r['Курс']}, Group {r['Номер группы']}")
