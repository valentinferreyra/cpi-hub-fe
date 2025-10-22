import React, { useState, useEffect } from 'react';
import './EditPostModal.css';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
  initialTitle: string;
  initialContent: string;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTitle,
  initialContent,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent, isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || isSaving) return;

    try {
      setIsSaving(true);
      await onSave(title.trim(), content.trim());
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSaving) {
      onClose();
    }
  };

  const getTitleCharCount = () => {
    const count = title.length;
    const max = 100;
    let className = 'edit-post-char-count';
    if (count > max) className += ' error';
    else if (count > max * 0.9) className += ' warning';
    return { count, max, className };
  };

  const getContentCharCount = () => {
    const count = content.length;
    const max = 1000;
    let className = 'edit-post-char-count';
    if (count > max) className += ' error';
    else if (count > max * 0.9) className += ' warning';
    return { count, max, className };
  };

  if (!isOpen) return null;

  const titleInfo = getTitleCharCount();
  const contentInfo = getContentCharCount();
  const isValid = title.trim() && content.trim() && titleInfo.count <= titleInfo.max && contentInfo.count <= contentInfo.max;

  return (
    <div
      className="edit-post-modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyPress}
    >
      <div className="edit-post-modal">
        <div className="edit-post-modal-header">
          <h2>Editar Post</h2>
          <button
            className="edit-post-modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="edit-post-modal-body">
          <div className="edit-post-form-group">
            <label htmlFor="edit-post-title">Título</label>
            <input
              id="edit-post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe el título del post..."
              maxLength={titleInfo.max + 50}
              disabled={isSaving}
            />
            <div className={titleInfo.className}>
              {titleInfo.count} / {titleInfo.max}
            </div>
          </div>

          <div className="edit-post-form-group">
            <label htmlFor="edit-post-content">Contenido</label>
            <textarea
              id="edit-post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido del post..."
              maxLength={contentInfo.max + 50}
              disabled={isSaving}
            />
            <div className={contentInfo.className}>
              {contentInfo.count} / {contentInfo.max}
            </div>
          </div>
        </div>

        <div className="edit-post-modal-footer">
          <button
            className="edit-post-modal-btn edit-post-modal-btn-cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            className="edit-post-modal-btn edit-post-modal-btn-save"
            onClick={handleSave}
            disabled={!isValid || isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
