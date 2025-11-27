import React, { useState, useEffect, useRef } from 'react';
import './Breadcrumb.css';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  spaceId?: number;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = (e: React.MouseEvent, spaceId: number) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === spaceId ? null : spaceId);
  };

  const handleLeaveSpace = (_spaceId: number) => {
    setOpenDropdown(null);
  };

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator">&gt;</span>}
            {item.isActive ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <div className="breadcrumb-link-container">
                <button 
                  className="breadcrumb-link" 
                  onClick={item.onClick}
                  type="button"
                >
                  {item.label}
                </button>
                {item.spaceId && (
                  <div className="breadcrumb-settings-container" ref={dropdownRef}>
                    <img 
                      src="/src/assets/settings.png" 
                      alt="Configuración" 
                      className="breadcrumb-settings-icon"
                      onClick={(e) => handleSettingsClick(e, item.spaceId!)}
                    />
                    {openDropdown === item.spaceId && (
                      <div className="breadcrumb-dropdown">
                        <button 
                          className="dropdown-item"
                          onClick={() => handleLeaveSpace(item.spaceId!)}
                        >
                          Dejar space
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
