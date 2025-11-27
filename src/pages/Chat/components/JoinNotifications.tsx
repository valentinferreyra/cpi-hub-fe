import { useEffect, useRef } from 'react';
import './JoinNotifications.css';

interface JoinMessage {
  id: string;
  username: string;
}

interface JoinNotificationsProps {
  joinMessages: JoinMessage[];
  onRemoveJoinMessage: (messageId: string) => void;
}

export const JoinNotifications = ({ joinMessages, onRemoveJoinMessage }: JoinNotificationsProps) => {
  const joinTimeouts = useRef(new Map<string, NodeJS.Timeout>());

  useEffect(() => {
    joinMessages.forEach((joinMsg) => {
      const existingTimeout = joinTimeouts.current.get(joinMsg.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      const timeout = setTimeout(() => {
        onRemoveJoinMessage(joinMsg.id);
        joinTimeouts.current.delete(joinMsg.id);
      }, 3000);
      
      joinTimeouts.current.set(joinMsg.id, timeout);
    });

    return () => {
      joinTimeouts.current.forEach(timeout => clearTimeout(timeout));
      joinTimeouts.current.clear();
    };
  }, [joinMessages, onRemoveJoinMessage]);

  return (
    <div className="floating-notifications">
      {joinMessages.map((joinMsg) => (
        <div key={joinMsg.id} className="floating-join-notification">
          👋 ¡{joinMsg.username} se unió al chat!
        </div>
      ))}
    </div>
  );
};
