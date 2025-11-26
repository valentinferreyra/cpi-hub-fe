import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TrendingUser } from '../../types/trending';
import { useUserInfoModal } from '@/hooks';
import UserInfoModal from '@/components/modals/UserInfoModal/UserInfoModal';
import './TrendingSection.css';

interface TrendingUsersSectionProps {
  users: TrendingUser[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const TrendingUsersSection: React.FC<TrendingUsersSectionProps> = ({
  users,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}) => {
  const navigate = useNavigate();
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();

  const handleUserCardClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const handleUserAvatarClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    handleUserClick(userId);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="trending-section">
        <h2 className="trending-section-title">Usuarios más activos</h2>
        <div className="trending-loading">Cargando...</div>
      </div>
    );
  }

  if (users.length === 0 && !isLoading) {
    return (
      <div className="trending-section">
        <h2 className="trending-section-title">Usuarios más activos</h2>
        <div className="trending-empty">No hay usuarios en este período</div>
      </div>
    );
  }

  return (
    <>
      {showUserInfoModal && (
        <UserInfoModal
          user={viewedUser}
          isLoading={isLoadingUserInfo}
          onClose={closeUserInfoModal}
        />
      )}

      <div className="trending-section">
        <h2 className="trending-section-title">Usuarios más activos</h2>
        <div className="trending-users-grid">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="trending-user-card"
              onClick={() => handleUserCardClick(user.id)}
            >
              <div className="trending-user-rank">#{index + 1}</div>
              <div className="trending-user-content">
                <img
                  src={user.image}
                  alt={`${user.name} ${user.last_name}`}
                  className="trending-user-avatar clickable"
                  onClick={(e) => handleUserAvatarClick(e, user.id)}
                />
                <div className="trending-user-info">
                  <div className="trending-user-name">
                    {user.name} {user.last_name}
                  </div>
                  <div className="trending-user-stats">
                    <span className="trending-user-likes">
                      ❤️ {user.likes_count} {user.likes_count === 1 ? 'like' : 'likes'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && users.length > 0 && (
          <div className="trending-load-more">
            <button
              className="trending-load-more-btn"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Cargando...' : 'Ver más usuarios'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TrendingUsersSection;
