import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
import './App.css';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <Routes>
                    <Route path="/login"
                        element={<Login />}
                    /> <Route path="/register"
                        element={<Register />}
                    /> <Route path="/verify-email/:token"
                        element={<VerifyEmail />}
                    /> <Route path="/forgot-password"
                        element={<ForgotPassword />}
                    /> <Route path="/reset-password/:token"
                        element={<ResetPassword />}
                    /> <Route path="/dashboard"
                        element={<ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                        }
                    /> <Route path="/profile"
                        element={<ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                        }
                    /> <Route path="/users"
                        element={<ProtectedRoute roles={['admin']}>
                            <Users />
                        </ProtectedRoute>
                        }
                    /> <Route path="/"
                        element={<Navigate to="/dashboard"
                            replace />}
                    /> <Route path="*"
                        element={<NotFound />}
                    />
                    <Route path="/my-courses"
                        element={
                            <ProtectedRoute>
                                <MyCoursesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/grades"
                        element={
                            <ProtectedRoute>
                                <GradesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/gradebook/:sectionId"
                        element={
                            <ProtectedRoute>
                                <GradebookPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/attendance/start"
                        element={
                            <ProtectedRoute roles={['admin', 'faculty']}>
                                <StartAttendancePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/attendance/give/:sessionId"
                        element={
                            <ProtectedRoute>
                                <GiveAttendancePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/my-attendance"
                        element={
                            <ProtectedRoute>
                                <MyAttendancePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/attendance/report/:sectionId"
                        element={
                            <ProtectedRoute>
                                <AttendanceReportPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/excuse-requests"
                        element={
                            <ProtectedRoute>
                                <ExcuseRequestsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/enroll-courses"
                        element={
                            <ProtectedRoute roles={['student']}>
                                <EnrollCoursesPage />
                            </ProtectedRoute>
                        }
                    />
                    {/* Part 3: Meal Service Routes */}
                    <Route path="/meals/menu"
                        element={
                            <ProtectedRoute>
                                <MealMenuPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/meals/reservations"
                        element={
                            <ProtectedRoute>
                                <MyReservationsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/meals/scan"
                        element={
                            <ProtectedRoute roles={['admin', 'faculty']}>
                                <MealScanPage />
                            </ProtectedRoute>
                        }
                    />
                    {/* Part 3: Wallet Routes */}
                    <Route path="/wallet"
                        element={
                            <ProtectedRoute>
                                <WalletPage />
                            </ProtectedRoute>
                        }
                    />
                    {/* Part 3: Event Management Routes */}
                    <Route path="/events"
                        element={
                            <ProtectedRoute>
                                <EventsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/events/:id"
                        element={
                            <ProtectedRoute>
                                <EventDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/my-events"
                        element={
                            <ProtectedRoute>
                                <MyEventsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/events/checkin"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <EventCheckInPage />
                            </ProtectedRoute>
                        }
                    />
                    {/* Part 3: Scheduling Routes */}
                    <Route path="/schedule"
                        element={
                            <ProtectedRoute>
                                <MySchedulePage />
                            </ProtectedRoute>
                        }
                    />
                    {/* Part 3: Classroom Reservations Routes */}
                    <Route path="/reservations"
                        element={
                            <ProtectedRoute>
                                <ClassroomReservationsPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes> </AuthProvider> </Router>
    );
}

export default App;