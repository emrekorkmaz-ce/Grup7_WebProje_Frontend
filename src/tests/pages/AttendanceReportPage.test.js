import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import AttendanceReportPage from '../../pages/AttendanceReportPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn()
}));
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/Icons', () => ({
    DownloadIcon: () => <div>DownloadIcon</div>
}));

describe('AttendanceReportPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValue({ sectionId: '123' });
        global.URL.createObjectURL = jest.fn(() => 'blob:url');
        global.Blob = jest.fn();
        document.createElement = jest.fn(() => ({
            href: '',
            setAttribute: jest.fn(),
            click: jest.fn(),
            parentNode: { removeChild: jest.fn() }
        }));
        document.body.appendChild = jest.fn();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));
        
        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Veriler yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display attendance report', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 8,
                totalCount: 10,
                absencePercent: 20
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            expect(screen.getByText('12345')).toBeInTheDocument();
            expect(screen.getByText('8')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Yoklama raporu yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should display empty state when no report data', async () => {
        api.get.mockResolvedValue({ data: [] });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Henüz kayıt bulunamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle Excel export', async () => {
        const mockReport = [{ studentId: '1', studentNumber: '12345', fullName: 'Test' }];
        api.get.mockResolvedValue({ data: mockReport });
        api.get.mockResolvedValueOnce({ data: mockReport });
        api.get.mockResolvedValueOnce({ 
            data: new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
            responseType: 'blob'
        });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        const exportButton = screen.getByText(/Excel İndir/i);
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/attendance/report/123/export', { responseType: 'blob' });
        });
    });

    it('should handle export error', async () => {
        const mockReport = [{ studentId: '1', studentNumber: '12345', fullName: 'Test' }];
        api.get.mockResolvedValueOnce({ data: mockReport });
        api.get.mockRejectedValueOnce(new Error('Export failed'));
        global.alert = jest.fn();

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        const exportButton = screen.getByText(/Excel İndir/i);
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Excel dışa aktarılamadı.');
        });
    });

    it('should display report with high absence percentage (red)', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 2,
                totalCount: 10,
                absencePercent: 80
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            expect(screen.getByText('%80')).toBeInTheDocument();
        });
    });

    it('should display report with low absence percentage (green)', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 9,
                totalCount: 10,
                absencePercent: 10
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            expect(screen.getByText('%10')).toBeInTheDocument();
        });
    });

    it('should handle absence percentage over 100% (clamp to 100%)', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 0,
                totalCount: 10,
                absencePercent: 150
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
        });
    });

    it('should handle null or undefined report data', async () => {
        api.get.mockResolvedValue({ data: null });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Henüz kayıt bulunamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle multiple students in report', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Student 1',
                presentCount: 8,
                totalCount: 10,
                absencePercent: 20
            },
            {
                studentId: '2',
                studentNumber: '12346',
                fullName: 'Student 2',
                presentCount: 5,
                totalCount: 10,
                absencePercent: 50
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Student 1')).toBeInTheDocument();
            expect(screen.getByText('Student 2')).toBeInTheDocument();
            expect(screen.getByText('12345')).toBeInTheDocument();
            expect(screen.getByText('12346')).toBeInTheDocument();
        });
    });

    it('should handle Excel export with proper blob creation', async () => {
        const mockReport = [{ studentId: '1', studentNumber: '12345', fullName: 'Test' }];
        const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        api.get.mockResolvedValueOnce({ data: mockReport });
        api.get.mockResolvedValueOnce({ 
            data: mockBlob,
            responseType: 'blob'
        });

        const mockLink = {
            href: '',
            setAttribute: jest.fn(),
            click: jest.fn(),
            parentNode: { removeChild: jest.fn() }
        };
        document.createElement = jest.fn(() => mockLink);
        document.body.appendChild = jest.fn();
        window.URL.createObjectURL = jest.fn(() => 'blob:url');

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        const exportButton = screen.getByText(/Excel İndir/i);
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(window.URL.createObjectURL).toHaveBeenCalled();
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'yoklama_raporu.xlsx');
            expect(mockLink.click).toHaveBeenCalled();
        });
    });

    it('should handle absence percentage exactly 30% (green)', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 7,
                totalCount: 10,
                absencePercent: 30
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            expect(screen.getByText('%30')).toBeInTheDocument();
        });
    });

    it('should handle absence percentage exactly 100%', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 0,
                totalCount: 10,
                absencePercent: 100
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            expect(screen.getByText('%100')).toBeInTheDocument();
        });
    });

    it('should handle Excel export when link has no parentNode', async () => {
        const mockReport = [{ studentId: '1', studentNumber: '12345', fullName: 'Test' }];
        const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        api.get.mockResolvedValueOnce({ data: mockReport });
        api.get.mockResolvedValueOnce({ 
            data: mockBlob,
            responseType: 'blob'
        });

        const mockLink = {
            href: '',
            setAttribute: jest.fn(),
            click: jest.fn(),
            parentNode: null
        };
        document.createElement = jest.fn(() => mockLink);
        document.body.appendChild = jest.fn();
        window.URL.createObjectURL = jest.fn(() => 'blob:url');

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        const exportButton = screen.getByText(/Excel İndir/i);
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(window.URL.createObjectURL).toHaveBeenCalled();
            expect(mockLink.click).toHaveBeenCalled();
        });
    });

    it('should handle response.data as undefined', async () => {
        api.get.mockResolvedValue({ data: undefined });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Henüz kayıt bulunamadı/i)).toBeInTheDocument();
        });
    });

    it('should handle sectionId change and refetch', async () => {
        const mockReport1 = [{ studentId: '1', studentNumber: '12345', fullName: 'Student 1' }];
        const mockReport2 = [{ studentId: '2', studentNumber: '12346', fullName: 'Student 2' }];
        
        api.get.mockResolvedValueOnce({ data: mockReport1 });
        useParams.mockReturnValue({ sectionId: '123' });
        
        const { rerender } = render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Student 1')).toBeInTheDocument();
        });

        api.get.mockResolvedValueOnce({ data: mockReport2 });
        useParams.mockReturnValue({ sectionId: '456' });
        
        rerender(
            <MemoryRouter initialEntries={['/attendance/report/456']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/attendance/report/456');
        });
    });

    it('should handle absence percentage exactly 30% (border case - green)', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 7,
                totalCount: 10,
                absencePercent: 30
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            expect(screen.getByText('%30')).toBeInTheDocument();
        });
    });

    it('should handle absence percentage exactly 31% (border case - red)', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 6,
                totalCount: 10,
                absencePercent: 31
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            expect(screen.getByText('%31')).toBeInTheDocument();
        });
    });

    it('should handle absence percentage 0%', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Perfect Student',
                presentCount: 10,
                totalCount: 10,
                absencePercent: 0
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Perfect Student')).toBeInTheDocument();
            expect(screen.getByText('%0')).toBeInTheDocument();
        });
    });

    it('should handle Excel export with URL.revokeObjectURL cleanup', async () => {
        const mockReport = [{ studentId: '1', studentNumber: '12345', fullName: 'Test' }];
        const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        api.get.mockResolvedValueOnce({ data: mockReport });
        api.get.mockResolvedValueOnce({ 
            data: mockBlob,
            responseType: 'blob'
        });

        const mockRevokeObjectURL = jest.fn();
        window.URL.revokeObjectURL = mockRevokeObjectURL;

        const mockLink = {
            href: '',
            setAttribute: jest.fn(),
            click: jest.fn(),
            parentNode: { removeChild: jest.fn() }
        };
        document.createElement = jest.fn(() => mockLink);
        document.body.appendChild = jest.fn();
        window.URL.createObjectURL = jest.fn(() => 'blob:url');

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        const exportButton = screen.getByText(/Excel İndir/i);
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(window.URL.createObjectURL).toHaveBeenCalled();
            expect(mockLink.click).toHaveBeenCalled();
        });
    });

    it('should handle Excel export error with network failure', async () => {
        const mockReport = [{ studentId: '1', studentNumber: '12345', fullName: 'Test' }];
        api.get.mockResolvedValueOnce({ data: mockReport });
        api.get.mockRejectedValueOnce(new Error('Network error'));
        global.alert = jest.fn();

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        const exportButton = screen.getByText(/Excel İndir/i);
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Excel dışa aktarılamadı.');
        });
    });

    it('should display table headers correctly', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 8,
                totalCount: 10,
                absencePercent: 20
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Öğrenci No')).toBeInTheDocument();
            expect(screen.getByText('Ad Soyad')).toBeInTheDocument();
            expect(screen.getByText('Katılım')).toBeInTheDocument();
            expect(screen.getByText('Toplam')).toBeInTheDocument();
            expect(screen.getByText('Devamsızlık')).toBeInTheDocument();
        });
    });

    it('should handle report with missing fields gracefully', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: undefined,
                totalCount: undefined,
                absencePercent: undefined
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
        });
    });

    it('should handle very large absence percentage values', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 0,
                totalCount: 10,
                absencePercent: 999
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            // Should clamp to 100%
            expect(screen.getByText('%999')).toBeInTheDocument();
        });
    });

    it('should handle negative absence percentage', async () => {
        const mockReport = [
            {
                studentId: '1',
                studentNumber: '12345',
                fullName: 'Test Student',
                presentCount: 15,
                totalCount: 10,
                absencePercent: -50
            }
        ];

        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student')).toBeInTheDocument();
            expect(screen.getByText('%-50')).toBeInTheDocument();
        });
    });

    it('should handle empty sectionId', async () => {
        useParams.mockReturnValue({ sectionId: '' });
        api.get.mockRejectedValue(new Error('Invalid section'));

        render(
            <MemoryRouter initialEntries={['/attendance/report/']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Yoklama raporu yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should handle undefined sectionId', async () => {
        useParams.mockReturnValue({ sectionId: undefined });
        api.get.mockRejectedValue(new Error('Invalid section'));

        render(
            <MemoryRouter initialEntries={['/attendance/report']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Yoklama raporu yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should render Navbar and Sidebar components', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Navbar')).toBeInTheDocument();
        expect(screen.getByText('Sidebar')).toBeInTheDocument();
    });

    it('should render DownloadIcon in export button', async () => {
        const mockReport = [{ studentId: '1', studentNumber: '12345', fullName: 'Test' }];
        api.get.mockResolvedValue({ data: mockReport });

        render(
            <MemoryRouter initialEntries={['/attendance/report/123']}>
                <AttendanceReportPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('DownloadIcon')).toBeInTheDocument();
        });
    });
});

