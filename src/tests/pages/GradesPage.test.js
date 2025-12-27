import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import GradesPage from '../../pages/GradesPage';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../services/api');
jest.mock('../../context/AuthContext');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/Icons', () => ({
    DownloadIcon: () => <div>DownloadIcon</div>,
    BookIcon: () => <div>BookIcon</div>
}));

describe('GradesPage', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
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

    describe('Student View', () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ user: { id: '1', role: 'student' } });
        });

        it('should render loading state initially', () => {
            api.get.mockImplementation(() => new Promise(() => {}));

            render(
                <MemoryRouter>
                    <GradesPage />
                </MemoryRouter>
            );

            expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
        });

        it('should fetch and display student grades', async () => {
            const mockGrades = {
                grades: [
                    { courseCode: 'CS101', courseName: 'Intro CS', grade: 'A', credits: 3 }
                ],
                gpa: 3.5,
                cgpa: 3.4
            };

            api.get.mockResolvedValue({ data: mockGrades });

            render(
                <MemoryRouter>
                    <GradesPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText('CS101')).toBeInTheDocument();
                expect(screen.getByText('Intro CS')).toBeInTheDocument();
            });
        });

        it('should display GPA and CGPA', async () => {
            const mockGrades = {
                grades: [],
                gpa: 3.5,
                cgpa: 3.4
            };

            api.get.mockResolvedValue({ data: mockGrades });

            render(
                <MemoryRouter>
                    <GradesPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/3.5/i)).toBeInTheDocument();
                expect(screen.getByText(/3.4/i)).toBeInTheDocument();
            });
        });

        it('should handle transcript download', async () => {
            const mockGrades = { grades: [], gpa: 3.5, cgpa: 3.4 };
            const mockBlob = new Blob(['test'], { type: 'application/pdf' });
            api.get.mockResolvedValueOnce({ data: mockGrades });
            api.get.mockResolvedValueOnce({ data: mockBlob, responseType: 'blob' });

            render(
                <MemoryRouter>
                    <GradesPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/Transkript İndir/i)).toBeInTheDocument();
            });

            const downloadButton = screen.getByText(/Transkript İndir/i);
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/student/transcript', { responseType: 'blob' });
            });
        });

        it('should display error message on fetch failure', async () => {
            api.get.mockRejectedValue(new Error('Network error'));

            render(
                <MemoryRouter>
                    <GradesPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/Notlar yüklenemedi/i)).toBeInTheDocument();
            });
        });
    });

    describe('Faculty View', () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ user: { id: '1', role: 'faculty' } });
        });

        it('should fetch and display faculty sections', async () => {
            const mockSections = [
                { id: '1', courseCode: 'CS101', courseName: 'Intro CS' }
            ];

            api.get.mockResolvedValue({ data: { data: mockSections } });

            render(
                <MemoryRouter>
                    <GradesPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText('CS101')).toBeInTheDocument();
            });
        });

        it('should navigate to gradebook on section click', async () => {
            const mockSections = [
                { id: '1', courseCode: 'CS101', courseName: 'Intro CS' }
            ];

            api.get.mockResolvedValue({ data: { data: mockSections } });

            render(
                <MemoryRouter>
                    <GradesPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText('CS101')).toBeInTheDocument();
            });

            const sectionCard = screen.getByText('CS101').closest('.card');
            if (sectionCard) {
                fireEvent.click(sectionCard);
                expect(mockNavigate).toHaveBeenCalledWith('/gradebook/1');
            }
        });
    });
});

