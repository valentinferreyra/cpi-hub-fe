import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Comment } from "../../types/comment";
import { formatPostDetailDate, formatPostDetailTime } from "../../utils/dateUtils";
import { updateComment } from "../../api";
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
  const navigate = useNavigate();
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

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
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSubmitEdit = async () => {
    if (!editContent.trim() || isSubmittingEdit) return;
    try {
      setIsSubmittingEdit(true);
      await updateComment(comment.id, currentUserId, editContent.trim());
      setIsEditing(false);
      if (onCommentUpdated) await onCommentUpdated();
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className={`comment ${isReply ? "comment-reply" : ""}`}>
      <div className="comment-header">
        <div className="comment-author-info">
          <img
            src={comment.created_by.image}
            alt={`${comment.created_by.name} ${comment.created_by.last_name}`}
            className="comment-author-avatar"
          />
          <span
            className="comment-author clickable"
            onClick={() => navigate(`/users/${comment.created_by.id}`)}
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
            <button
              className="edit-comment-btn"
              title="Editar comentario"
              onClick={handleEditClick}
            >
              ✏️
            </button>
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
    </div>
  );
};

export default CommentItem;
