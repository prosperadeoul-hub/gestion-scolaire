import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

const MainLayout = ({ children, title }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="layout-wrapper">
      <Sidebar logout={logout} />
      <div className="main-content-wrapper">
        <Header title={title} user={user} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
