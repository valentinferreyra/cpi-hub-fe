import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import PostCard from "../components/PostCard/PostCard";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import CreatePostModal from "../components/CreatePostModal/CreatePostModal";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Home.css";
import { useAppContext } from "../context/AppContext";
import { getSpaceById, getPostsBySpaceId, createPost, removeSpaceFromUser, addSpaceToUser } from "../services/api";
import type { Post } from "../types/post";

function Space() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { currentUser, selectedSpace, selectedSpacePosts, isLoading, fetchData, selectSpace, setSelectedSpace, setSelectedSpacePosts } = useAppContext();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState<string>("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [showSpaceSettings, setShowSpaceSettings] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeavingSpace, setIsLeavingSpace] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSpaceSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadSpaceFromUrl = async () => {
      if (!spaceId || !currentUser) return;

      if (selectedSpace && selectedSpace.id === parseInt(spaceId)) return;

      setIsTransitioning(true);

      try {
        const userSpace = currentUser.spaces?.find(space => space.id === parseInt(spaceId));

        if (userSpace) {
          await selectSpace(userSpace);
        } else {
          const space = await getSpaceById(parseInt(spaceId));
          const posts = await getPostsBySpaceId(parseInt(spaceId));

          if (space) {
            setSelectedSpace(space);
            setSelectedSpacePosts(posts);
          }
        }
      } catch (error) {
        console.error('Error loading space from URL:', error);
      } finally {
        setTimeout(() => setIsTransitioning(false), 150);
      }
    };

    loadSpaceFromUrl();
  }, [spaceId, currentUser, selectedSpace, selectSpace]);

  const goToSpace = () => {
    // Ya estamos en la página del space, no hacer nada
    // O podríamos refrescar la página si es necesario
  };

  const openCreatePostModal = () => {
    setIsCreatePostModalOpen(true);
  };

  const closeCreatePostModal = () => {
    setIsCreatePostModalOpen(false);
  };

  const isUserInSpace = () => {
    return currentUser?.spaces?.some(space => space.id === selectedSpace?.id);
  }

  const handleCreatePost = async (title: string, content: string) => {
    if (!selectedSpace || isCreatingPost || typeof currentUser?.id !== "number") return;

    setIsCreatingPost(true);

    try {
      const newPost = await createPost(title, content, currentUser?.id, selectedSpace.id);

      setSelectedSpacePosts((prevPosts: Post[]) => [newPost, ...prevPosts]);

      setSuccessMessageText("Post creado correctamente");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      closeCreatePostModal();
      navigate(`/post/${newPost.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };


  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSpaceSettings(!showSpaceSettings);
  };

  const handleLeaveSpace = () => {
    setShowLeaveModal(true);
    setShowSpaceSettings(false);
  };

  const handleConfirmLeave = async () => {
    if (selectedSpace && currentUser && !isLeavingSpace) {
      setIsLeavingSpace(true);
      try {
        await removeSpaceFromUser(currentUser.id, selectedSpace.id);

        setShowLeaveModal(false);

        navigate('/');

        await fetchData();
      } catch (error) {
        console.error('Error al remover space:', error);
      } finally {
        setIsLeavingSpace(false);
      }
    }
  };

  const handleJoinSpace = async () => {
    if (!selectedSpace || !currentUser) return;

    try {
      await addSpaceToUser(currentUser.id, selectedSpace.id);
      await fetchData();
      setSuccessMessageText(`Te has unido correctamente al space "${selectedSpace.name}"`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error joining space:', error);
    }
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  const breadcrumbItems = selectedSpace ? [
    { label: selectedSpace.name, isActive: true },
    { label: "Inicio", isActive: false }
  ] : [];

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        fontWeight: '500',
        color: '#333'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <>
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />

      {showSuccessMessage && (
        <div className="success-notification">
          <div className="success-content">
            <span className="success-icon">✓</span>
            <span>{successMessageText}</span>
          </div>
        </div>
      )}

      <div className="posts-container">
        <div className="posts-section">
          <div className="posts-header">
            {selectedSpace ? (
              <div className="space-header-container">
                <Breadcrumb items={breadcrumbItems} />
                {isUserInSpace() && (
                  <div className="space-settings-container" ref={settingsRef}>
                    <img
                      src="/src/assets/settings.png"
                      alt="Configuración"
                      className="space-settings-icon"
                      onClick={handleSettingsClick}
                    />
                    {showSpaceSettings && (
                      <div className="space-settings-dropdown">
                        <button
                          className="dropdown-item"
                          onClick={handleLeaveSpace}
                        >
                          Dejar space
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <h2 className="posts-title">Space no encontrado</h2>
            )}
          </div>
          {selectedSpace && (
            <div className="space-info">
              <div className="space-description-container">
                <p className="space-description">{selectedSpace.description}</p>
                {isUserInSpace() ? (
                  <button className="create-post-btn" onClick={openCreatePostModal}>
                    Crear post
                  </button>
                ) : (
                  <button className="create-post-btn" onClick={handleJoinSpace}>
                    Unirse al space
                  </button>
                )}
              </div>
              <p className="space-creator">
                Creado por: {selectedSpace.created_by?.name || 'N/A'} {selectedSpace.created_by?.last_name || ''}
              </p>
              <div className="space-separator"></div>
            </div>
          )}
          <div className={`posts-list ${isTransitioning ? 'transitioning' : ''}`}>
            {selectedSpace ? selectedSpacePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            )) : (
              <div className="posts-placeholder">
                <h2>Space no encontrado</h2>
                <p>El space que buscas no existe o no tienes acceso a él.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={closeCreatePostModal}
        onCreatePost={handleCreatePost}
        isLoading={isCreatingPost}
      />

      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="leave-modal-content">
            <div className="leave-modal-header">
              <h2>¿Estás seguro?</h2>
            </div>
            <div className="leave-modal-body">
              <p>¿Estás seguro que deseas abandonar el Space <strong>"{selectedSpace?.name}"</strong>?</p>
            </div>
            <div className="leave-modal-actions">
              <button
                className="btn-cancel-leave"
                onClick={handleCancelLeave}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-leave"
                onClick={handleConfirmLeave}
                disabled={isLeavingSpace}
              >
                {isLeavingSpace ? 'Abandonando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Space;
