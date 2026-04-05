import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { resolveHotelImageUrl } from '../utils/hotelImages';
import {
  IconBuilding,
  IconMapPin,
  IconStar,
  IconShield,
  IconClock,
  IconCalendar,
  IconSparkles,
  IconAlert,
  IconSearch,
  IconInfo,
  IconUsers,
} from '../components/icons/UiIcons';

// Fix icon lỗi của Leaflet khi dùng với module bundler (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Helpers ─────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
/** YYYY-MM-DD theo giờ địa phương — tránh lệch ngày so với `<input type="date">` khi dùng `toISOString()` (UTC). */
const toLocalYmd = (d) => {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const today = () => toLocalYmd(new Date());
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toLocalYmd(d);
};
const nights = (a, b) => { if (!a || !b) return 0; const diff = (new Date(b) - new Date(a)) / 86400000; return diff > 0 ? diff : 0; };
const parseTienIch = (csv) => csv ? csv.split(',').map(s => s.trim().replace(/_/g, ' ')) : [];
const fmtDate = (dt) => { if (!dt) return ''; const d = new Date(dt); return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

const wordCountVi = (s) => ((s || '').trim().split(/\s+/).filter(Boolean).length);

/** Hiển thị một dòng ưu đãi (API /coupons/public) */
const offerLabel = (o) => {
  if (!o) return '';
  if (o.loai === 'PERCENT') return `Giảm ${o.giaTri}%`;
  return `Giảm ${fmt(Number(o.giaTri || 0))}`;
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
const StarRating = ({ stars, className = '', small }) => (
  <span className={`inline-flex items-center gap-0.5 ${className}`}>
    {Array.from({ length: 5 }, (_, i) => (
      <IconStar key={i} className={`${small ? 'w-3.5 h-3.5' : 'w-4 h-4 md:w-5 md:h-5'} ${i < stars ? 'text-amber-400' : 'text-slate-200'}`} />
    ))}
  </span>
);

const AMENITY_ICONS = {
  'wifi': '📶', 'wi-fi': '📶', 'wifi mien phi': '📶',
  'tv': '📺', 'tv man hinh phang': '📺', 'tv 55inch': '📺', 'truyen hinh cap': '📺',
  'dieu hoa': '❄️', 'dieu hoa khong khi': '❄️',
  'nha tam rieng': '🚿', 'phong tam rieng': '🚿', 'voi sen': '🚿',
  'boi': '🏊', 'ho boi': '🏊',
  'minibar': '🍷', 'tu lanh': '🧊',
  'phong khach rieng': '🛋️', 'khu vuc tiep khach': '🛋️',
  'ban lam viec': '💻', 'ban an': '🍽️',
  'gia treo quan ao': '🧥', 'tu hoac phong de quan ao': '🧥',
  'khan tam': '🛁', 'do ve sinh ca nhan mien phi': '🧴',
  'san lat gach': '🪟', 'san lat gach/da cam thach': '🪟',
  'tam nhin ra khung canh': '🌅', 'tam nhin bien': '🌊',
  'dien thoai': '📞', 'ket an toan': '🔒',
  'may say toc': '💇', 'ban ui': '🧺',
  'quat may': '🌀', 'may nuoc nong': '♨️',
  'giu xe mien phi': '🅿️', 'dich vu phong': '🛎️',
};

const getAmenityIcon = (name) => {
  const key = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  for (const [k, icon] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return '✓';
};

const AmenityBadge = ({ name }) => (
  <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 text-xs px-2.5 py-1 rounded-full border border-slate-200/80">
    <span className="shrink-0">{getAmenityIcon(name)}</span>
    {name}
  </span>
);

const AmenityList = ({ amenities }) => {
  const SHOW = 5;
  const [expanded, setExpanded] = useState(false);
  if (!amenities || amenities.length === 0) return null;
  const visible = expanded ? amenities : amenities.slice(0, SHOW);
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5">
        {visible.map(a => <AmenityBadge key={a} name={a} />)}
      </div>
      {amenities.length > SHOW && (
        <button type="button"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          className="mt-2 text-xs text-blue-600 hover:underline">
          {expanded ? 'Thu gọn' : `+${amenities.length - SHOW} tiện ích khác`}
        </button>
      )}
      {expanded && (
        <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-1">
          {amenities.map(a => (
            <span key={a} className="text-xs text-gray-600 flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span> {a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const PolicyBadge = ({ choPhepHuy, mienPhiHuyTruocGio, phiHuyPct }) => {
  if (!choPhepHuy) return <span className="text-xs text-red-700 font-medium bg-red-50 px-2 py-1 rounded border border-red-100">Không hoàn tiền</span>;
  return (
    <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
      Hủy miễn phí trước {mienPhiHuyTruocGio}h{phiHuyPct > 0 ? ` (Phí hủy muộn: ${phiHuyPct}%)` : ''}
    </span>
  );
};

// Placeholder khi ảnh load lỗi
const IMG_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="13"%3E%C4%A2nh kh%C3%B4ng t%E1%BA%A3i%3C/text%3E%3C/svg%3E';

// ── Image Gallery ────────────────────────────────────────────────────────
const ImageGallery = ({ cover, images = [] }) => {
  const [lightbox, setLightbox] = useState(null);
  const [lightboxImgFailed, setLightboxImgFailed] = useState(false);
  const BACKEND = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    setLightboxImgFailed(false);
  }, [lightbox]);

  // Khi lightbox mở, chặn scroll trang
  useEffect(() => {
    if (lightbox !== null) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  const getFullUrl = (url) => {
    if (!url) return null;
    return (url.startsWith('http') || url.startsWith('data:')) ? url : BACKEND + url;
  };

  const rawImages = [cover, ...(images || []).filter(img => img && img !== cover)].filter(Boolean);
  const allImages = rawImages.map(getFullUrl);

  // Slot ảnh chuẩn — luôn có tỉ lệ aspect cố định, không bao giờ bị vỡ
  const Slot = ({ src, idx, className = '', roundClass = '' }) => (
    <div
      className={`relative overflow-hidden bg-slate-100 cursor-pointer group ${roundClass} ${className}`}
      onClick={() => setLightbox(idx)}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading={idx === 0 ? 'eager' : 'lazy'}
          decoding="async"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <span className="img-fallback hidden absolute inset-0 flex items-center justify-center text-slate-300">
        <IconBuilding className="w-14 h-14" />
      </span>
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors pointer-events-none rounded-[inherit]" />
    </div>
  );

  if (allImages.length === 0) {
    return (
      <div className="container mx-auto px-4 mt-6 mb-8">
        <div className="aspect-[21/9] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center rounded-2xl">
          <IconBuilding className="w-24 h-24 text-slate-400/50" />
        </div>
      </div>
    );
  }

  const totalVisible = Math.min(allImages.length, 5);
  const remainder = allImages.length - 5;

  return (
    <>
      <div className="container mx-auto px-4 mt-6 mb-8">
        {/* ── Layout Gallery ── */}
        {totalVisible === 1 && (
          // Chỉ 1 ảnh: full width, tỉ lệ cinematic
          <div className="aspect-[16/7] rounded-2xl overflow-hidden">
            <Slot src={allImages[0]} idx={0} className="w-full h-full" />
          </div>
        )}

        {totalVisible === 2 && (
          // 2 ảnh: main lớn + 1 bên phải
          <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden" style={{ height: '420px' }}>
            <div className="col-span-2 h-full"><Slot src={allImages[0]} idx={0} className="w-full h-full" /></div>
            <div className="h-full"><Slot src={allImages[1]} idx={1} className="w-full h-full" /></div>
          </div>
        )}

        {totalVisible === 3 && (
          // 3 ảnh: main + 2 bên phải chồng
          <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden" style={{ height: '420px' }}>
            <div className="col-span-2 h-full"><Slot src={allImages[0]} idx={0} className="w-full h-full" /></div>
            <div className="grid grid-rows-2 gap-2 h-full">
              <Slot src={allImages[1]} idx={1} className="w-full h-full" />
              <Slot src={allImages[2]} idx={2} className="w-full h-full" />
            </div>
          </div>
        )}

        {totalVisible === 4 && (
          // 4 ảnh: main + 1 (2/3) | 2 bên phải nhỏ chồng
          <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden" style={{ height: '420px' }}>
            <div className="col-span-2 grid grid-rows-2 gap-2 h-full">
              <Slot src={allImages[0]} idx={0} className="w-full h-full" />
              <Slot src={allImages[1]} idx={1} className="w-full h-full" />
            </div>
            <div className="grid grid-rows-2 gap-2 h-full">
              <Slot src={allImages[2]} idx={2} className="w-full h-full" />
              <Slot src={allImages[3]} idx={3} className="w-full h-full" />
            </div>
          </div>
        )}

        {totalVisible >= 5 && (
          // 5+ ảnh: layout booking.com style
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden" style={{ height: '420px' }}>
            {/* Main ảnh to chiếm 2 cột 2 hàng */}
            <div className="col-span-2 row-span-2 h-full">
              <Slot src={allImages[0]} idx={0} className="w-full h-full" />
            </div>
            {/* 4 ảnh nhỏ bên phải */}
            <Slot src={allImages[1]} idx={1} className="w-full h-full" />
            <div className="relative">
              <Slot src={allImages[2]} idx={2} className="w-full h-full" />
            </div>
            <Slot src={allImages[3]} idx={3} className="w-full h-full" />
            {/* Ảnh cuối + overlay "+N ảnh" */}
            <div className="relative h-full">
              <Slot src={allImages[4]} idx={4} className="w-full h-full" />
              {remainder > 0 && (
                <button
                  onClick={() => setLightbox(4)}
                  className="absolute inset-0 bg-black/55 hover:bg-black/45 transition-colors flex flex-col items-center justify-center text-white"
                >
                  <span className="text-3xl font-bold">+{remainder}</span>
                  <span className="text-sm font-medium opacity-80 mt-1">Xem thêm ảnh</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Nút hiển thị tất cả ảnh */}
        {allImages.length > 1 && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setLightbox(0)}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Xem tất cả {allImages.length} ảnh
            </button>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-5 right-7 text-white/80 hover:text-white transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 rounded-full text-white flex items-center justify-center transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + allImages.length) % allImages.length); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* Image */}
          <img
            key={lightbox}
            src={lightboxImgFailed ? IMG_PLACEHOLDER : allImages[lightbox]}
            alt={`Ảnh ${lightbox + 1}`}
            className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            onError={() => setLightboxImgFailed(true)}
          />

          {/* Next */}
          <button
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 rounded-full text-white flex items-center justify-center transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % allImages.length); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Counter + thumbnail strip */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span className="text-white/70 text-sm font-medium">{lightbox + 1} / {allImages.length}</span>
            {allImages.length > 1 && allImages.length <= 12 && (
              <div className="flex gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                    className={`w-12 h-9 rounded-md overflow-hidden border-2 transition-all ${i === lightbox ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
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
          <IconInfo className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">Chưa có đánh giá nào</p>
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
                      <StarRating stars={r.soSaoTong} small />
                      <span className="text-xs text-gray-500 font-medium ml-0.5">{r.soSaoTong}/5</span>
                    </div>
                  </div>
                  {r.binhLuan && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">"{r.binhLuan}"</p>
                  )}
                  {r.phanHoi && (
                    <div className="mt-3 pl-3 border-l-2 border-blue-500 bg-blue-50/50 rounded-r-lg p-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tighter">Phản hồi từ quản lý</span>
                        <span className="text-[10px] text-gray-400">{fmtDate(r.ngayPhanHoi)}</span>
                      </div>
                      <p className="text-xs text-gray-700 italic leading-snug">{r.phanHoi}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {reviews.length > 6 && (
            <button type="button" onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              {showAll ? 'Thu gọn' : `Xem thêm ${reviews.length - 6} đánh giá`}
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
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <IconSparkles className="w-5 h-5 text-slate-500 shrink-0" />
        Dịch vụ khách sạn
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(dv => (
          <div key={dv.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-200/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <IconSparkles className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-gray-800 text-sm font-medium truncate">{dv.ten}</span>
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

const REPORT_TYPES = [
  { value: 'SAFETY', label: 'An toàn' },
  { value: 'BILLING', label: 'Thanh toán / hóa đơn' },
  { value: 'SERVICE', label: 'Dịch vụ' },
  { value: 'CLEANLINESS', label: 'Vệ sinh' },
  { value: 'NOISE', label: 'Tiếng ồn' },
  { value: 'FACILITIES', label: 'Cơ sở vật chất' },
  { value: 'OTHER', label: 'Khác' },
];

const ReportHotelSection = ({ hotelId, hotelName, user, showToast, navigate }) => {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    hoTen: '',
    email: '',
    sdt: '',
    loaiVanDe: 'SERVICE',
    moTa: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      hoTen: user.hoTen || f.hoTen,
      email: user.email || f.email,
    }));
  }, [user]);

  const wc = wordCountVi(form.moTa);
  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (wc < 20) {
      showToast('Nội dung cần ít nhất 20 từ.', 'error');
      return;
    }
    setSending(true);
    try {
      await axiosClient.post('/guest-reports', {
        khachSanId: hotelId,
        hoTen: form.hoTen.trim(),
        email: form.email?.trim() || null,
        sdt: form.sdt?.trim() || null,
        loaiVanDe: form.loaiVanDe,
        moTa: form.moTa.trim(),
      });
      showToast('Đã gửi báo cáo. Quản trị viên sẽ xem xét.', 'success');
      setOpen(false);
      setForm((f) => ({ ...f, moTa: '' }));
    } catch (err) {
      showToast(err.response?.data?.error || 'Không gửi được báo cáo.', 'error');
    } finally {
      setSending(false);
    }
  };

  const startReport = () => {
    if (user) setOpen(true);
    else navigate('/login', { state: { from: window.location.pathname } });
  };

  return (
    <>
      {/* Thanh gọn cuối trang — không chiếm khối lớn giữa nội dung */}
      <div className="rounded-lg border border-slate-200/90 bg-slate-50/90 px-3 py-2.5 sm:px-4 flex flex-wrap items-center gap-x-3 gap-y-2 justify-between text-xs sm:text-sm text-slate-600">
        <div className="flex items-center gap-2 min-w-0">
          <IconAlert className="w-4 h-4 text-slate-500 shrink-0" aria-hidden />
          <span className="leading-snug">
            <span className="font-medium text-slate-700">Phản ánh tới quản trị</span>
            <span className="text-slate-500"> · </span>
            <span className="truncate">{hotelName}</span>
            <span className="text-slate-400 hidden sm:inline"> — cần đăng nhập</span>
          </span>
        </div>
        <button
          type="button"
          onClick={startReport}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
        >
          {user ? 'Gửi phản ánh' : 'Đăng nhập'}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-hotel-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-200 motion-safe:animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white rounded-t-2xl z-10">
              <h2 id="report-hotel-title" className="text-base font-semibold text-slate-900">
                Báo cáo khách sạn
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none">
                ×
              </button>
            </div>
            <form onSubmit={submit} className="p-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Họ và tên</label>
                  <input
                    required
                    value={form.hoTen}
                    onChange={(e) => setForm((f) => ({ ...f, hoTen: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Loại vấn đề</label>
                  <select
                    value={form.loaiVanDe}
                    onChange={(e) => setForm((f) => ({ ...f, loaiVanDe: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
                  >
                    {REPORT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
                    placeholder="email@vd.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Số điện thoại (nếu không dùng email)</label>
                  <input
                    value={form.sdt}
                    onChange={(e) => setForm((f) => ({ ...f, sdt: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
                    placeholder="0xxxxxxxxx"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mô tả chi tiết (tối thiểu 20 từ)</label>
                <textarea
                  required
                  rows={5}
                  value={form.moTa}
                  onChange={(e) => setForm((f) => ({ ...f, moTa: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-y min-h-[120px] focus:ring-2 focus:ring-blue-500/30 outline-none"
                  placeholder="Mô tả rõ sự việc, thời gian, bằng chứng nếu có…"
                />
                <p className={`text-xs mt-1 ${wc < 20 ? 'text-amber-600' : 'text-slate-400'}`}>{wc}/20 từ</p>
              </div>
              <p className="text-xs text-slate-500">Cần có ít nhất email hợp lệ hoặc số điện thoại Việt Nam hợp lệ.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {sending ? 'Đang gửi…' : 'Gửi tới admin'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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

  const [publicCoupons, setPublicCoupons] = useState({ platformDiscounts: [], hotelPromotions: [] });
  const [couponCode, setCouponCode] = useState('');
  const [couponPreview, setCouponPreview] = useState(null);
  const [couponApplying, setCouponApplying] = useState(false);

  // Active tab (info / rooms / reviews)
  const [activeTab, setActiveTab] = useState('info');
  const roomsSectionRef = useRef(null);

  useEffect(() => {
    axiosClient.get(`/hotels/${id}/details`)
      .then(r => setHotel(r.data))
      .catch(() => setHotel(null))
      .finally(() => setLoadingHotel(false));
  }, [id]);

  // Tự động tìm phòng trống khi vào trang
  useEffect(() => {
    searchRooms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    axiosClient.get(`/coupons/public/hotel/${id}`)
      .then((r) => setPublicCoupons(r.data || { platformDiscounts: [], hotelPromotions: [] }))
      .catch(() => setPublicCoupons({ platformDiscounts: [], hotelPromotions: [] }));
  }, [id]);

  useEffect(() => {
    setCouponPreview(null);
  }, [selectedRoom?.phongId]);

  // Nếu phòng có tiền cọc → bắt buộc thanh toán online (VNPAY)
  useEffect(() => {
    if (selectedRoom && Number(selectedRoom.tienCocDuTinh || 0) > 0) {
      setPayMethod('VNPAY');
    }
  }, [selectedRoom?.phongId]);

  const searchRooms = useCallback(async ({ scroll = false } = {}) => {
    if (!checkIn || !checkOut || nights(checkIn, checkOut) < 1) {
      showToast('Ngày đến phải trước ngày đi!', 'error'); return;
    }
    setSearching(true);
    setSelectedRoom(null);
    try {
      const res = await axiosClient.get(`/hotels/${id}/available-rooms`, { params: { checkIn, checkOut, soKhach: guests } });
      const rooms = (res.data || []).filter(r => r.soKhach == null || r.soKhach >= guests);
      setAvailableRooms(rooms);
      setSearched(true);
      setActiveTab('rooms');
      if (rooms.length === 0) showToast('Không còn phòng trống trong khoảng thời gian này.', 'warn');
      if (scroll) setTimeout(() => roomsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } catch {
      showToast('Lỗi khi tìm phòng. Vui lòng thử lại.', 'error');
    } finally {
      setSearching(false);
    }
  }, [id, checkIn, checkOut, guests]);

  const soNgay = nights(checkIn, checkOut);

  const applyCoupon = async () => {
    if (!selectedRoom) {
      showToast('Chọn phòng trước khi áp dụng mã.', 'warn');
      return;
    }
    const code = (couponCode || '').trim();
    if (!code) {
      showToast('Nhập mã giảm giá hoặc khuyến mãi.', 'warn');
      return;
    }
    setCouponApplying(true);
    try {
      const res = await axiosClient.post('/coupons/preview', {
        code,
        orderAmount: selectedRoom.tongTienDuTinh,
        hotelId: Number(id),
        loaiPhongId: selectedRoom.loaiPhongId,
        nights: soNgay,
      });
      setCouponPreview(res.data);
      if (res.data?.valid) {
        showToast(`Áp dụng mã thành công · ${res.data.kind === 'DISCOUNT' ? 'Mã nền tảng' : 'Mã khách sạn'}`, 'success');
      } else {
        showToast(res.data?.message || 'Mã không hợp lệ.', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Không kiểm tra được mã.';
      setCouponPreview({ valid: false, message: msg, discountAmount: 0, kind: '' });
      showToast(msg, 'error');
    } finally {
      setCouponApplying(false);
    }
  };

  const handleBook = async () => {
    if (!user) { navigate('/login', { state: { from: window.location.pathname } }); return; }
    if (!selectedRoom) { showToast('Vui lòng chọn phòng!', 'error'); return; }
    setBooking(true);
    try {
      const payload = {
        phongId: selectedRoom.phongId,
        nguoiDungId: parseInt(user.userId),
        ngayDen: checkIn,
        ngayDi: checkOut,
        loaiDatPhong: bookingMethod,
        phuongThucThanhToan: payMethod,
        soNguoiLon: guests,
        ghiChuKhach: guestNote || null,
      };
      if (couponPreview?.valid && (couponCode || '').trim()) {
        payload.couponCode = (couponCode || '').trim();
      }
      const res = await axiosClient.post('/bookings/create', payload);
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

  /** Đã tìm phòng và API trả về 0 phòng — không hiển thị danh sách phòng để đặt */
  const soldOut = searched && availableRooms.length === 0;

  const grossTotal = selectedRoom ? Number(selectedRoom.tongTienDuTinh || 0) : 0;
  const discountAmt = couponPreview?.valid ? Number(couponPreview.discountAmount || 0) : 0;
  const netTotal = Math.max(0, grossTotal - discountAmt);
  const tiLeCocNum = selectedRoom ? Number(selectedRoom.tiLeCocKhachSan || 0) : 0;
  const estCocAfter = selectedRoom && tiLeCocNum > 0
    ? Math.round((netTotal * tiLeCocNum) / 100)
    : (selectedRoom ? Number(selectedRoom.tienCocDuTinh || 0) : 0);

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
      <IconSearch className="w-16 h-16 mb-4 text-slate-300" />
      <p className="text-xl font-semibold text-slate-600">Không tìm thấy khách sạn</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 hover:underline text-sm">← Quay lại</button>
    </div>
  );

  // ── Booking Success Screen ───────────────────────────────────────────
  if (bookingResult) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-100">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt Phòng Thành Công!</h2>
        <p className="text-gray-500 mb-6">Mã đặt phòng của bạn</p>
        <div className="bg-blue-50 rounded-xl px-6 py-4 mb-6">
          <p className="font-mono text-2xl font-bold text-blue-700">{bookingResult.maDatPhong}</p>
          <p className="text-sm text-gray-500 mt-1">{bookingResult.tenPhong} · {bookingResult.soNgay} đêm</p>
          <p className="text-lg font-semibold text-gray-800 mt-2">{fmt(bookingResult.thanhTien)}</p>
          {Number(bookingResult.tienGiamCoupon) > 0 && (
            <p className="text-sm text-emerald-700 mt-1">
              Đã giảm {fmt(bookingResult.tienGiamCoupon)}
              {bookingResult.maCoupon ? ` · Mã ${bookingResult.maCoupon}` : ''}
            </p>
          )}
        </div>
        <div className={`text-sm font-medium px-3 py-1.5 rounded-full inline-block mb-6
          ${bookingResult.trangThai === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
          {bookingResult.trangThai === 'Confirmed' ? 'Đã xác nhận' : 'Chờ khách sạn xác nhận'}
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
            ← Trang chủ
          </button>
          <button onClick={() => navigate('/user/bookings')} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium">
            Xem hóa đơn / đặt phòng
          </button>
        </div>
      </div>
    </div>
  );

  // ── Computed ─────────────────────────────────────────────────────────
  const toFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
    return base + (url.startsWith('/') ? url : '/' + url);
  };
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
      <div className="bg-white shadow-sm border-b border-gray-100 motion-safe:animate-fade-in-up opacity-0 [animation-fill-mode:forwards]">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex-1">
              {/* Stars + Status */}
              <div className="flex items-center gap-2 mb-1">
                <StarRating stars={hotel.soSao} />
                <span className="text-sm text-gray-400">({hotel.soSao} sao)</span>
                {hotel.trangThai && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    {hotel.trangThai}
                  </span>
                )}
              </div>
              {/* Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{hotel.ten}</h1>
              {/* Location breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
                <IconMapPin className="w-4 h-4 text-slate-400 shrink-0" />
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
                <div className="flex mt-1 gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <IconStar key={i} className={`w-3.5 h-3.5 ${i < Math.round(avgScore) ? 'text-amber-300' : 'text-white/35'}`} />
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
                <IconClock className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                Nhận phòng: <strong>{hotel.gioNhanPhong}</strong>
              </span>
            )}
            {hotel.gioTraPhong && (
              <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                <IconClock className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                Trả phòng: <strong>{hotel.gioTraPhong}</strong>
              </span>
            )}
            {(hotel.dichVus || []).length > 0 && (
              <span className="flex items-center gap-1.5 text-xs bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full font-medium border border-slate-200">
                <IconSparkles className="w-3.5 h-3.5 flex-shrink-0" />
                {hotel.dichVus.length} dịch vụ
              </span>
            )}
            {(hotel.danhGias || []).length > 0 && (
              <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full font-medium border border-amber-100">
                <IconStar className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                {hotel.danhGias.length} đánh giá
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
            <h2 className="text-lg font-bold text-gray-800 mb-3">Giới thiệu khách sạn</h2>
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
                  <IconMapPin className="w-4 h-4 text-slate-500" /> Vị trí trên bản đồ
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
                  <IconMapPin className="w-4 h-4 text-slate-500" /> Vị trí trên bản đồ
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center flex flex-col items-center">
                  <IconMapPin className="w-12 h-12 mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-gray-600 mb-3">Đã có địa chỉ nhưng chưa được ghim toạ độ trên bản đồ số.</p>
                  <button onClick={() => navigate('/hotels/map')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 bg-white px-4 py-2 rounded-lg transition">
                     Mở bản đồ khách sạn chung
                  </button>
                </div>
              </div>
            ) : null}
           </div>

          {/* Tìm phòng + kết quả (cùng ref để cuộn sau khi tìm) */}
          <div ref={roomsSectionRef} className="space-y-6 motion-safe:animate-fade-in-up opacity-0 [animation-fill-mode:forwards]">
          <div id="tab-rooms" className="bg-white rounded-2xl shadow-sm p-6 ring-1 ring-slate-200/60 transition-shadow hover:shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <IconSearch className="w-5 h-5 text-slate-500" />
              Tìm phòng trống
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                  <IconCalendar className="w-3.5 h-3.5 text-slate-400" /> Ngày đến
                </label>
                <input type="date" value={checkIn} min={today()}
                  onChange={e => { setCheckIn(e.target.value); setSearched(false); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                  <IconCalendar className="w-3.5 h-3.5 text-slate-400" /> Ngày đi
                </label>
                <input type="date" value={checkOut} min={checkIn || today()}
                  onChange={e => { setCheckOut(e.target.value); setSearched(false); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                  <IconUsers className="w-3.5 h-3.5 text-slate-400" /> Số khách
                </label>
                <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} người</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => searchRooms({ scroll: true })} disabled={searching}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2 motion-safe:transition-transform motion-safe:active:scale-[0.98]">
                  <IconSearch className="w-4 h-4 opacity-90" />
                  {searching ? 'Đang tìm...' : 'Tìm phòng'}
                </button>
              </div>
            </div>
            {soNgay > 0 && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                Tổng: <strong className="text-gray-600">{soNgay} đêm</strong>
              </p>
            )}
          </div>

          {/* Available Room Cards — chỉ hiện khi còn phòng; hết phòng: một thông báo rõ ràng, không list card */}
          {searched && soldOut && (
            <div className="motion-safe:animate-fade-in-up rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/80 p-8 text-center shadow-sm ring-1 ring-amber-100/80">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <IconAlert className="w-9 h-9 text-amber-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Đã hết phòng</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Không còn phòng trống cho <strong>{soNgay}</strong> đêm từ <strong>{checkIn}</strong> đến <strong>{checkOut}</strong>.
                Vui lòng chọn ngày khác hoặc xem khách sạn khác.
              </p>
            </div>
          )}
          {searched && !soldOut && (
            <div className="motion-safe:animate-fade-in-up opacity-0 [animation-fill-mode:forwards] motion-safe:delay-75">
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                {availableRooms.length > 0
                  ? `${availableRooms.length} phòng trống · ${soNgay} đêm`
                  : ''}
              </h2>
              <div className="space-y-4">
                {availableRooms.map(room => {
                  const isSelected = selectedRoom?.phongId === room.phongId;
                  const amenities = parseTienIch(room.tienIch);
                  const roomImgSrc = resolveHotelImageUrl(room.hinhAnh);
                  return (
                    <div key={room.phongId}
                      className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md ${isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-200'}`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Room image */}
                        <div className="w-full md:w-52 h-44 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {roomImgSrc
                            ? <img src={roomImgSrc} alt={room.tenLoaiPhong} className="w-full h-full object-cover object-center" loading="lazy" decoding="async" />
                            : <IconBuilding className="w-16 h-16 text-slate-300" />
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
                                {room.dienTich && <span>{room.dienTich} m²</span>}
                                {room.soGiuong && <span>{room.soGiuong} giường{room.loaiGiuong ? ` · ${room.loaiGiuong}` : ''}</span>}
                                {room.soKhach && <span>Tối đa {room.soKhach} khách</span>}
                              </div>
                              <AmenityList amenities={amenities} />
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
                                {isSelected ? 'Đã chọn' : 'Chọn phòng'}
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
          </div>

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
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="glass rounded-[2rem] p-6 lg:p-8 sticky top-24 z-20 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl">
            <h3 className="text-xl font-extrabold text-slate-800 mb-6 text-center tracking-tight">Chi tiết đặt phòng</h3>

            {/* Gợi ý mã: nền tảng + khách sạn này */}
            {((publicCoupons.platformDiscounts?.length || 0) + (publicCoupons.hotelPromotions?.length || 0)) > 0 && (
              <div className="mb-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 p-4 shadow-sm">
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <IconSparkles className="w-4 h-4 text-emerald-600" />
                  Đang có ưu đãi
                </p>
                {publicCoupons.platformDiscounts?.length > 0 && (
                  <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Toàn hệ thống</p>
                )}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(publicCoupons.platformDiscounts || []).map((d) => (
                    <span
                      key={`pf-${d.code}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-medium text-emerald-900 ring-1 ring-emerald-200/80"
                      title={d.ten || d.code}
                    >
                      <span className="font-mono font-bold">{d.code}</span>
                      <span className="text-emerald-700">· {offerLabel(d)}</span>
                    </span>
                  ))}
                </div>
                {publicCoupons.hotelPromotions?.length > 0 && (
                  <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Tại khách sạn này</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {(publicCoupons.hotelPromotions || []).map((p) => (
                    <span
                      key={`hp-${p.code}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-medium text-teal-900 ring-1 ring-teal-200/80"
                      title={p.ten || p.code}
                    >
                      <span className="font-mono font-bold">{p.code}</span>
                      <span className="text-teal-800">· {offerLabel(p)}</span>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  Nhập một mã bên dưới khi đặt (mã nền tảng hoặc mã của khách sạn). Không cộng dồn nhiều mã.
                </p>
              </div>
            )}

            {/* Quick search in sidebar */}
            {!searched && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl text-center text-sm text-blue-700">
                <p className="font-medium">Chọn ngày để xem phòng trống</p>
                <button onClick={() => searchRooms({ scroll: true })} disabled={searching}
                  className="mt-2 bg-blue-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold">
                  {searching ? 'Đang tìm...' : 'Tìm phòng ngay'}
                </button>
              </div>
            )}

            {/* Room summary */}
            {soldOut && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900">
                <p className="font-semibold">Không thể đặt — đã hết phòng</p>
                <p className="text-xs text-red-800/90 mt-1">Đổi ngày nhận / trả phòng ở trên rồi bấm &quot;Tìm phòng&quot; lại.</p>
              </div>
            )}
            {selectedRoom && !soldOut ? (
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
                {/* Mã giảm giá / khuyến mãi */}
                <div className={`border-t border-blue-100 pt-3 mt-2 space-y-2 ${soldOut ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="block text-xs font-semibold text-gray-600">Mã giảm giá hoặc khuyến mãi</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponPreview(null); }}
                      placeholder="VD: SUMMER2026"
                      disabled={soldOut}
                      className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponApplying || !selectedRoom || soldOut}
                      className="shrink-0 px-3 py-2 text-xs font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponApplying ? '…' : 'Áp dụng'}
                    </button>
                  </div>
                  {couponPreview && (
                    <p className={`text-xs ${couponPreview.valid ? 'text-emerald-700' : 'text-red-600'}`}>
                      {couponPreview.valid
                        ? <>Đã áp dụng · Giảm <strong>{fmt(couponPreview.discountAmount)}</strong> ({couponPreview.kind === 'DISCOUNT' ? 'mã nền tảng' : 'mã khách sạn'})</>
                        : (couponPreview.message || 'Mã không hợp lệ')}
                    </p>
                  )}
                </div>
                {couponPreview?.valid && discountAmt > 0 && (
                  <>
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-emerald-800">Giảm giá</span>
                      <span className="font-semibold text-emerald-700">−{fmt(discountAmt)}</span>
                    </div>
                    <div className="border-t border-blue-100 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Tổng sau giảm</span>
                      <span className="text-xl font-bold text-emerald-800">{fmt(netTotal)}</span>
                    </div>
                  </>
                )}
                {/* Deposit Info */}
                {selectedRoom.tienCocDuTinh > 0 && (
                  <div className="border-t border-orange-100 pt-2 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-orange-700">Tiền cọc ({selectedRoom.tiLeCocKhachSan}%)</span>
                      <span className="text-base font-bold text-orange-600">
                        {fmt(couponPreview?.valid ? estCocAfter : selectedRoom.tienCocDuTinh)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Cần thanh toán online qua VNPAY ngay khi đặt. Số còn lại thanh toán tại khách sạn.</p>
                  </div>
                )}
                <PolicyBadge
                  choPhepHuy={selectedRoom.choPhepHuy}
                  mienPhiHuyTruocGio={selectedRoom.mienPhiHuyTruocGio}
                  phiHuyPct={selectedRoom.phiHuyPct}
                />
              </div>
            ) : soldOut ? (
              <div className="border-2 border-dashed border-amber-200 rounded-xl p-6 mb-5 text-center text-amber-900/80 bg-amber-50/50">
                <p className="text-sm font-medium">Chưa chọn phòng — hiện không còn phòng trống cho ngày đã chọn</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 mb-5 text-center text-gray-400">
                <IconBuilding className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Tìm phòng và chọn để đặt</p>
              </div>
            )}



            {/* Payment method */}
            {(() => {
              const hasDeposit = selectedRoom && Number(selectedRoom.tienCocDuTinh || 0) > 0;
              return (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Phương thức thanh toán</label>
                  {hasDeposit ? (
                    <div className="w-full border border-orange-300 bg-orange-50 rounded-lg px-3 py-2 text-sm text-orange-700 font-semibold flex items-center gap-2">
                      <span>💳</span> VNPAY (bắt buộc khi có tiền cọc)
                    </div>
                  ) : (
                    <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                      <option value="TienMat">Tiền mặt tại quầy</option>
                      <option value="ChuyenKhoan">Chuyển khoản ngân hàng</option>
                      <option value="VNPAY">VNPAY</option>
                      <option value="MoMo">MoMo</option>
                    </select>
                  )}
                </div>
              );
            })()}

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
                disabled={!selectedRoom || booking || soldOut}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {booking ? 'Đang xử lý...' : soldOut ? 'Hết phòng' : 'Đặt phòng ngay'}
              </button>
            ) : (
              <button onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
                Đăng nhập để đặt phòng
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3 inline-flex items-center justify-center gap-1.5 w-full">
              <IconShield className="w-3.5 h-3.5 text-slate-400" />
              Thông tin được bảo mật
            </p>
          </div>
        </motion.div>

      </div>

      {/* Báo cáo — thanh nhỏ cuối trang (form trong modal) */}
      <div className="container mx-auto px-4 pb-4">
        <ReportHotelSection
          hotelId={Number(id)}
          hotelName={hotel.ten}
          user={user}
          showToast={showToast}
          navigate={navigate}
        />
      </div>

      {/* ── Footer: Sponsor & Policy ── */}
      <footer className="border-t border-gray-200 bg-white mt-6">
        <div className="container mx-auto px-4 py-8">
          {/* Sponsors */}
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Đối tác thanh toán</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { name: 'VNPay', desc: 'Thanh toán trực tuyến' },
                { name: 'MoMo', desc: 'Ví điện tử' },
                { name: 'Agoda', desc: 'Đối tác đặt phòng' },
                { name: 'Vietnam Airlines', desc: 'Hàng không quốc gia' },
              ].map(s => (
                <div key={s.name} className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-gray-600">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Hotel Bookings. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <a href="#" className="hover:text-blue-600 hover:underline transition-colors">Chính sách bảo mật</a>
              <span>·</span>
              <a href="#" className="hover:text-blue-600 hover:underline transition-colors">Điều khoản sử dụng</a>
              <span>·</span>
              <a href="#" className="hover:text-blue-600 hover:underline transition-colors">Trợ giúp</a>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><IconShield className="w-3.5 h-3.5 text-emerald-600/80" /> Bảo mật SSL</span>
            </div>
          </div>
        </div>
      </footer>

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
