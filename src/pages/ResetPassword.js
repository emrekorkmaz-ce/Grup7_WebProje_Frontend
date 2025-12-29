import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import TextInput from '../components/TextInput';
import { GraduationCapIcon } from '../components/Icons';

const resetPasswordSchema = yup.object().shape({
    password: yup
        .string()
        .min(8, 'Şifre en az 8 karakter olmalıdır')
        .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
        .matches(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
        .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
        .required('Şifre gereklidir'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Şifreler eşleşmelidir')
        .required('Lütfen şifrenizi onaylayın')
});

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(resetPasswordSchema)
    });

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token,
                password: data.password,
                confirmPassword: data.confirmPassword
            });
            setSuccess('Şifre başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const errorData = err.response?.data?.error;
            const errorMessage = typeof errorData === 'object' ? (errorData.message || JSON.stringify(errorData)) : (errorData || 'Şifre sıfırlanamadı');
            setError(errorMessage);
        }

        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '2.5rem',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        margin: '0 auto 1.5rem auto',
                        width: '64px',
                        height: '64px',
                        background: 'var(--accent-color)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <GraduationCapIcon size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Şifreyi Sıfırla</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Yeni şifrenizi belirleyin.</p>
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--success)' }}>{success}</div>}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                        <input
                            type="password"
                            {...register('password')}
                            disabled={loading}
                            placeholder="••••••••"
                        />
                        {errors.password && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password.message}</div>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifreyi Onayla</label>
                        <input
                            type="password"
                            {...register('confirmPassword')}
                            disabled={loading}
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.confirmPassword.message}</div>}
                    </div>

                    <button
                        type='submit'
                        className='btn-primary w-full'
                        disabled={loading}
                        style={{ justifyContent: 'center' }}
                    >
                        {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
