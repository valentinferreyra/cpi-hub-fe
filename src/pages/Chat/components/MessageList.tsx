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
  const [currentPage, setCurrentPage] = useState(1);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const firstVisibleMessageRef = useRef<HTMLDivElement>(null);

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
    if (!spaceId || isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setIsLoadingMore(true);

      const numericSpaceId = typeof spaceId === 'string' ? parseInt(spaceId) : spaceId;
      const result = await getSpaceChatComments(numericSpaceId, pageNum);


      const transformedMessages = result.data.reverse().map(comment => ({
        id: comment.id,
        content: comment.content,
        userId: comment.user_id,
        userName: comment.username,
        createdAt: comment.created_at,
        image: comment.image
      }));

      setHistoricalMessages(prev => {
        if (pageNum === 1) {
          // Primera carga - estos son los mensajes MÁS RECIENTES
          setCurrentPage(1);
          setTimeout(() => {
            if (messagesContainerRef.current) {
              scrollToBottom();
            }
            setIsInitialLoad(false);
          }, 100);
          return transformedMessages;
        } else {
          // Páginas siguientes - son mensajes MÁS ANTIGUOS
          // Los ponemos AL PRINCIPIO del array
          const container = messagesContainerRef.current;
          let scrollHeightBefore = 0;
          let scrollTopBefore = 0;

          if (container) {
            // Guardar posición ANTES de cualquier cambio
            scrollHeightBefore = container.scrollHeight;
            scrollTopBefore = container.scrollTop;

            // Desactivar scroll suave temporalmente
            container.style.scrollBehavior = 'auto';
          }

          // Agregar mensajes al principio
          const newMessages = [...transformedMessages, ...prev];

          // Ajustar scroll INMEDIATAMENTE después del render
          requestAnimationFrame(() => {
            if (container) {
              const scrollHeightAfter = container.scrollHeight;
              const heightDiff = scrollHeightAfter - scrollHeightBefore;

              // Ajustar scroll de forma instantánea
              container.scrollTop = scrollTopBefore + heightDiff;

              // Restaurar scroll suave después de un momento
              setTimeout(() => {
                container.style.scrollBehavior = "smooth";
              }, 100);
            }
          });

          setCurrentPage(pageNum);
          return newMessages;
        }
      });

      setHasMore(result.data.length === 25);
    } catch (error) {
      console.error('Error cargando mensajes históricos:', error);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [spaceId, scrollToBottom]);

  useEffect(() => {
    if (spaceId) {
      setIsInitialLoad(true);
      setHistoricalMessages([]);
      setCurrentPage(1);
      setHasMore(true);
      isLoadingRef.current = false;
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
    if (!isLoadingRef.current && hasMore) {
      loadHistoricalMessages(currentPage + 1);
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      className={`space-chat-messages ${isLoadingMore ? 'loading-more' : ''}`}
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

          {historicalMessages.map((msg, index) => (
            <div
              key={`hist-${msg.id}`}
              className="space-chat-message"
              ref={index === 0 ? firstVisibleMessageRef : null}
            >
              <div className="message-avatar">
                <img
                  src={msg.image}
                  alt={`Avatar de ${msg.userName}`}
                  onClick={() => onUserClick(msg.userId)}
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
