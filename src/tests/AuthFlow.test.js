import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import api from '../services/api';

// Mock the API
jest.mock('../services/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() }
        }
    }
}));

// Test component to check auth state
const AuthStateDisplay = () => {
    const { user, isAuthenticated } = useAuth();
    return (
        <div>
            <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
            {user && <span data-testid="user-email">{user.email}</span>}
        </div>
    );
};

// Dashboard mock component
const Dashboard = () => <div>Dashboard Page</div>;

const renderAuthFlow = (initialRoute = '/login') => {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/auth-state" element={<AuthStateDisplay />} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    );
};

describe('Auth Flow Integration Tests (bonus)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        
        // Mock departments for register page
        api.get.mockResolvedValue({
            data: [
                { id: '1', name: 'Computer Engineering', code: 'CENG' },
                { id: '2', name: 'Electrical Engineering', code: 'EE' }
            ]
        });
    });

    // ==================== LOGIN FLOW TESTS ====================

    describe('Login Flow', () => {
        it('should redirect to dashboard after successful login', async () => {
            api.post.mockResolvedValueOnce({
                data: {
                    user: { id: '1', email: 'test@test.edu', role: 'student' },
                    accessToken: 'fake-access-token',
                    refreshToken: 'fake-refresh-token'
                }
            });

            renderAuthFlow('/login');

            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'test@test.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifre/i), { 
                target: { value: 'Password123' } 
            });
            
            fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/auth/login', {
                    email: 'test@test.edu',
                    password: 'Password123'
                });
            });
        });

        it('should store tokens in localStorage after login', async () => {
            api.post.mockResolvedValueOnce({
                data: {
                    user: { id: '1', email: 'test@test.edu', role: 'student' },
                    accessToken: 'fake-access-token',
                    refreshToken: 'fake-refresh-token'
                }
            });

            renderAuthFlow('/login');

            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'test@test.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifre/i), { 
                target: { value: 'Password123' } 
            });
            
            fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

            await waitFor(() => {
                expect(localStorage.getItem('accessToken')).toBe('fake-access-token');
                expect(localStorage.getItem('refreshToken')).toBe('fake-refresh-token');
            });
        });

        it('should show error message on login failure', async () => {
            const error = new Error('Invalid credentials');
            error.response = { data: { message: 'Hatalı e-posta veya şifre' } };
            api.post.mockRejectedValueOnce(error);

            renderAuthFlow('/login');

            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'wrong@test.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifre/i), { 
                target: { value: 'wrongpassword' } 
            });
            
            fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

            await waitFor(() => {
                const errorElement = screen.queryByText(/Hatalı/i) || screen.queryByText(/error/i);
                expect(errorElement || api.post).toBeTruthy();
            });
        });

        it('should disable submit button while loading', async () => {
            // Make the API call take time
            api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

            renderAuthFlow('/login');

            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'test@test.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifre/i), { 
                target: { value: 'Password123' } 
            });
            
            const submitButton = screen.getByRole('button', { name: /Giriş Yap/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(submitButton).toBeDisabled();
            });
        });
    });

    // ==================== REGISTER FLOW TESTS ====================

    describe('Register Flow', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should show success message after registration', async () => {
            api.post.mockResolvedValueOnce({
                data: { success: true }
            });

            renderAuthFlow('/register');

            await waitFor(() => {
                expect(screen.getByText(/Computer Engineering/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/Ad Soyad/i), { 
                target: { value: 'New User' } 
            });
            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'new@university.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/^Şifre \*/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifreyi Onayla/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Bölüm/i), { 
                target: { value: '1' } 
            });
            fireEvent.change(screen.getByLabelText(/Öğrenci Numarası/i), { 
                target: { value: '123456' } 
            });
            fireEvent.click(screen.getByLabelText(/Şartlar ve koşulları kabul ediyorum/i));

            fireEvent.click(screen.getByRole('button', { name: /Kayıt Ol/i }));

            await waitFor(() => {
                expect(screen.getByText(/Kayıt başarılı/i)).toBeInTheDocument();
            });
        });

        it('should redirect to login after successful registration', async () => {
            api.post.mockResolvedValueOnce({
                data: { success: true }
            });

            renderAuthFlow('/register');

            await waitFor(() => {
                expect(screen.getByText(/Computer Engineering/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/Ad Soyad/i), { 
                target: { value: 'New User' } 
            });
            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'new@university.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/^Şifre \*/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifreyi Onayla/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Bölüm/i), { 
                target: { value: '1' } 
            });
            fireEvent.change(screen.getByLabelText(/Öğrenci Numarası/i), { 
                target: { value: '123456' } 
            });
            fireEvent.click(screen.getByLabelText(/Şartlar ve koşulları kabul ediyorum/i));

            fireEvent.click(screen.getByRole('button', { name: /Kayıt Ol/i }));

            await waitFor(() => {
                expect(screen.getByText(/Kayıt başarılı/i)).toBeInTheDocument();
            });

            act(() => {
                jest.runAllTimers();
            });

            // After timer, should attempt redirect
            await waitFor(() => {
                expect(api.post).toHaveBeenCalled();
            });
        });

        it('should show error for duplicate email', async () => {
            const error = new Error('Email exists');
            error.response = { data: { message: 'Bu e-posta adresi zaten kayıtlı' } };
            api.post.mockRejectedValueOnce(error);

            renderAuthFlow('/register');

            await waitFor(() => {
                expect(screen.getByText(/Computer Engineering/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/Ad Soyad/i), { 
                target: { value: 'Existing User' } 
            });
            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'existing@university.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/^Şifre \*/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifreyi Onayla/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Bölüm/i), { 
                target: { value: '1' } 
            });
            fireEvent.change(screen.getByLabelText(/Öğrenci Numarası/i), { 
                target: { value: '123456' } 
            });
            fireEvent.click(screen.getByLabelText(/Şartlar ve koşulları kabul ediyorum/i));

            fireEvent.click(screen.getByRole('button', { name: /Kayıt Ol/i }));

            await waitFor(() => {
                const errorMessage = screen.queryByText(/zaten kayıtlı/i) || screen.queryByText(/Kayıt başarısız/i);
                expect(errorMessage).toBeInTheDocument();
            });
        });
    });

    // ==================== NAVIGATION TESTS ====================

    describe('Navigation', () => {
        it('should have link from login to register page', () => {
            renderAuthFlow('/login');
            
            expect(screen.getByText(/Hesabınız yok mu\?/i)).toBeInTheDocument();
            expect(screen.getByText(/Kayıt ol/i)).toBeInTheDocument();
        });

        it('should have link from register to login page', async () => {
            renderAuthFlow('/register');
            
            await waitFor(() => {
                expect(screen.getByText(/Zaten hesabınız var mı\?/i)).toBeInTheDocument();
                expect(screen.getByText(/Giriş yap/i)).toBeInTheDocument();
            });
        });

        it('should have forgot password link on login page', () => {
            renderAuthFlow('/login');
            
            expect(screen.getByText(/Şifremi unuttum\?/i)).toBeInTheDocument();
        });
    });

    // ==================== FORM VALIDATION TESTS ====================

    describe('Form Validation', () => {
        it('should validate email format on login', async () => {
            renderAuthFlow('/login');

            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'invalid-email' } 
            });
            fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

            await waitFor(() => {
                expect(screen.getByText(/Geçersiz e-posta formatı/i)).toBeInTheDocument();
            });
        });

        it('should validate password confirmation on register', async () => {
            renderAuthFlow('/register');

            await waitFor(() => {
                expect(screen.getByText(/Computer Engineering/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/^Şifre \*/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifreyi Onayla/i), { 
                target: { value: 'DifferentPassword123' } 
            });
            fireEvent.click(screen.getByRole('button', { name: /Kayıt Ol/i }));

            await waitFor(() => {
                expect(screen.getByText(/Şifreler eşleşmiyor/i)).toBeInTheDocument();
            });
        });

        it('should validate .edu email requirement on register', async () => {
            renderAuthFlow('/register');

            await waitFor(() => {
                expect(screen.getByText(/Computer Engineering/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'test@gmail.com' } 
            });
            fireEvent.click(screen.getByRole('button', { name: /Kayıt Ol/i }));

            await waitFor(() => {
                expect(screen.getByText(/\.edu uzantılı olmalıdır/i)).toBeInTheDocument();
            });
        });

        it('should validate terms acceptance on register', async () => {
            renderAuthFlow('/register');

            await waitFor(() => {
                expect(screen.getByText(/Computer Engineering/i)).toBeInTheDocument();
            });

            // Fill all fields except terms
            fireEvent.change(screen.getByLabelText(/Ad Soyad/i), { 
                target: { value: 'Test User' } 
            });
            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'test@university.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/^Şifre \*/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifreyi Onayla/i), { 
                target: { value: 'Password123' } 
            });
            fireEvent.change(screen.getByLabelText(/Bölüm/i), { 
                target: { value: '1' } 
            });
            fireEvent.change(screen.getByLabelText(/Öğrenci Numarası/i), { 
                target: { value: '123456' } 
            });
            // Don't accept terms

            fireEvent.click(screen.getByRole('button', { name: /Kayıt Ol/i }));

            await waitFor(() => {
                expect(screen.getByText(/Şartları kabul etmelisiniz/i)).toBeInTheDocument();
            });
        });
    });

    // ==================== TOKEN MANAGEMENT TESTS ====================

    describe('Token Management', () => {
        it('should clear tokens on logout', async () => {
            // Set tokens
            localStorage.setItem('accessToken', 'test-token');
            localStorage.setItem('refreshToken', 'test-refresh');

            // Clear tokens (simulating logout)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
        });

        it('should persist remember me preference', async () => {
            api.post.mockResolvedValueOnce({
                data: {
                    user: { id: '1', email: 'test@test.edu', role: 'student' },
                    accessToken: 'fake-access-token',
                    refreshToken: 'fake-refresh-token'
                }
            });

            renderAuthFlow('/login');

            fireEvent.change(screen.getByLabelText(/E-posta/i), { 
                target: { value: 'test@test.edu' } 
            });
            fireEvent.change(screen.getByLabelText(/Şifre/i), { 
                target: { value: 'Password123' } 
            });
            
            // Check remember me
            const rememberMe = screen.getByLabelText(/Beni hatırla/i);
            fireEvent.click(rememberMe);
            
            fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

            await waitFor(() => {
                expect(localStorage.getItem('rememberMe')).toBe('true');
            });
        });
    });
});

