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
import './Register.css';

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
            setSuccess('Kayıt başarılı! Hesabınızı kullanabilmek için e-posta adresinize gelen onay linkine tıklayarak hesabınızı doğrulamanız gerekiyor.');
            // Sayfa hemen yönlenmesin, kullanıcı mesajı görsün
            setTimeout(() => {
                navigate('/login');
            }, 4000);
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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem'
        }}>
            <div className="card" style={{
                maxWidth: '600px',
                width: '100%',
                padding: '2.5rem',
                backdropFilter: 'blur(20px)',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Kayıt Ol</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Kampüs ailesine katılın</p>
                </div>

                {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
                {success && <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>{success}</div>}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label style={labelStyle}>Ad Soyad *</label>
                        <input type='text' {...register('full_name')} style={inputStyle} disabled={loading} />
                        {errors.full_name && <div style={errorStyle}>{errors.full_name.message}</div>}
                    </div>

                    <div>
                        <label style={labelStyle}>E-posta *</label>
                        <input type='email' {...register('email')} style={inputStyle} disabled={loading} placeholder="ornek@uni.edu.tr" />
                        {errors.email && <div style={errorStyle}>{errors.email.message}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Şifre *</label>
                            <input type='password' {...register('password')} style={inputStyle} disabled={loading} />
                            {errors.password && <div style={errorStyle}>{errors.password.message}</div>}
                        </div>
                        <div>
                            <label style={labelStyle}>Şifreyi Onayla *</label>
                            <input type='password' {...register('confirmPassword')} style={inputStyle} disabled={loading} />
                            {errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword.message}</div>}
                        </div>
                    </div>
                    <small style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                        En az 8 karakter, büyük/küçük harf ve rakam içermeli.
                    </small>

                    <div>
                        <label style={labelStyle}>Kullanıcı Tipi *</label>
                        <select {...register('role')} style={{ ...inputStyle, cursor: 'pointer' }} disabled={loading}>
                            <option value="student" style={{ color: 'black' }}>Öğrenci</option>
                            <option value="faculty" style={{ color: 'black' }}>Akademisyen</option>
                        </select>
                        {errors.role && <div style={errorStyle}>{errors.role.message}</div>}
                    </div>

                    {role === 'student' && (
                        <div>
                            <label style={labelStyle}>Öğrenci Numarası *</label>
                            <input type='text' {...register('student_number')} style={inputStyle} disabled={loading} />
                            {errors.student_number && <div style={errorStyle}>{errors.student_number.message}</div>}
                        </div>
                    )}

                    {role === 'faculty' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Personel No *</label>
                                <input type='text' {...register('employee_number')} style={inputStyle} disabled={loading} />
                                {errors.employee_number && <div style={errorStyle}>{errors.employee_number.message}</div>}
                            </div>
                            <div>
                                <label style={labelStyle}>Ünvan *</label>
                                <input type='text' {...register('title')} style={inputStyle} disabled={loading} placeholder="örn. Prof. Dr." />
                                {errors.title && <div style={errorStyle}>{errors.title.message}</div>}
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={labelStyle}>Bölüm *</label>
                        <select {...register('department_id')} style={{ ...inputStyle, cursor: 'pointer' }} disabled={loading}>
                            {departmentOptions.map(opt => (
                                <option key={opt.value} value={opt.value} style={{ color: 'black' }}>{opt.label}</option>
                            ))}
                        </select>
                        {errors.department_id && <div style={errorStyle}>{errors.department_id.message}</div>}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <input type="checkbox" {...register('terms')} style={{ marginRight: '0.5rem', width: '16px', height: '16px' }} disabled={loading} />
                            Şartlar ve koşulları kabul ediyorum *
                        </label>
                        {errors.terms && <div style={errorStyle}>{errors.terms.message}</div>}
                    </div>

                    <button
                        type='submit'
                        className='btn-primary'
                        disabled={loading}
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 600 }}
                    >
                        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
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

