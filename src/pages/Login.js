import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import trTranslations from '../locales/tr.json';
import { GraduationCapIcon, UserIcon, ShieldIcon } from '../components/Icons';
import bgImage from '../assets/university_bg.png';

// Login sayfası için özel translation hook'u - her zaman Türkçe
const useLoginTranslation = () => {
    const t = (key, params = {}) => {
        const keys = key.split('.');
        let value = trTranslations;

        for (const k of keys) {
            value = value?.[k];
        }

        if (!value) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }

        // Replace parameters in translation string
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
                return params[paramKey] || match;
            });
        }

        return value;
    };

    return { t, language: 'tr' };
};

const Login = () => {
    const { t } = useLoginTranslation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect');
    const wrongRole = searchParams.get('error') === 'wrong_role';

    const loginSchema = yup.object().shape({
        email: yup.string().email(t('auth.invalidEmailFormat')).required(t('auth.emailRequired')),
        password: yup.string().required(t('auth.passwordRequired')),
        rememberMe: yup.boolean()
    });

    React.useEffect(() => {
        if (wrongRole) {
            setError(t('auth.wrongRoleError'));
        }
    }, [wrongRole, t]);

    React.useEffect(() => {
        if (user) {
            // Redirect URL varsa oraya git, yoksa dashboard'a git
            // Ama eğer redirect URL yoklama sayfasıysa ve kullanıcı öğrenci değilse, hata göster
            if (redirectUrl && redirectUrl.includes('/attendance/give/') && user.role !== 'student') {
                setError('Bu sayfaya erişmek için öğrenci hesabı ile giriş yapmanız gerekmektedir.');
                return;
            }
            navigate(redirectUrl || '/dashboard', { replace: true });
        }
    }, [user, navigate, redirectUrl]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            rememberMe: false
        }
    });

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        const result = await login(data.email, data.password, requires2FA ? twoFactorToken : null);

        if (result.success) {
            if (data.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            setRequires2FA(false);
            setTwoFactorToken('');
        } else if (result.requires2FA) {
            setRequires2FA(true);
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
                    <div className="error" style={{ textAlign: 'center' }}>
                        {error}
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
                                disabled={loading || requires2FA}
                                placeholder={t('auth.passwordPlaceholder')}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                <ShieldIcon size={18} />
                            </div>
                        </div>
                        {errors.password && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password.message}</div>}
                    </div>

                    {requires2FA && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>{t('auth.twoFactorCode')}</label>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={twoFactorToken}
                                    onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    disabled={loading}
                                    placeholder={t('auth.twoFactorPlaceholder')}
                                    maxLength="6"
                                    style={{ 
                                        paddingLeft: '2.5rem',
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
                                        letterSpacing: '0.5rem',
                                        fontFamily: 'monospace',
                                        fontWeight: 'bold'
                                    }}
                                    autoFocus
                                />
                                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <ShieldIcon size={18} />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
                                {t('auth.twoFactorHint')}
                            </p>
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                {...register('rememberMe')}
                                style={{ width: 'auto', marginRight: '0.5rem' }}
                            />
                            {t('auth.rememberMe')}
                        </label>
                        <Link to='/forgot-password' style={{ color: 'var(--accent-color)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('auth.forgotPasswordLink')}</Link>
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
