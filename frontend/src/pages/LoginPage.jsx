import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        if (searchParams.get('oauth_error') === '1') {
            setError('Đăng nhập bằng mạng xã hội thất bại. Vui lòng thử lại hoặc dùng email/mật khẩu.');
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        // Basic Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
             setError("Email không hợp lệ");
             return;
        }

        try {
            const response = await axiosClient.post('/auth/login', {
                email: email,
                matKhau: password
            });
            
            // Use AuthContext to login
            login(response.data.token, response.data.role, response.data.hoTen, response.data.userId, response.data.email);
            
            const role = response.data.role;
            if (role === 'ADMIN' || role === 'Admin') {
                navigate('/admin/dashboard');
            } else if (role === 'HOTEL_MANAGER' || role === 'HotelManager') {
                navigate('/manager/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                 setError(err.response.data.error);
            } else if (err.response && err.response.status === 403) {
                 setError('Email hoặc mật khẩu không chính xác!');
            } else {
                 setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Left Side - Image */}
                <div className="hidden md:block w-1/2 relative">
                    <img 
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                        alt="Luxury Hotel" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-900 bg-opacity-40 flex items-center justify-center">
                        <div className="text-white text-center p-8">
                            <h2 className="text-3xl font-bold mb-2">Đặt Phòng Khách Sạn</h2>
                            <p className="text-lg">Trải nghiệm kỳ nghỉ tuyệt vời nhất</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Đăng Nhập</h2>
                        <p className="text-gray-500 mt-2">Chào mừng bạn quay trở lại!</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="tenemail@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                <a href="/forgot-password" class="text-sm text-blue-600 hover:text-blue-500 font-medium">Quên mật khẩu?</a>
                            </div>
                            <input 
                                type="password" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Đăng Nhập
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <a 
                                href={`${import.meta.env.VITE_BACKEND_BASE_URL}/oauth2/authorization/google`}
                                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </a>
                            <a 
                                href={`${import.meta.env.VITE_BACKEND_BASE_URL}/oauth2/authorization/facebook`}
                                className="flex items-center justify-center w-full px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                            >
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                </svg>
                                <span className="text-sm font-medium">Facebook</span>
                            </a>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <a href="/register" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                            Đăng ký ngay
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
