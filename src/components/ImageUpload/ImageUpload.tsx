import React, { useState, useRef } from 'react';
import type { ImageUploadType } from '../../utils/imageUtils';
import { 
  processImage, 
  isValidImageUrl, 
  isValidImageFile, 
  createImagePreview, 
  cleanupImagePreview
} from '../../utils/imageUtils';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageChange: (imageData: string | null) => void;
  currentImage?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageChange, 
  currentImage, 
  disabled = false
}) => {
  const [uploadType, setUploadType] = useState<ImageUploadType>('url');
  const [urlValue, setUrlValue] = useState('');
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (type: ImageUploadType) => {
    setUploadType(type);
    setError(null);
    setUrlValue('');
    
    // Limpiar preview si cambiamos de tipo
    if (preview && preview !== currentImage) {
      cleanupImagePreview(preview);
      setPreview(null);
    }
    
    // Limpiar file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = async (url: string) => {
    setUrlValue(url);
    setError(null);
    
    if (!url.trim()) {
      setPreview(null);
      onImageChange(null);
      return;
    }

    if (!isValidImageUrl(url)) {
      setError('URL de imagen no válida');
      return;
    }

    try {
      setIsProcessing(true);
      const imageData = await processImage({ type: 'url', value: url });
      setPreview(imageData);
      onImageChange(imageData);
    } catch (err) {
      setError('Error al procesar la imagen');
      console.error('Error processing URL image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!isValidImageFile(file)) {
      setError('Archivo no válido. Debe ser JPG, PNG, GIF o WebP y menor a 5MB');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Crear preview inmediato
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);
      
      // Procesar imagen para Base64
      const imageData = await processImage({ type: 'file', value: '', file });
      onImageChange(imageData);
    } catch (err) {
      setError('Error al procesar el archivo');
      console.error('Error processing file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    if (preview && preview !== currentImage) {
      cleanupImagePreview(preview);
    }
    setPreview(null);
    setUrlValue('');
    setError(null);
    onImageChange(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-header">
        <h4>Imagen</h4>
        <div className="image-upload-type-selector">
          <button
            type="button"
            className={`type-btn ${uploadType === 'url' ? 'active' : ''}`}
            onClick={() => handleTypeChange('url')}
            disabled={disabled}
          >
            URL
          </button>
          <button
            type="button"
            className={`type-btn ${uploadType === 'file' ? 'active' : ''}`}
            onClick={() => handleTypeChange('file')}
            disabled={disabled}
          >
            Archivo
          </button>
        </div>
      </div>

      <div className="image-upload-content">
        {uploadType === 'url' ? (
          <div className="url-input-container">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="url-input"
              disabled={disabled || isProcessing}
            />
            {isProcessing && <div className="processing-indicator">Procesando...</div>}
          </div>
        ) : (
          <div className="file-input-container">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input-hidden"
              disabled={disabled || isProcessing}
            />
            <button
              type="button"
              onClick={handleFileButtonClick}
              className="file-select-btn"
              disabled={disabled || isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Seleccionar archivo'}
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {preview && (
          <div className="image-preview-container">
            <div className="image-preview">
              <img 
                src={preview} 
                alt="Preview" 
                className="preview-image"
                onError={() => setError('Error al cargar la imagen')}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-image-btn"
                disabled={disabled}
                title="Eliminar imagen"
              >
                ×
              </button>
            </div>
            <div className="image-info">
              <span className="image-source">
                {uploadType === 'url' ? 'URL' : 'Archivo local'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
