import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClassroomReservationsPage from '../../pages/ClassroomReservationsPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('ClassroomReservationsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <ClassroomReservationsPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display reservations', async () => {
        const mockReservations = [
            {
                id: '1',
                classroom: { building: 'A', room_number: '101', capacity: 50 },
                date: '2024-01-15',
                start_time: '09:00',
                end_time: '10:30',
                purpose: 'Lecture',
                status: 'approved'
            }
        ];

        const mockClassrooms = [
            { id: '1', building: 'A', room_number: '101', capacity: 50 }
        ];

        api.get.mockResolvedValueOnce({ data: { data: mockReservations } });
        api.get.mockResolvedValueOnce({ data: { data: mockClassrooms } });

        render(
            <MemoryRouter>
                <ClassroomReservationsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/A 101/i)).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValueOnce(new Error('Network error'));
        api.get.mockRejectedValueOnce(new Error('Network error'));

        render(
            <MemoryRouter>
                <ClassroomReservationsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Derslikler yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should show form when create button is clicked', async () => {
        api.get.mockResolvedValueOnce({ data: { data: [] } });
        api.get.mockResolvedValueOnce({ data: { data: [] } });

        render(
            <MemoryRouter>
                <ClassroomReservationsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            const createButton = screen.getByText(/Yeni Rezervasyon/i);
            fireEvent.click(createButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/Yeni Rezervasyon/i)).toBeInTheDocument();
        });
    });

    it('should handle form submission', async () => {
        const mockClassrooms = [
            { id: '1', building: 'A', room_number: '101', capacity: 50 }
        ];

        api.get.mockResolvedValueOnce({ data: { data: [] } });
        api.get.mockResolvedValueOnce({ data: { data: mockClassrooms } });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter>
                <ClassroomReservationsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            const createButton = screen.getByText(/Yeni Rezervasyon/i);
            fireEvent.click(createButton);
        });

        await waitFor(() => {
            const submitButton = screen.getByText(/Rezerve Et/i);
            if (submitButton) {
                fireEvent.click(submitButton);
            }
        });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/reservations', expect.any(Object));
        });
    });

    it('should display status badges correctly', async () => {
        const mockReservations = [
            {
                id: '1',
                classroom: { building: 'A', room_number: '101', capacity: 50 },
                date: '2024-01-15',
                start_time: '09:00',
                end_time: '10:30',
                purpose: 'Lecture',
                status: 'approved'
            },
            {
                id: '2',
                classroom: { building: 'A', room_number: '102', capacity: 30 },
                date: '2024-01-16',
                start_time: '11:00',
                end_time: '12:30',
                purpose: 'Meeting',
                status: 'pending'
            }
        ];

        api.get.mockResolvedValueOnce({ data: { data: mockReservations } });
        api.get.mockResolvedValueOnce({ data: { data: [] } });

        render(
            <MemoryRouter>
                <ClassroomReservationsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Onaylandı')).toBeInTheDocument();
            expect(screen.getByText('Beklemede')).toBeInTheDocument();
        });
    });
});

