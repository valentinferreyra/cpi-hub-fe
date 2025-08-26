import React from 'react';
import './Topbar.css';
import Search from '../Search/Search';
import Messages from '../Messages/Messages';
import Notifications from '../Notifications/Notifications';
import cpihubLogo from '../../assets/cpihub-logo.png';
import unqLogo from '../../assets/unq-logo.png';
import homeLogo from '../../assets/home.png';

const Topbar: React.FC = () => {
  const handleHomeClick = () => {
    console.log('click on home');
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
            <Search placeholder="¿En qué estás pensando hoy?" />
          </div>
        </div>
        
        <div className="topbar-right">
          <div className="actions-container">
            <Messages />
            <Notifications />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
