import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Mock dependencies
jest.mock('../context/AuthContext');
jest.mock('../services/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock components
jest.mock('../components/TextInput', () => {
  return function TextInput(props) {
    return <input {...props} />;
  };
});

jest.mock('../components/Select', () => {
  return function Select(props) {
    return <select {...props}>{props.children}</select>;
  };
});

jest.mock('../components/Checkbox', () => {
  return function Checkbox(props) {
    return <input type="checkbox" {...props} />;
  };
});

describe('Register Component', () => {
  let mockRegisterUser;
  let mockNavigate;
  const mockDepartments = [
    { id: '1', name: 'Bilgisayar Mühendisliği', code: 'BMH' },
    { id: '2', name: 'Elektrik Mühendisliği', code: 'EMH' },
    { id: '3', name: 'İnşaat Mühendisliği', code: 'IMH' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockRegisterUser = jest.fn();
    mockNavigate = jest.fn();
    
    useAuth.mockReturnValue({
      register: mockRegisterUser
    });
    
    useNavigate.mockReturnValue(mockNavigate);
    
    // Mock successful API call for departments
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: mockDepartments
      }
    });

    // Suppress console.log and console.error for cleaner test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    console.log.mockRestore();
    console.error.mockRestore();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  const fillStudentForm = async (overrides = {}) => {
    const defaults = {
      full_name: 'Test User',
      email: 'test@uni.edu.tr',
      password: 'Test1234',
      confirmPassword: 'Test1234',
      role: 'student',
      student_number: '123456',
      department_id: '1',
      terms: true
    };

    const data = { ...defaults, ...overrides };

    if (data.full_name !== undefined) {
      const fullNameInput = screen.getByLabelText(/ad soyad/i);
      fireEvent.change(fullNameInput, { target: { value: data.full_name } });
    }

    if (data.email !== undefined) {
      const emailInput = screen.getByLabelText(/e-posta/i);
      fireEvent.change(emailInput, { target: { value: data.email } });
    }

    if (data.password !== undefined) {
      const passwordInput = screen.getByLabelText(/^şifre \*/i);
      fireEvent.change(passwordInput, { target: { value: data.password } });
    }

    if (data.confirmPassword !== undefined) {
      const confirmPasswordInput = screen.getByLabelText(/şifreyi onayla/i);
      fireEvent.change(confirmPasswordInput, { target: { value: data.confirmPassword } });
    }

    if (data.role !== undefined) {
      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
      fireEvent.change(roleSelect, { target: { value: data.role } });
      
      // Wait for conditional fields to render
      await waitFor(() => {
        if (data.role === 'student') {
          expect(screen.getByLabelText(/öğrenci numarası/i)).toBeInTheDocument();
        } else if (data.role === 'faculty') {
          expect(screen.getByLabelText(/personel no/i)).toBeInTheDocument();
        }
      });
    }

    if (data.student_number !== undefined && data.role === 'student') {
      const studentNumberInput = screen.getByLabelText(/öğrenci numarası/i);
      fireEvent.change(studentNumberInput, { target: { value: data.student_number } });
    }

    if (data.employee_number !== undefined && data.role === 'faculty') {
      const employeeNumberInput = screen.getByLabelText(/personel no/i);
      fireEvent.change(employeeNumberInput, { target: { value: data.employee_number } });
    }

    if (data.title !== undefined && data.role === 'faculty') {
      const titleInput = screen.getByLabelText(/ünvan/i);
      fireEvent.change(titleInput, { target: { value: data.title } });
    }

    if (data.department_id !== undefined) {
      const departmentSelect = screen.getByLabelText(/bölüm/i);
      fireEvent.change(departmentSelect, { target: { value: data.department_id } });
    }

    if (data.terms !== undefined && data.terms) {
      const termsCheckbox = screen.getByLabelText(/şartlar ve koşulları kabul ediyorum/i);
      if (!termsCheckbox.checked) {
        fireEvent.click(termsCheckbox);
      }
    }
  };

  describe('Component Rendering', () => {
    it('should render registration form with all elements', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByText('Kayıt Ol')).toBeInTheDocument();
      });

      expect(screen.getByText('Kampüs ailesine katılın')).toBeInTheDocument();
      expect(screen.getByLabelText(/ad soyad/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^şifre \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/şifreyi onayla/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/kullanıcı tipi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bölüm/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/şartlar ve koşulları kabul ediyorum/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /kayıt ol/i })).toBeInTheDocument();
    });

    it('should render emoji icon', async () => {
      renderRegister();

      await waitFor(() => {
        const emojiElement = screen.getByText('📝');
        expect(emojiElement).toBeInTheDocument();
      });
    });

    it('should have link to login page', async () => {
      renderRegister();

      await waitFor(() => {
        const loginLink = screen.getByText('Giriş Yap');
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
      });
    });

    it('should display password requirements hint', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByText(/en az 8 karakter, büyük\/küçük harf ve rakam içermeli/i)).toBeInTheDocument();
      });
    });
  });

  describe('Department Loading', () => {
    it('should load departments on mount', async () => {
      renderRegister();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/departments');
      });
    });

    it('should display departments in select dropdown', async () => {
      renderRegister();

      await waitFor(() => {
        const departmentSelect = screen.getByLabelText(/bölüm/i);
        expect(departmentSelect).toBeInTheDocument();
        
        // Check if options are rendered
        mockDepartments.forEach(dept => {
          const option = screen.getByText(`${dept.name} (${dept.code})`);
          expect(option).toBeInTheDocument();
        });
      });
    });

    it('should handle departments API response with success flag', async () => {
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: mockDepartments
        }
      });

      renderRegister();

      await waitFor(() => {
        const option = screen.getByText(`${mockDepartments[0].name} (${mockDepartments[0].code})`);
        expect(option).toBeInTheDocument();
      });
    });

    it('should handle departments API response as direct array', async () => {
      api.get.mockResolvedValue({
        data: mockDepartments
      });

      renderRegister();

      await waitFor(() => {
        const option = screen.getByText(`${mockDepartments[0].name} (${mockDepartments[0].code})`);
        expect(option).toBeInTheDocument();
      });
    });

    it('should handle departments API response with nested data', async () => {
      api.get.mockResolvedValue({
        data: {
          data: mockDepartments
        }
      });

      renderRegister();

      await waitFor(() => {
        const option = screen.getByText(`${mockDepartments[0].name} (${mockDepartments[0].code})`);
        expect(option).toBeInTheDocument();
      });
    });

    it('should handle departments loading error', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      renderRegister();

      await waitFor(() => {
        expect(screen.getByText(/bölümler yüklenemedi/i)).toBeInTheDocument();
      });
    });

    it('should handle departments API error with response data', async () => {
      api.get.mockRejectedValue({
        response: {
          data: {
            error: {
              message: 'Server error'
            }
          }
        },
        message: 'Network error'
      });

      renderRegister();

      await waitFor(() => {
        expect(screen.getByText(/bölümler yüklenemedi.*server error/i)).toBeInTheDocument();
      });
    });

    it('should handle unexpected departments response format', async () => {
      api.get.mockResolvedValue({
        data: {
          unexpected: 'format'
        }
      });

      renderRegister();

      await waitFor(() => {
        expect(screen.getByText(/bölümler yüklenemedi.*sayfayı yenileyin/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-based Fields', () => {
    it('should show student number field when student role is selected', async () => {
      renderRegister();

      await waitFor(() => {
        const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
        expect(roleSelect.value).toBe('student');
        expect(screen.getByLabelText(/öğrenci numarası/i)).toBeInTheDocument();
      });
    });

    it('should show faculty fields when faculty role is selected', async () => {
      renderRegister();

      await waitFor(() => {
        const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
        fireEvent.change(roleSelect, { target: { value: 'faculty' } });
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/personel no/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ünvan/i)).toBeInTheDocument();
      });
    });

    it('should hide student number when switching to faculty', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/öğrenci numarası/i)).toBeInTheDocument();
      });

      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });

      await waitFor(() => {
        expect(screen.queryByLabelText(/öğrenci numarası/i)).not.toBeInTheDocument();
      });
    });

    it('should hide faculty fields when switching to student', async () => {
      renderRegister();

      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/personel no/i)).toBeInTheDocument();
      });

      fireEvent.change(roleSelect, { target: { value: 'student' } });

      await waitFor(() => {
        expect(screen.queryByLabelText(/personel no/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/ünvan/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required full name', async () => {
      renderRegister();

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Ad soyad gereklidir')).toBeInTheDocument();
      });
    });

    it('should validate required email', async () => {
      renderRegister();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('E-posta gereklidir')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderRegister();

      await fillStudentForm({ email: 'invalid-email' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Geçersiz e-posta formatı')).toBeInTheDocument();
      });
    });

    it('should validate .edu email requirement', async () => {
      renderRegister();

      await fillStudentForm({ email: 'test@gmail.com' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/e-posta adresi \.edu uzantılı olmalıdır/i)).toBeInTheDocument();
      });
    });

    it('should validate password minimum length', async () => {
      renderRegister();

      await fillStudentForm({ password: 'Test1', confirmPassword: 'Test1' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/şifre en az 8 karakter olmalıdır/i)).toBeInTheDocument();
      });
    });

    it('should validate password contains uppercase', async () => {
      renderRegister();

      await fillStudentForm({ password: 'test1234', confirmPassword: 'test1234' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/şifre en az bir büyük harf içermelidir/i)).toBeInTheDocument();
      });
    });

    it('should validate password contains lowercase', async () => {
      renderRegister();

      await fillStudentForm({ password: 'TEST1234', confirmPassword: 'TEST1234' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/şifre en az bir küçük harf içermelidir/i)).toBeInTheDocument();
      });
    });

    it('should validate password contains number', async () => {
      renderRegister();

      await fillStudentForm({ password: 'TestTest', confirmPassword: 'TestTest' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/şifre en az bir rakam içermelidir/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      renderRegister();

      await fillStudentForm({ password: 'Test1234', confirmPassword: 'Different1234' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/şifreler eşleşmelidir/i)).toBeInTheDocument();
      });
    });

    it('should validate student number is required for students', async () => {
      renderRegister();

      await fillStudentForm({ student_number: '' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/öğrenci numarası gereklidir/i)).toBeInTheDocument();
      });
    });

    it('should validate student number minimum length', async () => {
      renderRegister();

      await fillStudentForm({ student_number: '123' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/öğrenci numarası en az 6 karakter olmalıdır/i)).toBeInTheDocument();
      });
    });

    it('should validate student number maximum length', async () => {
      renderRegister();

      await fillStudentForm({ student_number: '1'.repeat(21) });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/öğrenci numarası en fazla 20 karakter olabilir/i)).toBeInTheDocument();
      });
    });

    it('should validate employee number is required for faculty', async () => {
      renderRegister();

      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/personel no/i)).toBeInTheDocument();
      });

      await fillStudentForm({ role: 'faculty', employee_number: '' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/personel numarası gereklidir/i)).toBeInTheDocument();
      });
    });

    it('should validate title is required for faculty', async () => {
      renderRegister();

      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/ünvan/i)).toBeInTheDocument();
      });

      await fillStudentForm({ role: 'faculty', employee_number: '123456', title: '' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ünvan gereklidir/i)).toBeInTheDocument();
      });
    });

    it('should validate department is required', async () => {
      renderRegister();

      await fillStudentForm({ department_id: '' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/bölüm gereklidir/i)).toBeInTheDocument();
      });
    });

    it('should validate terms acceptance is required', async () => {
      renderRegister();

      await fillStudentForm({ terms: false });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/şartlar ve koşulları kabul etmelisiniz/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Student', () => {
    it('should submit student registration successfully', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalledWith({
          email: 'test@uni.edu.tr',
          password: 'Test1234',
          confirmPassword: 'Test1234',
          full_name: 'Test User',
          role: 'student',
          department_id: '1',
          student_number: '123456'
        });
      });
    });

    it('should display success message and redirect after successful registration', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/kayıt başarılı/i)).toBeInTheDocument();
        expect(screen.getByText(/e-posta adresinize gelen onay linkine/i)).toBeInTheDocument();
      });

      // Fast-forward timer
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should not include employee_number and title for student', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const callArg = mockRegisterUser.mock.calls[0][0];
        expect(callArg.employee_number).toBeUndefined();
        expect(callArg.title).toBeUndefined();
      });
    });
  });

  describe('Form Submission - Faculty', () => {
    it('should submit faculty registration successfully', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/personel no/i)).toBeInTheDocument();
      });

      await fillStudentForm({
        role: 'faculty',
        employee_number: 'EMP123',
        title: 'Prof. Dr.'
      });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalledWith({
          email: 'test@uni.edu.tr',
          password: 'Test1234',
          confirmPassword: 'Test1234',
          full_name: 'Test User',
          role: 'faculty',
          department_id: '1',
          employee_number: 'EMP123',
          title: 'Prof. Dr.'
        });
      });
    });

    it('should not include student_number for faculty', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });

      await waitFor(() => {
        expect(screen.getByLabelText(/personel no/i)).toBeInTheDocument();
      });

      await fillStudentForm({
        role: 'faculty',
        employee_number: 'EMP123',
        title: 'Prof. Dr.'
      });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const callArg = mockRegisterUser.mock.calls[0][0];
        expect(callArg.student_number).toBeUndefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on registration failure', async () => {
      mockRegisterUser.mockResolvedValue({
        success: false,
        error: 'Email already exists'
      });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });

    it('should handle error object with message property', async () => {
      mockRegisterUser.mockResolvedValue({
        success: false,
        error: { message: 'Custom error message' }
      });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
      });
    });

    it('should handle error object without message property', async () => {
      mockRegisterUser.mockResolvedValue({
        success: false,
        error: { code: 'auth/email-already-in-use' }
      });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/auth\/email-already-in-use/i)).toBeInTheDocument();
      });
    });

    it('should translate email verification error to Turkish', async () => {
      mockRegisterUser.mockResolvedValue({
        success: false,
        error: 'Please verify your email'
      });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/e-posta adresinizi onaylamanız gerekiyor/i)).toBeInTheDocument();
      });
    });

    it('should clear previous error on new submission', async () => {
      mockRegisterUser
        .mockResolvedValueOnce({ success: false, error: 'First error' })
        .mockResolvedValueOnce({ success: false, error: 'Second error' });

      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      
      // First submission
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
        expect(screen.getByText('Second error')).toBeInTheDocument();
      });
    });

    it('should clear success message on new submission', async () => {
      mockRegisterUser
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: false, error: 'Error' });

      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      
      // First submission - success
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/kayıt başarılı/i)).toBeInTheDocument();
      });

      // Second submission - error
      const emailInput = screen.getByLabelText(/e-posta/i);
      fireEvent.change(emailInput, { target: { value: 'another@uni.edu.tr' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/kayıt başarılı/i)).not.toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading text during registration', async () => {
      let resolveRegister;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      mockRegisterUser.mockReturnValue(registerPromise);

      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Kaydediliyor...')).toBeInTheDocument();
      });

      resolveRegister({ success: true });
    });

    it('should disable all inputs during loading', async () => {
      let resolveRegister;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      mockRegisterUser.mockReturnValue(registerPromise);

      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/ad soyad/i)).toBeDisabled();
        expect(screen.getByLabelText(/e-posta/i)).toBeDisabled();
        expect(screen.getByLabelText(/^şifre \*/i)).toBeDisabled();
        expect(screen.getByLabelText(/şifreyi onayla/i)).toBeDisabled();
        expect(screen.getByLabelText(/kullanıcı tipi/i)).toBeDisabled();
        expect(screen.getByLabelText(/öğrenci numarası/i)).toBeDisabled();
        expect(screen.getByLabelText(/bölüm/i)).toBeDisabled();
        expect(screen.getByLabelText(/şartlar ve koşulları kabul ediyorum/i)).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      resolveRegister({ success: true });
    });

    it('should re-enable inputs after failed registration', async () => {
      mockRegisterUser.mockResolvedValue({ success: false, error: 'Error' });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/ad soyad/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/e-posta/i)).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    it('should not re-enable inputs after successful registration', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/kayıt başarılı/i)).toBeInTheDocument();
      });

      // Inputs should still be disabled
      expect(screen.getByLabelText(/ad soyad/i)).toBeDisabled();
      expect(screen.getByLabelText(/e-posta/i)).toBeDisabled();
    });
  });

  describe('UI Elements and Styling', () => {
    it('should have correct CSS classes', async () => {
      const { container } = renderRegister();

      await waitFor(() => {
        const card = container.querySelector('.card');
        expect(card).toBeInTheDocument();

        const primaryButton = container.querySelector('.btn-primary');
        expect(primaryButton).toBeInTheDocument();
      });
    });

    it('should have placeholder for email input', async () => {
      renderRegister();

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/e-posta/i);
        expect(emailInput).toHaveAttribute('placeholder', 'ornek@uni.edu.tr');
      });
    });

    it('should have placeholder for title input', async () => {
      renderRegister();

      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/ünvan/i);
        expect(titleInput).toHaveAttribute('placeholder', 'örn. Prof. Dr.');
      });
    });

    it('should have proper input types', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText(/ad soyad/i)).toHaveAttribute('type', 'text');
        expect(screen.getByLabelText(/e-posta/i)).toHaveAttribute('type', 'email');
        expect(screen.getByLabelText(/^şifre \*/i)).toHaveAttribute('type', 'password');
        expect(screen.getByLabelText(/şifreyi onayla/i)).toHaveAttribute('type', 'password');
      });
    });

    it('should display both role options', async () => {
      renderRegister();

      await waitFor(() => {
        const studentOption = screen.getByRole('option', { name: /öğrenci/i });
        const facultyOption = screen.getByRole('option', { name: /akademisyen/i });

        expect(studentOption).toBeInTheDocument();
        expect(facultyOption).toBeInTheDocument();
      });
    });

    it('should have student as default role', async () => {
      renderRegister();

      await waitFor(() => {
        const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);
        expect(roleSelect.value).toBe('student');
      });
    });

    it('should have terms checkbox unchecked by default', async () => {
      renderRegister();

      await waitFor(() => {
        const termsCheckbox = screen.getByLabelText(/şartlar ve koşulları kabul ediyorum/i);
        expect(termsCheckbox).not.toBeChecked();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid form submissions', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });

      // Submit multiple times rapidly
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Register should only be called once due to loading state
        expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle empty departments array', async () => {
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: []
        }
      });

      renderRegister();

      await waitFor(() => {
        const departmentSelect = screen.getByLabelText(/bölüm/i);
        // Only "Bölüm Seçin" option should be present
        expect(departmentSelect.children).toHaveLength(1);
      });
    });

    it('should toggle terms checkbox correctly', async () => {
      renderRegister();

      await waitFor(() => {
        const termsCheckbox = screen.getByLabelText(/şartlar ve koşulları kabul ediyorum/i);
        
        expect(termsCheckbox).not.toBeChecked();
        
        fireEvent.click(termsCheckbox);
        expect(termsCheckbox).toBeChecked();
        
        fireEvent.click(termsCheckbox);
        expect(termsCheckbox).not.toBeChecked();
      });
    });

    it('should handle switching roles multiple times', async () => {
      renderRegister();

      const roleSelect = screen.getByLabelText(/kullanıcı tipi/i);

      // Switch to faculty
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });
      await waitFor(() => {
        expect(screen.getByLabelText(/personel no/i)).toBeInTheDocument();
      });

      // Switch back to student
      fireEvent.change(roleSelect, { target: { value: 'student' } });
      await waitFor(() => {
        expect(screen.getByLabelText(/öğrenci numarası/i)).toBeInTheDocument();
      });

      // Switch to faculty again
      fireEvent.change(roleSelect, { target: { value: 'faculty' } });
      await waitFor(() => {
        expect(screen.getByLabelText(/personel no/i)).toBeInTheDocument();
      });
    });

    it('should accept valid .edu.tr email', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm({ email: 'test@university.edu.tr' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalled();
        expect(screen.queryByText(/e-posta adresi \.edu uzantılı olmalıdır/i)).not.toBeInTheDocument();
      });
    });

    it('should accept valid .edu email', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm({ email: 'test@university.edu' });

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegisterUser).toHaveBeenCalled();
        expect(screen.queryByText(/e-posta adresi \.edu uzantılı olmalıdır/i)).not.toBeInTheDocument();
      });
    });

    it('should handle all validation errors at once', async () => {
      renderRegister();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Ad soyad gereklidir')).toBeInTheDocument();
        expect(screen.getByText('E-posta gereklidir')).toBeInTheDocument();
        expect(screen.getByText('Şifre gereklidir')).toBeInTheDocument();
        expect(screen.getByText(/şartlar ve koşulları kabul etmelisiniz/i)).toBeInTheDocument();
      });
    });

    it('should handle form reset after successful submission', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/kayıt başarılı/i)).toBeInTheDocument();
      });

      // Values should still be in the form
      expect(screen.getByLabelText(/ad soyad/i).value).toBe('Test User');
      expect(screen.getByLabelText(/e-posta/i).value).toBe('test@uni.edu.tr');
    });
  });

  describe('Navigation', () => {
    it('should not navigate before timeout completes', async () => {
      mockRegisterUser.mockResolvedValue({ success: true });
      renderRegister();

      await fillStudentForm();

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/kayıt başarılı/i)).toBeInTheDocument();
      });

      // Before timeout
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockNavigate).not.toHaveBeenCalled();

      // After timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Console Logging', () => {
    it('should log department fetching', async () => {
      renderRegister();

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('Fetching departments'),
          expect.any(String)
        );
      });
    });

    it('should log departments response', async () => {
      renderRegister();

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Departments response:', expect.any(Object));
        expect(console.log).toHaveBeenCalledWith('Response data:', expect.any(Object));
      });
    });

    it('should log error on departments loading failure', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      renderRegister();

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to load departments:', expect.any(Error));
      });
    });
  });
});