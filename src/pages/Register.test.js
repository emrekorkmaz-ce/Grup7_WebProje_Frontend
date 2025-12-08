import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Register from './Register';
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

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        api.get.mockResolvedValue({
            data: [
                { id: '1', name: 'Computer Engineering', code: 'CENG' },
                { id: '2', name: 'Electrical Engineering', code: 'EE' }
            ]
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders register form', async () => {
        renderWithProviders(<Register />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Kayıt Ol/i })).toBeInTheDocument();
            expect(screen.getByLabelText(/Ad Soyad/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^Şifre \*/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Şifreyi Onayla/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Kayıt Ol/i })).toBeInTheDocument();
        });
    });

    it('shows validation errors for empty required fields', async () => {
        renderWithProviders(<Register />);

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: /Kayıt Ol/i });
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/Ad soyad gereklidir/i)).toBeInTheDocument();
            expect(screen.getByText(/E-posta adresi .edu uzantılı olmalıdır/i)).toBeInTheDocument();
            expect(screen.getByText(/Şifre en az 8 karakter olmalıdır/i)).toBeInTheDocument();
        });
    });

    it('shows validation error for invalid email', async () => {
        renderWithProviders(<Register />);

        await waitFor(() => {
            const emailInput = screen.getByLabelText(/E-posta/i);
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

            const submitButton = screen.getByRole('button', { name: /Kayıt Ol/i });
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/Geçersiz e-posta formatı/i)).toBeInTheDocument();
        });
    });

    it('handles successful registration for student', async () => {
        api.post.mockResolvedValueOnce({
            data: { success: true }
        });

        renderWithProviders(<Register />);

        // Wait for departments to load
        await waitFor(() => {
            expect(screen.getByText(/Computer Engineering/i)).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/Ad Soyad/i), { target: { value: 'Test Student' } });
        fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'student@univ.edu' } });
        fireEvent.change(screen.getByLabelText(/^Şifre \*/i), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByLabelText(/Şifreyi Onayla/i), { target: { value: 'Password123' } });
        
        // Select department
        const departmentSelect = screen.getByLabelText(/Bölüm/i);
        fireEvent.change(departmentSelect, { target: { value: '1' } });

        // Accept terms
        const termsCheckbox = screen.getByLabelText(/Şartlar ve koşulları kabul ediyorum/i);
        fireEvent.click(termsCheckbox);

        // Fill student specific field
        const studentNumberInput = screen.getByLabelText(/Öğrenci Numarası/i);
        fireEvent.change(studentNumberInput, { target: { value: '123456' } });

        const submitButton = screen.getByRole('button', { name: /Kayıt Ol/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
                email: 'student@univ.edu',
                role: 'student',
                student_number: '123456',
                department_id: '1'
            }));
        });

        await waitFor(() => {
            expect(screen.getByText(/Kayıt başarılı/i)).toBeInTheDocument();
        });

        act(() => {
            jest.runAllTimers();
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('handles role switching to faculty and validation', async () => {
        renderWithProviders(<Register />);

        await waitFor(() => {
            const roleSelect = screen.getByLabelText(/Kullanıcı Tipi/i);
            fireEvent.change(roleSelect, { target: { value: 'faculty' } });
        });

        await waitFor(() => {
            expect(screen.getByLabelText(/Personel Numarası/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Ünvan/i)).toBeInTheDocument();
            expect(screen.queryByLabelText(/Öğrenci Numarası/i)).not.toBeInTheDocument();
        });
    });

    it('handles registration failure', async () => {
        const error = new Error('API Error');
        error.response = {
            data: {
                message: 'Bu e-posta adresi zaten kayıtlı'
            }
        };
        api.post.mockRejectedValueOnce(error);

        renderWithProviders(<Register />);

        // Wait for departments to load
        await waitFor(() => {
            expect(screen.getByText(/Computer Engineering/i)).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText(/Ad Soyad/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/E-posta/i), { target: { value: 'existing@univ.edu' } });
        fireEvent.change(screen.getByLabelText(/^Şifre \*/i), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByLabelText(/Şifreyi Onayla/i), { target: { value: 'Password123' } });
        
        const departmentSelect = screen.getByLabelText(/Bölüm/i);
        fireEvent.change(departmentSelect, { target: { value: '1' } });

        fireEvent.click(screen.getByLabelText(/Şartlar ve koşulları kabul ediyorum/i));
        fireEvent.change(screen.getByLabelText(/Öğrenci Numarası/i), { target: { value: '123456' } });

        const submitButton = screen.getByRole('button', { name: /Kayıt Ol/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Check for either specific or generic error message
            const errorMessage = screen.queryByText(/Bu e-posta adresi zaten kayıtlı/i) || screen.queryByText(/Kayıt başarısız/i);
            expect(errorMessage).toBeInTheDocument();
        });
    });
});
