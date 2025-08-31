import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import PostCard from "../components/PostCard/PostCard";
import { useEffect } from "react";
import "./Home.css";
import { useAppContext } from "../context/AppContext";

function Home() {
  const { currentUser, latestPosts, isLoading, fetchData } = useAppContext();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <>
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} />
      <div className="posts-container">
        <div className="posts-section">
          <div className="posts-header">
            <h2 className="posts-title">Últimas actualizaciones</h2>
            <button
              className="refresh-btn"
              onClick={fetchData}
            >
              <img src="/src/assets/refresh.png" alt="Refresh" className="refresh-icon" />
            </button>
          </div>
          <div className="posts-list">
            {latestPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home;
