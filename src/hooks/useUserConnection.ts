import { useEffect, useRef, useState } from 'react';
import type { UserConnectionMessage, UseUserConnectionProps } from '../types/userConnection';
import { createUserConnectionWebSocket } from '../api/websocket';

export const useUserConnection = ({ 
  currentUser
}: UseUserConnectionProps) => {
  const [userStatuses, setUserStatuses] = useState<Map<number, boolean>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setupWebSocket = () => {
    if (!currentUser) return;

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
      
      if (currentUser && reconnectTimeoutRef.current === null) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (currentUser && !socketRef.current) {
            setupWebSocket();
          }
        }, 3000); // Reconectar después de 3 segundos
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('Error in UserConnection WebSocket:', error);
      setConnectionStatus('disconnected');
    };
  };

  useEffect(() => {
    if (!currentUser) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setConnectionStatus('disconnected');
      return;
    }

    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
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