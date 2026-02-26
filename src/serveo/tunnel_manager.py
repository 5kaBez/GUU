"""
SSH Tunnel Manager - управляет SSH туннелями через autossh
"""

import subprocess
import logging
import os
import signal
import platform
import time
from typing import Optional, Tuple
from src.serveo.serveo_manager import ServeoManager

logger = logging.getLogger(__name__)


class SSHTunnelManager:
    """Управляет SSH туннелями для Serveo"""
    
    def __init__(self, serveo_manager: ServeoManager = None):
        """Инициализация менеджера туннелей"""
        self.serveo_manager = serveo_manager or ServeoManager()
        self.is_windows = platform.system() == 'Windows'
        self.tunnel_timeout = 600  # 10 minutes для healthcheck
        self.autossh_available = self._check_autossh()
    
    def _check_autossh(self) -> bool:
        """Проверяет, доступен ли autossh"""
        try:
            if self.is_windows:
                # На Windows используем putty/plink
                return True  # TODO: проверить наличие plink
            else:
                result = subprocess.run(['which', 'autossh'], capture_output=True)
                return result.returncode == 0
        except Exception as e:
            logger.warning(f"Ошибка при проверке autossh: {e}")
            return False
    
    def start_tunnel(self, user_id: int) -> Tuple[bool, Optional[int], Optional[str]]:
        """
        Запускает SSH туннель для пользователя
        
        Args:
            user_id: ID пользователя
            
        Returns:
            Кортеж (success, tunnel_pid, tunnel_url)
        """
        try:
            # Получим username
            username_data = self.serveo_manager.get_or_create_username(user_id)
            username = username_data['username']
            
            # Проверим лимит туннелей
            if not self.serveo_manager.can_create_new_tunnel():
                error_msg = "Достигнут лимит одновременных туннелей"
                logger.error(error_msg)
                self.serveo_manager.log_action(
                    user_id, 'start_tunnel', 'failed',
                    error=error_msg
                )
                return False, None, error_msg
            
            # Формируем команду
            if self.is_windows:
                tunnel_cmd = self._build_windows_tunnel_cmd(username)
            else:
                tunnel_cmd = self._build_linux_tunnel_cmd(username)
            
            logger.info(f"Запускаю туннель для {username}: {' '.join(tunnel_cmd)}")
            
            # Запускаем процесс
            process = subprocess.Popen(
                tunnel_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                stdin=subprocess.DEVNULL
            )
            
            tunnel_pid = process.pid
            
            # Даем туннелю время на инициализацию
            time.sleep(2)
            
            # Проверяем, запустился ли процесс
            if process.poll() is not None:
                _, stderr = process.communicate()
                error_msg = f"Туннель завершился с ошибкой: {stderr.decode()}"
                logger.error(error_msg)
                self.serveo_manager.log_action(
                    user_id, 'start_tunnel', 'failed',
                    error=error_msg
                )
                return False, None, error_msg
            
            # Сохраняем информацию о туннеле
            self.serveo_manager.record_tunnel_creation(user_id, tunnel_pid, 'running')
            
            # TODO: Извлечь URL из вывода Serveo
            tunnel_url = f"https://{username}.serveousercontent.com"
            
            # Сохраняем URL
            self.serveo_manager.set_serveo_url(user_id, tunnel_url)
            
            self.serveo_manager.log_action(
                user_id, 'start_tunnel', 'success',
                details=f"PID={tunnel_pid}, URL={tunnel_url}"
            )
            
            logger.info(f"Туннель успешно запущен для {username} (PID={tunnel_pid})")
            return True, tunnel_pid, tunnel_url
            
        except Exception as e:
            error_msg = f"Ошибка при запуске туннеля: {str(e)}"
            logger.error(error_msg)
            self.serveo_manager.log_action(
                user_id, 'start_tunnel', 'error',
                error=error_msg
            )
            return False, None, error_msg
    
    def _build_linux_tunnel_cmd(self, username: str) -> list:
        """Формирует команду autossh для Linux"""
        return [
            'autossh',
            '-M', '0',           # Отключаем мониторинг портов
            '-f',                # Фоновый режим
            '-N',                # Без выполнения команды
            '-R', f'80:localhost:5001',  # Tunnel 80 -> localhost:5001
            f'{username}@serveo.net'
        ]
    
    def _build_windows_tunnel_cmd(self, username: str) -> list:
        """Формирует команду для Windows (через ssh прямо)"""
        # На Windows используем встроенный ssh
        return [
            'ssh',
            '-N',
            '-R', f'80:localhost:5001',
            f'{username}@serveo.net'
        ]
    
    def stop_tunnel(self, user_id: int) -> bool:
        """
        Останавливает SSH туннель пользователя
        
        Args:
            user_id: ID пользователя
            
        Returns:
            True если успешно
        """
        try:
            # Получим информацию о туннеле
            tunnel_data = self.serveo_manager.db.fetch_one(
                '''SELECT * FROM serveo_tunnels 
                   WHERE user_id = ? AND status IN ('started', 'running')''',
                (user_id,)
            )
            
            if not tunnel_data:
                logger.warning(f"Туннель не найден для user_id={user_id}")
                return False
            
            tunnel_pid = tunnel_data['tunnel_pid']
            
            if not tunnel_pid:
                logger.warning(f"PID туннеля не установлен для user_id={user_id}")
                return False
            
            # Останавливаем процесс
            try:
                if self.is_windows:
                    os.kill(tunnel_pid, signal.SIGTERM)
                else:
                    os.kill(tunnel_pid, signal.SIGTERM)
                
                logger.info(f"Сигнал SIGTERM отправлен процессу {tunnel_pid}")
            except ProcessLookupError:
                logger.warning(f"Процесс {tunnel_pid} не найден")
            
            # Обновляем статус в БД
            self.serveo_manager.mark_tunnel_inactive(user_id)
            
            self.serveo_manager.log_action(
                user_id, 'stop_tunnel', 'success',
                details=f"PID={tunnel_pid}"
            )
            
            logger.info(f"Туннель остановлен для user_id={user_id}")
            return True
            
        except Exception as e:
            error_msg = f"Ошибка при остановке туннеля: {str(e)}"
            logger.error(error_msg)
            self.serveo_manager.log_action(
                user_id, 'stop_tunnel', 'error',
                error=error_msg
            )
            return False
    
    def healthcheck_tunnel(self, user_id: int) -> Tuple[bool, Optional[str]]:
        """
        Проверяет здоровье туннеля пользователя
        
        Args:
            user_id: ID пользователя
            
        Returns:
            Кортеж (is_healthy, status_message)
        """
        try:
            # Получим информацию о туннеле
            tunnel_data = self.serveo_manager.db.fetch_one(
                '''SELECT * FROM serveo_tunnels WHERE user_id = ?''',
                (user_id,)
            )
            
            if not tunnel_data:
                return False, "Туннель не найден"
            
            tunnel_pid = tunnel_data['tunnel_pid']
            
            # Проверяем, работает ли процесс
            if self.is_windows:
                # На Windows
                try:
                    result = subprocess.run(
                        ['tasklist', '/FI', f'PID eq {tunnel_pid}'],
                        capture_output=True,
                        text=True
                    )
                    is_running = str(tunnel_pid) in result.stdout
                except:
                    is_running = False
            else:
                # На Linux
                try:
                    os.kill(tunnel_pid, 0)  # Сигнал 0 просто проверяет наличие процесса
                    is_running = True
                except ProcessLookupError:
                    is_running = False
            
            if is_running:
                # Обновляем время последней проверки
                self.serveo_manager.db.execute(
                    '''UPDATE serveo_tunnels 
                       SET health_status = 'healthy', last_healthcheck = CURRENT_TIMESTAMP
                       WHERE user_id = ?''',
                    (user_id,)
                )
                return True, "Туннель работает нормально"
            else:
                # Туннель мёртв
                self.serveo_manager.db.execute(
                    '''UPDATE serveo_tunnels 
                       SET health_status = 'dead', status = 'stopped'
                       WHERE user_id = ?''',
                    (user_id,)
                )
                return False, "Процесс туннеля не найден"
                
        except Exception as e:
            error_msg = f"Ошибка при проверке здоровья туннеля: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def get_active_tunnels_count(self) -> int:
        """Получает количество активных туннелей"""
        return self.serveo_manager.get_tunnel_count()
    
    def get_tunnel_status(self, user_id: int) -> Optional[dict]:
        """Получает статус туннеля пользователя"""
        return self.serveo_manager.db.fetch_one(
            '''SELECT * FROM serveo_tunnels WHERE user_id = ?''',
            (user_id,)
        )
