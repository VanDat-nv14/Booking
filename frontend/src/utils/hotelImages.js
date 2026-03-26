const BACKEND = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';

/** Chuẩn hóa URL ảnh: full URL, data URL, hoặc path tương đối từ backend */
export function resolveHotelImageUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith('http') || t.startsWith('data:')) return t;
  return BACKEND + (t.startsWith('/') ? t : '/' + t);
}

/** hinhAnhs có thể là mảng hoặc chuỗi JSON từ API */
export function normalizeHinhAnhs(hinhAnhs) {
  if (!hinhAnhs) return [];
  if (Array.isArray(hinhAnhs)) return hinhAnhs;
  if (typeof hinhAnhs === 'string') {
    try {
      const p = JSON.parse(hinhAnhs);
      return Array.isArray(p) ? p : [];
    } catch {
      return hinhAnhs.trim() ? [hinhAnhs] : [];
    }
  }
  return [];
}

/**
 * Gom mọi nguồn ảnh (bìa → gallery → ảnh vị trí), bỏ trùng.
 * Hỗ trợ cả KhachSan (viTri.hinhAnh) và HotelDetailDto (hinhAnhViTri).
 */
export function collectHotelImageUrls(hotel) {
  if (!hotel) return [];
  const seen = new Set();
  const out = [];
  const push = (raw) => {
    const u = resolveHotelImageUrl(raw);
    if (u && !seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  };
  push(hotel.hinhAnhBia);
  normalizeHinhAnhs(hotel.hinhAnhs).forEach((x) => push(x));
  push(hotel.viTri?.hinhAnh);
  push(hotel.hinhAnhViTri);
  return out;
}
