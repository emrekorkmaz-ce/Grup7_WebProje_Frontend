import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MySchedulePage from '../../pages/MySchedulePage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('MySchedulePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
        global.URL.createObjectURL = jest.fn(() => 'blob:url');
        global.Blob = jest.fn();
        document.createElement = jest.fn(() => ({
            href: '',
            setAttribute: jest.fn(),
            click: jest.fn(),
            remove: jest.fn()
        }));
        document.body.appendChild = jest.fn();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <MySchedulePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display schedule', async () => {
        const mockSchedule = {
            monday: [
                {
                    courseCode: 'CS101',
                    courseName: 'Intro CS',
                    startTime: '09:00',
                    endTime: '10:30',
                    location: 'Room 101'
                }
            ]
        };

        api.get.mockResolvedValue({ data: { data: mockSchedule } });

        render(
            <MemoryRouter>
                <MySchedulePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
        });
    });

    it('should handle iCal export', async () => {
        const mockSchedule = { monday: [] };
        const mockBlob = new Blob(['test'], { type: 'text/calendar' });
        api.get.mockResolvedValueOnce({ data: { data: mockSchedule } });
        api.get.mockResolvedValueOnce({ data: mockBlob, responseType: 'blob' });

        render(
            <MemoryRouter>
                <MySchedulePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/iCal İndir/i)).toBeInTheDocument();
        });

        const exportButton = screen.getByText(/iCal İndir/i);
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/scheduling/my-schedule/ical', { responseType: 'blob' });
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <MySchedulePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Program yüklenemedi/i)).toBeInTheDocument();
        });
    });
});

