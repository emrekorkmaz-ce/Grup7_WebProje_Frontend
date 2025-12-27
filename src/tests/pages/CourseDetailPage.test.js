import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import CourseDetailPage from '../../pages/CourseDetailPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn()
}));
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('CourseDetailPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValue({ id: '1' });
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display course details', async () => {
        const mockCourse = {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            credits: 3,
            ects: 5,
            description: 'This is a course description',
            department: { name: 'Computer Science' },
            prerequisites: []
        };

        api.get.mockResolvedValue({ data: { data: mockCourse } });

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
            expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument();
            expect(screen.getByText(/Kredi: 3/i)).toBeInTheDocument();
            expect(screen.getByText(/ECTS: 5/i)).toBeInTheDocument();
        });
    });

    it('should display error message when course not found', async () => {
        api.get.mockRejectedValue(new Error('Course not found'));

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Ders bulunamadı/i)).toBeInTheDocument();
        });
    });

    it('should display course description', async () => {
        const mockCourse = {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            credits: 3,
            ects: 5,
            description: 'This is a detailed course description',
            department: { name: 'Computer Science' },
            prerequisites: []
        };

        api.get.mockResolvedValue({ data: { data: mockCourse } });

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('This is a detailed course description')).toBeInTheDocument();
        });
    });

    it('should display default description when missing', async () => {
        const mockCourse = {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            credits: 3,
            ects: 5,
            department: { name: 'Computer Science' },
            prerequisites: []
        };

        api.get.mockResolvedValue({ data: { data: mockCourse } });

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Açıklama girilmemiş/i)).toBeInTheDocument();
        });
    });

    it('should display prerequisites when available', async () => {
        const mockCourse = {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            credits: 3,
            ects: 5,
            description: 'Course description',
            department: { name: 'Computer Science' },
            prerequisites: [
                { id: '2', code: 'MATH101', name: 'Basic Mathematics' }
            ]
        };

        api.get.mockResolvedValue({ data: { data: mockCourse } });

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('MATH101 - Basic Mathematics')).toBeInTheDocument();
        });
    });

    it('should display no prerequisites message when empty', async () => {
        const mockCourse = {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            credits: 3,
            ects: 5,
            description: 'Course description',
            department: { name: 'Computer Science' },
            prerequisites: []
        };

        api.get.mockResolvedValue({ data: { data: mockCourse } });

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Ön koşul yok/i)).toBeInTheDocument();
        });
    });

    it('should handle course with null prerequisites', async () => {
        const mockCourse = {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            credits: 3,
            ects: 5,
            description: 'Course description',
            department: { name: 'Computer Science' },
            prerequisites: null
        };

        api.get.mockResolvedValue({ data: { data: mockCourse } });

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Ön koşul yok/i)).toBeInTheDocument();
        });
    });

    it('should refetch course when id changes', async () => {
        const mockCourse1 = {
            id: '1',
            code: 'CS101',
            name: 'Course 1',
            credits: 3,
            ects: 5,
            department: { name: 'CS' },
            prerequisites: []
        };

        api.get.mockResolvedValueOnce({ data: { data: mockCourse1 } });

        const { rerender } = render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Course 1')).toBeInTheDocument();
        });

        useParams.mockReturnValue({ id: '2' });
        const mockCourse2 = {
            id: '2',
            code: 'CS102',
            name: 'Course 2',
            credits: 3,
            ects: 5,
            department: { name: 'CS' },
            prerequisites: []
        };

        api.get.mockResolvedValueOnce({ data: { data: mockCourse2 } });

        rerender(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/courses/2');
        });
    });

    it('should render Navbar and Sidebar', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <CourseDetailPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Navbar')).toBeInTheDocument();
        expect(screen.getByText('Sidebar')).toBeInTheDocument();
    });
});

