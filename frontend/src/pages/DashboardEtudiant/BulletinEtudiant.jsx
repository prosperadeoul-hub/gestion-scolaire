import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import './BulletinEtudiant.css';
import { AuthContext } from '../../context/AuthContext';

const BulletinEtudiant = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBulletin = async () => {
      try {
        const response = await api.get('etudiants/bulletin/');
        setData(response.data);
      } catch (err) {
        console.error("Erreur de chargement du bulletin", err);
        setError("Impossible de charger votre bulletin. Vérifiez que vous êtes bien un étudiant.");
      } finally {
        setLoading(false);
      }
    };
    fetchBulletin();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="bulletin-container">Chargement de votre bulletin...</div>;
  if (error) return <div className="bulletin-container">Erreur : {error}</div>;

  const mg = data.moyenne_generale;

  return (
    <div className="bulletin-container">
      <header className="bulletin-header">
        <div>
          <h1 className="bulletin-header__title">Bulletin Officiel</h1>
          <p>{data.etudiant.first_name} {data.etudiant.last_name} ({data.etudiant.matricule})</p>
        </div>
        <div className="bulletin-header__actions">
          <button className="btn-print" onClick={handlePrint}>
            Télécharger PDF
          </button>
          <button className="btn-print" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      <section className="bulletin-card">
        <table className="bulletin-table">
          <thead>
            <tr>
              <th>Matière</th>
              <th>Coefficient</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {data.recap_matieres.map((item, index) => (
              <tr key={index} className="bulletin-table__row">
                <td><strong>{item.matiere__nom}</strong></td>
                <td>{item.matiere__coefficient}</td>
                <td>{item.moyenne !== null ? item.moyenne.toFixed(2) : '-'} / 20</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="bulletin-footer">
          <span className="bulletin-footer__text">
            Moyenne Générale : {' '}
            <span className={mg >= 10 ? 'bulletin-footer__statut--success' : 'bulletin-footer__statut--warning'}>
              {mg !== null ? mg.toFixed(2) : '-'} / 20
            </span>
          </span>
        </div>
      </section>
    </div>
  );
};

export default BulletinEtudiant;
