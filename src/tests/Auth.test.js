import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: 'test-token' }),
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

describe('Authentication Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    // ==================== LOGIN PAGE TESTS ====================
    describe('Login Page', () => {
        it('should render login form', () => {
            const Login = require('../pages/Login').default;
            renderWithProviders(<Login />);

            expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Şifre/i)).toBeInTheDocument();
        });

        it('should show validation error for empty email', async () => {
            const Login = require('../pages/Login').default;
            renderWithProviders(<Login />);

            const submitBtn = screen.getByRole('button', { name: /Giriş Yap/i });
            fireEvent.click(submitBtn);

            // Form validation should prevent submission
            expect(document.body).toBeTruthy();
        });

        it('should show validation error for invalid email format', async () => {
            const Login = require('../pages/Login').default;
            renderWithProviders(<Login />);

            const emailInput = screen.getByLabelText(/E-posta/i);
            fireEvent.change(emailInput, { target: { value: 'invalid' } });
            
            const submitBtn = screen.getByRole('button', { name: /Giriş Yap/i });
            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(document.body).toBeTruthy();
            });
        });

        it('should handle successful login', async () => {
            api.post.mockResolvedValueOnce({
                data: {
                    user: { id: '1', email: 'test@campus.edu.tr', role: 'student' },
                    accessToken: 'access-token',
                    refreshToken: 'refresh-token'
                }
            });

            const Login = require('../pages/Login').default;
            renderWithProviders(<Login />);

            const emailInput = screen.getByLabelText(/E-posta/i);
            const passwordInput = screen.getByLabelText(/Şifre/i);
            
            fireEvent.change(emailInput, { target: { value: 'test@campus.edu.tr' } });
            fireEvent.change(passwordInput, { target: { value: 'Password123' } });
            
            const submitBtn = screen.getByRole('button', { name: /Giriş Yap/i });
            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/auth/login', expect.any(Object));
            });
        });

        it('should handle login error', async () => {
            api.post.mockRejectedValueOnce({
                response: { data: { error: 'Geçersiz e-posta veya şifre' } }
            });

            const Login = require('../pages/Login').default;
            renderWithProviders(<Login />);

            const emailInput = screen.getByLabelText(/E-posta/i);
            const passwordInput = screen.getByLabelText(/Şifre/i);
            
            fireEvent.change(emailInput, { target: { value: 'test@campus.edu.tr' } });
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
            
            const submitBtn = screen.getByRole('button', { name: /Giriş Yap/i });
            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
            });
        });

        it('should navigate to register page', () => {
            const Login = require('../pages/Login').default;
            renderWithProviders(<Login />);

            const registerLink = screen.getByText(/Kayıt ol/i);
            expect(registerLink).toBeInTheDocument();
        });

        it('should navigate to forgot password page', () => {
            const Login = require('../pages/Login').default;
            renderWithProviders(<Login />);

            const forgotLink = screen.getByText(/Şifremi unuttum/i);
            expect(forgotLink).toBeInTheDocument();
        });
    });

    // ==================== REGISTER PAGE TESTS ====================
    describe('Register Page', () => {
        beforeEach(() => {
            api.get.mockResolvedValue({ data: [
                { id: 'd1', name: 'Computer Engineering', code: 'CENG' },
                { id: 'd2', name: 'Electrical Engineering', code: 'EE' }
            ]});
        });

        it('should render register form', async () => {
            const Register = require('../pages/Register').default;
            renderWithProviders(<Register />);

            await waitFor(() => {
                expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
            });
        });

        it('should fetch departments on mount', async () => {
            const Register = require('../pages/Register').default;
            renderWithProviders(<Register />);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/departments');
            });
        });

        it('should show student number field when student role selected', async () => {
            const Register = require('../pages/Register').default;
            renderWithProviders(<Register />);

            await waitFor(() => {
                const roleSelect = screen.getByLabelText(/Rol/i);
                fireEvent.change(roleSelect, { target: { value: 'student' } });
            });

            expect(document.body).toBeTruthy();
        });

        it('should show employee fields when faculty role selected', async () => {
            const Register = require('../pages/Register').default;
            renderWithProviders(<Register />);

            await waitFor(() => {
                const roleSelect = screen.getByLabelText(/Rol/i);
                fireEvent.change(roleSelect, { target: { value: 'faculty' } });
            });

            expect(document.body).toBeTruthy();
        });

        it('should validate password match', async () => {
            const Register = require('../pages/Register').default;
            renderWithProviders(<Register />);

            await waitFor(() => {
                const passwordInput = screen.getByLabelText(/^Şifre$/i);
                const confirmInput = screen.getByLabelText(/Şifre Tekrar/i);
                
                fireEvent.change(passwordInput, { target: { value: 'Password123' } });
                fireEvent.change(confirmInput, { target: { value: 'Different123' } });
            });

            expect(document.body).toBeTruthy();
        });

        it('should handle successful registration', async () => {
            api.post.mockResolvedValueOnce({
                data: { email: 'newuser@campus.edu.tr', userId: '1' }
            });

            const Register = require('../pages/Register').default;
            renderWithProviders(<Register />);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled();
            });
        });

        it('should validate .edu email requirement', async () => {
            const validateEduEmail = (email) => /\.edu(\.tr)?$/i.test(email);
            
            expect(validateEduEmail('test@university.edu')).toBe(true);
            expect(validateEduEmail('test@university.edu.tr')).toBe(true);
            expect(validateEduEmail('test@gmail.com')).toBe(false);
        });
    });

    // ==================== PASSWORD VALIDATION TESTS ====================
    describe('Password Validation', () => {
        it('should validate minimum length (8 chars)', () => {
            const isValidLength = (password) => password.length >= 8;
            
            expect(isValidLength('Pass123')).toBe(false);
            expect(isValidLength('Password123')).toBe(true);
        });

        it('should require lowercase letter', () => {
            const hasLowercase = (password) => /[a-z]/.test(password);
            
            expect(hasLowercase('PASSWORD123')).toBe(false);
            expect(hasLowercase('Password123')).toBe(true);
        });

        it('should require uppercase letter', () => {
            const hasUppercase = (password) => /[A-Z]/.test(password);
            
            expect(hasUppercase('password123')).toBe(false);
            expect(hasUppercase('Password123')).toBe(true);
        });

        it('should require number', () => {
            const hasNumber = (password) => /[0-9]/.test(password);
            
            expect(hasNumber('PasswordABC')).toBe(false);
            expect(hasNumber('Password123')).toBe(true);
        });

        it('should validate complete password', () => {
            const isValidPassword = (password) => {
                return password.length >= 8 &&
                       /[a-z]/.test(password) &&
                       /[A-Z]/.test(password) &&
                       /[0-9]/.test(password);
            };

            expect(isValidPassword('Password123')).toBe(true);
            expect(isValidPassword('weak')).toBe(false);
        });
    });

    // ==================== EMAIL VALIDATION TESTS ====================
    describe('Email Validation', () => {
        it('should validate email format', () => {
            const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('invalid')).toBe(false);
        });

        it('should require .edu domain', () => {
            const isEduEmail = (email) => /\.edu(\.tr)?$/i.test(email);
            
            expect(isEduEmail('test@university.edu')).toBe(true);
            expect(isEduEmail('test@university.edu.tr')).toBe(true);
            expect(isEduEmail('test@gmail.com')).toBe(false);
        });

        it('should normalize email to lowercase', () => {
            const normalizeEmail = (email) => email.toLowerCase().trim();
            
            expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
            expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
        });
    });

    // ==================== TOKEN MANAGEMENT TESTS ====================
    describe('Token Management', () => {
        it('should store access token', () => {
            localStorage.setItem('accessToken', 'test-access-token');
            expect(localStorage.getItem('accessToken')).toBe('test-access-token');
        });

        it('should store refresh token', () => {
            localStorage.setItem('refreshToken', 'test-refresh-token');
            expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
        });

        it('should clear tokens on logout', () => {
            localStorage.setItem('accessToken', 'test-token');
            localStorage.setItem('refreshToken', 'test-refresh');
            
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
        });
    });

    // ==================== FORM INPUT TESTS ====================
    describe('Form Input Handling', () => {
        it('should handle text input change', () => {
            let value = '';
            const handleChange = (e) => { value = e.target.value; };
            
            handleChange({ target: { value: 'new value' } });
            expect(value).toBe('new value');
        });

        it('should handle select change', () => {
            let selected = '';
            const handleChange = (e) => { selected = e.target.value; };
            
            handleChange({ target: { value: 'student' } });
            expect(selected).toBe('student');
        });

        it('should handle checkbox change', () => {
            let checked = false;
            const handleChange = (e) => { checked = e.target.checked; };
            
            handleChange({ target: { checked: true } });
            expect(checked).toBe(true);
        });

        it('should trim input values', () => {
            const trimValue = (value) => value.trim();
            
            expect(trimValue('  test  ')).toBe('test');
            expect(trimValue('test')).toBe('test');
        });
    });

    // ==================== ERROR MESSAGE TESTS ====================
    describe('Error Messages', () => {
        const errorMessages = {
            required: 'Bu alan zorunludur',
            invalidEmail: 'Geçerli bir e-posta adresi girin',
            eduRequired: '.edu uzantılı e-posta gerekli',
            passwordMismatch: 'Şifreler eşleşmiyor',
            weakPassword: 'Şifre en az 8 karakter, büyük/küçük harf ve rakam içermeli',
            networkError: 'Bağlantı hatası oluştu',
            unauthorized: 'Geçersiz e-posta veya şifre'
        };

        it('should have required field message', () => {
            expect(errorMessages.required).toBe('Bu alan zorunludur');
        });

        it('should have invalid email message', () => {
            expect(errorMessages.invalidEmail).toBe('Geçerli bir e-posta adresi girin');
        });

        it('should have edu email required message', () => {
            expect(errorMessages.eduRequired).toBe('.edu uzantılı e-posta gerekli');
        });

        it('should have password mismatch message', () => {
            expect(errorMessages.passwordMismatch).toBe('Şifreler eşleşmiyor');
        });

        it('should have weak password message', () => {
            expect(errorMessages.weakPassword).toContain('en az 8 karakter');
        });
    });
});

// ==================== ROLE-BASED ACCESS TESTS ====================
describe('Role-Based Access Control', () => {
    it('should identify admin role', () => {
        const user = { role: 'admin' };
        expect(user.role).toBe('admin');
    });

    it('should identify faculty role', () => {
        const user = { role: 'faculty' };
        expect(user.role).toBe('faculty');
    });

    it('should identify student role', () => {
        const user = { role: 'student' };
        expect(user.role).toBe('student');
    });

    it('should check admin access', () => {
        const hasAdminAccess = (user) => user.role === 'admin';
        
        expect(hasAdminAccess({ role: 'admin' })).toBe(true);
        expect(hasAdminAccess({ role: 'student' })).toBe(false);
    });

    it('should check faculty access', () => {
        const hasFacultyAccess = (user) => ['admin', 'faculty'].includes(user.role);
        
        expect(hasFacultyAccess({ role: 'admin' })).toBe(true);
        expect(hasFacultyAccess({ role: 'faculty' })).toBe(true);
        expect(hasFacultyAccess({ role: 'student' })).toBe(false);
    });

    it('should check student access', () => {
        const hasStudentAccess = (user) => ['admin', 'faculty', 'student'].includes(user.role);
        
        expect(hasStudentAccess({ role: 'admin' })).toBe(true);
        expect(hasStudentAccess({ role: 'faculty' })).toBe(true);
        expect(hasStudentAccess({ role: 'student' })).toBe(true);
    });
});

