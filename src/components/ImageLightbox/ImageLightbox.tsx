import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ImageLightbox.css';

interface ImageLightboxProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const lightboxContent = (
    <div className="image-lightbox-overlay" onClick={onClose}>
      <button
        type="button"
        className="lightbox-close-btn"
        onClick={onClose}
        aria-label="Cerrar vista de imagen"
      >
        ×
      </button>
      <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Vista completa"
          className="lightbox-image"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
};

export default ImageLightbox;
