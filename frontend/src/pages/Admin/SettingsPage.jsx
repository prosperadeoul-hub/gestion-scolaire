import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import MainLayout from '../../components/Layout/MainLayout';
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  GlobeAltIcon,
  CircleStackIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import './AdminPages.css';

const SettingsPage = () => {
    const { user } = useContext(AuthContext);

    const settingGroups = [
        {
            title: "Profil & Sécurité",
            items: [
                { name: "Informations personnelles", desc: "Changez votre nom, email et téléphone.", icon: UserCircleIcon },
                { name: "Sécurité & Mot de passe", desc: "Mise à jour du mot de passe et 2FA.", icon: ShieldCheckIcon },
            ]
        },
        {
            title: "Système Scolaire",
            items: [
                { name: "Année Scolaire", desc: "Définir l'année en cours (ex: 2026-2027).", icon: GlobeAltIcon },
                { name: "Bases de Données", desc: "Sauvegardes et restauration système.", icon: CircleStackIcon },
                { name: "Synchronisation API", desc: "Gérer les flux de données externes.", icon: ArrowPathIcon },
            ]
        },
        {
            title: "Préférences",
            items: [
                { name: "Notifications", desc: "Gérer les alertes par email et push.", icon: BellIcon },
            ]
        }
    ];

    return (
        <MainLayout title="Paramètres du Système">
            <div className="admin-page-container">
                <div className="settings-grid">
                    {settingGroups.map((group, idx) => (
                        <div key={idx} className="settings-card">
                            <h3 className="settings-card__title">{group.title}</h3>
                            <div className="settings-list">
                                {group.items.map((item, i) => (
                                    <div key={i} className="settings-item" onClick={() => {}}>
                                        <div className="settings-item__icon">
                                            <item.icon className="nav-icon" />
                                        </div>
                                        <div className="settings-item__content">
                                            <span className="settings-item__name">{item.name}</span>
                                            <span className="settings-item__desc">{item.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default SettingsPage;
