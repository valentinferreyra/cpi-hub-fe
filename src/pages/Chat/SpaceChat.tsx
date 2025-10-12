import Sidebar from "@/components/Sidebar/Sidebar";
import Topbar from "@/components/Topbar/Topbar";
import { useAppContext } from "@/context/AppContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./SpaceChat.css";
import axios from "axios";
import { getSpaceById } from "@/api/spaces";
import { getSpaceChatComments } from "@/api/chat";
import { formatChatTime } from "@/utils/dateUtils";


interface HistoricalMessage {
  id: string;
  content: string;
  userId: number;
  userName: string;
  createdAt: string;
  image: string;
}

export const SpaceChat = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { currentUser, fetchData, selectSpace, selectedSpace, setSelectedSpace } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [historicalMessages, setHistoricalMessages] = useState<HistoricalMessage[]>([]);
  interface ChatMessageData {
    id: string;
    content: string;
    user_id: number;
    username: string;
    space_id: number;
    timestamp: string;
    image?: string;
  }

  interface ChatMessage {
    type: 'chat' | 'join';
    data: ChatMessageData;
    timestamp: string;
    user_id: number;
    space_id: number;
    username: string;
  }
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);
  const processedJoins = useRef(new Set<string>());
  const navigate = useNavigate();

  const handleUserClick = (userId: number) => {
    navigate(`/users/${userId}`);
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const loadHistoricalMessages = useCallback(async (pageNum: number) => {
    if (!spaceId) return;

    try {
      setIsLoadingMore(true);
      const numericSpaceId = typeof spaceId === 'string' ? parseInt(spaceId) : spaceId;
      const result = await getSpaceChatComments(numericSpaceId, pageNum);

      // Transformar los datos al formato que necesitamos
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
  }, [spaceId]);

  // Cargar datos del usuario y del espacio
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchData();

        if (spaceId) {
          const numericSpaceId = typeof spaceId === 'string' ? parseInt(spaceId) : spaceId;
          if (!isNaN(numericSpaceId)) {
            const spaceData = await getSpaceById(numericSpaceId);
            if (spaceData) {
              setSelectedSpace(spaceData);
            }
            await loadHistoricalMessages(1);
            setTimeout(() => {
              if (messagesContainerRef.current) {
                scrollToBottom();
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchData, spaceId, setSelectedSpace, loadHistoricalMessages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    processedJoins.current.clear();

    if (!currentUser || !spaceId) return;

    const fullName = encodeURIComponent(`${currentUser.name} ${currentUser.last_name}`);
    const wsUrl = `ws://localhost:8080/v1/ws/spaces/${spaceId}?user_id=${currentUser.id}&username=${fullName}`;
    console.log('Conectando a WebSocket:', wsUrl);
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('Conectado al WebSocket');
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
          const joinKey = `${message.user_id}-${message.space_id}`;
          if (processedJoins.current.has(joinKey)) {
            console.log("Join ya procesado, ignorando:", joinKey);
            return;
          }
          processedJoins.current.add(joinKey);
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
    };

    return () => {
      socketRef.current?.close();
    };
  }, [spaceId, currentUser]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || !spaceId) return;

    try {
      const numericSpaceId = typeof spaceId === 'string' ? parseInt(spaceId, 10) : spaceId;
      if (isNaN(numericSpaceId)) {
        throw new Error('ID de espacio inválido');
      }

      const messageData = {
        space_id: numericSpaceId,
        user_id: currentUser.id,
        username: `${currentUser.name} ${currentUser.last_name}`,
        message: inputMessage.trim(),
        image: currentUser.image
      };

      console.log("Enviando mensaje:", messageData);
      const response = await axios.post(
        `http://localhost:8080/v1/ws/spaces/${spaceId}/chat`,
        messageData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("Respuesta:", response.data);
      setInputMessage("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error enviando mensaje:", error);
        if (error.response) {
          console.error("Respuesta del servidor:", error.response.data);
          alert(`Error del servidor: ${error.response.data?.message || 'Error desconocido'}`);
        } else if (error.request) {
          alert("No se recibió respuesta del servidor");
        }
      } else {
        console.error("Error no relacionado con Axios:", error);
        alert("Error al enviar el mensaje");
      }
    }
  };

  if (!currentUser || isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        fontWeight: '500',
        color: '#333'
      }}>
        Cargando...
      </div>
    );
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const maxScroll = element.scrollHeight - element.clientHeight;
    const currentScroll = element.scrollTop;
    setShowScrollButton(maxScroll - currentScroll > 100);
  };

  return (
    <>
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
      <div className="space-chat-page">
        <div className="space-chat-container">
          <h1 className="space-chat-title">
            Chat en {selectedSpace?.name || 'Cargando espacio...'}
          </h1>
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
                    onClick={() => {
                      setPage(prevPage => {
                        const nextPage = prevPage + 1;
                        loadHistoricalMessages(nextPage);
                        return nextPage;
                      });
                    }}
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
                        <span className="space-chat-message-user" onClick={() => handleUserClick(msg.userId)}>
                          {msg.userName}
                        </span>
                        <span className="message-time">{formatChatTime(msg.createdAt)}</span>
                      </div>
                      <div className="space-chat-message-content">{msg.content}</div>
                    </div>
                  </div>
                ))}

                {messages.map((msg, index) => {
                  if (msg.type === 'join') {
                    return (
                      <div key={`live-${index}`} className="space-chat-system-message">
                        👋 ¡{msg.username} se unió al chat!
                      </div>
                    );
                  }

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
                            <span className="space-chat-message-user" onClick={() => handleUserClick(msg.data.user_id)}>
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
          </div>
          <div className="space-chat-input-section">
            <input
              className="space-chat-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
            />
            <button className="space-chat-send-btn" onClick={sendMessage}>Enviar</button>
          </div>
          <button
            className={`scroll-to-bottom ${showScrollButton ? 'visible' : ''}`}
            onClick={scrollToBottom}
            aria-label="Ir a mensajes recientes"
          >
            Ver mensajes recientes
          </button>
        </div>
      </div>
    </>
  );
};

export default SpaceChat;