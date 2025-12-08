import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';
import api from '../services/api';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

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

const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form', () => {
        renderWithProviders(<Login />);

        expect(screen.getByRole('heading', { name: /Giriş Yap/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Şifre/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        renderWithProviders(<Login />);

        const submitButton = screen.getByRole('button', { name: /Giriş Yap/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/E-posta gereklidir/i)).toBeInTheDocument();
            expect(screen.getByText(/Şifre gereklidir/i)).toBeInTheDocument();
        });
    });

    it('shows validation error for invalid email', async () => {
        renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText(/E-posta/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const submitButton = screen.getByRole('button', { name: /Giriş Yap/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Geçersiz e-posta formatı/i)).toBeInTheDocument();
        });
    });

    it('handles successful login', async () => {
        // Mock successful API response
        api.post.mockResolvedValueOnce({
            data: {
                user: { id: 1, name: 'Test User', email: 'test@test.com' },
                accessToken: 'fake-token',
                refreshToken: 'fake-refresh-token'
            }
        });

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Şifre/i), { target: { value: 'password123' } });
        
        const submitButton = screen.getByRole('button', { name: /Giriş Yap/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/login', {
                email: 'test@test.com',
                password: 'password123'
            });
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('handles login failure', async () => {
        // Mock failed API response
        const error = new Error('API Error');
        error.response = {
            data: {
                message: 'Hatalı e-posta veya şifre'
            }
        };
        api.post.mockRejectedValueOnce(error);

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'wrong@test.com' } });
        fireEvent.change(screen.getByLabelText(/Şifre/i), { target: { value: 'wrongpass' } });
        
        const submitButton = screen.getByRole('button', { name: /Giriş Yap/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Check for either specific or generic error message
            const errorMessage = screen.queryByText(/Hatalı e-posta veya şifre/i) || screen.queryByText(/Giriş başarısız/i);
            expect(errorMessage).toBeInTheDocument();
        });
    });

    it('renders remember me checkbox', () => {
        renderWithProviders(<Login />);
        expect(screen.getByLabelText(/Beni hatırla/i)).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
        renderWithProviders(<Login />);
        expect(screen.getByText(/Şifremi unuttum\?/i)).toBeInTheDocument();
    });

    it('renders register link', () => {
        renderWithProviders(<Login />);
        expect(screen.getByText(/Hesabınız yok mu\?/i)).toBeInTheDocument();
    });
});
