import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import { useAppContext } from "../../context/AppContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSpacesByCreatedAt, getSpacesByUpdatedAt, createSpace, GetSpacesByName } from "../../api";
import type { Space } from "../../types/space";
import CreateSpaceModal from "@components/modals/CreateSpaceModal/CreateSpaceModal";
import WelcomeModal from "@components/modals/WelcomeModal/WelcomeModal";
import "./Explore.css";

const Explore: React.FC = () => {
  const { currentUser, selectSpace } = useAppContext();
  const navigate = useNavigate();
  const [spacesByUpdatedAt, setSpacesByUpdatedAt] = useState<Space[]>([]);
  const [spacesByCreatedAt, setSpacesByCreatedAt] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [spacesWithSameName, setSpacesWithSameName] = useState<Space[]>([]);
  const [pendingSpace, setPendingSpace] = useState<{ name: string; description: string } | null>(null);
  const openCreateSpaceModal = () => setIsCreateSpaceModalOpen(true);
  const closeCreateSpaceModal = () => setIsCreateSpaceModalOpen(false);

  const handleCreateSpace = async (name: string, description: string) => {
    if (!currentUser?.id) return;
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

  const proceedCreateSpace = async (name: string, description: string) => {
    if (!currentUser?.id) return;
    setIsCreatingSpace(true);
    try {
      const newSpace = await createSpace(currentUser.id, name, description);
      if (newSpace) {
        setSpacesByCreatedAt(prev => [newSpace, ...prev]);
        setSpacesByUpdatedAt(prev => [newSpace, ...prev]);
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
  const [error, setError] = useState<string | null>(null);
  const [currentPageUpdated, setCurrentPageUpdated] = useState(1);
  const [currentPageCreated, setCurrentPageCreated] = useState(1);
  const [loadingMoreUpdated, setLoadingMoreUpdated] = useState(false);
  const [loadingMoreCreated, setLoadingMoreCreated] = useState(false);
  const [hasMoreUpdated, setHasMoreUpdated] = useState(true);
  const [hasMoreCreated, setHasMoreCreated] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        setError(null);

        const [updatedSpaces, createdSpaces] = await Promise.all([
          getSpacesByUpdatedAt(1, 18),
          getSpacesByCreatedAt(1, 18)
        ]);

        setSpacesByUpdatedAt(updatedSpaces);
        setSpacesByCreatedAt(createdSpaces);
      } catch (err) {
        console.error("Error fetching spaces:", err);
        setError("Error al cargar los espacios. Por favor, intenta de nuevo.");
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

  const loadMoreUpdated = async () => {
    if (loadingMoreUpdated || !hasMoreUpdated) return;

    try {
      setLoadingMoreUpdated(true);
      const nextPage = currentPageUpdated + 1;
      const newSpaces = await getSpacesByUpdatedAt(nextPage, 18);

      if (newSpaces.length === 0) {
        setHasMoreUpdated(false);
      } else {
        setSpacesByUpdatedAt(prev => [...prev, ...newSpaces]);
        setCurrentPageUpdated(nextPage);
      }
    } catch (err) {
      console.error("Error loading more updated spaces:", err);
    } finally {
      setLoadingMoreUpdated(false);
    }
  };

  const loadMoreCreated = async () => {
    if (loadingMoreCreated || !hasMoreCreated) return;

    try {
      setLoadingMoreCreated(true);
      const nextPage = currentPageCreated + 1;
      const newSpaces = await getSpacesByCreatedAt(nextPage, 18);

      if (newSpaces.length === 0) {
        setHasMoreCreated(false);
      } else {
        setSpacesByCreatedAt(prev => [...prev, ...newSpaces]);
        setCurrentPageCreated(nextPage);
      }
    } catch (err) {
      console.error("Error loading more created spaces:", err);
    } finally {
      setLoadingMoreCreated(false);
    }
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

  if (error) {
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
              <p className="error-message">{error}</p>
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
            <button className="create-post-btn margin-left-16" onClick={openCreateSpaceModal}>
              Crear space
            </button>
          </div>
          <div className="explore-content">

            <CreateSpaceModal
              isOpen={isCreateSpaceModalOpen}
              onClose={closeCreateSpaceModal}
              onCreateSpace={handleCreateSpace}
              isLoading={isCreatingSpace}
            />

            <WelcomeModal
              isOpen={showWelcomeModal}
              onClose={() => setShowWelcomeModal(false)}
            />

            {showConfirmModal && (
              <div className="modal-overlay" onClick={handleCancelCreate}>
                <div className="confirm-space-modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Ya existen spaces con ese nombre</h2>
                  </div>
                  <div className="modal-body">
                    <p>Se encontraron los siguientes spaces con el nombre <strong>"{pendingSpace?.name}"</strong> (podrías unirte o revisarlos antes de crear uno nuevo):</p>
                    <ul className="confirm-space-existing-list">
                      {spacesWithSameName.map(space => (
                        <li key={space.id}>
                          <button
                            type="button"
                            className="confirm-space-link"
                            onClick={() => handleNavigateExistingSpace(space)}
                            aria-label={`Ir al space ${space.name}`}
                          >
                            <span className="confirm-space-link-text">{space.name}</span>
                            <span className="confirm-space-link-arrow" aria-hidden="true">↗</span>
                          </button>
                          {space.description && <span className="confirm-space-desc"> — {space.description}</span>}
                        </li>
                      ))}
                    </ul>
                    <p className="margin-top-4">¿Querés crearlo de todas formas?</p>
                  </div>
                  <div className="form-actions">
                    <button className="btn-cancel" onClick={handleCancelCreate}>Cancelar</button>
                    <button className="btn-create" onClick={handleConfirmCreate} disabled={isCreatingSpace}>
                      {isCreatingSpace ? "Creando..." : "Crear igual"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="carousel-section">
              <h2 className="carousel-title">Spaces actualizados recientemente</h2>
              <div className="carousel-container">
                <div className="carousel-scroll">
                  {spacesByUpdatedAt.length > 0 ? (
                    spacesByUpdatedAt.map((space) => (
                      <div
                        key={space.id}
                        className="space-card"
                        onClick={() => handleSpaceClick(space)}
                      >
                        <div className="space-card-header">
                          <h3 className="space-card-name">{space.name}</h3>
                        </div>
                        <p className="space-card-description">{space.description}</p>
                        <div className="space-card-meta">
                          <span className="space-card-users">Usuarios: {space.users}</span>
                          <span className="space-card-posts">Posts: {space.posts}</span>
                        </div>
                        <div className="space-card-footer">
                          <span className="space-card-creator">
                            Actualizado: {new Date(space.updated_at).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-spaces-message">
                      <p>No hay espacios actualizados recientemente</p>
                    </div>
                  )}
                  {hasMoreUpdated && (
                    <div className="load-more-card" onClick={loadMoreUpdated}>
                      <div className="load-more-content">
                        {loadingMoreUpdated ? (
                          <div className="loading-spinner-small"></div>
                        ) : (
                          <>
                            <div className="load-more-icon">+</div>
                            <p>Ver más</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Carrusel de Spaces Creados */}
            <div className="carousel-section">
              <h2 className="carousel-title">Spaces creados</h2>
              <div className="carousel-container">
                <div className="carousel-scroll">
                  {spacesByCreatedAt.length > 0 ? (
                    spacesByCreatedAt.map((space) => (
                      <div
                        key={space.id}
                        className="space-card"
                        onClick={() => handleSpaceClick(space)}
                      >
                        <div className="space-card-header">
                          <h3 className="space-card-name">{space.name}</h3>
                        </div>
                        <p className="space-card-description">{space.description}</p>
                        <div className="space-card-meta">
                          <span className="space-card-users">Usuarios: {space.users}</span>
                          <span className="space-card-posts">Posts: {space.posts}</span>
                        </div>
                        <div className="space-card-footer">
                          <span className="space-card-creator">
                            Creado: {new Date(space.created_at).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-spaces-message">
                      <p>No hay espacios creados recientemente</p>
                    </div>
                  )}
                  {hasMoreCreated && (
                    <div className="load-more-card" onClick={loadMoreCreated}>
                      <div className="load-more-content">
                        {loadingMoreCreated ? (
                          <div className="loading-spinner-small"></div>
                        ) : (
                          <>
                            <div className="load-more-icon">+</div>
                            <p>Ver más</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Explore;
