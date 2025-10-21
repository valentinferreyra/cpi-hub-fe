import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Comment } from "../../types/comment";
import { formatPostDetailDate, formatPostDetailTime } from "../../utils/dateUtils";
import "./CommentItem.css";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId: number;
  onReplySubmit: (parentCommentId: number, content: string) => Promise<void>;
  isReply?: boolean;
}

export const CommentItem = ({
  comment,
  postId,
  currentUserId,
  onReplySubmit,
  isReply = false,
}: CommentItemProps) => {
  const navigate = useNavigate();
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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
      console.error("Error al enviar respuesta:", error);
    } finally {
      setIsSubmittingReply(false);
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
        <span className="comment-date">
          {formatPostDetailDate(comment.created_at)} a las{" "}
          {formatPostDetailTime(comment.created_at)}
        </span>
      </div>
      <p className="comment-content">{comment.content}</p>

      {!isReply && (
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
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
