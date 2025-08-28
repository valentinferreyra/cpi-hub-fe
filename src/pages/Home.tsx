import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import PostCard from "../components/PostCard/PostCard";
import { useState, useEffect } from "react";
import type { User } from "../types/user";
import type { Post } from "../types/post";
import { getCurrentUser, getPostsBySpaceIds } from "../services/api";
import "./Home.css";

function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const userId = "01K3J0Q7380Z62WMD721JKNH8P";
        
        const user = await getCurrentUser(userId);
        setCurrentUser(user);
        
        if (user.spaces && user.spaces.length > 0) {
          const spaceIds = user.spaces.map(space => space.id);
          const posts = await getPostsBySpaceIds(spaceIds);
          setLatestPosts(posts);
        }
        
      } catch (error) {
        console.error('Error en la carga de datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
              onClick={async () => {
                if (currentUser?.spaces && currentUser.spaces.length > 0) {
                  const spaceIds = currentUser.spaces.map(space => space.id);
                  const posts = await getPostsBySpaceIds(spaceIds);
                  setLatestPosts(posts);
                }
              }}
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
