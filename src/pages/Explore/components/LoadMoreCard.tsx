import React from 'react';

interface LoadMoreCardProps {
  onClick: () => void;
  isLoading: boolean;
}

const LoadMoreCard: React.FC<LoadMoreCardProps> = ({ onClick, isLoading }) => {
  return (
    <div className="load-more-card" onClick={onClick}>
      <div className="load-more-content">
        {isLoading ? (
          <div className="loading-spinner-small"></div>
        ) : (
          <>
            <div className="load-more-icon">+</div>
            <p>Ver más</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadMoreCard;
