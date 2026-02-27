#!/usr/bin/env python3
"""
Test bot functionality without running polling
"""

import sys
from pathlib import Path
from datetime import datetime

# Add parent directories to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / 'src'))

from src.bot.telegram_bot import (
    get_institutes, get_directions_for_filter, get_programs_for_filter,
    get_groups_for_filter, get_schedule_for_day, get_week_parity, logger
)

print("✅ Imports successful!")
print()

# Test 1: Get institutes
print("Test 1: Get institutes")
institutes = get_institutes()
print(f"Found {len(institutes)} institutes:")
for inst in institutes:
    print(f"  - {inst}")
print()

# Test 2: Get week parity for today
print("Test 2: Week parity for today")
today = datetime.now()
parity = get_week_parity(today)
day_name = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][today.weekday()]
print(f"Today: {day_name}, {today.strftime('%d.%m.%Y')}")
print(f"Week parity: {parity} ({'четная' if parity == 1 else 'нечетная'})")
print()

# Test 3: Get directions for a specific filter
print("Test 3: Get directions for Очная/Бакалавриат/2/Институт экономики и финансов")
directions = get_directions_for_filter("Очная", "Бакалавриат", 2, "Институт экономики и финансов")
print(f"Found {len(directions)} directions:")
for dir in directions:
    print(f"  - {dir}")
print()

# Test 4: Get programs for first direction
if directions:
    direction = directions[0]
    print(f"Test 4: Get programs for direction '{direction}'")
    programs = get_programs_for_filter("Очная", "Бакалавриат", 2, "Институт экономики и финансов", direction)
    print(f"Found {len(programs)} programs:")
    for prog in programs:
        print(f"  - {prog}")
    print()

    # Test 5: Get groups for first program
    if programs:
        program = programs[0]
        print(f"Test 5: Get groups for program '{program}'")
        groups = get_groups_for_filter(program)
        print(f"Found {len(groups)} groups:")
        for group in groups:
            print(f"  - {group}")
        print()

        # Test 6: Get schedule for today
        if groups:
            group = groups[0]
            print(f"Test 6: Get schedule for today (group '{group}')")
            schedule = get_schedule_for_day(
                "Очная", "Бакалавриат", 2, "Институт экономики и финансов",
                direction, program, group, today
            )
            print(f"Found {len(schedule)} lessons:")
            for lesson in schedule:
                print(f"  - Пара {lesson['Номер пары']}: {lesson['Предмет']} ({lesson['Вид пары']})")
            print()

print("✅ All tests completed!")
