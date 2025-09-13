import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import type { User } from "../../types/user";
import { useAppContext } from "../../context/AppContext";
import { getCurrentUser, getPostById, addCommentToPost } from "../../services/api";
import type { Post as PostType } from "../../types/post";
import { formatPostDetailDate, formatPostDetailTime } from "../../utils/dateUtils";
import "./Post.css";

export const Post = () => {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const { currentUser, selectSpace, fetchData } = useAppContext();
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);


  const handleGoToSpace = () => {
    if (post) {
      navigate(`/space/${post.space.id}`);
    }
  };

  const handleAddComment = async () => {
    if (!post || !newComment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      await addCommentToPost(currentUser!.id, post.id, newComment.trim());

      setShowSuccessMessage(true);

      setNewComment('');

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      const updatedPost = await getPostById(post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        await fetchData();
        if (post_id) {
          const postData = await getPostById(post_id);
          setPost(postData);
        }
      } catch (error) {
        console.error('Error en la carga de datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [post_id, fetchData]);

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

  if (!post) {
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
        Post no encontrado
      </div>
    );
  }

  const breadcrumbItems = [
    { label: post.space.name, onClick: handleGoToSpace },
    { label: `Post de ${post.created_by.name} ${post.created_by.last_name}`, isActive: true }
  ];

  return (
    <>
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />

      <div className="post-page">
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
                    </span>, el {formatPostDetailDate(post.created_at)} a las {formatPostDetailTime(post.created_at)}
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
                      {formatPostDetailDate(comment.created_at)} a las {formatPostDetailTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))}

              <div className="add-comment-section">
                <h4>Agregar comentario</h4>
                {showSuccessMessage && (
                  <div className="success-message">
                    ✅ Comentario agregado correctamente
                  </div>
                )}
                <div className="comment-form">
                  <textarea
                    className="comment-input"
                    placeholder="Escribe tu comentario..."
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmittingComment}
                  />
                  <button
                    className={`add-comment-btn ${newComment.trim() && !isSubmittingComment ? 'active' : 'disabled'}`}
                    disabled={!newComment.trim() || isSubmittingComment}
                    onClick={handleAddComment}
                  >
                    {isSubmittingComment ? 'Agregando...' : 'Agregar comentario'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  );
};

export default Post;
