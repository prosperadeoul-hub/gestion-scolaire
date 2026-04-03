import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { Navigate } from 'react-router-dom';

const DashboardWrapper = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Chargement...</div>;
    if (!user) return <Navigate to="/login" />;

    // Sélection du Dashboard selon le rôle issu du Backend
    switch (user.role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'TEACHER':
            return <TeacherDashboard />;
        case 'STUDENT':
            return <StudentDashboard />;
        default:
            return <div>Erreur : Rôle non reconnu ({user.role})</div>;
    }
};

export default DashboardWrapper;
