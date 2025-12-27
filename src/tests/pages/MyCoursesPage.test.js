import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import MyCoursesPage from '../../pages/MyCoursesPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn()
}));
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/Icons', () => ({
    UserIcon: () => <div>UserIcon</div>,
    BookIcon: () => <div>BookIcon</div>,
    CheckCircleIcon: () => <div>CheckCircleIcon</div>,
    ClockIcon: () => <div>ClockIcon</div>
}));

describe('MyCoursesPage', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Dersler yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display courses', async () => {
        const mockCourses = [
            {
                id: '1',
                code: 'CS101',
                name: 'Introduction to Computer Science',
                instructorName: 'Dr. Smith',
                sectionName: 'A',
                status: 'active',
                statusText: 'Aktif'
            },
            {
                id: '2',
                code: 'MATH201',
                name: 'Calculus',
                instructorName: 'Dr. Jones',
                sectionNumber: 'B',
                status: 'active'
            }
        ];

        api.get.mockResolvedValue({ data: mockCourses });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
            expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument();
            expect(screen.getByText('MATH201')).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Dersler yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should display empty state when no courses', async () => {
        api.get.mockResolvedValue({ data: [] });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Henüz kayıtlı dersiniz bulunmamaktadır/i)).toBeInTheDocument();
        });
    });

    it('should navigate to course detail on course click', async () => {
        const mockCourses = [
            {
                id: '1',
                code: 'CS101',
                name: 'Introduction to Computer Science',
                instructorName: 'Dr. Smith',
                sectionName: 'A',
                status: 'active'
            }
        ];

        api.get.mockResolvedValue({ data: mockCourses });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
        });

        const courseCard = screen.getByText('CS101').closest('.card');
        fireEvent.click(courseCard);

        expect(mockNavigate).toHaveBeenCalledWith('/courses/1');
    });

    it('should display course with sectionName', async () => {
        const mockCourses = [
            {
                id: '1',
                code: 'CS101',
                name: 'Introduction to Computer Science',
                instructorName: 'Dr. Smith',
                sectionName: 'Section A',
                status: 'active'
            }
        ];

        api.get.mockResolvedValue({ data: mockCourses });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Şube: Section A/i)).toBeInTheDocument();
        });
    });

    it('should display course with sectionNumber when sectionName is missing', async () => {
        const mockCourses = [
            {
                id: '1',
                code: 'CS101',
                name: 'Introduction to Computer Science',
                instructorName: 'Dr. Smith',
                sectionNumber: 'B',
                status: 'active'
            }
        ];

        api.get.mockResolvedValue({ data: mockCourses });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Şube: B/i)).toBeInTheDocument();
        });
    });

    it('should display active status badge', async () => {
        const mockCourses = [
            {
                id: '1',
                code: 'CS101',
                name: 'Introduction to Computer Science',
                instructorName: 'Dr. Smith',
                sectionName: 'A',
                status: 'active',
                statusText: 'Aktif'
            }
        ];

        api.get.mockResolvedValue({ data: mockCourses });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Aktif')).toBeInTheDocument();
        });
    });

    it('should display inactive status badge', async () => {
        const mockCourses = [
            {
                id: '1',
                code: 'CS101',
                name: 'Introduction to Computer Science',
                instructorName: 'Dr. Smith',
                sectionName: 'A',
                status: 'inactive'
            }
        ];

        api.get.mockResolvedValue({ data: mockCourses });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('inactive')).toBeInTheDocument();
        });
    });

    it('should display default status when status is missing', async () => {
        const mockCourses = [
            {
                id: '1',
                code: 'CS101',
                name: 'Introduction to Computer Science',
                instructorName: 'Dr. Smith',
                sectionName: 'A'
            }
        ];

        api.get.mockResolvedValue({ data: mockCourses });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Aktif')).toBeInTheDocument();
        });
    });

    it('should render Navbar and Sidebar', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Navbar')).toBeInTheDocument();
        expect(screen.getByText('Sidebar')).toBeInTheDocument();
    });

    it('should display instructor name', async () => {
        const mockCourses = [
            {
                id: '1',
                code: 'CS101',
                name: 'Introduction to Computer Science',
                instructorName: 'Dr. John Smith',
                sectionName: 'A',
                status: 'active'
            }
        ];

        api.get.mockResolvedValue({ data: mockCourses });

        render(
            <MemoryRouter>
                <MyCoursesPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        });
    });
});

