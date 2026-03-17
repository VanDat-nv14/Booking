import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon lỗi của Leaflet khi dùng với module bundler (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Helpers ─────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const today = () => new Date().toISOString().split('T')[0];
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; };
const nights = (a, b) => { if (!a || !b) return 0; const diff = (new Date(b) - new Date(a)) / 86400000; return diff > 0 ? diff : 0; };
const parseTienIch = (csv) => csv ? csv.split(',').map(s => s.trim().replace(/_/g, ' ')) : [];
const fmtDate = (dt) => { if (!dt) return ''; const d = new Date(dt); return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

const AMENITY_ICONS = { 'WiFi': '📶', 'TV': '📺', 'Dieu hoa': '❄️', 'Tu lanh': '🧊', 'Ban cong': '🌇', 'Minibar': '🍹', 'Boi': '🏊', 'Phong khach rieng': '🛋️', 'May pha ca phe': '☕', 'TV 55inch': '📺', 'Dich vu phong 24h': '🔔', 'Nha tam rieng': '🚿' };

const SERVICE_ICONS = {
  'Spa': '💆', 'Massage': '🛁', 'Gym': '🏋️', 'Hồ bơi': '🏊', 'Nhà hàng': '🍽️',
  'Bar': '🍸', 'Sân tennis': '🎾', 'Laundry': '👕', 'Giặt ủi': '👕', 'Đưa đón': '🚗',
  'Cho thuê xe': '🚌', 'Cafe': '☕', 'Wifi': '📶', 'Phòng họp': '💼', 'Điều hòa': '❄️',
};

// Map component handle 
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// ── Sub-components ───────────────────────────────────────────────────────
const StarRating = ({ stars, className = 'text-yellow-400' }) => (
  <span className={`${className} text-lg leading-none`}>
    {Array.from({ length: 5 }, (_, i) => i < stars ? '★' : '☆').join('')}
  </span>
);

const AmenityBadge = ({ name }) => (
  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-100">
    <span>{AMENITY_ICONS[name] || '✓'}</span> {name}
  </span>
);

const PolicyBadge = ({ choPhepHuy, mienPhiHuyTruocGio, phiHuyPct }) => {
  if (!choPhepHuy) return <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">🚫 Không hoàn tiền</span>;
  return (
    <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-1 rounded">
      ✓ Hủy miễn phí trước {mienPhiHuyTruocGio}h {phiHuyPct > 0 && `(Phí hủy muộn: ${phiHuyPct}%)`}
    </span>
  );
};

// ── Image Gallery ────────────────────────────────────────────────────────
const ImageGallery = ({ cover, images = [] }) => {
  const [lightbox, setLightbox] = useState(null);
  const allImages = [cover, ...images.filter(img => img && img !== cover)].filter(Boolean);

  if (allImages.length === 0) {
    return (
      <div className="container mx-auto px-4 mt-6 mb-8">
        <div className="h-64 md:h-[320px] bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center rounded-xl shadow-sm">
          <span className="text-8xl opacity-30">🏨</span>
        </div>
      </div>
    );
  }

  const mainImg = allImages[0];
  const thumbs = allImages.slice(1, 5);

  return (
    <>
      <div className="container mx-auto px-4 mt-6 mb-8">
        {/* Top Section: 1 Main + 2 Side Images */}
        {allImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-64 md:h-80 relative">
            {/* Main large image (left, takes 2/3 width on md+) */}
            <div className={`md:col-span-2 relative h-full w-full overflow-hidden cursor-pointer group bg-gray-100 flex justify-center items-center ${allImages.length > 3 ? 'rounded-t-lg md:rounded-t-none md:rounded-tl-xl' : 'rounded-lg md:rounded-none md:rounded-l-xl'}`}
              onClick={() => setLightbox(0)}>
              <img src={mainImg} alt="Ảnh chính" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
            </div>

            {/* 2 Side Images (right, stacked) */}
            <div className="hidden md:grid grid-rows-2 gap-2 h-full">
              {allImages[1] ? (
                <div className={`relative h-full w-full overflow-hidden cursor-pointer group bg-gray-100 ${allImages.length > 3 ? 'rounded-tr-xl' : 'rounded-tr-xl'}`} onClick={() => setLightbox(1)}>
                  <img src={allImages[1]} alt="Ảnh 2" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-tr-xl h-full w-full" />
              )}
              {allImages[2] ? (
                 <div className={`relative h-full w-full overflow-hidden cursor-pointer group bg-gray-100 ${allImages.length > 3 ? '' : 'rounded-br-xl'}`} onClick={() => setLightbox(2)}>
                   <img src={allImages[2]} alt="Ảnh 3" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
                 </div>
              ) : (
                 <div className={`bg-gray-100 h-full w-full ${allImages.length > 3 ? '' : 'rounded-br-xl'}`} />
              )}
            </div>
            
            {/* View All Button */}
            {allImages.length > 1 && (
              <button 
                onClick={() => setLightbox(0)}
                className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-gray-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all flex items-center gap-2 border border-gray-100 z-10"
              >
                <span className="text-lg leading-none">📸</span> Hiển thị tất cả ảnh
              </button>
            )}
          </div>
        )}

        {/* Bottom Section: Row of Thumbnails (max 5) */}
        {allImages.length > 3 && (
          <div className="grid grid-cols-5 gap-2 mt-2 h-16 md:h-32">
             {allImages.slice(3, 8).map((img, idx) => {
               const actualIdx = idx + 3;
               const isLastVisible = idx === 4;
               const remainingCount = allImages.length - 8;

               return (
                 <div key={actualIdx} className={`relative overflow-hidden cursor-pointer group bg-gray-100 ${idx === 0 ? 'rounded-bl-xl' : ''} ${idx === 4 || actualIdx === allImages.length - 1 ? 'rounded-br-xl' : ''}`}
                   onClick={() => setLightbox(actualIdx)}>
                   <img src={img} alt={`Ảnh ${actualIdx + 1}`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
                   
                   {isLastVisible && remainingCount > 0 && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                       <span className="text-white font-semibold text-sm md:text-base underline underline-offset-4 decoration-2">+{remainingCount} ảnh</span>
                     </div>
                   )}
                 </div>
               )
             })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-6 text-white text-4xl font-light hover:text-gray-300">×</button>
          <button className="absolute left-4 text-white text-5xl font-light hover:text-gray-300 px-3" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + allImages.length) % allImages.length); }}>‹</button>
          <img src={allImages[lightbox]} alt="lightbox" className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 text-white text-5xl font-light hover:text-gray-300 px-3" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % allImages.length); }}>›</button>
          <div className="absolute bottom-4 text-white/70 text-sm">{lightbox + 1} / {allImages.length}</div>
        </div>
      )}
    </>
  );
};

// ── Reviews Section ──────────────────────────────────────────────────────
const ReviewsSection = ({ reviews = [], avgScore, totalReviews }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 6);

  const scoreLabel = (s) => {
    if (s >= 4.5) return { label: 'Xuất sắc', color: 'text-emerald-600 bg-emerald-50' };
    if (s >= 4.0) return { label: 'Rất tốt', color: 'text-blue-600 bg-blue-50' };
    if (s >= 3.0) return { label: 'Tốt', color: 'text-indigo-600 bg-indigo-50' };
    return { label: 'Trung bình', color: 'text-orange-600 bg-orange-50' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Đánh Giá Khách Hàng</h2>
          {avgScore > 0 && (
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold px-3 py-1 rounded-xl ${scoreLabel(avgScore).color}`}>
                {Number(avgScore).toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm">{scoreLabel(avgScore).label} · {totalReviews} đánh giá</span>
            </div>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">💬</div>
          <p className="font-medium">Chưa có đánh giá nào</p>
          <p className="text-sm mt-1">Hãy là người đầu tiên đánh giá khách sạn này!</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {visible.map((r) => {
              const initial = (r.tenKhach || 'K').charAt(0).toUpperCase();
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500'];
              const colorIdx = r.id % colors.length;
              return (
                <div key={r.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full ${colors[colorIdx]} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{r.tenKhach}</p>
                      <p className="text-xs text-gray-400">{fmtDate(r.ngayDanhGia)}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <StarRating stars={r.soSaoTong} className="text-amber-400 text-sm" />
                      <span className="text-xs text-gray-500 font-medium ml-0.5">{r.soSaoTong}/5</span>
                    </div>
                  </div>
                  {r.binhLuan && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">"{r.binhLuan}"</p>
                  )}
                </div>
              );
            })}
          </div>
          {reviews.length > 6 && (
            <button onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              {showAll ? '▲ Thu gọn' : `▼ Xem thêm ${reviews.length - 6} đánh giá`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

// ── Services Section ─────────────────────────────────────────────────────
const ServicesSection = ({ services = [] }) => {
  if (services.length === 0) return null;
  const getIcon = (name) => {
    for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
      if (name.toLowerCase().includes(key.toLowerCase())) return icon;
    }
    return '🔷';
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🛎️ Dịch Vụ Khách Sạn</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(dv => (
          <div key={dv.id} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 border border-blue-100">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{getIcon(dv.ten)}</span>
              <span className="text-gray-800 text-sm font-medium">{dv.ten}</span>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-blue-700 font-bold text-sm">{fmt(dv.giaTien)}</p>
              {dv.donViTinh && <p className="text-xs text-gray-400">/{dv.donViTinh}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);

  const [checkIn, setCheckIn]   = useState(today());
  const [checkOut, setCheckOut] = useState(tomorrow());
  const [guests, setGuests]     = useState(1);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [searching, setSearching]           = useState(false);
  const [searched, setSearched]             = useState(false);

  const [selectedRoom, setSelectedRoom]   = useState(null);
  const [bookingMethod, setBookingMethod] = useState('RequestToBook');
  const [payMethod, setPayMethod]         = useState('TienMat');
  const [guestNote, setGuestNote]         = useState('');
  const [booking, setBooking]             = useState(false);
  const [toastMsg, setToastMsg]           = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  // Active tab (info / rooms / reviews)
  const [activeTab, setActiveTab] = useState('info');
  const roomsRef = useRef(null);

  useEffect(() => {
    axiosClient.get(`/hotels/${id}/details`)
      .then(r => setHotel(r.data))
      .catch(() => setHotel(null))
      .finally(() => setLoadingHotel(false));
  }, [id]);

  const searchRooms = useCallback(async () => {
    if (!checkIn || !checkOut || nights(checkIn, checkOut) < 1) {
      showToast('Ngày đến phải trước ngày đi!', 'error'); return;
    }
    setSearching(true);
    setSelectedRoom(null);
    try {
      const res = await axiosClient.get(`/hotels/${id}/available-rooms`, { params: { checkIn, checkOut } });
      const rooms = (res.data || []).filter(r => r.soKhach >= guests);
      setAvailableRooms(rooms);
      setSearched(true);
      setActiveTab('rooms');
      if (rooms.length === 0) showToast('Không còn phòng trống trong khoảng thời gian này.', 'warn');
      else setTimeout(() => roomsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {
      showToast('Lỗi khi tìm phòng. Vui lòng thử lại.', 'error');
    } finally {
      setSearching(false);
    }
  }, [id, checkIn, checkOut, guests]);

  const handleBook = async () => {
    if (!user) { navigate('/login', { state: { from: window.location.pathname } }); return; }
    if (!selectedRoom) { showToast('Vui lòng chọn phòng!', 'error'); return; }
    setBooking(true);
    try {
      const res = await axiosClient.post('/bookings/create', {
        phongId: selectedRoom.phongId,
        nguoiDungId: parseInt(user.userId),
        ngayDen: checkIn,
        ngayDi: checkOut,
        loaiDatPhong: bookingMethod,
        phuongThucThanhToan: payMethod,
        soNguoiLon: guests,
        ghiChuKhach: guestNote || null,
      });
      // Nếu thanh toán online (VNPAY / MoMo) → chuyển sang bước thanh toán, chưa hiển thị màn hoàn tất
      if (payMethod === 'VNPAY' || payMethod === 'MoMo') {
        navigate(`/booking?bookingId=${res.data.id}&method=${payMethod}`);
        return;
      }
      // Các phương thức khác: hiển thị màn hình đặt phòng thành công như hiện tại
      setBookingResult(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.error || 'Đặt phòng thất bại!', 'error');
    } finally {
      setBooking(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const soNgay = nights(checkIn, checkOut);

  // ── Loading / Error States ───────────────────────────────────────────
  if (loadingHotel) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Đang tải thông tin khách sạn...</p>
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 bg-gray-50">
      <span className="text-7xl mb-4">🔍</span>
      <p className="text-xl font-semibold">Không tìm thấy khách sạn</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 hover:underline text-sm">← Quay lại</button>
    </div>
  );

  // ── Booking Success Screen ───────────────────────────────────────────
  if (bookingResult) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt Phòng Thành Công!</h2>
        <p className="text-gray-500 mb-6">Mã đặt phòng của bạn</p>
        <div className="bg-blue-50 rounded-xl px-6 py-4 mb-6">
          <p className="font-mono text-2xl font-bold text-blue-700">{bookingResult.maDatPhong}</p>
          <p className="text-sm text-gray-500 mt-1">{bookingResult.tenPhong} · {bookingResult.soNgay} đêm</p>
          <p className="text-lg font-semibold text-gray-800 mt-2">{fmt(bookingResult.thanhTien)}</p>
        </div>
        <div className={`text-sm font-medium px-3 py-1.5 rounded-full inline-block mb-6
          ${bookingResult.trangThai === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {bookingResult.trangThai === 'Confirmed' ? '✓ Đã xác nhận' : '⏳ Chờ khách sạn xác nhận'}
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
            ← Trang chủ
          </button>
          <button onClick={() => navigate('/user/profile')} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium">
            Xem đặt phòng
          </button>
        </div>
      </div>
    </div>
  );

  // ── Computed ─────────────────────────────────────────────────────────
  const BACKEND = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
  const toFullUrl = (url) => url && (url.startsWith('http') ? url : BACKEND + url);
  const avgScore = hotel.diemDanhGiaTrungBinh ? Number(hotel.diemDanhGiaTrungBinh) : 0;

  // ── Main Render ──────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen pb-24">

      {/* ── Hero: Image Gallery ── */}
      <div className="relative">
        <ImageGallery cover={toFullUrl(hotel.hinhAnhBia)} images={(hotel.hinhAnhs || []).map(toFullUrl)} />

        {/* Back button overlay */}
        <button onClick={() => navigate(-1)}
          className="absolute top-10 left-8 z-20 bg-white/90 backdrop-blur text-gray-700 hover:bg-white rounded-full px-4 py-2 text-sm font-semibold shadow-md transition flex items-center gap-1.5 border border-gray-100">
          ← Quay lại
        </button>
      </div>

      {/* ── Hotel Header ── */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex-1">
              {/* Stars + Status */}
              <div className="flex items-center gap-2 mb-1">
                <StarRating stars={hotel.soSao} className="text-amber-400 text-xl" />
                <span className="text-sm text-gray-400">({hotel.soSao} sao)</span>
                {hotel.trangThai && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    ● {hotel.trangThai}
                  </span>
                )}
              </div>
              {/* Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{hotel.ten}</h1>
              {/* Location breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                <span>📍</span>
                {hotel.tenQuocGia && <span>{hotel.tenQuocGia}</span>}
                {hotel.tenTinhThanh && <><span className="text-gray-300">›</span><span>{hotel.tenTinhThanh}</span></>}
                {hotel.tenViTri && <><span className="text-gray-300">›</span><span className="text-blue-600 font-medium">{hotel.tenViTri}</span></>}
                <span className="text-gray-300">·</span>
                <span>{hotel.diaChi}</span>
              </div>
            </div>
            {/* Rating badge */}
            {avgScore > 0 && (
              <div className="flex flex-col items-center bg-blue-600 text-white rounded-2xl px-5 py-3 flex-shrink-0 shadow-lg">
                <span className="text-3xl font-extrabold leading-none">{avgScore.toFixed(1)}</span>
                <span className="text-xs mt-0.5 opacity-90">/ 5.0</span>
                <div className="flex mt-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`text-sm ${i < Math.round(avgScore) ? 'text-yellow-300' : 'text-blue-400'}`}>★</span>
                  ))}
                </div>
                <span className="text-xs mt-1 opacity-80">{hotel.soLuotDanhGia || 0} đánh giá</span>
              </div>
            )}
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {hotel.gioNhanPhong && (
              <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                🕑 Nhận phòng: <strong>{hotel.gioNhanPhong}</strong>
              </span>
            )}
            {hotel.gioTraPhong && (
              <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                🕛 Trả phòng: <strong>{hotel.gioTraPhong}</strong>
              </span>
            )}
            {(hotel.dichVus || []).length > 0 && (
              <span className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium border border-purple-100">
                🛎️ {hotel.dichVus.length} dịch vụ
              </span>
            )}
            {(hotel.danhGias || []).length > 0 && (
              <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-medium border border-amber-100">
                ⭐ {hotel.danhGias.length} đánh giá
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav Tabs ── */}
      <div className="bg-white shadow-xs border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {[
              { key: 'info', label: 'Giới thiệu' },
              { key: 'rooms', label: `Phòng trống${searched ? ` (${availableRooms.length})` : ''}` },
              { key: 'services', label: 'Dịch vụ' },
              { key: 'reviews', label: `Đánh giá${hotel.soLuotDanhGia ? ` (${hotel.soLuotDanhGia})` : ''}` },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => { setActiveTab(tab.key); document.getElementById(`tab-${tab.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 mt-6 grid lg:grid-cols-3 gap-6">

        {/* LEFT: Content Sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <div id="tab-info" className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">📝 Giới thiệu khách sạn</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {hotel.moTa || `Trải nghiệm kỳ nghỉ tuyệt vời tại ${hotel.ten}. Chúng tôi cung cấp dịch vụ đẳng cấp quốc tế với không gian sang trọng và tiện nghi hiện đại, mang lại cho bạn những khoảnh khắc đáng nhớ nhất.`}
            </p>
            {/* Check-in/out detail */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">Nhận phòng</p>
                <p className="text-xl font-bold text-blue-700">{hotel.gioNhanPhong || '--:--'}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-1">Trả phòng</p>
                <p className="text-xl font-bold text-orange-600">{hotel.gioTraPhong || '--:--'}</p>
              </div>
            </div>

            {/* Vị trí trên bản đồ */}
            {hotel.viDo && hotel.kinhDo ? (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📍</span> Vị trí trên bản đồ
                </h3>
                <div 
                  className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative group h-[200px] cursor-pointer"
                  onClick={() => navigate(`/hotels/map?hotelId=${hotel.id}`)}
                >
                  <MapContainer 
                    center={[hotel.viDo, hotel.kinhDo]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }} 
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[hotel.viDo, hotel.kinhDo]} />
                  </MapContainer>
                  
                  {/* Overlay for clicking */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-[1000] flex items-center justify-center">
                    <button className="bg-blue-600 font-semibold text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-blue-700 transition transform group-hover:scale-105 pointer-events-none">
                       Hiển thị trên bản đồ
                    </button>
                  </div>
                </div>
              </div>
            ) : hotel.diaChi ? (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📍</span> Vị trí trên bản đồ
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center flex flex-col items-center">
                  <span className="text-4xl mb-2 grayscale opacity-50">🗺️</span>
                  <p className="text-sm font-medium text-gray-600 mb-3">Đã có địa chỉ nhưng chưa được ghim toạ độ trên bản đồ số.</p>
                  <button onClick={() => navigate('/hotels/map')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 bg-white px-4 py-2 rounded-lg transition">
                     Mở bản đồ khách sạn chung
                  </button>
                </div>
              </div>
            ) : null}
           </div>

          {/* Search Bar */}
          <div id="tab-rooms" className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🔍 Tìm Phòng Trống</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày đến</label>
                <input type="date" value={checkIn} min={today()}
                  onChange={e => { setCheckIn(e.target.value); setSearched(false); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày đi</label>
                <input type="date" value={checkOut} min={checkIn || today()}
                  onChange={e => { setCheckOut(e.target.value); setSearched(false); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Số khách</label>
                <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} người</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={searchRooms} disabled={searching}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold transition disabled:opacity-60">
                  {searching ? 'Đang tìm...' : 'Tìm phòng'}
                </button>
              </div>
            </div>
            {soNgay > 0 && (
              <p className="text-xs text-gray-400 mt-2">📅 Tổng: <strong className="text-gray-600">{soNgay} đêm</strong></p>
            )}
          </div>

          {/* Available Room Cards */}
          {searched && (
            <div ref={roomsRef}>
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                {availableRooms.length > 0
                  ? `🛏️ ${availableRooms.length} phòng trống · ${soNgay} đêm`
                  : '😔 Không có phòng trống'}
              </h2>
              <div className="space-y-4">
                {availableRooms.map(room => {
                  const isSelected = selectedRoom?.phongId === room.phongId;
                  const amenities = parseTienIch(room.tienIch);
                  return (
                    <div key={room.phongId}
                      className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-200'}`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Room image */}
                        <div className="w-full md:w-52 h-44 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {room.hinhAnh
                            ? <img src={room.hinhAnh} alt={room.tenLoaiPhong} className="w-full h-full object-contain" />
                            : <span className="text-5xl">🛏️</span>
                          }
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800">{room.tenLoaiPhong}</h3>
                              <p className="text-sm text-gray-500 mt-0.5">
                                Phòng {room.soPhong || room.maPhong}
                                {room.tang && ` · Tầng ${room.tang}`}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                                {room.dienTich && <span>📐 {room.dienTich} m²</span>}
                                {room.soGiuong && <span>🛏 {room.soGiuong} giường {room.loaiGiuong}</span>}
                                {room.soKhach && <span>👥 Tối đa {room.soKhach} khách</span>}
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {amenities.slice(0, 5).map(a => <AmenityBadge key={a} name={a} />)}
                                {amenities.length > 5 && (
                                  <span className="text-xs text-gray-400">+{amenities.length - 5} nữa</span>
                                )}
                              </div>
                              <div className="mt-2">
                                <PolicyBadge
                                  choPhepHuy={room.choPhepHuy}
                                  mienPhiHuyTruocGio={room.mienPhiHuyTruocGio}
                                  phiHuyPct={room.phiHuyPct}
                                />
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-gray-400">1 đêm</p>
                              <p className="text-2xl font-bold text-blue-600">{fmt(room.giaTheoNgay || room.giaTien)}</p>
                              {soNgay > 1 && (
                                <p className="text-sm text-gray-500 mt-0.5">Tổng: {fmt(room.tongTienDuTinh)}</p>
                              )}
                              <button
                                onClick={() => setSelectedRoom(isSelected ? null : room)}
                                className={`mt-3 px-5 py-2 rounded-xl font-semibold text-sm transition ${
                                  isSelected
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                                }`}>
                                {isSelected ? '✓ Đã chọn' : 'Chọn phòng'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Services */}
          <div id="tab-services">
            <ServicesSection services={hotel.dichVus || []} />
          </div>

          {/* Reviews */}
          <div id="tab-reviews">
            <ReviewsSection
              reviews={hotel.danhGias || []}
              avgScore={avgScore}
              totalReviews={hotel.soLuotDanhGia || 0}
            />
          </div>

        </div>

        {/* RIGHT: Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
            <h3 className="text-lg font-bold text-gray-800 mb-5 text-center">📋 Đặt Phòng</h3>

            {/* Quick search in sidebar */}
            {!searched && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl text-center text-sm text-blue-700">
                <p className="font-medium">Chọn ngày để xem phòng trống</p>
                <button onClick={searchRooms} disabled={searching}
                  className="mt-2 bg-blue-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold">
                  {searching ? 'Đang tìm...' : '🔍 Tìm phòng ngay'}
                </button>
              </div>
            )}

            {/* Room summary */}
            {selectedRoom ? (
              <div className="bg-blue-50 rounded-xl p-4 mb-5 space-y-2">
                <p className="font-semibold text-blue-800">{selectedRoom.tenLoaiPhong}</p>
                <p className="text-sm text-gray-600">Phòng {selectedRoom.soPhong || selectedRoom.maPhong}</p>
                <div className="border-t border-blue-100 pt-2 mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nhận phòng</span>
                    <span className="font-medium">{checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trả phòng</span>
                    <span className="font-medium">{checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số đêm</span>
                    <span className="font-medium">{soNgay} đêm</span>
                  </div>
                </div>
                <div className="border-t border-blue-100 pt-2 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Tổng dự kiến</span>
                  <span className="text-xl font-bold text-blue-700">{fmt(selectedRoom.tongTienDuTinh)}</span>
                </div>
                {/* Deposit Info */}
                {selectedRoom.tienCocDuTinh > 0 && (
                  <div className="border-t border-orange-100 pt-2 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-orange-700">💰 Tiền cọc ({selectedRoom.tiLeCocKhachSan}%)</span>
                      <span className="text-base font-bold text-orange-600">{fmt(selectedRoom.tienCocDuTinh)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Áp dụng cho mọi hình thức thanh toán. Số còn lại thanh toán tại khách sạn.</p>
                  </div>
                )}
                <PolicyBadge
                  choPhepHuy={selectedRoom.choPhepHuy}
                  mienPhiHuyTruocGio={selectedRoom.mienPhiHuyTruocGio}
                  phiHuyPct={selectedRoom.phiHuyPct}
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 mb-5 text-center text-gray-400">
                <span className="text-3xl block mb-2">🛏️</span>
                <p className="text-sm">Tìm phòng và chọn để đặt</p>
              </div>
            )}



            {/* Payment method */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Phương thức thanh toán</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                <option value="TienMat">💵 Tiền mặt tại quầy</option>
                <option value="ChuyenKhoan">🏦 Chuyển khoản ngân hàng</option>
                <option value="VNPAY">📱 VNPAY</option>
                <option value="MoMo">💜 MoMo</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Ghi chú (tuỳ chọn)</label>
              <textarea rows={2} value={guestNote} onChange={e => setGuestNote(e.target.value)}
                placeholder="Yêu cầu đặc biệt, giờ đến dự kiến..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>

            {/* Book button */}
            {user ? (
              <button onClick={handleBook}
                disabled={!selectedRoom || booking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {booking ? 'Đang xử lý...' : '🏨 Đặt Phòng Ngay'}
              </button>
            ) : (
              <button onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
                Đăng nhập để đặt phòng
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">🔒 Thông tin được bảo mật an toàn</p>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm animate-bounce
          ${toastMsg.type === 'error' ? 'bg-red-500' : toastMsg.type === 'warn' ? 'bg-amber-500' : 'bg-green-600'}`}>
          {toastMsg.msg}
        </div>
      )}
    </div>
  );
};

export default HotelDetailPage;
