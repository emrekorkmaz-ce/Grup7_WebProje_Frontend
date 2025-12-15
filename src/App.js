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
                </Routes> </AuthProvider> </Router>
    );
}

export default App;