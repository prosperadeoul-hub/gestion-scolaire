import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../components/Layout/MainLayout';
import Pagination from '../../components/Pagination/Pagination';
import { useToast } from '../../context/ToastContext';
import { 
  DocumentChartBarIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  AcademicCapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import '../../components/SaisieNotes/SaisieNotes.css';
import './AdminPages.css';

const NotesList = () => {
    const [notes, setNotes] = useState([]);
    const [etudiants, setEtudiants] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ valeur: '', type_eval: 'DEVOIR', etudiant: '', matiere: '' });

    const { addToast } = useToast();

    useEffect(() => {
        fetchNotes();
    }, [page, searchQuery]);

    useEffect(() => {
        const fetchData = async () => {
            const resEtudiants = await api.get('etudiants/');
            const resMatieres = await api.get('matieres/');
            setEtudiants(resEtudiants.data.results || resEtudiants.data);
            setMatieres(resMatieres.data.results || resMatieres.data);
        };
        fetchData();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await api.get(`notes/?page=${page}&search=${searchQuery}`);
            if (res.data.results) {
                setNotes(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 10));
            } else {
                setNotes(res.data);
                setTotalPages(1);
            }
        } catch (err) {
            addToast("Erreur lors du chargement des notes", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette note ?")) return;
        try {
            await api.delete(`notes/${id}/`);
            addToast("Note supprimée avec succès", "success");
            fetchNotes();
        } catch (err) {
            addToast("Erreur lors de la suppression", "error");
        }
    };

    const handleOpenModal = (n = null) => {
        if (n) {
            setEditingNote(n);
            setFormData({ 
                valeur: n.valeur, 
                type_eval: n.type_eval, 
                etudiant: n.etudiant, 
                matiere: n.matiere 
            });
        } else {
            setEditingNote(null);
            setFormData({ valeur: '', type_eval: 'DEVOIR', etudiant: '', matiere: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNote) {
                await api.put(`notes/${editingNote.id}/`, formData);
                addToast("Note modifiée avec succès", "success");
            } else {
                await api.post('notes/', formData);
                addToast("Note enregistrée avec succès", "success");
            }
            setShowModal(false);
            fetchNotes();
        } catch (err) {
            addToast("Erreur lors de l'enregistrement", "error");
        }
    };

    // Grouping logic: Classe > Matière
    const groupedNotes = notes.reduce((acc, note) => {
        const className = note.classe_libelle || "Classe Inconnue";
        const subjectName = note.matiere_name || "Matière Inconnue";
        
        if (!acc[className]) acc[className] = {};
        if (!acc[className][subjectName]) acc[className][subjectName] = [];
        
        acc[className][subjectName].push(note);
        return acc;
    }, {});

    return (
        <MainLayout title="Gestion des Notes & Bulletins">
            <div className="admin-page-container">
                <header className="admin-page-header">
                    <div className="search-bar">
                        <MagnifyingGlassIcon className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Rechercher par étudiant ou matière..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <PlusIcon className="btn-icon" />
                        Nouvelle Note
                    </button>
                </header>

                {loading ? (
                    <div className="inner-loading">
                        <div className="loading-spinner"></div>
                        <span>Chargement des notes...</span>
                    </div>
                ) : Object.keys(groupedNotes).length === 0 ? (
                    <div className="empty-state">
                        <DocumentChartBarIcon className="empty-icon" />
                        <p>Aucune note trouvée.</p>
                    </div>
                ) : (
                    <>
                        <div className="grouped-notes-list">
                            {Object.entries(groupedNotes).map(([className, subjects]) => (
                                <div key={className} className="class-section-group">
                                    <div className="class-section-header">
                                        <AcademicCapIcon className="section-icon" />
                                        <h2>Classe : {className}</h2>
                                    </div>
                                    
                                    {Object.entries(subjects).map(([subjectName, subjectNotes]) => (
                                        <div key={subjectName} className="subject-item-section">
                                            <div className="subject-item-header">
                                                <BookOpenIcon className="subject-icon-sm" />
                                                <h3>{subjectName}</h3>
                                                <span className="count-badge">{subjectNotes.length} Évaluation(s)</span>
                                            </div>

                                            <div className="table-card table-card--nested">
                                                <table className="grade-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Étudiant</th>
                                                            <th>Note</th>
                                                            <th>Type</th>
                                                            <th>Date</th>
                                                            <th className="text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {subjectNotes.map(n => (
                                                            <tr key={n.id} className="grade-table__row">
                                                                <td className="grade-table__cell">
                                                                    <span className="font-bold">{n.etudiant_name || "N/A"}</span>
                                                                </td>
                                                                <td className="grade-table__cell">
                                                                    <div className={`grade-badge ${n.valeur >= 10 ? 'success' : 'error'}`}>
                                                                        {n.valeur !== null ? n.valeur.toFixed(2) : "ABS"}
                                                                    </div>
                                                                </td>
                                                                <td className="grade-table__cell">
                                                                    <span className="text-xs uppercase font-bold tracking-widest opacity-60">
                                                                        {n.type_eval}
                                                                    </span>
                                                                </td>
                                                                <td className="grade-table__cell opacity-70">
                                                                    {n.date_saisie ? new Date(n.date_saisie).toLocaleDateString() : "-"}
                                                                </td>
                                                                <td className="grade-table__cell text-right">
                                                                    <div className="row-actions">
                                                                        <button className="action-btn edit" onClick={() => handleOpenModal(n)}>
                                                                            <PencilSquareIcon className="action-icon" />
                                                                        </button>
                                                                        <button className="action-btn delete" onClick={() => handleDelete(n.id)}>
                                                                            <TrashIcon className="action-icon" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
                    </>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingNote ? 'Modifier la Note' : 'Ajouter une Note'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <XMarkIcon className="action-icon" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label className="form-group__label">Matière</label>
                                <select 
                                    className="form-group__select"
                                    value={formData.matiere}
                                    onChange={(e) => setFormData({...formData, matiere: e.target.value})}
                                    required
                                >
                                    <option value="">Sélectionner une matière</option>
                                    {matieres.map(m => (
                                        <option key={m.id} value={m.id}>{m.nom} ({m.classe_libelle})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Étudiant</label>
                                <select 
                                    className="form-group__select"
                                    value={formData.etudiant}
                                    onChange={(e) => setFormData({...formData, etudiant: e.target.value})}
                                    required
                                >
                                    <option value="">Sélectionner un étudiant</option>
                                    {etudiants.map(e => (
                                        <option key={e.matricule} value={e.matricule}>{e.user?.last_name} {e.user?.first_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Valeur (0-20)</label>
                                <input 
                                    className="form-group__input" 
                                    type="number" 
                                    step="0.25"
                                    min="0"
                                    max="20"
                                    value={formData.valeur}
                                    onChange={(e) => setFormData({...formData, valeur: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-group__label">Type Evaluation</label>
                                <select 
                                    className="form-group__select"
                                    value={formData.type_eval}
                                    onChange={(e) => setFormData({...formData, type_eval: e.target.value})}
                                >
                                    <option value="DEVOIR">Devoir</option>
                                    <option value="EXAMEN">Examen</option>
                                </select>
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

export default NotesList;
