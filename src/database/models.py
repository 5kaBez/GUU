import sqlite3
from pathlib import Path
from datetime import datetime
import sys
import os
import logging

# Try to import from config, but handle case where it might fail during direct execution
try:
    # Add parent directory to path for imports
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from config import DATABASE_PATH
except ImportError:
    DATABASE_PATH = 'data/schedule.db'

logger = logging.getLogger('database')


class Database:
    """Simple SQLite database wrapper for schedule management"""
    
    def __init__(self, db_path=None):
        """Initialize database connection"""
        self.db_path = Path(db_path or DATABASE_PATH)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        # Convert path to absolute to avoid relative path issues on Render
        self.db_path = self.db_path.absolute()
        
        # Simple print is sometimes more reliable than logger during startup
        print(f"DEBUG: Database initialized at: {self.db_path}")
        logger.info(f"Database initialized at: {self.db_path}")
        
        self.init_db()
    
    def init_db(self):
        """Initialize database with required tables"""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Create schedule table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                "Форма обучения" TEXT,
                "Уровень образования" TEXT,
                "Курс" INTEGER,
                "Институт" TEXT,
                "Направление" TEXT,
                "Программа" TEXT,
                "Номер группы" TEXT,
                "День недели" TEXT,
                "Номер пары" INTEGER,
                "Время пары" TEXT,
                "Чётность" TEXT,
                "Предмет" TEXT,
                "Вид пары" TEXT,
                "Преподаватель" TEXT,
                "Номер аудитории" TEXT,
                "Недели" TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create users table for auth and profile
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                full_name TEXT,
                phone TEXT,
                email TEXT,
                avatar_url TEXT,
                "Форма обучения" TEXT,
                "Уровень образования" TEXT,
                "Курс" INTEGER,
                "Институт" TEXT,
                "Направление" TEXT,
                "Программа" TEXT,
                "Номер группы" TEXT,
                profile_completed BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create user_activity table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create feedback table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                rating INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create session_analytics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS session_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_start TIMESTAMP,
                session_end TIMESTAMP,
                duration_seconds INTEGER,
                schedule_views INTEGER DEFAULT 0,
                profile_views INTEGER DEFAULT 0,
                feedback_sent INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create service metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS service_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                service_name TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create applications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                service_name TEXT NOT NULL,
                status TEXT DEFAULT 'submitted',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create parse_logs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS parse_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT,
                status TEXT,
                records_added INTEGER,
                records_failed INTEGER,
                admin_user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create admin_users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admin_users (
                user_id INTEGER PRIMARY KEY,
                role TEXT DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create serveo_usernames table for dynamic Serveo URLs
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS serveo_usernames (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                username TEXT NOT NULL UNIQUE,
                user_hash TEXT NOT NULL,
                serveo_url TEXT,
                status TEXT DEFAULT 'inactive',
                tunnel_pid INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_access TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create serveo_tunnels table for managing SSH tunnels
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS serveo_tunnels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                user_id INTEGER NOT NULL,
                tunnel_pid INTEGER,
                port INTEGER DEFAULT 80,
                local_port INTEGER DEFAULT 5001,
                status TEXT DEFAULT 'stopped',
                health_status TEXT DEFAULT 'unknown',
                last_healthcheck TIMESTAMP,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create serveo_logs table for logging tunnel operations
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS serveo_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                username TEXT,
                action TEXT NOT NULL,
                status TEXT,
                details TEXT,
                error TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create indexes for better performance at scale
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity(timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_schedule_group ON schedule("Номер группы")')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_schedule_institute ON schedule("Институт")')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_schedule_day_parity ON schedule("День недели", "Чётность")')
        # Indexes for Serveo system
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_serveo_usernames_user_id ON serveo_usernames(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_serveo_usernames_status ON serveo_usernames(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_serveo_tunnels_username ON serveo_tunnels(username)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_serveo_tunnels_status ON serveo_tunnels(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_serveo_logs_user_id ON serveo_logs(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_serveo_logs_timestamp ON serveo_logs(timestamp)')
        
        conn.commit()
        conn.close()
    
    def connect(self):
        """Get database connection"""
        return sqlite3.connect(str(self.db_path))
    
    def fetch_one(self, query, params=None):
        """Fetch single row - returns dict"""
        conn = self.connect()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()
    
    def fetch_all(self, query, params=None):
        """Fetch all rows - returns list of dicts"""
        conn = self.connect()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            rows = cursor.fetchall()
            return [dict(row) for row in rows] if rows else []
        finally:
            conn.close()
    
    def execute(self, query, params=None):
        """Execute query without returning results"""
        conn = self.connect()
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            conn.commit()
        finally:
            conn.close()
    
    def close(self):
        """Close database connection"""
        pass  # Not needed for this simple implementation
