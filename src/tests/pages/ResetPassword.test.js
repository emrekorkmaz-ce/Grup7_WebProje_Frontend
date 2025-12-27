import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ResetPassword from '../../pages/ResetPassword';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useParams: jest.fn()
}));
jest.mock('../../components/Icons', () => ({
    GraduationCapIcon: () => <div>GraduationCapIcon</div>
}));

describe('ResetPassword', () => {
    const mockNavigate = jest.fn();
    const { useParams } = require('react-router-dom');

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useParams.mockReturnValue({ token: 'token123' });
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should render reset password form', () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        expect(screen.getByText(/Şifreyi Sıfırla/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    });

    it('should handle password input', () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });

        expect(passwordInput.value).toBe('NewPassword123');
    });

    it('should handle confirm password input', () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });

        expect(confirmInput.value).toBe('NewPassword123');
    });

    it('should submit form with valid passwords', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
                token: 'token123',
                password: 'NewPassword123',
                confirmPassword: 'NewPassword123'
            });
        });
    });

    it('should display success message and redirect', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre başarıyla sıfırlandı/i)).toBeInTheDocument();
        });

        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('should display error message on failure', async () => {
        api.post.mockRejectedValue({
            response: { data: { error: 'Invalid token' } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid token/i)).toBeInTheDocument();
        });
    });

    it('should display validation error for password mismatch', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'DifferentPassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifreler eşleşmelidir/i)).toBeInTheDocument();
        });
    });

    it('should display validation error for short password', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'Short1' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre en az 8 karakter/i)).toBeInTheDocument();
        });
    });

    it('should disable submit button when loading', async () => {
        api.post.mockImplementation(() => new Promise(() => { }));

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(screen.getByText(/Sıfırlanıyor/i)).toBeInTheDocument();
        });
    });

    it('should display validation error for missing uppercase letter', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre en az bir büyük harf/i)).toBeInTheDocument();
        });
    });

    it('should display validation error for missing lowercase letter', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'PASSWORD123' } });
        fireEvent.change(confirmInput, { target: { value: 'PASSWORD123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre en az bir küçük harf/i)).toBeInTheDocument();
        });
    });

    it('should display validation error for missing number', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'Password' } });
        fireEvent.change(confirmInput, { target: { value: 'Password' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre en az bir rakam/i)).toBeInTheDocument();
        });
    });

    it('should display validation error for missing password', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre gereklidir/i)).toBeInTheDocument();
        });
    });

    it('should display validation error for missing confirm password', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Lütfen şifrenizi onaylayın/i)).toBeInTheDocument();
        });
    });

    it('should handle error with object error data', async () => {
        api.post.mockRejectedValue({
            response: { data: { error: { message: 'Object error message' } } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Object error message/i)).toBeInTheDocument();
        });
    });

    it('should handle error without response', async () => {
        api.post.mockRejectedValue({
            message: 'Network error'
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre sıfırlanamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle error with JSON stringified object', async () => {
        const errorObject = { code: 'INVALID_TOKEN', details: 'Token expired' };
        api.post.mockRejectedValue({
            response: { data: { error: errorObject } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            const errorElement = screen.getByText(/Token expired/i);
            expect(errorElement).toBeInTheDocument();
        });
    });

    it('should clear error and success messages on new submission', async () => {
        api.post.mockRejectedValueOnce({
            response: { data: { error: 'First error' } }
        });
        api.post.mockResolvedValueOnce({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/First error/i)).toBeInTheDocument();
        });

        // Second submission
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.queryByText(/First error/i)).not.toBeInTheDocument();
            expect(screen.getByText(/Şifre başarıyla sıfırlandı/i)).toBeInTheDocument();
        });
    });

    it('should not navigate before timeout completes', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre başarıyla sıfırlandı/i)).toBeInTheDocument();
        });

        // Before timeout
        expect(mockNavigate).not.toHaveBeenCalled();

        // Advance time
        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('should handle error object without message property', async () => {
        const errorObject = { code: 'INVALID_TOKEN', details: 'Token expired' };
        api.post.mockRejectedValue({
            response: { data: { error: errorObject } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Should show JSON stringified error
            expect(screen.getByText(/INVALID_TOKEN/i)).toBeInTheDocument();
        });
    });

    it('should handle error with empty object', async () => {
        api.post.mockRejectedValue({
            response: { data: { error: {} } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre sıfırlanamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle error with null error data', async () => {
        api.post.mockRejectedValue({
            response: { data: { error: null } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre sıfırlanamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle error with undefined response.data', async () => {
        api.post.mockRejectedValue({
            response: {}
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre sıfırlanamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle undefined token from useParams', () => {
        useParams.mockReturnValue({ token: undefined });

        render(
            <MemoryRouter initialEntries={['/reset-password']}>
                <ResetPassword />
            </MemoryRouter>
        );

        expect(screen.getByText(/Şifreyi Sıfırla/i)).toBeInTheDocument();

        // Should still be able to submit (token will be undefined in API call)
        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });

        expect(submitButton).toBeInTheDocument();
    });

    it('should clear loading state after error', async () => {
        api.post.mockRejectedValue({
            response: { data: { error: 'Error occurred' } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Error occurred/i)).toBeInTheDocument();
            expect(submitButton).not.toBeDisabled();
        });
    });

    it('should clear loading state after success', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre başarıyla sıfırlandı/i)).toBeInTheDocument();
        });

        // Loading should be cleared
        expect(submitButton).not.toBeDisabled();
    });

    it('should disable inputs when loading', async () => {
        api.post.mockImplementation(() => new Promise(() => { }));

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(passwordInput).toBeDisabled();
            expect(confirmInput).toBeDisabled();
            expect(submitButton).toBeDisabled();
        });
    });

    it('should submit form on Enter key press', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.keyDown(confirmInput, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
                token: 'token123',
                password: 'NewPassword123',
                confirmPassword: 'NewPassword123'
            });
        });
    });

    it('should display all form labels correctly', () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yeni Şifre/i)).toBeInTheDocument();
        expect(screen.getByText(/Şifreyi Onayla/i)).toBeInTheDocument();
        expect(screen.getByText(/Yeni şifrenizi belirleyin/i)).toBeInTheDocument();
    });

    it('should render GraduationCapIcon', () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        expect(screen.getByText('GraduationCapIcon')).toBeInTheDocument();
    });

    it('should handle password with exactly 8 characters', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'Pass1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Pass1234' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
        });
    });

    it('should handle password with special characters', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'Pass123!@#' } });
        fireEvent.change(confirmInput, { target: { value: 'Pass123!@#' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
                token: 'token123',
                password: 'Pass123!@#',
                confirmPassword: 'Pass123!@#'
            });
        });
    });

    it('should handle very long password', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        const longPassword = 'A'.repeat(100) + 'b1';
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: longPassword } });
        fireEvent.change(confirmInput, { target: { value: longPassword } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
        });
    });

    it('should handle error with string error data', async () => {
        api.post.mockRejectedValue({
            response: { data: { error: 'Token has expired' } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Token has expired/i)).toBeInTheDocument();
        });
    });

    it('should handle multiple validation errors sequentially', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        // First: short password
        fireEvent.change(passwordInput, { target: { value: 'Short1' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre en az 8 karakter/i)).toBeInTheDocument();
        });

        // Second: missing uppercase
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre en az bir büyük harf/i)).toBeInTheDocument();
        });
    });

    it('should not submit form when validation fails', async () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.change(confirmInput, { target: { value: 'short' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre en az 8 karakter/i)).toBeInTheDocument();
        });

        expect(api.post).not.toHaveBeenCalled();
    });

    it('should handle success message styling', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            const successMessage = screen.getByText(/Şifre başarıyla sıfırlandı/i);
            expect(successMessage).toBeInTheDocument();
            expect(successMessage.closest('.card')).toBeInTheDocument();
        });
    });

    it('should handle error message display', async () => {
        api.post.mockRejectedValue({
            response: { data: { error: 'Custom error message' } }
        });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            const errorMessage = screen.getByText(/Custom error message/i);
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage.closest('.error')).toBeInTheDocument();
        });
    });

    it('should handle form reset after successful submission', async () => {
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Şifre başarıyla sıfırlandı/i)).toBeInTheDocument();
        });

        // Form should still be accessible (not cleared)
        expect(passwordInput).toBeInTheDocument();
        expect(confirmInput).toBeInTheDocument();
    });

    it('should handle token parameter from URL', () => {
        useParams.mockReturnValue({ token: 'custom-token-123' });

        render(
            <MemoryRouter initialEntries={['/reset-password/custom-token-123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        expect(screen.getByText(/Şifreyi Sıfırla/i)).toBeInTheDocument();
    });

    it('should display loading text during submission', async () => {
        api.post.mockImplementation(() => new Promise(() => { }));

        render(
            <MemoryRouter initialEntries={['/reset-password/token123']}>
                <ResetPassword />
            </MemoryRouter>
        );

        const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
        const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
        const submitButton = screen.getByText(/Şifreyi Sıfırla/i);

        fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPassword123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Sıfırlanıyor/i)).toBeInTheDocument();
            expect(screen.queryByText(/Şifreyi Sıfırla/i)).not.toBeInTheDocument();
        });
    });
});

