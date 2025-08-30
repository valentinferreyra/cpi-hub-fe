import React from 'react';
import type { Space } from '../../types/space';
import './Sidebar.css';

interface SidebarProps {
  spaces: Space[];
}

const Sidebar: React.FC<SidebarProps> = ({ spaces }) => {
  if (!spaces || spaces.length === 0) {
    return (
      <div className="sidebar">
        <div className="sidebar-loading">No hay spaces suscritos</div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-separator"></div>
      <div className="sidebar-container">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="sidebar-item"
          >
            {space.name}
          </div>
        ))}
      </div>
      <div className="sidebar-separator"></div>
    </div>
  );
};

export default Sidebar;
