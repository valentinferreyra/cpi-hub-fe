import React from 'react';
import commentsIcon from '@/assets/comments.png';
import './CommentsPill.css';

interface CommentsPillProps {
  count: number;
  onClick?: () => void;
}

export const CommentsPill: React.FC<CommentsPillProps> = ({ count, onClick }) => {
  return (
    <div className="comments-pill" onClick={onClick}>
      <img src={commentsIcon} alt="Comentarios" className="comments-icon" />
      <span className="comments-count">{count}</span>
    </div>
  );
};

export default CommentsPill;
