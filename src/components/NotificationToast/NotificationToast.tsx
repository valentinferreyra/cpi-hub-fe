import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './NotificationToast.css';
import type { Notification } from '../../types/notification';

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const handleClick = () => {
    if (notification.url) {
      navigate(notification.url);
    }
    onClose();
  };

  return createPortal(
    <div className="notification-toast" onClick={handleClick}>
      <div className="notification-toast-content">
        <p className="notification-toast-title">{notification.title}</p>
        <p className="notification-toast-message">{notification.description}</p>
      </div>
    </div>,
    document.body
  );
};

export default NotificationToast;

