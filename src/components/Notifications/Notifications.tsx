import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';
import notificationIcon from '../../assets/notification.png';
import { useNotifications } from '../../hooks/useNotifications';
import { useAppContext } from '../../context/AppContext';
import { formatDateShort } from '../../utils/dateUtils';
import NotificationToast from '../NotificationToast/NotificationToast';
import type { Notification } from '../../types/notification';

interface NotificationsProps {
  className?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ className = "" }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  
  const {
    notifications,
    unreadCount,
    connectionStatus,
    toastNotification,
    closeToast,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ 
    currentUser,
    enabled: !!currentUser 
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsDropdownOpen(false);
    
    const postId = notification.post_id ?? notification.entity_id;
    navigate(`/post/${postId}`);
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationMessage = (notification: Notification): string => {
    if (notification.type === 'reaction') {
      const entityName = notification.entity_type === 'post' ? 'post' : 'comentario';
      return `Alguien reaccionó a tu ${entityName}`;
    }
    return 'Nueva notificación';
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <NotificationToast 
        notification={toastNotification} 
        onClose={closeToast} 
      />
      <div className="notifications-container" ref={dropdownRef}>
        <button 
          className={`notifications-button ${className}`}
          onClick={handleToggleDropdown}
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
        >
          <img src={notificationIcon} alt="Notifications" className="notifications-icon" />
          {unreadCount > 0 && (
            <span className="notifications-badge">{unreadCount}</span>
          )}
        </button>
        
        {isDropdownOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-dropdown-header">
            <h3 className="notifications-dropdown-title">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                className="notifications-mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
            {connectionStatus === 'connecting' && (
              <div className="notifications-connection-status connecting">
                Conectando...
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="notifications-connection-status error">
                Error de conexión
              </div>
            )}
          </div>
          
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notifications-empty">
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p className="notification-message">
                      {getNotificationMessage(notification)}
                    </p>
                    <small className="notification-time">
                      {formatDateShort(notification.created_at)}
                    </small>
                  </div>
                  {!notification.read && <div className="notification-unread-indicator" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Notifications;
