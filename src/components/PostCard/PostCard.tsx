import React, { useState } from 'react';
import type { Post } from '../../types/post';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const maxLength = 150;
  const shouldTruncate = post.content.length > maxLength;
  const displayContent = post.content.slice(0, maxLength) + '...';

  return (
    <div className="post-card">
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
          {new Date(post.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">
          {post.content.slice(0, maxLength)}
          {shouldTruncate && (
            <>
              ...{' '}
              <button 
                className="read-more-btn"
                onClick={() => console.log('Post ID:', post.id)}
              >
                Ver más
              </button>
            </>
          )}
        </p>
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
