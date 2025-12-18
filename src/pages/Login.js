import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { GraduationCapIcon, UserIcon, ShieldIcon } from '../components/Icons';
import bgImage from '../assets/university_bg.png';

const loginSchema = yup.object().shape({
    email: yup.string().email('Geçersiz e-posta formatı').required('E-posta adresi gereklidir'),
    password: yup.string().required('Şifre gereklidir'),
    rememberMe: yup.boolean()
});

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            rememberMe: false
        }
    });

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        const result = await login(data.email, data.password);

        if (result.success) {
            if (data.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
        } else {
            let errorMsg = typeof result.error === 'object'
                ? (result.error.message || JSON.stringify(result.error))
                : result.error;
            if (errorMsg && errorMsg.toLowerCase().includes('verify your email')) {
                errorMsg = 'Hesabınızı kullanabilmek için doğrulama yapmanız gerekmektedir.';
            }
            setError(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="login-card" style={{
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', border: 'none' }}>
                        Öğrenci Girişi
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Kampüs Bilgi Sistemi'ne erişmek için bilgilerinizi giriniz.
                    </p>
                </div>

                {error && (
                    <div className="error" style={{ textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', color: '#475569', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            E-posta Adresi
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                {...register('email')}
                                disabled={loading}
                                placeholder="ad.soyad@uni.edu.tr"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                <UserIcon size={18} />
                            </div>
                        </div>
                        {errors.email && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email.message}</div>}
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Şifre</label>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                {...register('password')}
                                disabled={loading}
                                placeholder="••••••••"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                <ShieldIcon size={18} />
                            </div>
                        </div>
                        {errors.password && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password.message}</div>}
                    </div>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                {...register('rememberMe')}
                                style={{ width: 'auto', marginRight: '0.5rem' }}
                            />
                            Beni Hatırla
                        </label>
                        <Link to='/forgot-password' style={{ color: 'var(--accent-color)', fontSize: '0.85rem', textDecoration: 'none' }}>Unuttum?</Link>
                    </div>

                    <button
                        type='submit'
                        className='btn-primary'
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            justifyContent: 'center'
                        }}
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Yeni kayıt mı yaptıracaksınız?{' '}
                        <Link to='/register' style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>
                            Kayıt Ol
                        </Link>
                    </p>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                &copy; {new Date().getFullYear()} Kampüs Bilgi Sistemi v1.0
            </div>
        </div>
    );
};

export default Login;
