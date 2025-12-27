import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../../pages/Profile';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

jest.mock('../../context/AuthContext');
jest.mock('../../services/api');
jest.mock('../../components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../components/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/TextInput', () => ({ label, ...props }) => (
    <div>
        <label>{label}</label>
        <input {...props} />
    </div>
));
jest.mock('../../components/Icons', () => ({
    CameraIcon: () => <div>CameraIcon</div>,
    TrashIcon: () => <div>TrashIcon</div>,
    SaveIcon: () => <div>SaveIcon</div>
}));

describe('Profile Page', () => {
    const mockUser = {
        id: '1',
        email: 'test@test.edu',
        full_name: 'Test User',
        phone: '5551234567',
        role: 'student',
        is_verified: true,
        profile_picture_url: '/uploads/test.jpg',
        student: {
            student_number: '12345',
            cgpa: 3.5
        }
    };

    const mockUpdateUser = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            user: mockUser,
            updateUser: mockUpdateUser
        });
    });

    it('should render profile page', () => {
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        expect(screen.getByText(/Profil Ayarları/i)).toBeInTheDocument();
        expect(screen.getByText(/Profil Fotoğrafı/i)).toBeInTheDocument();
        expect(screen.getByText(/Kişisel Bilgiler/i)).toBeInTheDocument();
    });

    it('should display user information', () => {
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        expect(screen.getByDisplayValue('test@test.edu')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('5551234567')).toBeInTheDocument();
    });

    it('should update profile successfully', async () => {
        api.put.mockResolvedValue({ data: { data: { ...mockUser, full_name: 'Updated Name' } } });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        const nameInput = screen.getByDisplayValue('Test User');
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

        const saveButton = screen.getByText(/Değişiklikleri Kaydet/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith('/users/me', {
                full_name: 'Updated Name',
                phone: '5551234567'
            });
            expect(mockUpdateUser).toHaveBeenCalled();
        });
    });

    it('should handle profile update error', async () => {
        api.put.mockRejectedValue({ response: { data: { error: 'Update failed' } } });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        const saveButton = screen.getByText(/Değişiklikleri Kaydet/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
        });
    });

    it('should upload profile picture', async () => {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        api.post.mockResolvedValue({ 
            data: { data: { profilePictureUrl: '/uploads/new.jpg' } } 
        });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        const fileInput = document.querySelector('input[type="file"]');
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
            expect(mockUpdateUser).toHaveBeenCalled();
        });
    });

    it('should handle file size error', async () => {
        const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        const fileInput = document.querySelector('input[type="file"]');
        fireEvent.change(fileInput, { target: { files: [largeFile] } });

        await waitFor(() => {
            expect(screen.getByText(/Dosya boyutu 5MB/i)).toBeInTheDocument();
        });
    });

    it('should handle invalid file type', async () => {
        const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        const fileInput = document.querySelector('input[type="file"]');
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });

        await waitFor(() => {
            expect(screen.getByText(/Sadece JPEG/i)).toBeInTheDocument();
        });
    });

    it('should delete profile picture', async () => {
        api.delete.mockResolvedValue({ data: { success: true } });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        const deleteButton = screen.getByText(/Fotoğrafı Kaldır/i);
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/users/me/profile-picture');
            expect(mockUpdateUser).toHaveBeenCalled();
        });
    });

    it('should display validation errors', async () => {
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        const nameInput = screen.getByDisplayValue('Test User');
        fireEvent.change(nameInput, { target: { value: '' } });

        const saveButton = screen.getByText(/Değişiklikleri Kaydet/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/Ad soyad gereklidir/i)).toBeInTheDocument();
        });
    });

    it('should display student information when user is student', () => {
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        expect(screen.getByDisplayValue('12345')).toBeInTheDocument();
        expect(screen.getByDisplayValue('3.50')).toBeInTheDocument();
    });
});

