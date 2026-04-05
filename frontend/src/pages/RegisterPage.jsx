import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

// ── Password strength validator (same rules as Admin) ─────────────
const validatePassword = (pw) => {
  if (!pw) return '';
  if (pw.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (!/[A-Z]/.test(pw)) return 'Phải có ít nhất 1 chữ hoa (A-Z)';
  if (!/[0-9]/.test(pw)) return 'Phải có ít nhất 1 chữ số (0-9)';
  if (!/@/.test(pw)) return 'Phải chứa ký tự @';
  return '';
};

const EyeIcon = ({ show }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {show
      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
    }
  </svg>
);

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        matKhau: '',
        xacNhanMatKhau: '',
        sdt: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePwChange = (e) => {
        const val = e.target.value;
        setFormData(f => ({ ...f, matKhau: val }));
        setPwError(validatePassword(val));
    };

    const pwStrength = formData.matKhau ? (
        validatePassword(formData.matKhau) ? 'weak' :
        formData.matKhau.length >= 12 ? 'strong' : 'medium'
    ) : null;

    const validateForm = () => {
        const { email, matKhau, xacNhanMatKhau, sdt } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Email không hợp lệ';
        const pwErr = validatePassword(matKhau);
        if (pwErr) return pwErr;
        if (matKhau !== xacNhanMatKhau) return 'Mật khẩu xác nhận không khớp!';
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(sdt)) return 'Số điện thoại phải có đúng 10 chữ số';
        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const { xacNhanMatKhau, ...payload } = formData;
            const response = await axiosClient.post('/auth/register', payload);
            const { token, role, hoTen, userId, email } = response.data;
            login(token, role, hoTen, userId, email);

            if (role === 'Admin') navigate('/admin/dashboard');
            else if (role === 'HotelManager') navigate('/manager/dashboard');
            else navigate('/');
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error) setError(err.response.data.error);
            else if (err.response?.data?.message) setError(err.response.data.message);
            else setError('Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Left Side - Image */}
                <div className="hidden md:block w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Resort Pool"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-green-900 bg-opacity-40 flex items-center justify-center">
                        <div className="text-white text-center p-8">
                            <h2 className="text-3xl font-bold mb-2">Thành Viên Mới?</h2>
                            <p className="text-lg">Tham gia cùng chúng tôi để nhận ưu đãi đặc biệt</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-10 overflow-y-auto max-h-screen">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">Tạo Tài Khoản</h2>
                        <p className="text-gray-500 mt-2">Bắt đầu hành trình của bạn ngay hôm nay</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-5 rounded" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Họ tên */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                            <input
                                name="hoTen" type="text" required
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                name="email" type="email" required
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="tenemail@example.com"
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                name="sdt" type="tel" required
                                onChange={e => setFormData(f => ({ ...f, sdt: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                value={formData.sdt}
                                maxLength={10}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="0912345678"
                            />
                        </div>

                        {/* Mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    name="matKhau"
                                    type={showPw ? 'text' : 'password'}
                                    value={formData.matKhau}
                                    onChange={handlePwChange}
                                    required
                                    className={`w-full px-4 py-3 pr-11 border rounded-lg focus:ring-2 outline-none transition-all ${pwError ? 'border-red-400 focus:ring-red-300' : pwStrength === 'strong' ? 'border-green-400 focus:ring-green-300' : 'border-gray-300 focus:ring-green-500'}`}
                                    placeholder="Ví dụ: MyPass@123"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <EyeIcon show={showPw} />
                                </button>
                            </div>

                            {/* Strength bar */}
                            {formData.matKhau && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-1">
                                        {['weak', 'medium', 'strong'].map((lvl, i) => (
                                            <div key={lvl} className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                pwStrength === 'strong' ? 'bg-green-500' :
                                                pwStrength === 'medium' && i < 2 ? 'bg-yellow-400' :
                                                pwStrength === 'weak' && i < 1 ? 'bg-red-400' : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                    {pwError
                                        ? <p className="text-xs text-red-500">{pwError}</p>
                                        : <p className="text-xs text-green-600">✓ Mật khẩu hợp lệ</p>
                                    }
                                </div>
                            )}

                            {/* Password requirements checklist */}
                            <ul className="mt-2 text-xs text-gray-400 space-y-0.5 pl-1">
                                {[
                                    [/[A-Z]/, 'Ít nhất 1 chữ hoa (A-Z)'],
                                    [/[0-9]/, 'Ít nhất 1 chữ số (0-9)'],
                                    [/@/, 'Chứa ký tự @'],
                                    [/.{8}/, 'Tối thiểu 8 ký tự'],
                                ].map(([regex, label]) => (
                                    <li key={label} className={formData.matKhau && regex.test(formData.matKhau) ? 'text-green-600' : ''}>
                                        {formData.matKhau && regex.test(formData.matKhau) ? '✓' : '○'} {label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <input
                                    name="xacNhanMatKhau"
                                    type={showConfirmPw ? 'text' : 'password'}
                                    value={formData.xacNhanMatKhau}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 pr-11 border rounded-lg focus:ring-2 outline-none transition-all ${
                                        formData.xacNhanMatKhau && formData.xacNhanMatKhau !== formData.matKhau
                                            ? 'border-red-400 focus:ring-red-300'
                                            : formData.xacNhanMatKhau && formData.xacNhanMatKhau === formData.matKhau
                                            ? 'border-green-400 focus:ring-green-300'
                                            : 'border-gray-300 focus:ring-green-500'}`}
                                    placeholder="Nhập lại mật khẩu"
                                />
                                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <EyeIcon show={showConfirmPw} />
                                </button>
                            </div>
                            {formData.xacNhanMatKhau && (
                                <p className={`text-xs mt-1 ${formData.xacNhanMatKhau === formData.matKhau ? 'text-green-600' : 'text-red-500'}`}>
                                    {formData.xacNhanMatKhau === formData.matKhau ? '✓ Mật khẩu khớp' : '✗ Mật khẩu không khớp'}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-md hover:shadow-lg mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <a href="/login" className="font-semibold text-green-600 hover:text-green-500 hover:underline">
                            Đăng nhập ngay
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
