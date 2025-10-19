import React from 'react';
import type { Space, User } from '../../types/space';
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
  currentUser,
  isUserInSpace,
  settingsRef,
  showSettingsDropdown,
  onJoinSpace,
  onSettingsClick,
  onLeaveSpace
}) => {
  return (
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
            <div className="space-creator-avatar">
              {(space.created_by?.name || 'U')[0].toUpperCase()}
            </div>
            <span>
              Creado por {space.created_by?.name || 'N/A'} {space.created_by?.last_name || ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceHeader;
