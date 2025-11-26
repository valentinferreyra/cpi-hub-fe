import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TrendingComment } from '../../types/trending';
import { formatPostDate } from '../../utils/dateUtils';
import { useUserInfoModal } from '@/hooks';
import UserInfoModal from '@/components/modals/UserInfoModal/UserInfoModal';
import ImageLightbox from '@/components/ImageLightbox';
import ReactionButtons from '@/components/ReactionButtons';
import './TrendingSection.css';

interface TrendingCommentsSectionProps {
  comments: TrendingComment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const TrendingCommentsSection: React.FC<TrendingCommentsSectionProps> = ({
  comments,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}) => {
  const navigate = useNavigate();
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();

  const handleCommentClick = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleSpaceClick = (e: React.MouseEvent, spaceId: string | number) => {
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

  if (isLoading && comments.length === 0) {
    return (
      <div className="trending-section">
        <h2 className="trending-section-title">Comentarios destacados</h2>
        <div className="trending-loading">Cargando...</div>
      </div>
    );
  }

  if (comments.length === 0 && !isLoading) {
    return (
      <div className="trending-section">
        <h2 className="trending-section-title">Comentarios destacados</h2>
        <div className="trending-empty">No hay comentarios en este período</div>
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
        <h2 className="trending-section-title">Comentarios destacados</h2>
        <div className="trending-comments-list">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="trending-comment-card"
              onClick={() => handleCommentClick(comment.post_id)}
            >
              <div className="trending-comment-header">
                <div className="trending-comment-author">
                  <img
                    src={comment.created_by.image}
                    alt={`${comment.created_by.name} ${comment.created_by.last_name}`}
                    className="trending-author-avatar clickable"
                    onClick={(e) => handleAuthorClick(e, comment.created_by.id)}
                  />
                  <div className="trending-author-info">
                    <span
                      className="trending-author-name clickable"
                      onClick={(e) => handleAuthorClick(e, comment.created_by.id)}
                    >
                      {comment.created_by.name} {comment.created_by.last_name}
                    </span>
                    {comment.space && (
                      <span className="trending-comment-space">
                        en{' '}
                        <span
                          className="clickable"
                          onClick={(e) => handleSpaceClick(e, comment.space!.id)}
                        >
                          {comment.space.name}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <span className="trending-comment-date">
                  {formatPostDate(comment.created_at)}
                </span>
              </div>

              <div className="trending-comment-content">
                <div className="trending-comment-text">{comment.content}</div>
                {comment.image && (
                  <div className="trending-comment-image-container">
                    <img
                      src={comment.image}
                      alt="Imagen del comentario"
                      className="trending-comment-image"
                      onClick={(e) => handleImageClick(e, comment.image!)}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="trending-comment-footer">
                <div
                  className="trending-comment-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ReactionButtons
                    entityType="comment"
                    entityId={comment.id}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && comments.length > 0 && (
          <div className="trending-load-more">
            <button
              className="trending-load-more-btn"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Cargando...' : 'Ver más comentarios'}
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

export default TrendingCommentsSection;
