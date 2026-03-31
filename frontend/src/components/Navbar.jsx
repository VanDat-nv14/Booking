import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { IconBuilding } from './icons/UiIcons';
import axiosClient from '../api/axiosClient';

/** Thứ tự ưu tiên logo trong `public/`: logo chính → PNG (nếu bạn thêm `brand-logo.png`) → brand-logo.svg */
const BRAND_LOGO_FILES = ['logo.svg', 'brand-logo.png', 'brand-logo.svg'];

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
            <div className="bg-white rounded-2xl shadow-card ring-1 ring-slate-200/80 w-full max-w-sm p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Đổi mật khẩu</h3>
                    <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition text-lg leading-none">×</button>
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
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                    aria-label={show[showKey] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                                    {show[showKey] ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 shadow-sm">
                            {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition">
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
    const [logoFailed, setLogoFailed] = useState(false);
    const [logoFileIdx, setLogoFileIdx] = useState(0);
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
    const _base = import.meta.env.BASE_URL || '/';
    const baseUrl = _base.endsWith('/') ? _base : `${_base}/`;
    const brandLogoSrc = baseUrl + BRAND_LOGO_FILES[Math.min(logoFileIdx, BRAND_LOGO_FILES.length - 1)];
    const avatarSrc = user?.avatarUrl
        ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : BACKEND + user.avatarUrl)
        : null;

    // SVG icon components for dropdown
    const SvgIcon = ({ d, d2 }) => (
        <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
            {d2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d2} />}
        </svg>
    );
    const ICONS_SVG = {
        admin:   'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        user:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        hotel:   'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        list:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        star:    'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
        key:     'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
        logout:  'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    };

    const menuItems = token ? [
        ...(user?.role === 'Admin' || user?.role === 'ADMIN' ? [
            { iconKey: 'admin', label: 'Quản trị hệ thống', to: '/admin/dashboard' },
            { iconKey: 'user', label: 'Tài khoản cá nhân', to: '/user/profile' },
        ] : []),
        ...(user?.role === 'HotelManager' || user?.role === 'HOTEL_MANAGER' ? [
            { iconKey: 'hotel', label: 'Quản lý khách sạn', to: '/manager/dashboard' },
            { iconKey: 'user', label: 'Tài khoản cá nhân', to: '/user/profile' },
        ] : []),
        ...(user?.role === 'User' || user?.role === 'USER' ? [
            { iconKey: 'user', label: 'Tài khoản cá nhân', to: '/user/profile' },
            { iconKey: 'list', label: 'Lịch sử đặt phòng', to: '/user/bookings' },
            { iconKey: 'star', label: 'Đánh giá của tôi', to: '/user/reviews' },
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

            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-nav">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-[3.25rem]">
                    {/* Logo */}
                    <Link to={homeRoute} className="flex items-center gap-2.5 group min-w-0">
                        {!logoFailed ? (
                            <img
                                key={logoFileIdx}
                                src={brandLogoSrc}
                                alt="Hotel Bookings"
                                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl shadow-sm ring-1 ring-slate-200/80 object-contain bg-white motion-safe:animate-fade-in"
                                width={40}
                                height={40}
                                decoding="async"
                                onError={() => {
                                    if (logoFileIdx < BRAND_LOGO_FILES.length - 1) setLogoFileIdx((i) => i + 1);
                                    else setLogoFailed(true);
                                }}
                            />
                        ) : (
                            <span className="h-9 w-9 shrink-0 rounded-xl shadow-sm ring-1 ring-slate-200/80 bg-[#8ca4b8] flex items-center justify-center text-white motion-safe:animate-fade-in" aria-hidden>
                                <IconBuilding className="w-5 h-5 opacity-95" />
                            </span>
                        )}
                        <span className="flex flex-col leading-tight min-w-0">
                            <span className="text-[15px] sm:text-base font-bold tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors truncate">
                                Hotel Bookings
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 hidden sm:block">
                                Online booking
                            </span>
                        </span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            to={homeRoute}
                            className="text-slate-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            Trang chủ
                        </Link>

                        {!token ? (
                            <>
                                <Link
                                    to="/login"
                                    className="text-slate-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                {/* Notification Dropdown */}
                                <NotificationDropdown />
                                
                                <div className="relative" ref={dropdownRef}>
                                    {/* Avatar button */}
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(o => !o)}
                                    className="flex items-center gap-2 group pl-1.5 pr-2 py-1 rounded-full border border-slate-200/90 bg-slate-50/80 hover:bg-white hover:border-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                                >
                                    {/* Avatar circle / image */}
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="avatar"
                                            className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white"
                                            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm bg-gradient-to-br from-brand-500 to-brand-700 text-white ring-2 ring-white"
                                        style={{ display: avatarSrc ? 'none' : 'flex' }}
                                    >
                                        {initials}
                                    </div>
                                    <span className="text-slate-800 text-sm font-medium hidden sm:block max-w-[120px] truncate">
                                        {user?.hoTen || user?.email || 'Người dùng'}
                                    </span>
                                    <svg
                                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown panel */}
                                {dropdownOpen && (
                                    <div
                                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-card ring-1 ring-slate-200/80 overflow-hidden z-[9999]"
                                    >
                                        {/* User info header */}
                                        <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900">
                                            <div className="flex items-center gap-3">
                                                {(avatarSrc && !avatarImgError) ? (
                                                    <img src={avatarSrc} alt=""
                                                        className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white/60"
                                                        onError={() => setAvatarImgError(true)}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md bg-white text-brand-700 ring-2 ring-white/60"
                                                    >
                                                        {initials}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">
                                                        {user?.hoTen || 'Người dùng'}
                                                    </p>
                                                    <p className="text-slate-300 text-xs truncate">{user?.email}</p>
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
                                                    className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors text-sm"
                                                >
                                                    <span className="w-4 h-4 flex-shrink-0 text-slate-400">
                                                        <SvgIcon d={ICONS_SVG[item.iconKey]} />
                                                    </span>
                                                    <span className="font-medium">{item.label}</span>
                                                </Link>
                                            ))}

                                            {/* Đổi mật khẩu */}
                                            <button
                                                type="button"
                                                onClick={() => { setDropdownOpen(false); setShowChangePw(true); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors text-sm"
                                            >
                                                <span className="w-4 h-4 flex-shrink-0 text-slate-400"><SvgIcon d={ICONS_SVG.key} /></span>
                                                <span className="font-medium">Đổi mật khẩu</span>
                                            </button>
                                        </div>

                                        {/* Divider + Đăng xuất */}
                                        <div className="border-t border-slate-100 py-1">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <span className="w-4 h-4 flex-shrink-0"><SvgIcon d={ICONS_SVG.logout} /></span>
                                                <span className="font-medium">Đăng xuất</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
        </>
    );
};

export default Navbar;
