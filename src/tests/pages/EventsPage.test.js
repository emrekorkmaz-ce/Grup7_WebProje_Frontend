import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import EventsPage from '../../pages/EventsPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('EventsPage', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <EventsPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display events', async () => {
        const mockEvents = [
            {
                id: '1',
                title: 'Tech Conference',
                description: 'A great conference',
                category: 'conference',
                startDate: '2024-01-01',
                location: 'Main Hall'
            }
        ];

        api.get.mockResolvedValue({ data: { data: mockEvents } });

        render(
            <MemoryRouter>
                <EventsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Tech Conference')).toBeInTheDocument();
        });
    });

    it('should filter events by category', async () => {
        const mockEvents = [
            {
                id: '1',
                title: 'Tech Conference',
                category: 'conference'
            },
            {
                id: '2',
                title: 'Workshop',
                category: 'workshop'
            }
        ];

        api.get.mockResolvedValue({ data: { data: mockEvents } });

        render(
            <MemoryRouter>
                <EventsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Tech Conference')).toBeInTheDocument();
        });

        const workshopButton = screen.getByText('Workshop');
        fireEvent.click(workshopButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/events', { params: { status: 'published', category: 'workshop' } });
        });
    });

    it('should filter events by search term', async () => {
        const mockEvents = [
            {
                id: '1',
                title: 'Tech Conference',
                category: 'conference'
            },
            {
                id: '2',
                title: 'Workshop',
                category: 'workshop'
            }
        ];

        api.get.mockResolvedValue({ data: { data: mockEvents } });

        render(
            <MemoryRouter>
                <EventsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Tech Conference')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/Etkinlik ara/i);
        fireEvent.change(searchInput, { target: { value: 'Tech' } });

        await waitFor(() => {
            expect(screen.getByText('Tech Conference')).toBeInTheDocument();
            expect(screen.queryByText('Workshop')).not.toBeInTheDocument();
        });
    });

    it('should navigate to event detail on click', async () => {
        const mockEvents = [
            {
                id: '1',
                title: 'Tech Conference',
                category: 'conference'
            }
        ];

        api.get.mockResolvedValue({ data: { data: mockEvents } });

        render(
            <MemoryRouter>
                <EventsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Tech Conference')).toBeInTheDocument();
        });

        const eventCard = screen.getByText('Tech Conference').closest('.card');
        if (eventCard) {
            fireEvent.click(eventCard);
            expect(mockNavigate).toHaveBeenCalledWith('/events/1');
        }
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <EventsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Etkinlikler yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should display empty state when no events', async () => {
        api.get.mockResolvedValue({ data: { data: [] } });

        render(
            <MemoryRouter>
                <EventsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(/Etkinlik/i)).not.toBeInTheDocument();
        });
    });
});

