// src/tests/pages/CourseCatalogPage.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCatalogPage from '../../pages/CourseCatalogPage';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);

describe('CourseCatalogPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render course catalog page', async () => {
        api.get.mockResolvedValueOnce({
            data: { data: [], pagination: { totalPages: 1 } }
        }).mockResolvedValueOnce({
            data: { data: [] }
        });

        render(
            <BrowserRouter>
                <CourseCatalogPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ders Kataloğu')).toBeInTheDocument();
        });
    });

    it('should display courses when loaded', async () => {
        const mockCourses = [
            { id: '1', code: 'CS101', name: 'Introduction to CS', credits: 3, ects: 5, department: { name: 'CS' } }
        ];

        api.get.mockResolvedValueOnce({
            data: { data: mockCourses, pagination: { totalPages: 1 } }
        }).mockResolvedValueOnce({
            data: { data: [] }
        });

        render(
            <BrowserRouter>
                <CourseCatalogPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
            expect(screen.getByText('Introduction to CS')).toBeInTheDocument();
        });
    });

    it('should display loading state', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        render(
            <BrowserRouter>
                <CourseCatalogPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });

    it('should display no courses message when empty', async () => {
        api.get.mockResolvedValueOnce({
            data: { data: [], pagination: { totalPages: 1 } }
        }).mockResolvedValueOnce({
            data: { data: [] }
        });

        render(
            <BrowserRouter>
                <CourseCatalogPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ders bulunamadı.')).toBeInTheDocument();
        });
    });
});

