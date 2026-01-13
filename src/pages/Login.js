import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { GraduationCapIcon, UserIcon, ShieldIcon } from '../components/Icons';
import bgImage from '../assets/university_bg.png';

const Login = () =>{
    const { t, language } = useTranslation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [tempUserId, setTempUserId] = useState(null);
    const { login, user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect');
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    useEffect(() => {
        // Eğer redirect parametresi varsa ve kullanıcı zaten giriş yapmışsa, o sayfaya yönlendir
        if (user && redirectUrl) {
            navigate(redirectUrl, { replace: true });
            return;
        }
        
        // Eğer kullanıcı zaten giriş yapmışsa ve redirect yoksa dashboard'a yönlendir
        if (user && !redirectUrl) {
            navigate('/dashboard');
            return;
        }

        // Eğer error parametresi varsa, mesajı göster
        if (errorParam === 'wrong_role' && messageParam) {
            setError(decodeURIComponent(messageParam));
        }
    }, [user, navigate, redirectUrl, errorParam, messageParam]);

    const loginSchema = yup.object().shape({
        email: yup.string().email(t('auth.invalidEmailFormat')).required(t('auth.emailRequired')),
        password: yup.string().required(t('auth.passwordRequired')),
        rememberMe: yup.boolean()
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            rememberMe: false
        }
    });

    const onSubmit = async (data) =>{
        setError('');
        setLoading(true);

        const result = await login(data.email, data.password, requires2FA ? twoFactorToken : null);

        if (result.success) {
            if (data.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            setRequires2FA(false);
            setTwoFactorToken('');
            
            // Eğer redirect URL varsa, o sayfaya yönlendir
            if (redirectUrl) {
                navigate(redirectUrl, { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else if (result.requires2FA) {
            setRequires2FA(true);
            setTempUserId(result.tempUserId);
            setLoading(false);
        } else {
            let errorMsg = typeof result.error === 'object'
                ? (result.error.message || JSON.stringify(result.error))
                : result.error;
            if (errorMsg && errorMsg.toLowerCase().includes('verify your email')) {
                errorMsg = t('auth.verifyEmailError');
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
                        {t('auth.studentLogin')}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {t('auth.loginSubtitle')}
                    </p>
                </div>
                {error && (
                    <div className="error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        {error}
                        {errorParam === 'wrong_role' && user && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <button 
                                    onClick={async () => {
                                        await logout();
                                        setError('');
                                        window.location.reload();
                                    }}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', marginTop: '0.5rem' }}
                                >
                                    {language === 'en' ? 'Logout and Login as Student' : 'Çıkış Yap ve Öğrenci Olarak Giriş Yap'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', color: '#475569', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            {t('auth.emailAddress')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                {...register('email')}
                                disabled={loading}
                                placeholder={t('auth.emailPlaceholder')}
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
                            <label style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>{t('auth.password')}</label>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                {...register('password')}
                                disabled={loading}
                                placeholder={t('auth.passwordPlaceholder')}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                <ShieldIcon size={18} />
                            </div>
                        </div>
                        {errors.password && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password.message}</div>}
                    </div>

                    {!requires2FA && (
                        <>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}>
                                    <input
                                        type="checkbox"
                                        {...register('rememberMe')}
                                        style={{ width: 'auto', marginRight: '0.5rem' }}
                                    />
                                    {t('auth.rememberMe')}
                                </label>
                                <Link to='/forgot-password' style={{ color: 'var(--accent-color)', fontSize: '0.85rem', textDecoration: 'none' }}>
                                    {t('auth.forgotPasswordLink')}
                                </Link>
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
                                {loading ? t('auth.loggingIn') : t('auth.login')}
                            </button>
                        </>
                    )}

                    {requires2FA && (
                        <>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                <p style={{ color: '#0369a1', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                                    {t('auth.twoFactorHint')}
                                </p>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', color: '#475569', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                        {t('auth.twoFactorCode')}
                                    </label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder={t('auth.twoFactorPlaceholder')}
                                        value={twoFactorToken}
                                        onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            fontSize: '1.5rem',
                                            textAlign: 'center',
                                            letterSpacing: '0.5rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type='submit'
                                    className='btn-primary'
                                    disabled={loading || twoFactorToken.length !== 6}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {loading ? t('auth.loggingIn') : t('auth.login')}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setRequires2FA(false);
                                        setTwoFactorToken('');
                                        setTempUserId(null);
                                    }}
                                    style={{
                                        width: '100%',
                                        marginTop: '0.5rem',
                                        padding: '0.5rem',
                                        fontSize: '0.9rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t('common.back')}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {t('auth.newRegistration')}{' '}
                        <Link to='/register' style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>
                            {t('auth.register')}
                        </Link>
                    </p>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                {t('common.copyright', { year: new Date().getFullYear() })}
            </div>
        </div>
    );
};

export default Login;
