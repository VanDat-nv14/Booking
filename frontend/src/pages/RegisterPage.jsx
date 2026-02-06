import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        matKhau: '',
        sdt: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const { email, matKhau, sdt } = formData;
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Email không hợp lệ";

        // Password validation (min 6 chars)
        if (matKhau.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";

        // Phone validation (exactly 9 digits)
        const phoneRegex = /^\d{9}$/;
        if (!phoneRegex.test(sdt)) return "Số điện thoại phải có đúng 9 số";

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

        try {
            await axiosClient.post('/auth/register', formData);
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Đăng ký thất bại. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Left Side - Image for Register */}
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
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Tạo Tài Khoản</h2>
                        <p className="text-gray-500 mt-2">Bắt đầu hành trình của bạn ngay hôm nay</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                            <input 
                                name="hoTen" 
                                type="text" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="Nguyễn Văn A" 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                name="email" 
                                type="email" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="name@company.com" 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input 
                                name="sdt" 
                                type="text" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="0912345678" 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                            <input 
                                name="matKhau" 
                                type="password" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="•••••••" 
                                onChange={handleChange} 
                                required 
                            />
                            <p className="text-xs text-gray-500 mt-1">Ít nhất 6 ký tự</p>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-md hover:shadow-lg mt-4"
                        >
                            Đăng Ký
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
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
