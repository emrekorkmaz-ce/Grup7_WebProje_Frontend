import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Icons', () => ({
    GraduationCapIcon: () => <div>GraduationCapIcon</div>
}));

describe('ForgotPassword', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render forgot password form', () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        expect(screen.getByText(/Şifremi Unuttum/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ornek@uni.edu.tr/i)).toBeInTheDocument();
        expect(screen.getByText(/Sıfırlama Bağlantısı Gönder/i)).toBeInTheDocument();
    });

    it('should handle email input', () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const emailInput = screen.getByPlaceholderText(/ornek@uni.edu.tr/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.edu' } });

        expect(emailInput.value).toBe('test@test.edu');
    });

    it('should submit form with valid email', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const emailInput = screen.getByPlaceholderText(/ornek@uni.edu.tr/i);
        const submitButton = screen.getByText(/Sıfırlama Bağlantısı Gönder/i);

        fireEvent.change(emailInput, { target: { value: 'test@test.edu' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
                email: 'test@test.edu'
            });
        });
    });

    it('should display success message after submission', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const emailInput = screen.getByPlaceholderText(/ornek@uni.edu.tr/i);
        const submitButton = screen.getByText(/Sıfırlama Bağlantısı Gönder/i);

        fireEvent.change(emailInput, { target: { value: 'test@test.edu' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Eğer bu e-posta ile kayıtlı bir hesap varsa/i)).toBeInTheDocument();
        });
    });

    it('should display error message on failure', async () => {
        api.post.mockRejectedValue({ 
            response: { data: { error: 'User not found' } } 
        });

        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const emailInput = screen.getByPlaceholderText(/ornek@uni.edu.tr/i);
        const submitButton = screen.getByText(/Sıfırlama Bağlantısı Gönder/i);

        fireEvent.change(emailInput, { target: { value: 'test@test.edu' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/User not found/i)).toBeInTheDocument();
        });
    });

    it('should disable submit button when loading', async () => {
        api.post.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        const emailInput = screen.getByPlaceholderText(/ornek@uni.edu.tr/i);
        const submitButton = screen.getByText(/Sıfırlama Bağlantısı Gönder/i);

        fireEvent.change(emailInput, { target: { value: 'test@test.edu' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(screen.getByText(/Gönderiliyor/i)).toBeInTheDocument();
        });
    });

    it('should show link to login page', () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );

        expect(screen.getByText(/Giriş yap/i)).toBeInTheDocument();
    });
});

