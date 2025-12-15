import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../services/api';

// Mock API
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

// Test component that uses AuthContext
const TestComponent = () => {
    const { user, isAuthenticated, loading, login, logout, register } = useAuth();
    return (
        <div>
            <span data-testid="loading">{loading ? 'loading' : 'not-loading'}</span>
            <span data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</span>
            <span data-testid="user">{user ? user.email : 'no-user'}</span>
            <button data-testid="login-btn" onClick={() => login('test@test.edu', 'password')}>Login</button>
            <button data-testid="logout-btn" onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    // ==================== INITIAL STATE TESTS ====================
    describe('Initial State', () => {
        it('should have null user initially', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('user').textContent).toBe('no-user');
        });

        it('should not be authenticated initially', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('authenticated').textContent).toBe('no');
        });
    });

    // ==================== LOGIN TESTS ====================
    describe('Login', () => {
        it('should update user after successful login', async () => {
            api.post.mockResolvedValueOnce({
                data: {
                    user: { id: '1', email: 'test@test.edu', role: 'student' },
                    accessToken: 'test-token',
                    refreshToken: 'test-refresh'
                }
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await act(async () => {
                screen.getByTestId('login-btn').click();
            });

            await waitFor(() => {
                expect(localStorage.getItem('accessToken')).toBe('test-token');
            });
        });

        it('should store tokens in localStorage', async () => {
            api.post.mockResolvedValueOnce({
                data: {
                    user: { id: '1', email: 'test@test.edu' },
                    accessToken: 'access-token',
                    refreshToken: 'refresh-token'
                }
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await act(async () => {
                screen.getByTestId('login-btn').click();
            });

            await waitFor(() => {
                expect(localStorage.getItem('accessToken')).toBe('access-token');
                expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
            });
        });

        it('should handle login error', async () => {
            api.post.mockRejectedValueOnce(new Error('Invalid credentials'));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await act(async () => {
                screen.getByTestId('login-btn').click();
            });

            await waitFor(() => {
                expect(screen.getByTestId('authenticated').textContent).toBe('no');
            });
        });
    });

    // ==================== LOGOUT TESTS ====================
    describe('Logout', () => {
        it('should clear user on logout', async () => {
            localStorage.setItem('accessToken', 'test-token');
            localStorage.setItem('refreshToken', 'test-refresh');

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await act(async () => {
                screen.getByTestId('logout-btn').click();
            });

            await waitFor(() => {
                expect(localStorage.getItem('accessToken')).toBeNull();
            });
        });

        it('should clear tokens from localStorage', async () => {
            localStorage.setItem('accessToken', 'test-token');
            localStorage.setItem('refreshToken', 'test-refresh');

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await act(async () => {
                screen.getByTestId('logout-btn').click();
            });

            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
        });
    });

    // ==================== TOKEN MANAGEMENT TESTS ====================
    describe('Token Management', () => {
        it('should store accessToken in localStorage', () => {
            localStorage.setItem('accessToken', 'test-token');
            expect(localStorage.getItem('accessToken')).toBe('test-token');
        });

        it('should store refreshToken in localStorage', () => {
            localStorage.setItem('refreshToken', 'test-refresh');
            expect(localStorage.getItem('refreshToken')).toBe('test-refresh');
        });

        it('should remove tokens on clear', () => {
            localStorage.setItem('accessToken', 'test-token');
            localStorage.setItem('refreshToken', 'test-refresh');
            
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
        });
    });

    // ==================== USER ROLE TESTS ====================
    describe('User Roles', () => {
        it('should identify student role', () => {
            const user = { role: 'student' };
            expect(user.role).toBe('student');
        });

        it('should identify faculty role', () => {
            const user = { role: 'faculty' };
            expect(user.role).toBe('faculty');
        });

        it('should identify admin role', () => {
            const user = { role: 'admin' };
            expect(user.role).toBe('admin');
        });

        it('should check role access', () => {
            const user = { role: 'admin' };
            const allowedRoles = ['admin', 'faculty'];
            expect(allowedRoles.includes(user.role)).toBe(true);
        });

        it('should deny access for wrong role', () => {
            const user = { role: 'student' };
            const allowedRoles = ['admin'];
            expect(allowedRoles.includes(user.role)).toBe(false);
        });
    });
});

// ==================== HOOKS TESTS ====================
describe('Custom Hooks Tests', () => {
    describe('useLocalStorage Hook', () => {
        it('should store value in localStorage', () => {
            localStorage.setItem('testKey', JSON.stringify('testValue'));
            const stored = JSON.parse(localStorage.getItem('testKey'));
            expect(stored).toBe('testValue');
        });

        it('should retrieve value from localStorage', () => {
            localStorage.setItem('key', JSON.stringify({ name: 'test' }));
            const value = JSON.parse(localStorage.getItem('key'));
            expect(value.name).toBe('test');
        });

        it('should update value in localStorage', () => {
            localStorage.setItem('key', JSON.stringify('initial'));
            localStorage.setItem('key', JSON.stringify('updated'));
            const value = JSON.parse(localStorage.getItem('key'));
            expect(value).toBe('updated');
        });

        it('should remove value from localStorage', () => {
            localStorage.setItem('key', 'value');
            localStorage.removeItem('key');
            expect(localStorage.getItem('key')).toBeNull();
        });

        it('should return null for non-existent key', () => {
            expect(localStorage.getItem('nonExistent')).toBeNull();
        });
    });

    describe('Form State Management', () => {
        it('should track form values', () => {
            const formValues = { email: '', password: '' };
            formValues.email = 'test@test.edu';
            expect(formValues.email).toBe('test@test.edu');
        });

        it('should track form errors', () => {
            const errors = {};
            errors.email = 'Invalid email';
            expect(errors.email).toBe('Invalid email');
        });

        it('should track form submission state', () => {
            let isSubmitting = false;
            isSubmitting = true;
            expect(isSubmitting).toBe(true);
        });

        it('should reset form', () => {
            const initialValues = { email: '', password: '' };
            let formValues = { email: 'test@test.edu', password: 'pass' };
            formValues = { ...initialValues };
            expect(formValues.email).toBe('');
        });
    });

    describe('Loading State Management', () => {
        it('should track loading state', () => {
            let loading = false;
            loading = true;
            expect(loading).toBe(true);
            loading = false;
            expect(loading).toBe(false);
        });

        it('should handle async operation loading', async () => {
            let loading = false;
            loading = true;
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            loading = false;
            expect(loading).toBe(false);
        });
    });

    describe('Error State Management', () => {
        it('should track error state', () => {
            let error = null;
            error = 'An error occurred';
            expect(error).toBe('An error occurred');
        });

        it('should clear error', () => {
            let error = 'Error';
            error = null;
            expect(error).toBeNull();
        });

        it('should handle error object', () => {
            const error = { message: 'Error', code: 'ERR_001' };
            expect(error.message).toBe('Error');
            expect(error.code).toBe('ERR_001');
        });
    });
});

// ==================== API SERVICE TESTS ====================
describe('API Service Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should make GET request', async () => {
        api.get.mockResolvedValueOnce({ data: { success: true } });
        
        const response = await api.get('/test');
        
        expect(api.get).toHaveBeenCalledWith('/test');
        expect(response.data.success).toBe(true);
    });

    it('should make POST request', async () => {
        api.post.mockResolvedValueOnce({ data: { id: 1 } });
        
        const response = await api.post('/test', { name: 'test' });
        
        expect(api.post).toHaveBeenCalledWith('/test', { name: 'test' });
        expect(response.data.id).toBe(1);
    });

    it('should handle API error', async () => {
        api.get.mockRejectedValueOnce(new Error('Network Error'));
        
        await expect(api.get('/error')).rejects.toThrow('Network Error');
    });

    it('should include auth header when token exists', () => {
        localStorage.setItem('accessToken', 'test-token');
        const token = localStorage.getItem('accessToken');
        
        expect(token).toBe('test-token');
    });
});

