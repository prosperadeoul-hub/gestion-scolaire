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

const COLORS = ['#0984E3', '#00B894', '#FDCB6E', '#E17055', '#6C5CE7', '#81ECEC'];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ pupils: 0, teachers: 0, modules: 0 });
  const [chartData, setChartData] = useState({ 
    roles: [], 
    promotions: [], 
    student_distribution: [],
    top_promotions: [], 
    teacher_load: [] 
  });
  const [recentData, setRecentData] = useState({ students: [], notes: [], modules: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const resUs = await api.get('users/');
        const resStats = await api.get('stats/dashboard/');
        
        // Utiliser les stats du backend plutôt que compter côté frontend
        const roleStats = resStats.data.role_distribution || [];
        const studentsCount = roleStats.find(r => r.name === 'STUDENT')?.value || 0;
        const teachersCount = roleStats.find(r => r.name === 'TEACHER')?.value || 0;

        setStats({
          pupils: studentsCount,
          teachers: teachersCount,
          modules: resStats.data.modules_count || 0
        });

        setChartData({
          roles: resStats.data.role_distribution || [],
          promotions: resStats.data.promotion_data || [],
          student_distribution: resStats.data.student_distribution || [],
          top_promotions: resStats.data.top_promotions || [],
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
            <h3>Effectifs par Promotion</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData.student_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                    >
                        {chartData.student_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} cornerRadius={4} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Legend iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="dashboard-charts">
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

        <div className="chart-card">
            <div className="chart-card__header">
                <h3>Top Performances Promotions</h3>
            </div>
            <div className="performance-list">
                {chartData.top_promotions.map((p, i) => (
                    <div key={i} className="perf-item">
                        <div className="perf-item__rank">{i+1}</div>
                        <div className="perf-item__info">
                            <span className="perf-item__name">{p.name}</span>
                            <div className="perf-item__bar-bg">
                                <div className="perf-item__bar-fill" style={{ width: `${(p.avg/20)*100}%` }}></div>
                            </div>
                        </div>
                        <div className="perf-item__val">{p.avg}/20</div>
                    </div>
                ))}
                {chartData.top_promotions.length === 0 && (
                    <p className="text-muted text-center py-4">Aucune donnée de performance disponible.</p>
                )}
            </div>
        </div>
      </section>

      <section className="dashboard-charts">
         <div className="chart-card">
            <div className="chart-card__header">
                <h3>Charge Enseignante (Modules assignés)</h3>
            </div>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.teacher_load} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                        <Bar dataKey="value" fill="#00B894" radius={[0, 4, 4, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </section>

      <section className="dashboard-recent">
         <div className="recent-card">
            <div className="recent-card__header">
               <h3>Dernières Notes ({recentData.notes ? recentData.notes.length : 0})</h3>
            </div>
            <div className="recent-table-wrapper">
               <table className="recent-table">
                  <thead>
                     <tr>
                        <th>Étudiant</th>
                        <th>Matière</th>
                        <th>Note</th>
                        <th>Date</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentData.notes && recentData.notes.slice(0, 5).map(n => (
                        <tr key={n.id}>
                           <td>{n.etudiant_name}</td>
                           <td>{n.matiere_name}</td>
                           <td className={n.valeur >= 10 ? 'text-success' : 'text-danger'}>
                              {n.valeur !== null ? `${n.valeur}/20` : '--'}
                           </td>
                           <td>{new Date(n.date_saisie).toLocaleDateString('fr-FR')}</td>
                        </tr>
                     ))}
                     {(!recentData.notes || recentData.notes.length === 0) && (
                        <tr><td colSpan="4" className="text-muted">Aucune note récente.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="recent-card">
            <div className="recent-card__header">
               <h3>Nouveaux Étudiants ({recentData.students ? recentData.students.length : 0})</h3>
            </div>
            <div className="recent-table-wrapper">
               <table className="recent-table">
                  <thead>
                     <tr>
                        <th>Matricule</th>
                        <th>Nom</th>
                        <th>Promotion</th>
                        <th>Inscrit</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentData.students && recentData.students.slice(0, 5).map(s => (
                        <tr key={s.matricule}>
                           <td>{s.matricule}</td>
                           <td>{s.user.last_name} {s.user.first_name}</td>
                           <td>{s.promotion_libelle}</td>
                           <td>{s.user?.date_joined ? new Date(s.user.date_joined).toLocaleDateString('fr-FR') : '--'}</td>
                        </tr>
                     ))}
                     {(!recentData.students || recentData.students.length === 0) && (
                        <tr><td colSpan="4" className="text-muted">Aucun étudiant inscrit.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="recent-card">
            <div className="recent-card__header">
               <h3>Derniers Modules ({recentData.modules ? recentData.modules.length : 0})</h3>
            </div>
            <div className="recent-table-wrapper">
               <table className="recent-table">
                  <thead>
                     <tr>
                        <th>Code</th>
                        <th>Nom</th>
                        <th>Promotion</th>
                        <th>ECTS</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentData.modules && recentData.modules.slice(0, 5).map(m => (
                        <tr key={m.id}>
                           <td>{m.code}</td>
                           <td>{m.nom}</td>
                           <td className="text-secondary">{m.promotion_libelle}</td>
                           <td>{m.credits_ects}</td>
                        </tr>
                     ))}
                     {(!recentData.modules || recentData.modules.length === 0) && (
                        <tr><td colSpan="4" className="text-muted">Aucun module créé.</td></tr>
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
