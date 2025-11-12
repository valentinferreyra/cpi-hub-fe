import React, { useState } from 'react';
import TextareaWithImage from '../TextareaWithImage/TextareaWithImage';
import './CommentForm.css';

interface CommentFormProps {
  onSubmit: (content: string, image?: string) => Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
  initialContent?: string;
  initialImage?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Escribe tu comentario...",
  isLoading = false,
  initialContent = "",
  initialImage
}) => {
  const [content, setContent] = useState(initialContent);
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting || isLoading) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content.trim(), image || undefined);
      setContent("");
      setImage(null);
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="comment-form">
      <div className="comment-input-container">
        <TextareaWithImage
          value={content}
          onChange={setContent}
          onImageChange={setImage}
          placeholder={placeholder}
          rows={5}
          disabled={isSubmitting || isLoading}
          currentImage={image || undefined}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`comment-submit-btn ${content.trim() && !isSubmitting && !isLoading ? "active" : ""}`}
          disabled={!content.trim() || isSubmitting || isLoading}
          onClick={handleSubmit}
          aria-label="Enviar comentario"
        >
          {isSubmitting ? (
            <span className="submit-spinner">⏳</span>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>

      <div className="comment-form-help">
        <small>💡 Presiona Ctrl+Enter para enviar rápidamente</small>
      </div>
    </div>
  );
};

export default CommentForm;
