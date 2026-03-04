import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

// --- Icon Components ---
const Icon = ({ d, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    hotel: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    booking: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    revenue: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    checkin: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    menu: "M4 6h16M4 12h16M4 18h16",
    profile: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z",
    room: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    service: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
};

// --- Status Badge ---
const StatusBadge = ({ status }) => {
    const map = {
        'Pending':    { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
        'Confirmed':  { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Đã xác nhận'  },
        'CheckedIn':  { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Đang ở'        },
        'CheckedOut': { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Đã trả phòng'  },
        'Cancelled':  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Đã hủy'        },
    };
    const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    );
};

// --- Stat Card ---
const StatCard = ({ title, value, subtitle, icon, gradient }) => (
    <div className={`rounded-2xl p-6 text-white shadow-lg ${gradient} relative overflow-hidden`}>
        <div className="absolute right-4 top-4 opacity-20">
            <Icon d={icon} className="w-16 h-16" />
        </div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {subtitle && <p className="text-xs mt-2 opacity-70">{subtitle}</p>}
    </div>
);

// ========================================
// MAIN COMPONENT
// ========================================
const ManagerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [myHotel, setMyHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [services, setServices] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);

    // Modals
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [roomForm, setRoomForm] = useState({ ten: '', maPhong: '', giaTien: '', loaiPhongId: '', tang: '', soPhong: '', trangThai: 'Trống' });

    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({ ten: '', giaTien: '', donViTinh: 'Lần' });

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [serviceToAdd, setServiceToAdd] = useState({ dichVuId: '', soLuong: 1 });
    const [surchargeToAdd, setSurchargeToAdd] = useState({ loaiPhuThu: '', soTien: '' });

    // Filter states
    const [searchBooking, setSearchBooking] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [hotelForm, setHotelForm] = useState(null); // For settings tab
    const [savingHotel, setSavingHotel] = useState(false);

    // Fetch assigned hotel logic
    useEffect(() => {
        fetchMyHotel();
        fetchRoomTypes();
    }, []);

    const fetchMyHotel = async () => {
        try {
            const res = await axiosClient.get('/hotels/my-hotel');
            setMyHotel(res.data);
        } catch (err) {
            console.error('Không thể tải khách sạn của bạn', err);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const res = await axiosClient.get('/room-types');
            setRoomTypes(res.data);
        } catch (err) { }
    };

    useEffect(() => {
        if (!myHotel) return;
        if (activeTab === 'bookings' || activeTab === 'overview') fetchBookings();
        if (activeTab === 'rooms') fetchRooms();
        if (activeTab === 'services') fetchServices();
    }, [activeTab, myHotel]);

    const fetchBookings = async () => {
        if (!myHotel) return;
        setLoadingBookings(true);
        try {
            const res = await axiosClient.get(`/bookings/hotel/${myHotel.id}`);
            setBookings(res.data || []);
        } catch (err) {
            console.error('Loi tai bookings:', err);
            setBookings([]);
        } finally {
            setLoadingBookings(false);
        }
    };

    const fetchRooms = async () => {
        if (!myHotel) return;
        try {
            const res = await axiosClient.get(`/rooms/hotel/${myHotel.id}`);
            setRooms(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchServices = async () => {
        if (!myHotel) return;
        try {
            const res = await axiosClient.get(`/services/hotel/${myHotel.id}`);
            setServices(res.data || []);
        } catch (err) { console.error(err); }
    };

    // --- Rooms CRUD ---
    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await axiosClient.put(`/rooms/${editingRoom.id}`, roomForm);
                showToast('Cập nhật phòng thành công');
            } else {
                await axiosClient.post('/rooms', roomForm);
                showToast('Thêm phòng thành công');
            }
            setShowRoomModal(false);
            fetchRooms();
            fetchBookings(); // To update stats
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi lưu phòng!', 'error');
        }
    };

    const handleDeleteRoom = async (id) => {
        if (!window.confirm('Xóa phòng này?')) return;
        try {
            await axiosClient.delete(`/rooms/${id}`);
            showToast('Đã xóa phòng');
            fetchRooms();
            fetchBookings(); // To update stats
        } catch { showToast('Xóa thất bại!', 'error'); }
    };

    // --- Services CRUD ---
    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await axiosClient.put(`/services/${editingService.id}`, serviceForm);
                showToast('Cập nhật dịch vụ thành công');
            } else {
                await axiosClient.post('/services', serviceForm);
                showToast('Thêm dịch vụ thành công');
            }
            setShowServiceModal(false);
            fetchServices();
            fetchBookings(); // To update stats
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi lưu dịch vụ!', 'error');
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm('Xóa dịch vụ này?')) return;
        try {
            await axiosClient.delete(`/services/${id}`);
            showToast('Đã xóa dịch vụ');
            fetchServices();
            fetchBookings(); // To update stats
        } catch { showToast('Xóa thất bại!', 'error'); }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBookingDetails = async (id) => {
        try {
            const res = await axiosClient.get(`/bookings/id/${id}`);
            setSelectedBooking(res.data);
            setServiceToAdd({ dichVuId: services[0]?.id || '', soLuong: 1 });
            setSurchargeToAdd({ loaiPhuThu: '', soTien: '' });
        } catch (err) {
            showToast('Lỗi tải chi tiết đặt phòng', 'error');
        }
    };

    const handleBookingAction = async (action, id) => {
        setActionLoading(`${id}-${action}`);
        try {
            if (['confirm', 'checkin', 'no-show', 'complete'].includes(action)) {
                await axiosClient.put(`/bookings/${id}/${action}`);
            } else if (action === 'reject') {
                await axiosClient.put(`/bookings/${id}/reject`, { ghiChu: 'Quản lý từ chối' });
            } else if (action === 'checkout') {
                await axiosClient.post(`/bookings/${id}/checkout`, { phuongThuc: 'TienMat' });
            }
            showToast(`Cập nhật trạng thái thành công!`);
            fetchBookings();
            if (selectedBooking && selectedBooking.id === id) {
                fetchBookingDetails(id);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi xử lý. Vui lòng thử lại.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddServiceToBooking = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/services/add-to-booking', {
                phieuDatPhongId: selectedBooking.id,
                dichVuId: serviceToAdd.dichVuId,
                soLuong: serviceToAdd.soLuong
            });
            showToast('Thêm dịch vụ thành công');
            fetchBookingDetails(selectedBooking.id);
            fetchBookings(); // Reload background data just in case
            setServiceToAdd(prev => ({ ...prev, soLuong: 1 }));
        } catch (err) {
            showToast('Lỗi thêm dịch vụ', 'error');
        }
    };

    const handleAddSurchargeToBooking = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/surcharges/add', {
                phieuDatPhongId: selectedBooking.id,
                loaiPhuThu: surchargeToAdd.loaiPhuThu,
                soTien: surchargeToAdd.soTien
            });
            showToast('Thêm phụ thu thành công');
            fetchBookingDetails(selectedBooking.id);
            fetchBookings(); // Reload background data just in case
            setSurchargeToAdd({ loaiPhuThu: '', soTien: '' });
        } catch (err) {
            showToast('Lỗi thêm phụ thu', 'error');
        }
    };

    const filteredBookings = bookings.filter(b => {
        let match = true;
        if (searchBooking) {
            const term = searchBooking.toLowerCase();
            const maPhieu = (b.maDatPhong || '').toLowerCase();
            const hoTen = (b.hoTenKhach || '').toLowerCase();
            if (!maPhieu.includes(term) && !hoTen.includes(term)) match = false;
        }
        if (filterStatus && b.trangThai !== filterStatus) match = false;
        if (filterDate && b.ngayDen !== filterDate && b.ngayDi !== filterDate) match = false;
        return match;
    });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.trangThai === 'Pending').length,
        checkedIn: bookings.filter(b => b.trangThai === 'CheckedIn').length,
        confirmed: bookings.filter(b => b.trangThai === 'Confirmed').length,
        revenue: bookings
            .filter(b => ['CheckedOut', 'Completed'].includes(b.trangThai))
            .reduce((sum, b) => sum + Number(b.thanhTien || 0), 0),
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    // ---- SIDEBAR NAVIGATION ----
    const navItems = [
        { id: 'overview',  label: 'Tổng Quan',   icon: ICONS.hotel },
        { id: 'bookings',  label: 'Đặt Phòng',   icon: ICONS.booking },
        { id: 'rooms',     label: 'Phòng',        icon: ICONS.room },
        { id: 'services',  label: 'Dịch Vụ',    icon: ICONS.service },
        { id: 'settings',  label: 'Cài Đặt KS',  icon: ICONS.revenue },
        { id: 'profile',   label: 'Hồ Sơ',      icon: ICONS.profile },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">

            {/* ---- SIDEBAR ---- */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-emerald-800 to-emerald-900 text-white flex flex-col transition-all duration-300 shadow-xl z-20`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-emerald-700">
                    {sidebarOpen && (
                        <div>
                            <h1 className="font-bold text-lg leading-tight truncate px-1 max-w-[170px]" title={myHotel?.ten || 'Quản Lý KS'}>
                                {myHotel?.ten || 'Quản Lý KS'}
                            </h1>
                            <p className="text-xs text-emerald-300 truncate px-1">{user?.email}</p>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-emerald-700 transition-colors flex-shrink-0">
                        <Icon d={ICONS.menu} className="w-5 h-5" />
                    </button>
                </div>

                {/* User avatar */}
                {sidebarOpen && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-700/40">
                        <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-emerald-900 text-lg flex-shrink-0">
                            {user?.hoTen?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{user?.hoTen}</p>
                            <p className="text-xs text-emerald-300">Hotel Manager</p>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left
                                ${activeTab === item.id
                                    ? 'bg-white text-emerald-800 font-semibold shadow'
                                    : 'text-emerald-100 hover:bg-emerald-700/50'}`}
                        >
                            <Icon d={item.icon} className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-emerald-700">
                    <button
                        onClick={() => { logout(); window.location.href = '/login'; }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-200 hover:bg-red-600/80 hover:text-white transition-all text-sm"
                    >
                        <Icon d={ICONS.logout} className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Đăng Xuất</span>}
                    </button>
                </div>
            </aside>

            {/* ---- MAIN CONTENT ---- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:block">Xin chào,</span>
                        <span className="text-sm font-semibold text-emerald-700">{user?.hoTen}</span>
                    </div>
                </header>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* ======== OVERVIEW ======== */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Tổng Đặt Phòng"
                                    value={stats.total}
                                    subtitle="Tất cả thời gian"
                                    icon={ICONS.booking}
                                    gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                                />
                                <StatCard
                                    title="Chờ Xác Nhận"
                                    value={stats.pending}
                                    subtitle="Cần xử lý"
                                    icon={ICONS.checkin}
                                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                                />
                                <StatCard
                                    title="Đang Lưu Trú"
                                    value={stats.checkedIn}
                                    subtitle="Khách hiện tại"
                                    icon={ICONS.user}
                                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                                />
                                <StatCard
                                    title="Doanh Thu"
                                    value={formatCurrency(stats.revenue)}
                                    subtitle="Từ đặt phòng hoàn thành"
                                    icon={ICONS.revenue}
                                    gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
                                />
                            </div>

                            {/* Recent bookings preview */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-800">Đặt Phòng Gần Đây</h3>
                                    <button onClick={() => setActiveTab('bookings')} className="text-sm text-emerald-600 hover:underline font-medium">Xem tất cả →</button>
                                </div>
                                {loadingBookings ? (
                                    <div className="py-12 flex justify-center">
                                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="py-12 text-center text-gray-400">
                                        <Icon d={ICONS.booking} className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Chưa có đặt phòng nào</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {bookings.slice(0, 5).map(b => (
                                            <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">{b.maDatPhong || `#${b.id}`}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{b.hoTenKhach || '—'}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(b.ngayDen)} → {formatDate(b.ngayDi)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <StatusBadge status={b.trangThai} />
                                                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(Number(b.thanhTien) || 0)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick stats row */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Đã Xác Nhận', value: stats.confirmed, color: 'text-blue-600' },
                                    { label: 'Đang Lưu Trú', value: stats.checkedIn, color: 'text-green-600' },
                                    { label: 'Chờ Xử Lý', value: stats.pending, color: 'text-amber-600' },
                                ].map(item => (
                                    <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                                        <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ======== BOOKINGS ======== */}
                    {activeTab === 'bookings' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">Danh Sách Đặt Phòng ({filteredBookings.length}/{bookings.length})</h3>
                                <button onClick={fetchBookings} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    ↻ Làm mới
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Tìm Khách / Mã</label>
                                    <input value={searchBooking} onChange={e => setSearchBooking(e.target.value)} placeholder="Tên khách, Mã phiếu..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50" />
                                </div>
                                <div className="w-40">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Trạng Thái</label>
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50">
                                        <option value="">Tất cả</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="CheckedIn">CheckedIn</option>
                                        <option value="CheckedOut">CheckedOut</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div className="w-48">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Ngày Đến / Trả</label>
                                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50" />
                                </div>
                                <div className="flex items-end">
                                    <button onClick={() => {setSearchBooking(''); setFilterStatus(''); setFilterDate('');}} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors h-[38px]">Xóa Lọc</button>
                                </div>
                            </div>

                            {loadingBookings ? (
                                <div className="py-20 flex justify-center">
                                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
                                    <Icon d={ICONS.booking} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 font-medium">Không tìm thấy đặt phòng nào</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã Phiếu</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Khách</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nhận Phòng</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trả Phòng</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng Tiền</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng Thái</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hành Động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredBookings.map(b => (
                                                    <tr key={b.id} className="hover:bg-emerald-50/30 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                                {b.maDatPhong || `#${b.id}`}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-medium text-gray-800">{b.hoTenKhach || '—'}</p>
                                                            <p className="text-xs text-gray-400">{b.emailKhach || ''}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">{formatDate(b.ngayDen)}</td>
                                                        <td className="px-4 py-3 text-gray-600">{formatDate(b.ngayDi)}</td>
                                                        <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(Number(b.thanhTien) || 0)}</td>
                                                        <td className="px-4 py-3"><StatusBadge status={b.trangThai} /></td>
                                                        <td className="px-4 py-3">
                                                            <button onClick={() => fetchBookingDetails(b.id)} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition">
                                                                Chi Tiết
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======== ROOMS ======== */}
                    {activeTab === 'rooms' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">Danh Sách Phòng ({rooms.length})</h3>
                                <button
                                    onClick={() => { setEditingRoom(null); setRoomForm({ ten: '', maPhong: '', giaTien: '', loaiPhongId: roomTypes[0]?.id || '', tang: '', soPhong: '', trangThai: 'Trống' }); setShowRoomModal(true); }}
                                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
                                    ＋ Thêm Phòng
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-semibold text-gray-500">
                                            <th className="px-4 py-3">Phòng</th>
                                            <th className="px-4 py-3">Loại</th>
                                            <th className="px-4 py-3">Giá Tiền</th>
                                            <th className="px-4 py-3">Trạng Thái</th>
                                            <th className="px-4 py-3 text-right">Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {rooms.map(r => (
                                            <tr key={r.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {r.ten} {r.soPhong ? `(${r.soPhong})` : ''}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {roomTypes.find(t => t.id === r.loaiPhong?.id || t.id === r.loaiPhongId)?.ten || r.loaiPhong?.ten}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{formatCurrency(r.giaTien || 0)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${r.trangThai === 'Trống' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {r.trangThai || 'Trống'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => { setEditingRoom(r); setRoomForm({ ten: r.ten, maPhong: r.maPhong, giaTien: r.giaTien, loaiPhongId: r.loaiPhong?.id || r.loaiPhongId, tang: r.tang || '', soPhong: r.soPhong || '', trangThai: r.trangThai || 'Trống' }); setShowRoomModal(true); }} className="text-blue-600 hover:text-blue-800 mr-3 text-xs font-semibold tracking-wide">SỬA</button>
                                                    <button onClick={() => handleDeleteRoom(r.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold tracking-wide">XÓA</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {rooms.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-gray-400">Khách sạn chưa cấu hình phòng</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ======== SERVICES ======== */}
                    {activeTab === 'services' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">Dịch Vụ Bổ Sung ({services.length})</h3>
                                <button
                                    onClick={() => { setEditingService(null); setServiceForm({ ten: '', giaTien: '', donViTinh: 'Lần' }); setShowServiceModal(true); }}
                                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
                                    ＋ Thêm Dịch Vụ
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-semibold text-gray-500">
                                            <th className="px-4 py-3">Tên Dịch Vụ</th>
                                            <th className="px-4 py-3">Đơn Vị Tính</th>
                                            <th className="px-4 py-3">Giá Tiền</th>
                                            <th className="px-4 py-3 text-right">Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {services.map(s => (
                                            <tr key={s.id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 font-medium text-gray-800">{s.ten}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.donViTinh || 'Đơn vị'}</td>
                                                <td className="px-4 py-3 text-gray-600">{formatCurrency(s.giaTien || 0)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => { setEditingService(s); setServiceForm({ ten: s.ten, giaTien: s.giaTien, donViTinh: s.donViTinh || '' }); setShowServiceModal(true); }} className="text-blue-600 hover:text-blue-800 mr-3 text-xs font-semibold tracking-wide">SỬA</button>
                                                    <button onClick={() => handleDeleteService(s.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold tracking-wide">XÓA</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {services.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-gray-400">Chưa có dịch vụ nào cung cấp</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ======== SETTINGS ======== */}
                    {activeTab === 'settings' && (() => {
                        const form = hotelForm || myHotel || {};
                        const handleChange = (field, val) => setHotelForm(prev => ({ ...(prev || myHotel || {}), [field]: val }));
                        const handleSave = async (e) => {
                            e.preventDefault();
                            setSavingHotel(true);
                            try {
                                await axiosClient.put(`/hotels/${myHotel.id}/settings`, form);
                                setMyHotel({ ...myHotel, ...form });
                                setHotelForm(null);
                                showToast('Đã lưu cài đặt khách sạn!');
                            } catch (err) {
                                showToast(err.response?.data?.message || 'Lỗi lưu cài đặt!', 'error');
                            } finally {
                                setSavingHotel(false);
                            }
                        };
                        return (
                            <div className="max-w-xl space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
                                        <h3 className="font-bold text-lg">⚙️ Cài Đặt Khách Sạn</h3>
                                        <p className="text-emerald-100 text-sm">{myHotel?.ten}</p>
                                    </div>
                                    <form onSubmit={handleSave} className="p-6 space-y-5">
                                        {/* Deposit rate */}
                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                            <label className="block text-sm font-bold text-orange-800 mb-1">💰 Tỷ lệ tiền cọc (%)</label>
                                            <p className="text-xs text-gray-500 mb-3">Khách phải cọc trước khi nhận phòng với mọi hình thức thanh toán.</p>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min="0" max="100" step="5"
                                                    value={form.tiLeCoc ?? 30}
                                                    onChange={e => handleChange('tiLeCoc', e.target.value)}
                                                    className="w-28 border border-orange-200 rounded-lg px-3 py-2 text-lg font-bold text-center focus:ring-2 focus:ring-orange-400 outline-none"
                                                />
                                                <span className="text-2xl font-bold text-orange-600">%</span>
                                                <span className="text-xs text-gray-500">của tổng tiền phòng</span>
                                            </div>
                                            <p className="text-xs text-orange-600 mt-2 font-medium">
                                                Ví dụ: Phòng 1.200.000đ/đêm × 2 đêm = 2.400.000đ → Tiền cọc: {Math.round(2400000 * (form.tiLeCoc ?? 30) / 100).toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>

                                        {/* Check-in / Check-out times */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600 block mb-1">Giờ nhận phòng</label>
                                                <input type="time" value={form.gioNhanPhong || '14:00'} onChange={e => handleChange('gioNhanPhong', e.target.value)}
                                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600 block mb-1">Giờ trả phòng</label>
                                                <input type="time" value={form.gioTraPhong || '12:00'} onChange={e => handleChange('gioTraPhong', e.target.value)}
                                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button type="submit" disabled={savingHotel}
                                                className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition">
                                                {savingHotel ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        );
                    })()}

                    {/* ======== PROFILE ======== */}
                    {activeTab === 'profile' && (

                        <div className="max-w-lg">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Profile header */}
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold mx-auto mb-3 ring-4 ring-white/30">
                                        {user?.hoTen?.charAt(0)?.toUpperCase() || 'M'}
                                    </div>
                                    <h3 className="text-xl font-bold">{user?.hoTen}</h3>
                                    <p className="text-emerald-100 text-sm mt-1">Hotel Manager</p>
                                </div>

                                {/* Profile info */}
                                <div className="p-6 space-y-4">
                                    {[
                                        { label: 'Email', value: user?.email, icon: '📧' },
                                        { label: 'Vai trò', value: user?.role, icon: '🏷️' },
                                        { label: 'ID Tài khoản', value: `#${user?.userId}`, icon: '🆔' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <span className="text-xl">{item.icon}</span>
                                            <div>
                                                <p className="text-xs text-gray-400">{item.label}</p>
                                                <p className="font-medium text-gray-800">{item.value || '—'}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <a
                                        href="/user/profile"
                                        className="block w-full text-center mt-4 py-2.5 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                                    >
                                        Chỉnh Sửa Hồ Sơ
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* ---- MODALS ---- */}
            {/* Room Modal */}
            {showRoomModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleRoomSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg">{editingRoom ? 'Sửa Phòng' : 'Thêm Phòng'}</h2>
                            <button type="button" onClick={() => setShowRoomModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-600">Tên Phòng *</label>
                                    <input required value={roomForm.ten} onChange={e => setRoomForm({...roomForm, ten: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600">Số/Mã Phòng *</label>
                                    <input required value={roomForm.maPhong} onChange={e => setRoomForm({...roomForm, maPhong: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600">Giá Tiền *</label>
                                    <input required type="number" value={roomForm.giaTien} onChange={e => setRoomForm({...roomForm, giaTien: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-600">Loại Phòng *</label>
                                    <select required value={roomForm.loaiPhongId} onChange={e => setRoomForm({...roomForm, loaiPhongId: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                                        <option value="" disabled>-- Chọn loại --</option>
                                        {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.ten}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                            <button type="button" onClick={() => setShowRoomModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Lưu</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Service Modal */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleServiceSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg">{editingService ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ'}</h2>
                            <button type="button" onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-600">Tên Dịch Vụ *</label>
                                <input required value={serviceForm.ten} onChange={e => setServiceForm({...serviceForm, ten: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600">Giá Tiền *</label>
                                <input required type="number" value={serviceForm.giaTien} onChange={e => setServiceForm({...serviceForm, giaTien: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600">Đơn Vị Tính</label>
                                <input value={serviceForm.donViTinh} onChange={e => setServiceForm({...serviceForm, donViTinh: e.target.value})} placeholder="Lần, Giờ, Bữa..." className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                            <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Lưu</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">Chi Tiết Đặt Phòng <span className="text-emerald-600 font-mono ml-2">#{selectedBooking.maDatPhong || selectedBooking.id}</span></h2>
                                <p className="text-xs text-gray-500 mt-1">Trạng thái: <StatusBadge status={selectedBooking.trangThai} /></p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Thong tin khach & phong */}
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Thông Tin Khách</h4>
                                        <p className="text-sm"><span className="text-gray-500 inline-block w-20">Khách:</span> <span className="font-semibold text-gray-800">{selectedBooking.hoTenKhach || selectedBooking.nguoiDung?.hoTen || 'N/A'}</span></p>
                                        <p className="text-sm mt-1"><span className="text-gray-500 inline-block w-20">Email:</span> {selectedBooking.emailKhach || selectedBooking.nguoiDung?.email || 'N/A'}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500 inline-block w-20">Số đT:</span> {selectedBooking.nguoiDung?.soDienThoai || <span className="italic text-gray-300">Chưa cập nhật</span>}</p>
                                        {selectedBooking.ghiChuKhach && (
                                            <p className="text-sm mt-2 p-2 bg-yellow-50 rounded-lg text-yellow-800 border border-yellow-100">
                                                <span className="font-semibold">Ghi chú:</span> {selectedBooking.ghiChuKhach}
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Thông Tin Phòng</h4>
                                        <p className="text-sm"><span className="text-gray-500 inline-block w-20">Phòng:</span> <span className="font-semibold text-gray-800">{selectedBooking.tenPhong || selectedBooking.phong?.ten} ({selectedBooking.soPhong || selectedBooking.phong?.soPhong})</span></p>
                                        <p className="text-sm mt-1"><span className="text-gray-500 inline-block w-20">Loại:</span> {selectedBooking.loaiPhong || selectedBooking.phong?.loaiPhong?.ten}</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500 inline-block w-20">Giá gốc:</span> {formatCurrency(selectedBooking.giaPhongGoc)} / đêm</p>
                                        <p className="text-sm mt-1"><span className="text-gray-500 inline-block w-20">TT thanh toán:</span> <span className="font-medium text-blue-700">{selectedBooking.phuongThucThanhToan || 'Tiền mặt'}</span></p>
                                        <div className="flex gap-4 mt-3 bg-gray-50 p-2 rounded-lg text-center">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 font-semibold">Ngày Đến</p>
                                                <p className="text-sm font-bold text-emerald-700">{formatDate(selectedBooking.ngayDen)}</p>
                                            </div>
                                            <div className="flex-1 border-l border-gray-200">
                                                <p className="text-xs text-gray-400 font-semibold">Ngày Đi</p>
                                                <p className="text-sm font-bold text-blue-700">{formatDate(selectedBooking.ngayDi)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chi tiet gia & Dịch vụ */}
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Hóa Đơn</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tiền phòng:</span>
                                                <span className="font-medium text-gray-800">{formatCurrency(selectedBooking.giaPhongGoc)} x {selectedBooking.soNgay || '?'} đêm</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tổng:</span>
                                                <span className="font-medium text-gray-800">{formatCurrency(selectedBooking.thanhTien)}</span>
                                            </div>
                                            {Number(selectedBooking.tienCoc) > 0 && (
                                                <div className="flex justify-between items-center bg-orange-50 p-2 rounded-lg border border-orange-100">
                                                    <span className="text-orange-700 font-semibold">💰 Tiền cọ:</span>
                                                    <div className="text-right">
                                                        <span className="font-bold text-orange-600">{formatCurrency(selectedBooking.tienCoc)}</span>
                                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                            selectedBooking.trangThaiCoc === 'DaCoc'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>{selectedBooking.trangThaiCoc === 'DaCoc' ? '✓ Đã cọ' : '⏳ Chưa cọ'}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">TT thanh toán:</span>
                                                <span className="font-medium text-orange-600">{selectedBooking.trangThaiThanhToan}</span>
                                            </div>
                                        </div>

                                        {(selectedBooking.chiTietDichVus?.length > 0 || selectedBooking.phuThus?.length > 0) && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                                                {selectedBooking.chiTietDichVus?.map((dv, i) => (
                                                    <div key={`dv-${i}`} className="flex justify-between text-gray-600">
                                                        <span>{dv.dichVu?.ten} (x{dv.soLuong})</span>
                                                        <span>{formatCurrency((dv.donGiaLucDat || 0) * (dv.soLuong || 1))}</span>
                                                    </div>
                                                ))}
                                                {selectedBooking.phuThus?.map((pt, i) => (
                                                    <div key={`pt-${i}`} className="flex justify-between text-gray-600">
                                                        <span>Phụ thu: {pt.loaiPhuThu}</span>
                                                        <span>{formatCurrency(pt.soTien || 0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center">
                                            <span className="font-bold text-gray-700">TỔNG CỘNG:</span>
                                            <span className="text-lg font-black text-emerald-600">{formatCurrency(selectedBooking.thanhTien)}</span>
                                        </div>
                                    </div>
                                    
                                    {selectedBooking.trangThai === 'CheckedIn' && (
                                        <div className="space-y-3">
                                            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm bg-emerald-50/30">
                                                <h4 className="text-sm font-bold text-emerald-800 mb-3 border-b border-emerald-100 pb-2">➕ Thêm Dịch Vụ</h4>
                                                <form onSubmit={handleAddServiceToBooking} className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold text-gray-600">Dịch vụ</label>
                                                        <select required value={serviceToAdd.dichVuId} onChange={e => setServiceToAdd({...serviceToAdd, dichVuId: e.target.value})} className="mt-1 w-full border border-emerald-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-emerald-500 bg-white">
                                                            <option value="" disabled>-- Chọn --</option>
                                                            {services.map(s => <option key={s.id} value={s.id}>{s.ten} - {formatCurrency(s.giaTien)}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="text-xs font-semibold text-gray-600">SL</label>
                                                        <input required type="number" min="1" value={serviceToAdd.soLuong} onChange={e => setServiceToAdd({...serviceToAdd, soLuong: e.target.value})} className="mt-1 w-full border border-emerald-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-emerald-500 text-center" />
                                                    </div>
                                                    <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 h-[34px] shadow-sm">+</button>
                                                </form>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm bg-amber-50/30">
                                                <h4 className="text-sm font-bold text-amber-800 mb-3 border-b border-amber-100 pb-2">⚠️ Thêm Phụ Thu</h4>
                                                <form onSubmit={handleAddSurchargeToBooking} className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold text-gray-600">Lý do phụ thu</label>
                                                        <input required value={surchargeToAdd.loaiPhuThu} onChange={e => setSurchargeToAdd({...surchargeToAdd, loaiPhuThu: e.target.value})} placeholder="Làm hỏng đồ, check out muộn..." className="mt-1 w-full border border-amber-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-amber-500 bg-white" />
                                                    </div>
                                                    <div className="w-32">
                                                        <label className="text-xs font-semibold text-gray-600">Số tiền</label>
                                                        <input required type="number" min="0" value={surchargeToAdd.soTien} onChange={e => setSurchargeToAdd({...surchargeToAdd, soTien: e.target.value})} className="mt-1 w-full border border-amber-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-amber-500" />
                                                    </div>
                                                    <button type="submit" className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 h-[34px] shadow-sm">+</button>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="px-6 py-4 bg-white border-t flex flex-wrap gap-3 justify-end items-center">
                            {selectedBooking.trangThai === 'Pending' && (
                                <>
                                    <button onClick={() => handleBookingAction('reject', selectedBooking.id)} disabled={actionLoading} className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold rounded-lg transition-colors">Từ chối (Reject)</button>
                                    <button onClick={() => handleBookingAction('confirm', selectedBooking.id)} disabled={actionLoading} className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">Xác nhận (Confirm)</button>
                                </>
                            )}
                            {selectedBooking.trangThai === 'Confirmed' && (
                                <>
                                    <button onClick={() => handleBookingAction('no-show', selectedBooking.id)} disabled={actionLoading} className="px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 text-sm font-semibold rounded-lg transition-colors">Khách không đến (No-Show)</button>
                                    <button onClick={() => handleBookingAction('checkin', selectedBooking.id)} disabled={actionLoading} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Nhận phòng (Check-in)</button>
                                </>
                            )}
                            {selectedBooking.trangThai === 'CheckedIn' && (
                                <button onClick={() => handleBookingAction('checkout', selectedBooking.id)} disabled={actionLoading} className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors w-full sm:w-auto">Thanh toán & Trả phòng (Check-out)</button>
                            )}
                            {selectedBooking.trangThai === 'CheckedOut' && (
                                <button onClick={() => handleBookingAction('complete', selectedBooking.id)} disabled={actionLoading} className="px-5 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 shadow-sm transition-colors">Hoàn tất (Complete)</button>
                            )}
                            {['Cancelled', 'Rejected', 'Expired', 'NoShow', 'Completed'].includes(selectedBooking.trangThai) && (
                                <span className="text-sm font-semibold text-gray-400 italic">Đơn đã đóng, không thể thực hiện thêm hành động.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ---- TOAST NOTIFICATION ---- */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all
                    ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
                    {toast.type === 'error' ? '❌ ' : '✅ '}{toast.message}
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
