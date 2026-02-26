"""
Serveo Tunnel Health Monitor - периодическая проверка и очистка туннелей
"""

import logging
import time
import threading
from datetime import datetime, timedelta
from src.serveo.serveo_manager import ServeoManager
from src.serveo.tunnel_manager import SSHTunnelManager

logger = logging.getLogger(__name__)


class TunnelHealthMonitor:
    """Мониторит здоровье и активность туннелей"""
    
    def __init__(self, check_interval: int = 300):  # 5 минут по умолчанию
        """
        Инициализирует монитор
        
        Args:
            check_interval: Интервал проверки в секундах
        """
        self.serveo_manager = ServeoManager()
        self.tunnel_manager = SSHTunnelManager(self.serveo_manager)
        self.check_interval = check_interval
        self.running = False
        self.monitor_thread = None
    
    def start(self):
        """Запускает мониторинг в фоновом потоке"""
        if self.running:
            logger.warning("Monitor is already running")
            return
        
        self.running = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        logger.info(f"Tunnel health monitor started (interval: {self.check_interval}s)")
    
    def stop(self):
        """Останавливает мониторинг"""
        self.running = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=10)
        logger.info("Tunnel health monitor stopped")
    
    def _monitor_loop(self):
        """Основной цикл мониторинга"""
        while self.running:
            try:
                # Проверяем здоровье всех туннелей
                self._healthcheck_all_tunnels()
                
                # Очищаем старые туннели
                self._cleanup_old_tunnels()
                
                # Засыпаем до следующей проверки
                time.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}", exc_info=True)
                time.sleep(self.check_interval)
    
    def _healthcheck_all_tunnels(self):
        """Проверяет здоровье всех активных туннелей"""
        try:
            active_tunnels = self.serveo_manager.get_active_tunnels()
            
            if not active_tunnels:
                return
            
            logger.info(f"Running healthcheck on {len(active_tunnels)} tunnels")
            
            for tunnel in active_tunnels:
                user_id = tunnel.get('user_id')
                username = tunnel.get('username')
                
                try:
                    is_healthy, status_msg = self.tunnel_manager.healthcheck_tunnel(user_id)
                    
                    if is_healthy:
                        logger.debug(f"Tunnel for {username} (user_id={user_id}) is healthy")
                        self.serveo_manager.log_action(
                            user_id, 'healthcheck', 'success',
                            details=status_msg
                        )
                    else:
                        logger.warning(f"Tunnel for {username} (user_id={user_id}) is unhealthy: {status_msg}")
                        self.serveo_manager.log_action(
                            user_id, 'healthcheck', 'failed',
                            error=status_msg
                        )
                        
                        # Пытаемся перезапустить туннель
                        self._restart_tunnel(user_id)
                        
                except Exception as e:
                    logger.error(f"Error checking health of tunnel {username}: {e}")
                    self.serveo_manager.log_action(
                        user_id, 'healthcheck', 'error',
                        error=str(e)
                    )
        
        except Exception as e:
            logger.error(f"Error in healthcheck loop: {e}", exc_info=True)
    
    def _restart_tunnel(self, user_id: int):
        """Пытается перезапустить туннель пользователя"""
        try:
            logger.info(f"Attempting to restart tunnel for user_id={user_id}")
            
            # Останавливаем старый туннель
            self.tunnel_manager.stop_tunnel(user_id)
            time.sleep(2)
            
            # Запускаем новый
            success, tunnel_pid, status = self.tunnel_manager.start_tunnel(user_id)
            
            if success:
                logger.info(f"Tunnel successfully restarted for user_id={user_id}")
                self.serveo_manager.log_action(
                    user_id, 'restart_tunnel', 'success',
                    details=f"New PID={tunnel_pid}"
                )
            else:
                logger.error(f"Failed to restart tunnel for user_id={user_id}: {status}")
                self.serveo_manager.log_action(
                    user_id, 'restart_tunnel', 'failed',
                    error=status
                )
        
        except Exception as e:
            logger.error(f"Error restarting tunnel for user_id={user_id}: {e}")
            self.serveo_manager.log_action(
                user_id, 'restart_tunnel', 'error',
                error=str(e)
            )
    
    def _cleanup_old_tunnels(self):
        """Удаляет старые неактивные туннели"""
        try:
            removed_count = self.serveo_manager.cleanup_old_tunnels()
            
            if removed_count > 0:
                logger.info(f"Cleaned up {removed_count} old tunnels")
        
        except Exception as e:
            logger.error(f"Error cleaning up old tunnels: {e}")
    
    def get_active_tunnels_count(self) -> int:
        """Получает количество активных туннелей"""
        try:
            tunnels = self.serveo_manager.get_active_tunnels()
            return len(tunnels) if tunnels else 0
        except Exception as e:
            logger.error(f"Error getting active tunnels count: {e}")
            return 0
    
    def get_monitor_stats(self) -> dict:
        """Получает статистику мониторинга"""
        try:
            stats = self.serveo_manager.get_user_stats()
            
            return {
                'is_running': self.running,
                'check_interval': self.check_interval,
                'total_users': stats['total_users'],
                'active_tunnels': stats['active_tunnels'],
                'max_tunnels': stats['max_tunnels'],
                'tunnel_usage_percent': int(
                    (stats['active_tunnels'] / stats['max_tunnels'] * 100)
                    if stats['max_tunnels'] > 0 else 0
                ),
                'last_check': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting monitor stats: {e}")
            return {}


# Глобальный экземпляр монитора
_monitor = None


def get_monitor(check_interval: int = 300) -> TunnelHealthMonitor:
    """Получает или создаёт глобальный экземпляр монитора"""
    global _monitor
    
    if _monitor is None:
        _monitor = TunnelHealthMonitor(check_interval)
    
    return _monitor


def start_monitor(check_interval: int = 300):
    """Запускает мониторинг"""
    monitor = get_monitor(check_interval)
    monitor.start()
    return monitor


def stop_monitor():
    """Останавливает мониторинг"""
    global _monitor
    if _monitor:
        _monitor.stop()
        _monitor = None


if __name__ == '__main__':
    # Test run
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    monitor = TunnelHealthMonitor(check_interval=10)
    monitor.start()
    
    try:
        # Бежит 5 минут для теста
        for _ in range(30):
            time.sleep(10)
            stats = monitor.get_monitor_stats()
            print(f"Monitor stats: {stats}")
    finally:
        monitor.stop()
