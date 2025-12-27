import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import EventDetailPage from '../../pages/EventDetailPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));

describe('EventDetailPage', () => {
    const mockNavigate = jest.fn();
    const mockEvent = {
        id: '1',
        title: 'Test Event',
        date: '2024-12-31',
        start_time: '10:00',
        end_time: '12:00',
        location: 'Test Location',
        capacity: 100,
        registered_count: 50,
        registration_deadline: '2024-12-30',
        category: 'conference',
        is_paid: false,
        description: 'Test description'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        global.alert = jest.fn();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display event details', async () => {
        api.get.mockResolvedValue({ data: { data: mockEvent } });

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
            expect(screen.getByText(/Test Location/i)).toBeInTheDocument();
            expect(screen.getByText(/50 \/ 100 kayıtlı/i)).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Etkinlik yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should handle event registration', async () => {
        api.get.mockResolvedValue({ data: { data: mockEvent } });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        const registerButton = screen.getByText(/Kayıt Ol/i);
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/events/1/register', {
                custom_fields: undefined
            });
            expect(global.alert).toHaveBeenCalledWith('Etkinliğe başarıyla kaydoldunuz!');
            expect(mockNavigate).toHaveBeenCalledWith('/my-events');
        });
    });

    it('should prevent registration when event is full', async () => {
        const fullEvent = { ...mockEvent, registered_count: 100 };
        api.get.mockResolvedValue({ data: { data: fullEvent } });

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        const registerButton = screen.queryByText(/Kayıt Ol/i);
        if (registerButton) {
            fireEvent.click(registerButton);
            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Etkinlik dolu.');
            });
        }
    });

    it('should prevent registration when deadline passed', async () => {
        const pastEvent = { 
            ...mockEvent, 
            registration_deadline: '2020-01-01' 
        };
        api.get.mockResolvedValue({ data: { data: pastEvent } });

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        expect(screen.getByText(/Kayıt süresi dolmuş/i)).toBeInTheDocument();
    });

    it('should handle registration error', async () => {
        api.get.mockResolvedValue({ data: { data: mockEvent } });
        api.post.mockRejectedValue({ response: { data: { error: 'Registration failed' } } });

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        const registerButton = screen.getByText(/Kayıt Ol/i);
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Registration failed');
        });
    });

    it('should navigate back when back button clicked', async () => {
        api.get.mockResolvedValue({ data: { data: mockEvent } });

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Event')).toBeInTheDocument();
        });

        const backButton = screen.getByText(/Geri/i);
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/events');
    });

    it('should display paid badge for paid events', async () => {
        const paidEvent = { ...mockEvent, is_paid: true, price: 50 };
        api.get.mockResolvedValue({ data: { data: paidEvent } });

        render(
            <MemoryRouter initialEntries={['/events/1']}>
                <EventDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Ücretli/i)).toBeInTheDocument();
            expect(screen.getByText(/50 TRY/i)).toBeInTheDocument();
        });
    });
});

