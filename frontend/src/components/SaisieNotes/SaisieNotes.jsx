import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import MainLayout from '../Layout/MainLayout';
import api from '../../services/api';
import { 
  ClipboardDocumentCheckIcon, 
  HashtagIcon, 
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import './SaisieNotes.css';

const SaisieNotes = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  
  const [notes, setNotes] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initial Load: Classes et Matières
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resClasses = await api.get('classes/');
        const resMatieres = await api.get('matieres/');
        setClasses(resClasses.data.results || resClasses.data);
        setMatieres(resMatieres.data.results || resMatieres.data);
      } catch (err) {
        console.error("Erreur API lors du chargement initial", err);
        addToast("Erreur lors du chargement des données", "error");
      }
    };
    fetchData();
  }, []);

  // 2. Load Eleves & Existing notes
  useEffect(() => {
    const fetchEtudiantsEtNotes = async () => {
      if (!selectedClasse) {
        setEtudiants([]);
        return;
      }
      
      try {
        setLoading(true);
        const resEtudiants = await api.get(`etudiants/?classe=${selectedClasse}`);
        let filteredEtudiants = resEtudiants.data.results || resEtudiants.data;
        setEtudiants(filteredEtudiants);
        
        if (selectedClasse && selectedMatiere) {
          const resNotes = await api.get(`notes/?classe=${selectedClasse}&matiere=${selectedMatiere}`);
          let notesExistantes = resNotes.data.results || resNotes.data;
          
          let dictNotes = {};
          notesExistantes.forEach(n => {
            dictNotes[n.etudiant] = n.valeur !== null ? n.valeur : '';
          });
          setNotes(dictNotes);
        } else {
          setNotes({});
        }
        setErrors({});
      } catch (err) {
        console.error("Erreur de chargement", err);
        addToast("Erreur lors de la récupération des élèves", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEtudiantsEtNotes();
  }, [selectedClasse, selectedMatiere]);

  const handleNoteChange = (matricule, value) => {
    const valString = value.replace(',', '.');
    if (value === "") {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[matricule];
            return newErrors;
        });
        setNotes(prev => ({ ...prev, [matricule]: "" }));
        return;
    }

    const numValue = parseFloat(valString);
    let newErrors = { ...errors };

    if (isNaN(numValue) || numValue < 0 || numValue > 20) {
      newErrors[matricule] = true;
    } else {
      delete newErrors[matricule];
    }

    setErrors(newErrors);
    setNotes(prev => ({ ...prev, [matricule]: valString }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      addToast("Veuillez corriger les notes invalides avant d'enregistrer.", "error");
      return;
    }

    const notesPayload = etudiants.map(etudiant => ({
      etudiant: etudiant.matricule,
      valeur: notes[etudiant.matricule] !== undefined && notes[etudiant.matricule] !== "" 
               ? notes[etudiant.matricule] 
               : null
    }));

    try {
      setLoading(true);
      await api.post('notes/bulk_saisie/', {
        matiere_id: selectedMatiere,
        notes: notesPayload
      });
      addToast("Les notes ont été enregistrées avec succès !", "success");
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de l'enregistrement des notes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredEtudiants = etudiants.filter(e => 
    `${e.user?.first_name} ${e.user?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Saisie des Notes">
      <div className="saisie-notes-container">
        <section className="saisie-notes__filters">
          <div className="form-group">
            <label className="form-group__label">Classe</label>
            <div className="input-with-icon">
              <select 
                className="form-group__select"
                value={selectedClasse} 
                onChange={e => setSelectedClasse(e.target.value)}
              >
                <option value="">Choisir une classe</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.libelle}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-group__label">Matière</label>
            <div className="input-with-icon">
              <select 
                className="form-group__select"
                value={selectedMatiere} 
                onChange={e => setSelectedMatiere(e.target.value)}
              >
                <option value="">Choisir une matière</option>
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>
          </div>

          {(selectedClasse && selectedMatiere) && (
            <div className="form-group search-filter">
              <label className="form-group__label">Rechercher un étudiant</label>
              <div className="input-with-icon">
                <MagnifyingGlassIcon className="input-icon left" />
                <input 
                  type="text" 
                  placeholder="Nom ou Matricule..." 
                  className="form-group__input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </section>

        {selectedClasse && selectedMatiere ? (
          <section className="saisie-notes__content">
            {loading ? (
              <div className="inner-loading">
                <div className="loading-spinner"></div>
                <span>Traitement en cours...</span>
              </div>
            ) : etudiants.length === 0 ? (
              <div className="empty-state">
                <InformationCircleIcon className="empty-icon" />
                <p>Aucun étudiant trouvé dans cette classe.</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="saisie-notes__form">
                <div className="table-card">
                  <table className="grade-table">
                    <thead>
                      <tr>
                        <th>Matricule</th>
                        <th>Étudiant</th>
                        <th>Note (/20)</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEtudiants.map(etudiant => (
                        <tr key={etudiant.matricule} className="grade-table__row">
                          <td className="grade-table__cell font-mono">{etudiant.matricule}</td>
                          <td className="grade-table__cell">
                            <div className="student-name">
                              {etudiant.user?.last_name} {etudiant.user?.first_name}
                            </div>
                          </td>
                          <td className="grade-table__cell">
                            <div className="input-with-icon mini">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                max="20"
                                className={`grade-input ${errors[etudiant.matricule] ? 'grade-input--error' : ''}`}
                                value={notes[etudiant.matricule] || ''}
                                onChange={e => handleNoteChange(etudiant.matricule, e.target.value)}
                                placeholder="--"
                              />
                              <HashtagIcon className="input-icon right" />
                            </div>
                          </td>
                          <td className="grade-table__cell text-right">
                             <div className="row-actions">
                                <button type="button" className="action-btn edit" title="Modifier le profil">
                                   <PencilSquareIcon className="action-icon" />
                                </button>
                                <button type="button" className="action-btn delete" title="Supprimer">
                                   <TrashIcon className="action-icon" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="saisie-notes__actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <ClipboardDocumentCheckIcon className="btn-icon" />
                    Enregistrer les Notes
                  </button>
                </div>
              </form>
            )}
          </section>
        ) : (
          <div className="selection-prompt">
             <InformationCircleIcon className="prompt-icon" />
             <h3>Sélectionnez une classe et une matière pour commencer la saisie.</h3>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SaisieNotes;
