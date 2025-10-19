import React from 'react';
import './LeaveSpaceModal.css';

interface LeaveSpaceModalProps {
  isOpen: boolean;
  spaceName?: string;
  isLeaving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LeaveSpaceModal: React.FC<LeaveSpaceModalProps> = ({
  isOpen,
  spaceName,
  isLeaving,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="leave-modal-content">
        <div className="leave-modal-header">
          <h2>¿Estás seguro?</h2>
        </div>
        <div className="leave-modal-body">
          <p>
            ¿Estás seguro que deseas abandonar el Space{' '}
            <strong>"{spaceName}"</strong>?
          </p>
        </div>
        <div className="leave-modal-actions">
          <button
            className="btn-cancel-leave"
            onClick={onCancel}
            disabled={isLeaving}
          >
            Cancelar
          </button>
          <button
            className="btn-confirm-leave"
            onClick={onConfirm}
            disabled={isLeaving}
          >
            {isLeaving ? 'Abandonando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveSpaceModal;
