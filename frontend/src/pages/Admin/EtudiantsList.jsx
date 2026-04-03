import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../components/Layout/MainLayout';
import Pagination from '../../components/Pagination/Pagination';
import { useToast } from '../../context/ToastContext';
import { 
  PlusIcon,
  UsersIcon, 
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import '../../components/SaisieNotes/SaisieNotes.css';
import './AdminPages.css';

const EtudiantsList = () => {
    const [etudiants, setEtudiants] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [editingEtudiant, setEditingEtudiant] = useState(null);
    const [formData, setFormData] = useState({ matricule: '', user: '', promotion: '', date_naissance: '' });

    const { addToast } = useToast();

    useEffect(() => {
        fetchEtudiants();
    }, [page, searchQuery]);

    useEffect(() => {
        const fetchData = async () => {
            const resProm = await api.get('promotions/');
            const resUsers = await api.get('users/?role=STUDENT');
            setPromotions(resProm.data.results || resProm.data);
            setUsers(resUsers.data.results || resUsers.data);
        };
        fetchData();
    }, []);

    const fetchEtudiants = async () => {
        try {
            setLoading(true);
            const res = await api.get(`etudiants/?page=${page}&search=${searchQuery}`);
            if (res.data.results) {
                setEtudiants(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 10));
            } else {
                setEtudiants(res.data);
                setTotalPages(1);
            }
        } catch (err) {
            addToast("Erreur lors du chargement des étudiants", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (matricule) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) return;
        try {
            await api.delete(`etudiants/${matricule}/`);
            addToast("Étudiant supprimé avec succès", "success");
            fetchEtudiants();
        } catch (err) {
            addToast("Erreur lors de la suppression", "error");
        }
    };

    const handleOpenModal = (e = null) => {
        if (e) {
            setEditingEtudiant(e);
            setFormData({ 
                matricule: e.matricule, 
                user: e.user?.id || '', 
                promotion: e.promotion || '', 
                date_naissance: e.date_naissance || '' 
            });
        } else {
            setEditingEtudiant(null);
            setFormData({ matricule: '', user: '', promotion: '', date_naissance: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        try {
            if (editingEtudiant) {
                await api.put(`etudiants/${editingEtudiant.matricule}/`, formData);
                addToast("Étudiant modifié avec succès", "success");
            } else {
                await api.post('etudiants/', formData);
                addToast("Étudiant ajouté avec succès", "success");
            }
            setShowModal(false);
            fetchEtudiants();
        } catch (err) {
            addToast("Erreur lors de l'enregistrement", "error");
        }
    };

    return (
        <MainLayout title="Gestion des Étudiants">
            <div className="admin-page-container">
                <header className="admin-page-header">
                    <div className="search-bar">
                        <MagnifyingGlassIcon className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un étudiant..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <PlusIcon className="btn-icon" />
                        Nouvel Étudiant
                    </button>
                </header>

                {loading ? (
                    <div className="inner-loading">
                        <div className="loading-spinner"></div>
                        <span>Chargement des étudiants...</span>
                    </div>
                ) : etudiants.length === 0 ? (
                    <div className="empty-state">
                        <UsersIcon className="empty-icon" />
                        <p>Aucun étudiant trouvé.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-card">
                            <table className="grade-table">
                                <thead>
                                    <tr>
                                        <th>Matricule</th>
                                        <th>Nom & Prénom</th>
                                        <th>Promotion</th>
                                        <th>Date Naissance</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {etudiants.map(e => (
                                        <tr key={e.matricule} className="grade-table__row">
                                            <td className="grade-table__cell font-mono">{e.matricule}</td>
                                            <td className="grade-table__cell">
                                                <div className="user-cell">
                                                    <UserCircleIcon className="user-icon-sm" />
                                                    <span className="font-bold">
                                                        {e.user?.last_name?.toUpperCase()} {e.user?.first_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="grade-table__cell">
                                                <span className="badge-class">{e.promotion_libelle}</span>
                                            </td>
                                            <td className="grade-table__cell">{e.date_naissance || "N/A"}</td>
                                            <td className="grade-table__cell text-right">
                                                <div className="row-actions">
                                                    <button className="action-btn edit" onClick={() => handleOpenModal(e)}>
                                                        <PencilSquareIcon className="action-icon" />
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDelete(e.matricule)}>
                                                        <TrashIcon className="action-icon" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
                    </>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingEtudiant ? 'Modifier l\'Étudiant' : 'Ajouter un Étudiant'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <XMarkIcon className="action-icon" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label className="form-group__label">Matricule</label>
                                <input 
                                    className="form-group__input" 
                                    type="text" 
                                    value={formData.matricule}
                                    onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                                    required
                                    disabled={!!editingEtudiant}
                                    placeholder="ex: ETUD2026001"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Compte Utilisateur</label>
                                <select 
                                    className="form-group__select"
                                    value={formData.user}
                                    onChange={(e) => setFormData({...formData, user: e.target.value})}
                                    required
                                >
                                    <option value="">Sélectionner un compte</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.last_name} {u.first_name} ({u.username})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Promotion</label>
                                <select 
                                    className="form-group__select"
                                    value={formData.promotion}
                                    onChange={(e) => setFormData({...formData, promotion: e.target.value})}
                                    required
                                >
                                    <option value="">Sélectionner une promotion</option>
                                    {promotions.map(p => (
                                        <option key={p.id} value={p.id}>{p.libelle}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Date de Naissance</label>
                                <input className="form-group__input" type="date" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default EtudiantsList;
