import { useState, useEffect, useRef } from 'react';
import { createNotificationWebSocket } from '../api/websocket';
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notifications';
import type { Notification, NotificationMessage } from '../types/notification';

interface UseNotificationsProps {
  currentUser: { id: number } | null;
  enabled?: boolean;
}

export const useNotifications = ({ 
  currentUser, 
  enabled = true 
}: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processedNotificationIds = useRef(new Set<string>());
  const hasLoadedInitialNotifications = useRef(false);
  const currentUserIdRef = useRef<number | null>(null);

  // Resetear cuando cambia el usuario
  useEffect(() => {
    if (currentUser?.id !== currentUserIdRef.current) {
      hasLoadedInitialNotifications.current = false;
      processedNotificationIds.current.clear();
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(true);
      currentUserIdRef.current = currentUser?.id || null;
    }
  }, [currentUser?.id]);

  // Cargar notificaciones iniciales desde el backend
  useEffect(() => {
    if (!enabled || !currentUser || hasLoadedInitialNotifications.current) {
      return;
    }

    const loadInitialNotifications = async () => {
      try {
        setIsLoading(true);
        const [initialNotifications, initialUnreadCount] = await Promise.all([
          getNotifications(currentUser.id, 50, 0),
          getUnreadCount(currentUser.id)
        ]);

        initialNotifications.forEach(notif => {
          processedNotificationIds.current.add(notif.id);
        });

        setNotifications(initialNotifications);
        setUnreadCount(initialUnreadCount);
        
        hasLoadedInitialNotifications.current = true;
      } catch (error) {
        console.error('Error loading initial notifications:', error);
        hasLoadedInitialNotifications.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialNotifications();
  }, [currentUser?.id, enabled]);

  useEffect(() => {
    if (!enabled || !currentUser) {
      return;
    }

    const connect = () => {
      try {
        setConnectionStatus('connecting');
        
        const socket = createNotificationWebSocket(currentUser.id);
        
        socket.onopen = () => {
          setConnectionStatus('connected');

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        socket.onmessage = (event) => {
          try {
            const message: NotificationMessage = JSON.parse(event.data);
            
            if (message.type === 'notification') {
              if (processedNotificationIds.current.has(message.data.id)) {
                return;
              }
              
              processedNotificationIds.current.add(message.data.id);
              
              setNotifications(prev => [message.data, ...prev]);
              
              if (!message.data.read) {
                setUnreadCount(prev => prev + 1);
                // Mostrar toast solo para notificaciones no leídas
                setToastNotification(message.data);
              }
            }
          } catch (error) {
            console.error('Error parsing notification message:', error);
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
        };

        socket.onclose = () => {
          setConnectionStatus('disconnected');
          
          if (enabled && currentUser) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, 3000);
          }
        };

        socketRef.current = socket;
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    let connectTimeout: ReturnType<typeof setTimeout>;
    let checkInterval: ReturnType<typeof setInterval>;

    const attemptConnect = () => {
      if (hasLoadedInitialNotifications.current) {
        connect();
      } else {
        connectTimeout = setTimeout(() => {
          if (!hasLoadedInitialNotifications.current) {
            hasLoadedInitialNotifications.current = true;
          }
          connect();
        }, 3000);

        checkInterval = setInterval(() => {
          if (hasLoadedInitialNotifications.current) {
            clearInterval(checkInterval);
            clearTimeout(connectTimeout);
            connect();
          }
        }, 100);
      }
    };

    attemptConnect();

    return () => {
      if (connectTimeout) {
        clearTimeout(connectTimeout);
      }
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [currentUser?.id, enabled]);

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return;

    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await markNotificationAsRead(currentUser.id, notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: false } : notif
        )
      );
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;

    const currentUnread = unreadCount;
    
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead(currentUser.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: false }))
      );
      setUnreadCount(currentUnread);
    }
  };

  const closeToast = () => {
    setToastNotification(null);
  };

  return {
    notifications,
    unreadCount,
    connectionStatus,
    isLoading,
    toastNotification,
    closeToast,
    markAsRead,
    markAllAsRead,
  };
};

