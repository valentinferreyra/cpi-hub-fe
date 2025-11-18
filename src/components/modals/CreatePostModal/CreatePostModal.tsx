import { useState } from "react";
import TextareaWithImage from "../../TextareaWithImage/TextareaWithImage";
import "./CreatePostModal.css";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (title: string, content: string, image?: string) => void;
  isLoading?: boolean;
}

function CreatePostModal({ isOpen, onClose, onCreatePost, isLoading = false }: CreatePostModalProps) {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);

  const handleClose = () => {
    setPostTitle('');
    setPostContent('');
    setPostImage(null);
    onClose();
  };

  const handleCreatePost = () => {
    if (!postTitle.trim() || !postContent.trim() || isLoading) return;

    onCreatePost(postTitle, postContent, postImage || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="create-post-overlay" onClick={handleClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-post-header">
          <h2>Crear post</h2>
        </div>
        <div className="create-post-body">
          <form className="create-post-form">
            <div className="form-group">
              <label htmlFor="post-title" className="form-label">
                Título del post
              </label>
              <input
                id="post-title"
                type="text"
                className="form-input"
                placeholder="Escribe el título de tu post..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                maxLength={100}
              />
              <div className="character-count">
                {postTitle.length}/100
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="post-content" className="form-label">
                Descripción del post
              </label>
              <TextareaWithImage
                value={postContent}
                onChange={setPostContent}
                onImageChange={setPostImage}
                placeholder="Escribe la descripción de tu post..."
                rows={6}
                maxLength={300}
                disabled={isLoading}
                currentImage={postImage || undefined}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-create"
                onClick={handleCreatePost}
                disabled={!postTitle.trim() || !postContent.trim() || isLoading}
              >
                {isLoading ? 'Creando...' : 'Crear Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
