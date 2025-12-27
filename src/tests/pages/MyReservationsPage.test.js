import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MyReservationsPage from '../../pages/MyReservationsPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('qrcode.react', () => ({
    QRCodeSVG: () => <div data-testid="qr-code">QRCode</div>
}));

describe('MyReservationsPage', () => {
    const mockReservations = [
        {
            id: '1',
            qr_code: 'QR-123',
            status: 'reserved',
            meal_type: 'lunch',
            date: '2025-01-01',
            amount: 25,
            menu: {
                cafeteria: { name: 'Test Cafeteria', location: 'Test Location' },
                items_json: { main: 'Test Meal' }
            }
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
        global.confirm = jest.fn(() => true);
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(<MyReservationsPage />);

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display reservations', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });

        render(<MyReservationsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Rezervasyonlarım/i)).toBeInTheDocument();
            expect(screen.getByText(/Test Cafeteria/i)).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(<MyReservationsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Rezervasyonlar yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should filter reservations by status', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });

        render(<MyReservationsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Tümü/i)).toBeInTheDocument();
        });

        const upcomingButton = screen.getByText(/Yaklaşan/i);
        fireEvent.click(upcomingButton);

        expect(api.get).toHaveBeenCalledWith('/meals/reservations/my-reservations', {
            params: { status: 'reserved' }
        });
    });

    it('should handle reservation cancellation', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });
        api.delete.mockResolvedValue({ data: { success: true } });

        render(<MyReservationsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Test Cafeteria/i)).toBeInTheDocument();
        });

        const cancelButton = screen.getByText(/İptal Et/i);
        if (cancelButton) {
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(api.delete).toHaveBeenCalledWith('/meals/reservations/1');
                expect(global.alert).toHaveBeenCalledWith('Rezervasyon başarıyla iptal edildi.');
            });
        }
    });

    it('should show QR code modal', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });

        render(<MyReservationsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Test Cafeteria/i)).toBeInTheDocument();
        });

        const qrButton = screen.getByText(/QR Kod Göster/i);
        fireEvent.click(qrButton);

        await waitFor(() => {
            expect(screen.getByTestId('qr-code')).toBeInTheDocument();
        });
    });

    it('should close QR code modal', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });

        render(<MyReservationsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Test Cafeteria/i)).toBeInTheDocument();
        });

        const qrButton = screen.getByText(/QR Kod Göster/i);
        fireEvent.click(qrButton);

        await waitFor(() => {
            expect(screen.getByTestId('qr-code')).toBeInTheDocument();
        });

        const closeButton = screen.getByText(/Kapat/i);
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument();
        });
    });

    it('should display empty state when no reservations', async () => {
        api.get.mockResolvedValue({ data: { data: [] } });

        render(<MyReservationsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Rezervasyon bulunmamaktadır/i)).toBeInTheDocument();
        });
    });

    it('should display meal type labels correctly', async () => {
        api.get.mockResolvedValue({ data: { data: mockReservations } });

        render(<MyReservationsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Öğle Yemeği/i)).toBeInTheDocument();
        });
    });
});

