import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const homeRoute = user?.role === 'ADMIN' || user?.role === 'Admin' ? '/admin/dashboard' : user?.role === 'HOTEL_MANAGER' || user?.role === 'HotelManager' ? '/manager/dashboard' : '/';

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to={homeRoute} className="text-xl font-bold text-blue-600">
                    BookingKhachSan
                </Link>
                <div className="space-x-4">
                    <Link to={homeRoute} className="hover:text-blue-600">Trang chủ</Link>
                    {!token ? (
                        <>
                            <Link to="/login" className="hover:text-blue-600">Đăng nhập</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Đăng ký</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/user/profile" className="hover:text-blue-600">Cá nhân</Link>
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Đăng xuất</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
