#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect('data/schedule.db')
cursor = conn.cursor()

# Search for programs with any variation of "предпринем"
search_term = "%предпринимательство%"
cursor.execute('SELECT DISTINCT "Программа" FROM schedule WHERE LOWER("Программа") LIKE ? ORDER BY "Программа"', (search_term.lower(),))
results = cursor.fetchall()

print(f'Programs with "предприним":')
for row in results:
    print(f'  - {row[0]}')

if not results:
    print('  (Not found - checking for similar...)')
    cursor.execute('SELECT DISTINCT "Программа" FROM schedule WHERE "Программа" LIKE ? ORDER BY "Программа"', ('%[Пп]редпринимательств%',))
    results = cursor.fetchall()
    for row in results:
        print(f'  - {row[0]}')

# Check if we have the exact one
cursor.execute('SELECT COUNT(*) FROM schedule WHERE "Программа" LIKE ?', ('%предпринимательство%',))
count = cursor.fetchone()[0]
print(f'\nTotal records with "предпринимательство": {count}')

conn.close()
