import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { BookIcon, GraduationCapIcon, CalendarIcon, SettingsIcon, CheckCircleIcon, ClockIcon, ChartIcon, BarChartIcon, TrendingUpIcon, WifiIcon, UtensilsIcon, ClipboardIcon, CreditCardIcon, PartyPopperIcon, SchoolIcon } from '../components/Icons';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formatName = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const handleAction = (action) => {
    if (action === 'settings') {
      navigate('/profile');
    } else if (action === 'courses') {
      navigate('/my-courses');
    } else if (action === 'grades') {
      navigate('/grades');
    } else if (action === 'schedule') {
      navigate('/schedule');
    } else if (action === 'meals') {
      navigate('/meals/menu');
    } else if (action === 'wallet') {
      navigate('/wallet');
    } else if (action === 'events') {
      navigate('/events');
    } else if (action === 'reservations') {
      navigate('/reservations');
    } else {
      alert(t('dashboard.featureInProgress'));
    }
  };

  const currentDate = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        {/* Header Section */}
        <header className="dashboard-header card" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              {t('dashboard.greeting')} {formatName(user?.full_name)}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {currentDate}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="avatar-circle" style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {getInitials(user?.full_name || user?.email)}
            </div>
          </div>
        </header>

        {/* Admin Quick Access */}
        {user?.role === 'admin' && (
          <div className="card admin-panel-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
            <h3 className="mb-4">{t('dashboard.adminPanel')}</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/admin/dashboard')} style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <ChartIcon size={18} />
                <span style={{ color: 'white' }}>{t('sidebar.adminDashboard')}</span>
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/academic')} style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <BarChartIcon size={18} />
                <span style={{ color: 'white' }}>{t('sidebar.academicAnalytics')}</span>
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/analytics/attendance')} style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <TrendingUpIcon size={18} />
                <span style={{ color: 'white' }}>{t('sidebar.attendanceAnalytics')}</span>
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/iot')} style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <WifiIcon size={18} />
                <span style={{ color: 'white' }}>{t('sidebar.iotDashboard')}</span>
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

          {/* Profile Summary Card */}
          <div className="card">
            <h3 className="mb-4">{user?.role === 'admin' ? t('dashboard.adminInfo') : user?.role === 'faculty' ? t('dashboard.facultyInfo') : t('dashboard.studentInfo')}</h3>
            <div className="flex flex-col gap-3">
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>{t('dashboard.emailAddress')}</span>
                <span style={{ fontWeight: 500 }}>{user?.email}</span>
              </div>
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>{t('dashboard.phoneNumber')}</span>
                <span style={{ fontWeight: 500 }}>{user?.phone || '-'}</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  background: user?.is_verified ? 'var(--success-bg)' : 'var(--warning-bg)',
                  color: user?.is_verified ? 'var(--success)' : 'var(--warning)',
                  fontWeight: 600
                }}>
                  {user?.is_verified ? <CheckCircleIcon size={14} /> : <ClockIcon size={14} />}
                  {user?.is_verified ? t('dashboard.accountVerified') : t('dashboard.verificationPending')}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Stats Card */}
          {user?.student && (
            <div className="card">
              <h3 className="mb-4">{t('dashboard.academicStatus')}</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>{t('dashboard.registeredDepartment')}</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                    {user.student.department?.name || t('dashboard.defaultDepartment')}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="gpa-card" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{t('dashboard.semesterGPA')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.student.gpa || '0.00'}</div>
                  </div>
                  <div className="gpa-card" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{t('dashboard.overallGPA')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{user.student.cgpa || '0.00'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="card">
            <h3 className="mb-4">{t('dashboard.quickAccess')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handleAction('courses')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <BookIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.myCourses')}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('grades')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <GraduationCapIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.gradeList')}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('schedule')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <CalendarIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.courseSchedule')}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('settings')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <SettingsIcon size={18} color="var(--text-secondary)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.accountSettings')}</span>
              </button>
            </div>
          </div>

          {/* Part 3: Meal Service Card */}
          <div className="card">
            <h3 className="mb-4">{t('dashboard.mealService')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handleAction('meals')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <UtensilsIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.mealMenu')}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/meals/reservations')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <ClipboardIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.myReservations')}</span>
              </button>
            </div>
          </div>

          {/* Part 3: Wallet & Events Card */}
          <div className="card">
            <h3 className="mb-4">{t('dashboard.campusLife')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => handleAction('wallet')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <CreditCardIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.wallet')}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('events')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <PartyPopperIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.events')}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/my-events')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <CalendarIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.myEvents')}</span>
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('reservations')} style={{ 
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                justifyContent: 'start', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <SchoolIcon size={18} color="var(--accent-color)" />
                <span style={{ color: 'var(--text-primary)' }}>{t('dashboard.classroomReservation')}</span>
              </button>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="card">
            <h3 className="mb-4">{t('dashboard.announcements')}</h3>
            <div className="flex flex-col gap-3">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div className="announcement-date-badge" style={{ minWidth: '60px', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '4px', textAlign: 'center', borderRadius: '4px' }}>
                  {language === 'en' ? 'Dec 10' : '10 Ara'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t('dashboard.announcement1Title')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('dashboard.announcement1Desc')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div className="announcement-date-badge" style={{ minWidth: '60px', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '4px', textAlign: 'center', borderRadius: '4px' }}>
                  {language === 'en' ? 'Dec 15' : '15 Ara'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t('dashboard.announcement2Title')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('dashboard.announcement2Desc')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div className="announcement-date-badge" style={{ minWidth: '60px', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '4px', textAlign: 'center', borderRadius: '4px' }}>
                  {language === 'en' ? 'Jan 05' : '05 Oca'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t('dashboard.announcement3Title')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('dashboard.announcement3Desc')}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
