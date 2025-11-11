import { useState } from "react";
import type { Comment } from "@/types/comment";
import { formatPostDetailDate, formatPostDetailTime } from "@/utils/dateUtils";
import { updateComment, deleteComment } from "@/api";
import { useClickOutside, useUserInfoModal } from "@/hooks";
import UserInfoModal from "@/components/modals/UserInfoModal/UserInfoModal";
import CommentForm from "../CommentForm/CommentForm";
import ImageLightbox from "../ImageLightbox/ImageLightbox";
import ReactionButtons from "@/components/ReactionButtons";
import "./CommentItem.css";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId: number;
  onReplySubmit: (parentCommentId: number, content: string, image?: string) => Promise<void>;
  isReply?: boolean;
  onCommentUpdated?: () => Promise<void> | void;
  userReactionsMap?: Record<string, 'like' | 'dislike' | null>;
  userReactionIdsMap?: Record<string, string | null>;
}

export const CommentItem = ({
  comment,
  postId,
  currentUserId,
  onReplySubmit,
  isReply = false,
  onCommentUpdated,
  userReactionsMap,
  userReactionIdsMap,
}: CommentItemProps) => {
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();

  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setShowMenu(false);
  });

  const handleReplyClick = () => {
    setReplyingToCommentId(comment.id);
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
  };

  const handleSubmitReply = async (content: string, image?: string) => {
    try {
      await onReplySubmit(comment.id, content, image);
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSubmitEdit = async (content: string, image?: string) => {
    try {
      await updateComment(comment.id, content, image);
      setIsEditing(false);
      if (onCommentUpdated) await onCommentUpdated();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteComment(comment.id);
      if (onCommentUpdated) await onCommentUpdated();
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {showUserInfoModal && (
        <UserInfoModal
          user={viewedUser}
          isLoading={isLoadingUserInfo}
          onClose={closeUserInfoModal}
        />
      )}

      <div className={`comment ${isReply ? "comment-reply" : ""}`}>
        <div className="comment-header">
          <div className="comment-author-info">
            <img
              src={comment.created_by.image}
              alt={`${comment.created_by.name} ${comment.created_by.last_name}`}
              className="comment-author-avatar clickable"
              onClick={() => {
                handleUserClick(comment.created_by.id);
              }}
            />
            <span
              className="comment-author clickable"
              onClick={() => {
                handleUserClick(comment.created_by.id);
              }}
            >
              {comment.created_by.name} {comment.created_by.last_name}
            </span>
          </div>
          <div className="comment-meta-actions">
            <span className="comment-date">
              {formatPostDetailDate(comment.created_at)} a las{" "}
              {formatPostDetailTime(comment.created_at)}
            </span>
            {comment.created_by.id.toString() === currentUserId.toString() && !isEditing && (
              <div className="comment-menu-container" ref={menuRef}>
                <button
                  className="comment-menu-btn"
                  title="Opciones"
                  onClick={toggleMenu}
                >
                  ⋮
                </button>
                {showMenu && (
                  <div className="comment-menu-dropdown">
                    <button className="comment-menu-item" onClick={handleEditClick}>
                      <span>Editar</span>
                    </button>
                    <button className="comment-menu-item delete" onClick={handleDeleteClick}>
                      <span>Borrar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {!isEditing ? (
          <div className="comment-content">
            <div>{comment.content}</div>
            {comment.image && (
              <div className="comment-image-container">
                <img
                  src={comment.image}
                  alt="Imagen del comentario"
                  className="comment-image"
                  onClick={() => setLightboxImage(comment.image!)}
                  onError={(e) => {
                    console.error('Error loading comment image:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <CommentForm
            onSubmit={handleSubmitEdit}
            placeholder="Edita tu comentario..."
            initialContent={comment.content}
            initialImage={comment.image}
          />
        )}

        {!isEditing && (
          <div className="comment-footer-actions">
            <div className="comment-actions">
              <ReactionButtons
                entityType="comment"
                entityId={comment.id}
                initialUserReaction={userReactionsMap?.[`comment:${comment.id}`]}
                initialReactionId={userReactionIdsMap?.[`comment:${comment.id}`]}
              />
            </div>
            {!isReply && (
              <button
                className={`reply-button ${replyingToCommentId === comment.id ? 'cancel-mode' : ''}`}
                onClick={replyingToCommentId === comment.id ? handleCancelReply : handleReplyClick}
              >
                <span>{replyingToCommentId === comment.id ? 'Cancelar' : 'Responder'}</span>
              </button>
            )}
          </div>
        )}

        {replyingToCommentId === comment.id && (
          <CommentForm
            onSubmit={handleSubmitReply}
            placeholder="Escribe tu respuesta..."
          />
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                currentUserId={currentUserId}
                onReplySubmit={onReplySubmit}
                onCommentUpdated={onCommentUpdated}
                isReply={true}
                userReactionsMap={userReactionsMap}
                userReactionIdsMap={userReactionIdsMap}
              />
            ))}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>¿Estás seguro?</h3>
              <p>¿Deseas borrar este comentario? Esta acción no se puede deshacer.</p>
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
      </div>

      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
};

export default CommentItem;
