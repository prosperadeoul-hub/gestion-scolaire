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
  BookOpenIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import '../../components/SaisieNotes/SaisieNotes.css';
import './AdminPages.css';

const ModulesList = () => {
    const [modules, setModules] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [formData, setFormData] = useState({ code: '', nom: '', credits_ects: 6, enseignant: '', promotion: '', semestre: 1 });

    const { addToast } = useToast();

    useEffect(() => {
        fetchModules();
    }, [page, searchQuery]);

    useEffect(() => {
        // Fetch promotions and teachers for dropdowns
        const fetchData = async () => {
            try {
                const resProm = await api.get('promotions/');
                const resTeachers = await api.get('users/?role=TEACHER');
                setPromotions(resProm.data.results || resProm.data);
                setTeachers(resTeachers.data.results || resTeachers.data);
            } catch (err) {
                console.error("Error fetching dependencies", err);
            }
        };
        fetchData();
    }, []);

    const fetchModules = async () => {
        try {
            setLoading(true);
            const res = await api.get(`modules/?page=${page}&search=${searchQuery}`);
            if (res.data.results) {
                setModules(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 10));
            } else {
                setModules(res.data);
                setTotalPages(1);
            }
        } catch (err) {
            addToast("Erreur lors du chargement des modules", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce module ?")) return;
        try {
            await api.delete(`modules/${id}/`);
            addToast("Module supprimé avec succès", "success");
            fetchModules();
        } catch (err) {
            addToast("Erreur lors de la suppression", "error");
        }
    };

    const handleOpenModal = (m = null) => {
        if (m) {
            setEditingModule(m);
            setFormData({ 
                code: m.code, 
                nom: m.nom, 
                credits_ects: m.credits_ects, 
                enseignant: m.enseignant || '', 
                promotion: m.promotion || '',
                semestre: m.semestre || 1
            });
        } else {
            setEditingModule(null);
            setFormData({ code: '', nom: '', credits_ects: 6, enseignant: '', promotion: '', semestre: 1 });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingModule) {
                await api.put(`modules/${editingModule.id}/`, formData);
                addToast("Module modifié avec succès", "success");
            } else {
                await api.post('modules/', formData);
                addToast("Module créé avec succès", "success");
            }
            setShowModal(false);
            fetchModules();
        } catch (err) {
            addToast("Erreur lors de l'enregistrement", "error");
        }
    };

    return (
        <MainLayout title="Gestion des Modules">
            <div className="admin-page-container">
                <header className="admin-page-header">
                    <div className="search-bar">
                        <MagnifyingGlassIcon className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un module..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <PlusIcon className="btn-icon" />
                        Nouveau Module
                    </button>
                </header>

                {loading ? (
                    <div className="inner-loading">
                        <div className="loading-spinner"></div>
                        <span>Chargement des modules...</span>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="empty-state">
                        <BookOpenIcon className="empty-icon" />
                        <p>Aucun module trouvé.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-card">
                            <table className="grade-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Nom</th>
                                        <th>ECTS</th>
                                        <th>Promotion</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modules.map(m => (
                                        <tr key={m.id} className="grade-table__row">
                                            <td className="grade-table__cell font-mono">{m.code}</td>
                                            <td className="grade-table__cell font-bold">{m.nom}</td>
                                            <td className="grade-table__cell">{m.credits_ects}</td>
                                            <td className="grade-table__cell">
                                                <span className="badge-class">{m.promotion_libelle || "N/A"}</span>
                                            </td>
                                            <td className="grade-table__cell text-right">
                                                <div className="row-actions">
                                                    <button className="action-btn edit" onClick={() => handleOpenModal(m)}>
                                                        <PencilSquareIcon className="action-icon" />
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDelete(m.id)}>
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

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingModule ? 'Modifier le Module' : 'Ajouter un Module'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <XMarkIcon className="action-icon" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label className="form-group__label">Code Module</label>
                                <input 
                                    className="form-group__input" 
                                    type="text" 
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    required
                                    placeholder="ex: GL101"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Nom du Module</label>
                                <input 
                                    className="form-group__input" 
                                    type="text" 
                                    value={formData.nom}
                                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                                    required
                                    placeholder="ex: Algorithmique"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Crédits ECTS</label>
                                <input 
                                    className="form-group__input" 
                                    type="number" 
                                    value={formData.credits_ects}
                                    onChange={(e) => setFormData({...formData, credits_ects: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Semestre</label>
                                <select 
                                    className="form-group__select"
                                    value={formData.semestre}
                                    onChange={(e) => setFormData({...formData, semestre: parseInt(e.target.value)})}
                                    required
                                >
                                    <option value={1}>Semestre 1</option>
                                    <option value={2}>Semestre 2</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Enseignant Responsable</label>
                                <select 
                                    className="form-group__select"
                                    value={formData.enseignant}
                                    onChange={(e) => setFormData({...formData, enseignant: e.target.value})}
                                >
                                    <option value="">Non assigné</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.last_name} {t.first_name}</option>
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
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn btn-primary">Enregistrer le Module</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default ModulesList;
