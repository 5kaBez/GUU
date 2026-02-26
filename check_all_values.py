#!/usr/bin/env python3
"""
Check all values in database
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from database.models import Database

db = Database()

print("=" * 60)
print("УРОВЕНЬ ОБРАЗОВАНИЯ (Уровень образования)")
print("=" * 60)
result = db.fetch_all('SELECT DISTINCT "Уровень образования" FROM schedule ORDER BY "Уровень образования"')
for row in result:
    val = row['Уровень образования']
    count = db.fetch_one('SELECT COUNT(*) as cnt FROM schedule WHERE "Уровень образования" = ?', (val,))
    print(f"  '{val}' → {count['cnt']} records")
print()

print("=" * 60)
print("ФОРМА ОБУЧЕНИЯ (Форма обучения)")
print("=" * 60)
result = db.fetch_all('SELECT DISTINCT "Форма обучения" FROM schedule ORDER BY "Форма обучения"')
for row in result:
    val = row['Форма обучения']
    count = db.fetch_one('SELECT COUNT(*) as cnt FROM schedule WHERE "Форма обучения" = ?', (val,))
    print(f"  '{val}' → {count['cnt']} records")
print()

print("=" * 60)
print("КУРСЫ (Курс)")
print("=" * 60)
result = db.fetch_all('SELECT DISTINCT "Курс" FROM schedule ORDER BY "Курс"')
for row in result:
    val = row['Курс']
    count = db.fetch_one('SELECT COUNT(*) as cnt FROM schedule WHERE "Курс" = ?', (val,))
    print(f"  Курс {val} → {count['cnt']} records")
print()

print("=" * 60)
print("ДАННЫЕ ДЛЯ ОЧНАЯ / БАКАЛАВРИАТ / КУРС 2")
print("=" * 60)
result = db.fetch_all('''
    SELECT DISTINCT "Институт", "Направление" FROM schedule 
    WHERE "Форма обучения" = ?
    AND "Уровень образования" = ?
    AND "Курс" = ?
    ORDER BY "Институт", "Направление"
''', ("Очная", "Бакалавриат", 2))
print(f"Found {len(result)} combinations:")
for row in result:
    print(f"  - {row['Институт']} / {row['Направление']}")
print()

# Check if issue is case sensitivity
print("=" * 60)
print("ПОИСК С РАЗНЫМИ ВАРИАНТАМИ УРОВНЯ ОБРАЗОВАНИЯ")
print("=" * 60)
levels = ["Бакалавр", "Бакалавриат", "БАКАЛАВР", "БАКАЛАВРИАТ"]
for level in levels:
    result = db.fetch_all('''
        SELECT COUNT(*) as cnt FROM schedule 
        WHERE "Форма обучения" = ?
        AND "Уровень образования" = ?
        AND "Курс" = ?
    ''', ("Очная", level, 2))
    count = result[0] if result else None
    print(f"  '{level}': {result}")
