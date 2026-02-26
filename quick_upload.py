#!/usr/bin/env python3
import requests
import time

# Wait for server
time.sleep(2)

session = requests.Session()

# Login first
login_data = {'password': 'admin123'}
try:
    login_response = session.post('http://127.0.0.1:5000/api/login', json=login_data)
    print(f"Login response: {login_response.status_code}")
    
    if login_response.status_code == 200:
        # Upload file
        file_path = r'data/uploads/schedule_full.xlsx'
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = session.post('http://127.0.0.1:5000/api/upload', files=files)
            print(f"Upload response: {response.status_code}")
            print(f"Response: {response.text[:500]}")
    else:
        print(f"Login failed: {login_response.text}")
except Exception as e:
    print(f"Error: {e}")
