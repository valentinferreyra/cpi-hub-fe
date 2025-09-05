import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useParams, useNavigate } from 'react-router-dom';
import { mockPost } from '../../data/mockPost';
import { mockCurrentUser } from '../../data/mockCurrentUser';
import { useState, useEffect } from "react";
import type { User } from "../../types/user";
import { useAppContext } from "../../context/AppContext";
import "./Post.css";

export const Post = () => {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const { selectSpace } = useAppContext();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const post = mockPost;
  

  const handleGoToSpace = () => {
    navigate(`/space/${post.space.id}`);
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const breadcrumbItems = [
    { label: post.space.name, onClick: handleGoToSpace },
    { label: `Post de ${post.created_by.name} ${post.created_by.last_name}`, isActive: true }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const user = mockCurrentUser;
        setCurrentUser(user);
      } catch (error) {
        console.error('Error en la carga de datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        fontWeight: '500',
        color: '#333'
      }}>
        Ingresando...
      </div>
    );
  }

  return (
    <div className="post-page">
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
      <div className="post-container">
        <div className="post-section">
          <div className="posts-header">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="post-title-section">
              <img 
                src={post.created_by.image} 
                alt={`${post.created_by.name} ${post.created_by.last_name}`}
                className="post-author-avatar"
              />
              <div className="post-title-content">
                <h1 className="post-title">{post.title}</h1>
                <div className="post-author-date-container">
                  <div className="post-author-date">
                    Por <span 
                      className="post-author clickable"
                      onClick={() => console.log('User ID:', post.created_by.id)}
                    >
                      {post.created_by.name} {post.created_by.last_name}
                    </span>, el {new Date(post.created_at).toLocaleDateString()} a las {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <span 
                    className="post-space-badge-inline clickable"
                    onClick={() => console.log('Space ID:', post.space.id)}
                  >
                    {post.space.name}
                  </span>
                </div>
              </div>
            </div>

          <div className="post-content">
            <p>{post.content}</p>
          </div>

          <div className="post-comments">
            <h3>Comentarios ({post.comments.length})</h3>
            {post.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <div className="comment-author-info">
                    <img 
                      src={comment.created_by.image} 
                      alt={`${comment.created_by.name} ${comment.created_by.last_name}`}
                      className="comment-author-avatar"
                    />
                    <span 
                      className="comment-author clickable"
                      onClick={() => console.log('User ID:', comment.created_by.id)}
                    >
                      {comment.created_by.name} {comment.created_by.last_name}
                    </span>
                  </div>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()} a las {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
            
            <div className="add-comment-section">
              <h4>Agregar comentario</h4>
              <div className="comment-form">
                <textarea 
                  className="comment-input"
                  placeholder="Escribe tu comentario..."
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  className={`add-comment-btn ${newComment.trim() ? 'active' : 'disabled'}`}
                  disabled={!newComment.trim()}
                >
                  Agregar comentario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
