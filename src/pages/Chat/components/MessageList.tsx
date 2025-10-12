import { useRef, useEffect, useState, useCallback } from 'react';
import { getSpaceChatComments } from '@/api/chat';
import { formatChatTime } from '@/utils/dateUtils';
import type { ChatMessage } from '@/hooks/useWebSocket';
import './MessageList.css';

interface HistoricalMessage {
  id: string;
  content: string;
  userId: number;
  userName: string;
  createdAt: string;
  image: string;
}

interface MessageListProps {
  spaceId: string | undefined;
  messages: ChatMessage[];
  currentUser: any;
  onUserClick: (userId: number) => void;
}

export const MessageList = ({ spaceId, messages, currentUser, onUserClick }: MessageListProps) => {
  const [historicalMessages, setHistoricalMessages] = useState<HistoricalMessage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
      // Ocultar el botón después de hacer scroll
      setTimeout(() => {
        setShowScrollButton(false);
      }, 300);
    }
  }, []);

  const loadHistoricalMessages = useCallback(async (pageNum: number) => {
    if (!spaceId) return;

    try {
      setIsLoadingMore(true);
      const numericSpaceId = typeof spaceId === 'string' ? parseInt(spaceId) : spaceId;
      const result = await getSpaceChatComments(numericSpaceId, pageNum);

      const transformedMessages = result.data.map(comment => ({
        id: comment.id,
        content: comment.content,
        userId: comment.user_id,
        userName: comment.username,
        createdAt: comment.created_at,
        image: comment.image
      }));

      setHistoricalMessages(prev => {
        if (pageNum === 1) {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              scrollToBottom();
            }
            setIsInitialLoad(false);
          }, 100);
          return transformedMessages;
        }
        const scrollPosition = messagesContainerRef.current?.scrollTop || 0;
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = scrollPosition;
          }
        }, 50);
        return [...prev, ...transformedMessages];
      });
      setHasMore(result.data.length === 25);
    } catch (error) {
      console.error('Error cargando mensajes históricos:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [spaceId, scrollToBottom]);

  useEffect(() => {
    if (spaceId) {
      setIsInitialLoad(true); 
      loadHistoricalMessages(1);
    }
  }, [spaceId, loadHistoricalMessages]);

  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isInitialLoad]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const maxScroll = element.scrollHeight - element.clientHeight;
    const currentScroll = element.scrollTop;
    setShowScrollButton(maxScroll - currentScroll > 200);
  };

  const handleLoadMore = () => {
    const nextPage = Math.floor(historicalMessages.length / 25) + 1;
    loadHistoricalMessages(nextPage);
  };

  return (
    <div
      ref={messagesContainerRef}
      className="space-chat-messages"
      onScroll={handleScroll}
    >
      {historicalMessages.length === 0 && messages.length === 0 ? (
        <div className="space-chat-empty">No hay mensajes aún</div>
      ) : (
        <div className="messages-container">
          {hasMore && historicalMessages.length > 0 && (
            <button
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Cargando mensajes...' : 'Cargar mensajes anteriores'}
            </button>
          )}

          {historicalMessages.map((msg) => (
            <div key={`hist-${msg.id}`} className="space-chat-message">
              <div className="message-avatar">
                <img 
                  src={msg.image} 
                  alt={`Avatar de ${msg.userName}`}
                  className="user-avatar"
                />
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span 
                    className="space-chat-message-user" 
                    onClick={() => onUserClick(msg.userId)}
                  >
                    {msg.userName}
                  </span>
                  <span className="message-time">{formatChatTime(msg.createdAt)}</span>
                </div>
                <div className="space-chat-message-content">{msg.content}</div>
              </div>
            </div>
          ))}

          {messages.map((msg, index) => {
            if (msg.type === 'chat' && msg.data?.content) {
              return (
                <div key={`live-${index}`} className="space-chat-message">
                  <div className="message-avatar">
                    <img 
                      src={msg.data.image || currentUser.image || '/default-avatar.png'} 
                      alt={`Avatar de ${msg.data.username}`}
                      className="user-avatar"
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span 
                        className="space-chat-message-user" 
                        onClick={() => onUserClick(msg.data.user_id)}
                      >
                        {msg.data.username}
                      </span>
                      <span className="message-time">{formatChatTime(msg.timestamp)}</span>
                    </div>
                    <div className="space-chat-message-content">{msg.data.content}</div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      <button
        className={`scroll-to-bottom ${showScrollButton ? 'visible' : ''}`}
        onClick={scrollToBottom}
        aria-label="Ir a mensajes recientes"
      >
        Ver mensajes recientes
      </button>
    </div>
  );
};
