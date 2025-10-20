import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Space } from '../types/space';
import { createSpace, GetSpacesByName } from '../api';

interface UseCreateSpaceReturn {
  isCreateSpaceModalOpen: boolean;
  isCreatingSpace: boolean;
  showConfirmModal: boolean;
  spacesWithSameName: Space[];
  pendingSpace: { name: string; description: string } | null;
  error: string | null;
  openCreateSpaceModal: () => void;
  closeCreateSpaceModal: () => void;
  handleCreateSpace: (name: string, description: string) => Promise<void>;
  handleConfirmCreate: () => void;
  handleCancelCreate: () => void;
  handleNavigateExistingSpace: (space: Space) => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useCreateSpace = (
  currentUserId: string | undefined,
  onSpaceCreated: (space: Space) => void
): UseCreateSpaceReturn => {
  const navigate = useNavigate();
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [spacesWithSameName, setSpacesWithSameName] = useState<Space[]>([]);
  const [pendingSpace, setPendingSpace] = useState<{ name: string; description: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCreateSpaceModal = () => setIsCreateSpaceModalOpen(true);
  const closeCreateSpaceModal = () => setIsCreateSpaceModalOpen(false);

  const proceedCreateSpace = async (name: string, description: string) => {
    if (!currentUserId) return;
    setIsCreatingSpace(true);
    try {
      const newSpace = await createSpace(currentUserId, name, description);
      if (newSpace) {
        onSpaceCreated(newSpace);
        closeCreateSpaceModal();
        setShowConfirmModal(false);
        setSpacesWithSameName([]);
        setPendingSpace(null);
        navigate(`/space/${newSpace.id}`);
      }
    } catch {
      setError("Error al crear el space. Intenta de nuevo.");
    } finally {
      setIsCreatingSpace(false);
    }
  };

  const handleCreateSpace = async (name: string, description: string) => {
    if (!currentUserId) return;
    setIsCreatingSpace(true);
    try {
      const foundSpaces = await GetSpacesByName(name);
      if (foundSpaces.length > 0) {
        setSpacesWithSameName(foundSpaces);
        setPendingSpace({ name, description });
        setShowConfirmModal(true);
        setIsCreatingSpace(false);
        return;
      }
      await proceedCreateSpace(name, description);
    } catch {
      setError("Error al crear el space. Intenta de nuevo.");
      setIsCreatingSpace(false);
    }
  };

  const handleConfirmCreate = () => {
    if (pendingSpace) {
      proceedCreateSpace(pendingSpace.name, pendingSpace.description);
    }
  };

  const handleCancelCreate = () => {
    setShowConfirmModal(false);
    setSpacesWithSameName([]);
    setPendingSpace(null);
    setIsCreatingSpace(false);
    closeCreateSpaceModal();
  };

  const handleNavigateExistingSpace = (space: Space) => {
    const url = `/space/${space.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return {
    isCreateSpaceModalOpen,
    isCreatingSpace,
    showConfirmModal,
    spacesWithSameName,
    pendingSpace,
    error,
    openCreateSpaceModal,
    closeCreateSpaceModal,
    handleCreateSpace,
    handleConfirmCreate,
    handleCancelCreate,
    handleNavigateExistingSpace,
    setError
  };
};
