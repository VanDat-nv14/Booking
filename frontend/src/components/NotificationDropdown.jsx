import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { IconGift, IconAlert, IconMegaphone, IconDocument, IconInfo } from './icons/UiIcons';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const { user } = useAuth();
    const userRole = user?.role || localStorage.getItem('role');
    const isAdminRole = (r) => r === 'Admin' || r === 'ADMIN';
    const isManagerOrUserRole = (r) =>
        r === 'HotelManager' || r === 'HOTEL_MANAGER' || r === 'User' || r === 'USER';

    const fetchNotifications = useCallback(async () => {
        if (!userRole) return;
        setLoading(true);
        try {
            if (isAdminRole(userRole)) {
                const res = await axiosClient.get('/promotions', { params: { trangThai: 'PENDING_APPROVAL' } });
                const promos = (res.data || []).map((p) => ({
                    id: p.id,
                    title: 'Yêu cầu duyệt khuyến mãi',
                    description: `${p.ten} (KS #${p.khachSanId || 'Hệ thống'})`,
                    time: p.createdAt,
                    type: 'PROMO_APPROVAL',
                    link: '/admin/dashboard?tab=promotions',
                    read: false,
                }));

                const resReports = await axiosClient.get('/guest-reports');
                const reports = (resReports.data || [])
                    .filter((r) => r.trangThai === 'PENDING')
                    .map((r) => ({
                        id: r.id,
                        title: 'Báo cáo sự cố mới',
                        description: [r.loaiVanDe, r.khachSanTen || r.bookingCode, r.moTa]
                            .filter(Boolean)
                            .join(' — ')
                            .slice(0, 120),
                        time: r.createdAt,
                        type: 'GUEST_REPORT',
                        link: '/admin/dashboard?tab=guestReports',
                        read: false,
                    }));

                setNotifications(
                    [...promos, ...reports].sort((a, b) => new Date(b.time) - new Date(a.time))
                );
            } else if (isManagerOrUserRole(userRole)) {
                const res = await axiosClient.get('/system-notifications');
                const sysNotifs = (res.data || [])
                    .filter((n) => n.trangThai === 'SENT')
                    .map((n) => ({
                        id: n.id,
                        title: n.tieuDe,
                        description: n.noiDung,
                        time: n.createdAt,
                        type: 'SYSTEM',
                        link: '#',
                        read: n.read === true || n.read === 'true',
                    }));
                setNotifications(sysNotifs.sort((a, b) => new Date(b.time) - new Date(a.time)));
            }
        } catch (err) {
            console.error('Lỗi tải thông báo:', err);
        } finally {
            setLoading(false);
        }
    }, [userRole]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 120000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markSystemRead = async (n) => {
        if (n.type !== 'SYSTEM' || n.read) return;
        try {
            await axiosClient.put(`/system-notifications/${encodeURIComponent(n.id)}/read`);
            setNotifications((prev) =>
                prev.map((x) => (x.id === n.id && x.type === 'SYSTEM' ? { ...x, read: true } : x))
            );
        } catch (err) {
            console.error('Không đánh dấu đã đọc:', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-card ring-1 ring-slate-200/80 z-[100] overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/90">
                        <h3 className="text-sm font-semibold text-slate-900">Thông báo</h3>
                        <button type="button" onClick={fetchNotifications} className="text-brand-600 hover:text-brand-800 p-1 rounded-lg hover:bg-white/80">
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-xs">Không có thông báo mới</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const typeIcon =
                                    n.type === 'PROMO_APPROVAL' ? (
                                        <IconGift className="w-4 h-4" />
                                    ) : n.type === 'GUEST_REPORT' || n.type === 'ALERT' ? (
                                        <IconAlert className="w-4 h-4" />
                                    ) : n.type === 'SYSTEM' ? (
                                        <IconMegaphone className="w-4 h-4" />
                                    ) : n.type === 'POLICY' ? (
                                        <IconDocument className="w-4 h-4" />
                                    ) : (
                                        <IconInfo className="w-4 h-4" />
                                    );
                                const inner = (
                                    <div className="flex gap-3">
                                        <div
                                            className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                n.type === 'PROMO_APPROVAL'
                                                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                                                    : n.type === 'GUEST_REPORT' || n.type === 'ALERT'
                                                      ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                                                      : n.type === 'SYSTEM'
                                                        ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                                                        : n.type === 'POLICY'
                                                          ? 'bg-orange-50 text-orange-800 ring-1 ring-orange-100'
                                                          : 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                                            }`}
                                        >
                                            {typeIcon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{n.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.description}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(n.time).toLocaleString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                                const unread = !n.read;
                                const rowBg = unread ? 'bg-blue-50/90' : 'bg-white';
                                const cls = `block px-4 py-3 border-b border-gray-50 transition-colors last:border-0 ${rowBg} ${unread ? '' : 'opacity-90'}`;

                                if (n.link === '#') {
                                    return (
                                        <div
                                            key={`${n.type}-${n.id}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => {
                                                markSystemRead(n);
                                                setIsOpen(false);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    markSystemRead(n);
                                                    setIsOpen(false);
                                                }
                                            }}
                                            className={`${cls} cursor-pointer hover:bg-blue-100/80`}
                                        >
                                            {inner}
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={`${n.type}-${n.id}`}
                                        to={n.link}
                                        onClick={() => setIsOpen(false)}
                                        className={`${cls} hover:bg-blue-50`}
                                    >
                                        {inner}
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    <div className="p-2 border-t border-slate-100 bg-slate-50/80">
                        <button
                            type="button"
                            className="w-full py-2 text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
