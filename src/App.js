import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import MyCoursesPage from './pages/MyCoursesPage';
import GradesPage from './pages/GradesPage';
import GradebookPage from './pages/GradebookPage';
import StartAttendancePage from './pages/StartAttendancePage';
import GiveAttendancePage from './pages/GiveAttendancePage';
import MyAttendancePage from './pages/MyAttendancePage';
import AttendanceReportPage from './pages/AttendanceReportPage';
import ExcuseRequestsPage from './pages/ExcuseRequestsPage';
import EnrollCoursesPage from './pages/EnrollCoursesPage';
import MealMenuPage from './pages/MealMenuPage';
import MyReservationsPage from './pages/MyReservationsPage';
import MealScanPage from './pages/MealScanPage';
import WalletPage from './pages/WalletPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MyEventsPage from './pages/MyEventsPage';
import EventCheckInPage from './pages/EventCheckInPage';
import MySchedulePage from './pages/MySchedulePage';
import ClassroomReservationsPage from './pages/ClassroomReservationsPage';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import AcademicAnalyticsPage from './pages/AcademicAnalyticsPage';
import AttendanceAnalyticsPage from './pages/AttendanceAnalyticsPage';
import MealAnalyticsPage from './pages/MealAnalyticsPage';
import EventAnalyticsPage from './pages/EventAnalyticsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import IoTDashboardPage from './pages/IoTDashboardPage';
import './App.css';

function App() {
    return (<ErrorBoundary >
        <Router future={
            { v7_startTransition: true, v7_relativeSplatPath: true } } >
        <AuthProvider >
        <NotificationProvider >
        <Routes >
        <Route path="/login"
        element={ <Login / > }
        /> <Route path="/register"
        element={ <Register / > }
        /> <Route path="/verify-email/:token"
        element={ <VerifyEmail / > }
        /> <Route path="/forgot-password"
        element={ <ForgotPassword / > }
        /> <Route path="/reset-password/:token"
        element={ <ResetPassword / > }
        /> <Route path="/dashboard"
        element={ <ProtectedRoute >
            <Dashboard / ></ProtectedRoute>
        }
        /> <Route path="/profile"
        element={ <ProtectedRoute >
            <Profile / ></ProtectedRoute>
        }
        /> <Route path="/users"
        element={ <ProtectedRoute roles={
                ['admin'] } >
            <Users / ></ProtectedRoute>
        }
        /> <Route path="/"
        element={ <Navigate to="/login"
            replace / >
        }
        /> <Route path="*"
        element={ <NotFound / > }
        /> <Route path="/my-courses"
        element={ <ProtectedRoute >
            <MyCoursesPage / ></ProtectedRoute>
        }
        /> <Route path="/grades"
        element={ <ProtectedRoute >
            <GradesPage / ></ProtectedRoute>
        }
        /> <Route path="/gradebook/:sectionId"
        element={ <ProtectedRoute >
            <GradebookPage / ></ProtectedRoute>
        }
        /> <Route path="/attendance/start"
        element={ <ProtectedRoute roles={
                ['admin', 'faculty'] } >
            <StartAttendancePage / ></ProtectedRoute>
        }
        /> <Route path="/attendance/give/:sessionId"
        element={ <ProtectedRoute >
            <GiveAttendancePage / ></ProtectedRoute>
        }
        /> <Route path="/my-attendance"
        element={ <ProtectedRoute >
            <MyAttendancePage / ></ProtectedRoute>
        }
        /> <Route path="/attendance/report/:sectionId"
        element={ <ProtectedRoute >
            <AttendanceReportPage / ></ProtectedRoute>
        }
        /> <Route path="/excuse-requests"
        element={ <ProtectedRoute >
            <ExcuseRequestsPage / ></ProtectedRoute>
        }
        /> <Route path="/enroll-courses"
        element={ <ProtectedRoute roles={
                ['student'] } >
            <EnrollCoursesPage / ></ProtectedRoute>
        }
        />{ /* Part 3: Meal Service Routes */ }<Route path="/meals/menu"
        element={ <ProtectedRoute >
            <MealMenuPage / ></ProtectedRoute>
        }
        /> <Route path="/meals/reservations"
        element={ <ProtectedRoute >
            <MyReservationsPage / ></ProtectedRoute>
        }
        /> <Route path="/meals/scan"
        element={ <ProtectedRoute roles={
                ['admin', 'faculty'] } >
            <MealScanPage / ></ProtectedRoute>
        }
        />{ /* Part 3: Wallet Routes */ }<Route path="/wallet"
        element={ <ProtectedRoute >
            <WalletPage / ></ProtectedRoute>
        }
        />{ /* Part 3: Event Management Routes */ }<Route path="/events"
        element={ <ProtectedRoute >
            <EventsPage / ></ProtectedRoute>
        }
        /> <Route path="/events/:id"
        element={ <ProtectedRoute >
            <EventDetailPage / ></ProtectedRoute>
        }
        /> <Route path="/my-events"
        element={ <ProtectedRoute >
            <MyEventsPage / ></ProtectedRoute>
        }
        /> <Route path="/events/checkin"
        element={ <ProtectedRoute roles={
                ['admin'] } >
            <EventCheckInPage / ></ProtectedRoute>
        }
        />{ /* Part 3: Scheduling Routes */ }<Route path="/schedule"
        element={ <ProtectedRoute >
            <MySchedulePage / ></ProtectedRoute>
        }
        />{ /* Part 3: Classroom Reservations Routes */ }<Route path="/reservations"
        element={ <ProtectedRoute >
            <ClassroomReservationsPage / ></ProtectedRoute>
        }
        />{ /* Part 4: Admin Dashboard and Analytics Routes */ }<Route path="/admin/dashboard"
        element={ <ProtectedRoute roles={
                ['admin'] } >
            <AdminDashboard / ></ProtectedRoute>
        }
        /> <Route path="/admin/analytics/academic"
        element={ <ProtectedRoute roles={
                ['admin'] } >
            <AcademicAnalyticsPage / ></ProtectedRoute>
        }
        /> <Route path="/admin/analytics/attendance"
        element={ <ProtectedRoute roles={
                ['admin'] } >
            <AttendanceAnalyticsPage / ></ProtectedRoute>
        }
        /> <Route path="/admin/analytics/meal"
        element={ <ProtectedRoute roles={
                ['admin'] } >
            <MealAnalyticsPage / ></ProtectedRoute>
        }
        /> <Route path="/admin/analytics/events"
        element={ <ProtectedRoute roles={
                ['admin'] } >
            <EventAnalyticsPage / ></ProtectedRoute>
        }
        />{ /* Part 4: Notifications Routes */ }<Route path="/notifications"
        element={ <ProtectedRoute >
            <NotificationsPage / ></ProtectedRoute>
        }
        /> <Route path="/settings/notifications"
        element={ <ProtectedRoute >
            <NotificationSettingsPage / ></ProtectedRoute>
        }
        />{ /* Part 4: IoT Dashboard (Bonus) */ }<Route path="/admin/iot"
        element={ <ProtectedRoute roles={
                ['admin'] } >
            <IoTDashboardPage / ></ProtectedRoute>
        }
        /> <
        /Routes> <ToastContainer position="top-right"
        autoClose={ 3000 }
        hideProgressBar={ false }
        newestOnTop={ false }
        closeOnClick rtl={ false }
        pauseOnFocusLoss draggable pauseOnHover /
        >
        <
        /NotificationProvider> <
        /AuthProvider> <
        /Router> <
        /ErrorBoundary>
    );
}

export default App;