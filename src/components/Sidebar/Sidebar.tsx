import React, { useState, useEffect } from 'react';
import type { Space } from '../../types/space';
import { mockSpaces } from '../../data/mockSpaces';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSpaces(mockSpaces);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="sidebar">
        <div className="sidebar-loading">Cargando espacios...</div>
      </div>
    );
  }

  return (
    <div className="sidebar">
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
    </div>
  );
};

export default Sidebar;
