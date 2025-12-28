import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import {
  HomeIcon,
  UserIcon,
  BookIcon,
  GraduationCapIcon,
  MegaphoneIcon,
  ChartIcon,
  CalendarIcon,
  EditIcon,
  UsersIcon,
  BarChartIcon,
  TrendingUpIcon,
  UtensilsIcon,
  ClipboardIcon,
  CreditCardIcon,
  PartyPopperIcon,
  BellIcon,
  SettingsIcon,
  CheckIcon,
  BuildingIcon
} from './Icons';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard')}`}>
          <HomeIcon size={20} className="sidebar-icon" />
          <span>{t('sidebar.home')}</span>
        </Link>
        <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`}>
          <UserIcon size={20} className="sidebar-icon" />
          <span>{t('sidebar.profile')}</span>
        </Link>
        {/* Derslerim - Sadece Öğrenci ve Akademisyen */}
        {(user?.role === 'student' || user?.role === 'faculty') && (
          <Link to="/my-courses" className={`sidebar-link ${isActive('/my-courses')}`}>
            <BookIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.myCourses')}</span>
          </Link>
        )}
        {/* Not Girişi - Sadece Akademisyen */}
        {user?.role === 'faculty' && (
          <Link to="/grades" className={`sidebar-link ${isActive('/grades')}`}>
            <GraduationCapIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.gradeEntry')}</span>
          </Link>
        )}

        {/* Yoklama Menüsü */}
        <div className="sidebar-section">
          {/* <div className="sidebar-section-title">YOKLAMA İŞLEMLERİ</div> */}

          {/* Yoklama Başlat - Sadece Akademisyen */}
          {user?.role === 'faculty' && (
            <Link to="/attendance/start" className={`sidebar-link ${isActive('/attendance/start')}`}>
              <MegaphoneIcon size={20} className="sidebar-icon" />
              <span>{t('sidebar.startAttendance')}</span>
            </Link>
          )}

          {/* Yoklama Raporu - Sadece Admin ve Faculty */}
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Link to="/attendance/report/11111111-aaaa-bbbb-cccc-111111111111" className={`sidebar-link ${isActive('/attendance/report/11111111-aaaa-bbbb-cccc-111111111111')}`}>
              <ChartIcon size={20} className="sidebar-icon" />
              <span>{t('sidebar.attendanceReport')}</span>
            </Link>
          )}

          {/* Yoklama Geçmişim - Sadece Öğrenci */}
          {user?.role === 'student' && (
            <Link to="/my-attendance" className={`sidebar-link ${isActive('/my-attendance')}`}>
              <CalendarIcon size={20} className="sidebar-icon" />
              <span>{t('sidebar.attendanceStatus')}</span>
            </Link>
          )}
        </div>

        {/* Ders Seçme - Sadece Öğrenci */}
        {user?.role === 'student' && (
          <Link to="/enroll-courses" className={`sidebar-link ${isActive('/enroll-courses')}`}>
            <EditIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.courseSelection')}</span>
          </Link>
        )}

        {user?.role === 'admin' && (
          <>
            <Link to="/users" className={`sidebar-link ${isActive('/users')}`}>
              <UsersIcon size={20} className="sidebar-icon" />
              <span>{t('sidebar.userManagement')}</span>
            </Link>
            <Link to="/course-assignment" className={`sidebar-link ${isActive('/course-assignment')}`}>
              <BookIcon size={20} className="sidebar-icon" />
              <span>{t('sidebar.courseAssignment')}</span>
            </Link>
            {/* Part 4: Admin Dashboard */}
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('sidebar.management')}</div>
              <Link to="/admin/dashboard" className={`sidebar-link ${isActive('/admin/dashboard')}`}>
                <ChartIcon size={20} className="sidebar-icon" />
                <span>{t('sidebar.adminDashboard')}</span>
              </Link>
              <Link to="/admin/analytics/academic" className={`sidebar-link ${isActive('/admin/analytics/academic')}`}>
                <BarChartIcon size={20} className="sidebar-icon" />
                <span>{t('sidebar.academicAnalytics')}</span>
              </Link>
              <Link to="/admin/analytics/attendance" className={`sidebar-link ${isActive('/admin/analytics/attendance')}`}>
                <TrendingUpIcon size={20} className="sidebar-icon" />
                <span>{t('sidebar.attendanceAnalytics')}</span>
              </Link>
              <Link to="/admin/analytics/meal" className={`sidebar-link ${isActive('/admin/analytics/meal')}`}>
                <UtensilsIcon size={20} className="sidebar-icon" />
                <span>{t('sidebar.mealAnalytics')}</span>
              </Link>
              <Link to="/admin/analytics/events" className={`sidebar-link ${isActive('/admin/analytics/events')}`}>
                <PartyPopperIcon size={20} className="sidebar-icon" />
                <span>{t('sidebar.eventAnalytics')}</span>
              </Link>
              <Link to="/admin/iot" className={`sidebar-link ${isActive('/admin/iot')}`}>
                <ChartIcon size={20} className="sidebar-icon" />
                <span>{t('sidebar.iotDashboard')}</span>
              </Link>
            </div>
          </>
        )}

        {/* Part 3: Meal Service */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">{t('sidebar.foodService')}</div>
          <Link to="/meals/menu" className={`sidebar-link ${isActive('/meals/menu')}`}>
            <UtensilsIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.mealMenu')}</span>
          </Link>
          <Link to="/meals/reservations" className={`sidebar-link ${isActive('/meals/reservations')}`}>
            <ClipboardIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.myReservations')}</span>
          </Link>
        </div>

        {/* Part 3: Wallet */}
        <Link to="/wallet" className={`sidebar-link ${isActive('/wallet')}`}>
          <CreditCardIcon size={20} className="sidebar-icon" />
          <span>{t('sidebar.wallet')}</span>
        </Link>

        {/* Part 3: Events */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">{t('sidebar.events')}</div>
          <Link to="/events" className={`sidebar-link ${isActive('/events')}`}>
            <PartyPopperIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.eventsList')}</span>
          </Link>
          <Link to="/my-events" className={`sidebar-link ${isActive('/my-events')}`}>
            <CalendarIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.myEvents')}</span>
          </Link>
        </div>

        {/* Part 3: Schedule */}
        <Link to="/schedule" className={`sidebar-link ${isActive('/schedule')}`}>
          <CalendarIcon size={20} className="sidebar-icon" />
          <span>{t('sidebar.courseSchedule')}</span>
        </Link>

        {/* Part 3: Classroom Reservations */}
        <Link to="/reservations" className={`sidebar-link ${isActive('/reservations')}`}>
          <BuildingIcon size={20} className="sidebar-icon" />
          <span>{t('sidebar.classroomReservation')}</span>
        </Link>

        {/* Part 4: Notifications */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">{t('sidebar.notifications')}</div>
          <Link to="/notifications" className={`sidebar-link ${isActive('/notifications')}`}>
            <BellIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.notificationsList')}</span>
          </Link>
          <Link to="/settings/notifications" className={`sidebar-link ${isActive('/settings/notifications')}`}>
            <SettingsIcon size={20} className="sidebar-icon" />
            <span>{t('sidebar.notificationSettings')}</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

