import { useState, useEffect, useMemo } from 'react';
import { collectHotelImageUrls } from '../utils/hotelImages';

const STOCK_HOTEL =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

/**
 * Ảnh bìa khách sạn: thử lần lượt bìa → gallery → ảnh vị trí.
 * @param {boolean} stockIfNoUrls — nếu không có URL nào, hiển thị ảnh stock (dùng cho trang search)
 */
export default function HotelCoverImage({ hotel, alt, className = '', stockIfNoUrls = false }) {
  const urls = useMemo(() => {
    const list = collectHotelImageUrls(hotel);
    if (list.length === 0 && stockIfNoUrls) return [STOCK_HOTEL];
    return list;
  }, [hotel, stockIfNoUrls]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [hotel?.id, urls.join('|')]);

  const src = index < urls.length ? urls[index] : null;

  if (!src) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-50 to-slate-100 ${className}`}>
        🏨
      </div>
    );
  }

  return (
    <img
      key={`${index}-${src}`}
      src={src}
      alt={alt || hotel?.ten || ''}
      className={className}
      onError={() => setIndex((i) => Math.min(i + 1, urls.length))}
    />
  );
}
