import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockSpacesByUpdatedAt } from "../data/mockSpacesByUpdatedAt";
import { mockSpacesByCreatedAt } from "../data/mockSpacesByCreatedAt";
import type { Space } from "../types/space";
import "./ComingSoon.css";

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  const { currentUser, selectSpace } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
    }
  }, [currentUser]);


  const handleSpaceClick = (space: Space) => {
    selectSpace(space);
    navigate(`/space/${space.id}`);
  };

  if (title === "Explorar") {
    return (
      <>
        <Topbar currentUser={currentUser} />
        <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
        <div className="posts-container">
          <div className="posts-section">
            <div className="posts-header">
              <h2 className="posts-title">Explorar</h2>
            </div>
            <div className="explore-content">
            
            <div className="carousel-section">
              <h2 className="carousel-title">Spaces actualizados recientemente</h2>
              <div className="carousel-container">
                <div className="carousel-scroll">
                  {mockSpacesByUpdatedAt.map((space) => (
                    <div
                      key={space.id}
                      className="space-card"
                      onClick={() => handleSpaceClick(space)}
                    >
                      <div className="space-card-header">
                        <h3 className="space-card-name">{space.name}</h3>
                      </div>
                      <p className="space-card-description">{space.description}</p>
                      <div className="space-card-footer">
                        <span className="space-card-creator">
                          Por {space.updated_by.name} {space.updated_by.last_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carrusel de Spaces Creados */}
            <div className="carousel-section">
              <h2 className="carousel-title">Spaces creados</h2>
              <div className="carousel-container">
                <div className="carousel-scroll">
                  {mockSpacesByCreatedAt.map((space) => (
                    <div
                      key={space.id}
                      className="space-card"
                      onClick={() => handleSpaceClick(space)}
                    >
                      <div className="space-card-header">
                        <h3 className="space-card-name">{space.name}</h3>
                      </div>
                      <p className="space-card-description">{space.description}</p>
                      <div className="space-card-footer">
                        <span className="space-card-creator">
                          Por {space.created_by.name} {space.created_by.last_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Para otras páginas (Tendencias), mostrar el mensaje de "trabajando en ello"
  return (
    <div className="coming-soon-page">
      <Topbar currentUser={currentUser} />
      <Sidebar spaces={currentUser?.spaces || []} onSpaceClick={selectSpace} />
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">🚧</div>
          <h1 className="coming-soon-title">{title}</h1>
          <p className="coming-soon-description">{description}</p>
          <div className="coming-soon-subtitle">Estamos trabajando en ello</div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
