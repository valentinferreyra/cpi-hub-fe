import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createChatWebSocket } from '../api/websocket';
import type { ChatMessage } from './useWebSocket';

interface UnreadCounts {
  [spaceId: number]: number;
}

interface UseUnreadChatMessagesProps {
  spaces: Array<{ id: number }>;
  currentUser: { id: number; name: string; last_name: string } | null;
}

export const useUnreadChatMessages = ({ 
  spaces, 
  currentUser 
}: UseUnreadChatMessagesProps) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const location = useLocation();
  const socketRefs = useRef<Map<number, WebSocket>>(new Map());
  const reconnectTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const getCurrentSpaceId = useCallback((): number | null => {
    const pathMatch = location.pathname.match(/\/space\/(\d+)\/chat/);
    if (pathMatch) {
      return parseInt(pathMatch[1], 10);
    }
    return null;
  }, [location.pathname]);

  const clearUnreadCount = useCallback((spaceId: number) => {
    setUnreadCounts(prev => {
      if (prev[spaceId] && prev[spaceId] > 0) {
        const newCounts = { ...prev };
        delete newCounts[spaceId];
        return newCounts;
      }
      return prev;
    });
  }, []);

  const setupWebSocket = useCallback((spaceId: number) => {
    if (!currentUser || socketRefs.current.has(spaceId)) {
      return;
    }

    const fullName = `${currentUser.name} ${currentUser.last_name}`;
    const socket = createChatWebSocket(spaceId, currentUser.id, fullName);

    socket.onopen = () => {
      console.log(`WebSocket conectado para espacio ${spaceId}`);
    };

    socket.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        let message: ChatMessage;

        if (typeof rawData === 'string') {
          try {
            message = JSON.parse(rawData) as ChatMessage;
          } catch {
            return;
          }
        } else {
          message = rawData as ChatMessage;
        }

        // Solo contar mensajes de tipo 'chat' (no 'join')
        if (message.type === 'chat' && message.data?.content) {
          const currentSpaceId = getCurrentSpaceId();
          
          // Si el usuario NO está viendo este chat, incrementar contador
          if (currentSpaceId !== spaceId) {
            setUnreadCounts(prev => ({
              ...prev,
              [spaceId]: (prev[spaceId] || 0) + 1
            }));
          }
        }
      } catch (error) {
        console.error(`Error procesando mensaje para espacio ${spaceId}:`, error);
      }
    };

    socket.onclose = () => {
      console.log(`WebSocket desconectado para espacio ${spaceId}`);
      socketRefs.current.delete(spaceId);
      
      if (currentUser && reconnectTimeouts.current.get(spaceId) === undefined) {
        const timeout = setTimeout(() => {
          reconnectTimeouts.current.delete(spaceId);
          if (currentUser && !socketRefs.current.has(spaceId)) {
            setupWebSocket(spaceId);
          }
        }, 3000);
        reconnectTimeouts.current.set(spaceId, timeout);
      }
    };

    socket.onerror = (error) => {
      console.error(`Error en WebSocket para espacio ${spaceId}:`, error);
    };

    socketRefs.current.set(spaceId, socket);
  }, [currentUser, getCurrentSpaceId]);

  const cleanupWebSocket = useCallback((spaceId: number) => {
    const socket = socketRefs.current.get(spaceId);
    if (socket) {
      socket.close();
      socketRefs.current.delete(spaceId);
    }
    const timeout = reconnectTimeouts.current.get(spaceId);
    if (timeout) {
      clearTimeout(timeout);
      reconnectTimeouts.current.delete(spaceId);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || !spaces || spaces.length === 0) {
      return;
    }

    spaces.forEach(space => {
      if (!socketRefs.current.has(space.id)) {
        setupWebSocket(space.id);
      }
    });

    socketRefs.current.forEach((_socket, spaceId) => {
      if (!spaces.find(s => s.id === spaceId)) {
        cleanupWebSocket(spaceId);
      }
    });

    return () => {
      socketRefs.current.forEach((_socket, spaceId) => {
        cleanupWebSocket(spaceId);
      });
    };
  }, [spaces, currentUser, setupWebSocket, cleanupWebSocket]);

  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    if (currentSpaceId !== null) {
      clearUnreadCount(currentSpaceId);
    }
  }, [location.pathname, getCurrentSpaceId, clearUnreadCount]);

  // Obtener contador de mensajes no leídos para un espacio
  const getUnreadCount = useCallback((spaceId: number): number => {
    return unreadCounts[spaceId] || 0;
  }, [unreadCounts]);

  return {
    unreadCounts,
    getUnreadCount,
    clearUnreadCount
  };
};

