import React from 'react';
import { BellIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import './Header.css';

const Header = ({ title, user }) => {
  return (
    <header className="header">
      <div className="header-title">
        <h1>{title}</h1>
      </div>
      
      <div className="header-actions">
        <button className="icon-button notification-btn">
          <BellIcon className="header-icon" />
          <span className="badge"></span>
        </button>
        
        <div className="user-profile">
          <UserCircleIcon className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{user?.username || 'Utilisateur'}</span>
            <span className="user-role">{user?.role || 'Rôle'}</span>
          </div>
          <ChevronDownIcon className="chevron-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
