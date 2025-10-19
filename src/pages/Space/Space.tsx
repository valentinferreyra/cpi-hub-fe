import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import PostCard from "@components/PostCard/PostCard";
import CreatePostModal from "@components/modals/CreatePostModal/CreatePostModal";
import UsersList from "@components/UsersList/UsersList";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Space.css";
import { useAppContext } from "../../context/AppContext";
import { getSpaceById, getPostsBySpaceId, createPost, removeSpaceFromUser, addSpaceToUser } from "../../api";
import type { Post } from "../../types/post";

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
  }, [spaceId, currentUser, selectedSpace, selectSpace, setSelectedSpace, setSelectedSpacePosts]);

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
    if (!selectedSpace || isCreatingPost || !currentUser?.id) return;

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
      const updatedSpace = await getSpaceById(selectedSpace.id);
      if (updatedSpace) setSelectedSpace(updatedSpace);
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
      {selectedSpace && (
        <UsersList spaceId={selectedSpace.id} />
      )}

      {showSuccessMessage && (
        <div className="success-notification">
          <div className="success-content">
            <span className="success-icon">✓</span>
            <span>{successMessageText}</span>
          </div>
        </div>
      )}

      <div className="space-posts-container-main">
        <div className="posts-section space-section">
          {selectedSpace ? (
            <div className="space-header-hero">
              <div className="space-header-content">
                <div className="space-title-section">
                  <div className="space-title-main">
                    <h1 className="space-title">{selectedSpace.name}</h1>
                    <p className="space-description">{selectedSpace.description}</p>
                  </div>
                  <div className="space-actions">
                    {!isUserInSpace() && (
                      <button className="space-action-btn join-space-btn" onClick={handleJoinSpace}>
                        <span>+</span>
                        Unirse al space
                      </button>
                    )}
                    {isUserInSpace() && (
                      <div className="space-settings-container" ref={settingsRef}>
                        <button className="space-settings-btn" onClick={handleSettingsClick}>
                          <img
                            src="/src/assets/settings.png"
                            alt="Configuración"
                            className="space-settings-icon"
                          />
                        </button>
                        {showSpaceSettings && (
                          <div className="space-settings-dropdown">
                            <button
                              className="dropdown-item danger"
                              onClick={handleLeaveSpace}
                            >
                              Abandonar space
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-meta-section">
                  <div className="space-stats">
                    <div className="space-stat">
                      <span className="space-stat-icon">👥</span>
                      <span>{selectedSpace.users} usuarios</span>
                    </div>
                    <div className="space-stat">
                      <span className="space-stat-icon">✏️</span>
                      <span>{selectedSpace.posts} posts</span>
                    </div>
                  </div>
                  <div className="space-creator-info">
                    <div className="space-creator-avatar">
                      {(selectedSpace.created_by?.name || 'U')[0].toUpperCase()}
                    </div>
                    <span>
                      Creado por {selectedSpace.created_by?.name || 'N/A'} {selectedSpace.created_by?.last_name || ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="posts-header">
              <h2 className="posts-title">Space no encontrado</h2>
            </div>
          )}
          {selectedSpace && (
            <div className="space-posts-container">
              <div className="space-posts-header">
                <h2 className="space-posts-title">Posts</h2>
                {isUserInSpace() && (
                  <button className="create-post-btn" onClick={openCreatePostModal}>
                    <span>+</span>
                    Crear post
                  </button>
                )}
              </div>
              <div className={`posts-list ${isTransitioning ? 'transitioning' : ''}`}>
                {selectedSpacePosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
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
