import React, { useEffect } from 'react';
import type { SpaceUser } from '../../types/user';
import './SpaceUsersModal.css';

interface SpaceUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: SpaceUser[];
  spaceName: string;
}

const SpaceUsersModal: React.FC<SpaceUsersModalProps> = ({
  isOpen,
  onClose,
  users,
  spaceName
}) => {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="space-users-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Usuarios de {spaceName}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          {users.length === 0 ? (
            <div className="empty-state">
              <p>No hay usuarios en este space</p>
            </div>
          ) : (
            <div className="users-list">
              {users.map((user) => (
                <div key={user.id} className="user-item">
                  <img
                    src={user.image}
                    alt={`${user.name} ${user.last_name}`}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <span className="user-name">
                      {user.name} {user.last_name}
                    </span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceUsersModal;
