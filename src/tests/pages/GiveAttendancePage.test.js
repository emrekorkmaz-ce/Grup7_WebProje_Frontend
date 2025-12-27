import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GiveAttendancePage from '../../pages/GiveAttendancePage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/Icons', () => ({
    MapPinIcon: () => <div>MapPinIcon</div>,
    CheckCircleIcon: () => <div>CheckCircleIcon</div>
}));

describe('GiveAttendancePage', () => {
    const mockGeolocation = {
        getCurrentPosition: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.navigator.geolocation = mockGeolocation;
    });

    it('should render loading state when getting location', () => {
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            setTimeout(() => success({
                coords: { latitude: 41.0082, longitude: 28.9784 }
            }), 100);
        });

        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <GiveAttendancePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Konum alınıyor/i)).toBeInTheDocument();
    });

    it('should display error when geolocation is not available', () => {
        delete global.navigator.geolocation;

        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <GiveAttendancePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Cihazınızda konum servisi bulunamadı/i)).toBeInTheDocument();
    });

    it('should display location when successfully retrieved', async () => {
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success({
                coords: { latitude: 41.0082, longitude: 28.9784 }
            });
        });

        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <GiveAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Konumunuz Algılandı/i)).toBeInTheDocument();
            expect(screen.getByText(/41.00820/i)).toBeInTheDocument();
            expect(screen.getByText(/28.97840/i)).toBeInTheDocument();
        });
    });

    it('should display error when location access denied', async () => {
        mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
            error({ code: 1, message: 'Permission denied' });
        });

        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <GiveAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Konum alınamadı/i)).toBeInTheDocument();
        });
    });

    it('should submit attendance when button clicked', async () => {
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success({
                coords: { latitude: 41.0082, longitude: 28.9784 }
            });
        });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <GiveAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Buradayım/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Buradayım/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/student/attendance/give/123', {
                location: { lat: 41.0082, lng: 28.9784 }
            });
        });
    });

    it('should display success message after submission', async () => {
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success({
                coords: { latitude: 41.0082, longitude: 28.9784 }
            });
        });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <GiveAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Buradayım/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Buradayım/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Yoklama Başarılı/i)).toBeInTheDocument();
        });
    });

    it('should display error on submission failure', async () => {
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success({
                coords: { latitude: 41.0082, longitude: 28.9784 }
            });
        });
        api.post.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <GiveAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Buradayım/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByText(/Buradayım/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Yoklama verilemedi/i)).toBeInTheDocument();
        });
    });

    it('should show retry button on error', async () => {
        mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
            error({ code: 1, message: 'Permission denied' });
        });

        render(
            <MemoryRouter initialEntries={['/attendance/give/123']}>
                <GiveAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Tekrar Dene/i)).toBeInTheDocument();
        });
    });
});

