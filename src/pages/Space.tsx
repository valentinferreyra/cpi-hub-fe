import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import PostCard from "../components/PostCard/PostCard";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import CreatePostModal from "../components/CreatePostModal/CreatePostModal";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Home.css";
import { useAppContext } from "../context/AppContext";
import { getSpaceById, getPostsBySpaceId, createPost } from "../services/api";
import type { Post } from "../types/post";

function Space() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { currentUser, selectedSpace, selectedSpacePosts, isLoading, fetchData, selectSpace, setSelectedSpace, setSelectedSpacePosts } = useAppContext();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleCreatePost = async (title: string, content: string) => {
    if (!selectedSpace || isCreatingPost) return;
    
    setIsCreatingPost(true);
    
    try {
      const newPost = await createPost(title, content, selectedSpace.id);
      
      setSelectedSpacePosts((prevPosts: Post[]) => [newPost, ...prevPosts]);
      
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

  const breadcrumbItems = selectedSpace ? [
    { label: selectedSpace.name, onClick: goToSpace },
    { label: "Inicio", isActive: true }
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
            <span>Post creado correctamente</span>
          </div>
        </div>
      )}
      
      <div className="posts-container">
        <div className="posts-section">
          <div className="posts-header">
            {selectedSpace ? (
              <Breadcrumb items={breadcrumbItems} />
            ) : (
              <h2 className="posts-title">Space no encontrado</h2>
            )}
          </div>
          {selectedSpace && (
            <div className="space-info">
              <div className="space-description-container">
                <p className="space-description">{selectedSpace.description}</p>
                <button className="create-post-btn" onClick={openCreatePostModal}>
                  Crear post
                </button>
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
    </>
  )
}

export default Space;
