import React, { useState, useEffect } from 'react';
import PostCard from '../PostCard/PostCard';
import { getUserPosts } from '../../api';
import type { Post } from '../../types/post';
import { useMasonryLayout } from '../../hooks';
import './UserPosts.css';

interface UserPostsProps {
  userId: number;
}

const UserPosts: React.FC<UserPostsProps> = ({ userId }) => {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pageSize] = useState(5);

  const masonryRef = useMasonryLayout(userPosts);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getUserPosts(userId, currentPage, pageSize);
        setUserPosts(response.data || []);
        setTotalPosts(response.total || 0);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [userId, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getTotalPages = () => {
    return Math.ceil(totalPosts / pageSize);
  };


  return (
    <div className="user-posts-section">
      <h3>Posts recientes</h3>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando posts...</span>
        </div>
      ) : userPosts.length > 0 ? (
        <>
          <div ref={masonryRef} className="posts-grid">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
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
          <p>Este usuario aún no ha publicado ningún post.</p>
        </div>
      )}
    </div>
  );
};

export default UserPosts;
