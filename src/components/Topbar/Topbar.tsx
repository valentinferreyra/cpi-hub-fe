import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';
import Search from '../Search/Search';
import Notifications from '../Notifications/Notifications';
import cpihubLogo from '../../assets/cpihub-logo.png';
import unqLogo from '../../assets/unq-logo.png';
import homeLogo from '../../assets/home.png';
import type { User } from '../../types/user';
import LogoutModal from '../LogoutModal/LogoutModal';
import { useAppContext } from '../../context/AppContext';

interface TopbarProps {
  currentUser: User | null;
}

const Topbar: React.FC<TopbarProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const { setCurrentUser, userConnectionStatus } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleHomeClick = () => {
    navigate('/');
  };

  const toggleMenu = () => {
    if (!currentUser) return;
    setIsMenuOpen(prev => !prev);
  };

  const handleGoToProfile = () => {
    if (!currentUser) return;
    navigate(`/users/${currentUser.id}`);
    setIsMenuOpen(false);
  };

  const handleGoToSettings = () => {
    if (!currentUser) return;
    navigate('/settings');
    setIsMenuOpen(false);
  };

  const handleOpenLogout = () => {
    setIsLogoutModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="topbar">
      <div className="topbar-content">
        <div className="topbar-left">
          <img src={unqLogo} alt="UNQ Logo" className="topbar-unq-logo" />
          <img src={cpihubLogo} alt="CPIHub Logo" className="topbar-logo" onClick={handleHomeClick} />
        </div>

        <div className="topbar-center">
          <div className="search-container">
            <button className="home-button" onClick={handleHomeClick}>
              <img src={homeLogo} alt="Home" className="home-icon" />
            </button>
            <Search placeholder="Buscar un tópico..." />
          </div>
        </div>

        <div className="topbar-right">
          <div className="actions-container">
            <Notifications />
            {currentUser && (
              <div className="user-menu-container" ref={menuRef}>
                <button className="user-avatar-button" onClick={toggleMenu} aria-haspopup="true" aria-expanded={isMenuOpen}>
                  {currentUser.image ? (
                    <img src={currentUser.image} alt={`${currentUser.name} ${currentUser.last_name}`} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {currentUser.name.charAt(0)}{currentUser.last_name.charAt(0)}
                    </div>
                  )}
                </button>
                {isMenuOpen && (
                  <div className="user-menu-dropdown" role="menu">
                    <div className="user-menu-header">
                      <span className="user-menu-name">{currentUser.name} {currentUser.last_name}</span>
                      <span className="user-menu-email">{currentUser.email}</span>
                    </div>
                    <div className="user-menu-status">
                      <span className="status-label">Estado:</span>
                      <span className={`status-value ${userConnectionStatus === 'connected' ? 'online' : 'offline'}`}>
                        {userConnectionStatus === 'connected' ? 'En línea' : 'Desconectado'}
                      </span>
                    </div>
                    <button className="user-menu-item" onClick={handleGoToProfile} role="menuitem">Mi perfil</button>
                    <button className="user-menu-item" onClick={handleGoToSettings} role="menuitem">Ajustes</button>
                    <button className="user-menu-item danger" onClick={handleOpenLogout} role="menuitem">Cerrar sesión</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default Topbar;
