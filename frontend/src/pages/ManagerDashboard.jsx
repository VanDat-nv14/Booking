import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

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
    star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    promotion: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
};

// --- Status Badge ---
const StatusBadge = ({ status }) => {
    const map = {
        'Pending':    { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
        'Confirmed':  { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Đã xác nhận'  },
        'CheckedIn':  { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Đang lưu trú' },
        'CheckedOut': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Đã thanh toán' },
        'Completed':  { bg: 'bg-emerald-100',text: 'text-emerald-700',label: 'Hoàn thành'   },
        'Cancelled':  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Đã hủy'       },
        'Rejected':   { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Từ chối'      },
        'Expired':    { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Hết hạn'      },
        'NoShow':     { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Không đến'    },
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
// HOTEL IMAGE ADDER COMPONENT
// ========================================
const HotelImageAdder = ({ hotelId, onAdded }) => {
    const [tab, setTab] = useState('file');
    const [urlInput, setUrlInput] = useState('');
    const [filesPos, setFilesPos] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setFilesPos(selectedFiles);
            setPreviews(selectedFiles.map(file => URL.createObjectURL(file)));
        }
    };

    const handleUpload = async () => {
        if (tab === 'url') {
            if (!urlInput.trim()) return;
            onAdded([urlInput.trim()]);
            setUrlInput('');
            return;
        }

        if (filesPos.length === 0 || !hotelId) return;
        const formData = new FormData();
        filesPos.forEach(file => formData.append('files', file));
        setUploading(true);
        try {
            const res = await axiosClient.post(`/hotels/${hotelId}/images/upload`, formData, {
                headers: {
                    'Content-Type': undefined
                }
            });
            if (res.data && res.data.urls) {
                onAdded(res.data.urls);
                setFilesPos([]);
                setPreviews([]);
                const fileInput = document.getElementById('hotelFileInput');
                if (fileInput) fileInput.value = '';
            }
        } catch (err) {
            alert('Lỗi upload: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            <div className="flex gap-4 mb-4 border-b border-gray-200">
                <button onClick={() => setTab('file')} type="button" className={`pb-2 px-1 font-semibold text-sm border-b-2 ${tab === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Tải ảnh lên</button>
                <button onClick={() => setTab('url')} type="button" className={`pb-2 px-1 font-semibold text-sm border-b-2 ${tab === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Nhập URL</button>
            </div>
            {tab === 'file' ? (
                <div className="space-y-3">
                    <input type="file" id="hotelFileInput" accept="image/*" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 outline-none" />
                    {previews.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {previews.map((src, i) => (
                                <img key={i} src={src} alt="preview" className="h-16 w-auto rounded object-cover shadow-sm bg-gray-200"
                                    onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/e2e8f0/94a3b8?text=Image+Error'; }} />
                            ))}
                        </div>
                    )}
                    <button type="button" onClick={handleUpload} disabled={uploading || filesPos.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                        {uploading ? 'Đang tải lên...' : `+ Thêm ${filesPos.length > 0 ? filesPos.length : ''} Ảnh`}
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input type="url" placeholder="Dán URL hình ảnh..." value={urlInput} onChange={e => setUrlInput(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                    <button type="button" onClick={handleUpload} disabled={!urlInput.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                        + Thêm URL
                    </button>
                </div>
            )}
        </div>
    );
};

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
    const [hotelReviews, setHotelReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [replyText, setReplyText] = useState({});
    const [isReplying, setIsReplying] = useState(null);

    // Modals
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [roomForm, setRoomForm] = useState({ ten: '', maPhong: '', giaTien: '', loaiPhongId: '', tang: '', soPhong: '', trangThai: 'Trống' });

    const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState(null);
    const [roomTypeAmenities, setRoomTypeAmenities] = useState([]);
    const [roomTypeAmenityInput, setRoomTypeAmenityInput] = useState('');
    const [savingRoomType, setSavingRoomType] = useState(false);

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
    const [hotelForm, setHotelForm] = useState(null);
    const [savingHotel, setSavingHotel] = useState(false);

    // Checkout modal
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ phuongThuc: 'TienMat' });
    // Invoice
    const [invoice, setInvoice] = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    // Booking tab filter
    const [bookingTabFilter, setBookingTabFilter] = useState('all');

    // Revenue states
    const [revenueData, setRevenueData] = useState(null);
    const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
    const [loadingRevenue, setLoadingRevenue] = useState(false);

    // Promotion codes (mã coupon của khách sạn)
    const [promoCodes, setPromoCodes] = useState([]);
    const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);
    const [showPromoCodeForm, setShowPromoCodeForm] = useState(false);
    const [editingPromoCode, setEditingPromoCode] = useState(null);
    const [promoCodeForm, setPromoCodeForm] = useState({ code: '', ten: '', moTa: '', loai: 'PERCENT', giaTri: '', giamToiDa: '', donHangToiThieu: '', soDemToiThieu: '', soLanSuDungToiDa: '', soLanToiDaMoiUser: '', ngayBatDau: '', ngayKetThuc: '' });
    const [discountFramework, setDiscountFramework] = useState(null);

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

    const fetchHotelReviews = async (silent = false) => {
        if (!myHotel) return;
        if (!silent) setLoadingReviews(true);
        try {
            const res = await axiosClient.get(`/reviews/manager/hotel/${myHotel.id}`);
            setHotelReviews(res.data || []);
        } catch (err) {
            console.error('Lỗi tải đánh giá:', err);
        } finally {
            if (!silent) setLoadingReviews(false);
        }
    };

    const handleReplySubmit = async (reviewId) => {
        const text = replyText[reviewId];
        if (!text || !text.trim()) return;
        setIsReplying(reviewId);
        try {
            await axiosClient.put(`/reviews/${reviewId}/reply`, { phanHoi: text });
            showToast('Đã gửi phản hồi thành công!');
            setReplyText(prev => ({ ...prev, [reviewId]: '' }));
            fetchHotelReviews(true);
        } catch (err) {
            showToast('Lỗi gửi phản hồi', 'error');
        } finally {
            setIsReplying(null);
        }
    };

    /* Luôn tải phòng + dịch vụ khi đã có khách sạn — không gắn vào tab.
       Trước đây chỉ fetch khi vào tab Phòng/Dịch vụ → lần đầu vào Đặt phòng, services/rooms rỗng,
       chi tiết đặt phòng / thanh toán / thêm dịch vụ dễ lỗi hoặc thiếu dữ liệu cho đến khi đổi tab. */
    useEffect(() => {
        if (!myHotel) return;
        fetchRooms(true);
        fetchServices(true);
    }, [myHotel]);

    useEffect(() => {
        if (!myHotel) return;
        const silentBookings = (activeTab === 'bookings' || activeTab === 'overview') && bookings.length > 0;
        const silentRooms = activeTab === 'rooms' && rooms.length > 0;
        const silentServices = activeTab === 'services' && services.length > 0;
        if (activeTab === 'bookings' || activeTab === 'overview') fetchBookings(silentBookings);
        if (activeTab === 'rooms') fetchRooms(silentRooms);
        if (activeTab === 'services') fetchServices(silentServices);
        if (activeTab === 'revenue') fetchRevenue();
        if (activeTab === 'reviews') fetchHotelReviews();
        if (activeTab === 'promotions') { fetchPromoCodes(); }
    }, [activeTab, myHotel, revenueYear]);

    const fetchPromoCodes = async () => {
        setLoadingPromoCodes(true);
        try {
            const [rCodes, rFw] = await Promise.all([
                axiosClient.get('/promotion-codes'),
                axiosClient.get('/discount-framework'),
            ]);
            setPromoCodes(rCodes.data || []);
            setDiscountFramework(rFw.data || null);
        }
        catch(e) { console.error('Lỗi tải mã coupon:', e); }
        finally { setLoadingPromoCodes(false); }
    };

    const fetchRevenue = async () => {
        if (!myHotel) return;
        setLoadingRevenue(true);
        try {
            const res = await axiosClient.get(`/bookings/hotel/${myHotel.id}/revenue?year=${revenueYear}`);
            setRevenueData(res.data);
        } catch (err) {
            console.error('Lỗi tải doanh thu:', err);
            setToast({ message: 'Không tải được dữ liệu doanh thu', type: 'error' });
        } finally {
            setLoadingRevenue(false);
        }
    };

    const handleExportExcel = () => {
        if (!revenueData || !myHotel) return;
        try {
            const wsOverview = XLSX.utils.json_to_sheet([{
                'Khách Sạn': myHotel.ten,
                'Năm Báo Cáo': revenueYear,
                'Tổng Doanh Thu (VNĐ)': revenueData.totalRevenue
            }]);

            const wsMonthly = XLSX.utils.json_to_sheet(
                revenueData.monthlyStats.map(m => ({
                    'Tháng': m.month,
                    'Tiền Phòng (VNĐ)': m.roomRevenue,
                    'Tiền Dịch Vụ (VNĐ)': m.serviceRevenue,
                    'Tiền Phụ Thu (VNĐ)': m.surchargeRevenue,
                    'Tổng Cộng (VNĐ)': m.totalRevenue
                }))
            );

            const wsSurcharges = XLSX.utils.json_to_sheet(
                revenueData.surcharges.map(s => ({
                    'Mã Đặt Phòng': s.maDatPhong,
                    'Loại Phụ Thu': s.loaiPhuThu,
                    'Số Tiền (VNĐ)': s.soTien,
                    'Ngày Thu': new Date(s.ngayThu).toLocaleString('vi-VN')
                }))
            );

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsOverview, "Tổng Quan");
            XLSX.utils.book_append_sheet(wb, wsMonthly, "Doanh Thu Tháng");
            XLSX.utils.book_append_sheet(wb, wsSurcharges, "Chi Tiết Phụ Thu");
            XLSX.writeFile(wb, `BaoCaoDoanhThu_${myHotel.ten.replace(/ /g, '_')}_${revenueYear}.xlsx`);
        } catch (error) {
            console.error('Lỗi xuất excel:', error);
            setToast({ message: 'Không thể xuất file Excel', type: 'error' });
        }
    };

    const fetchBookings = async (silent = false) => {
        if (!myHotel) return;
        if (!silent) setLoadingBookings(true);
        try {
            const res = await axiosClient.get(`/bookings/hotel/${myHotel.id}`);
            setBookings(res.data || []);
        } catch (err) {
            console.error('Loi tai bookings:', err);
        } finally {
            if (!silent) setLoadingBookings(false);
        }
    };

    const fetchRooms = async (silent = false) => {
        if (!myHotel) return;
        try {
            const res = await axiosClient.get(`/rooms/hotel/${myHotel.id}`);
            setRooms(res.data || []);
        } catch (err) { if (!silent) console.error(err); }
    };

    const fetchServices = async (silent = false) => {
        if (!myHotel) return;
        try {
            const res = await axiosClient.get(`/services/hotel/${myHotel.id}`);
            setServices(res.data || []);
        } catch (err) { if (!silent) console.error(err); }
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
            setServiceToAdd({
                dichVuId: services[0]?.id != null ? String(services[0].id) : '',
                soLuong: 1,
            });
            setSurchargeToAdd({ loaiPhuThu: '', soTien: '' });
            fetchInvoice(id);
        } catch (err) {
            showToast('Lỗi tải chi tiết đặt phòng', 'error');
        }
    };

    /* Khi danh sách dịch vụ về sau (lần đầu mở chi tiết), gán option mặc định nếu còn trống */
    useEffect(() => {
        if (!selectedBooking || services.length === 0) return;
        setServiceToAdd((prev) => {
            if (prev.dichVuId) return prev;
            return { dichVuId: String(services[0].id), soLuong: prev.soLuong || 1 };
        });
    }, [selectedBooking?.id, services]);

    const fetchInvoice = async (id) => {
        setInvoiceLoading(true);
        try {
            const res = await axiosClient.get(`/bookings/${id}/invoice`);
            setInvoice(res.data);
        } catch {
            setInvoice(null);
        } finally {
            setInvoiceLoading(false);
        }
    };

    const handleBookingAction = async (action, id, extraData = {}) => {
        setActionLoading(`${id}-${action}`);
        try {
            if (['confirm', 'checkin', 'no-show', 'complete'].includes(action)) {
                await axiosClient.put(`/bookings/${id}/${action}`);
            } else if (action === 'reject') {
                await axiosClient.put(`/bookings/${id}/reject`, { ghiChu: 'Quản lý từ chối' });
            } else if (action === 'checkout') {
                await axiosClient.post(`/bookings/${id}/checkout`, extraData);
                setShowCheckoutModal(false);
            }
            showToast('Cập nhật thành công');
            fetchBookings();
            if (selectedBooking && selectedBooking.id === id) {
                fetchBookingDetails(id);
            }
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data?.error || 'Lỗi xử lý. Vui lòng thử lại.', 'error');
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
            fetchInvoice(selectedBooking.id); // Cập nhật hóa đơn ngay
            fetchBookings();
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
            fetchInvoice(selectedBooking.id); // Cập nhật hóa đơn ngay
            fetchBookings();
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

    const navItems = [
        { id: 'overview',    label: 'Tổng Quan',    icon: ICONS.hotel },
        { id: 'bookings',    label: 'Đặt Phòng',    icon: ICONS.booking },
        { id: 'rooms',       label: 'Phòng',         icon: ICONS.room },
        { id: 'services',    label: 'Dịch Vụ',      icon: ICONS.service },
        { id: 'promotions',  label: 'Khuyến Mãi',   icon: ICONS.promotion },
        { id: 'reviews',     label: 'Đánh Giá',     icon: ICONS.star },
        { id: 'revenue',     label: 'Doanh Thu',    icon: ICONS.revenue },
        { id: 'settings',    label: 'Cài Đặt KS',   icon: ICONS.menu },
        { id: 'profile',     label: 'Hồ Sơ',        icon: ICONS.profile },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">

            {/* ---- SIDEBAR ---- */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-emerald-800 to-emerald-900 text-white flex flex-col min-h-0 transition-all duration-300 shadow-xl z-20`}>
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
                            {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl.startsWith('http') ? user.avatarUrl : (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080') + user.avatarUrl}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-emerald-300"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-emerald-900 text-lg flex-shrink-0">
                                {user?.hoTen?.charAt(0)?.toUpperCase() || 'M'}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{user?.hoTen}</p>
                            <p className="text-xs text-emerald-300">Hotel Manager</p>
                        </div>
                    </div>
                )}

                {/* Nav — cuộn để luôn thấy Khuyến Mãi, Doanh Thu, ... */}
                <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-4 space-y-1">
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
                                        <option value="Pending">Chờ xác nhận</option>
                                        <option value="Confirmed">Đã xác nhận</option>
                                        <option value="CheckedIn">Đang lưu trú</option>
                                        <option value="CheckedOut">Đã thanh toán (Trả phòng)</option>
                                        <option value="Completed">Hoàn thành</option>
                                        <option value="Cancelled">Đã hủy</option>
                                        <option value="Rejected">Từ chối</option>
                                        <option value="NoShow">Không đến</option>
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
                                                        <td className="px-4 py-3 flex flex-wrap items-center gap-2">
                                                            {b.trangThai === 'Pending' && (
                                                                <>
                                                                    <button type="button" onClick={() => handleBookingAction('confirm', b.id)} disabled={!!actionLoading} className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition">
                                                                        Xác nhận
                                                                    </button>
                                                                    <button type="button" onClick={() => handleBookingAction('reject', b.id)} disabled={!!actionLoading} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition hidden sm:block">
                                                                        Từ chối
                                                                    </button>
                                                                </>
                                                            )}
                                                            {b.trangThai === 'Confirmed' && (
                                                                <>
                                                                    <button type="button" onClick={() => handleBookingAction('checkin', b.id)} disabled={!!actionLoading} className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition flex items-center gap-1">
                                                                         Nhận phòng
                                                                    </button>
                                                                    <button type="button" onClick={() => handleBookingAction('no-show', b.id)} disabled={!!actionLoading} className="bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition hidden sm:block">
                                                                        Không đến
                                                                    </button>
                                                                </>
                                                            )}
                                                            {b.trangThai === 'CheckedIn' && (
                                                                <button type="button" onClick={async () => {
                                                                    try {
                                                                        const res = await axiosClient.get(`/bookings/id/${b.id}`);
                                                                        setSelectedBooking(res.data);
                                                                        await fetchInvoice(b.id);
                                                                        setShowCheckoutModal(true);
                                                                    } catch (e) {
                                                                        showToast(e.response?.data?.message || 'Không tải được dữ liệu thanh toán', 'error');
                                                                    }
                                                                }} disabled={!!actionLoading} className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition flex items-center gap-1">
                                                                    💳 Thanh Toán
                                                                </button>
                                                            )}
                                                            {b.trangThai === 'CheckedOut' && (
                                                                <button type="button" onClick={() => handleBookingAction('complete', b.id)} disabled={!!actionLoading} className="bg-gray-800 text-white hover:bg-gray-900 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition flex items-center gap-1">
                                                                     Hoàn tất
                                                                </button>
                                                            )}
                                                            <button type="button" onClick={() => fetchBookingDetails(b.id)} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition">
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingRoomType(null); setShowRoomTypeModal(true); }}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition">
                                        🛎️ Tiện Ích Loại Phòng
                                    </button>
                                    <button
                                        onClick={() => { setEditingRoom(null); setRoomForm({ ten: '', maPhong: '', giaTien: '', loaiPhongId: roomTypes[0]?.id || '', tang: '', soPhong: '', soKhach: '', trangThai: 'Trống' }); setShowRoomModal(true); }}
                                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">
                                        ＋ Thêm Phòng
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-semibold text-gray-500">
                                            <th className="px-4 py-3">Phòng</th>
                                            <th className="px-4 py-3">Mã Phòng</th>
                                            <th className="px-4 py-3">Loại</th>
                                            <th className="px-4 py-3">Số Khách</th>
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
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                                    {r.maPhong || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {roomTypes.find(t => t.id === r.loaiPhong?.id || t.id === r.loaiPhongId)?.ten || r.loaiPhong?.ten}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 font-semibold">{r.soKhach ? r.soKhach + ' 👥' : '---'}</td>
                                                <td className="px-4 py-3 text-gray-600">{formatCurrency(r.giaTien || 0)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${r.trangThai === 'Trống' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {r.trangThai || 'Trống'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => { setEditingRoom(r); setRoomForm({ ten: r.ten, maPhong: r.maPhong, giaTien: r.giaTien, loaiPhongId: r.loaiPhong?.id || r.loaiPhongId, tang: r.tang || '', soPhong: r.soPhong || '', soKhach: r.soKhach || '', trangThai: r.trangThai || 'Trống' }); setShowRoomModal(true); }} className="text-blue-600 hover:text-blue-800 mr-3 text-xs font-semibold tracking-wide">SỬA</button>
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
                                        {/* Deposit rate + threshold */}
                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-4">
                                            {/* Ngưỡng cọc */}
                                            <div>
                                                <label className="block text-sm font-bold text-orange-800 mb-1">🎯 Ngưỡng áp dụng tiền cọc (đ)</label>
                                                <p className="text-xs text-gray-500 mb-2">Chỉ yêu cầu cọc khi tổng tiền đơn ≥ ngưỡng này. Nhập 0 để luôn áp cọc.</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0" step="50000"
                                                        value={form.nguongCoc ?? 0}
                                                        onChange={e => handleChange('nguongCoc', e.target.value)}
                                                        className="flex-1 border border-orange-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-orange-400 outline-none"
                                                    />
                                                    <span className="text-sm font-semibold text-orange-600 shrink-0">VNĐ</span>
                                                </div>
                                                {Number(form.nguongCoc ?? 0) > 0 && (
                                                    <p className="text-xs text-orange-600 mt-1">
                                                        Đơn dưới {Number(form.nguongCoc).toLocaleString('vi-VN')}đ → <strong>không cọc</strong>
                                                    </p>
                                                )}
                                            </div>
                                            {/* Tỷ lệ cọc */}
                                            <div>
                                                <label className="block text-sm font-bold text-orange-800 mb-1">💰 Tỷ lệ tiền cọc (%)</label>
                                                <p className="text-xs text-gray-500 mb-2">Phần trăm tổng tiền phòng khách phải cọc trước.</p>
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
                                                    Ví dụ: Đơn 2.400.000đ → Tiền cọc: {Math.round(2400000 * (form.tiLeCoc ?? 30) / 100).toLocaleString('vi-VN')}đ
                                                    {Number(form.nguongCoc ?? 0) > 0 && Number(form.nguongCoc) > 2400000 && ' (dưới ngưỡng → không cọc)'}
                                                </p>
                                            </div>
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

                                {/* ── Hình ảnh khách sạn ── */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                                        <h3 className="font-bold text-lg">🖼️ Hình ảnh Khách Sạn</h3>
                                        <p className="text-blue-100 text-sm">Quản lý ảnh và chọn ảnh bìa hiển thị cho khách</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {/* Add new image - tabbed: file or URL */}
                                        {(() => {
                                            const BACKEND = 'http://localhost:8080';
                                            return null;
                                        })()}
                                        <HotelImageAdder
                                            hotelId={myHotel?.id}
                                            onAdded={(newUrls) => {
                                                const urlList = Array.isArray(newUrls) ? newUrls : [newUrls];
                                                const imgs = [...(form.hinhAnhs || []), ...urlList];
                                                handleChange('hinhAnhs', imgs);
                                                if (!form.hinhAnhBia && urlList.length > 0) handleChange('hinhAnhBia', urlList[0]);
                                            }}
                                        />

                                        {/* Image grid */}
                                        {(form.hinhAnhs || []).length === 0 ? (
                                            <p className="text-center text-gray-400 py-6 text-sm">Chưa có hình ảnh nào. Hãy thêm URL ảnh ở trên.</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                {(form.hinhAnhs || []).map((url, idx) => (
                                                    <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 ${
                                                        form.hinhAnhBia === url
                                                            ? 'border-blue-500 ring-2 ring-blue-300'
                                                            : 'border-gray-200'
                                                    }`}>
                                                        <img src={url.startsWith('http') || url.startsWith('data:') ? url : (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080') + url} alt={`Hotel ${idx+1}`}
                                                            className="w-full h-36 object-cover"
                                                            onError={e => {
                                                                e.target.onerror = null; 
                                                                e.target.src='https://placehold.co/400x200/e2e8f0/94a3b8?text=Image+Error';
                                                            }} />
                                                        
                                                        {/* Top-left: Cover label */}
                                                        {form.hinhAnhBia === url && (
                                                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                                                                ★ Ảnh bìa
                                                            </span>
                                                        )}

                                                        {/* Hover actions */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            {form.hinhAnhBia !== url && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleChange('hinhAnhBia', url);
                                                                    }}
                                                                    className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition">
                                                                    ★ Đặt bìa
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    const imgs = (form.hinhAnhs || []).filter(u => u !== url);
                                                                    handleChange('hinhAnhs', imgs);
                                                                    if (form.hinhAnhBia === url) handleChange('hinhAnhBia', imgs[0] || '');
                                                                }}
                                                                className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-red-700 transition">
                                                                🗑 Xóa
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Save button for images */}
                                        <div className="flex justify-end pt-2">
                                            <button
                                                disabled={savingHotel}
                                                onClick={async () => {
                                                    setSavingHotel(true);
                                                    try {
                                                        await axiosClient.put(`/hotels/${myHotel.id}/settings`, {
                                                            hinhAnhs: form.hinhAnhs || [],
                                                            hinhAnhBia: form.hinhAnhBia || ''
                                                        });
                                                        setMyHotel(prev => ({ ...prev, hinhAnhs: form.hinhAnhs, hinhAnhBia: form.hinhAnhBia }));
                                                        showToast('Đã lưu hình ảnh khách sạn!');
                                                    } catch (err) {
                                                        showToast(err.response?.data?.message || 'Lỗi lưu hình ảnh!', 'error');
                                                    } finally { setSavingHotel(false); }
                                                }}
                                                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm transition">
                                                {savingHotel ? '⏳ Đang lưu...' : '💾 Lưu hình ảnh'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}


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
                                <div>
                                    <label className="text-xs font-semibold text-gray-600">Số người (Khách) *</label>
                                    <input required type="number" min="1" value={roomForm.soKhach || ''} onChange={e => setRoomForm({...roomForm, soKhach: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="VD: 2" />
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

            {/* Room Type Amenities Modal */}
            {showRoomTypeModal && (() => {
                const PRESETS = [
                    'WiFi','TV','Dieu hoa','Nha tam rieng','Tu lanh','Minibar',
                    'Phong khach rieng','Ban lam viec','Boi','Ho boi',
                    'TV 55inch','TV man hinh phang','Truyen hinh cap',
                    'Voi sen','Khan tam','Do ve sinh ca nhan mien phi',
                    'Dieu hoa khong khi','Ket an toan','May say toc',
                    'Giu xe mien phi','Dich vu phong','Ban ui',
                    'Tam nhin ra khung canh','Tam nhin bien',
                    'Quat may','Dien thoai','San lat gach/da cam thach',
                    'Khu vuc tiep khach','Khu vuc phong an','Ban an',
                    'Tu hoac phong de quan ao','Gia treo quan ao',
                ];

                const openForType = (rt) => {
                    setEditingRoomType(rt);
                    setRoomTypeAmenities(rt.tienIch ? rt.tienIch.split(',').map(s => s.trim()).filter(Boolean) : []);
                    setRoomTypeAmenityInput('');
                };

                const togglePreset = (p) => {
                    setRoomTypeAmenities(prev =>
                        prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                    );
                };

                const addCustom = () => {
                    const val = roomTypeAmenityInput.trim();
                    if (val && !roomTypeAmenities.includes(val)) {
                        setRoomTypeAmenities(prev => [...prev, val]);
                    }
                    setRoomTypeAmenityInput('');
                };

                const handleSaveAmenities = async () => {
                    if (!editingRoomType) return;
                    setSavingRoomType(true);
                    try {
                        const updated = { ...editingRoomType, tienIch: roomTypeAmenities.join(',') };
                        await axiosClient.put(`/room-types/${editingRoomType.id}`, updated);
                        setRoomTypes(prev => prev.map(rt => rt.id === editingRoomType.id ? { ...rt, tienIch: updated.tienIch } : rt));
                        setEditingRoomType({ ...editingRoomType, tienIch: updated.tienIch });
                        showToast('Đã lưu tiện ích!');
                    } catch {
                        showToast('Lỗi lưu tiện ích!', 'error');
                    } finally {
                        setSavingRoomType(false);
                    }
                };

                return (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h2 className="font-bold text-lg">🛎️ Tiện Ích Theo Loại Phòng</h2>
                                <button type="button" onClick={() => setShowRoomTypeModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                            </div>
                            <div className="flex overflow-hidden flex-1 min-h-0">
                                {/* Danh sách loại phòng */}
                                <div className="w-44 border-r bg-gray-50 overflow-y-auto flex-shrink-0">
                                    {roomTypes.map(rt => (
                                        <button key={rt.id} type="button"
                                            onClick={() => openForType(rt)}
                                            className={`w-full text-left px-4 py-3 text-sm border-b transition ${editingRoomType?.id === rt.id ? 'bg-purple-50 text-purple-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}>
                                            {rt.ten}
                                        </button>
                                    ))}
                                </div>
                                {/* Editor */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    {!editingRoomType ? (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">← Chọn loại phòng để chỉnh tiện ích</div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm font-semibold text-gray-700">Loại phòng: <span className="text-purple-700">{editingRoomType.ten}</span></p>
                                            {/* Tiện ích đã chọn */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 mb-2">Đang có ({roomTypeAmenities.length})</p>
                                                <div className="flex flex-wrap gap-1.5 min-h-8">
                                                    {roomTypeAmenities.map(a => (
                                                        <span key={a} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full">
                                                            {a}
                                                            <button type="button" onClick={() => setRoomTypeAmenities(prev => prev.filter(x => x !== a))} className="ml-0.5 text-purple-500 hover:text-purple-900 font-bold">×</button>
                                                        </span>
                                                    ))}
                                                    {roomTypeAmenities.length === 0 && <span className="text-xs text-gray-400">Chưa có tiện ích nào</span>}
                                                </div>
                                            </div>
                                            {/* Thêm tùy chỉnh */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 mb-2">Thêm tiện ích tùy chỉnh</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={roomTypeAmenityInput}
                                                        onChange={e => setRoomTypeAmenityInput(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
                                                        placeholder="VD: Bồn tắm jacuzzi"
                                                        className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                                                    />
                                                    <button type="button" onClick={addCustom} className="px-3 py-1.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700">＋</button>
                                                </div>
                                            </div>
                                            {/* Preset */}
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 mb-2">Tiện ích phổ biến</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {PRESETS.map(p => (
                                                        <button key={p} type="button" onClick={() => togglePreset(p)}
                                                            className={`text-xs px-2.5 py-1 rounded-full border transition ${roomTypeAmenities.includes(p) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'}`}>
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                                <button type="button" onClick={() => setShowRoomTypeModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Đóng</button>
                                {editingRoomType && (
                                    <button type="button" onClick={handleSaveAmenities} disabled={savingRoomType}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50">
                                        {savingRoomType ? 'Đang lưu...' : '💾 Lưu tiện ích'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-t-2xl">
                            <div>
                                <h2 className="font-bold text-lg">Chi Tiết Đặt Phòng
                                    <span className="font-mono ml-2 bg-white/20 px-2 py-0.5 rounded-lg text-sm">
                                        #{selectedBooking.maDatPhong || selectedBooking.id}
                                    </span>
                                </h2>
                                <div className="mt-1"><StatusBadge status={selectedBooking.trangThai} /></div>
                            </div>
                            <button onClick={() => { setSelectedBooking(null); setInvoice(null); }}
                                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl transition">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Cột trái: Thông tin khách & phòng */}
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b">👤 Thông Tin Khách</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-400 w-16 inline-block">Họ tên:</span> <span className="font-semibold text-gray-800">{selectedBooking.hoTenKhach || '—'}</span></p>
                                            <p><span className="text-gray-400 w-16 inline-block">Email:</span> <span className="text-gray-700">{selectedBooking.emailKhach || '—'}</span></p>
                                            <p><span className="text-gray-400 w-16 inline-block">SĐT:</span> <span className="text-gray-700">{selectedBooking.sdtKhach || <span className="italic text-gray-300">Chưa cập nhật</span>}</span></p>
                                            {selectedBooking.ghiChuKhach && (
                                                <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-800 text-xs">
                                                    <span className="font-bold">💬 Ghi chú:</span> {selectedBooking.ghiChuKhach}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b">🏨 Thông Tin Phòng & Khách Sạn</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-400 w-16 inline-block">Khách sạn:</span> <span className="font-semibold text-gray-800">{selectedBooking.tenKhachSan || '—'}</span></p>
                                            <p><span className="text-gray-400 w-16 inline-block">Phòng:</span> <span className="font-semibold text-gray-800">{selectedBooking.tenPhong || '—'} ({selectedBooking.soPhong || '—'})</span></p>
                                            <p><span className="text-gray-400 w-16 inline-block">Loại:</span> <span className="text-gray-700">{selectedBooking.loaiPhong || '—'}</span></p>
                                        </div>
                                        <div className="flex gap-3 mt-3 bg-gray-50 p-2 rounded-lg text-center">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400">Check-in</p>
                                                <p className="text-sm font-bold text-emerald-700">{formatDate(selectedBooking.ngayDen)}</p>
                                            </div>
                                            <div className="flex-1 border-l border-gray-200">
                                                <p className="text-xs text-gray-400">Check-out</p>
                                                <p className="text-sm font-bold text-blue-700">{formatDate(selectedBooking.ngayDi)}</p>
                                            </div>
                                            <div className="flex-1 border-l border-gray-200">
                                                <p className="text-xs text-gray-400">Số đêm</p>
                                                <p className="text-sm font-bold text-gray-700">{selectedBooking.soNgay || Math.max(1, Math.ceil((new Date(selectedBooking.ngayDi) - new Date(selectedBooking.ngayDen)) / (1000 * 60 * 60 * 24)))}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thêm dịch vụ & phụ thu (chỉ khi CheckedIn) */}
                                    {selectedBooking.trangThai === 'CheckedIn' && (
                                        <div className="space-y-3">
                                            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                                                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3 pb-2 border-b border-emerald-100">➕ Thêm Dịch Vụ</h4>
                                                <form onSubmit={handleAddServiceToBooking} className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold text-gray-600">Dịch vụ</label>
                                                        <select required value={serviceToAdd.dichVuId} onChange={e => setServiceToAdd({...serviceToAdd, dichVuId: e.target.value})}
                                                            className="mt-1 w-full border border-emerald-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-emerald-500 bg-white">
                                                            <option value="" disabled>-- Chọn --</option>
                                                            {services.map(s => <option key={s.id} value={s.id}>{s.ten} - {formatCurrency(s.giaTien)}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-16">
                                                        <label className="text-xs font-semibold text-gray-600">SL</label>
                                                        <input required type="number" min="1" value={serviceToAdd.soLuong}
                                                            onChange={e => setServiceToAdd({...serviceToAdd, soLuong: e.target.value})}
                                                            className="mt-1 w-full border border-emerald-200 rounded-lg px-2 py-1.5 text-sm outline-none text-center" />
                                                    </div>
                                                    <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 h-[34px]">+</button>
                                                </form>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3 pb-2 border-b border-amber-100">⚠️ Thêm Phụ Thu</h4>
                                                <form onSubmit={handleAddSurchargeToBooking} className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold text-gray-600">Lý do</label>
                                                        <input required value={surchargeToAdd.loaiPhuThu}
                                                            onChange={e => setSurchargeToAdd({...surchargeToAdd, loaiPhuThu: e.target.value})}
                                                            placeholder="Hỏng đồ, trễ giờ..."
                                                            className="mt-1 w-full border border-amber-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white" />
                                                    </div>
                                                    <div className="w-28">
                                                        <label className="text-xs font-semibold text-gray-600">Số tiền</label>
                                                        <input required type="number" min="0" value={surchargeToAdd.soTien}
                                                            onChange={e => setSurchargeToAdd({...surchargeToAdd, soTien: e.target.value})}
                                                            className="mt-1 w-full border border-amber-200 rounded-lg px-2 py-1.5 text-sm outline-none" />
                                                    </div>
                                                    <button type="submit" className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 h-[34px]">+</button>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Cột phải: Hóa đơn realtime */}
                                <div>
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">🧾 Hóa Đơn Chi Tiết</h4>
                                            {invoiceLoading && <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />}
                                        </div>
                                        {invoice ? (
                                            <div className="divide-y divide-gray-50 text-sm">
                                                {/* Tiền phòng */}
                                                <div className="flex justify-between px-4 py-2.5">
                                                    <span className="text-gray-500">🏨 Tiền phòng ({invoice.soNgay} đêm)</span>
                                                    <span className="font-semibold text-gray-800">{formatCurrency(invoice.tienPhong)}</span>
                                                </div>
                                                {/* Dịch vụ */}
                                                {invoice.dichVus?.map((dv, i) => (
                                                    <div key={i} className="flex justify-between px-4 py-2 bg-blue-50/30">
                                                        <span className="text-gray-500 pl-2">🛎 {dv.tenDichVu} ×{dv.soLuong}</span>
                                                        <span className="text-gray-700">{formatCurrency(dv.thanhTien)}</span>
                                                    </div>
                                                ))}
                                                {invoice.dichVus?.length > 0 && (
                                                    <div className="flex justify-between px-4 py-1.5 bg-blue-50/50">
                                                        <span className="text-blue-600 text-xs font-semibold pl-2">Tổng dịch vụ</span>
                                                        <span className="text-blue-600 text-xs font-bold">{formatCurrency(invoice.tienDichVu)}</span>
                                                    </div>
                                                )}
                                                {/* Phụ thu */}
                                                {invoice.phuThus?.map((pt, i) => (
                                                    <div key={i} className="flex justify-between px-4 py-2 bg-orange-50/30">
                                                        <span className="text-gray-500 pl-2">⚠️ {pt.loaiPhuThu}</span>
                                                        <span className="text-orange-600">+{formatCurrency(pt.soTien)}</span>
                                                    </div>
                                                ))}
                                                {invoice.phuThus?.length > 0 && (
                                                    <div className="flex justify-between px-4 py-1.5 bg-orange-50/50">
                                                        <span className="text-orange-600 text-xs font-semibold pl-2">Tổng phụ thu</span>
                                                        <span className="text-orange-600 text-xs font-bold">{formatCurrency(invoice.tienPhuThu)}</span>
                                                    </div>
                                                )}
                                                {/* Tiền cọc */}
                                                {Number(invoice.tienCoc) > 0 && (
                                                    <div className="flex justify-between px-4 py-2.5 bg-amber-50/40">
                                                        <span className="text-amber-700 font-medium">💰 Tiền cọc</span>
                                                        <div className="text-right">
                                                            <span className="text-amber-600 font-bold">{formatCurrency(invoice.tienCoc)}</span>
                                                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${invoice.trangThaiCoc === 'DaCoc' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                                {invoice.trangThaiCoc === 'DaCoc' ? '✓ Đã cọc' : '⏳ Chưa cọc'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Tổng */}
                                                <div className="flex justify-between px-4 py-3 bg-emerald-50">
                                                    <span className="font-bold text-gray-800">TỔNG CỘNG</span>
                                                    <span className="text-xl font-black text-emerald-600">{formatCurrency(invoice.tongCong)}</span>
                                                </div>
                                                {/* Trạng thái TT */}
                                                <div className="px-4 py-2 flex justify-between items-center">
                                                    <span className="text-xs text-gray-400">Trạng thái thanh toán</span>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                        invoice.trangThaiThanhToan === 'DaThanhToan' ? 'bg-green-100 text-green-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>{invoice.trangThaiThanhToan || 'ChuaThanhToan'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-50 text-sm opacity-60">
                                                {/* Default Fallback for Missing Invoice API data */}
                                                <div className="flex justify-between px-4 py-2.5">
                                                    <span className="text-gray-500">🏨 Tiền phòng</span>
                                                    <span className="font-semibold text-gray-800">{formatCurrency(selectedBooking.thanhTien)}</span>
                                                </div>
                                                <div className="flex justify-between px-4 py-3 bg-gray-50">
                                                    <span className="font-bold text-gray-800">TỔNG CỘNG</span>
                                                    <span className="text-lg font-bold text-gray-600">{formatCurrency(selectedBooking.thanhTien)}</span>
                                                </div>
                                                <div className="px-4 py-2 mb-2 text-center text-xs text-orange-500 italic">
                                                    {invoiceLoading ? 'Đang tải chi tiết hóa đơn...' : '(Không lấy được hóa đơn chi tiết)'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 bg-white border-t flex flex-wrap gap-3 justify-end items-center">
                            {selectedBooking.trangThai === 'Pending' && (
                                <>
                                    <button onClick={() => handleBookingAction('reject', selectedBooking.id)} disabled={!!actionLoading}
                                        className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold rounded-lg transition">
                                        🚫 Từ chối
                                    </button>
                                    <button onClick={() => handleBookingAction('confirm', selectedBooking.id)} disabled={!!actionLoading}
                                        className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition">
                                        ✅ Xác nhận đặt phòng
                                    </button>
                                </>
                            )}
                            {selectedBooking.trangThai === 'Confirmed' && (
                                <>
                                    <button onClick={() => handleBookingAction('no-show', selectedBooking.id)} disabled={!!actionLoading}
                                        className="px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 text-sm font-semibold rounded-lg transition">
                                        👻 Khách không đến
                                    </button>
                                    <button onClick={() => handleBookingAction('checkin', selectedBooking.id)} disabled={!!actionLoading}
                                        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md transition flex items-center gap-2">
                                        {actionLoading === `${selectedBooking.id}-checkin` ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Đang xử lý...</>
                                        ) : <>🏠 Xác nhận Nhận Phòng</>}
                                    </button>
                                </>
                            )}
                            {selectedBooking.trangThai === 'CheckedIn' && (
                                <button onClick={() => setShowCheckoutModal(true)} disabled={!!actionLoading}
                                    className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-md transition w-full sm:w-auto flex items-center gap-2 justify-center">
                                    💳 Thanh Toán & Trả Phòng
                                </button>
                            )}
                            {selectedBooking.trangThai === 'CheckedOut' && (
                                <button onClick={() => handleBookingAction('complete', selectedBooking.id)} disabled={!!actionLoading}
                                    className="px-5 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 shadow-sm transition">
                                    🎉 Hoàn tất đơn
                                </button>
                            )}
                            {['Cancelled', 'Rejected', 'Expired', 'NoShow', 'Completed'].includes(selectedBooking.trangThai) && (
                                <span className="text-sm font-semibold text-gray-400 italic">Đơn đã đóng.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

                    {/* ======== REVIEWS ======== */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Quản Lý Đánh Giá</h2>
                                    <p className="text-sm text-gray-500 mt-1">Xem và phản hồi ý kiến của khách hàng để nâng cao chất lượng dịch vụ</p>
                                </div>
                                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl text-emerald-700 font-bold border border-emerald-100">
                                    <span className="text-xl">⭐</span>
                                    <span>{myHotel?.diemDanhGiaTrungBinh?.toFixed(1) || '0.0'} / 5.0 ({myHotel?.soLuotDanhGia || 0} lượt)</span>
                                </div>
                            </div>

                            {loadingReviews ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500">
                                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    Đang tải đánh giá từ khách hàng...
                                </div>
                            ) : hotelReviews.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
                                    <div className="text-5xl mb-4">💬</div>
                                    Khách sạn của bạn chưa có lượt đánh giá nào.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {hotelReviews.map(review => (
                                        <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-emerald-200 transition-colors">
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                                            {review.hoTenKhach?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800">{review.hoTenKhach}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                                <span>📅 {formatDate(review.ngayDanhGia)}</span>
                                                                <span>•</span>
                                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded">📦 Đơn: #{review.maDatPhong}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 text-sm">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span key={star} className={star <= review.soSaoTong ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed border border-gray-100">
                                                    <p className="italic">"{review.binhLuan}"</p>
                                                </div>

                                                {/* Manager Reply section */}
                                                <div className="mt-4 pl-4 border-l-4 border-emerald-500 space-y-3">
                                                    {review.phanHoi ? (
                                                        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">🏨 Phản hồi từ khách sạn</span>
                                                                <span className="text-[10px] text-emerald-500 font-medium">{formatDate(review.ngayPhanHoi)}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{review.phanHoi}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={replyText[review.id] || ''}
                                                                onChange={e => setReplyText({ ...replyText, [review.id]: e.target.value.slice(0, 200) })}
                                                                placeholder="Nhập phản hồi của bạn tới khách hàng..."
                                                                maxLength={200}
                                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px] transition-all"
                                                            />
                                                            <p className="text-right text-xs text-gray-400">{(replyText[review.id] || '').length}/200</p>
                                                            <div className="flex justify-end">
                                                                <button
                                                                    onClick={() => handleReplySubmit(review.id)}
                                                                    disabled={isReplying === review.id || !replyText[review.id]?.trim()}
                                                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm flex items-center gap-2"
                                                                >
                                                                    {isReplying === review.id ? '⏳ Đang gửi...' : '🚀 Gửi phản hồi'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

            {activeTab === 'revenue' && (
                <div className="space-y-6 animate-fade-in pb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Báo Cáo Doanh Thu</h2>
                            <p className="text-sm text-gray-500 mt-1">Thống kê doanh thu Phòng, Dịch vụ và Phụ thu chi tiết theo từng tháng</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={revenueYear}
                                onChange={e => setRevenueYear(Number(e.target.value))}
                                className="border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 font-semibold text-gray-700 outline-none focus:border-emerald-500 cursor-pointer transition select-none"
                            >
                                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                            </select>
                            <button onClick={handleExportExcel} disabled={!revenueData} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-2">
                                <span>📥</span> Xuất Excel
                            </button>
                        </div>
                    </div>

                    {loadingRevenue ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500">
                            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            Đang tải phân tích dữ liệu...
                        </div>
                    ) : revenueData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard title="Tổng Doanh Thu (Năm)" value={formatCurrency(revenueData.totalRevenue)} icon={ICONS.revenue} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
                                <StatCard title="Từ Tiền Phòng" value={formatCurrency(revenueData.monthlyStats.reduce((acc, m) => acc + m.roomRevenue, 0))} icon={ICONS.room} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
                                <StatCard title="Từ Dịch Vụ" value={formatCurrency(revenueData.monthlyStats.reduce((acc, m) => acc + m.serviceRevenue, 0))} icon={ICONS.service} gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
                                <StatCard title="Từ Phụ Thu" value={formatCurrency(revenueData.monthlyStats.reduce((acc, m) => acc + m.surchargeRevenue, 0))} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" gradient="bg-gradient-to-br from-orange-400 to-red-500" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Chart */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu Đồ Doanh Thu Tháng ({revenueYear})</h3>
                                    <div className="h-80 w-full flex-1 min-h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={revenueData.monthlyStats} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="month" tickFormatter={val => `T${val.split('-')[1]}`} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                                <YAxis tickFormatter={val => `${val / 1000000}M`} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} width={45} />
                                                <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} formatter={(value) => formatCurrency(value)} />
                                                <Legend wrapperStyle={{paddingTop: '20px', fontSize: '13px'}} iconType="circle" />
                                                <Bar dataKey="roomRevenue" name="Tiền Phòng" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} maxBarSize={48} />
                                                <Bar dataKey="serviceRevenue" name="Dịch Vụ" stackId="a" fill="#8B5CF6" maxBarSize={48} />
                                                <Bar dataKey="surchargeRevenue" name="Phụ Thu" stackId="a" fill="#F97316" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Surcharges List */}
                                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden max-h-[460px]">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg font-bold text-gray-800">Lịch Sử Phụ Thu</h3>
                                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{revenueData.surcharges.length} lượt</span>
                                    </div>
                                    {revenueData.surcharges.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-3 pb-8">
                                            <span className="text-4xl">📭</span>
                                            <p className="text-center text-sm text-gray-500">Chưa có dữ liệu phụ thu</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-y-auto pr-2 space-y-3 flex-1 scrollbar-thin scrollbar-thumb-gray-200">
                                            {revenueData.surcharges.map((s, i) => (
                                                <div key={i} className="bg-gray-50 hover:bg-gray-100 transition p-4 rounded-xl border border-gray-100 flex justify-between items-center group">
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-sm group-hover:text-amber-700 transition-colors">{s.loaiPhuThu}</p>
                                                        <p className="text-xs text-gray-500 mt-1 font-mono">{s.maDatPhong} • {new Date(s.ngayThu).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                    <p className="font-bold text-orange-500 text-sm">+{formatCurrency(s.soTien)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            )}

            {/* Checkout Payment Modal */}
            {showCheckoutModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                            <h3 className="font-bold text-lg">💳 Xác nhận Thanh Toán</h3>
                            <p className="text-indigo-200 text-sm mt-0.5">#{selectedBooking.maDatPhong}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {invoiceLoading && (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-2">
                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm">Đang tải hóa đơn...</p>
                                </div>
                            )}
                            {/* Tóm tắt hóa đơn */}
                            {!invoiceLoading && invoice && (
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                    {/* Tiền phòng */}
                                    <div className="flex justify-between text-gray-600">
                                        <span>🏨 Tiền phòng ({invoice.soNgay} đêm)</span>
                                        <span>{formatCurrency(invoice.tienPhong)}</span>
                                    </div>
                                    {/* Chi tiết dịch vụ */}
                                    {invoice.dichVus?.length > 0 && (
                                        <div className="space-y-1 border-t border-dashed border-gray-200 pt-2">
                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">🛎 Dịch vụ</p>
                                            {invoice.dichVus.map((dv, i) => (
                                                <div key={i} className="flex justify-between text-gray-600 pl-3">
                                                    <span>{dv.tenDichVu} ×{dv.soLuong}</span>
                                                    <span>{formatCurrency(dv.thanhTien)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-blue-600 font-semibold pl-3">
                                                <span>Tổng dịch vụ</span>
                                                <span>{formatCurrency(invoice.tienDichVu)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Chi tiết phụ thu */}
                                    {invoice.phuThus?.length > 0 && (
                                        <div className="space-y-1 border-t border-dashed border-gray-200 pt-2">
                                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">⚠️ Phụ thu</p>
                                            {invoice.phuThus.map((pt, i) => (
                                                <div key={i} className="flex justify-between text-gray-600 pl-3">
                                                    <span>{pt.loaiPhuThu}</span>
                                                    <span className="text-orange-600">+{formatCurrency(pt.soTien)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-orange-600 font-semibold pl-3">
                                                <span>Tổng phụ thu</span>
                                                <span>{formatCurrency(invoice.tienPhuThu)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Tổng */}
                                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                                        <span>TỔNG THANH TOÁN</span>
                                        <span className="text-emerald-600 text-lg">{formatCurrency(invoice.tongCong)}</span>
                                    </div>
                                </div>
                            )}
                            {!invoiceLoading && !invoice && (
                                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                    Chưa lấy được hóa đơn chi tiết. Bạn có thể thử lại sau vài giây hoặc kiểm tra kết nối server.
                                </p>
                            )}
                            {/* Phương thức thanh toán */}
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">Phương thức thanh toán</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'TienMat', icon: '💵', label: 'Tiền mặt' },
                                        { value: 'ChuyenKhoan', icon: '🏦', label: 'Chuyển khoản' },
                                        { value: 'TheNganHang', icon: '💳', label: 'Thẻ ngân hàng' },
                                    ].map(opt => (
                                        <button key={opt.value} type="button"
                                            onClick={() => setCheckoutForm({ phuongThuc: opt.value })}
                                            className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center gap-1 ${
                                                checkoutForm.phuongThuc === opt.value
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <span className="text-xl">{opt.icon}</span>
                                            <span className="text-xs font-semibold text-gray-700">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3 justify-end">
                            <button onClick={() => setShowCheckoutModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBookingAction('checkout', selectedBooking.id, { phuongThuc: checkoutForm.phuongThuc })}
                                disabled={!!actionLoading || invoiceLoading}
                                className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                                {actionLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Đang xử lý...</> : '✅ Xác nhận thanh toán'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

                    {/* ======== Khuyến Mãi ======== */}
                    {activeTab === 'promotions' && (
                        <div className="space-y-5">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Mã Khuyến Mãi Khách Sạn</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Tạo mã giảm giá độc quyền cho khách hàng đặt phòng tại khách sạn của bạn</p>
                                </div>
                                <button
                                    onClick={() => { setEditingPromoCode(null); setPromoCodeForm({ code:'',ten:'',moTa:'',loai:'PERCENT',giaTri:'',giamToiDa:'',donHangToiThieu:'',soDemToiThieu:'',soLanSuDungToiDa:'',soLanToiDaMoiUser:'',ngayBatDau:'',ngayKetThuc:'' }); setShowPromoCodeForm(true); }}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                    + Tạo Mã Khuyến Mãi
                                </button>
                            </div>

                            {/* DiscountFramework info banner */}
                            {discountFramework && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex flex-wrap gap-5 text-sm">
                                    <span className="font-semibold text-amber-800">Giới hạn hệ thống:</span>
                                    {discountFramework.phanTramToiThieu != null && <span className="text-amber-700">% giảm tối thiểu: <strong>{discountFramework.phanTramToiThieu}%</strong></span>}
                                    {discountFramework.phanTramToiDa != null && <span className="text-amber-700">% giảm tối đa: <strong>{discountFramework.phanTramToiDa}%</strong></span>}
                                    {discountFramework.soTienToiDa != null && <span className="text-amber-700">FIXED tối đa: <strong>{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(discountFramework.soTienToiDa)}</strong></span>}
                                    {discountFramework.donHangToiThieuBatBuoc != null && <span className="text-amber-700">Đơn tối thiểu bắt buộc: <strong>{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(discountFramework.donHangToiThieuBatBuoc)}</strong></span>}
                                </div>
                            )}

                            {/* Promo code list */}
                            {loadingPromoCodes ? (
                                <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>
                            ) : (
                                <div className="space-y-3">
                                    {promoCodes.length === 0 && (
                                        <div className="bg-white rounded-xl p-14 text-center text-gray-400 border border-dashed border-gray-200">
                                            <div className="text-4xl mb-3">🎟️</div>
                                            <p className="font-semibold text-gray-500">Chưa có mã khuyến mãi nào</p>
                                            <p className="text-sm mt-1">Tạo mã để khách nhập khi đặt phòng và nhận ưu đãi!</p>
                                        </div>
                                    )}
                                    {promoCodes.map(pc => {
                                        const vnd = (v) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(v);
                                        const isActive = pc.trangThai === 'ACTIVE';
                                        const isExpired = pc.ngayKetThuc && new Date(pc.ngayKetThuc) < new Date();
                                        const usagePct = pc.soLanSuDungToiDa ? Math.min(100, Math.round(((pc.soLanDaDung||0)/pc.soLanSuDungToiDa)*100)) : null;
                                        return (
                                            <div key={pc.id} className={`bg-white rounded-xl border shadow-sm p-5 transition hover:shadow-md ${isActive && !isExpired ? 'border-gray-100' : 'border-gray-200 opacity-70'}`}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Top row: code + badges */}
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg text-sm tracking-wider">{pc.code}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {isActive ? 'Đang hoạt động' : 'Tắt'}
                                                            </span>
                                                            {isExpired && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">Hết hạn</span>}
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pc.loai==='PERCENT'?'bg-indigo-100 text-indigo-700':'bg-orange-100 text-orange-700'}`}>
                                                                {pc.loai==='PERCENT'?'Phần trăm':'Cố định'}
                                                            </span>
                                                        </div>
                                                        {/* Name */}
                                                        <p className="font-semibold text-gray-800">{pc.ten || '(Chưa đặt tên)'}</p>
                                                        {pc.moTa && <p className="text-xs text-gray-400 mt-0.5 truncate">{pc.moTa}</p>}
                                                        {/* Stats row */}
                                                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-gray-400">Giảm:</span>
                                                                <strong className="text-blue-700 text-sm">{pc.loai==='PERCENT'?`${pc.giaTri}%`:vnd(pc.giaTri)}</strong>
                                                                {pc.loai==='PERCENT' && pc.giamToiDa && <span className="text-gray-400">(tối đa {vnd(pc.giamToiDa)})</span>}
                                                            </div>
                                                            {pc.donHangToiThieu && <div><span className="text-gray-400">Đơn tối thiểu:</span> <strong>{vnd(pc.donHangToiThieu)}</strong></div>}
                                                            {pc.soDemToiThieu && <div><span className="text-gray-400">Đêm tối thiểu:</span> <strong>{pc.soDemToiThieu} đêm</strong></div>}
                                                            <div><span className="text-gray-400">Hiệu lực:</span> <strong>{pc.ngayBatDau}</strong> → <strong>{pc.ngayKetThuc}</strong></div>
                                                        </div>
                                                        {/* Usage progress */}
                                                        {pc.soLanSuDungToiDa && (
                                                            <div className="mt-3">
                                                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                                    <span>Lượt sử dụng</span>
                                                                    <span>{pc.soLanDaDung||0} / {pc.soLanSuDungToiDa}</span>
                                                                </div>
                                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                                    <div className={`h-1.5 rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width:`${usagePct}%`}}/>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => { setEditingPromoCode(pc); setPromoCodeForm({ code:pc.code,ten:pc.ten||'',moTa:pc.moTa||'',loai:pc.loai,giaTri:pc.giaTri||'',giamToiDa:pc.giamToiDa||'',donHangToiThieu:pc.donHangToiThieu||'',soDemToiThieu:pc.soDemToiThieu||'',soLanSuDungToiDa:pc.soLanSuDungToiDa||'',soLanToiDaMoiUser:pc.soLanToiDaMoiUser||'',ngayBatDau:pc.ngayBatDau||'',ngayKetThuc:pc.ngayKetThuc||'' }); setShowPromoCodeForm(true); }}
                                                            className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition">
                                                            Chỉnh sửa
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await axiosClient.put(`/promotion-codes/${pc.id}`, { trangThai: isActive ? 'INACTIVE' : 'ACTIVE' });
                                                                    showToast(isActive ? 'Đã tắt mã!' : 'Đã bật mã!');
                                                                    fetchPromoCodes();
                                                                } catch(e) { showToast(e.response?.data?.error || e.response?.data?.message || 'Lỗi cập nhật', 'error'); }
                                                            }}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                                                            {isActive ? 'Tắt' : 'Bật'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Create/Edit PromoCode Modal */}
                            {showPromoCodeForm && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPromoCodeForm(false)}>
                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                        {/* Modal header */}
                                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-2xl">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-base">
                                                    {editingPromoCode ? 'Chỉnh Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
                                                </h3>
                                                {editingPromoCode && <p className="text-xs text-gray-500 mt-0.5">Mã: <span className="font-mono font-bold text-blue-700">{editingPromoCode.code}</span></p>}
                                            </div>
                                            <button onClick={() => setShowPromoCodeForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                                        </div>

                                        {/* Framework limits hint inside modal */}
                                        {discountFramework && !editingPromoCode && (
                                            <div className="mx-6 mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                                                <p className="font-semibold mb-1">Quy định hệ thống (bắt buộc tuân theo):</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                    {discountFramework.phanTramToiThieu != null && <span>% giảm: từ <strong>{discountFramework.phanTramToiThieu}%</strong></span>}
                                                    {discountFramework.phanTramToiDa != null && <span>đến <strong>{discountFramework.phanTramToiDa}%</strong></span>}
                                                    {discountFramework.soTienToiDa != null && <span>FIXED tối đa: <strong>{new Intl.NumberFormat('vi-VN').format(discountFramework.soTienToiDa)} ₫</strong></span>}
                                                    {discountFramework.donHangToiThieuBatBuoc != null && <span>Đơn hàng tối thiểu: <strong>{new Intl.NumberFormat('vi-VN').format(discountFramework.donHangToiThieuBatBuoc)} ₫</strong></span>}
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6 space-y-5">
                                            {/* Section 1: Basic info */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thông tin cơ bản</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Mã code * <span className="font-normal text-gray-400">(viết hoa, không dấu)</span></label>
                                                        <input value={promoCodeForm.code} onChange={e=>setPromoCodeForm(f=>({...f,code:e.target.value.toUpperCase()}))} disabled={!!editingPromoCode}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 font-mono disabled:bg-gray-50 disabled:text-gray-400" placeholder="VD: GIAM10KS"/>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tên mã *</label>
                                                        <input value={promoCodeForm.ten} onChange={e=>setPromoCodeForm(f=>({...f,ten:e.target.value}))}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="VD: Giảm cho khách hàng mới"/>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section 2: Discount value */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Giá trị giảm</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Loại giảm *</label>
                                                        <select value={promoCodeForm.loai} onChange={e=>setPromoCodeForm(f=>({...f,loai:e.target.value}))} disabled={!!editingPromoCode}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50">
                                                            <option value="PERCENT">PERCENT — Phần trăm (%)</option>
                                                            <option value="FIXED">FIXED — Số tiền cố định (₫)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                            Giá trị giảm * {promoCodeForm.loai==='PERCENT' ? '(%)' : '(₫)'}
                                                        </label>
                                                        <input type="number" min="0" value={promoCodeForm.giaTri} onChange={e=>setPromoCodeForm(f=>({...f,giaTri:e.target.value}))} disabled={!!editingPromoCode}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
                                                            placeholder={promoCodeForm.loai==='PERCENT' ? (discountFramework ? `${discountFramework.phanTramToiThieu}–${discountFramework.phanTramToiDa}` : '10') : '500000'}/>
                                                        {promoCodeForm.loai==='PERCENT' && discountFramework && (
                                                            <p className="text-xs text-amber-600 mt-0.5">{discountFramework.phanTramToiThieu}% – {discountFramework.phanTramToiDa}%</p>
                                                        )}
                                                        {promoCodeForm.loai==='FIXED' && discountFramework?.soTienToiDa && (
                                                            <p className="text-xs text-amber-600 mt-0.5">Tối đa {new Intl.NumberFormat('vi-VN').format(discountFramework.soTienToiDa)} ₫</p>
                                                        )}
                                                    </div>
                                                    {promoCodeForm.loai==='PERCENT' && (
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Giảm tối đa (₫) <span className="font-normal text-gray-400">— tùy chọn</span></label>
                                                            <input type="number" min="0" value={promoCodeForm.giamToiDa} onChange={e=>setPromoCodeForm(f=>({...f,giamToiDa:e.target.value}))}
                                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="VD: 500000"/>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Đơn hàng tối thiểu * (₫)</label>
                                                        <input type="number" min="0" value={promoCodeForm.donHangToiThieu} onChange={e=>setPromoCodeForm(f=>({...f,donHangToiThieu:e.target.value}))}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                                            placeholder={discountFramework?.donHangToiThieuBatBuoc ? String(discountFramework.donHangToiThieuBatBuoc) : '500000'}/>
                                                        {discountFramework?.donHangToiThieuBatBuoc && (
                                                            <p className="text-xs text-amber-600 mt-0.5">Tối thiểu {new Intl.NumberFormat('vi-VN').format(discountFramework.donHangToiThieuBatBuoc)} ₫</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section 3: Conditions */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Điều kiện & Giới hạn</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Số đêm tối thiểu <span className="font-normal text-gray-400">— tùy chọn</span></label>
                                                        <input type="number" min="1" value={promoCodeForm.soDemToiThieu} onChange={e=>setPromoCodeForm(f=>({...f,soDemToiThieu:e.target.value}))}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="VD: 2"/>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tổng lượt dùng tối đa <span className="font-normal text-gray-400">— tùy chọn</span></label>
                                                        <input type="number" min="1" value={promoCodeForm.soLanSuDungToiDa} onChange={e=>setPromoCodeForm(f=>({...f,soLanSuDungToiDa:e.target.value}))}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="VD: 100"/>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Lượt dùng/người tối đa <span className="font-normal text-gray-400">— tùy chọn</span></label>
                                                        <input type="number" min="1" value={promoCodeForm.soLanToiDaMoiUser} onChange={e=>setPromoCodeForm(f=>({...f,soLanToiDaMoiUser:e.target.value}))}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="VD: 1"/>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section 4: Date range */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thời gian hiệu lực</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu *</label>
                                                        <input type="date" value={promoCodeForm.ngayBatDau} onChange={e=>setPromoCodeForm(f=>({...f,ngayBatDau:e.target.value}))} disabled={!!editingPromoCode}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"/>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc *</label>
                                                        <input type="date" value={promoCodeForm.ngayKetThuc} onChange={e=>setPromoCodeForm(f=>({...f,ngayKetThuc:e.target.value}))}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"/>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả <span className="font-normal text-gray-400">— tùy chọn</span></label>
                                                <textarea value={promoCodeForm.moTa} onChange={e=>setPromoCodeForm(f=>({...f,moTa:e.target.value}))} rows={2}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="Mô tả điều kiện áp dụng..."/>
                                            </div>

                                            {/* Footer buttons */}
                                            <div className="flex justify-end gap-3 pt-3 border-t">
                                                <button onClick={() => setShowPromoCodeForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Hủy</button>
                                                <button onClick={async () => {
                                                    try {
                                                        const parse = (v) => v===''||v===null||v===undefined ? null : parseFloat(v);
                                                        const parseI = (v) => v===''||v===null||v===undefined ? null : parseInt(v);
                                                        if (editingPromoCode) {
                                                            const upd = { ten:promoCodeForm.ten, moTa:promoCodeForm.moTa, giamToiDa:parse(promoCodeForm.giamToiDa), donHangToiThieu:parse(promoCodeForm.donHangToiThieu), soDemToiThieu:parseI(promoCodeForm.soDemToiThieu), soLanSuDungToiDa:parseI(promoCodeForm.soLanSuDungToiDa), soLanToiDaMoiUser:parseI(promoCodeForm.soLanToiDaMoiUser), ngayKetThuc:promoCodeForm.ngayKetThuc||null };
                                                            await axiosClient.put(`/promotion-codes/${editingPromoCode.id}`, upd);
                                                            showToast('Cập nhật mã khuyến mãi thành công!');
                                                        } else {
                                                            const payload = { code:promoCodeForm.code, ten:promoCodeForm.ten, moTa:promoCodeForm.moTa, loai:promoCodeForm.loai, giaTri:parse(promoCodeForm.giaTri), giamToiDa:parse(promoCodeForm.giamToiDa), donHangToiThieu:parse(promoCodeForm.donHangToiThieu), soDemToiThieu:parseI(promoCodeForm.soDemToiThieu), soLanSuDungToiDa:parseI(promoCodeForm.soLanSuDungToiDa), soLanToiDaMoiUser:parseI(promoCodeForm.soLanToiDaMoiUser), ngayBatDau:promoCodeForm.ngayBatDau||null, ngayKetThuc:promoCodeForm.ngayKetThuc||null, khachSanId:myHotel?.id };
                                                            await axiosClient.post('/promotion-codes', payload);
                                                            showToast('Tạo mã khuyến mãi thành công!');
                                                        }
                                                        setShowPromoCodeForm(false);
                                                        fetchPromoCodes();
                                                    } catch(e) { showToast(e.response?.data?.error || e.response?.data?.message || 'Lỗi lưu mã', 'error'); }
                                                }} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                                    {editingPromoCode ? 'Lưu thay đổi' : 'Tạo Mã'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
