import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import CreateSpaceModal from "@components/modals/CreateSpaceModal/CreateSpaceModal";
import WelcomeModal from "@components/modals/WelcomeModal/WelcomeModal";
import { useAppContext } from "../../context/AppContext";
import { getSpacesByCreatedAt, getSpacesByUpdatedAt } from "../../api";
import type { Space } from "../../types/space";
import { 
  SpacesSection
} from './components';
import { useCreateSpace, useUpdatedSpacesPagination, useCreatedSpacesPagination } from '../../hooks';
import { CreateSpaceConfirmationModal } from '../../components/modals/CreateSpaceModal';
import "./Explore.css";

const Explore: React.FC = () => {
  const { currentUser, selectSpace } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const updatedSpacesPagination = useUpdatedSpacesPagination();
  const createdSpacesPagination = useCreatedSpacesPagination();

  const createSpaceHook = useCreateSpace(
    currentUser?.id?.toString(),
    (newSpace: Space) => {
      createdSpacesPagination.setItems(prev => [newSpace, ...prev]);
      updatedSpacesPagination.setItems(prev => [newSpace, ...prev]);
    }
  );

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        createSpaceHook.setError(null);

        const [updatedSpaces, createdSpaces] = await Promise.all([
          getSpacesByUpdatedAt(1, 15),
          getSpacesByCreatedAt(1, 15)
        ]);

        updatedSpacesPagination.setItems(updatedSpaces);
        createdSpacesPagination.setItems(createdSpaces);
        
        updatedSpacesPagination.setHasMore(updatedSpaces.length === 15);
        createdSpacesPagination.setHasMore(createdSpaces.length === 15);
      } catch (err) {
        console.error("Error fetching spaces:", err);
        createSpaceHook.setError("Error al cargar los espacios. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();

    try {
      const shouldShow = sessionStorage.getItem('showWelcome');
      if (shouldShow) {
        setShowWelcomeModal(true);
        sessionStorage.removeItem('showWelcome');
      }
    } catch (err) {
      console.warn('sessionStorage access failed:', err);
    }
  }, []);

  const handleSpaceClick = (space: Space) => {
    selectSpace(space);
    navigate(`/space/${space.id}`);
  };

  if (loading) {
    return (
      <>
        <Topbar currentUser={currentUser} />
        <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
        <div className="posts-container">
          <div className="posts-section">
            <div className="posts-header">
              <h2 className="posts-title">Explorar</h2>
            </div>
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando espacios...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (createSpaceHook.error) {
    return (
      <>
        <Topbar currentUser={currentUser} />
        <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
        <div className="posts-container">
          <div className="posts-section">
            <div className="posts-header">
              <h2 className="posts-title">Explorar</h2>
            </div>
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{createSpaceHook.error}</p>
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
      <div className="posts-container">
        <div className="posts-section">
          <div className="posts-header">
            <h2 className="posts-title">Explorar</h2>
            <button 
              className="create-post-btn margin-left-16" 
              onClick={createSpaceHook.openCreateSpaceModal}
            >
              Crear space
            </button>
          </div>
          <div className="explore-content">
            <CreateSpaceModal
              isOpen={createSpaceHook.isCreateSpaceModalOpen}
              onClose={createSpaceHook.closeCreateSpaceModal}
              onCreateSpace={createSpaceHook.handleCreateSpace}
              isLoading={createSpaceHook.isCreatingSpace}
            />

            <WelcomeModal
              isOpen={showWelcomeModal}
              onClose={() => setShowWelcomeModal(false)}
            />

            <CreateSpaceConfirmationModal
              isOpen={createSpaceHook.showConfirmModal}
              spacesWithSameName={createSpaceHook.spacesWithSameName}
              pendingSpace={createSpaceHook.pendingSpace}
              isCreatingSpace={createSpaceHook.isCreatingSpace}
              onCancel={createSpaceHook.handleCancelCreate}
              onConfirm={createSpaceHook.handleConfirmCreate}
              onNavigateToSpace={createSpaceHook.handleNavigateExistingSpace}
            />

            <SpacesSection
              title="Spaces más activos"
              spaces={updatedSpacesPagination.items}
              hasMore={updatedSpacesPagination.hasMore}
              isLoadingMore={updatedSpacesPagination.loadingMore}
              onSpaceClick={handleSpaceClick}
              onLoadMore={updatedSpacesPagination.loadMore}
              emptyMessage="No hay espacios actualizados recientemente"
              showUpdatedDate={true}
            />

            <SpacesSection
              title="Spaces creados recientemente"
              spaces={createdSpacesPagination.items}
              hasMore={createdSpacesPagination.hasMore}
              isLoadingMore={createdSpacesPagination.loadingMore}
              onSpaceClick={handleSpaceClick}
              onLoadMore={createdSpacesPagination.loadMore}
              emptyMessage="No hay espacios creados recientemente"
              showUpdatedDate={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Explore;