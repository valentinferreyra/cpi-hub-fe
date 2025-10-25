import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types/post';
import { formatPostDate } from '../../utils/dateUtils';
import { useUserInfoModal } from '@/hooks';
import UserInfoModal from '@/components/modals/UserInfoModal/UserInfoModal';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();
  const maxLength = 160;
  const hasContent = post.content && post.content.trim();
  const shouldTruncate = hasContent && post.content.length > maxLength;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleSpaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/space/${post.space.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUserClick(post.created_by.id);
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

      <div className={`post-card ${isLoaded ? 'loaded' : ''}`} onClick={handlePostClick}>
        <div className="post-header">
          <div className="post-author">
            <img
              src={post.created_by.image}
              alt={`${post.created_by.name} ${post.created_by.last_name}`}
              className="author-avatar clickable"
              onClick={handleAuthorClick}
            />
            <div className="author-info">
              <span
                className="author-name clickable"
                onClick={handleAuthorClick}
              >
                {post.created_by.name} {post.created_by.last_name}
              </span>
              <span className="post-space">
                en <span className="clickable" onClick={handleSpaceClick}>{post.space.name}</span>
              </span>
            </div>
          </div>
          <span className="post-date">
            {formatPostDate(post.created_at)}
          </span>
        </div>

        <div className="post-content">
          <h3 className="post-title">{post.title}</h3>
          {post.content && post.content.trim() && (
            <div className="post-text">
              {shouldTruncate ? post.content.slice(0, maxLength) + '...' : post.content}
            </div>
          )}
          {post.image && (
            <div className="post-image-container">
              <img 
                src={post.image} 
                alt="Imagen del post"
                className="post-image"
                onError={(e) => {
                  console.error('Error loading post image:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="post-footer">
          <span className="comments-count">
            {post.comments.length} comentarios
          </span>
        </div>
      </div>
    </>
  );
};

export default PostCard;
