import React from 'react';
import type { Space } from '../../../types/space';
import './CreateSpaceConfirmationModal.css';

interface CreateSpaceConfirmationModalProps {
  isOpen: boolean;
  spacesWithSameName: Space[];
  pendingSpace: { name: string; description: string } | null;
  isCreatingSpace: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onNavigateToSpace: (space: Space) => void;
}

const CreateSpaceConfirmationModal: React.FC<CreateSpaceConfirmationModalProps> = ({
  isOpen,
  spacesWithSameName,
  pendingSpace,
  isCreatingSpace,
  onCancel,
  onConfirm,
  onNavigateToSpace
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-space-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ya existen spaces con ese nombre</h2>
        </div>
        <div className="modal-body">
          <p>
            Se encontraron los siguientes spaces con el nombre{' '}
            <strong>"{pendingSpace?.name}"</strong> (podrías unirte o revisarlos antes de crear uno nuevo):
          </p>
          <ul className="confirm-space-existing-list">
            {spacesWithSameName.map(space => (
              <li key={space.id}>
                <button
                  type="button"
                  className="confirm-space-link"
                  onClick={() => onNavigateToSpace(space)}
                  aria-label={`Ir al space ${space.name}`}
                >
                  <span className="confirm-space-link-text">{space.name}</span>
                  <span className="confirm-space-link-arrow" aria-hidden="true">↗</span>
                </button>
                {space.description && (
                  <span className="confirm-space-desc"> — {space.description}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="margin-top-4">¿Querés crearlo de todas formas?</p>
        </div>
        <div className="form-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button 
            className="btn-create" 
            onClick={onConfirm} 
            disabled={isCreatingSpace}
          >
            {isCreatingSpace ? "Creando..." : "Crear igual"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceConfirmationModal;
