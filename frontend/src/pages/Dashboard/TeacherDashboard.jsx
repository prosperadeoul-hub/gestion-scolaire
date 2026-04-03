import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import MainLayout from '../../components/Layout/MainLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  ClipboardDocumentCheckIcon, 
  CalendarIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import './Dashboard.css';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ classesCount: 0, studentsCount: 0, avgGrade: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherStats = async () => {
      try {
        const resStats = await api.get('stats/teacher/');
        setStats({
          classesCount: resStats.data.total_classes || 0,
          studentsCount: resStats.data.total_students || 0,
          avgGrade: resStats.data.average_grade ? resStats.data.average_grade.toFixed(1) : 'N/A'
        });
        setChartData(resStats.data.class_performance || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherStats();
  }, []);

  if (loading) {
    return (
      <MainLayout title="Espace Enseignant">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Espace Enseignant">
      <section className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card__icon-wrapper classes">
            <ClipboardDocumentCheckIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.classesCount}</span>
            <span className="stat-card__label">Mes Classes</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card__icon-wrapper users">
            <UserGroupIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.studentsCount}</span>
            <span className="stat-card__label">Mes Élèves</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon-wrapper teachers">
            <CalendarIcon className="stat-card__icon-svg" />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.avgGrade}</span>
            <span className="stat-card__label">Moyenne Générale</span>
          </div>
        </div>
      </section>

      <section className="dashboard-charts">
        <div className="chart-card chart-card--wide">
          <div className="chart-card__header">
            <h3>Performance par Classe</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={8} />
                <YAxis domain={[0, 20]} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#F8F9FA'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="avg" fill="#0984E3" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default TeacherDashboard;
