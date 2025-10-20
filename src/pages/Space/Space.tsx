import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import PostCard from "@components/PostCard/PostCard";
import CreatePostModal from "@components/modals/CreatePostModal/CreatePostModal";
import CreateSpaceModal from "@components/modals/CreateSpaceModal/CreateSpaceModal";
import UsersList from "@components/UsersList/UsersList";
import { CreateSpaceBanner } from "@components/CreateSpaceBanner";
import { SpaceHeader } from "@components/SpaceHeader";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Space.css";
import { useAppContext } from "../../context/AppContext";
import { getSpaceById, getPostsBySpaceId, createPost, removeSpaceFromUser, addSpaceToUser } from "../../api";
import type { Post } from "../../types/post";
import { useCreateSpace, useSuccessNotification, useClickOutside, useModal } from "../../hooks";
import { CreateSpaceConfirmationModal } from "../../components/modals/CreateSpaceModal";
import { LeaveSpaceModal } from "../../components/modals/LeaveSpaceModal";

function Space() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { currentUser, selectedSpace, selectedSpacePosts, isLoading, fetchData, selectSpace, setSelectedSpace, setSelectedSpacePosts } = useAppContext();
  const createSpaceHook = useCreateSpace(currentUser?.id?.toString(), (_space) => {
    fetchData();
  });

  const successNotification = useSuccessNotification();
  const createPostModal = useModal();
  const spaceSettingsModal = useModal();
  const leaveModal = useModal();
  const settingsRef = useClickOutside<HTMLDivElement>(() => spaceSettingsModal.closeModal());
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isLeavingSpace, setIsLeavingSpace] = useState(false);

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
    createPostModal.openModal();
  };

  const closeCreatePostModal = () => {
    createPostModal.closeModal();
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

      successNotification.showSuccess("Post creado correctamente");
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
    spaceSettingsModal.toggleModal();
  };

  const handleLeaveSpace = () => {
    leaveModal.openModal();
    spaceSettingsModal.closeModal();
  };

  const handleConfirmLeave = async () => {
    if (selectedSpace && currentUser && !isLeavingSpace) {
      setIsLeavingSpace(true);
      try {
        await removeSpaceFromUser(currentUser.id, selectedSpace.id);

        leaveModal.closeModal();

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
      successNotification.showSuccess(`Te has unido correctamente al space "${selectedSpace.name}"`);
    } catch (error) {
      console.error('Error joining space:', error);
    }
  };

  const handleCancelLeave = () => {
    leaveModal.closeModal();
  };



  if (isLoading) {
    return (
      <div className="loading-container">
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

      {successNotification.showSuccessMessage && (
        <div className="success-notification">
          <div className="success-content">
            <span className="success-icon">✓</span>
            <span>{successNotification.successMessageText}</span>
          </div>
        </div>
      )}

      <div className="space-posts-container-main">
        <div className="posts-section space-section">
          {selectedSpace ? (
            <SpaceHeader
              space={selectedSpace}
              currentUser={currentUser}
              isUserInSpace={isUserInSpace() || false}
              settingsRef={settingsRef}
              showSettingsDropdown={spaceSettingsModal.isOpen}
              onJoinSpace={handleJoinSpace}
              onSettingsClick={handleSettingsClick}
              onLeaveSpace={handleLeaveSpace}
            />
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
          
          <CreateSpaceBanner onCreateSpace={createSpaceHook.openCreateSpaceModal} />
        </div>
      </div>

      <CreatePostModal
        isOpen={createPostModal.isOpen}
        onClose={closeCreatePostModal}
        onCreatePost={handleCreatePost}
        isLoading={isCreatingPost}
      />

      <CreateSpaceModal
        isOpen={createSpaceHook.isCreateSpaceModalOpen}
        onClose={createSpaceHook.closeCreateSpaceModal}
        onCreateSpace={createSpaceHook.handleCreateSpace}
        isLoading={createSpaceHook.isCreatingSpace}
      />

      <LeaveSpaceModal
        isOpen={leaveModal.isOpen}
        spaceName={selectedSpace?.name}
        isLeaving={isLeavingSpace}
        onCancel={handleCancelLeave}
        onConfirm={handleConfirmLeave}
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
    </>
  )
}

export default Space;
