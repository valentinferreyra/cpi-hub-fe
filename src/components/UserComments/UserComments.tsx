import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserComments } from '../../services/api';
import type { Comment } from '../../types/comment';
import './UserComments.css';

interface UserCommentsProps {
  userId: number;
  userName: string;
}

const UserComments: React.FC<UserCommentsProps> = ({ userId, userName }) => {
  const navigate = useNavigate();
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [pageSize] = useState(5);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await getUserComments(userId, currentPage, pageSize);
        setUserComments(response.data || []);
        setTotalComments(response.total || 0);
      } catch (error) {
        console.error('Error fetching user comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [userId, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getTotalPages = () => {
    return Math.ceil(totalComments / pageSize);
  };

  const handleCommentClick = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="user-comments-section">
      <h3>Últimas opiniones de {userName}</h3>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando comentarios...</span>
        </div>
      ) : userComments.length > 0 ? (
        <>
          <div className="comments-grid">
            {userComments.map((comment) => (
              <div 
                key={comment.id} 
                className="comment-card"
                onClick={() => handleCommentClick(comment.post_id)}
              >
                <div className="comment-content">
                  <p className="comment-text">{comment.content}</p>
                  <div className="comment-meta">
                    <span className="comment-space">#{comment.space.name}</span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {getTotalPages() > 1 && (
            <div className="pagination-container">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Anterior
              </button>
              
              <span className="pagination-info">
                Página {currentPage} de {getTotalPages()}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= getTotalPages()}
                className="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-content">
          <p>Este usuario aún no ha hecho ningún comentario.</p>
        </div>
      )}
    </div>
  );
};

export default UserComments;
