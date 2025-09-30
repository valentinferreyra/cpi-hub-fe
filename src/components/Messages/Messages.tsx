import React from 'react';
import './Messages.css';
import messagesIcon from '../../assets/messages.png';

interface MessagesProps {
  className?: string;
}

const Messages: React.FC<MessagesProps> = ({ className = "" }) => {
  const handleMessagesClick = () => {
    console.log('Messages clicked');
  };

  return (
    <button 
      className={`messages-button ${className}`}
      onClick={handleMessagesClick}
    >
      <img src={messagesIcon} alt="Messages" className="messages-icon" />
    </button>
  );
};

export default Messages;
