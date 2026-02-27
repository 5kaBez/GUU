from flask import Flask, render_template, request, jsonify, session, send_from_directory
from functools import wraps
import sys
from pathlib import Path
import os
from datetime import datetime
import shutil

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import FLASK_PORT, ADMIN_SECRET_KEY, ADMIN_PASSWORD, DATABASE_PATH, BACKUP_DIR
from database import Database
from parser import ExcelParser
from utils import setup_logging

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = ADMIN_SECRET_KEY

# Session configuration
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

db = Database(DATABASE_PATH)
parser = ExcelParser(db=db)
logger = setup_logging('admin_app')


def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        return f(*args, **kwargs)
    return decorated_function


@app.route('/admin')
def admin_panel():
    """Admin panel main page"""
    if 'admin_id' in session:
        return render_template('dashboard.html')
    return render_template('login.html')


@app.route('/')
def index():
    """Redirect root to miniapp"""
    miniapp_dist = Path(__file__).parent.parent.parent / 'miniapp' / 'dist'
    logger.info(f"Serving miniapp from: {miniapp_dist.absolute()}")
    if not miniapp_dist.exists():
        return jsonify({'error': 'Miniapp not built yet', 'path': str(miniapp_dist.absolute())}), 404
    
    response = send_from_directory(miniapp_dist, 'index.html')
    response.headers['X-Deployment-ID'] = 'v3-routing-fix'
    return response


@app.route('/miniapp')
@app.route('/miniapp/')
def miniapp():
    """Serve the React miniapp"""
    miniapp_dist = Path(__file__).parent.parent.parent / 'miniapp' / 'dist'
    if not miniapp_dist.exists():
        return jsonify({'error': 'Miniapp not built yet'}), 404
    return send_from_directory(miniapp_dist, 'index.html')


@app.route('/miniapp/<path:path>')
def miniapp_static(path):
    """Serve miniapp static files"""
    miniapp_dist = Path(__file__).parent.parent.parent / 'miniapp' / 'dist'
    return send_from_directory(miniapp_dist, path)


@app.route('/assets/<path:path>')
def assets_static(path):
    """Serve miniapp assets directly (fallback for absolute paths)"""
    assets_dir = Path(__file__).parent.parent.parent / 'miniapp' / 'dist' / 'assets'
    return send_from_directory(assets_dir, path)


@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate admin user"""
    data = request.get_json()
    password = data.get('password', '')
    
    logger.info(f"Login attempt with password: {password[:1]}... from {request.remote_addr}")
    logger.info(f"Expected password: {ADMIN_PASSWORD[:1]}...")
    
    if password == ADMIN_PASSWORD:
        admin_id = request.remote_addr  # Simple admin ID
        session.permanent = True  # Make session persistent
        session['admin_id'] = admin_id
        
        # Save to database
        db.execute(
            'INSERT OR IGNORE INTO admin_users (user_id, role) VALUES (?, ?)',
            (hash(admin_id), 'admin')
        )
        
        logger.info(f"✅ Admin logged in successfully from {admin_id}")
        return jsonify({'success': True, 'message': 'Login successful'}), 200
    
    logger.warning(f"❌ Failed login attempt from {request.remote_addr}")
    return jsonify({'error': 'Invalid password'}), 401


def logout():
    """Logout admin user"""
    session.clear()
    return jsonify({'success': True}), 200


# ========== MINIAPP API ENDPOINTS ==========




@app.route('/api/miniapp/schedule/<user_id>', methods=['GET'])
def get_miniapp_schedule(user_id):
    """Get user's schedule for MiniApp"""
    try:
        user = db.fetch_one('SELECT "Номер группы" FROM users WHERE user_id = ?', (user_id,))
        
        if not user or not user.get('Номер группы'):
            return jsonify({'schedule': [], 'message': 'User profile not complete'}), 200
        
        group = user.get('Номер группы')
        
        # Get schedule for this group
        schedule = db.fetch_all(
            'SELECT * FROM schedule WHERE "Номер группы" = ? ORDER BY "День" ASC',
            (group,)
        )
        
        return jsonify({
            'group': group,
            'schedule': schedule,
            'count': len(schedule)
        }), 200
    except Exception as e:
        logger.error(f"Error getting schedule for miniapp: {str(e)}")
        return jsonify({'error': str(e)}), 500





@app.route('/api/dashboard', methods=['GET'])
@login_required
def get_dashboard():
    """Get dashboard statistics with DAU/MAU metrics"""
    schedule_count = db.fetch_one(
        'SELECT COUNT(*) as count FROM schedule'
    )
    
    institutes_count = db.fetch_one(
        'SELECT COUNT(DISTINCT "Институт") as count FROM schedule'
    )
    
    # Count distinct programs (Программа)
    programs_count = db.fetch_one(
        'SELECT COUNT(DISTINCT "Программа") as count FROM schedule'
    )
    
    users_count = db.fetch_one(
        'SELECT COUNT(*) as count FROM users'
    )
    
    # DAU - Daily Active Users (today)
    dau = db.fetch_one('''
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_activity 
        WHERE DATE(timestamp) = DATE('now')
    ''')
    
    # MAU - Monthly Active Users (last 30 days)
    mau = db.fetch_one('''
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_activity 
        WHERE timestamp >= datetime('now', '-30 days')
    ''')
    
    recent_logs = db.fetch_all(
        'SELECT * FROM parse_logs ORDER BY created_at DESC LIMIT 5'
    )
    
    return jsonify({
        'schedule_records': schedule_count.get('count', 0) if schedule_count else 0,
        'institutes': institutes_count.get('count', 0) if institutes_count else 0,
        'programs': programs_count.get('count', 0) if programs_count else 0,
        'users': users_count.get('count', 0) if users_count else 0,
        'dau': dau.get('count', 0) if dau else 0,
        'mau': mau.get('count', 0) if mau else 0,
        'recent_logs': recent_logs
    }), 200


@app.route('/api/upload', methods=['POST'])
@login_required
def upload_schedule():
    """Upload and parse Excel schedule file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    mode = request.form.get('mode', 'append')  # 'append' or 'replace'
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        return jsonify({'error': 'Only Excel (.xlsx, .xls) and CSV files are supported'}), 400
    
    try:
        # Save uploaded file
        from config import UPLOAD_DIR
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filepath = os.path.join(UPLOAD_DIR, file.filename)
        file.save(filepath)
        
        logger.info(f"File uploaded: {filepath}")
        
        # Before parsing, count current records
        before_count = db.fetch_one('SELECT COUNT(*) as count FROM schedule')
        before_records = before_count['count'] if before_count else 0
        
        # Parse file
        df = parser.parse_file(filepath)
        logger.info(f"Parsed {len(df)} records from file")
        
        # Save to database
        result = parser.save_to_database(df, mode=mode, admin_user_id=None)
        
        # After saving, count records again
        after_count = db.fetch_one('SELECT COUNT(*) as count FROM schedule')
        after_records = after_count['count'] if after_count else 0
        
        # Log the action
        admin_user_id = hash(request.remote_addr)
        db.execute(
            '''INSERT INTO parse_logs 
               (admin_user_id, filename, records_added, status)
               VALUES (?, ?, ?, ?)''',
            (admin_user_id, file.filename, result['records_added'], 'success')
        )
        
        logger.info(f"✅ Upload completed successfully: {result['records_added']} records added")
        
        return jsonify({
            'success': True,
            'message': f'Successfully loaded {result["records_added"]} records',
            'records_added': result['records_added'],
            'records_failed': result['records_failed'],
            'total_records': after_records
        }), 200
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Upload error: {error_msg}", exc_info=True)
        
        admin_user_id = hash(request.remote_addr)
        db.execute(
            '''INSERT INTO parse_logs 
               (admin_user_id, filename, status, error_message)
               VALUES (?, ?, ?, ?)''',
            (admin_user_id, file.filename if 'file' in locals() else 'unknown', 
             'failed', error_msg)
        )
        
        return jsonify({'error': f'Upload failed: {error_msg}'}), 500


@app.route('/api/clear-database', methods=['POST'])
@login_required
def clear_database():
    """Clear schedule database"""
    try:
        db.execute('DELETE FROM schedule')
        logger.info("Database cleared by admin")
        return jsonify({'success': True}), 200
    except Exception as e:
        logger.error(f"Error clearing database: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/logs', methods=['GET'])
@login_required
def get_logs():
    """Get parse logs"""
    logs = db.fetch_all(
        'SELECT * FROM parse_logs ORDER BY created_at DESC LIMIT 50'
    )
    return jsonify(logs), 200


@app.route('/api/create-backup', methods=['POST'])
@login_required
def create_backup():
    """Create database backup"""
    try:
        backup_name = f"schedule_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        backup_path = BACKUP_DIR / backup_name
        
        shutil.copy2(DATABASE_PATH, str(backup_path))
        
        logger.info(f"Backup created: {backup_name}")
        return jsonify({
            'success': True,
            'filename': backup_name
        }), 200
    except Exception as e:
        logger.error(f"Backup error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ==================== SCHEDULE VIEW ENDPOINTS ====================

@app.route('/api/schedule', methods=['GET'])
@login_required
def get_schedule():
    """Get schedule records with pagination, filtering, search and sorting"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        # Get filters
        group_search = request.args.get('group_search', '', type=str)
        course = request.args.get('course', '', type=str)
        institute = request.args.get('institute', '', type=str)
        direction = request.args.get('direction', '', type=str)
        day = request.args.get('day', '', type=str)
        sort = request.args.get('sort', 'group_asc', type=str)
        
        offset = (page - 1) * limit
        
        # Build query with filters using EXACT Russian column names
        query = 'SELECT * FROM schedule WHERE 1=1'
        params = []
        
        if group_search:
            query += ' AND "Программа" LIKE ?'
            params.append(f'%{group_search}%')
        
        if course:
            try:
                course_num = int(course)
                query += ' AND "Курс" = ?'
                params.append(course_num)
            except ValueError:
                pass
        
        if institute:
            query += ' AND "Институт" = ?'
            params.append(institute)
        
        if direction:
            query += ' AND "Направление" = ?'
            params.append(direction)
        
        if day:
            query += ' AND "День недели" = ?'
            params.append(day)
        
        # Add sorting
        if sort == 'group_desc':
            query += ' ORDER BY "Программа" DESC'
        elif sort == 'time_asc':
            query += ' ORDER BY "Время пары" ASC'
        elif sort == 'time_desc':
            query += ' ORDER BY "Время пары" DESC'
        else:  # group_asc default
            query += ' ORDER BY "Программа" ASC'
        
        # Add pagination
        query += ' LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        schedules = db.fetch_all(query, tuple(params) if params else None)
        
        # Get total count
        count_query = 'SELECT COUNT(*) as count FROM schedule WHERE 1=1'
        count_params = []
        
        if group_search:
            count_query += ' AND "Программа" LIKE ?'
            count_params.append(f'%{group_search}%')
        if course:
            try:
                count_query += ' AND "Курс" = ?'
                count_params.append(int(course))
            except ValueError:
                pass
        if institute:
            count_query += ' AND "Институт" = ?'
            count_params.append(institute)
        if direction:
            count_query += ' AND "Направление" = ?'
            count_params.append(direction)
        if day:
            count_query += ' AND "День недели" = ?'
            count_params.append(day)
        
        count_result = db.fetch_one(count_query, tuple(count_params) if count_params else None)
        total = count_result['count'] if count_result else 0
        
        return jsonify({
            'success': True,
            'data': schedules,
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }), 200
    except Exception as e:
        logger.error(f"Error fetching schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/schedule/groups', methods=['GET'])
@login_required
def get_groups():
    """Get list of all groups in schedule"""
    try:
        groups = db.fetch_all(
            'SELECT DISTINCT "Программа" FROM schedule WHERE "Программа" IS NOT NULL ORDER BY "Программа"'
        )
        group_list = [g['Программа'] for g in groups if g.get('Программа')]
        
        return jsonify({
            'success': True,
            'groups': group_list,
            'total': len(group_list)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching groups: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/schedule/filters', methods=['GET'])
@login_required
def get_filter_options():
    """Get all filter options (courses, institutes, days)"""
    try:
        courses = db.fetch_all(
            'SELECT DISTINCT "Курс" FROM schedule WHERE "Курс" IS NOT NULL ORDER BY "Курс"'
        )
        institutes = db.fetch_all(
            'SELECT DISTINCT "Институт" FROM schedule WHERE "Институт" IS NOT NULL ORDER BY "Институт"'
        )
        days = db.fetch_all(
            'SELECT DISTINCT "День недели" FROM schedule WHERE "День недели" IS NOT NULL'
        )
        
        course_list = sorted([c['Курс'] for c in courses if c.get('Курс') is not None])
        institute_list = [i['Институт'] for i in institutes if i.get('Институт')]
        day_list = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
        
        return jsonify({
            'success': True,
            'courses': course_list,
            'institutes': institute_list,
            'days': day_list
        }), 200
    except Exception as e:
        logger.error(f"Error fetching filter options: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/schedule/by-group/<group_name>', methods=['GET'])
@login_required
def get_schedule_by_group(group_name):
    """Get schedule for specific group"""
    try:
        schedules = db.fetch_all(
            '''SELECT * FROM schedule 
               WHERE "Программа" = ? 
               ORDER BY "День недели", "Номер пары"''',
            (group_name,)
        )
        
        if not schedules:
            return jsonify({
                'success': False,
                'error': f'No schedule found for group {group_name}'
            }), 404
        
        return jsonify({
            'success': True,
            'group': group_name,
            'data': schedules,
            'total': len(schedules)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching schedule for group {group_name}: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/schedule/directions', methods=['GET'])
@login_required
def get_directions_by_institute():
    """Get directions for selected institute"""
    try:
        institute = request.args.get('institute', '', type=str)
        
        if not institute:
            # Return all directions if no institute selected
            directions = db.fetch_all(
                'SELECT DISTINCT "Направление" FROM schedule WHERE "Направление" IS NOT NULL ORDER BY "Направление"'
            )
        else:
            # Return only directions for selected institute
            directions = db.fetch_all(
                'SELECT DISTINCT "Направление" FROM schedule WHERE "Институт" = ? AND "Направление" IS NOT NULL ORDER BY "Направление"',
                (institute,)
            )
        
        direction_list = [d['Направление'] for d in directions if d.get('Направление')]
        
        return jsonify({
            'success': True,
            'institute': institute,
            'directions': direction_list,
            'total': len(direction_list)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching directions: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ==================== USERS VIEW ENDPOINTS ====================

@app.route('/api/users', methods=['GET'])
@login_required
def get_users():
    """Get list of users with their profiles and activity data"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        
        offset = (page - 1) * limit
        
        # Updated query to include user profile data
        users = db.fetch_all(
            '''SELECT 
                u.user_id,
                u.username,
                u."Форма обучения",
                u."Уровень образования",
                u."Курс",
                u."Институт",
                u."Направление",
                u."Программа",
                u."Номер группы",
                u.created_at,
                u.updated_at,
                COUNT(a.id) as total_actions,
                MAX(a.timestamp) as last_activity
               FROM users u
               LEFT JOIN user_activity a ON u.user_id = a.user_id
               GROUP BY u.user_id
               ORDER BY u.created_at DESC 
               LIMIT ? OFFSET ?''',
            (limit, offset)
        )
        
        # Get total count
        count_result = db.fetch_one('SELECT COUNT(*) as count FROM users')
        total = count_result['count'] if count_result else 0
        
        # Convert users to list of dicts for JSON serialization
        users_data = []
        for user in users:
            users_data.append({
                'user_id': user['user_id'],
                'username': user['username'] or '—',
                'form': user['Форма обучения'] or '—',
                'education': user['Уровень образования'] or '—',
                'course': user['Курс'] or '—',
                'institute': user['Институт'] or '—',
                'direction': user['Направление'] or '—',
                'program': user['Программа'] or '—',
                'group': user['Номер группы'] or '—',
                'created_at': user['created_at'],
                'updated_at': user['updated_at'],
                'total_actions': user['total_actions'] or 0,
                'last_activity': user['last_activity']
            })
        
        return jsonify({
            'success': True,
            'data': users_data,
            'page': page,
            'limit': limit,
            'total': total,
            'pages': (total + limit - 1) // limit
        }), 200
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """Get specific user profile"""
    try:
        user = db.fetch_one('SELECT * FROM users WHERE user_id = ?', (user_id,))
        
        if not user:
            return jsonify({
                'success': False,
                'error': f'User {user_id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': dict(user)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>/sessions', methods=['GET'])
@login_required
def get_user_sessions(user_id):
    """Get all sessions and activities for a specific user"""
    try:
        activities = db.fetch_all(
            'SELECT action, timestamp FROM user_activity WHERE user_id = ? ORDER BY timestamp DESC',
            (user_id,)
        )
        
        # Group activities into sessions
        sessions = []
        current_session = None
        
        for activity in activities:
            if activity['action'] == 'session_start':
                if current_session:
                    sessions.append(current_session)
                current_session = {
                    'start': activity['timestamp'],
                    'end': None,
                    'actions': []
                }
            elif activity['action'] == 'session_end' and current_session:
                current_session['end'] = activity['timestamp']
            elif current_session:
                current_session['actions'].append({
                    'action': activity['action'],
                    'timestamp': activity['timestamp']
                })
        
        # Add last session if unclosed
        if current_session:
            sessions.append(current_session)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'sessions': sessions,
            'total_sessions': len(sessions),
            'total_actions': len(activities)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching sessions for user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ==================== FEEDBACK ENDPOINTS ====================

@app.route('/api/feedback', methods=['GET'])
@login_required
def get_feedback():
    """Get all feedback from users"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        offset = (page - 1) * limit
        
        # Get feedback with user information
        feedback_list = db.fetch_all('''
            SELECT 
                f.id,
                f.user_id,
                u.username,
                u."Номер группы" as user_group,
                f.message,
                f.created_at
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.user_id
            ORDER BY f.created_at DESC
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        # Get total count
        total = db.fetch_one('SELECT COUNT(*) as count FROM feedback')
        total_count = total['count'] if total else 0
        
        return jsonify({
            'success': True,
            'data': feedback_list,
            'page': page,
            'limit': limit,
            'total': total_count,
            'pages': (total_count + limit - 1) // limit
        }), 200
    except Exception as e:
        logger.error(f"Error fetching feedback: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ==================== ANALYTICS ENDPOINTS ====================

@app.route('/api/analytics', methods=['GET'])
@login_required
def get_analytics():
    """Get user activity analytics with service metrics"""
    try:
        # Total active users (users who have at least one activity)
        active_users = db.fetch_one(
            'SELECT COUNT(DISTINCT user_id) as count FROM user_activity'
        )
        
        # Total feedback messages
        feedback_count = db.fetch_one(
            'SELECT COUNT(*) as count FROM feedback'
        )
        
        # Top activities
        top_actions = db.fetch_all('''
            SELECT action, COUNT(*) as count 
            FROM user_activity 
            GROUP BY action 
            ORDER BY count DESC 
            LIMIT 10
        ''')
        
        # Service clicks breakdown
        service_clicks = db.fetch_all('''
            SELECT action, COUNT(*) as count 
            FROM user_activity 
            WHERE action IN ('view_services', 'click_physical', 'click_job', 'click_homemeal')
            GROUP BY action
        ''')
        
        # Users per institute (top 10)
        users_per_institute = db.fetch_all('''
            SELECT "Институт", COUNT(*) as count 
            FROM users 
            WHERE "Институт" IS NOT NULL
            GROUP BY "Институт" 
            ORDER BY count DESC 
            LIMIT 10
        ''')
        
        # Users per course
        users_per_course = db.fetch_all('''
            SELECT "Курс", COUNT(*) as count 
            FROM users 
            WHERE "Курс" IS NOT NULL
            GROUP BY "Курс" 
            ORDER BY "Курс"
        ''')
        
        # Feedback frequency (last 7 days)
        feedback_last_7 = db.fetch_all('''
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM feedback 
            WHERE created_at >= datetime('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        ''')
        
        # Retention metrics - D1 (users active today who were active yesterday)
        retention_d1 = db.fetch_one('''
            SELECT COUNT(DISTINCT user_id) as count
            FROM user_activity
            WHERE DATE(timestamp) = DATE('now')
            AND user_id IN (
                SELECT DISTINCT user_id 
                FROM user_activity 
                WHERE DATE(timestamp) = DATE('now', '-1 day')
            )
        ''')
        
        # Retention metrics - D7 (users active today who were active 7 days ago)
        retention_d7 = db.fetch_one('''
            SELECT COUNT(DISTINCT user_id) as count
            FROM user_activity
            WHERE DATE(timestamp) = DATE('now')
            AND user_id IN (
                SELECT DISTINCT user_id 
                FROM user_activity 
                WHERE DATE(timestamp) = DATE('now', '-7 days')
            )
        ''')
        
        # Average sessions per user
        avg_sessions = db.fetch_one('''
            SELECT ROUND(AVG(session_count), 2) as avg_sessions
            FROM (
                SELECT user_id, COUNT(DISTINCT DATE(timestamp)) as session_count
                FROM user_activity
                GROUP BY user_id
            )
        ''')
        
        # Total sessions count
        total_sessions = db.fetch_one('''
            SELECT COUNT(DISTINCT DATE(timestamp) || user_id) as count
            FROM user_activity
        ''')
        
        # Applications by service
        applications_by_service = db.fetch_all('''
            SELECT service_name, COUNT(*) as count 
            FROM applications 
            GROUP BY service_name
            ORDER BY count DESC
        ''')
        
        # Total applications
        total_applications = db.fetch_one('''
            SELECT COUNT(*) as count FROM applications
        ''')
        
        return jsonify({
            'success': True,
            'active_users': active_users['count'] if active_users else 0,
            'total_feedback': feedback_count['count'] if feedback_count else 0,
            'total_applications': total_applications['count'] if total_applications else 0,
            'top_actions': top_actions,
            'service_clicks': service_clicks,
            'applications_by_service': applications_by_service,
            'users_per_institute': users_per_institute,
            'users_per_course': users_per_course,
            'feedback_last_7': feedback_last_7,
            'retention_d1': retention_d1['count'] if retention_d1 else 0,
            'retention_d7': retention_d7['count'] if retention_d7 else 0,
            'avg_sessions_per_user': avg_sessions['avg_sessions'] if avg_sessions else 0,
            'total_sessions': total_sessions['count'] if total_sessions else 0
        }), 200
    except Exception as e:
        logger.error(f"Error fetching analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500


# MiniApp API - Filter options for schedule filtering
@app.route('/api/miniapp/filters', methods=['GET'])
def get_miniapp_filters():
    """Get available filter options for MiniApp"""
    try:
        # Get all available values for filters
        courses = db.fetch_all(
            'SELECT DISTINCT "Курс" FROM schedule WHERE "Курс" IS NOT NULL ORDER BY "Курс"'
        )
        institutes = db.fetch_all(
            'SELECT DISTINCT "Институт" FROM schedule WHERE "Институт" IS NOT NULL ORDER BY "Институт"'
        )
        programs = db.fetch_all(
            'SELECT DISTINCT "Программа" FROM schedule WHERE "Программа" IS NOT NULL ORDER BY "Программа"'
        )
        directions = db.fetch_all(
            'SELECT DISTINCT "Направление" FROM schedule WHERE "Направление" IS NOT NULL ORDER BY "Направление"'
        )
        education_levels = db.fetch_all(
            'SELECT DISTINCT "Уровень образования" FROM schedule WHERE "Уровень образования" IS NOT NULL ORDER BY "Уровень образования"'
        )
        forms = db.fetch_all(
            'SELECT DISTINCT "Форма обучения" FROM schedule WHERE "Форма обучения" IS NOT NULL ORDER BY "Форма обучения"'
        )
        
        return jsonify({
            'courses': [c['Курс'] for c in courses if c.get('Курс') is not None],
            'institutes': [i['Институт'] for i in institutes if i.get('Институт')],
            'programs': [p['Программа'] for p in programs if p.get('Программа')],
            'directions': [d['Направление'] for d in directions if d.get('Направление')],
            'education_levels': [e['Уровень образования'] for e in education_levels if e.get('Уровень образования')],
            'forms': [f['Форма обучения'] for f in forms if f.get('Форма обучения')]
        }), 200
    except Exception as e:
        logger.error(f"Error getting miniapp filters: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/miniapp/schedule/filtered', methods=['POST'])
def get_filtered_schedule():
    """Get schedule based on filters"""
    try:
        filters = request.get_json()
        
        query = 'SELECT * FROM schedule WHERE 1=1'
        params = []
        
        # Build dynamic query based on provided filters
        if filters.get('course'):
            query += ' AND "Курс" = ?'
            params.append(filters['course'])
        
        if filters.get('institute'):
            query += ' AND "Институт" = ?'
            params.append(filters['institute'])
        
        if filters.get('program'):
            query += ' AND "Программа" = ?'
            params.append(filters['program'])
        
        if filters.get('direction'):
            query += ' AND "Направление" = ?'
            params.append(filters['direction'])
        
        if filters.get('group'):
            query += ' AND "Номер группы" = ?'
            params.append(filters['group'])
        
        if filters.get('day'):
            query += ' AND "День недели" = ?'
            params.append(filters['day'])
        
        query += ' ORDER BY "День недели", "Номер пары"'
        
        schedule = db.fetch_all(query, tuple(params))
        
        return jsonify({
            'schedule': schedule,
            'count': len(schedule),
            'filters_applied': filters
        }), 200
    except Exception as e:
        logger.error(f"Error getting filtered schedule: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/profile-options', methods=['GET'])
def get_profile_options():
    """Fetch distinct values for cascading profile selectors from schedule table"""
    try:
        target = request.args.get('target')
        form = request.args.get('form')
        level = request.args.get('level')
        course = request.args.get('course')
        institute = request.args.get('institute')
        direction = request.args.get('direction')
        program = request.args.get('program')

        # Map frontend keys to database column names
        col_map = {
            'form': 'Форма обучения',
            'level': 'Уровень образования',
            'course': 'Курс',
            'institute': 'Институт',
            'direction': 'Направление',
            'program': 'Программа',
            'group': 'Номер группы'
        }

        db_col = col_map.get(target)
        if not db_col:
            return jsonify({'error': f'Invalid target: {target}'}), 400

        # Build dynamic query based on previous selections
        query = f'SELECT DISTINCT "{db_col}" FROM schedule WHERE "{db_col}" IS NOT NULL'
        params = []

        if form:
            query += ' AND "Форма обучения" = ?'
            params.append(form)
        if level:
            query += ' AND "Уровень образования" = ?'
            params.append(level)
        if course:
            query += ' AND "Курс" = ?'
            params.append(int(course))
        if institute:
            query += ' AND "Институт" = ?'
            params.append(institute)
        if direction:
            query += ' AND "Направление" = ?'
            params.append(direction)
        if program:
            query += ' AND "Программа" = ?'
            params.append(program)

        query += f' ORDER BY "{db_col}" ASC'
        
        results = db.fetch_all(query, tuple(params))
        # Filter out None, empty strings, and duplicates
        options = []
        seen = set()
        for row in results:
            val = row[db_col]
            if val and str(val).strip() and val not in seen:
                options.append(val)
                seen.add(val)
        
        return jsonify({'target': target, 'options': options}), 200
        
    except Exception as e:
        logger.error(f"Error getting profile options: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/miniapp/programs/<institute>', methods=['GET'])
def get_programs_by_institute(institute):
    """Get programs for selected institute"""
    try:
        programs = db.fetch_all(
            'SELECT DISTINCT "Программа", "Курс", "Направление" FROM schedule '
            'WHERE "Институт" = ? ORDER BY "Курс", "Программа"',
            (institute,)
        )
        
        return jsonify({
            'institute': institute,
            'programs': programs
        }), 200
    except Exception as e:
        logger.error(f"Error getting programs for institute: {e}")
        return jsonify({'error': str(e)}), 500


def run_admin_app(debug=False, port=FLASK_PORT):
    """Start the Flask admin app"""
    logger.info(f"Starting admin app on port {port}")
    
    # Initialize database
    db.init_db()
    
    # Check for SSL certificates
    cert_file = Path(__file__).parent.parent.parent / 'cert.pem'
    key_file = Path(__file__).parent.parent.parent / 'key.pem'
    
    ssl_context = None
    if cert_file.exists() and key_file.exists():
        ssl_context = (str(cert_file), str(key_file))
        logger.info(f"Using HTTPS with SSL certificates")
    else:
        logger.warning(f"SSL certificates not found, running without HTTPS")
    
    app.run(
        debug=debug,
        port=port,
        host='0.0.0.0',
        ssl_context=ssl_context
    )


# ============= MiniApp API Endpoints (no auth required) =============

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get user profile from MiniApp"""
    try:
        user = db.fetch_one('SELECT * FROM users WHERE user_id = ?', (user_id,))
        if user:
            return jsonify(user), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/<int:user_id>', methods=['POST'])
def save_user_profile(user_id):
    """Save or update user profile from MiniApp"""
    try:
        data = request.get_json()
        
        # Check if user exists
        user = db.fetch_one('SELECT * FROM users WHERE user_id = ?', (user_id,))
        
        if user:
            # Update existing user
            db.execute('''
                UPDATE users SET 
                    first_name = ?,
                    last_name = ?,
                    "Форма обучения" = ?,
                    "Уровень образования" = ?,
                    "Курс" = ?,
                    "Направление" = ?,
                    "Номер группы" = ?,
                    profile_completed = 1,
                    updated_at = datetime('now')
                WHERE user_id = ?
            ''', (
                data.get('first_name'),
                data.get('last_name'),
                data.get('form_of_education') or data.get('Форма обучения'),
                data.get('education_level') or data.get('Уровень образования'),
                data.get('course') or data.get('Курс'),
                data.get('direction') or data.get('Направление'),
                data.get('group') or data.get('Номер группы'),
                user_id
            ))
        else:
            # Create new user
            db.execute('''
                INSERT INTO users 
                (user_id, first_name, last_name, "Форма обучения", "Уровень образования",
                 "Курс", "Направление", "Номер группы", profile_completed, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
            ''', (
                user_id,
                data.get('first_name'),
                data.get('last_name'),
                data.get('form_of_education') or data.get('Форма обучения'),
                data.get('education_level') or data.get('Уровень образования'),
                data.get('course') or data.get('Курс'),
                data.get('direction') or data.get('Направление'),
                data.get('group') or data.get('Номер группы')
            ))
        
        # Return updated user
        updated_user = db.fetch_one('SELECT * FROM users WHERE user_id = ?', (user_id,))
        logger.info(f"Profile saved for user {user_id}")
        return jsonify(updated_user), 200
        
    except Exception as e:
        logger.error(f"Error saving profile for user {user_id}: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    run_admin_app(debug=True)
