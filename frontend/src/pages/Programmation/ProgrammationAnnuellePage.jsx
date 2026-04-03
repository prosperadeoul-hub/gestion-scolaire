import React, { useState } from 'react';
import api from '../../services/api';
import { PlusIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import MainLayout from '../../components/Layout/MainLayout';
import './Programmation.css';

const ProgrammationAnnuellePage = () => {
  // Infos de base de la Promotion
  const [promoInfos, setPromoInfos] = useState({
    libelle: '',
    annee_universitaire: '',
    filiere_id: 1, // Par défaut
  });

  // UEs du Semestre 1 et 2
  const [uesSemestre1, setUesSemestre1] = useState([{ id: Date.now(), nom: '', code: '', ects: 6 }]);
  const [uesSemestre2, setUesSemestre2] = useState([{ id: Date.now() + 1, nom: '', code: '', ects: 6 }]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Gestion des infos de base
  const handlePromoChange = (e) => {
    const { name, value } = e.target;
    setPromoInfos(prev => ({ ...prev, [name]: value }));
  };

  // Ajouter une UE
  const addUE = (semestre) => {
    const newUE = { id: Date.now(), nom: '', code: '', ects: 6 };
    if (semestre === 1) {
      setUesSemestre1([...uesSemestre1, newUE]);
    } else {
      setUesSemestre2([...uesSemestre2, newUE]);
    }
  };

  // Supprimer une UE
  const removeUE = (semestre, id) => {
    if (semestre === 1) {
      setUesSemestre1(uesSemestre1.filter(ue => ue.id !== id));
    } else {
      setUesSemestre2(uesSemestre2.filter(ue => ue.id !== id));
    }
  };

  // Modifier une UE
  const handleUEChange = (semestre, id, field, value) => {
    const setter = semestre === 1 ? setUesSemestre1 : setUesSemestre2;
    const currentList = semestre === 1 ? uesSemestre1 : uesSemestre2;
    
    setter(currentList.map(ue => {
      if (ue.id === id) {
        return { ...ue, [field]: value };
      }
      return ue;
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Combiner tous les modules avec leur semestre respectif
      const allModules = [
        ...uesSemestre1.map(ue => ({ ...ue, semestre: 1 })),
        ...uesSemestre2.map(ue => ({ ...ue, semestre: 2 }))
      ].map(({ id, ...rest }) => ({
        ...rest,
        credits_ects: parseInt(rest.ects) || 0
      }));

      const payload = {
        ...promoInfos,
        modules: allModules
      };

      const response = await api.post('promotions/', payload);
      setMessage('Programmation annuelle créée avec succès !');
      
      // Réinitialisation des champs
      setPromoInfos({ libelle: '', annee_universitaire: '', filiere_id: 1 });
      setUesSemestre1([{ id: Date.now(), nom: '', code: '', ects: 6 }]);
      setUesSemestre2([{ id: Date.now() + 1, nom: '', code: '', ects: 6 }]);
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la création du programme.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Programmation Annuelle">
      <div className="prog-container">
        <header className="prog-header">
          <h1>Programmation Annuelle</h1>
          <p>Définissez la structure académique complète de la promotion (Semestre 1 & 2).</p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Section Informations Globales */}
          <section className="info-section">
            <div className="input-group">
              <label>Libellé de la Promotion</label>
              <input
                type="text"
                name="libelle"
                placeholder="ex: Licence 1 Génie Logiciel"
                value={promoInfos.libelle}
                onChange={handlePromoChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Année Universitaire</label>
              <input
                type="text"
                name="annee_universitaire"
                placeholder="ex: 2025-2026"
                value={promoInfos.annee_universitaire}
                onChange={handlePromoChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Identifiant Filière</label>
              <input
                type="number"
                name="filiere_id"
                value={promoInfos.filiere_id}
                onChange={handlePromoChange}
                required
              />
            </div>
          </section>

          {/* Section Semestres */}
          <div className="semesters-grid">
            {/* SEMESTRE 1 */}
            <div className="semester-card">
              <div className="semester-title">Semestre 1</div>
              <div className="ue-list">
                {uesSemestre1.map((ue) => (
                  <div key={ue.id} className="ue-row">
                    <div className="ue-input-nom">
                      <input
                        type="text"
                        placeholder="Nom de l'UE"
                        value={ue.nom}
                        onChange={(e) => handleUEChange(1, ue.id, 'nom', e.target.value)}
                        required
                      />
                    </div>
                    <div className="ue-input-code">
                      <input
                        type="text"
                        placeholder="Code (ex: GL101)"
                        value={ue.code}
                        onChange={(e) => handleUEChange(1, ue.id, 'code', e.target.value)}
                        required
                      />
                    </div>
                    <div className="ue-input-ects">
                      <input
                        type="number"
                        placeholder="ECTS"
                        value={ue.ects}
                        onChange={(e) => handleUEChange(1, ue.id, 'ects', e.target.value)}
                        required
                      />
                    </div>
                    <button type="button" className="btn-remove" onClick={() => removeUE(1, ue.id)}>
                      <TrashIcon className="icon" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-add" onClick={() => addUE(1)}>
                <PlusIcon className="icon" /> Ajouter une Unité d'Enseignement
              </button>
            </div>

            {/* SEMESTRE 2 */}
            <div className="semester-card">
              <div className="semester-title">Semestre 2</div>
              <div className="ue-list">
                {uesSemestre2.map((ue) => (
                  <div key={ue.id} className="ue-row">
                    <div className="ue-input-nom">
                      <input
                        type="text"
                        placeholder="Nom de l'UE"
                        value={ue.nom}
                        onChange={(e) => handleUEChange(2, ue.id, 'nom', e.target.value)}
                        required
                      />
                    </div>
                    <div className="ue-input-code">
                      <input
                        type="text"
                        placeholder="Code (ex: GL201)"
                        value={ue.code}
                        onChange={(e) => handleUEChange(2, ue.id, 'code', e.target.value)}
                        required
                      />
                    </div>
                    <div className="ue-input-ects">
                      <input
                        type="number"
                        placeholder="ECTS"
                        value={ue.ects}
                        onChange={(e) => handleUEChange(2, ue.id, 'ects', e.target.value)}
                        required
                      />
                    </div>
                    <button type="button" className="btn-remove" onClick={() => removeUE(2, ue.id)}>
                      <TrashIcon className="icon" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-add" onClick={() => addUE(2)}>
                <PlusIcon className="icon" /> Ajouter une Unité d'Enseignement
              </button>
            </div>
          </div>

          {/* Global Footer / Actions */}
          <div className="submit-section">
            {message && <div className={`message-banner ${message.includes('succès') ? 'success' : 'error'}`}>{message}</div>}
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Enregistrement...' : (
                <>
                  <CheckCircleIcon className="icon" />
                  Enregistrer le Programme Complet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ProgrammationAnnuellePage;
