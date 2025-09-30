import React from 'react';
import './Notifications.css';
import notificationIcon from '../../assets/notification.png';

interface NotificationsProps {
  className?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ className = "" }) => {
  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
  };

  return (
    <button 
      className={`notifications-button ${className}`}
      onClick={handleNotificationsClick}
    >
      <img src={notificationIcon} alt="Notifications" className="notifications-icon" />
    </button>
  );
};

export default Notifications;
