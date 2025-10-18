import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SpaceUser } from '../../../types/user';
import './SpaceUsersModal.css';

interface SpaceUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: SpaceUser[];
  spaceName: string;
  isLoading?: boolean;
  onUserClick?: (userId: number) => void;
}

const SpaceUsersModal: React.FC<SpaceUsersModalProps> = ({
  isOpen,
  onClose,
  users,
  spaceName,
  isLoading = false,
  onUserClick
}) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="space-users-overlay" onClick={onClose}>
      <div className="space-users-modal" onClick={(e) => e.stopPropagation()}>
        <div className="space-users-header">
          <h2>Usuarios de <span className='space-users-space-name'>{spaceName}</span></h2>
        </div>

        <div className="space-users-content">
          {isLoading ? (
            <div className="space-users-loading-state">
              <div className="space-users-loading-spinner"></div>
              <p>Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="space-users-empty-state">
              <p>No hay usuarios en este space</p>
            </div>
          ) : (
            <div className="space-users-list">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="space-users-item"
                  onClick={() => onUserClick ? onUserClick(user.id) : navigate(`/users/${user.id}`)}
                >
                  <img
                    src={user.image}
                    alt={`${user.name} ${user.last_name}`}
                    className="space-users-avatar"
                  />
                  <div className="space-users-info">
                    <span className="space-users-name">
                      {user.name} {user.last_name}
                    </span>
                    <span className="space-users-email">{user.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-users-footer">
          <button className="space-users-close-modal-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceUsersModal;
