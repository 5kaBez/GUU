#!/usr/bin/env python3
"""
Check what's in database for this group
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from database.models import Database

db = Database()

program = "Предпринимательство"
group = "1"

query = '''
    SELECT * FROM schedule 
    WHERE "Программа" = ? AND "Номер группы" = ?
    AND "День недели" = 'Четверг'
    LIMIT 10
'''

result = db.fetch_all(query, (program, group))

print(f"Records for program '{program}', group '{group}' on Thursday:")
print(f"Total: {len(result)}")
print()

if result:
    first = result[0]
    print("Available columns:")
    for key in first.keys():
        val = first[key]
        print(f"  {key}: {val} (type: {type(val).__name__})")
    print()
    
    # Show all records
    print("All records:")
    for r in result:
        print(f"  - Номер пары: {r['Номер пары']} | Предмет: {r['Предмет']} | Чётность: {r['Чётность']}")
