import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

// ── Hotel Card ───────────────────────────────────────────────────────────
const HotelCard = ({ hotel }) => {
  const stars = hotel.soSao || 0;
  const avg = hotel.diemDanhGiaTrungBinh ? Number(hotel.diemDanhGiaTrungBinh).toFixed(1) : null;
  const cover = hotel.hinhAnhBia || hotel.viTri?.hinhAnh || null;

  return (
    <Link to={`/hotels/${hotel.id}`} target="_blank" rel="noopener noreferrer" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="w-full h-52 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 relative flex-shrink-0">
        {cover
          ? <img src={cover} alt={hotel.ten} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">🏨</div>
        }
        {/* Star badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-amber-500 text-xs font-bold px-2 py-1 rounded-lg shadow flex items-center gap-0.5">
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </div>
        {/* Rating badge */}
        {avg && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-bold w-9 h-9 rounded-xl flex items-center justify-center shadow">
            {avg}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{hotel.ten}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
          <span>📍</span>
          <span className="line-clamp-1">{hotel.diaChi}</span>
        </p>
        {hotel.viTri && (
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium w-fit mb-3">
            {hotel.viTri.ten}
          </span>
        )}
        <div className="mt-auto flex items-center justify-between">
          {avg ? (
            <span className="text-xs text-gray-500">⭐ {avg}/5 · {hotel.soLuotDanhGia || 0} đánh giá</span>
          ) : (
            <span className="text-xs text-gray-400 italic">Chưa có đánh giá</span>
          )}
          <span className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">
            Xem →
          </span>
        </div>
      </div>
    </Link>
  );
};

// ── HomePage ─────────────────────────────────────────────────────────────
const HomePage = () => {
  const [flatLocations, setFlatLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [checkIn, setCheckIn]   = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests]     = useState(1);
  const navigate = useNavigate();

  const [hotels, setHotels]           = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [searchedHotels, setSearchedHotels] = useState(null); // null = show all
  const [searching, setSearching]     = useState(false);

  // Load locations tree
  useEffect(() => {
    axiosClient.get('/locations/tree').then(res => {
      const flat = [];
      (res.data || []).forEach(qg => {
        (qg.tinhThanhs || []).forEach(tt => {
          (tt.viTris || []).forEach(vt => {
            flat.push({ id: vt.id, name: `${vt.ten}, ${tt.ten}` });
          });
        });
      });
      setFlatLocations(flat);
    }).catch(() => {});
  }, []);

  // Load all hotels on first render
  useEffect(() => {
    axiosClient.get('/hotels').then(res => {
      setHotels(res.data || []);
    }).catch(() => {}).finally(() => setLoadingHotels(false));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.set('viTriId', selectedLocation);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', guests);
    navigate(`/search?${params.toString()}`);
  };

  const displayedHotels = searchedHotels !== null ? searchedHotels : hotels;

  return (
    <div className="font-sans">
      {/* ── HERO ── */}
      <div className="relative h-[calc(100vh-64px)] min-h-[600px]">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Luxury Hotel Pool"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl tracking-tight">
            Kỳ Nghỉ Trong Mơ<br />Đang Chờ Bạn
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl font-light drop-shadow-lg text-gray-100">
            Hơn 100+ khách sạn sang trọng tại Việt Nam với mức giá ưu đãi độc quyền.
          </p>

          {/* ── Search Bar ── */}
          <div className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 w-full max-w-5xl border border-white/20">
            {/* Điểm đến */}
            <div className="flex-1">
              <label className="block text-left text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">📍 Điểm đến</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
              >
                <option value="">Bạn muốn đi đâu?</option>
                {flatLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Nhận phòng */}
            <div className="flex-1">
              <label className="block text-left text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">🕑 Nhận phòng</label>
              <input
                type="date"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setCheckIn(e.target.value)}
              />
            </div>

            {/* Trả phòng */}
            <div className="flex-1">
              <label className="block text-left text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">🕛 Trả phòng</label>
              <input
                type="date"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={e => setCheckOut(e.target.value)}
              />
            </div>

            {/* Số khách */}
            <div className="w-full md:w-36">
              <label className="block text-left text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">👥 Số khách</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} người</option>)}
              </select>
            </div>

            {/* Tìm kiếm */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={searching}
                className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searching ? 'Đang tìm...' : 'Tìm Kiếm'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '💎', color: 'bg-blue-50 text-blue-600', title: 'Giá Tốt Nhất', desc: 'Đảm bảo giá tốt nhất. Hoàn tiền nếu bạn tìm thấy giá thấp hơn.' },
              { icon: '🛡️', color: 'bg-green-50 text-green-600', title: 'Thanh Toán An Toàn', desc: 'Hệ thống bảo mật tiên tiến bảo vệ thông tin thanh toán của bạn.' },
              { icon: '🎧', color: 'bg-purple-50 text-purple-600', title: 'Hỗ Trợ 24/7', desc: 'Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giải đáp mọi thắc mắc.' },
            ].map(f => (
              <div key={f.title} className="bg-white p-7 rounded-2xl shadow-sm text-center hover:shadow-md transition">
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl`}>{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOTEL LIST ── */}
      <div id="hotel-list" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {searchedHotels !== null ? `🔍 Kết quả tìm kiếm` : '🏨 Khách Sạn Nổi Bật'}
              </h2>
              <p className="text-gray-500 text-sm">
                {searchedHotels !== null
                  ? `Tìm thấy ${displayedHotels.length} khách sạn phù hợp`
                  : 'Những điểm đến được yêu thích nhất'}
              </p>
            </div>
            {searchedHotels !== null && (
              <button onClick={() => setSearchedHotels(null)} className="text-sm text-blue-600 hover:underline font-medium">
                ← Xem tất cả khách sạn
              </button>
            )}
          </div>

          {loadingHotels ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : displayedHotels.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold">Không tìm thấy khách sạn nào</p>
              <p className="text-sm mt-2">Thử điều chỉnh điều kiện tìm kiếm</p>
              <button onClick={() => setSearchedHotels(null)} className="mt-4 text-blue-600 hover:underline text-sm font-medium">
                Xem tất cả khách sạn
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedHotels.map(hotel => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CALL TO ACTION ── */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Sẵn Sàng Cho Kỳ Nghỉ Tiếp Theo?</h2>
        <p className="text-lg mb-8 max-w-xl mx-auto opacity-90">
          Đăng ký thành viên để nhận ưu đãi giảm giá lên đến 50% cho lần đặt phòng đầu tiên.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">
            Đăng Ký Ngay
          </Link>
          <button onClick={() => document.getElementById('hotel-list')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">
            Xem Khách Sạn
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2">BookingKhachSan</h3>
          <p className="text-gray-400 text-sm">© 2026 BookingKhachSan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
