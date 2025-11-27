import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TrendingPost } from '../../types/trending';
import { formatPostDate } from '../../utils/dateUtils';
import { useUserInfoModal } from '@/hooks';
import UserInfoModal from '@/components/modals/UserInfoModal/UserInfoModal';
import ImageLightbox from '@/components/ImageLightbox';
import CommentsPill from '@/components/CommentsPill';
import ReactionButtons from '@/components/ReactionButtons';
import './TrendingSection.css';

interface TrendingPostsSectionProps {
  posts: TrendingPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const TrendingPostsSection: React.FC<TrendingPostsSectionProps> = ({
  posts,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}) => {
  const navigate = useNavigate();
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();

  const handlePostClick = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleSpaceClick = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    navigate(`/space/${spaceId}`);
  };

  const handleAuthorClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    handleUserClick(userId);
  };

  const handleImageClick = (e: React.MouseEvent, image: string) => {
    e.stopPropagation();
    setLightboxImage(image);
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="trending-section">
        <h2 className="trending-section-title">Posts más populares</h2>
        <div className="trending-loading">Cargando...</div>
      </div>
    );
  }

  if (posts.length === 0 && !isLoading) {
    return (
      <div className="trending-section">
        <h2 className="trending-section-title">Posts más populares</h2>
        <div className="trending-empty">No hay posts en este período</div>
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
        <h2 className="trending-section-title">Posts más populares</h2>
        <div className="trending-posts-grid">
          {posts.map((post) => (
            <div
              key={post.id}
              className="trending-post-card"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="trending-post-header">
                <div className="trending-post-author">
                  <img
                    src={post.created_by.image}
                    alt={`${post.created_by.name} ${post.created_by.last_name}`}
                    className="trending-author-avatar clickable"
                    onClick={(e) => handleAuthorClick(e, post.created_by.id)}
                  />
                  <div className="trending-author-info">
                    <span
                      className="trending-author-name clickable"
                      onClick={(e) => handleAuthorClick(e, post.created_by.id)}
                    >
                      {post.created_by.name} {post.created_by.last_name}
                    </span>
                    <span className="trending-post-space">
                      en{' '}
                      <span
                        className="clickable"
                        onClick={(e) => handleSpaceClick(e, post.space.id)}
                      >
                        {post.space.name}
                      </span>
                    </span>
                  </div>
                </div>
                <span className="trending-post-date">
                  {formatPostDate(post.created_at)}
                </span>
              </div>

              <div className="trending-post-content">
                <h3 className="trending-post-title">{post.title}</h3>
                {post.content && post.content.trim() && (
                  <div className="trending-post-text">
                    {post.content.length > 120
                      ? post.content.slice(0, 120) + '...'
                      : post.content}
                  </div>
                )}
                {post.image && (
                  <div className="trending-post-image-container">
                    <img
                      src={post.image}
                      alt="Imagen del post"
                      className="trending-post-image"
                      onClick={(e) => handleImageClick(e, post.image!)}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="trending-post-footer">
                <div
                  className="trending-post-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ReactionButtons
                    entityType="post"
                    entityId={post.id}
                  />
                  <CommentsPill count={post.comments.length} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && posts.length > 0 && (
          <div className="trending-load-more">
            <button
              className="trending-load-more-btn"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Cargando...' : 'Ver más posts'}
            </button>
          </div>
        )}
      </div>

      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
};

export default TrendingPostsSection;
