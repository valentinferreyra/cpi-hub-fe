import { useState } from "react";
import "./CreateSpaceModal.css";

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSpace: (name: string, description: string) => void;
  isLoading?: boolean;
}

function CreateSpaceModal({ isOpen, onClose, onCreateSpace, isLoading = false }: CreateSpaceModalProps) {
  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");

  const handleClose = () => {
    setSpaceName("");
    setSpaceDescription("");
    onClose();
  };

  const handleCreateSpace = () => {
    if (!spaceName.trim() || !spaceDescription.trim() || isLoading) return;
    onCreateSpace(spaceName, spaceDescription);
  };

  if (!isOpen) return null;

  return (
    <div className="create-space-overlay" onClick={handleClose}>
      <div className="create-space-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-space-header">
          <h2>Crear Space</h2>
        </div>
        <div className="create-space-body">
          <form className="create-space-form">
            <div className="form-group">
              <label htmlFor="space-name" className="form-label">
                Nombre del space
              </label>
              <input
                id="space-name"
                type="text"
                className="form-input"
                placeholder="Escribe el nombre de tu space..."
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                maxLength={100}
              />
              <div className="character-count">
                {spaceName.length}/100
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="space-description" className="form-label">
                Descripción del space
              </label>
              <textarea
                id="space-description"
                className="form-textarea"
                placeholder="Escribe la descripción de tu space..."
                value={spaceDescription}
                onChange={(e) => setSpaceDescription(e.target.value)}
                maxLength={300}
                rows={4}
              />
              <div className="character-count">
                {spaceDescription.length}/300
              </div>
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
                onClick={handleCreateSpace}
                disabled={!spaceName.trim() || !spaceDescription.trim() || isLoading}
              >
                {isLoading ? "Creando..." : "Crear Space"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSpaceModal;
