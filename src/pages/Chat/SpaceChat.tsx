import Sidebar from "@/components/Sidebar/Sidebar";
import Topbar from "@/components/Topbar/Topbar";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import UsersList from "@/components/UsersList/UsersList";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import "./SpaceChat.css";
import { getSpaceById } from "@/api/spaces";
import { MessageList, MessageInput, JoinNotifications } from "./";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { JoinMessage } from "@/hooks/useWebSocket";
import { getUserById } from "@/api";
import UserInfoModal from "@/components/modals/UserInfoModal/UserInfoModal";

export const SpaceChat = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { currentUser, fetchData, selectSpace, selectedSpace, setSelectedSpace } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [joinMessages, setJoinMessages] = useState<JoinMessage[]>([]);
  const navigate = useNavigate();
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [viewedUser, setViewedUser] = useState<any>(null);

  const handleUserClick = async (userId: number) => {
    // Abrimos el modal inmediatamente para mostrar el loading
    setShowUserInfoModal(true);
    setIsLoadingUserInfo(true);
    setViewedUser(null);
    try {
      const user = await getUserById(userId);
      setViewedUser(user);
    } catch (error) {
      console.error('Error fetching user info:', error);
      // dejamos el modal abierto para mostrar el estado de error
    } finally {
      setIsLoadingUserInfo(false);
    }
  };

  const handleSpaceClick = () => {
    if (spaceId) {
      navigate(`/space/${spaceId}`);
    }
  };

  const showJoinMessage = useCallback((messageId: string, username: string) => {
    setJoinMessages(prev => {
      const existingNotification = prev.find(msg => msg.username === username);
      if (existingNotification) {
        return prev;
      }
      return [...prev, { id: messageId, username }];
    });
  }, []);

  const removeJoinMessage = (messageId: string) => {
    setJoinMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const { messages } = useWebSocket({
    spaceId,
    currentUser,
    onJoinMessage: showJoinMessage
  });

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
      {selectedSpace && (
        <UsersList spaceId={selectedSpace.id} />
      )}

      {showUserInfoModal && (
        <UserInfoModal
          user={viewedUser}
          isLoading={isLoadingUserInfo}
          onClose={() => {
            setShowUserInfoModal(false);
            setViewedUser(null);
            setIsLoadingUserInfo(false);
          }}
        />
      )}

      <div className="space-chat-page">
        <div className="space-chat-container">
          <div className="space-chat-header">
            <Breadcrumb
              items={[
                {
                  label: selectedSpace?.name || 'Cargando espacio...',
                  onClick: handleSpaceClick
                },
                {
                  label: 'Chat',
                  isActive: true
                }
              ]}
            />
          </div>

          <div className="space-chat-messages-container">
            <MessageList
              spaceId={spaceId}
              messages={messages}
              currentUser={currentUser}
              onUserClick={handleUserClick}
            />

            <JoinNotifications
              joinMessages={joinMessages}
              onRemoveJoinMessage={removeJoinMessage}
            />
          </div>

          <MessageInput
            currentUser={currentUser}
            spaceId={spaceId}
            onMessageSent={() => { }}
          />
        </div>
      </div>
    </>
  );
};

export default SpaceChat;