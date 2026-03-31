import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import { IconBuilding, IconMapPin, IconSparkles, IconShield, IconHeadset, IconStar, IconSearch } from '../components/icons/UiIcons';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const BACKEND = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';

// ── Motion Variants ────────────────────────────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

// ── Hotel Card ───────────────────────────────────────────────────────────
const HotelCard = ({ hotel }) => {
  const stars = hotel.soSao || 0;
  const avg = hotel.diemDanhGiaTrungBinh ? Number(hotel.diemDanhGiaTrungBinh).toFixed(1) : null;
  const rawCover = hotel.hinhAnhBia || hotel.viTri?.hinhAnh || null;
  const cover = rawCover && !rawCover.startsWith('http') && !rawCover.startsWith('data:') ? BACKEND + rawCover : rawCover;

  return (
    <motion.div variants={fadeInUp} className="group h-full min-h-0 relative">
      <Link to={`/hotels/${hotel.id}`} className="bg-white rounded-3xl shadow-soft ring-1 ring-slate-200/50 hover:shadow-card hover:ring-brand-200/80 transition-all duration-300 overflow-hidden flex flex-col h-full min-h-0 block translate-y-0 hover:-translate-y-1">
        
        {/* Image */}
        <div className="w-full h-56 shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-brand-50 relative flex items-center justify-center">
          {cover ? (
            <img
              src={cover}
              alt={hotel.ten}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out z-10"
              loading="lazy"
              decoding="async"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.querySelector('.img-fallback')?.classList.remove('hidden'); }}
            />
          ) : null}
          <span className={`img-fallback ${cover ? 'hidden' : ''} z-0 text-slate-400`} aria-hidden>
            <IconBuilding className="w-16 h-16 mx-auto opacity-40" />
          </span>
          
          {/* Top badges */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar key={i} className={`w-3.5 h-3.5 ${i < stars ? 'text-amber-500' : 'text-slate-300'}`} />
              ))}
            </div>
          </div>
          {avg && (
            <div className="absolute top-4 right-4 z-20 bg-brand-600/90 backdrop-blur-md text-white text-sm font-bold px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1">
              <IconStar className="w-3.5 h-3.5" />
              {avg}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col min-h-0 bg-white">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 text-lg mb-1.5 line-clamp-1 group-hover:text-brand-600 transition-colors">
              {hotel.ten}
            </h3>
            <p className="text-sm text-slate-500 flex items-start gap-1.5">
              <IconMapPin className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
              <span className="line-clamp-2 leading-snug">{hotel.diaChi}</span>
            </p>
          </div>
          
          {hotel.viTri && (
            <div className="mb-4">
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium inline-block">
                {hotel.viTri.ten}
              </span>
            </div>
          )}
          
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex flex-col">
              {avg ? (
                <>
                  <span className="font-medium text-slate-700">{hotel.soLuotDanhGia || 0} bài đánh giá</span>
                  <span>Được yêu thích</span>
                </>
              ) : (
                <span className="italic">Chưa có đánh giá</span>
              )}
            </div>
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium group-hover:bg-brand-600 transition-colors shadow-sm flex items-center gap-1.5">
              Chi tiết
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── HomePage ─────────────────────────────────────────────────────────────
const HomePage = () => {
  const [flatLocations, setFlatLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
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
    }).catch(() => {}).finally(() => setLoadingLocations(false));
  }, []);

  // Load first 12 hotels
  useEffect(() => {
    axiosClient.get('/hotels/public', { params: { limit: 12 } }).then(res => {
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
    <div className="font-sans antialiased selection:bg-brand-200 selection:text-brand-900">
      
      {/* ── HERO ── */}
      <div className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src="/images/hero-bg.png"
            alt="Luxury Hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-slate-950/80" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 w-full flex flex-col items-center">
          <motion.div 
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="text-center w-full max-w-5xl"
          >
            <motion.p variants={fadeInUp} className="text-brand-200 text-sm font-semibold uppercase tracking-[0.25em] mb-4">
              Khám Phá Thế Giới
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-balance text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-xl text-white">
              Kỳ nghỉ hoàn hảo<br className="hidden sm:block" />
              <span className="text-slate-200 font-light italic"> bắt đầu từ đây</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl mb-12 max-w-2xl mx-auto font-normal text-slate-200/90 leading-relaxed">
              Trải nghiệm dịch vụ đẳng cấp 5 sao với hàng ngàn khách sạn, resort trên toàn quốc. Đặt phòng nhanh chóng chỉ trong vài thao tác.
            </motion.p>

            {/* ── Glassmorphism Search Bar ── */}
            <motion.div variants={scaleIn} className="glass-dark p-2 sm:p-3 rounded-full flex flex-col md:flex-row gap-2 w-full mx-auto relative z-20">
              
              {/* Điểm đến */}
              <div className="flex-1 min-w-0 bg-white/10 hover:bg-white/20 transition-colors rounded-[2rem] px-5 py-3 flex items-center gap-3">
                <IconMapPin className="w-5 h-5 text-brand-300" />
                <div className="flex-1 text-left">
                  <label className="block text-white/70 text-[10px] uppercase font-bold tracking-wider mb-0.5">Địa điểm</label>
                  <select
                    className="w-full bg-transparent text-white font-medium focus:outline-none appearance-none cursor-pointer truncate text-sm sm:text-base outline-none border-none ring-0 [&>option]:text-slate-900"
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    disabled={loadingLocations}
                  >
                    <option value="">{loadingLocations ? 'Đang tải...' : 'Bạn muốn đi đâu?'}</option>
                    {flatLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-white/10 self-center"></div>

              {/* Nhận phòng */}
              <div className="flex-1 min-w-0 bg-white/10 hover:bg-white/20 transition-colors rounded-[2rem] px-5 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <div className="flex-1 text-left">
                  <label className="block text-white/70 text-[10px] uppercase font-bold tracking-wider mb-0.5">Nhận phòng</label>
                  <input
                    type="date"
                    className="w-full bg-transparent text-white font-medium focus:outline-none text-sm sm:text-base outline-none border-none ring-0 cursor-pointer [color-scheme:dark]"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setCheckIn(e.target.value)}
                  />
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-white/10 self-center"></div>

              {/* Trả phòng */}
              <div className="flex-1 min-w-0 bg-white/10 hover:bg-white/20 transition-colors rounded-[2rem] px-5 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <div className="flex-1 text-left">
                  <label className="block text-white/70 text-[10px] uppercase font-bold tracking-wider mb-0.5">Trả phòng</label>
                  <input
                    type="date"
                    className="w-full bg-transparent text-white font-medium focus:outline-none text-sm sm:text-base outline-none border-none ring-0 cursor-pointer [color-scheme:dark]"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    onChange={e => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-white/10 self-center"></div>

              {/* Số khách */}
              <div className="w-full md:w-32 min-w-0 bg-white/10 hover:bg-white/20 transition-colors rounded-[2rem] px-5 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <div className="flex-1 text-left cursor-pointer">
                  <label className="block text-white/70 text-[10px] uppercase font-bold tracking-wider mb-0.5">Số khách</label>
                  <select
                    className="w-full bg-transparent text-white font-medium focus:outline-none appearance-none cursor-pointer outline-none border-none ring-0 [&>option]:text-slate-900 text-sm sm:text-base"
                    value={guests}
                    onChange={e => setGuests(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} người</option>)}
                  </select>
                </div>
              </div>

              {/* TÌm kiếm Button */}
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="w-full md:w-auto bg-brand-600 text-white px-8 py-4 rounded-full font-bold hover:bg-brand-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 shrink-0"
              >
                <IconSearch className="w-5 h-5" />
                {searching ? 'Đang tìm...' : 'Tìm'}
              </button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/70">
          <span className="text-[10px] uppercase font-bold tracking-widest mb-2">Cuộn</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="py-20 sm:py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 lg:gap-12"
          >
            {[
              { Icon: IconSparkles, color: 'text-brand-600 bg-brand-50', title: 'Sang Trọng & Đẳng Cấp', desc: 'Lựa chọn hàng đầu các khách sạn và khu nghỉ dưỡng tiêu chuẩn 5 sao.' },
              { Icon: IconShield, color: 'text-emerald-600 bg-emerald-50', title: 'Thanh Toán An Toàn', desc: 'Bảo mật tuyệt đối cùng các đối tác cổng thanh toán uy tín hàng đầu.' },
              { Icon: IconHeadset, color: 'text-violet-600 bg-violet-50', title: 'Hỗ Trợ Tận Tâm 24/7', desc: 'Đội ngũ chuyên nghiệp luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào.' },
            ].map((f, i) => {
              const FeatIcon = f.Icon;
              return (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 text-center"
              >
                <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <FeatIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{f.desc}</p>
              </motion.div>
            );})}
          </motion.div>
        </div>
      </div>

      {/* ── HOTEL LIST ── */}
      <div id="hotel-list" className="py-20 sm:py-28 bg-slate-50/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600 mb-3">ĐIỂM ĐẾN YÊU THÍCH</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 font-display">
                {searchedHotels !== null ? 'Kết quả tìm kiếm' : 'Lựa Chọn Hàng Đầu'}
              </h2>
              <p className="text-slate-500 text-base max-w-2xl">
                {searchedHotels !== null
                  ? `Tìm thấy ${displayedHotels.length} khách sạn phù hợp với yêu cầu của bạn.`
                  : 'Cùng chúng tôi khám phá những không gian nghỉ dưỡng tuyệt vời nhất được bình chọn bởi cộng đồng.'}
              </p>
            </div>
            {searchedHotels !== null && (
              <button type="button" onClick={() => setSearchedHotels(null)} className="text-sm bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:text-brand-600 font-medium transition-colors shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Trở lại danh sách nổi bật
              </button>
            )}
          </div>

          {loadingHotels ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-white rounded-3xl h-[380px] w-full p-2 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
                  <div className="bg-slate-100 rounded-[1.5rem] w-full h-[55%] animate-pulse" />
                  <div className="px-3 flex flex-col gap-3">
                    <div className="h-5 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-1/3 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedHotels.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-28 bg-white rounded-3xl shadow-sm border border-slate-100"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconSearch className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy khách sạn</p>
              <p className="text-base text-slate-500 mb-6">Thử thay đổi địa điểm hoặc ngày nhận phòng đễ có thêm nhiều lựa chọn.</p>
              <button type="button" onClick={() => setSearchedHotels(null)} className="px-6 py-3 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl font-bold transition-colors">
                Xem tất cả khách sạn
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch"
            >
              <AnimatePresence>
                {displayedHotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
        <div className="border-b border-slate-800/80 py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 text-center">Đối Tác Đồng Hành</p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
              {['VNPay', 'MoMo', 'Agoda', 'Vietnam Airlines'].map(s => (
                <div key={s} className="opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer text-xl font-extrabold font-display">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="py-10">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-1 text-white">LuxeStay</h3>
              <p className="text-slate-500 text-sm">© {new Date().getFullYear()} LuxeStay. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Chính sách</a>
              <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-white transition-colors">Trợ giúp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
