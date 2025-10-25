import React, { useState, useRef, useEffect } from 'react';
import InputTopbar from '../InputTopbar/InputTopbar';
import './TextareaWithImage.css';

interface TextareaWithImageProps {
  value: string;
  onChange: (value: string) => void;
  onImageChange: (imageData: string | null) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  currentImage?: string;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

const TextareaWithImage: React.FC<TextareaWithImageProps> = ({
  value,
  onChange,
  onImageChange,
  placeholder = "Escribe aquí...",
  rows = 6,
  maxLength,
  disabled = false,
  currentImage,
  className = "",
  onKeyPress
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imageData, setImageData] = useState<string | null>(currentImage || null);

  useEffect(() => {
    if (currentImage !== imageData) {
      setImageData(currentImage || null);
    }
  }, [currentImage]);

  const handleImageChange = (newImageData: string | null) => {
    setImageData(newImageData);
    onImageChange(newImageData);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  return (
    <div className={`textarea-with-image-container ${className}`}>
        <InputTopbar
          onImageChange={handleImageChange}
          currentImage={imageData || undefined}
          disabled={disabled}
        />
      <div className="textarea-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className="textarea-with-image"
        />
      </div>
      
      {maxLength && (
        <div className="character-count">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default TextareaWithImage;
