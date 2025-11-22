import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import Breadcrumb from "@components/Breadcrumb/Breadcrumb";
import UsersList from "@components/UsersList/UsersList";
import CommentItem from "@components/CommentItem/CommentItem";
import EditPostModal from "@components/modals/EditPostModal/EditPostModal";
import UserInfoModal from "@components/modals/UserInfoModal/UserInfoModal";
import CommentForm from "../../components/CommentForm/CommentForm";
import ImageLightbox from "../../components/ImageLightbox/ImageLightbox";
import ReactionButtons from "@/components/ReactionButtons";
import CommentsPill from "@/components/CommentsPill";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { getPostById, addCommentToPost, updatePost, deletePost } from "@/api";
import { getUserLikes, type UserLikeRequestEntity, type UserLikeResponseEntity } from "@/api/reactions";
import type { Post as PostType } from "../../types/post";
import { formatPostDetailDate, formatPostDetailTime } from "../../utils/dateUtils";
import { useClickOutside, useUserInfoModal } from "../../hooks";
import "./Post.css";

export const Post = () => {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const { currentUser, selectSpace } = useAppContext();
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [userReactionsMap, setUserReactionsMap] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [userReactionIdsMap, setUserReactionIdsMap] = useState<Record<string, string | null>>({});
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();

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

  const handleAddComment = async (content: string, image?: string) => {
    if (!post || !content.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);

      await addCommentToPost(currentUser!.id, post.id, content.trim(), undefined, image);

      // La notificación se crea automáticamente vía WebSocket cuando el backend procesa el comentario

      setSuccessMessage('Comentario agregado correctamente');
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      const updatedPost = await getPostById(post.id);
      if (updatedPost) {
        setPost(updatedPost);
        console.log('Post actualizado, comentarios:', updatedPost.comments);
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

  const handleReplySubmit = async (parentCommentId: number, content: string, image?: string) => {
    if (!post) return;

    // eslint-disable-next-line no-useless-catch
    try {
      await addCommentToPost(currentUser!.id, post.id, content, parentCommentId, image);

      setSuccessMessage('Respuesta agregada correctamente');
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      const updatedPost = await getPostById(post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
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

  useEffect(() => {
    const fetchUserReactions = async () => {
      if (!post || !currentUser) return;

      const entities: UserLikeRequestEntity[] = [];
      entities.push({ entity_type: 'post', entity_id: parseInt(post.id) });

      const walkComments = (comments: PostType['comments']) => {
        comments.forEach((c) => {
          entities.push({ entity_type: 'comment', entity_id: c.id });
          if (c.replies && c.replies.length > 0) {
            walkComments(c.replies);
          }
        });
      };

      walkComments(post.comments || []);

      try {
        const res: UserLikeResponseEntity[] = await getUserLikes(currentUser.id, entities);
        const reactionMap: Record<string, 'like' | 'dislike' | null> = {};
        const idsMap: Record<string, string | null> = {};
        res.forEach((r) => {
          const key = `${r.entity_type}:${r.entity_id}`;
          reactionMap[key] = r.liked ? 'like' : r.disliked ? 'dislike' : null;
          idsMap[key] = r.reaction_id ?? null;
        });
        setUserReactionsMap(reactionMap);
        setUserReactionIdsMap(idsMap);
      } catch (e) {
        console.error('Error prefetching user likes:', e);
      }
    };

    fetchUserReactions();
  }, [post, currentUser]);

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
      {showUserInfoModal && (
        <UserInfoModal
          user={viewedUser}
          isLoading={isLoadingUserInfo}
          onClose={closeUserInfoModal}
        />
      )}
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
                className="post-author-avatar clickable"
                onClick={() => {
                  handleUserClick(post.created_by.id);
                }}
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
                            <span>Editar</span>
                          </button>
                          <button className="post-menu-item delete" onClick={handleDeleteClick}>
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
                      onClick={() => {
                        handleUserClick(post.created_by.id);
                      }}
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
              <div>{post.content}</div>
              {post.image && (
                <div className="post-image-container">
                  <img
                    src={post.image}
                    alt="Imagen del post"
                    className="post-image"
                    onClick={() => setLightboxImage(post.image!)}
                    onError={(e) => {
                      console.error('Error loading post image:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="post-actions">
                <ReactionButtons
                  entityType="post"
                  entityId={parseInt(post.id)}
                  initialUserReaction={userReactionsMap[`post:${parseInt(post.id)}`]}
                  initialReactionId={userReactionIdsMap[`post:${parseInt(post.id)}`]}
                />
                <CommentsPill count={post.comments.length} />
              </div>
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
                    userReactionsMap={userReactionsMap}
                    userReactionIdsMap={userReactionIdsMap}
                  />
                ))}

              <CommentForm
                onSubmit={handleAddComment}
                placeholder="Escribe tu comentario..."
                isLoading={isSubmittingComment}
              />
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
            <p>¿Deseas borrar este post? Esta acción no se puede deshacer.</p>
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

      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>

  );
};

export default Post;
