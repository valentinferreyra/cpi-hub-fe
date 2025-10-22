import { useEffect, useRef, useState } from 'react';
import type { UserConnectionMessage, UseUserConnectionProps } from '../types/userConnection';
import { createUserConnectionWebSocket } from '../api/websocket';

export const useUserConnection = ({ 
  currentUser
}: UseUserConnectionProps) => {
  const [userStatuses, setUserStatuses] = useState<Map<number, boolean>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!currentUser) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnectionStatus('disconnected');
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    setConnectionStatus('connecting');
    socketRef.current = createUserConnectionWebSocket(currentUser.id);

    socketRef.current.onopen = () => {
      setConnectionStatus('connected');
    };

    socketRef.current.onmessage = (event) => {
      try {
        const message: UserConnectionMessage = JSON.parse(event.data);
        
        if (message.type === 'user_status') {
          setUserStatuses(prev => {
            const newMap = new Map(prev);
            newMap.set(message.user_id, message.status === 'online');
            return newMap;
          });
        }
      } catch (error) {
        console.error("Error parsing UserConnection message:", error);
      }
    };

    socketRef.current.onclose = () => {
      setConnectionStatus('disconnected');
    };

    socketRef.current.onerror = (error) => {
      console.error('Error in UserConnection WebSocket:', error);
      setConnectionStatus('disconnected');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [currentUser?.id]);

  const isUserOnline = (userId: number): boolean => {
    return userStatuses.get(userId) || false;
  };

  const getOnlineUsersCount = (): number => {
    return Array.from(userStatuses.values()).filter(status => status).length;
  };

  return { 
    userStatuses, 
    connectionStatus, 
    isUserOnline, 
    getOnlineUsersCount 
  };
};