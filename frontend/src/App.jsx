import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login/Login';
import BulletinEtudiant from './pages/DashboardEtudiant/BulletinEtudiant';
import SaisieNotes from './components/SaisieNotes/SaisieNotes';
import DashboardWrapper from './pages/Dashboard/DashboardWrapper';
import ClassesList from './pages/Admin/ClassesList';
import ModulesList from './pages/Admin/MatieresList';
import EtudiantsList from './pages/Admin/EtudiantsList';
import NotesList from './pages/Admin/NotesList';
import SettingsPage from './pages/Admin/SettingsPage';
import EnseignantsList from './pages/Admin/EnseignantsList';
import ProgrammationAnnuellePage from './pages/Programmation/ProgrammationAnnuellePage';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardWrapper />
        </PrivateRoute>
      } />
      <Route path="/modules" element={
        <PrivateRoute>
          <ModulesList />
        </PrivateRoute>
      } />
      <Route path="/teachers" element={
        <PrivateRoute>
          <EnseignantsList />
        </PrivateRoute>
      } />
      <Route path="/students" element={
        <PrivateRoute>
          <EtudiantsList />
        </PrivateRoute>
      } />
      <Route path="/grades" element={
        <PrivateRoute>
          <NotesList />
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <SettingsPage />
        </PrivateRoute>
      } />
      <Route path="/bulletin" element={
        <PrivateRoute>
          <BulletinEtudiant />
        </PrivateRoute>
      } />
      <Route path="/programmation" element={
        <PrivateRoute>
          <ProgrammationAnnuellePage />
        </PrivateRoute>
      } />
      <Route path="/enseignant" element={
        <PrivateRoute>
          <SaisieNotes />
        </PrivateRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
