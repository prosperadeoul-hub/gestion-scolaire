import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import MainLayout from '../../components/Layout/MainLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  RectangleGroupIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import './Dashboard.css';

const COLORS = ['#0984E3', '#00B894', '#FDCB6E', '#E17055'];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ pupils: 0, teachers: 0, modules: 0 });
  const [chartData, setChartData] = useState({ 
    roles: [], 
    promotions: [], 
    top_classes: [], 
    teacher_load: [] 
  });
  const [recentData, setRecentData] = useState({ students: [], notes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const resCl = await api.get('classes/');
        const resUs = await api.get('users/');
        const resStats = await api.get('stats/dashboard/');
        
        let users = resUs.data.results || resUs.data;
        const teachersCount = users.filter(u => u.role === 'TEACHER').length;
        const studentsCount = users.filter(u => u.role === 'STUDENT').length;

        setStats({
          pupils: studentsCount,
          teachers: teachersCount,
          modules: resStats.data.modules_count || 0
        });

        setChartData({
          roles: resStats.data.role_distribution || [],
          promotions: resStats.data.promotion_data || [],
          top_classes: resStats.data.top_classes || [],
          teacher_load: resStats.data.teacher_load || []
        });

        if (resStats.data.recent_data) {
           setRecentData(resStats.data.recent_data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalStats();
  }, []);

  if (loading) {
    return (
      <MainLayout title="Tableau de Bord">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Tableau de Bord">
      <section className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card__icon-wrapper users">
            <UsersIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.pupils}</span>
            <span className="stat-card__label">Étudiants inscrits</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card__icon-wrapper teachers">
            <AcademicCapIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.teachers}</span>
            <span className="stat-card__label">Enseignants</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon-wrapper classes">
            <RectangleGroupIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.modules}</span>
            <span className="stat-card__label">Modules inscrits</span>
          </div>
        </div>

        <div className="stat-card stat-card--action">
          <a href="http://localhost:8000/admin" target="_blank" className="stat-card__link">
            <div className="stat-card__icon-wrapper admin">
              <Cog6ToothIcon className="stat-card__icon-svg text-white" />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__label text-white">Console Django</span>
              <span className="stat-card__sublabel text-white-muted">Administration avancée</span>
            </div>
          </a>
        </div>
      </section>

      <section className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-card__header">
            <h3>Unités d'Enseignement par Promotion</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.promotions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={8} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#F8F9FA'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#0984E3" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <h3>Répartition des Rôles</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.roles}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.roles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="dashboard-recent">
         <div className="recent-card">
            <div className="recent-card__header">
               <h3>Dernières Notes</h3>
            </div>
            <div className="recent-table-wrapper">
               <table className="recent-table">
                  <thead>
                     <tr>
                        <th>Étudiant</th>
                        <th>Matière</th>
                        <th>Note</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentData.notes.map(n => (
                        <tr key={n.id}>
                           <td>{n.etudiant_name}</td>
                           <td>{n.matiere_name}</td>
                           <td className={n.valeur >= 10 ? 'text-success' : 'text-danger'}>
                              {n.valeur !== null ? n.valeur : '--'}
                           </td>
                        </tr>
                     ))}
                     {recentData.notes.length === 0 && (
                        <tr><td colSpan="3" className="text-muted">Aucune note récente.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="recent-card">
            <div className="recent-card__header">
               <h3>Nouveaux Étudiants</h3>
            </div>
            <div className="recent-table-wrapper">
               <table className="recent-table">
                  <thead>
                     <tr>
                        <th>Matricule</th>
                        <th>Nom</th>
                        <th>Promotion</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentData.students.map(s => (
                        <tr key={s.matricule}>
                           <td>{s.matricule}</td>
                           <td>{s.user.last_name} {s.user.first_name}</td>
                           <td>{s.promotion_libelle}</td>
                        </tr>
                     ))}
                     {recentData.students.length === 0 && (
                        <tr><td colSpan="3" className="text-muted">Aucun étudiant inscrit.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="recent-card">
            <div className="recent-card__header">
               <h3>Derniers Modules (UE)</h3>
            </div>
            <div className="recent-table-wrapper">
               <table className="recent-table">
                  <thead>
                     <tr>
                        <th>Code</th>
                        <th>Nom</th>
                        <th>ECTS</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentData.modules && recentData.modules.map(m => (
                        <tr key={m.id}>
                           <td>{m.code}</td>
                           <td>{m.nom}</td>
                           <td>{m.credits_ects}</td>
                        </tr>
                     ))}
                     {(!recentData.modules || recentData.modules.length === 0) && (
                        <tr><td colSpan="3" className="text-muted">Aucun module créé.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </section>
    </MainLayout>
  );
};

export default AdminDashboard;
