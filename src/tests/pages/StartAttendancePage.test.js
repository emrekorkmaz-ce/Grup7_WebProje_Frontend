import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StartAttendancePage from '../../pages/StartAttendancePage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/Icons', () => ({
    MegaphoneIcon: () => <div>MegaphoneIcon</div>,
    CheckCircleIcon: () => <div>CheckCircleIcon</div>,
    CopyIcon: () => <div>CopyIcon</div>,
    BookIcon: () => <div>BookIcon</div>
}));

describe('StartAttendancePage', () => {
    const mockSections = [
        {
            id: '1',
            courseCode: 'CS101',
            courseName: 'Introduction to CS',
            sectionNumber: 1
        },
        {
            id: '2',
            courseCode: 'CS102',
            courseName: 'Advanced CS',
            sectionNumber: 2
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
        global.navigator.clipboard = {
            writeText: jest.fn().mockResolvedValue()
        };
    });

    it('should render start attendance page', () => {
        api.get.mockResolvedValue({ data: mockSections });

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yoklama Oturumu Başlat/i)).toBeInTheDocument();
    });

    it('should fetch and display sections', async () => {
        api.get.mockResolvedValue({ data: mockSections });

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/CS101/i)).toBeInTheDocument();
            expect(screen.getByText(/CS102/i)).toBeInTheDocument();
        });
    });

    it('should display error when sections fetch fails', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Dersler yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should start attendance session', async () => {
        api.get.mockResolvedValue({ data: mockSections });
        api.post.mockResolvedValue({ data: { id: 'session123' } });

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/CS101/i)).toBeInTheDocument();
        });

        const startButton = screen.getByText(/Oturumu Başlat/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/attendance/sessions', expect.objectContaining({
                section_id: '1',
                date: expect.any(String),
                start_time: expect.any(String),
                end_time: expect.any(String),
                latitude: 41.0082,
                longitude: 28.9784
            }));
        });
    });

    it('should display error when starting session fails', async () => {
        api.get.mockResolvedValue({ data: mockSections });
        api.post.mockRejectedValue({ response: { data: { error: 'Session failed' } } });

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/CS101/i)).toBeInTheDocument();
        });

        const startButton = screen.getByText(/Oturumu Başlat/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Yoklama başlatılamadı/i)).toBeInTheDocument();
        });
    });

    it('should display QR code and URL after session starts', async () => {
        api.get.mockResolvedValue({ data: mockSections });
        api.post.mockResolvedValue({ data: { id: 'session123' } });

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/CS101/i)).toBeInTheDocument();
        });

        const startButton = screen.getByText(/Oturumu Başlat/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Oturum Aktif/i)).toBeInTheDocument();
            expect(screen.getByText(/session123/i)).toBeInTheDocument();
            expect(screen.getByText(/QR Kodu Tarayın/i)).toBeInTheDocument();
        });
    });

    it('should copy URL to clipboard', async () => {
        api.get.mockResolvedValue({ data: mockSections });
        api.post.mockResolvedValue({ data: { id: 'session123' } });

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/CS101/i)).toBeInTheDocument();
        });

        const startButton = screen.getByText(/Oturumu Başlat/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Kopyala/i)).toBeInTheDocument();
        });

        const copyButton = screen.getByText(/Kopyala/i);
        fireEvent.click(copyButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('URL kopyalandı!');
        });
    });

    it('should prevent starting session without section selection', async () => {
        api.get.mockResolvedValue({ data: mockSections });

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/CS101/i)).toBeInTheDocument();
        });

        // Change selection to empty
        const select = screen.getByDisplayValue(/CS101/i);
        fireEvent.change(select, { target: { value: '' } });

        const startButton = screen.getByText(/Oturumu Başlat/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Lütfen bir ders seçiniz/i)).toBeInTheDocument();
        });
    });

    it('should disable start button when loading', async () => {
        api.get.mockResolvedValue({ data: mockSections });
        api.post.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <StartAttendancePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/CS101/i)).toBeInTheDocument();
        });

        const startButton = screen.getByText(/Oturumu Başlat/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Başlatılıyor/i)).toBeInTheDocument();
            expect(startButton).toBeDisabled();
        });
    });
});

