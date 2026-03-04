import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/login');
    };

    const homeRoute =
        user?.role === 'Admin' || user?.role === 'ADMIN' ? '/admin/dashboard'
        : user?.role === 'HotelManager' || user?.role === 'HOTEL_MANAGER' ? '/manager/dashboard'
        : '/';

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initials = user?.hoTen
        ? user.hoTen.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : (user?.email?.[0]?.toUpperCase() || 'U');

    const menuItems = token ? [
        ...(user?.role === 'Admin' || user?.role === 'ADMIN' ? [
            { icon: '🛡️', label: 'Quản trị hệ thống', to: '/admin/dashboard' },
        ] : []),
        ...(user?.role === 'HotelManager' || user?.role === 'HOTEL_MANAGER' ? [
            { icon: '🏨', label: 'Quản lý khách sạn', to: '/manager/dashboard' },
        ] : []),
        { icon: '👤', label: 'Tài khoản cá nhân', to: '/user/profile' },
        { icon: '📋', label: 'Đặt phòng của tôi', to: '/user/profile#bookings' },
        { icon: '⭐', label: 'Đánh giá của tôi', to: '/user/profile' },
    ] : [];

    return (
        <nav style={{ backgroundColor: '#003580' }} className="sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto px-4 py-0 flex justify-between items-center h-14">
                {/* Logo */}
                <Link to={homeRoute} className="flex items-center gap-2 group">
                    <span className="text-2xl">🏨</span>
                    <span className="text-white font-extrabold text-lg tracking-tight group-hover:text-blue-200 transition-colors">
                        BookingKhachSan
                    </span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <Link
                        to={homeRoute}
                        className="text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
                    >
                        Trang chủ
                    </Link>

                    {!token ? (
                        <>
                            <Link
                                to="/login"
                                className="text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors border border-white/40"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-bold px-4 py-1.5 rounded-md transition-colors"
                                style={{ backgroundColor: '#fff', color: '#003580' }}
                            >
                                Đăng ký
                            </Link>
                        </>
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            {/* Avatar button */}
                            <button
                                onClick={() => setDropdownOpen(o => !o)}
                                className="flex items-center gap-2 group pl-2 pr-3 py-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                            >
                                {/* Avatar circle */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white/40"
                                    style={{ backgroundColor: '#0071c2', color: '#fff' }}
                                >
                                    {initials}
                                </div>
                                <span className="text-white text-sm font-semibold hidden sm:block max-w-[120px] truncate">
                                    {user?.hoTen || user?.email || 'Người dùng'}
                                </span>
                                <svg
                                    className={`w-3.5 h-3.5 text-white/70 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown panel */}
                            {dropdownOpen && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                                    style={{ zIndex: 9999 }}
                                >
                                    {/* User info header */}
                                    <div className="px-4 py-3 border-b border-gray-100"
                                         style={{ background: 'linear-gradient(135deg, #003580 0%, #0071c2 100%)' }}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow ring-2 ring-white/30"
                                                style={{ backgroundColor: '#fff', color: '#003580' }}
                                            >
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-bold text-sm truncate">
                                                    {user?.hoTen || 'Người dùng'}
                                                </p>
                                                <p className="text-blue-200 text-xs truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-1">
                                        {menuItems.map((item, idx) => (
                                            <Link
                                                key={idx}
                                                to={item.to}
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm"
                                            >
                                                <span className="text-base w-5 text-center">{item.icon}</span>
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <span className="text-base w-5 text-center">🚪</span>
                                            <span className="font-medium">Đăng xuất</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
