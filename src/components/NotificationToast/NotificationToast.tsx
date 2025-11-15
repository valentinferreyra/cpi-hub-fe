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

  const getNotificationMessage = (notif: Notification): string => {
    if (notif.type === 'reaction') {
      const entityName = notif.entity_type === 'post' ? 'post' : 'comentario';
      return `Alguien reaccionó a tu ${entityName}`;
    }
    return 'Nueva notificación';
  };

  const handleClick = () => {
    const postId = notification.post_id ?? notification.entity_id;
    navigate(`/post/${postId}`);
    onClose();
  };

  return createPortal(
    <div className="notification-toast" onClick={handleClick}>
      <div className="notification-toast-content">
        <p className="notification-toast-message">{getNotificationMessage(notification)}</p>
      </div>
    </div>,
    document.body
  );
};

export default NotificationToast;

