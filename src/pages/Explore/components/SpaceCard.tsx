import React from 'react';
import type { Space } from '../../../types/space';
import { formatDateTime } from '../../../utils/dateUtils';

interface SpaceCardProps {
  space: Space;
  onClick: (space: Space) => void;
  showUpdatedDate?: boolean;
  isUserJoined?: boolean;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ 
  space, 
  onClick, 
  showUpdatedDate = false,
  isUserJoined = false
}) => {
  const handleClick = () => {
    onClick(space);
  };

  return (
    <div className="space-card" onClick={handleClick}>
      <div className="space-card-header">
        <h3 className="space-card-name">{space.name}</h3>
        {isUserJoined && (
          <div className="space-card-joined-badge">
            ✓ Unido
          </div>
        )}
      </div>
      <p className="space-card-description">{space.description}</p>
      <div className="space-card-meta">
        <span className="space-card-users">Usuarios: {space.users}</span>
        <span className="space-card-posts">Posts: {space.posts}</span>
      </div>
      <div className="space-card-footer">
        <span className="space-card-creator">
          {showUpdatedDate ? 'Actualizado' : 'Creado'}: {formatDateTime(
            showUpdatedDate ? space.updated_at : space.created_at
          )}
        </span>
      </div>
    </div>
  );
};

export default SpaceCard;
