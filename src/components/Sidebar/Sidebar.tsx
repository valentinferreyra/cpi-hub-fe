import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Space } from '../../types/space';
import spaceChatIcon from '../../assets/space_chat.png';
import downArrowIcon from '../../assets/down_arrow.png';
import rightArrowIcon from '../../assets/right_arrow_2.png';
import './Sidebar.css';

interface SidebarProps {
  spaces: Space[];
  onSpaceClick: (space: Space) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ spaces, onSpaceClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSpacesExpanded, setIsSpacesExpanded] = useState(true);

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

  const toggleSpacesExpansion = () => {
    setIsSpacesExpanded(!isSpacesExpanded);
  };

  if (!spaces || spaces.length === 0) {
    return (
      <div className="sidebar">
        <div className="sidebar-top-section">
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
      <div className="sidebar-top-section">
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
        <div className="sidebar-spaces-header" onClick={toggleSpacesExpansion}>
          <span className="sidebar-spaces-title">Mis Spaces</span>
          <img
            src={isSpacesExpanded ? downArrowIcon : rightArrowIcon}
            alt={isSpacesExpanded ? 'Contraer' : 'Expandir'}
            className="sidebar-spaces-toggle-icon"
          />
        </div>
      </div>
      <div className="sidebar-spaces-container">
        {isSpacesExpanded && spaces.map((space) => {
          const isSpaceActive = location.pathname === `/space/${space.id}`;
          const isChatActive = location.pathname === `/space/${space.id}/chat`;

          return (
            <div key={space.id} className="sidebar-space-item">
              <div
                className={`sidebar-item${isSpaceActive ? ' active-space' : ''}`}
                onClick={() => handleSpaceClick(space)}
                title={space.name}
              >
                {space.name}
              </div>
              <div
                className={`sidebar-chat-link${isChatActive ? ' active-chat' : ''}`}
                onClick={() => navigate(`/space/${space.id}/chat`)}
              >
                <img src={spaceChatIcon} alt="Chat" className="sidebar-chat-icon" />
                Chat
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
