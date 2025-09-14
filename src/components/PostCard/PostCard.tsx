import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types/post';
import { formatPostDate } from '../../utils/dateUtils';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const maxLength = 160;
  const hasContent = post.content && post.content.trim();
  const shouldTruncate = hasContent && post.content.length > maxLength;
  
  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="post-card" onClick={handlePostClick}>
      <div className="post-header">
        <div className="post-author">
          <img 
            src={post.created_by.image} 
            alt={`${post.created_by.name} ${post.created_by.last_name}`}
            className="author-avatar"
          />
          <div className="author-info">
            <span className="author-name">{post.created_by.name} {post.created_by.last_name}</span>
            <span 
              className="post-space"
              onClick={() => console.log('Space ID:', post.space.id)}
            >
              en {post.space.name}
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
          <p className="post-text">
            {post.content.slice(0, maxLength)}
            {shouldTruncate && '...'}
          </p>
        )}
      </div>
      
      <div className="post-footer">
        <span className="comments-count">
          {post.comments.length} comentarios
        </span>
      </div>
    </div>
  );
};

export default PostCard;
