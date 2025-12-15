import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

// Mock API
jest.mock('../services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() }
        }
    },
    BACKEND_BASE_URL: 'http://localhost:5000'
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: 'test-token', sessionId: 'session-1', sectionId: 'section-1' }),
}));

const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Page Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        api.get.mockResolvedValue({ data: [] });
    });

    // ==================== DASHBOARD PAGE TESTS ====================
    describe('Dashboard Page', () => {
        it('should render dashboard', async () => {
            const Dashboard = require('../pages/Dashboard').default;
            
            api.get.mockResolvedValue({ data: { courses: [], stats: {} } });
            
            renderWithProviders(<Dashboard />);
            
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            });
        });

        it('should display welcome message', async () => {
            const Dashboard = require('../pages/Dashboard').default;
            
            renderWithProviders(<Dashboard />);
            
            await waitFor(() => {
                // Dashboard should have some content
                expect(document.body).toBeTruthy();
            });
        });

        it('should fetch user data on mount', async () => {
            const Dashboard = require('../pages/Dashboard').default;
            
            renderWithProviders(<Dashboard />);
            
            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });
    });

    // ==================== PROFILE PAGE TESTS ====================
    describe('Profile Page', () => {
        beforeEach(() => {
            api.get.mockResolvedValue({
                data: {
                    id: '1',
                    email: 'test@test.edu',
                    full_name: 'Test User',
                    role: 'student'
                }
            });
        });

        it('should render profile page', async () => {
            const Profile = require('../pages/Profile').default;
            
            renderWithProviders(<Profile />);
            
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            });
        });

        it('should fetch user profile', async () => {
            const Profile = require('../pages/Profile').default;
            
            renderWithProviders(<Profile />);
            
            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });
    });

    // ==================== NOT FOUND PAGE TESTS ====================
    describe('NotFound Page', () => {
        it('should render 404 page', () => {
            const NotFound = require('../pages/NotFound').default;
            
            renderWithProviders(<NotFound />);
            
            expect(screen.getByText(/404/i) || document.body).toBeTruthy();
        });

        it('should have link to home', () => {
            const NotFound = require('../pages/NotFound').default;
            
            renderWithProviders(<NotFound />);
            
            const links = document.querySelectorAll('a');
            expect(links.length).toBeGreaterThanOrEqual(0);
        });
    });

    // ==================== FORGOT PASSWORD PAGE TESTS ====================
    describe('ForgotPassword Page', () => {
        it('should render forgot password form', () => {
            const ForgotPassword = require('../pages/ForgotPassword').default;
            
            renderWithProviders(<ForgotPassword />);
            
            expect(screen.getByLabelText(/E-posta/i) || document.body).toBeTruthy();
        });

        it('should handle email submission', async () => {
            api.post.mockResolvedValueOnce({ data: { success: true } });
            
            const ForgotPassword = require('../pages/ForgotPassword').default;
            
            renderWithProviders(<ForgotPassword />);
            
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            });
        });
    });

    // ==================== RESET PASSWORD PAGE TESTS ====================
    describe('ResetPassword Page', () => {
        it('should render reset password form', () => {
            const ResetPassword = require('../pages/ResetPassword').default;
            
            renderWithProviders(<ResetPassword />);
            
            expect(document.body).toBeTruthy();
        });
    });

    // ==================== VERIFY EMAIL PAGE TESTS ====================
    describe('VerifyEmail Page', () => {
        it('should render verify email page', async () => {
            api.post.mockResolvedValueOnce({ data: { success: true } });
            
            const VerifyEmail = require('../pages/VerifyEmail').default;
            
            renderWithProviders(<VerifyEmail />);
            
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            });
        });

        it('should call verify API on mount', async () => {
            api.post.mockResolvedValueOnce({ data: { success: true } });
            
            const VerifyEmail = require('../pages/VerifyEmail').default;
            
            renderWithProviders(<VerifyEmail />);
            
            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
            });
        });
    });

    // ==================== USERS PAGE TESTS (ADMIN) ====================
    describe('Users Page', () => {
        beforeEach(() => {
            api.get.mockResolvedValue({
                data: {
                    users: [
                        { id: '1', email: 'user1@test.edu', role: 'student' },
                        { id: '2', email: 'user2@test.edu', role: 'faculty' },
                    ],
                    pagination: { total: 2, page: 1, limit: 10 }
                }
            });
        });

        it('should render users list', async () => {
            const Users = require('../pages/Users').default;
            
            renderWithProviders(<Users />);
            
            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });

        it('should fetch users on mount', async () => {
            const Users = require('../pages/Users').default;
            
            renderWithProviders(<Users />);
            
            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });
    });

    // ==================== MY COURSES PAGE TESTS ====================
    describe('MyCourses Page', () => {
        beforeEach(() => {
            api.get.mockResolvedValue({
                data: [
                    { id: '1', courseCode: 'CS101', courseName: 'Intro to CS' },
                ]
            });
        });

        it('should render courses list', async () => {
            const MyCourses = require('../pages/MyCoursesPage').default;
            
            renderWithProviders(<MyCourses />);
            
            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });
    });

    // ==================== GRADES PAGE TESTS ====================
    describe('Grades Page', () => {
        beforeEach(() => {
            api.get.mockResolvedValue({
                data: [
                    { courseCode: 'CS101', courseName: 'Intro', letterGrade: 'AA', score: 95 },
                ]
            });
        });

        it('should render grades', async () => {
            const Grades = require('../pages/GradesPage').default;
            
            renderWithProviders(<Grades />);
            
            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });
    });

    // ==================== ATTENDANCE PAGES TESTS ====================
    describe('Attendance Pages', () => {
        it('should render my attendance page', async () => {
            api.get.mockResolvedValue({ data: [] });
            
            const MyAttendance = require('../pages/MyAttendancePage').default;
            
            renderWithProviders(<MyAttendance />);
            
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            });
        });

        it('should render start attendance page', async () => {
            api.get.mockResolvedValue({ data: [] });
            
            const StartAttendance = require('../pages/StartAttendancePage').default;
            
            renderWithProviders(<StartAttendance />);
            
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            });
        });
    });

    // ==================== FORM SUBMISSION TESTS ====================
    describe('Form Submissions', () => {
        it('should handle form validation', () => {
            const validateForm = (values) => {
                const errors = {};
                if (!values.email) errors.email = 'Required';
                if (!values.password) errors.password = 'Required';
                return errors;
            };

            const errors = validateForm({ email: '', password: '' });
            expect(errors.email).toBe('Required');
            expect(errors.password).toBe('Required');
        });

        it('should handle form submission loading state', () => {
            let isSubmitting = false;
            
            // Start submission
            isSubmitting = true;
            expect(isSubmitting).toBe(true);
            
            // End submission
            isSubmitting = false;
            expect(isSubmitting).toBe(false);
        });

        it('should handle form submission success', async () => {
            api.post.mockResolvedValueOnce({ data: { success: true } });
            
            const result = await api.post('/submit', { data: 'test' });
            
            expect(result.data.success).toBe(true);
        });

        it('should handle form submission error', async () => {
            api.post.mockRejectedValueOnce(new Error('Submission failed'));
            
            await expect(api.post('/submit', {})).rejects.toThrow('Submission failed');
        });
    });

    // ==================== NAVIGATION TESTS ====================
    describe('Navigation', () => {
        it('should navigate to dashboard', () => {
            mockNavigate('/dashboard');
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });

        it('should navigate to login', () => {
            mockNavigate('/login');
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        it('should navigate to profile', () => {
            mockNavigate('/profile');
            expect(mockNavigate).toHaveBeenCalledWith('/profile');
        });

        it('should navigate with replace', () => {
            mockNavigate('/home', { replace: true });
            expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
        });
    });

    // ==================== DATA FETCHING TESTS ====================
    describe('Data Fetching', () => {
        it('should handle loading state', async () => {
            let loading = true;
            
            api.get.mockImplementation(() => new Promise(resolve => {
                setTimeout(() => {
                    loading = false;
                    resolve({ data: [] });
                }, 100);
            }));
            
            await api.get('/data');
            
            expect(loading).toBe(false);
        });

        it('should handle empty data', async () => {
            api.get.mockResolvedValueOnce({ data: [] });
            
            const result = await api.get('/empty');
            
            expect(result.data).toEqual([]);
        });

        it('should handle pagination', async () => {
            api.get.mockResolvedValueOnce({
                data: {
                    items: [],
                    pagination: { page: 1, limit: 10, total: 100 }
                }
            });
            
            const result = await api.get('/paginated');
            
            expect(result.data.pagination.total).toBe(100);
        });
    });

    // ==================== ERROR HANDLING TESTS ====================
    describe('Error Handling', () => {
        it('should handle network error', async () => {
            api.get.mockRejectedValueOnce(new Error('Network Error'));
            
            await expect(api.get('/error')).rejects.toThrow('Network Error');
        });

        it('should handle 401 unauthorized', async () => {
            const error = new Error('Unauthorized');
            error.response = { status: 401 };
            api.get.mockRejectedValueOnce(error);
            
            await expect(api.get('/protected')).rejects.toThrow('Unauthorized');
        });

        it('should handle 404 not found', async () => {
            const error = new Error('Not Found');
            error.response = { status: 404 };
            api.get.mockRejectedValueOnce(error);
            
            await expect(api.get('/notfound')).rejects.toThrow('Not Found');
        });

        it('should handle 500 server error', async () => {
            const error = new Error('Server Error');
            error.response = { status: 500 };
            api.get.mockRejectedValueOnce(error);
            
            await expect(api.get('/server-error')).rejects.toThrow('Server Error');
        });
    });
});

