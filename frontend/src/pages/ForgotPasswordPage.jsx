import { useState } from 'react';
import axiosClient from '../api/axiosClient';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await axiosClient.post('/auth/forgot-password', { email });
            setMessage('Đã gửi link đặt lại mật khẩu vào email của bạn.');
        } catch (err) {
            setError('Không tìm thấy email hoặc có lỗi xảy ra.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Quên Mật Khẩu</h2>
            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Nhập email của bạn</label>
                    <input 
                        type="email" 
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                    Gửi Yêu Cầu
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
