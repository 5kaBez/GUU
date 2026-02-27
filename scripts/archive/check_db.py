#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect('data/schedule.db')
cursor = conn.cursor()

# Check Программа column
cursor.execute('SELECT COUNT(*) FROM schedule WHERE "Программа" = "-"')
empty_count = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM schedule')
total = cursor.fetchone()[0]

print(f'Total records: {total}')
print(f'Records with "-" in Программа: {empty_count}')
print(f'Records with real data: {total - empty_count}')

# Show some sample records
print('\nSample records:')
cursor.execute('SELECT "Направление", "Программа" FROM schedule LIMIT 5')
for row in cursor.fetchall():
    print(f'Направление: {row[0]}, Программа: {row[1]}')

conn.close()
