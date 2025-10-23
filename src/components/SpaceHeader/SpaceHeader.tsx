import React from 'react';
import type { Space, User } from '../../types/space';
import { useUserInfoModal } from '@/hooks';
import UserInfoModal from '@/components/modals/UserInfoModal/UserInfoModal';
import './SpaceHeader.css';

interface SpaceHeaderProps {
  space: Space;
  currentUser: User | null;
  isUserInSpace: boolean;
  settingsRef: React.RefObject<HTMLDivElement>;
  showSettingsDropdown: boolean;
  onJoinSpace: () => void;
  onSettingsClick: (e: React.MouseEvent) => void;
  onLeaveSpace: () => void;
}

const SpaceHeader: React.FC<SpaceHeaderProps> = ({
  space,
  isUserInSpace,
  settingsRef,
  showSettingsDropdown,
  onJoinSpace,
  onSettingsClick,
  onLeaveSpace
}) => {
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();

  const handleCreatorClick = () => {
    handleUserClick(space.created_by.id);
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

      <div className="space-header-hero">
        <div className="space-header-content">
          <div className="space-title-section">
            <div className="space-title-main">
              <h1 className="space-title">{space.name}</h1>
              <p className="space-description">{space.description}</p>
            </div>
            <div className="space-actions">
              {!isUserInSpace && (
                <button className="space-action-btn join-space-btn" onClick={onJoinSpace}>
                  <span>+</span>
                  Unirse al space
                </button>
              )}
              {isUserInSpace && (
                <div className="space-settings-container" ref={settingsRef}>
                  <button className="space-settings-btn" onClick={onSettingsClick}>
                    <img
                      src="/src/assets/settings.png"
                      alt="Configuración"
                      className="space-settings-icon"
                    />
                  </button>
                  {showSettingsDropdown && (
                    <div className="space-settings-dropdown">
                      <button
                        className="dropdown-item danger"
                        onClick={onLeaveSpace}
                      >
                        Abandonar space
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-meta-section">
            <div className="space-stats">
              <div className="space-stat">
                <span className="space-stat-icon">👥</span>
                <span>{space.users} usuarios</span>
              </div>
              <div className="space-stat">
                <span className="space-stat-icon">✏️</span>
                <span>{space.posts} posts</span>
              </div>
            </div>
            <div className="space-creator-info">
              <div
                className="space-creator-avatar clickable"
                onClick={handleCreatorClick}
                title={`Ver perfil de ${space.created_by?.name || 'usuario'}`}
              >
                {space.created_by?.image ? (
                  <img
                    src={space.created_by.image}
                    alt={`${space.created_by.name} ${space.created_by.last_name}`}
                    className="space-creator-avatar-img"
                  />
                ) : (
                  <span className="space-creator-avatar-placeholder">
                    {space.created_by?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <span
                className="space-creator-name clickable"
                onClick={handleCreatorClick}
              >
                Creado por {space.created_by?.name || 'N/A'} {space.created_by?.last_name || ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpaceHeader;
