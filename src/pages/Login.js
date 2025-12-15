import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
// import TextInput from '../components/TextInput'; // Removed
// import Checkbox from '../components/Checkbox'; // Removed

const loginSchema = yup.object().shape({
    email: yup.string().email('Geçersiz e-posta formatı').required('E-posta gereklidir'),
    password: yup.string().required('Şifre gereklidir'),
    rememberMe: yup.boolean()
});

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
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

    // import './Login.css'; // Removed legacy CSS

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        const result = await login(data.email, data.password);

        if (result.success) {
            if (data.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            // Yönlendirmeyi useEffect yapacak
        } else {
            let errorMsg = typeof result.error === 'object'
                ? (result.error.message || JSON.stringify(result.error))
                : result.error;
            if (errorMsg && errorMsg.toLowerCase().includes('verify your email')) {
                errorMsg = 'Hesabınızı kullanabilmek için önce e-posta adresinizi onaylamanız gerekiyor.';
            }
            setError(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="card" style={{
                maxWidth: '420px',
                width: '100%',
                padding: '2.5rem',
                backdropFilter: 'blur(20px)',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Giriş Yap</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Kampüs sistemine hoşgeldiniz</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>E-posta Adresi</label>
                        <input
                            type="email"
                            {...register('email')}
                            disabled={loading}
                            placeholder="ornek@uni.edu.tr"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        />
                        {errors.email && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email.message}</div>}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Şifre</label>
                        <input
                            type="password"
                            {...register('password')}
                            disabled={loading}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        />
                        {errors.password && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password.message}</div>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                {...register('rememberMe')}
                                style={{ marginRight: '0.5rem', width: '16px', height: '16px' }}
                            />
                            Beni Hatırla
                        </label>
                        <Link to='/forgot-password' style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '0.9rem' }}>
                            Şifremi unuttum?
                        </Link>
                    </div>

                    <button
                        type='submit'
                        className='btn-primary'
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading ? 'Giriş yapılıyor...' : <><span>Giriş Yap</span> <span>➜</span></>}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Hesabınız yok mu?{' '}
                        <Link to='/register' style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>
                            Kayıt Ol
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
