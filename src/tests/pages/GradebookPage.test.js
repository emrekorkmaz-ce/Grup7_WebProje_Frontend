import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GradebookPage from '../../pages/GradebookPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/Icons', () => ({
    SaveIcon: () => <div>SaveIcon</div>
}));

describe('GradebookPage', () => {
    const mockStudents = [
        {
            studentId: '1',
            studentNumber: '12345',
            fullName: 'Test Student 1',
            grade: 'AA'
        },
        {
            studentId: '2',
            studentNumber: '12346',
            fullName: 'Test Student 2',
            grade: 'BB'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        global.alert = jest.fn();
    });

    it('should render loading state initially', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <GradebookPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Öğrenciler yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch and display students', async () => {
        api.get.mockResolvedValue({ data: { students: mockStudents } });

        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <GradebookPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student 1')).toBeInTheDocument();
            expect(screen.getByText('Test Student 2')).toBeInTheDocument();
            expect(screen.getByText('12345')).toBeInTheDocument();
            expect(screen.getByText('12346')).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <GradebookPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Öğrenciler yüklenemedi/i)).toBeInTheDocument();
        });
    });

    it('should handle grade input changes', async () => {
        api.get.mockResolvedValue({ data: { students: mockStudents } });

        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <GradebookPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student 1')).toBeInTheDocument();
        });

        const gradeInputs = screen.getAllByPlaceholderText('AA');
        fireEvent.change(gradeInputs[0], { target: { value: 'CC' } });

        expect(gradeInputs[0].value).toBe('CC');
    });

    it('should save grades successfully', async () => {
        api.get.mockResolvedValue({ data: { students: mockStudents } });
        api.post.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <GradebookPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student 1')).toBeInTheDocument();
        });

        const saveButton = screen.getByText(/Kaydet/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/faculty/gradebook/123', {
                grades: expect.objectContaining({
                    '1': 'AA',
                    '2': 'BB'
                })
            });
            expect(global.alert).toHaveBeenCalledWith('Notlar kaydedildi!');
        });
    });

    it('should handle save error', async () => {
        api.get.mockResolvedValue({ data: { students: mockStudents } });
        api.post.mockRejectedValue(new Error('Save failed'));

        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <GradebookPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student 1')).toBeInTheDocument();
        });

        const saveButton = screen.getByText(/Kaydet/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Notlar kaydedilemedi.');
        });
    });

    it('should display empty state when no students', async () => {
        api.get.mockResolvedValue({ data: { students: [] } });

        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <GradebookPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Bu dersi alan öğrenci bulunmuyor/i)).toBeInTheDocument();
        });
    });

    it('should disable save button when saving', async () => {
        api.get.mockResolvedValue({ data: { students: mockStudents } });
        api.post.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter initialEntries={['/gradebook/123']}>
                <GradebookPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Student 1')).toBeInTheDocument();
        });

        const saveButton = screen.getByText(/Kaydet/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/Kaydediliyor/i)).toBeInTheDocument();
            expect(saveButton).toBeDisabled();
        });
    });
});

