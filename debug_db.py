#!/usr/bin/env python3
"""
Debug database contents
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from database.models import Database

db = Database()

# Show what education levels exist
print("Education levels in DB:")
result = db.fetch_all('SELECT DISTINCT "Уровень образования" FROM schedule ORDER BY "Уровень образования"')
for row in result:
    print(f"  - {row['Уровень образования']}")
print()

# Show forms of education
print("Forms of education in DB:")
result = db.fetch_all('SELECT DISTINCT "Форма обучения" FROM schedule ORDER BY "Форма обучения"')
for row in result:
    print(f"  - {row['Форма обучения']}")
print()

# Show courses available for очная/бакалавр in this institute
print("Courses for Очная/Бакалавр/Институт экономики и финансов:")
result = db.fetch_all('''
    SELECT DISTINCT "Курс" FROM schedule 
    WHERE "Форма обучения" = ?
    AND "Уровень образования" = ?
    AND "Институт" = ?
    ORDER BY "Курс"
''', ("Очная", "Бакалавр", "Институт экономики и финансов"))
for row in result:
    print(f"  - Курс {row['Курс']}")
print()

# Show directions for очная/бакалавр/1
print("Directions for Очная/Бакалавр/1/Институт экономики и финансов:")
result = db.fetch_all('''
    SELECT DISTINCT "Направление" FROM schedule 
    WHERE "Форма обучения" = ?
    AND "Уровень образования" = ?
    AND "Курс" = ?
    AND "Институт" = ?
    ORDER BY "Направление"
''', ("Очная", "Бакалавр", 1, "Институт экономики и финансов"))
if result:
    for row in result:
        print(f"  - {row['Направление']}")
else:
    print("  (No results)")
    
    # Check what we do have for this institute
    print("\nAll data for Институт экономики и финансов:")
    result = db.fetch_all('''
        SELECT DISTINCT "Форма обучения", "Уровень образования", "Курс" FROM schedule 
        WHERE "Институт" = ?
        ORDER BY "Форма обучения", "Уровень образования", "Курс"
    ''', ("Институт экономики и финансов",))
    for row in result:
        print(f"  - {row['Форма обучения']}, {row['Уровень образования']}, Курс {row['Курс']}")
