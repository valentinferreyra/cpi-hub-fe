import React from 'react';
import type { Space } from '../../../types/space';
import SpaceCard from './SpaceCard';
import LoadMoreCard from './LoadMoreCard';
import NoSpacesMessage from './NoSpacesMessage';

interface SpacesSectionProps {
  title: string;
  spaces: Space[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onSpaceClick: (space: Space) => void;
  onLoadMore: () => void;
  emptyMessage: string;
  showUpdatedDate?: boolean;
}

const SpacesSection: React.FC<SpacesSectionProps> = ({
  title,
  spaces,
  hasMore,
  isLoadingMore,
  onSpaceClick,
  onLoadMore,
  emptyMessage,
  showUpdatedDate = false
}) => {
  return (
    <div className="explore-section">
      <h2 className="explore-section-title">{title}</h2>
      <div className="explore-container">
        <div className="explore-grid">
          {spaces.length > 0 ? (
            spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onClick={onSpaceClick}
                showUpdatedDate={showUpdatedDate}
              />
            ))
          ) : (
            <NoSpacesMessage message={emptyMessage} />
          )}
          {hasMore && (
            <LoadMoreCard
              onClick={onLoadMore}
              isLoading={isLoadingMore}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SpacesSection;
