import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import Breadcrumb from "@components/Breadcrumb/Breadcrumb";
import UsersList from "@components/UsersList/UsersList";
import CommentItem from "@components/CommentItem/CommentItem";
import EditPostModal from "@components/modals/EditPostModal/EditPostModal";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { getPostById, addCommentToPost, updatePost } from "../../api";
import type { Post as PostType } from "../../types/post";
import { formatPostDetailDate, formatPostDetailTime } from "../../utils/dateUtils";
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
      const updatedPost = await updatePost(parseInt(post.id), currentUser.id, title, content);
      setPost(updatedPost);
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

  const isPostAuthor = currentUser && post && currentUser.id.toString() === post.created_by.id.toString();

  // Debug log
  useEffect(() => {
    if (currentUser && post) {
      console.log('Current User ID:', currentUser.id, typeof currentUser.id);
      console.log('Post Author ID:', post.created_by.id, typeof post.created_by.id);
      console.log('Is Post Author:', isPostAuthor);
    }
  }, [currentUser, post, isPostAuthor]);

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
                    <button
                      className="edit-post-btn"
                      onClick={() => setIsEditModalOpen(true)}
                      title="Editar post"
                    >
                      <span>✏️</span>
                    </button>
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
    </>

  );
};

export default Post;
