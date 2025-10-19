import React, { useEffect, useState } from 'react';
import type { SpaceUser } from '../../types/user';
import { getSpaceUsers } from '../../api';
import { useAppContext } from '../../context/AppContext';
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
  const { isUsersListCollapsed, toggleUsersListCollapse } = useAppContext();



  useEffect(() => {
    const loadUsers = async () => {
      if (!spaceId) return;

      setIsLoading(true);
      setError(null);

      try {
        const spaceUsers = await getSpaceUsers(spaceId);
        setUsers(spaceUsers);
      } catch (err) {
        console.error('Error loading space users:', err);
        setError('Error al cargar usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [spaceId]);

  const getUserInitials = (user: SpaceUser) => {
    const firstName = user.name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserDisplayName = (user: SpaceUser) => {
    return `${user.name} ${user.last_name}`.trim();
  };

  return (
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
          {!isUsersListCollapsed && <h3 className="users-list-title">Usuarios</h3>}
        </div>
        
        {!isUsersListCollapsed && (
          <div className="users-list-content">
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
                {users.map((user) => (
                  <div key={user.id} className="user-item">
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
                    <div className="user-name" title={getUserDisplayName(user)}>
                      {getUserDisplayName(user)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
