import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Space } from '../../types/space';
import { useAppContext } from '../../context/AppContext';
import './Sidebar.css';

interface SidebarProps {
  spaces: Space[];
  onSpaceClick: (space: Space) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ spaces, onSpaceClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSpace, currentUser } = useAppContext();

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
        <div className='sidebar-spaces-title'>Mis Spaces</div>
        {spaces.map((space) => {
          const isSpaceActive = location.pathname === `/space/${space.id}`;
          const isChatActive = location.pathname === `/space/${space.id}/chat`;
          const isActive = selectedSpace && space.id === selectedSpace.id && currentUser?.spaces?.some(s => s.id === space.id);
          
          return (
            <div key={space.id} style={{ marginBottom: '4px' }}>
              <div
                className={`sidebar-item${isSpaceActive ? ' active-space' : ''}`}
                onClick={() => handleSpaceClick(space)}
                style={isSpaceActive ? { fontWeight: 'bold', color: '#ffff' } : {}}
                title={space.name}
              >
                {space.name}
              </div>
              <div
                className={`sidebar-chat-link${isChatActive ? ' active-chat' : ''}`}
                onClick={() => navigate(`/space/${space.id}/chat`)}
                style={isChatActive ? { fontWeight: 'bold', color: '#ffff' } : {}}
              >
                💬 Chat del space
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
