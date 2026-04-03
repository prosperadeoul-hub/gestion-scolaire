import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../components/Layout/MainLayout';
import Pagination from '../../components/Pagination/Pagination';
import { useToast } from '../../context/ToastContext';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import './AdminPages.css';

const EnseignantsList = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        first_name: '', 
        last_name: '', 
        sexe: 'M', 
        telephone: '',
        role: 'TEACHER'
    });

    const { addToast } = useToast();

    useEffect(() => {
        fetchTeachers();
    }, [page, searchQuery]);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`users/?role=TEACHER&page=${page}&search=${searchQuery}`);
            if (res.data.results) {
                setTeachers(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 10));
            } else {
                setTeachers(res.data);
                setTotalPages(1);
            }
        } catch (err) {
            addToast("Erreur lors du chargement des enseignants", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cet enseignant ?")) return;
        try {
            await api.delete(`users/${id}/`);
            addToast("Enseignant supprimé", "success");
            fetchTeachers();
        } catch (err) {
            addToast("Erreur lors de la suppression", "error");
        }
    };

    const handleOpenModal = (t = null) => {
        if (t) {
            setEditingTeacher(t);
            setFormData({ 
                username: t.username, 
                email: t.email, 
                first_name: t.first_name, 
                last_name: t.last_name, 
                sexe: t.sexe || 'M', 
                telephone: t.telephone || '',
                role: 'TEACHER'
            });
        } else {
            setEditingTeacher(null);
            setFormData({ username: '', email: '', first_name: '', last_name: '', sexe: 'M', telephone: '', role: 'TEACHER' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTeacher) {
                await api.put(`users/${editingTeacher.id}/`, formData);
                addToast("Enseignant modifié", "success");
            } else {
                if (!formData.username) formData.username = formData.email;
                await api.post('users/', formData);
                addToast("Enseignant créé avec succès", "success");
            }
            setShowModal(false);
            fetchTeachers();
        } catch (err) {
            addToast("Erreur lors de l'enregistrement", "error");
        }
    };

    return (
        <MainLayout title="Gestion des Enseignants">
            <div className="admin-page-container">
                <header className="admin-page-header">
                    <div className="search-bar">
                        <MagnifyingGlassIcon className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un enseignant..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <PlusIcon className="btn-icon" />
                        Nouvel Enseignant
                    </button>
                </header>

                {loading ? (
                    <div className="inner-loading"><div className="loading-spinner"></div></div>
                ) : teachers.length === 0 ? (
                    <div className="empty-state">
                        <AcademicCapIcon className="empty-icon" />
                        <p>Aucun enseignant trouvé.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-card">
                            <table className="grade-table">
                                <thead>
                                    <tr>
                                        <th>Nom Complet</th>
                                        <th>Sexe</th>
                                        <th>Email</th>
                                        <th>Téléphone</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map(t => (
                                        <tr key={t.id} className="grade-table__row">
                                            <td className="grade-table__cell font-bold">{t.last_name} {t.first_name}</td>
                                            <td className="grade-table__cell">{t.sexe === 'M' ? 'Masculin' : 'Féminin'}</td>
                                            <td className="grade-table__cell">{t.email}</td>
                                            <td className="grade-table__cell">{t.telephone || '--'}</td>
                                            <td className="grade-table__cell text-right">
                                                <div className="row-actions">
                                                    <button className="action-btn edit" onClick={() => handleOpenModal(t)}>
                                                        <PencilSquareIcon className="action-icon" />
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDelete(t.id)}>
                                                        <TrashIcon className="action-icon" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingTeacher ? 'Modifier Enseignant' : 'Ajouter Enseignant'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><XMarkIcon className="action-icon" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nom</label>
                                    <input className="form-group__input" type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Prénom</label>
                                    <input className="form-group__input" type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email (Sert d'identifiant)</label>
                                <input className="form-group__input" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sexe</label>
                                    <select className="form-group__select" value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})}>
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Téléphone</label>
                                    <input className="form-group__input" type="text" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
                                </div>
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

export default EnseignantsList;
