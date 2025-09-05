import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import PostCard from "../components/PostCard/PostCard";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import { useEffect } from "react";
import "./Home.css";
import { useAppContext } from "../context/AppContext";

function Space() {
  const { currentUser, selectedSpace, selectedSpacePosts, isLoading, fetchData, selectSpace } = useAppContext();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToSpace = () => {
    // Ya estamos en la página del space, no hacer nada
    // O podríamos refrescar la página si es necesario
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
      <div className="posts-container">
        <div className="posts-section">
          <div className="posts-header">
            {selectedSpace ? (
              <Breadcrumb items={breadcrumbItems} />
            ) : (
              <h2 className="posts-title">Space no encontrado</h2>
            )}
            <button
              className="refresh-btn"
              onClick={fetchData}
            >
              <img src="/src/assets/refresh.png" alt="Refresh" className="refresh-icon" />
            </button>
          </div>
          {selectedSpace && (
            <div className="space-info">
              <p className="space-description">{selectedSpace.description}</p>
              <p className="space-creator">
                Creado por: {selectedSpace.created_by?.name} {selectedSpace.created_by?.last_name}
              </p>
              <div className="space-separator"></div>
            </div>
          )}
          <div className="posts-list">
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
    </>
  )
}

export default Space;
