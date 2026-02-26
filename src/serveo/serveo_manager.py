"""
Serveo URL Manager - динамическое управление Serveo туннелями для каждого пользователя
Генерирует уникальные Serveo ссылки на основе user_id
"""

import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from src.database.models import Database

logger = logging.getLogger(__name__)


class ServeoManager:
    """Управляет Serveo ссылками и туннелями для пользователей"""
    
    def __init__(self, db_path: str = 'data/schedule.db'):
        """Инициализация менеджера"""
        self.db = Database(db_path)
        self.max_active_tunnels = 100
        self.tunnel_timeout_hours = 24
        self.username_prefix = "user"
    
    def generate_username(self, user_id: int) -> tuple[str, str]:
        """
        Генерирует уникальный username на основе user_id
        
        Args:
            user_id: ID пользователя Telegram
            
        Returns:
            Кортеж (username, user_hash)
        """
        # Создаём hash из user_id
        user_hash = hashlib.sha256(str(user_id).encode()).hexdigest()[:12]
        
        # Формируем username
        username = f"{self.username_prefix}_{user_hash}"
        
        return username, user_hash
    
    def get_or_create_username(self, user_id: int) -> Dict[str, str]:
        """
        Получает существующий username или создаёт новый
        
        Args:
            user_id: ID пользователя Telegram
            
        Returns:
            Словарь с username, user_hash и serveo_url
        """
        # Проверим, есть ли уже username для этого пользователя
        existing = self.db.fetch_one(
            'SELECT * FROM serveo_usernames WHERE user_id = ?',
            (user_id,)
        )
        
        if existing:
            logger.info(f"Username найден для user_id={user_id}: {existing['username']}")
            return {
                'username': existing['username'],
                'user_hash': existing['user_hash'],
                'serveo_url': existing['serveo_url'],
                'status': existing['status']
            }
        
        # Генерируем новый username
        username, user_hash = self.generate_username(user_id)
        
        # Сохраняем в БД
        self.db.execute(
            '''INSERT INTO serveo_usernames (user_id, username, user_hash, status)
               VALUES (?, ?, ?, ?)''',
            (user_id, username, user_hash, 'created')
        )
        
        logger.info(f"Создан новый username для user_id={user_id}: {username}")
        
        return {
            'username': username,
            'user_hash': user_hash,
            'serveo_url': None,
            'status': 'created'
        }
    
    def set_serveo_url(self, user_id: int, serveo_url: str) -> bool:
        """
        Сохраняет Serveo URL для пользователя
        
        Args:
            user_id: ID пользователя
            serveo_url: Публичный URL от Serveo (например, https://user_hash.serveousercontent.com)
            
        Returns:
            True если успешно, False если ошибка
        """
        try:
            self.db.execute(
                '''UPDATE serveo_usernames 
                   SET serveo_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE user_id = ?''',
                (serveo_url, 'active', user_id)
            )
            logger.info(f"Serveo URL установлен для user_id={user_id}: {serveo_url}")
            return True
        except Exception as e:
            logger.error(f"Ошибка при установке Serveo URL для user_id={user_id}: {e}")
            return False
    
    def get_serveo_url(self, user_id: int) -> Optional[str]:
        """
        Получает Serveo URL пользователя
        
        Args:
            user_id: ID пользователя
            
        Returns:
            Serveo URL или None если не установлен
        """
        result = self.db.fetch_one(
            'SELECT serveo_url FROM serveo_usernames WHERE user_id = ?',
            (user_id,)
        )
        return result['serveo_url'] if result else None
    
    def build_miniapp_url(self, user_id: int) -> Optional[str]:
        """
        Формирует полный URL приложения с параметром user_id
        
        Args:
            user_id: ID пользователя
            
        Returns:
            Полный URL вида https://user_hash.serveousercontent.com/miniapp?user_id=123
        """
        serveo_url = self.get_serveo_url(user_id)
        if not serveo_url:
            return None
        
        # Удаляем trailing slash если есть
        serveo_url = serveo_url.rstrip('/')
        
        # Формируем URL приложения
        miniapp_url = f"{serveo_url}/miniapp?user_id={user_id}"
        return miniapp_url
    
    def record_tunnel_creation(self, user_id: int, tunnel_pid: int, status: str = 'started') -> bool:
        """
        Записывает информацию о созданном туннеле
        
        Args:
            user_id: ID пользователя
            tunnel_pid: PID процесса SSH туннеля
            status: Статус туннеля
            
        Returns:
            True если успешно
        """
        try:
            username_data = self.db.fetch_one(
                'SELECT username FROM serveo_usernames WHERE user_id = ?',
                (user_id,)
            )
            
            if not username_data:
                logger.error(f"Username не найден для user_id={user_id}")
                return False
            
            username = username_data['username']
            
            # Проверим, есть ли уже запись туннеля
            existing = self.db.fetch_one(
                'SELECT id FROM serveo_tunnels WHERE username = ?',
                (username,)
            )
            
            if existing:
                # Обновляем существующий туннель
                self.db.execute(
                    '''UPDATE serveo_tunnels 
                       SET tunnel_pid = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                       WHERE username = ?''',
                    (tunnel_pid, status, username)
                )
            else:
                # Создаём новую запись туннеля
                self.db.execute(
                    '''INSERT INTO serveo_tunnels (username, user_id, tunnel_pid, status)
                       VALUES (?, ?, ?, ?)''',
                    (username, user_id, tunnel_pid, status)
                )
            
            logger.info(f"Информация туннеля записана для user_id={user_id}, PID={tunnel_pid}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при записи информации туннеля: {e}")
            return False
    
    def get_active_tunnels(self) -> List[Dict]:
        """
        Получает список активных туннелей
        
        Returns:
            Список словарей с информацией о туннелях
        """
        tunnels = self.db.fetch_all(
            '''SELECT * FROM serveo_tunnels 
               WHERE status = 'started' OR status = 'running'
               ORDER BY created_at DESC'''
        )
        return tunnels if tunnels else []
    
    def get_tunnel_count(self) -> int:
        """Получает количество активных туннелей"""
        result = self.db.fetch_one(
            '''SELECT COUNT(*) as count FROM serveo_tunnels 
               WHERE status IN ('started', 'running')'''
        )
        return result['count'] if result else 0
    
    def can_create_new_tunnel(self) -> bool:
        """Проверяет, можно ли создать новый туннель"""
        count = self.get_tunnel_count()
        return count < self.max_active_tunnels
    
    def mark_tunnel_inactive(self, user_id: int) -> bool:
        """
        Отмечает туннель пользователя как неактивный
        
        Args:
            user_id: ID пользователя
            
        Returns:
            True если успешно
        """
        try:
            self.db.execute(
                '''UPDATE serveo_tunnels 
                   SET status = 'stopped', updated_at = CURRENT_TIMESTAMP
                   WHERE user_id = ?''',
                (user_id,)
            )
            return True
        except Exception as e:
            logger.error(f"Ошибка при отметке туннеля как неактивного: {e}")
            return False
    
    def log_action(self, user_id: int, action: str, status: str, 
                   details: str = None, error: str = None) -> bool:
        """
        Логирует действие с туннелем
        
        Args:
            user_id: ID пользователя
            action: Действие (create, start, stop, healthcheck, etc)
            status: Статус (success, failed, pending, etc)
            details: Дополнительные детали
            error: Текст ошибки если есть
            
        Returns:
            True если успешно
        """
        try:
            username = None
            username_data = self.db.fetch_one(
                'SELECT username FROM serveo_usernames WHERE user_id = ?',
                (user_id,)
            )
            if username_data:
                username = username_data['username']
            
            self.db.execute(
                '''INSERT INTO serveo_logs 
                   (user_id, username, action, status, details, error)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (user_id, username, action, status, details, error)
            )
            return True
        except Exception as e:
            logger.error(f"Ошибка при логировании действия: {e}")
            return False
    
    def cleanup_old_tunnels(self, hours: int = None) -> int:
        """
        Удаляет неактивные туннели старше N часов
        
        Args:
            hours: Количество часов неактивности (по умолчанию из конфига)
            
        Returns:
            Количество удалённых туннелей
        """
        if hours is None:
            hours = self.tunnel_timeout_hours
        
        try:
            cutoff_time = (datetime.now() - timedelta(hours=hours)).isoformat()
            
            # Получим список туннелей для удаления
            tunnels_to_remove = self.db.fetch_all(
                '''SELECT * FROM serveo_tunnels 
                   WHERE status = 'stopped' AND updated_at < ?''',
                (cutoff_time,)
            )
            
            if tunnels_to_remove:
                # Удаляем записи
                self.db.execute(
                    '''DELETE FROM serveo_tunnels 
                       WHERE status = 'stopped' AND updated_at < ?''',
                    (cutoff_time,)
                )
                
                logger.info(f"Удалено {len(tunnels_to_remove)} старых туннелей")
                return len(tunnels_to_remove)
            
            return 0
            
        except Exception as e:
            logger.error(f"Ошибка при очистке старых туннелей: {e}")
            return 0
    
    def get_user_stats(self) -> Dict:
        """Получает статистику системы"""
        try:
            total_users = self.db.fetch_one(
                'SELECT COUNT(*) as count FROM serveo_usernames'
            )
            active_tunnels = self.db.fetch_one(
                '''SELECT COUNT(*) as count FROM serveo_tunnels 
                   WHERE status IN ('started', 'running')'''
            )
            
            return {
                'total_users': total_users['count'] if total_users else 0,
                'active_tunnels': active_tunnels['count'] if active_tunnels else 0,
                'max_tunnels': self.max_active_tunnels
            }
        except Exception as e:
            logger.error(f"Ошибка при получении статистики: {e}")
            return {'total_users': 0, 'active_tunnels': 0, 'max_tunnels': self.max_active_tunnels}
