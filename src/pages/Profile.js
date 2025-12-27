import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import api, { BACKEND_BASE_URL } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TextInput from '../components/TextInput';
import { CameraIcon, TrashIcon, SaveIcon } from '../components/Icons';
// import './Profile.css';

const profileSchema = yup.object().shape({
    full_name: yup.string().required('Ad soyad gereklidir'),
    phone: yup.string().matches(/^\+?[0-9]\d{9,14}$/, 'Geçersiz telefon numarası formatı')
});

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [profilePicture, setProfilePicture] = useState(user?.profile_picture_url || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || '',
            phone: user?.phone || ''
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                full_name: user.full_name || '',
                phone: user.phone || ''
            });
            setProfilePicture(user.profile_picture_url || '');
        }
    }, [user, reset]);

    useEffect(() => {
        setImageError(false);
    }, [profilePicture]);

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.put('/users/me', data);
            updateUser(response.data.data);
            setSuccess('Profil başarıyla güncellendi!');
        } catch (err) {
            const errorData = err.response?.data?.error;
            const errorMessage = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : (errorData || 'Profil güncellenemedi');
            setError(errorMessage);
        }

        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return;
        }

        if (!file.type.match('image/jpeg|image/jpg|image/png')) {
            setError('Sadece JPEG, JPG ve PNG resimlerine izin verilir');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await api.post('/users/me/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfilePicture(response.data.data.profilePictureUrl);
            updateUser({ ...user, profile_picture_url: response.data.data.profilePictureUrl });
            setSuccess('Profil resmi başarıyla yüklendi!');
        } catch (error) {
            const errorData = error.response?.data?.error;
            const errorMessage = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : (errorData || 'Profil resmi yüklenemedi');
            setError(errorMessage);
        }

        setUploading(false);
    };

    const handleDeleteProfilePicture = async () => {
        setUploading(true);
        setError('');

        try {
            await api.delete('/users/me/profile-picture');
            setProfilePicture(null);
            updateUser({ ...user, profile_picture_url: null });
            setSuccess('Profil resmi başarıyla kaldırıldı!');
        } catch (error) {
            const errorData = error.response?.data?.error;
            const errorMessage = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : (errorData || 'Profil resmi kaldırılamadı');
            setError(errorMessage);
        }

        setUploading(false);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="app-container">
            <Navbar />
            <Sidebar />
            <main>
                <h2 className="mb-4">Profil Ayarları</h2>

                {error && <div className="error mb-4">{error}</div>}
                {success && <div className="card p-4 mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid var(--success)' }}>{success}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeaet(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Sol Kolon: Profil Resmi */}
                    <div className="card" style={{ height: 'fit-content', textAlign: 'center' }}>
                        <h3 className="mb-4">Profil Fotoğrafı</h3>
                        <div style={{
                            width: '150px', height: '150px', margin: '0 auto 1.5rem',
                            borderRadius: '50%', overflow: 'hidden',
                            border: '4px solid var(--accent-color)',
                            background: 'var(--secondary-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {profilePicture && !imageError ? (
                                <img
                                    src={`${BACKEND_BASE_URL}${profilePicture}`}
                                    alt='Profile'
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        console.error('Image load error:', e);
                                        setImageError(true);
                                    }}
                                />
                            ) : (
                                <div style={{ fontSize: '4rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    {getInitials(user?.full_name || user?.email)}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor='profile-picture-upload' className='btn btn-primary' style={{ cursor: 'pointer', display: 'inline-block' }}>
                                {uploading ? 'Yükleniyor...' : <><CameraIcon size={18} /> Fotoğraf Değiştir</>}
                            </label>
                            <input
                                type='file'
                                id='profile-picture-upload'
                                accept='image/jpeg,image/jpg,image/png'
                                onChange={handleFileUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                            {profilePicture && (
                                <button
                                    type="button"
                                    onClick={handleDeleteProfilePicture}
                                    className="btn btn-secondary"
                                    disabled={uploading}
                                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                >
                                    <TrashIcon size={18} /> Fotoğrafı Kaldır
                                </button>
                            )}
                            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>Maks 5 MB (JPG/PNG)</small>
                        </div>
                    </div>

                    {/* Sağ Kolon: Bilgiler */}
                    <div className="card">
                        <h3 className="mb-4">Kişisel Bilgiler</h3>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-4">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>E-posta</label>
                                <input
                                    type='email'
                                    value={user?.email || ''}
                                    disabled
                                    style={{ opacity: 0.7 }}
                                />
                            </div>

                            <div className="mb-4">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Ad Soyad</label>
                                <input
                                    type='text'
                                    {...register('full_name')}
                                    disabled={loading}
                                />
                                {errors.full_name && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.full_name.message}</p>}
                            </div>

                            <div className="mb-4">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Telefon</label>
                                <input
                                    type='tel'
                                    {...register('phone')}
                                    disabled={loading}
                                />
                                {errors.phone && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.phone.message}</p>}
                            </div>

                            <div className="mb-4">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rol</label>
                                <input
                                    type='text'
                                    value={user?.role === 'student' ? 'Öğrenci' : user?.role === 'admin' ? 'Yönetici' : 'Akademisyen'}
                                    disabled
                                    style={{ opacity: 0.7 }}
                                />
                            </div>

                            {user?.student && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="mb-4">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Öğrenci No</label>
                                        <input value={user.student.student_number || ''} disabled style={{ opacity: 0.7 }} />
                                    </div>
                                    <div className="mb-4">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>AGNO</label>
                                        <input value={user.student.cgpa ? parseFloat(user.student.cgpa).toFixed(2) : '-'} disabled style={{ opacity: 0.7 }} />
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                <button
                                    type='submit'
                                    className='btn btn-primary'
                                    disabled={loading}
                                    style={{ padding: '0.75rem 2rem' }}
                                >
                                    {loading ? 'Kaydediliyor...' : <><SaveIcon size={18} /> Değişiklikleri Kaydet</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Güvenlik Bölümü */}
                    <div className="card" style={{ marginTop: '2rem' }}>
                        <h3 className="mb-4">Güvenlik</h3>
                        <div className="security-section">
                            <div className="security-item">
                                <div>
                                    <h3>İki Faktörlü Kimlik Doğrulama (2FA)</h3>
                                    <p>Hesabınızı ekstra bir güvenlik katmanıyla koruyun</p>
                                </div>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/settings/2fa')}
                                >
                                    2FA Ayarları
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
};

export default Profile;
