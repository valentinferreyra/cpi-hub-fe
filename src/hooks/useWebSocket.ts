import { useEffect, useRef, useState } from 'react';
import { createChatWebSocket } from '../api/websocket'; 

export interface ChatMessageData {
  id: string;
  content: string;
  user_id: number;
  username: string;
  space_id: number;
  timestamp: string;
  image?: string;
}

export interface ChatMessage {
  type: 'chat' | 'join';
  data: ChatMessageData;
  timestamp: string;
  user_id: number;
  space_id: number;
  username: string;
}

export interface JoinMessage {
  id: string;
  username: string;
}

interface UseWebSocketProps {
  spaceId: string | undefined;
  currentUser: any;
  onJoinMessage: (messageId: string, username: string) => void;
}

export const useWebSocket = ({ 
  spaceId, 
  currentUser, 
  onJoinMessage
}: UseWebSocketProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const processedJoins = useRef(new Set<string>());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setupWebSocket = () => {
    if (!currentUser || !spaceId) return;

    const fullName = `${currentUser.name} ${currentUser.last_name}`;
    
    setConnectionStatus('connecting');
    socketRef.current = createChatWebSocket(Number(spaceId), currentUser.id, fullName);

    socketRef.current.onopen = () => {
      setConnectionStatus('connected');
    };

    socketRef.current.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);

        let message: ChatMessage;
        if (typeof rawData === 'string') {
          try {
            message = JSON.parse(rawData) as ChatMessage;
          } catch {
            console.error("Error parsing string message:", rawData);
            return;
          }
        } else {
          message = rawData as ChatMessage;
        }

        if (message.type === 'join') {
          const joinKey = `${message.user_id}-${message.space_id}-${message.username}`;
          if (processedJoins.current.has(joinKey)) {
            console.log("Join already processed, ignoring:", joinKey);
            return;
          }
          processedJoins.current.add(joinKey);
          
          const messageId = `join-${message.user_id}-${Date.now()}`;
          onJoinMessage(messageId, message.username);
          return;
        }

        if (message.type === 'chat' && !message.data?.content) {
          return;
        }

        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socketRef.current.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnectionStatus('disconnected');
      
      // Reconexión automática (importante para Render.com que puede dormirse)
      if (currentUser && spaceId && reconnectTimeoutRef.current === null) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          if (currentUser && spaceId && !socketRef.current) {
            setupWebSocket();
          }
        }, 3000); // Reconectar después de 3 segundos
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
  };

  useEffect(() => {
    setMessages([]);
    processedJoins.current.clear();

    if (!currentUser || !spaceId) {
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
  }, [spaceId, currentUser?.id, onJoinMessage]);

  const sendMessage = (message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket no está conectado');
    }
  };

  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  return { 
    messages, 
    connectionStatus, 
    sendMessage, 
    reconnect 
  };
};
