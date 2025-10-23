import { useState } from "react";
import type { Comment } from "../../types/comment";
import { formatPostDetailDate, formatPostDetailTime } from "../../utils/dateUtils";
import { updateComment, deleteComment } from "../../api";
import { useClickOutside, useUserInfoModal } from "../../hooks";
import UserInfoModal from "@/components/modals/UserInfoModal/UserInfoModal";
import "./CommentItem.css";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId: number;
  onReplySubmit: (parentCommentId: number, content: string) => Promise<void>;
  isReply?: boolean;
  onCommentUpdated?: () => Promise<void> | void;
}

export const CommentItem = ({
  comment,
  postId,
  currentUserId,
  onReplySubmit,
  isReply = false,
  onCommentUpdated,
}: CommentItemProps) => {
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showUserInfoModal, isLoadingUserInfo, viewedUser, handleUserClick, closeUserInfoModal } = useUserInfoModal();

  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setShowMenu(false);
  });

  const handleReplyClick = () => {
    setReplyingToCommentId(comment.id);
    setReplyContent("");
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyContent("");
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || isSubmittingReply) return;

    try {
      setIsSubmittingReply(true);
      await onReplySubmit(comment.id, replyContent.trim());
      setReplyContent("");
      setReplyingToCommentId(null);
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSubmitEdit = async () => {
    if (!editContent.trim() || isSubmittingEdit) return;
    try {
      setIsSubmittingEdit(true);
      await updateComment(comment.id, editContent.trim());
      setIsEditing(false);
      if (onCommentUpdated) await onCommentUpdated();
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsSubmittingEdit(false);
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
          <p className="comment-content">{comment.content}</p>
        ) : (
          <div className="edit-form">
            <div className="comment-input-container">
              <textarea
                className="comment-input"
                placeholder="Edita tu comentario..."
                rows={2}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isSubmittingEdit}
              />
              <div className="edit-actions">
                <button
                  className={`comment-submit-btn ${editContent.trim() && !isSubmittingEdit ? "active" : "disabled"}`}
                  disabled={!editContent.trim() || isSubmittingEdit}
                  onClick={handleSubmitEdit}
                  aria-label="Aceptar edición"
                >
                  {isSubmittingEdit ? "..." : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 13L8 17L20 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="cancel-edit-btn-container">
              <button className="cancel-edit-btn" onClick={handleCancelEdit} disabled={isSubmittingEdit}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {!isReply && !isEditing && (
          <button
            className={`reply-button ${replyingToCommentId === comment.id ? 'cancel-mode' : ''}`}
            onClick={replyingToCommentId === comment.id ? handleCancelReply : handleReplyClick}
          >
            <span>{replyingToCommentId === comment.id ? 'Cancelar' : 'Responder'}</span>
          </button>
        )}

        {replyingToCommentId === comment.id && (
          <div className="reply-form">
            <div className="comment-input-container">
              <textarea
                className="comment-input"
                placeholder="Escribe tu respuesta..."
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={isSubmittingReply}
              />
              <div className="reply-actions">
                <button
                  className={`comment-submit-btn ${replyContent.trim() && !isSubmittingReply ? "active" : "disabled"
                    }`}
                  disabled={!replyContent.trim() || isSubmittingReply}
                  onClick={handleSubmitReply}
                >
                  {isSubmittingReply ? "..." : ">"}
                </button>
              </div>
            </div>
          </div>
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
    </>
  );
};

export default CommentItem;
