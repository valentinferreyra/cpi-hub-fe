import React from 'react';
import './WelcomeModal.css';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="welcome-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-header">
          <h2>Bienvenido a CPIHub 🎉</h2>
        </div>
        <div className="welcome-body">
          <p>
            ¡Genial que te hayas unido! En CPIHub podés seguir y suscribirte a
            los spaces que más te interesen para empezar a ver contenido y
            participar en conversaciones con otros usuarios.
          </p>
          <p>
            Te recomendamos explorar los espacios destacados y unirte a los que
            te llamen la atención. Si querés, también podés crear uno propio y
            comenzar tu propia comunidad.
          </p>
        </div>
        <div className="welcome-actions">
          <button className="welcome-btn-primary" onClick={onClose}>
            Empezar a explorar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
