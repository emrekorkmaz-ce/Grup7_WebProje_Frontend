import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WalletPage from '../../pages/WalletPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('WalletPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
        delete window.location;
        window.location = { href: '' };
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display wallet balance', async () => {
        const mockWallet = {
            balance: 100.50,
            currency: 'TRY'
        };

        const mockTransactions = [];

        api.get.mockResolvedValueOnce({ data: { data: mockWallet } });
        api.get.mockResolvedValueOnce({ data: { data: mockTransactions } });

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/100.50/i)).toBeInTheDocument();
        });
    });

    it('should fetch and display transactions', async () => {
        const mockWallet = { balance: 100 };
        const mockTransactions = [
            {
                id: '1',
                type: 'credit',
                amount: 50,
                description: 'Top-up',
                createdAt: '2024-01-15T10:00:00Z'
            }
        ];

        api.get.mockResolvedValueOnce({ data: { data: mockWallet } });
        api.get.mockResolvedValueOnce({ data: { data: mockTransactions } });

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Top-up/i)).toBeInTheDocument();
        });
    });

    it('should handle topup with valid amount', async () => {
        const mockWallet = { balance: 100 };
        const mockTransactions = [];
        const mockPaymentUrl = 'https://payment.example.com/pay';

        api.get.mockResolvedValueOnce({ data: { data: mockWallet } });
        api.get.mockResolvedValueOnce({ data: { data: mockTransactions } });
        api.post.mockResolvedValue({ data: { data: { paymentUrl: mockPaymentUrl } } });

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Para Yükle/i)).toBeInTheDocument();
        });

        const topupButton = screen.getByText(/Para Yükle/i);
        fireEvent.click(topupButton);

        await waitFor(() => {
            const amountInput = screen.getByPlaceholderText(/Miktar/i);
            fireEvent.change(amountInput, { target: { value: '100' } });

            const submitButton = screen.getByText(/Yükle/i);
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/wallet/topup', { amount: 100 });
        });
    });

    it('should reject topup with amount less than 50', async () => {
        const mockWallet = { balance: 100 };
        const mockTransactions = [];

        api.get.mockResolvedValueOnce({ data: { data: mockWallet } });
        api.get.mockResolvedValueOnce({ data: { data: mockTransactions } });

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            const topupButton = screen.getByText(/Para Yükle/i);
            fireEvent.click(topupButton);

            const amountInput = screen.getByPlaceholderText(/Miktar/i);
            fireEvent.change(amountInput, { target: { value: '30' } });

            const submitButton = screen.getByText(/Yükle/i);
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Minimum yükleme tutarı 50 TRY\'dir.');
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Cüzdan bilgileri yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should handle pagination', async () => {
        const mockWallet = { balance: 100 };
        const mockTransactions = [];
        const mockPagination = { pages: 3 };

        api.get.mockResolvedValueOnce({ data: { data: mockWallet } });
        api.get.mockResolvedValueOnce({ data: { data: mockTransactions, pagination: mockPagination } });

        render(
            <MemoryRouter>
                <WalletPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/wallet/transactions', { params: { page: 1, limit: 20 } });
        });
    });
});

