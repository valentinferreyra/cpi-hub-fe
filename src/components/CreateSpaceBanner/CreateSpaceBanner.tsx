import React from 'react';
import './CreateSpaceBanner.css';

interface CreateSpaceBannerProps {
  onCreateSpace: () => void;
}

const CreateSpaceBanner: React.FC<CreateSpaceBannerProps> = ({ onCreateSpace }) => {
  return (
    <div className="create-space-banner">
      <div className="banner-content">
        <div className="banner-text">
          <h2 className="banner-title">Crea tu propio space</h2>
          <p className="banner-description">
            Ayuda a crecer nuestra comunidad creando un espacio para compartir tus ideas
          </p>
        </div>
        <button 
          className="banner-create-btn" 
          onClick={onCreateSpace}
        >
          Crear space
        </button>
      </div>
    </div>
  );
};

export default CreateSpaceBanner;
