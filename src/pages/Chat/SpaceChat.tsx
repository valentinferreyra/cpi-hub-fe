import Sidebar from "@/components/Sidebar/Sidebar";
import Topbar from "@/components/Topbar/Topbar";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import "./SpaceChat.css";
import axios from "axios";
import { getSpaceById } from "@/api/spaces";

export const SpaceChat = () => {
  const { spaceId } = useParams<{ spaceId: number }>();
  const { currentUser, fetchData, selectSpace, selectedSpace, setSelectedSpace } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  interface ChatMessageData {
    id: string;
    content: string;
    user_id: number;
    username: string;
    space_id: number;
    timestamp: string;
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

  // Cargar datos del usuario y del espacio
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchData();

        if (spaceId) {
          const numericSpaceId = parseInt(spaceId);
          if (!isNaN(numericSpaceId)) {
            const spaceData = await getSpaceById(numericSpaceId);
            if (spaceData) {
              setSelectedSpace(spaceData);
            }
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchData, spaceId, setSelectedSpace]);

  useEffect(() => {
    // Limpiar mensajes cuando cambiamos de space
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
        console.log("=== NUEVO MENSAJE ===");
        console.log("Raw:", event.data);

        // Si el mensaje viene como string, intentar parsearlo
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

        console.log("Parseado:", message);
        console.log("Username:", message.data?.username);
        console.log("Content:", message.data?.content);
        console.log("===================");

        // Para mensajes de join, mantener el sistema de deduplicación
        if (message.type === 'join') {
          const joinKey = `${message.user_id}-${message.space_id}`;
          if (processedJoins.current.has(joinKey)) {
            console.log("Join ya procesado, ignorando:", joinKey);
            return;
          }
          processedJoins.current.add(joinKey);
        }

        // Asegurarse que los mensajes de chat tengan contenido
        if (message.type === 'chat' && !message.data?.content) {
          console.log("Mensaje sin contenido, ignorando");
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
      // Convertimos spaceId a número
      const numericSpaceId = typeof spaceId === 'string' ? parseInt(spaceId, 10) : spaceId;
      if (isNaN(numericSpaceId)) {
        throw new Error('ID de espacio inválido');
      }

      const messageData = {
        space_id: numericSpaceId,
        user_id: currentUser.id,
        username: currentUser.name,
        message: inputMessage.trim()
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
          // El servidor respondió con un status code fuera del rango 2xx
          console.error("Respuesta del servidor:", error.response.data);
          alert(`Error del servidor: ${error.response.data?.message || 'Error desconocido'}`);
        } else if (error.request) {
          // La request fue hecha pero no se recibió respuesta
          alert("No se recibió respuesta del servidor");
        }
      } else {
        // Algo pasó al armar la request
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

  return (
    <>
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
      <div className="space-chat-page">
        <div className="space-chat-container">
          <h1 className="space-chat-title">
            Chat en {selectedSpace?.name || 'Cargando espacio...'}
          </h1>
          <div className="space-chat-messages">
            {messages.length === 0 ? (
              <div className="space-chat-empty">No hay mensajes aún</div>
            ) : (
              messages.map((msg, index) => {
                // Para depuración
                console.log("Renderizando mensaje:", msg);

                if (msg.type === 'join') {
                  return (
                    <div key={index} className="space-chat-system-message">
                      👋 ¡{msg.username} se unió al chat!
                    </div>
                  );
                }

                // Si es un mensaje de chat
                if (msg.type === 'chat' && msg.data?.content) {
                  return (
                    <div key={index} className="space-chat-message">
                      <span className="space-chat-message-user" onClick={() => handleUserClick(msg.data.user_id)}>{msg.data.username}:</span>
                      <span className="space-chat-message-content">{msg.data.content}</span>
                    </div>
                  );
                }

                console.warn("Mensaje con formato inesperado:", msg);
                return null;
              })
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
        </div>
      </div>
    </>
  );
};

export default SpaceChat;