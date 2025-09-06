import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Space } from '../../types/space';
import './Sidebar.css';

interface SidebarProps {
  spaces: Space[];
  onSpaceClick: (space: Space) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ spaces, onSpaceClick }) => {
  const navigate = useNavigate();

  const handleSpaceClick = (space: Space) => {
    onSpaceClick(space);
    navigate(`/space/${space.id}`);
  };

  const handleExploreClick = () => {
    navigate('/explorar');
  };

  const handleTrendsClick = () => {
    navigate('/tendencias');
  };

  if (!spaces || spaces.length === 0) {
    return (
      <div className="sidebar">
        <div className="sidebar-container">
          <div
            className="sidebar-item explore-item"
            onClick={handleTrendsClick}
          >
            <img 
              src="/src/assets/trends.png" 
              alt="Tendencias" 
              className="sidebar-icon trends-icon"
            />
            Tendencias
          </div>
          <div
            className="sidebar-item explore-item"
            onClick={handleExploreClick}
          >
            <img 
              src="/src/assets/explore.png" 
              alt="Explorar" 
              className="sidebar-icon"
            />
            Explorar
          </div>
          <div className="sidebar-separator"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-container">
        <div
          className="sidebar-item explore-item"
          onClick={handleTrendsClick}
        >
          <img 
            src="/src/assets/trends.png" 
            alt="Tendencias" 
            className="sidebar-icon trends-icon"
          />
          Tendencias
        </div>
        <div
          className="sidebar-item explore-item"
          onClick={handleExploreClick}
        >
          <img 
            src="/src/assets/explore.png" 
            alt="Explorar" 
            className="sidebar-icon"
          />
          Explorar
        </div>
        <div className="sidebar-separator"></div>
        {spaces.map((space) => (
          <div
            key={space.id}
            className="sidebar-item"
            onClick={() => handleSpaceClick(space)}
          >
            {space.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
