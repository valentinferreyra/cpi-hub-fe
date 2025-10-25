import React, { useState } from 'react';
import ImageUpload from '../ImageUpload/ImageUpload';
import uploadImageIcon from '../../assets/upload_image.png';
import './InputSidebar.css';

interface InputSidebarProps {
  onImageChange: (imageData: string | null) => void;
  currentImage?: string;
  disabled?: boolean;
}

const InputTopbar: React.FC<InputSidebarProps> = ({
  onImageChange,
  currentImage,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(currentImage || null);

  const handleImageIconClick = () => {
    if (disabled) return;
    setTempImage(currentImage || null); // Resetear a la imagen actual
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setTempImage(currentImage || null); // Resetear cambios
  };

  const handleAcceptImage = () => {
    onImageChange(tempImage);
    if (tempImage) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setShowModal(false);
  };

  const handleCancelImage = () => {
    setTempImage(null);
    onImageChange(null);
    setIsOpen(false);
    setShowModal(false);
  };

  const handleTempImageChange = (imageData: string | null) => {
    setTempImage(imageData);
  };

  return (
    <>
      <div className={`input-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="input-sidebar-content">
          <button
            type="button"
            className="image-btn"
            onClick={handleImageIconClick}
            disabled={disabled}
            title="Agregar imagen"
          >
            <img 
              src={uploadImageIcon} 
              alt="Subir imagen" 
              className="upload-icon"
            />
          </button>
          
          {currentImage && (
            <div className="image-preview-mini">
              <img 
                src={currentImage} 
                alt="Preview" 
                className="preview-mini-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <button
                type="button"
                className="remove-image-mini"
                onClick={() => handleCancelImage()}
                disabled={disabled}
                title="Eliminar imagen"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="image-modal-overlay" onClick={handleModalClose}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>Agregar imagen</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={handleModalClose}
              >
                ×
              </button>
            </div>
            <div className="image-modal-content">
              <ImageUpload
                onImageChange={handleTempImageChange}
                currentImage={tempImage || undefined}
                disabled={disabled}
              />
            </div>
            <div className="image-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancelImage}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-accept"
                onClick={handleAcceptImage}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InputTopbar;
