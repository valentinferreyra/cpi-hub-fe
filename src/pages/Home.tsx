import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import PostCard from "../components/PostCard/PostCard";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import { useEffect } from "react";
import "./Home.css";
import { useAppContext } from "../context/AppContext";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, latestPosts, selectedSpace, selectedSpacePosts, isLoading, fetchData, selectSpace, goToHome } = useAppContext();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (location.pathname === '/' && selectedSpace) {
      goToHome();
    }
  }, [location.pathname, selectedSpace, goToHome]);

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
        Ingresando...
      </div>
    );
  }

  const handleGoToHome = () => {
    goToHome();
    navigate('/');
  };

  const breadcrumbItems = selectedSpace ? [
    { label: selectedSpace.name, isActive: true },
    { label: "Inicio", onClick: handleGoToHome }
  ] : [];

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
              <h2 className="posts-title">Últimas novedades</h2>
            )}
          </div>
          <div className="posts-list">
            {(selectedSpace ? selectedSpacePosts : latestPosts).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home;
