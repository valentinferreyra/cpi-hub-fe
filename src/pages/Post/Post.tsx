import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import Breadcrumb from "@components/Breadcrumb/Breadcrumb";
import UsersList from "@components/UsersList/UsersList";
import CommentItem from "@components/CommentItem/CommentItem";
import EditPostModal from "@components/modals/EditPostModal/EditPostModal";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { getPostById, addCommentToPost, updatePost, deletePost } from "../../api";
import type { Post as PostType } from "../../types/post";
import { formatPostDetailDate, formatPostDetailTime } from "../../utils/dateUtils";
import { useClickOutside } from "../../hooks/useClickOutside";
import "./Post.css";

export const Post = () => {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const { currentUser, selectSpace } = useAppContext();
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const postMenuRef = useClickOutside<HTMLDivElement>(() => {
    setShowPostMenu(false);
  });


  const handleGoToSpace = () => {
    if (post) {
      navigate(`/space/${post.space.id}`);
    }
  };

  const refreshPost = async () => {
    if (!post) return;
    const updated = await getPostById(post.id);
    if (updated) setPost(updated);
  };

  const handleCommentUpdated = async () => {
    await refreshPost();
    setSuccessMessage('Comentario actualizado correctamente');
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleAddComment = async () => {
    if (!post || !newComment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      await addCommentToPost(currentUser!.id, post.id, newComment.trim());

      setSuccessMessage('Comentario agregado correctamente');
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
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditPost = async (title: string, content: string) => {
    if (!post || !currentUser) return;

    try {
      await updatePost(parseInt(post.id), title, content);
      const refreshed = await getPostById(post.id);
      if (refreshed) setPost(refreshed);
      setSuccessMessage('Post actualizado correctamente');
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
    setShowPostMenu(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowPostMenu(false);
  };

  const handleConfirmDelete = async () => {
    if (!post) return;

    try {
      setIsDeleting(true);
      await deletePost(post.id);
      navigate(`/space/${post.space.id}`);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const togglePostMenu = () => {
    setShowPostMenu(!showPostMenu);
  };

  const isPostAuthor = currentUser && post && currentUser.id.toString() === post.created_by.id.toString();

  const handleReplySubmit = async (parentCommentId: number, content: string) => {
    if (!post) return;

    try {
      await addCommentToPost(currentUser!.id, post.id, content, parentCommentId);

      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      const updatedPost = await getPostById(post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error al agregar respuesta:', error);
      throw error;
    }
  };


  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        if (post_id) {
          const postData = await getPostById(post_id);
          setPost(postData);
        }
      } catch (error) {
        console.error('Error in data loading:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [post_id]);

  if (isLoading) {
    return (
      <div className="loading-container">
        Ingresando...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="loading-container">
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
      {showSuccessMessage && (
        <div className="success-message toast-success">
          {successMessage}
        </div>
      )}
      {post && (
        <UsersList spaceId={parseInt(post.space.id)} />
      )}

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
                <div className="post-title-header">
                  <h1 className="post-title">{post.title}</h1>
                  {isPostAuthor && (
                    <div className="post-menu-container" ref={postMenuRef}>
                      <button
                        className="post-menu-btn"
                        onClick={togglePostMenu}
                        title="Opciones"
                      >
                        ⋮
                      </button>
                      {showPostMenu && (
                        <div className="post-menu-dropdown">
                          <button className="post-menu-item" onClick={handleEditClick}>
                            <span className="menu-icon">✏️</span>
                            <span>Editar</span>
                          </button>
                          <button className="post-menu-item delete" onClick={handleDeleteClick}>
                            <span className="menu-icon">🗑️</span>
                            <span>Borrar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="post-author-date-container">
                  <div className="post-author-date">
                    Por<span
                      className="post-author clickable"
                      onClick={() => navigate(`/users/${post.created_by.id}`)}
                    >
                      {post.created_by.name} {post.created_by.last_name}
                    </span>, el {formatPostDetailDate(post.created_at)} a las {formatPostDetailTime(post.created_at)}
                  </div>
                  <div className="post-stats">
                    <span className="post-comments-count">{post.comments.length} comentarios</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="post-content">
              <p>{post.content}</p>
            </div>

            <div className="post-comments">
              <h3>Comentarios</h3>
              {post.comments
                .filter(comment => !comment.parent_comment_id)
                .map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    currentUserId={currentUser!.id}
                    onReplySubmit={handleReplySubmit}
                    onCommentUpdated={handleCommentUpdated}
                  />
                ))}

              <div className="comment-form-integrated">
                <div className="comment-input-container">
                  <textarea
                    className="comment-input"
                    placeholder="Escribe tu comentario..."
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmittingComment}
                  />
                  <button
                    className={`comment-submit-btn ${newComment.trim() && !isSubmittingComment ? 'active' : 'disabled'}`}
                    disabled={!newComment.trim() || isSubmittingComment}
                    onClick={handleAddComment}
                  >
                    {isSubmittingComment ? '...' : '>'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {post && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditPost}
          initialTitle={post.title}
          initialContent={post.content}
        />
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>¿Estás seguro?</h3>
            <p>¿Deseas borrar este post? Esta acción no se puede deshacer y se eliminarán todos los comentarios asociados.</p>
            <div className="delete-confirm-actions">
              <button
                className="delete-confirm-btn cancel"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="delete-confirm-btn confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Borrando..." : "Borrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>

  );
};

export default Post;
