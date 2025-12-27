import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MyEventsPage from '../../pages/MyEventsPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('qrcode.react', () => ({
    QRCodeSVG: () => <div data-testid="qr-code">QRCode</div>
}));

describe('MyEventsPage', () => {
    const mockEvents = [
        {
            id: '1',
            title: 'Test Event 1',
            date: '2025-01-01',
            start_time: '10:00',
            end_time: '12:00',
            location: 'Test Location'
        }
    ];

    const mockRegistrations = [
        {
            id: 'reg1',
            qr_code: 'QR-123',
            checked_in: false,
            checked_in_at: null,
            event: mockEvents[0]
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
        global.confirm = jest.fn(() => true);
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(<MyEventsPage />);

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display registrations', async () => {
        api.get.mockResolvedValueOnce({ data: { data: mockEvents } });
        api.get.mockResolvedValueOnce({ data: { data: mockRegistrations } });

        render(<MyEventsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Etkinliklerim/i)).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(<MyEventsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Etkinlik kayıtları yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should filter registrations by all/upcoming/past', async () => {
        api.get.mockResolvedValueOnce({ data: { data: mockEvents } });
        api.get.mockResolvedValueOnce({ data: { data: mockRegistrations } });

        render(<MyEventsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Tümü/i)).toBeInTheDocument();
        });

        const upcomingButton = screen.getByText(/Yaklaşan/i);
        fireEvent.click(upcomingButton);

        expect(screen.getByText(/Yaklaşan/i)).toBeInTheDocument();
    });

    it('should handle registration cancellation', async () => {
        api.get.mockResolvedValueOnce({ data: { data: mockEvents } });
        api.get.mockResolvedValueOnce({ data: { data: mockRegistrations } });
        api.delete.mockResolvedValue({ data: { success: true } });

        render(<MyEventsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Test Event 1/i)).toBeInTheDocument();
        });

        const cancelButton = screen.getByText(/İptal Et/i);
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/events/1/registrations/reg1');
            expect(global.alert).toHaveBeenCalledWith('Kayıt başarıyla iptal edildi.');
        });
    });

    it('should show QR code modal', async () => {
        api.get.mockResolvedValueOnce({ data: { data: mockEvents } });
        api.get.mockResolvedValueOnce({ data: { data: mockRegistrations } });

        render(<MyEventsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Test Event 1/i)).toBeInTheDocument();
        });

        const qrButton = screen.getByText(/QR Kod Göster/i);
        fireEvent.click(qrButton);

        await waitFor(() => {
            expect(screen.getByTestId('qr-code')).toBeInTheDocument();
        });
    });

    it('should close QR code modal', async () => {
        api.get.mockResolvedValueOnce({ data: { data: mockEvents } });
        api.get.mockResolvedValueOnce({ data: { data: mockRegistrations } });

        render(<MyEventsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Test Event 1/i)).toBeInTheDocument();
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

    it('should display empty state when no registrations', async () => {
        api.get.mockResolvedValueOnce({ data: { data: [] } });
        api.get.mockResolvedValueOnce({ data: { data: [] } });

        render(<MyEventsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Etkinlik kaydı bulunmamaktadır/i)).toBeInTheDocument();
        });
    });
});

