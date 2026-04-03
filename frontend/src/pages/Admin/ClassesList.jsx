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
import '../../components/SaisieNotes/SaisieNotes.css';
import './AdminPages.css';

const ClassesList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({ libelle: '', niveau: '', annee_scolaire: '2026-2027' });

    const { addToast } = useToast();

    useEffect(() => {
        fetchClasses();
    }, [page, searchQuery]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get(`classes/?page=${page}&search=${searchQuery}`);
            if (res.data.results) {
                setClasses(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 10));
            } else {
                setClasses(res.data);
                setTotalPages(1);
            }
        } catch (err) {
            addToast("Erreur lors du chargement des classes", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette classe ?")) return;
        try {
            await api.delete(`classes/${id}/`);
            addToast("Classe supprimée avec succès", "success");
            fetchClasses();
        } catch (err) {
            addToast("Erreur lors de la suppression", "error");
        }
    };

    const handleOpenModal = (cls = null) => {
        if (cls) {
            setEditingClass(cls);
            setFormData({ libelle: cls.libelle, niveau: cls.niveau, annee_scolaire: cls.annee_scolaire });
        } else {
            setEditingClass(null);
            setFormData({ libelle: '', niveau: '', annee_scolaire: '2026-2027' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClass) {
                await api.put(`classes/${editingClass.id}/`, formData);
                addToast("Classe modifiée avec succès", "success");
            } else {
                await api.post('classes/', formData);
                addToast("Classe créée avec succès", "success");
            }
            setShowModal(false);
            fetchClasses();
        } catch (err) {
            addToast("Erreur lors de l'enregistrement", "error");
        }
    };

    return (
        <MainLayout title="Gestion des Classes">
            <div className="admin-page-container">
                <header className="admin-page-header">
                    <div className="search-bar">
                        <MagnifyingGlassIcon className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Rechercher une classe..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <PlusIcon className="btn-icon" />
                        Nouvelle Classe
                    </button>
                </header>

                {loading ? (
                    <div className="inner-loading">
                        <div className="loading-spinner"></div>
                        <span>Chargement des classes...</span>
                    </div>
                ) : classes.length === 0 ? (
                    <div className="empty-state">
                        <AcademicCapIcon className="empty-icon" />
                        <p>Aucune classe trouvée.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-card">
                            <table className="grade-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Libellé</th>
                                        <th>Niveau</th>
                                        <th>Année Scolaire</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map(c => (
                                        <tr key={c.id} className="grade-table__row">
                                            <td className="grade-table__cell font-mono">#{c.id}</td>
                                            <td className="grade-table__cell font-bold">{c.libelle}</td>
                                            <td className="grade-table__cell">{c.niveau}</td>
                                            <td className="grade-table__cell">
                                                <span className="badge-year">{c.annee_scolaire}</span>
                                            </td>
                                            <td className="grade-table__cell text-right">
                                                <div className="row-actions">
                                                    <button className="action-btn edit" onClick={() => handleOpenModal(c)}>
                                                        <PencilSquareIcon className="action-icon" />
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDelete(c.id)}>
                                                        <TrashIcon className="action-icon" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination 
                            currentPage={page} 
                            totalPages={totalPages} 
                            onPageChange={(p) => setPage(p)} 
                        />
                    </>
                )}
            </div>

            {/* Modal - Basic Implementation */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingClass ? 'Modifier la Classe' : 'Ajouter une Classe'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <XMarkIcon className="action-icon" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label className="form-group__label">Libellé</label>
                                <input 
                                    className="form-group__input" 
                                    type="text" 
                                    value={formData.libelle}
                                    onChange={(e) => setFormData({...formData, libelle: e.target.value})}
                                    required
                                    placeholder="ex: 6ème A"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Niveau</label>
                                <input 
                                    className="form-group__input" 
                                    type="text" 
                                    value={formData.niveau}
                                    onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                                    required
                                    placeholder="ex: 6ème"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Année Scolaire</label>
                                <input 
                                    className="form-group__input" 
                                    type="text" 
                                    value={formData.annee_scolaire}
                                    onChange={(e) => setFormData({...formData, annee_scolaire: e.target.value})}
                                    required
                                    placeholder="ex: 2026-2027"
                                />
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


export default ClassesList;
