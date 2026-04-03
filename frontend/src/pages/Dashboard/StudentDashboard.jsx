import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import MainLayout from '../../components/Layout/MainLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ classAvg: 0, studentAvg: 0, rank: 'N/A' });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        const resStats = await api.get('stats/student/');
        setStats({
          classAvg: resStats.data.class_average || 0,
          studentAvg: resStats.data.student_average || 0,
          rank: resStats.data.student_rank || 'N/A'
        });
        setChartData(resStats.data.subject_performance || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentStats();
  }, []);

  if (loading) {
    return (
      <MainLayout title="Espace Élève">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Mon Espace Élève">
      <section className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card__icon-wrapper users">
            <AcademicCapIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.studentAvg}</span>
            <span className="stat-card__label">Ma Moyenne</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card__icon-wrapper teachers">
            <BookOpenIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.classAvg}</span>
            <span className="stat-card__label">Moyenne de Classe</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon-wrapper classes">
            <ArrowTrendingUpIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.rank}</span>
            <span className="stat-card__label">Mon Rang</span>
          </div>
        </div>
      </section>

      <section className="dashboard-charts">
        <div className="chart-card chart-card--wide">
          <div className="chart-card__header">
            <h3>Mes Résultats par Matière</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} dy={8} />
                <YAxis domain={[0, 20]} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#F8F9FA'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="grade" fill="#0984E3" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default StudentDashboard;
