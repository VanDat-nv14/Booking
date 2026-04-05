import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

/* ─── SVG icon atoms ─────────────────────────────────────── */
const BellIcon = ({ hasUnread }) => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {hasUnread ? (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </>
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        )}
    </svg>
);

const RefreshIcon = ({ spinning }) => (
    <svg className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const CheckAllIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

/* ─── Type icon + palette mapping ───────────────────────── */
const TYPE_CONFIG = {
    PROMO_APPROVAL: {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
        ),
        dot: 'bg-amber-500',
        bubble: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        label: 'Khuyến mãi',
    },
    GUEST_REPORT: {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        dot: 'bg-red-500',
        bubble: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        badge: 'bg-red-100 text-red-800',
        label: 'Báo cáo',
    },
    ALERT: {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
        dot: 'bg-red-500',
        bubble: 'bg-red-50 text-red-600 ring-1 ring-red-200',
        badge: 'bg-red-100 text-red-700',
        label: 'Cảnh báo',
    },
    SYSTEM: {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
        ),
        dot: 'bg-slate-500',
        bubble: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
        badge: 'bg-slate-100 text-slate-700',
        label: 'Hệ thống',
    },
    POLICY: {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        dot: 'bg-orange-500',
        bubble: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
        badge: 'bg-orange-100 text-orange-800',
        label: 'Chính sách',
    },
    INFO: {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        dot: 'bg-brand-500',
        bubble: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
        badge: 'bg-brand-50 text-brand-700',
        label: 'Thông tin',
    },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.INFO;

/* ─── Relative time helper ───────────────────────────────── */
const fmtVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n || 0));
const offerTeaserLabel = (o) => {
    if (!o) return '';
    if (o.loai === 'PERCENT') return `Giảm ${o.giaTri}%`;
    return `Giảm ${fmtVnd(o.giaTri)}`;
};

const relativeTime = (isoString) => {
    if (!isoString) return '';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const mapSystemNotificationRow = (n, userRoleForLink) => {
    const titleLower = (n.tieuDe || '').toLowerCase();
    let link = '#';
    const roleLo = String(userRoleForLink || '').toLowerCase();
    const isUser = userRoleForLink === 'User' || userRoleForLink === 'USER' || roleLo === 'user';
    const isManager = userRoleForLink === 'HotelManager' || userRoleForLink === 'HOTEL_MANAGER' || roleLo === 'hotelmanager';
    const bookingKeywords = titleLower.includes('đặt phòng') || titleLower.includes('xác nhận')
        || titleLower.includes('check-in') || titleLower.includes('check-out')
        || titleLower.includes('thanh toán') || titleLower.includes('báo cáo');
    if (isUser && bookingKeywords) {
        link = '/user/bookings';
    } else if (isManager && bookingKeywords) {
        link = '/manager/dashboard';
    }
    return {
        id: n.id,
        rawId: n.id,
        title: n.tieuDe,
        description: n.noiDung,
        time: n.createdAt || n.ngayGui,
        type: n.loai || 'INFO',
        link,
        read: n.read === true || n.read === 'true',
    };
};

/* ─── Main component ─────────────────────────────────────── */
const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [bellOffers, setBellOffers] = useState({ platformDiscounts: [], hotelPromotions: [] });
    const dropdownRef = useRef(null);
    const { user } = useAuth();
    const userRole = user?.role || localStorage.getItem('role');

    const isAdminRole = (r) => r === 'Admin' || r === 'ADMIN';
    const isManagerOrUserRole = (r) => {
        if (!r) return false;
        const x = String(r).trim();
        return (
            x === 'HotelManager' || x === 'HOTEL_MANAGER'
            || x === 'User' || x === 'USER'
            || x.toLowerCase() === 'hotelmanager' || x.toLowerCase() === 'user'
        );
    };

    /* ── Fetch ── */
    const fetchNotifications = useCallback(async () => {
        if (!userRole) return;
        setLoading(true);
        try {
            try {
                const bres = await axiosClient.get('/coupons/public/bell-teasers');
                setBellOffers(bres.data || { platformDiscounts: [], hotelPromotions: [] });
            } catch {
                setBellOffers({ platformDiscounts: [], hotelPromotions: [] });
            }
            if (isAdminRole(userRole)) {
                const emailNorm = (user?.email || localStorage.getItem('email') || '').trim().toLowerCase();
                const [resPromo, resReports, resSys] = await Promise.all([
                    axiosClient.get('/promotions', { params: { trangThai: 'PENDING_APPROVAL' } }),
                    axiosClient.get('/guest-reports'),
                    axiosClient.get('/system-notifications', { params: { trangThai: 'SENT' } }),
                ]);

                const promos = (resPromo.data || []).map((p) => ({
                    id: `promo-${p.id}`,
                    rawId: p.id,
                    title: 'Yêu cầu duyệt khuyến mãi',
                    description: `${p.ten} (KS #${p.khachSanId || 'Hệ thống'})`,
                    time: p.createdAt,
                    type: 'PROMO_APPROVAL',
                    link: '/admin/dashboard?tab=promotions',
                    read: false,
                }));

                const reports = (resReports.data || [])
                    .filter((r) => r.trangThai === 'PENDING')
                    .map((r) => ({
                        id: `report-${r.id}`,
                        rawId: r.id,
                        title: 'Báo cáo sự cố mới',
                        description: [r.loaiVanDe, r.khachSanTen || r.bookingCode, r.moTa]
                            .filter(Boolean).join(' — ').slice(0, 120),
                        time: r.createdAt,
                        type: 'GUEST_REPORT',
                        link: '/admin/dashboard?tab=guestReports',
                        read: false,
                    }));

                const sysMapped = (resSys.data || [])
                    .filter((n) => {
                        if (n.trangThai !== 'SENT') return false;
                        const dt = n.doiTuong || '';
                        if (dt === 'ALL' || dt === 'Admin' || dt === 'ADMIN') return true;
                        if (dt === 'PRIVATE' && n.nguoiNhan && String(n.nguoiNhan).trim().toLowerCase() === emailNorm) {
                            return true;
                        }
                        return false;
                    })
                    .map((n) => {
                        const row = mapSystemNotificationRow(n, userRole);
                        const isPrivate = (n.doiTuong || '') === 'PRIVATE';
                        return {
                            ...row,
                            link: isPrivate ? '/admin/dashboard?tab=notifications' : row.link,
                        };
                    });

                setNotifications(
                    [...promos, ...reports, ...sysMapped].sort((a, b) => new Date(b.time) - new Date(a.time))
                );
            } else if (isManagerOrUserRole(userRole)) {
                const res = await axiosClient.get('/system-notifications');
                const sysNotifs = (res.data || [])
                    .filter((n) => n.trangThai === 'SENT')
                    .map((n) => mapSystemNotificationRow(n, userRole))
                    .sort((a, b) => new Date(b.time) - new Date(a.time));

                setNotifications(sysNotifs);
            }
        } catch (err) {
            console.error('Lỗi tải thông báo:', err);
        } finally {
            setLoading(false);
        }
    }, [userRole, user?.email]);

    /* ── Poll every 30s ── */
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    /* ── Close on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;
    const bellCount =
        (bellOffers.platformDiscounts?.length || 0) + (bellOffers.hotelPromotions?.length || 0);

    /* ── Mark single as read ── */
    const markSingleRead = async (n) => {
        if (n.read || n.type === 'PROMO_APPROVAL' || n.type === 'GUEST_REPORT') return;
        try {
            await axiosClient.put(`/system-notifications/${encodeURIComponent(n.id)}/read`);
            setNotifications((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
            );
        } catch (err) {
            console.error('Không thể đánh dấu đã đọc:', err);
        }
    };

    /* ── Mark ALL as read ── */
    const markAllRead = async () => {
        const hasUnread = notifications.some(
            (n) => !n.read && n.type !== 'PROMO_APPROVAL' && n.type !== 'GUEST_REPORT'
        );
        if (!hasUnread) return;
        setMarkingAll(true);
        try {
            await axiosClient.put('/system-notifications/read-all');
            setNotifications((prev) =>
                prev.map((x) =>
                    x.type !== 'PROMO_APPROVAL' && x.type !== 'GUEST_REPORT'
                        ? { ...x, read: true }
                        : x
                )
            );
        } catch (err) {
            console.error('Mark all read failed:', err);
        } finally {
            setMarkingAll(false);
        }
    };

    /* ── Empty state ── */
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 shadow-inner">
                <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <p className="text-sm font-semibold text-slate-500">Không có thông báo mới</p>
            <p className="text-xs text-slate-400 mt-1">Bạn đã đọc hết tất cả thông báo</p>
        </div>
    );

    /* ── Notification row ── */
    const NotifRow = ({ n }) => {
        const cfg = getTypeConfig(n.type);
        const inner = (
            <div className="flex gap-3 items-start">
                {/* Colored icon bubble */}
                <div className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center ${cfg.bubble}`}>
                    {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] font-semibold leading-snug ${n.read ? 'text-slate-600' : 'text-slate-900'} truncate`}>
                            {n.title}
                        </p>
                        {!n.read && (
                            <span className={`flex-shrink-0 mt-0.5 w-2 h-2 rounded-full ${cfg.dot}`} />
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${cfg.badge}`}>
                            {cfg.label}
                        </span>
                        <span className="text-[10px] text-slate-400">{relativeTime(n.time)}</span>
                    </div>
                </div>
            </div>
        );

        const rowCls = `block px-4 py-3 border-b border-slate-50 last:border-0 transition-all duration-150 
            ${n.read ? 'bg-white hover:bg-slate-50/80' : 'bg-blue-50/60 hover:bg-blue-50'}`;

        const handleClick = () => {
            markSingleRead(n);
            setIsOpen(false);
        };

        if (n.link && n.link !== '#') {
            return (
                <Link key={n.id} to={n.link} onClick={handleClick} className={rowCls}>
                    {inner}
                </Link>
            );
        }
        return (
            <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
                className={`${rowCls} cursor-pointer`}
            >
                {inner}
            </div>
        );
    };

    /* ── Render ── */
    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                type="button"
                id="notif-bell-btn"
                onClick={() => { setIsOpen((o) => !o); if (!isOpen) fetchNotifications(); }}
                className={`
                    relative p-2 rounded-xl transition-all duration-200 focus:outline-none
                    focus-visible:ring-2 focus-visible:ring-brand-500/40
                    ${isOpen
                        ? 'bg-brand-50 text-brand-600 shadow-inner'
                        : 'text-slate-500 hover:text-brand-600 hover:bg-slate-100/80'}
                `}
                aria-label="Thông báo"
            >
                <BellIcon hasUnread={unreadCount > 0} />

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Panel */}
            {isOpen && (
                <div
                    id="notif-dropdown-panel"
                    className="absolute right-0 mt-2 w-[22rem] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14)] ring-1 ring-slate-900/8 z-[100] overflow-hidden"
                    style={{ animation: 'notifSlideIn 0.18s cubic-bezier(.22,.68,0,1.2) both' }}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">Thông báo</h3>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Mark all read */}
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    disabled={markingAll}
                                    title="Đánh dấu tất cả đã đọc"
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <CheckAllIcon />
                                    {markingAll ? 'Đang xử lý...' : 'Đọc tất cả'}
                                </button>
                            )}

                            {/* Refresh */}
                            <button
                                type="button"
                                onClick={fetchNotifications}
                                disabled={loading}
                                title="Làm mới"
                                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshIcon spinning={loading} />
                            </button>
                        </div>
                    </div>

                    {/* Gợi ý mã giảm / khuyến mãi (API công khai) */}
                    {bellCount > 0 && (
                        <div className="px-3 py-2.5 border-b border-amber-100/90 bg-gradient-to-r from-amber-50/95 to-orange-50/85">
                            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wide mb-1.5">
                                Mã giảm &amp; khuyến mãi
                            </p>
                            <div className="max-h-[9.5rem] overflow-y-auto space-y-1.5 pr-0.5">
                                {(bellOffers.platformDiscounts || []).map((d) => (
                                    <div
                                        key={`bell-pf-${d.code}`}
                                        className="flex items-start gap-2 rounded-lg bg-white/90 px-2 py-1.5 text-[11px] ring-1 ring-amber-200/70"
                                    >
                                        <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100/80 px-1 rounded shrink-0">
                                            Nền tảng
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <span className="font-mono font-bold text-slate-900">{d.code}</span>
                                            <span className="text-slate-600"> · {offerTeaserLabel(d)}</span>
                                            {d.ngayKetThuc && (
                                                <span className="text-slate-400"> · đến {d.ngayKetThuc}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(bellOffers.hotelPromotions || []).map((p) => (
                                    <Link
                                        key={`bell-hp-${p.code}-${p.hotelId}`}
                                        to={p.hotelId ? `/hotels/${p.hotelId}` : '#'}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-start gap-2 rounded-lg bg-white/90 px-2 py-1.5 text-[11px] ring-1 ring-orange-200/70 hover:bg-orange-50/80 transition-colors"
                                    >
                                        <span className="text-[10px] font-bold uppercase text-orange-900 bg-orange-100/80 px-1 rounded shrink-0">
                                            KS
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <span className="font-mono font-bold text-slate-900">{p.code}</span>
                                            <span className="text-slate-600"> · {offerTeaserLabel(p)}</span>
                                            {p.hotelName && (
                                                <span className="text-slate-500 block truncate">— {p.hotelName}</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <p className="text-[10px] text-amber-800/80 mt-1.5 leading-snug">
                                Nhập mã khi đặt phòng (trang chi tiết khách sạn). Một đơn một mã.
                            </p>
                        </div>
                    )}

                    {/* Notification list */}
                    <div className="max-h-[26rem] overflow-y-auto overscroll-contain">
                        {loading && notifications.length === 0 ? (
                            <div className="py-8 flex items-center justify-center gap-2 text-slate-400">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <span className="text-xs">Đang tải...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <EmptyState />
                        ) : (
                            notifications.map((n) => <NotifRow key={n.id} n={n} />)
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                            {notifications.length > 0
                                ? `${notifications.length} thông báo${unreadCount > 0 ? ` · ${unreadCount} chưa đọc` : ''}`
                                : 'Không có thông báo'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* Keyframe for slide-in animation */}
            <style>{`
                @keyframes notifSlideIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)     scale(1); }
                }
            `}</style>
        </div>
    );
};

export default NotificationDropdown;
