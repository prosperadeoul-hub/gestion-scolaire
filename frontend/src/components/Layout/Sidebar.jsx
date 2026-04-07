import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Squares2X2Icon,
  AcademicCapIcon,
  BookOpenIcon,
  UsersIcon,
  DocumentChartBarIcon,
  DocumentCheckIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  TableCellsIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import './Sidebar.css';

const Sidebar = ({ logout }) => {
  const menuItems = [
    { name: 'Tableau de Bord', path: '/dashboard', icon: Squares2X2Icon },
    { name: 'Modules', path: '/modules', icon: BookOpenIcon },
    { name: 'Enseignants', path: '/teachers', icon: UserGroupIcon },
    { name: 'Étudiants', path: '/students', icon: UsersIcon },
    { name: 'Prog. Annuelle', path: '/programmation', icon: TableCellsIcon },
    { name: 'Notes/Bulletins', path: '/grades', icon: DocumentChartBarIcon },
    { name: 'Paramètres', path: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <AcademicCapIcon className="logo-icon" />
        <span>SGS Manager</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" />
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={logout}>
          <ArrowLeftOnRectangleIcon className="nav-icon" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
