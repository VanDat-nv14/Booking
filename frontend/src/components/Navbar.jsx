import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-blue-600">
                    BookingKhachSan
                </Link>
                <div className="space-x-4">
                    <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
                    {user?.role === 'ADMIN' && (
                         <Link to="/admin/dashboard" className="hover:text-blue-600 font-semibold text-red-500">Admin</Link>
                    )}
                    {user?.role === 'HOTEL_MANAGER' && (
                         <Link to="/manager/dashboard" className="hover:text-blue-600 font-semibold text-green-500">Manager</Link>
                    )}
                    {!token ? (
                        <>
                            <Link to="/login" className="hover:text-blue-600">Đăng nhập</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Đăng ký</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/profile" className="hover:text-blue-600">Cá nhân</Link>
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Đăng xuất</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
