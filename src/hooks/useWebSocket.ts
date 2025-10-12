import { useEffect, useRef, useState } from 'react';

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
  baseUrl?: string;
}

export const useWebSocket = ({ 
  spaceId, 
  currentUser, 
  onJoinMessage,
  baseUrl = 'ws://localhost:8080/v1/ws'
}: UseWebSocketProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const processedJoins = useRef(new Set<string>());

  useEffect(() => {
    setMessages([]);
    processedJoins.current.clear();

    if (!currentUser || !spaceId) return;

    const fullName = encodeURIComponent(`${currentUser.name} ${currentUser.last_name}`);
    const wsUrl = `${baseUrl}/spaces/${spaceId}?user_id=${currentUser.id}&username=${fullName}`;
    console.log('Conectando a WebSocket:', wsUrl);
    
    setConnectionStatus('connecting');
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('Conectado al WebSocket');
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
            console.error("Error parseando el mensaje string:", rawData);
            return;
          }
        } else {
          message = rawData as ChatMessage;
        }

        if (message.type === 'join') {
          const joinKey = `${message.user_id}-${message.space_id}-${message.username}`;
          if (processedJoins.current.has(joinKey)) {
            console.log("Join ya procesado, ignorando:", joinKey);
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
        console.error("Error parseando mensaje:", error);
      }
    };

    socketRef.current.onclose = () => {
      console.log('Desconectado del WebSocket');
      setConnectionStatus('disconnected');
    };

    socketRef.current.onerror = (error) => {
      console.error('Error en WebSocket:', error);
      setConnectionStatus('disconnected');
    };

    return () => {
      socketRef.current?.close();
    };
  }, [spaceId, currentUser?.id, onJoinMessage, baseUrl]);

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
