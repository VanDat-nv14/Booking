import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

/* ── Change Password Modal ──────────────────────────── */
const ChangePwModal = ({ userId, onClose }) => {
    const [form, setForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
    const [show, setShow] = useState({ cu: false, moi: false, xn: false });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (form.matKhauMoi !== form.xacNhanMatKhau) { setError('Mật khẩu xác nhận không khớp!'); return; }
        if (form.matKhauMoi.length < 8) { setError('Mật khẩu phải ít nhất 8 ký tự!'); return; }
        setSaving(true);
        try {
            await axiosClient.put(`/user/${userId}`, form);
            setSuccess('Đổi mật khẩu thành công!');
            setForm({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
            setTimeout(onClose, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Đổi mật khẩu thất bại!');
        } finally { setSaving(false); }
    };

    const fields = [
        { key: 'matKhauCu', label: 'Mật khẩu hiện tại', show: 'cu' },
        { key: 'matKhauMoi', label: 'Mật khẩu mới', show: 'moi' },
        { key: 'xacNhanMatKhau', label: 'Xác nhận mật khẩu mới', show: 'xn' },
    ];

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-800">🔑 Đổi mật khẩu</h3>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">✕</button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2">{error}</div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-3 py-2">✅ {success}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    {fields.map(({ key, label, show: showKey }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                            <div className="relative">
                                <input
                                    type={show[showKey] ? 'text' : 'password'}
                                    value={form[key]}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    required
                                    placeholder="••••••••"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-9 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                />
                                <button type="button"
                                    onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                                    {show[showKey] ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-60">
                            {saving ? '⏳ Đang lưu...' : 'Đổi mật khẩu'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition">
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Navbar ──────────────────────────────────────────── */
const Navbar = () => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [avatarImgError, setAvatarImgError] = useState(false);
    const [showChangePw, setShowChangePw] = useState(false);
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

    // Reset avatar error khi user/avatarUrl thay đổi (vd: login mới)
    useEffect(() => { setAvatarImgError(false); }, [user?.avatarUrl]);

    const initials = user?.hoTen
        ? user.hoTen.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : (user?.email?.[0]?.toUpperCase() || 'U');

    const BACKEND = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
    const avatarSrc = user?.avatarUrl
        ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : BACKEND + user.avatarUrl)
        : null;

    const menuItems = token ? [
        ...(user?.role === 'Admin' || user?.role === 'ADMIN' ? [
            { icon: '🛡️', label: 'Quản trị hệ thống', to: '/admin/dashboard' },
            { icon: '👤', label: 'Tài khoản cá nhân', to: '/user/profile' },
        ] : []),
        ...(user?.role === 'HotelManager' || user?.role === 'HOTEL_MANAGER' ? [
            { icon: '🏨', label: 'Quản lý khách sạn', to: '/manager/dashboard' },
            { icon: '👤', label: 'Tài khoản cá nhân', to: '/user/profile' },
            { icon: '📋', label: 'Lịch sử đặt phòng', to: '/user/bookings' },
            { icon: '⭐', label: 'Đánh giá của tôi', to: '/user/profile' },
        ] : []),
        ...(user?.role === 'User' || user?.role === 'USER' ? [
            { icon: '👤', label: 'Tài khoản cá nhân', to: '/user/profile' },
            { icon: '📋', label: 'Lịch sử đặt phòng', to: '/user/bookings' },
            { icon: '⭐', label: 'Đánh giá của tôi', to: '/user/profile' },
        ] : []),
    ] : [];

    return (
        <>
            {/* Change Password Modal */}
            {showChangePw && (
                <ChangePwModal
                    userId={user?.userId}
                    onClose={() => setShowChangePw(false)}
                />
            )}

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
                                    {/* Avatar circle / image */}
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="avatar"
                                            className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white/60"
                                            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white/40"
                                        style={{ backgroundColor: '#0071c2', color: '#fff', display: avatarSrc ? 'none' : 'flex' }}
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
                                                {(avatarSrc && !avatarImgError) ? (
                                                    <img src={avatarSrc} alt=""
                                                        className="w-10 h-10 rounded-full object-cover shadow ring-2 ring-white/50"
                                                        onError={() => setAvatarImgError(true)}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow ring-2 ring-white/30"
                                                        style={{ backgroundColor: '#fff', color: '#003580' }}
                                                    >
                                                        {initials}
                                                    </div>
                                                )}
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

                                            {/* Đổi mật khẩu */}
                                            <button
                                                onClick={() => { setDropdownOpen(false); setShowChangePw(true); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm"
                                            >
                                                <span className="text-base w-5 text-center">🔑</span>
                                                <span className="font-medium">Đổi mật khẩu</span>
                                            </button>
                                        </div>

                                        {/* Divider + Đăng xuất */}
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
        </>
    );
};

export default Navbar;
