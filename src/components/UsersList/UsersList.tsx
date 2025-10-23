import React, { useEffect, useState } from 'react';
import type { SpaceUser } from '../../types/user';
import { getSpaceUsers } from '../../api';
import { useAppContext } from '../../context/AppContext';
import { useUserInfoModal } from '@/hooks';
import UserInfoModal from '@/components/modals/UserInfoModal/UserInfoModal';
import userlistOpen from '../../assets/userlist_open.png';
import userlistClose from '../../assets/userlist_close.png';
import './UsersList.css';

interface UsersListProps {
  spaceId: number;
}

const UsersList: React.FC<UsersListProps> = ({ spaceId }) => {
  const [users, setUsers] = useState<SpaceUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    isUsersListCollapsed, 
    toggleUsersListCollapse, 
    isUserOnline,
    currentUser
  } = useAppContext();
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();



  useEffect(() => {
    const loadUsers = async (retryCount = 0) => {
      if (!spaceId) return;

      setIsLoading(true);
      setError(null);

      try {
        const spaceUsers = await getSpaceUsers(spaceId);
        
        const currentUserInList = currentUser && spaceUsers.some(user => user.id === currentUser.id);
        
        if (currentUser && !currentUserInList && retryCount < 2) {
          setTimeout(() => {
            loadUsers(retryCount + 1);
          }, 1000);
          return;
        }
        
        setUsers(spaceUsers);
      } catch (err) {
        console.error('Error loading space users:', err);
        setError('Error al cargar usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [spaceId, currentUser?.id]);

  const getUserInitials = (user: SpaceUser) => {
    const firstName = user.name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserDisplayName = (user: SpaceUser) => {
    return `${user.name} ${user.last_name}`.trim();
  };

  const getSortedUsers = () => {
    const onlineUsers = users
      .filter(user => isUserOnline(user.id))
      .sort((a, b) => getUserDisplayName(a).localeCompare(getUserDisplayName(b)));

    const offlineUsers = users
      .filter(user => !isUserOnline(user.id))
      .sort((a, b) => getUserDisplayName(a).localeCompare(getUserDisplayName(b)));

    const allUsers = [...onlineUsers, ...offlineUsers];
    return allUsers;
  };

  const handleUserItemClick = (userId: number) => {
    handleUserClick(userId);
  };

  return (
    <>
      {showUserInfoModal && (
        <UserInfoModal
          user={viewedUser}
          isLoading={isLoadingUserInfo}
          onClose={closeUserInfoModal}
        />
      )}

      <div className={`users-list ${isUsersListCollapsed ? 'collapsed' : ''}`}>
        <div className="users-list-container">
          <div className="users-list-header">
            <button className="collapse-toggle" onClick={toggleUsersListCollapse}>
              <img
                src={isUsersListCollapsed ? userlistOpen : userlistClose}
                alt={isUsersListCollapsed ? 'Abrir lista de usuarios' : 'Cerrar lista de usuarios'}
                className="collapse-icon"
              />
            </button>
            {!isUsersListCollapsed && (
              <h3 className="users-list-title">Usuarios</h3>
            )}
          </div>

          <div className="users-list-content">
            {isUsersListCollapsed ? (
              <div className="users-preview">
                {isLoading ? (
                  <div className="users-loading-collapsed">
                    <div className="loading-spinner-small"></div>
                  </div>
                ) : error ? (
                  <div className="users-error-collapsed">
                    <span>❌</span>
                  </div>
                ) : users.length === 0 ? (
                  <div className="users-empty-collapsed">
                    <span>👥</span>
                  </div>
                ) : (
                  <div className="users-avatars-grid">
                    {getSortedUsers().slice(0, 12).map((user) => (
                      <div
                        key={user.id}
                        className={`user-avatar-preview ${!isUserOnline(user.id) ? 'offline' : ''}`}
                        title={`${getUserDisplayName(user)} - ${isUserOnline(user.id) ? 'En línea' : 'Desconectado'}`}
                        onClick={() => handleUserItemClick(user.id)}
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={getUserDisplayName(user)}
                            className="user-avatar-preview-img"
                          />
                        ) : (
                          <div className="user-avatar-preview-placeholder">
                            {getUserInitials(user)}
                          </div>
                        )}
                      </div>
                    ))}
                    {users.length > 12 && (
                      <div className="user-avatar-more" title={`+${users.length - 12} más`}>
                        +{users.length - 12}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {isLoading ? (
                  <div className="users-loading">
                    <div className="loading-spinner"></div>
                    <span>Cargando usuarios...</span>
                  </div>
                ) : error ? (
                  <div className="users-error">
                    <span>❌ {error}</span>
                  </div>
                ) : users.length === 0 ? (
                  <div className="users-empty">
                    <span>No hay usuarios en este space</span>
                  </div>
                ) : (
                  <div className="users-grid">
                    {getSortedUsers().map((user) => (
                      <div
                        key={user.id}
                        className={`user-item ${!isUserOnline(user.id) ? 'offline' : ''}`}
                        onClick={() => handleUserItemClick(user.id)}
                      >
                        <div className="user-avatar">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={getUserDisplayName(user)}
                              className="user-avatar-img"
                            />
                          ) : (
                            <div className="user-avatar-placeholder">
                              {getUserInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name" title={getUserDisplayName(user)}>
                            {getUserDisplayName(user)}
                          </div>
                          {isUserOnline(user.id) && (
                            <div className="user-status-online">
                              En línea
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersList;
