#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect('data/schedule.db')
cursor = conn.cursor()

# Search for programs matching "предпринемательство"
search_term = "%предпринем%"
cursor.execute('SELECT DISTINCT "Программа" FROM schedule WHERE LOWER("Программа") LIKE LOWER(?) LIMIT 10', (search_term,))
results = cursor.fetchall()

print(f'Programs matching "предпринем":')
for row in results:
    print(f'  - {row[0]}')

if not results:
    print('  (No matches found)')
    
# Show all unique programs to see what's available
cursor.execute('SELECT DISTINCT "Программа" FROM schedule ORDER BY "Программа" LIMIT 20')
print('\nFirst 20 unique programs:')
for row in cursor.fetchall():
    print(f'  - {row[0]}')

conn.close()
