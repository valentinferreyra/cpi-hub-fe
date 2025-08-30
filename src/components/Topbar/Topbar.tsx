import React from 'react';
import './Topbar.css';
import Search from '../Search/Search';
import Messages from '../Messages/Messages';
import Notifications from '../Notifications/Notifications';
import cpihubLogo from '../../assets/cpihub-logo.png';
import unqLogo from '../../assets/unq-logo.png';
import homeLogo from '../../assets/home.png';
import type { User } from '../../types/user';

interface TopbarProps {
  currentUser: User | null;
}

const Topbar: React.FC<TopbarProps> = ({ currentUser }) => {
  const handleHomeClick = () => {
    console.log('click on home');
  };

  const handleUserClick = () => {
    if (currentUser) {
      console.log('Usuario actual:', {
        id: currentUser.id,
        nombre: currentUser.name,
        apellido: currentUser.last_name,
        email: currentUser.email
      });
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-content">
        <div className="topbar-left">
          <img src={unqLogo} alt="UNQ Logo" className="topbar-unq-logo" />
          <img src={cpihubLogo} alt="CPIHub Logo" className="topbar-logo" />
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
            <Messages />
            <Notifications />
            {currentUser && (
              <button className="user-avatar-button" onClick={handleUserClick}>
                <img 
                  src={currentUser.image} 
                  alt={`${currentUser.name} ${currentUser.last_name}`} 
                  className="user-avatar" 
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
