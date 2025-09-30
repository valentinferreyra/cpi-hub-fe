import React from 'react';
import './LogoutModal.css';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Cerrar Sesión</h2>
        <p>¿Estás seguro que deseas cerrar sesión?</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-button confirm" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;