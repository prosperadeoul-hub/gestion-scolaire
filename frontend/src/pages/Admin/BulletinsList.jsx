import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MainLayout from '../../components/Layout/MainLayout';
import Pagination from '../../components/Pagination/Pagination';
import { useToast } from '../../context/ToastContext';
import {
    DocumentCheckIcon,
    MagnifyingGlassIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
    IdentificationIcon,
    AcademicCapIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import '../../components/SaisieNotes/SaisieNotes.css';
import './AdminPages.css';

const BulletinsList = () => {
    const [bulletins, setBulletins] = useState([]);
    const [etudiants, setEtudiants] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // États pour génération bulletin
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [selectedEtudiant, setSelectedEtudiant] = useState('');
    const [generatingBulletin, setGeneratingBulletin] = useState(false);
    const [showBulletinModal, setShowBulletinModal] = useState(false);
    const [generatedBulletin, setGeneratedBulletin] = useState(null);

    const { addToast } = useToast();

    useEffect(() => {
        fetchBulletins();
    }, [page, searchQuery]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resPros, resEtus] = await Promise.all([
                    api.get('promotions/'),
                    api.get('etudiants/?limit=1000')
                ]);
                setPromotions(resPros.data.results || resPros.data);
                setEtudiants(resEtus.data.results || resEtus.data);
            } catch (err) {
                addToast("Erreur lors du chargement des données", "error");
            }
        };
        fetchData();
    }, []);

    const fetchBulletins = async () => {
        try {
            setLoading(true);
            const res = await api.get(`bulletins/?page=${page}&search=${searchQuery}`);
            if (res.data.results) {
                setBulletins(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 10));
            } else {
                setBulletins(res.data);
                setTotalPages(1);
            }
        } catch (err) {
            addToast("Erreur lors du chargement des bulletins", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGenererBulletin = async () => {
        if (!selectedPromotion || !selectedEtudiant) {
            addToast("Veuillez sélectionner une promotion et un étudiant", "error");
            return;
        }

        setGeneratingBulletin(true);
        try {
            const response = await api.post('notes/generer-bulletin/', {
                promotion: selectedPromotion,
                etudiant: selectedEtudiant
            });

            setGeneratedBulletin(response.data);
            setShowBulletinModal(true);
            addToast("Bulletin généré avec succès", "success");
            fetchBulletins(); // Recharger la liste
        } catch (err) {
            addToast("Erreur lors de la génération du bulletin", "error");
            console.error("Génération bulletin error:", err);
        } finally {
            setGeneratingBulletin(false);
        }
    };

    const clearFilters = () => {
        setSelectedPromotion('');
        setSelectedEtudiant('');
        setSearchQuery('');
        setPage(1);
    };

    const etudiantsFiltered = etudiants.filter(e =>
        !selectedPromotion || e.promotion === parseInt(selectedPromotion)
    );

    return (
        <MainLayout title="Gestion des Bulletins Officiels">
            <div className="admin-page-container">
                <header className="admin-page-header">
                    <div className="header-content">
                        <h1>Gestion des Bulletins Officiels</h1>
                        <div className="header-actions">
                            <button
                                className={`btn btn-primary ${generatingBulletin ? 'btn-loading' : ''}`}
                                onClick={handleGenererBulletin}
                                disabled={!selectedPromotion || !selectedEtudiant || generatingBulletin}
                            >
                                <ClipboardDocumentListIcon className="btn-icon" />
                                {generatingBulletin ? 'Génération...' : 'Générer Bulletin'}
                            </button>
                            <button className="btn btn-outline" onClick={clearFilters}>
                                <XMarkIcon className="btn-icon" />
                                Effacer Filtres
                            </button>
                        </div>
                    </div>

                    {/* Filtres avancés */}
                    <div className="filters-section">
                        <div className="filter-row">
                            <div className="search-bar">
                                <MagnifyingGlassIcon className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom étudiant..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>

                            <div className="filter-controls">
                                <select
                                    className="admin-search-select"
                                    value={selectedPromotion}
                                    onChange={(e) => {
                                        setSelectedPromotion(e.target.value);
                                        setSelectedEtudiant(''); // Reset étudiant quand promotion change
                                        setPage(1);
                                    }}
                                >
                                    <option value="">Toutes les promotions</option>
                                    {promotions.map(promotion => (
                                        <option key={promotion.id} value={promotion.id}>
                                            {promotion.libelle}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="admin-search-select"
                                    value={selectedEtudiant}
                                    onChange={(e) => {
                                        setSelectedEtudiant(e.target.value);
                                        setPage(1);
                                    }}
                                    disabled={!selectedPromotion}
                                >
                                    <option value="">
                                        {selectedPromotion ? "Sélectionner un étudiant" : "Choisir d'abord une promotion"}
                                    </option>
                                    {etudiantsFiltered.map(etudiant => (
                                        <option key={etudiant.user} value={etudiant.user}>
                                            {etudiant.matricule} - {etudiant.user_details?.first_name} {etudiant.user_details?.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="inner-loading">
                        <div className="loading-spinner"></div>
                        <span>Chargement des bulletins...</span>
                    </div>
                ) : bulletins.length === 0 ? (
                    <div className="empty-state">
                        <DocumentCheckIcon className="empty-icon" />
                        <p>Aucun bulletin généré.</p>
                        <p className="text-muted">Sélectionnez une promotion et un étudiant pour générer un bulletin officiel.</p>
                    </div>
                ) : (
                    <>
                        <div className="bulletins-list">
                            <div className="bulletins-grid">
                                {bulletins.map((bulletin, index) => (
                                    <div key={index} className="bulletin-card">
                                        <div className="bulletin-card__header">
                                            <div className="bulletin-card__status">
                                                <CheckCircleIcon className="status-icon status--success" />
                                                <span className="status-text">Validé</span>
                                            </div>
                                            <div className="bulletin-card__date">
                                                <CalendarIcon className="date-icon" />
                                                {new Date(bulletin.date_generation || Date.now()).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>

                                        <div className="bulletin-card__content">
                                            <div className="student-info">
                                                <IdentificationIcon className="student-icon" />
                                                <div>
                                                    <div className="student-name">
                                                        {bulletin.etudiant_nom || 'Nom étudiant'}
                                                    </div>
                                                    <div className="student-matricule">
                                                        #{bulletin.etudiant_matricule || 'XXXXXX'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="promotion-info">
                                                <AcademicCapIcon className="promotion-icon" />
                                                <span>{bulletin.promotion_libelle || 'Promotion'}</span>
                                            </div>

                                            <div className="grades-summary">
                                                <div className="grade-item">
                                                    <span className="grade-label">Moyenne Générale:</span>
                                                    <span className="grade-value">{bulletin.moyenne_generale?.toFixed(2) || 'N/A'}/20</span>
                                                </div>
                                                <div className="grade-item">
                                                    <span className="grade-label">ECTS Validés:</span>
                                                    <span className="grade-value">{bulletin.ects_recus || 0}/{bulletin.ects_total || 0}</span>
                                                </div>
                                                <div className="grade-item">
                                                    <span className="grade-label">Rang:</span>
                                                    <span className="grade-value">#{bulletin.rang_promotion || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>

            {/* Modal pour afficher le bulletin généré */}
            {showBulletinModal && generatedBulletin && (
                <div className="modal-overlay" onClick={() => setShowBulletinModal(false)}>
                    <div className="modal-content modal-bulletin" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Bulletin Officiel Généré</h3>
                            <button className="close-btn" onClick={() => setShowBulletinModal(false)}>
                                <XMarkIcon className="action-icon" />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="bulletin-official">
                                <div className="bulletin-header">
                                    <h2>SGS University</h2>
                                    <h3>BULLETIN OFFICIEL</h3>
                                    <p>PROMOTION {generatedBulletin.promotion_libelle}</p>
                                </div>

                                <div className="bulletin-student">
                                    <h4>Étudiant</h4>
                                    <p><strong>{generatedBulletin.etudiant_nom}</strong></p>
                                    <p>Matricule: {generatedBulletin.etudiant_matricule}</p>
                                    <p>Généré le: {new Date().toLocaleDateString('fr-FR')}</p>
                                </div>

                                <div className="bulletin-summary">
                                    <h4>Résultats Génaraux</h4>
                                    <div className="summary-grid">
                                        <div className="summary-item">
                                            <span>Moyenne Générale:</span>
                                            <strong>{generatedBulletin.moyenne_generale?.toFixed(2)}/20</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Classement:</span>
                                            <strong>#{generatedBulletin.rang_promotion}</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>ECTS Acquis:</span>
                                            <strong>{generatedBulletin.ects_recus}/{generatedBulletin.ects_total}</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Statut:</span>
                                            <strong className={generatedBulletin.ects_recus >= 36 ? 'text-success' : 'text-error'}>
                                                {generatedBulletin.ects_recus >= 36 ? 'VALIDÉ' : 'NON VALIDÉ'}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="bulletin-subjects">
                                    <h4>Détail par Matière</h4>
                                    <div className="subjects-list">
                                        {generatedBulletin.matieres?.map((matiere, idx) => (
                                            <div key={idx} className="subject-item">
                                                <div className="subject-name">
                                                    <CheckCircleIcon className="subject-icon" />
                                                    <span>{matiere.nom}</span>
                                                </div>
                                                <div className="subject-grades">
                                                    <span>{matiere.moyenne?.toFixed(2)}/20</span>
                                                    <span>{matiere.ects_obtenus}/{matiere.ects_total} ECTS</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bulletin-footer">
                                    <p><strong>Règle institutionnelle:</strong> Minimum 60% d'ECTS requis pour la validation du semestre.</p>
                                    <p><em>Ce bulletin est généré automatiquement et ne peut être modifié manuellement.</em></p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn" onClick={() => setShowBulletinModal(false)}>
                                Fermer
                            </button>
                            <button type="button" className="btn btn-primary">
                                Télécharger PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default BulletinsList;