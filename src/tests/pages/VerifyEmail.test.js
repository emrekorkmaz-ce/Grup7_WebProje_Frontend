import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams, useNavigate } from 'react-router-dom';
import VerifyEmail from '../../pages/VerifyEmail';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useNavigate: jest.fn()
}));
jest.mock('../../components/Icons', () => ({
    CheckCircleIcon: () => <div>CheckCircleIcon</div>,
    XCircleIcon: () => <div>XCircleIcon</div>
}));

describe('VerifyEmail', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should render verifying state initially', () => {
        useParams.mockReturnValue({ token: 'test-token' });
        api.post.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <VerifyEmail />
            </MemoryRouter>
        );

        expect(screen.getByText(/Doğrulanıyor/i)).toBeInTheDocument();
    });

    it('should verify email successfully', async () => {
        useParams.mockReturnValue({ token: 'test-token' });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter>
                <VerifyEmail />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/E-posta başarıyla doğrulandı/i)).toBeInTheDocument();
        });

        jest.advanceTimersByTime(3000);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('should handle verification error', async () => {
        useParams.mockReturnValue({ token: 'invalid-token' });
        api.post.mockRejectedValue({
            response: {
                status: 400,
                data: { error: 'Invalid token' }
            }
        });

        render(
            <MemoryRouter>
                <VerifyEmail />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Doğrulama başarısız/i)).toBeInTheDocument();
        });
    });

    it('should handle missing token', async () => {
        useParams.mockReturnValue({ token: undefined });

        render(
            <MemoryRouter>
                <VerifyEmail />
            </MemoryRouter>
        );

        jest.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(screen.getByText(/Doğrulama token'ı bulunamadı/i)).toBeInTheDocument();
        });
    });
});

