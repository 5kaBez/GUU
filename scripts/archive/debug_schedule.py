#!/usr/bin/env python3
"""
Debug schedule query
"""

import sys
from pathlib import Path
from datetime import datetime
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from database.models import Database

db = Database()

# Test data
form = "Очная"
education = "Бакалавриат"
course = 2  # INTEGER
institute = "Институт экономики и финансов"
direction = "МЕНЕДЖМЕНТ"
program = "Предпринимательство"
group = "1"

# Get day and parity
today = datetime.now()
day_of_week = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][today.weekday()]

# Week parity
week_start = datetime(2026, 2, 9)
days_diff = (today - week_start).days
week_number = days_diff // 7 + 1
week_parity = 1 if week_number % 2 == 0 else 0

print(f"Searching for schedule:")
print(f"  Form: {form}")
print(f"  Education: {education}")
print(f"  Course: {course} (type: {type(course)})")
print(f"  Institute: {institute}")
print(f"  Direction: {direction}")
print(f"  Program: {program}")
print(f"  Group: {group}")
print(f"  Day: {day_of_week}")
print(f"  Parity: {week_parity}")
print()

# Raw query
query = '''
    SELECT * FROM schedule 
    WHERE "Форма обучения" = ?
    AND "Уровень образования" = ?
    AND "Курс" = ?
    AND "Институт" = ?
    AND "Направление" = ?
    AND "Программа" = ?
    AND "Номер группы" = ?
    AND "День недели" = ?
    AND "Чётность" = ?
    ORDER BY "Номер пары"
'''

result = db.fetch_all(query, (
    form, education, course, institute,
    direction, program, group, day_of_week, str(week_parity)
))

print(f"Found {len(result)} records")
if result:
    for r in result[:3]:
        print(f"  - Пара {r['Номер пары']}: {r['Предмет']}")
else:
    print("No records found. Let's debug...")
    
    # Check if group 1 exists with this combo
    print("\nChecking if group exists for this program:")
    query2 = '''SELECT DISTINCT "Номер группы" FROM schedule WHERE "Программа" = ? ORDER BY "Номер группы"'''
    groups = db.fetch_all(query2, (program,))
    for g in groups:
        print(f"  - Group: {g['Номер группы']}")
    
    # Check what we have for Thursday
    print("\nChecking Thursday records:")
    query3 = '''
        SELECT DISTINCT "Форма обучения", "Уровень образования", "Курс", "Номер группы" FROM schedule 
        WHERE "День недели" = ?
        AND "Чётность" = ?
        LIMIT 10
    '''
    thu_records = db.fetch_all(query3, (day_of_week, str(week_parity)))
    for r in thu_records:
        print(f"  - {r['Форма обучения']}, {r['Уровень образования']}, Course {r['Курс']}, Group {r['Номер группы']}")
