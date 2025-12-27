import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TextInput from '../components/TextInput';
import Select from '../components/Select';
import Checkbox from '../components/Checkbox';
import { GraduationCapIcon } from '../components/Icons';
import bgImage from '../assets/university_bg.png';
// import './Register.css';

const registerSchema = yup.object().shape({
    email: yup.string()
        .email('Geçersiz e-posta formatı')
        .matches(/@.*\.edu$/i, 'E-posta adresi .edu uzantılı olmalıdır')
        .required('E-posta gereklidir'),
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
        .required('Lütfen şifrenizi onaylayın'),
    full_name: yup.string().required('Ad soyad gereklidir'),
    role: yup.string().oneOf(['student', 'faculty'], 'Geçersiz rol').required('Rol gereklidir'),
    student_number: yup.string().when('role', {
        is: 'student',
        then: (schema) => schema
            .required('Öğrenci numarası gereklidir')
            .min(6, 'Öğrenci numarası en az 6 karakter olmalıdır')
            .max(20, 'Öğrenci numarası en fazla 20 karakter olabilir'),
        otherwise: (schema) => schema.notRequired()
    }),
    employee_number: yup.string().when('role', {
        is: 'faculty',
        then: (schema) => schema.required('Personel numarası gereklidir'),
        otherwise: (schema) => schema.notRequired()
    }),
    title: yup.string().when('role', {
        is: 'faculty',
        then: (schema) => schema.required('Ünvan gereklidir'),
        otherwise: (schema) => schema.notRequired()
    }),
    department_id: yup.string().required('Bölüm gereklidir'),
    terms: yup.boolean().oneOf([true], 'Şartlar ve koşulları kabul etmelisiniz')
});

const Register = () => {
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationInfo, setVerificationInfo] = useState(null);
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            role: 'student',
            terms: false
        }
    });

    const role = watch('role');

    useEffect(() => {
        console.log('Fetching departments from:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1');
        api.get('/departments')
            .then(res => {
                console.log('Departments response:', res);
                console.log('Response data:', res.data);
                // Backend returns: { success: true, data: [...] }
                if (res.data.success && res.data.data && Array.isArray(res.data.data)) {
                    console.log('Setting departments:', res.data.data.length);
                    setDepartments(res.data.data);
                } else if (Array.isArray(res.data)) {
                    console.log('Setting departments (array):', res.data.length);
                    setDepartments(res.data);
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    console.log('Setting departments (data array):', res.data.data.length);
                    setDepartments(res.data.data);
                } else {
                    console.error('Unexpected response format:', res.data);
                    setDepartments([]);
                    setError('Bölümler yüklenemedi. Lütfen sayfayı yenileyin.');
                }
            })
            .catch((err) => {
                console.error('Failed to load departments:', err);
                console.error('Error response:', err.response);
                console.error('Error message:', err.message);
                setDepartments([]);
                const errorMsg = err.response?.data?.error?.message || err.message || 'Backend servisinin çalıştığından emin olun.';
                setError(`Bölümler yüklenemedi. ${errorMsg}`);
            });
    }, []);

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');
        setLoading(true);

        const userData = {
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            full_name: data.full_name,
            role: data.role,
            department_id: data.department_id
        };

        if (data.role === 'student') {
            userData.student_number = data.student_number;
        } else if (data.role === 'faculty') {
            userData.employee_number = data.employee_number;
            userData.title = data.title;
        }

        const result = await registerUser(userData);

        if (result.success) {
            // Check if verification is required
            if (result.requiresVerification) {
                setSuccess('Kayıt başarılı! Hesabınızı kullanabilmek için e-posta adresinizi doğrulamanız gerekiyor.');
                // Show verification URL if provided (development mode)
                if (result.verificationUrl) {
                    setVerificationInfo({
                        url: result.verificationUrl,
                        token: result.verificationToken
                    });
                }
            } else {
                setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } else {
            // Eğer hata mail onay bekliyor ise Türkçeleştir
            let errorMsg = typeof result.error === 'object'
                ? (result.error.message || JSON.stringify(result.error))
                : result.error;
            if (errorMsg && errorMsg.toLowerCase().includes('verify your email')) {
                errorMsg = 'Hesabınızı kullanabilmek için önce e-posta adresinizi onaylamanız gerekiyor.';
            }
            setError(errorMsg);
        }

        setLoading(false);
    };

    const departmentOptions = [
        { value: '', label: 'Bölüm Seçin' },
        ...departments.map(dept => ({
            value: dept.id,
            label: `${dept.name} (${dept.code})`
        }))
    ];

    // Helper styles for inputs
    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: 'white',
        outline: 'none',
        fontSize: '1rem',
        marginBottom: '0.5rem'
    };

    const labelStyle = {
        display: 'block',
        color: 'var(--text-secondary)',
        marginBottom: '0.5rem',
        fontSize: '0.9rem'
    };

    const errorStyle = {
        color: '#ef4444',
        fontSize: '0.8rem',
        marginTop: '-0.25rem',
        marginBottom: '1rem'
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
            padding: '2rem 1rem'
        }}>
            <div className="card" style={{
                maxWidth: '600px',
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
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Aramıza Katılın</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Kampüs Bilgi Sistemi'ne kaydolun</p>
                </div>

                {error && <div className="error">{error}</div>}
                {success && (
                    <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--success)' }}>
                        {success}
                        {verificationInfo && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '8px' }}>
                                <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>🔗 Doğrulama Linki (Development):</p>
                                <a 
                                    href={verificationInfo.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                        display: 'block', 
                                        wordBreak: 'break-all', 
                                        color: '#007bff', 
                                        textDecoration: 'underline',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    {verificationInfo.url}
                                </a>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                    <strong>Token:</strong> <code style={{ background: '#f0f0f0', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{verificationInfo.token}</code>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad *</label>
                        <input type='text' {...register('full_name')} disabled={loading} placeholder="Ad Soyad" />
                        {errors.full_name && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.full_name.message}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta *</label>
                        <input type='email' {...register('email')} disabled={loading} placeholder="ornek@uni.edu.tr" />
                        {errors.email && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.email.message}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre *</label>
                            <input type='password' {...register('password')} disabled={loading} placeholder="••••••••" />
                            {errors.password && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.password.message}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şifreyi Onayla *</label>
                            <input type='password' {...register('confirmPassword')} disabled={loading} placeholder="••••••••" />
                            {errors.confirmPassword && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.confirmPassword.message}</div>}
                        </div>
                    </div>
                    <small style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '-0.5rem', fontSize: '0.8rem' }}>
                        En az 8 karakter, büyük/küçük harf ve rakam.
                    </small>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Tipi *</label>
                        <select {...register('role')} disabled={loading}>
                            <option value="student">Öğrenci</option>
                            <option value="faculty">Akademisyen</option>
                        </select>
                        {errors.role && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.role.message}</div>}
                    </div>

                    {role === 'student' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Öğrenci Numarası *</label>
                            <input type='text' {...register('student_number')} disabled={loading} placeholder="Öğrenci No" />
                            {errors.student_number && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.student_number.message}</div>}
                        </div>
                    )}

                    {role === 'faculty' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Personel No *</label>
                                <input type='text' {...register('employee_number')} disabled={loading} />
                                {errors.employee_number && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.employee_number.message}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ünvan *</label>
                                <input type='text' {...register('title')} disabled={loading} placeholder="örn. Prof. Dr." />
                                {errors.title && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.title.message}</div>}
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bölüm *</label>
                        <select {...register('department_id')} disabled={loading}>
                            {departmentOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {errors.department_id && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.department_id.message}</div>}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}>
                            <input type="checkbox" {...register('terms')} style={{ marginRight: '0.5rem', width: 'auto' }} disabled={loading} />
                            Şartlar ve koşulları kabul ediyorum *
                        </label>
                        {errors.terms && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.terms.message}</div>}
                    </div>

                    <button
                        type='submit'
                        className='btn-primary'
                        disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 600, justifyContent: 'center' }}
                    >
                        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Zaten hesabınız var mı?{' '}
                        <Link to='/login' style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>
                            Giriş Yap
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

