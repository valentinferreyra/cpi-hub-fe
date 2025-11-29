import { useNavigate, useLocation, Link } from "react-router-dom";
import Sidebar from "@components/Sidebar/Sidebar";
import Topbar from "@components/Topbar/Topbar";
import PostCard from "@components/PostCard/PostCard";
import Breadcrumb from "@components/Breadcrumb/Breadcrumb";
import NewsCarousel from "@components/NewsCarousel";
import { useEffect, useState } from "react";
import "./Home.css";
import { useAppContext } from "../../context/AppContext";
import { getPostsByUserId } from "../../api";
import type { Post } from "../../types/post";
import { useMasonryLayout } from "../../hooks";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, selectedSpace, selectedSpacePosts, isLoading, selectSpace, goToHome } = useAppContext();
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const postsToShow = selectedSpace ? selectedSpacePosts : latestPosts;
  const masonryRef = useMasonryLayout(Array.isArray(postsToShow) ? postsToShow : []);


  useEffect(() => {
    const fetchPosts = async () => {
      if (currentUser) {
        try {
          setIsLoadingMore(true);
          const response = await getPostsByUserId(currentUser.id, currentPage);
          const posts = response.data || [];

          if (currentPage === 1) {
            setLatestPosts(posts);
          } else {
            setLatestPosts(prev => [...prev, ...posts]);
          }

          const totalPosts = response.total || 0;
          const currentTotalLoaded = currentPage * (response.page_size || 20);
          setHasMore(currentTotalLoaded < totalPosts);
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setIsLoadingMore(false);
        }
      }
    };

    fetchPosts();
  }, [currentUser, currentPage]);

  useEffect(() => {
    if (location.pathname === '/' && selectedSpace) {
      goToHome();
    }
  }, [location.pathname, selectedSpace, goToHome]);

  if (isLoading) {
    return (
      <div className="loading-container">
        Ingresando...
      </div>
    );
  }

  const handleGoToHome = () => {
    goToHome();
    navigate('/');
  };

  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
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
          {!selectedSpace && <NewsCarousel />}
          <div ref={masonryRef} className="posts-list">
            {(() => {
              if (!Array.isArray(postsToShow) || postsToShow.length === 0) {
                if (selectedSpace) {
                  return (
                    <div className="empty-posts">
                      <h3>No hay posts disponibles</h3>
                      <p>Explora otros <Link to="/explorar">spaces</Link> o crea el primer post aquí.</p>
                    </div>
                  );
                }
                return (
                  <div className="empty-posts">
                    <h3>No hay posts disponibles</h3>
                    <p>Te invitamos a explorar nuestros <Link to="/explorar">spaces</Link> para encontrar contenido de tu interés y unirte a las conversaciones que más te apasionen.</p>
                  </div>
                );
              }

              return postsToShow.map((post) => (
                <PostCard key={post.id} post={post} />
              ));
            })()}
          </div>
          {!selectedSpace && hasMore && latestPosts.length > 0 && (
            <div className="loading-center-margin">
              <button
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Cargando...' : 'Ver más'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Home;
