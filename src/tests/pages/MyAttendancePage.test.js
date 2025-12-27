import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyAttendancePage from '../../pages/MyAttendancePage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('MyAttendancePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <MyAttendancePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display attendance data', async () => {
        const mockAttendance = [
            {
                id: '1',
                courseCode: 'CS101',
                courseName: 'Intro CS',
                date: '2024-01-01',
                status: 'present'
            }
        ];

        const mockSummary = [
            {
                courseCode: 'CS101',
                presentCount: 10,
                absentCount: 2,
                totalCount: 12
            }
        ];

        api.get.mockResolvedValueOnce({ data: mockAttendance });
        api.get.mockResolvedValueOnce({ data: mockSummary });

        render(
            <MemoryRouter>
                <MyAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <MyAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Yoklama verileri yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should display empty state when no attendance data', async () => {
        api.get.mockResolvedValueOnce({ data: [] });
        api.get.mockResolvedValueOnce({ data: [] });

        render(
            <MemoryRouter>
                <MyAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(/Yoklama/i)).not.toBeInTheDocument();
        });
    });
});

