import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=4f46e5&color=fff&bold=true&size=128`;

const roleLabel = { Admin: '🛡️ Quản Trị Viên', HotelManager: '🏨 Quản Lý Khách Sạn', User: '👤 Khách Hàng' };
const roleColor = { Admin: 'bg-red-100 text-red-700', HotelManager: 'bg-purple-100 text-purple-700', User: 'bg-blue-100 text-blue-700' };

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

// Status timeline config
const STATUSES = [
  { key: 'Pending',    label: 'Đã đặt',        icon: '📋', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { key: 'Confirmed',  label: 'Xác nhận',       icon: '✅', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { key: 'CheckedIn',  label: 'Đang lưu trú',   icon: '🏠', color: 'text-green-600 bg-green-50 border-green-200' },
  { key: 'CheckedOut', label: 'Đã trả phòng',   icon: '🚪', color: 'text-gray-600 bg-gray-50 border-gray-200' },
  { key: 'Completed',  label: 'Hoàn thành',     icon: '🎉', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
];
const BAD_STATUSES = ['Expired', 'Cancelled', 'Rejected', 'NoShow'];

const STATUS_LABELS = {
  Pending: 'Đã đặt', Confirmed: 'Đã xác nhận', CheckedIn: 'Đang lưu trú', CheckedOut: 'Đã trả phòng', Completed: 'Hoàn thành',
  Expired: 'Hết hạn', Cancelled: 'Đã hủy', Rejected: 'Từ chối', NoShow: 'Không đến'
};
const STATUS_BADGE = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Confirmed:  'bg-blue-100 text-blue-700',
  CheckedIn:  'bg-green-100 text-green-700',
  CheckedOut: 'bg-gray-100 text-gray-600',
  Completed:  'bg-emerald-100 text-emerald-700',
  Expired:    'bg-red-100 text-red-600',
  Cancelled:  'bg-red-100 text-red-600',
  Rejected:   'bg-red-100 text-red-600',
};

/* ── Booking Detail Modal ─────────────────────────────────── */
const BookingDetailModal = ({ bookingId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookRes, invRes, payRes] = await Promise.all([
          axiosClient.get(`/bookings/id/${bookingId}`),
          axiosClient.get(`/bookings/${bookingId}/invoice`).catch(() => ({ data: null })),
          axiosClient.get(`/bookings/${bookingId}/payment-history`).catch(() => ({ data: [] }))
        ]);
        setDetail(bookRes.data);
        setInvoice(invRes.data);
        setPayments(payRes.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, [bookingId]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await axiosClient.put(`/bookings/${bookingId}/cancel`, { ghiChuHuy: 'Khách tự hủy' });
      const res = await axiosClient.get(`/bookings/id/${bookingId}`);
      setDetail(res.data);
      setShowConfirmCancel(false);
    } catch { /* ignore */ }
    finally { setCancelling(false); }
  };

  const currentIdx = detail ? STATUSES.findIndex(s => s.key === detail.trangThai) : -1;
  const isBad = detail && BAD_STATUSES.includes(detail.trangThai);
  const canCancel = detail && ['Pending', 'Confirmed'].includes(detail.trangThai);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">Chi Tiết Đặt Phòng</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">✕</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !detail ? (
          <p className="text-center py-10 text-gray-400">Không thể tải thông tin đặt phòng</p>
        ) : (
          <div className="p-6 space-y-5">

            {/* BOOKING CODE - Prominent display */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 11px)'}} />
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Mã đặt phòng</p>
              <p className="text-3xl font-extrabold tracking-widest font-mono">{detail.maDatPhong || detail.maPhieuDatPhong || detail.id}</p>
              <p className="text-blue-200 text-xs mt-2">Đưa mã này cho nhân viên khách sạn khi nhận phòng</p>
              {/* Fake barcode */}
              <div className="flex justify-center gap-0.5 mt-3 opacity-60">
                {Array.from({length: 40}, (_, i) => (
                  <div key={i} className="bg-white/80 rounded-sm" style={{width: i % 3 === 0 ? 3 : 2, height: i % 5 === 0 ? 28 : 20}} />
                ))}
              </div>
            </div>

            {/* Status badge */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${STATUS_BADGE[detail.trangThai] || 'bg-gray-100 text-gray-600'} border-current/20`}>
              <span className="font-bold">{isBad ? '⚠️' : '●'} Trạng thái: {STATUS_LABELS[detail.trangThai] || detail.trangThai}</span>
              {detail.trangThaiThanhToan && (
                <span className="text-xs font-semibold opacity-75">💳 {detail.trangThaiThanhToan}</span>
              )}
            </div>

            {/* Status Timeline */}
            {!isBad && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Lộ trình đặt phòng</p>
                <div className="flex items-center gap-1">
                  {STATUSES.map((s, idx) => {
                    const done = currentIdx >= idx;
                    const active = currentIdx === idx;
                    return (
                      <div key={s.key} className="flex items-center flex-1 min-w-0">
                        <div className={`flex flex-col items-center flex-shrink-0`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition
                            ${done ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-400'}
                            ${active ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`}>
                            {done ? (active ? s.icon : '✓') : <span className="text-xs">{idx + 1}</span>}
                          </div>
                          <p className={`text-[10px] mt-1 text-center leading-tight max-w-[52px] ${done ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                            {s.label}
                          </p>
                        </div>
                        {idx < STATUSES.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-4 ${currentIdx > idx ? 'bg-blue-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Booking Info */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span>🏨</span>
                <p className="font-bold text-gray-800">
                  {detail.phong?.khachSan?.ten || detail.tenKhachSan || 'Khách sạn'}
                </p>
              </div>
              <div className="divide-y divide-gray-50 text-sm">
                {[
                  ['Phòng', `${detail.phong?.ten || detail.tenPhong || '—'}${detail.phong?.loaiPhong?.ten ? ` (${detail.phong.loaiPhong.ten})` : (detail.loaiPhong ? ` (${detail.loaiPhong})` : '')}`],
                  ['Nhận phòng', fmtDate(detail.ngayDen)],
                  ['Trả phòng', fmtDate(detail.ngayDi)],
                  ['Số đêm', detail.soNgay || Math.max(1, Math.ceil((new Date(detail.ngayDi) - new Date(detail.ngayDen)) / 86400000)) + ' đêm'],
                  ['Hình thức', detail.loaiDatPhong === 'InstantBooking' ? '⚡ Tức thì' : '📋 Yêu cầu duyệt'],
                  ['Thanh toán', detail.phuongThucThanhToan || '—'],
                  detail.ghiChuKhach && ['Ghi chú', detail.ghiChuKhach],
                ].filter(Boolean).map(([label, val]) => (
                  <div key={label} className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800 text-right max-w-[60%]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice - dùng invoice API nếu có, fallback về detail */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span>🧾</span>
                  <p className="font-bold text-gray-800">Hóa đơn chi tiết</p>
                </div>
                {detail.trangThaiThanhToan === 'DaThanhToan' && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">✓ Đã thanh toán</span>
                )}
              </div>
              <div className="divide-y divide-gray-50 text-sm">
                {/* Tiền phòng */}
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-500">🏨 Tiền phòng ({invoice?.soNgay || detail.soNgay || 1} đêm × {fmt(invoice?.giaPhongMot || detail.giaPhongGoc)})</span>
                  <span className="font-medium">{fmt(invoice?.tienPhong || detail.thanhTien)}</span>
                </div>
                {/* Dịch vụ từ invoice API */}
                {invoice?.dichVus?.map((dv, i) => (
                  <div key={i} className="flex justify-between px-4 py-2 bg-blue-50/30">
                    <span className="text-gray-500 pl-2">🛎 {dv.tenDichVu} ×{dv.soLuong}</span>
                    <span className="text-gray-700">{fmt(dv.thanhTien)}</span>
                  </div>
                ))}
                {/* Fallback: dịch vụ từ detail nếu không có invoice */}
                {!invoice && detail.chiTietDichVus?.map((ct, i) => (
                  <div key={i} className="flex justify-between px-4 py-2 bg-blue-50/30">
                    <span className="text-gray-500 pl-2">🛎 {ct.dichVu?.ten || 'Dịch vụ'} ×{ct.soLuong}</span>
                    <span className="text-gray-700">{fmt((ct.donGiaLucDat || 0) * (ct.soLuong || 1))}</span>
                  </div>
                ))}
                {/* Phụ thu từ invoice API */}
                {invoice?.phuThus?.map((pt, i) => (
                  <div key={i} className="flex justify-between px-4 py-2 bg-orange-50/30">
                    <span className="text-gray-500 pl-2">⚠️ {pt.loaiPhuThu}</span>
                    <span className="text-orange-600">+{fmt(pt.soTien)}</span>
                  </div>
                ))}
                {/* Fallback phụ thu */}
                {!invoice && detail.phuThus?.map((pt, i) => (
                  <div key={i} className="flex justify-between px-4 py-2 bg-orange-50/30">
                    <span className="text-gray-500 pl-2">⚠️ {pt.loaiPhuThu}</span>
                    <span className="text-orange-600">+{fmt(pt.soTien)}</span>
                  </div>
                ))}
                {/* Tiền cọc */}
                {Number(invoice?.tienCoc || detail.tienCoc) > 0 && (
                  <div className="flex justify-between px-4 py-2.5 bg-amber-50/40">
                    <span className="text-amber-600 font-medium">💰 Tiền cọc</span>
                    <div className="text-right">
                      <span className="text-amber-600 font-medium">{fmt(invoice?.tienCoc || detail.tienCoc)}</span>
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        (invoice?.trangThaiCoc || detail.trangThaiCoc) === 'DaCoc' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>{(invoice?.trangThaiCoc || detail.trangThaiCoc) === 'DaCoc' ? '✓ Đã cọc' : 'Chưa cọc'}</span>
                    </div>
                  </div>
                )}
                {/* Tổng */}
                <div className="flex justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <span className="font-bold text-gray-800">TỔNG CỘNG</span>
                  <span className="font-extrabold text-blue-700 text-base">{fmt(invoice?.tongCong || detail.thanhTien)}</span>
                </div>

                {/* Hoàn tiền & Phí hủy (nếu có) */}
                {payments?.filter(p => ['HoanTien', 'ThuPhiHuy', 'ThuPhiNoShow'].includes(p.loaiGiaoDich)).length > 0 && (
                  <div className="border-t border-dashed border-gray-200 mt-2">
                    {payments.filter(p => ['HoanTien', 'ThuPhiHuy', 'ThuPhiNoShow'].includes(p.loaiGiaoDich)).map(p => (
                      <div key={p.id} className={`flex justify-between px-4 py-3 border-b border-gray-50 last:border-0 ${
                        p.loaiGiaoDich === 'HoanTien' ? 'bg-green-50/50' : 'bg-red-50/50'
                      }`}>
                        <div>
                          <p className={`font-semibold text-sm ${p.loaiGiaoDich === 'HoanTien' ? 'text-green-700' : 'text-red-600'}`}>
                            {p.loaiGiaoDich === 'HoanTien' ? '💵 Đã hoàn tiền' : (p.loaiGiaoDich === 'ThuPhiNoShow' ? '⚠️ Phí vắng mặt' : '⚠️ Phí hủy phòng')}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{p.ghiChu}</p>
                        </div>
                        <span className={`font-bold ${p.loaiGiaoDich === 'HoanTien' ? 'text-green-700' : 'text-red-600'}`}>
                          {p.loaiGiaoDich === 'HoanTien' ? '+' : '-'}{fmt(p.soTien)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {(canCancel || detail.ghiChuHuy) && (
              <div className="space-y-3">
                {detail.ghiChuHuy && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                    <strong>Lý do hủy:</strong> {detail.ghiChuHuy}
                  </div>
                )}
                {canCancel && !showConfirmCancel && (
                  <button onClick={() => setShowConfirmCancel(true)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition">
                    ❌ Hủy đặt phòng
                  </button>
                )}
                {showConfirmCancel && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-red-700 font-medium">Bạn CHẮC CHẮN muốn hủy đặt phòng này?</p>
                    <div className="flex gap-2">
                      <button onClick={handleCancel} disabled={cancelling}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition disabled:opacity-50">
                        {cancelling ? '⏳ Đang hủy...' : 'Xác nhận hủy'}
                      </button>
                      <button onClick={() => setShowConfirmCancel(false)}
                        className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                        Không hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Review Modal ─────────────────────────────────── */
const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await axiosClient.post('/reviews', {
        phieuDatPhongId: booking.id,
        khachSanId: booking.khachSanId,
        nguoiDungId: user.userId,
        soSaoTong: rating,
        binhLuan: comment.trim()
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-800">⭐ Đánh giá Khách sạn</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-bold text-gray-800 text-lg">{booking.tenKhachSan || 'Khách sạn'}</h3>
            <p className="text-sm text-gray-500">Phòng: {booking.tenPhong} - Đảo bảo bạn đã có trải nghiệm tuyệt vời!</p>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

          {/* Star Rating Select */}
          <div className="space-y-3 text-center pt-2">
            <label className="block text-sm font-semibold text-gray-700">Đánh giá của bạn</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star} type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-transform hover:scale-110 focus:outline-none ${rating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200 hover:text-yellow-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-xs text-yellow-600 font-medium">
              {['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][rating - 1]}
            </p>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-2">
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-700">Chia sẻ trải nghiệm (Không bắt buộc)</label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Nhập nhận xét của bạn về phòng ốc, dịch vụ, thái độ nhân viên..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl text-sm font-bold shadow-md hover:from-yellow-400 hover:to-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '⏳ Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 mt-2 bg-transparent text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Để sau
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main BookingHistoryPage ─────────────────────────────────── */
const BookingHistoryPage = () => {
  const { user: authUser, login, token } = useAuth();
  const navigate = useNavigate();
  const userId = authUser?.userId;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    const load = async () => {
      try {
        const res = await axiosClient.get(`/bookings/user/${userId}`);
        setBookings(res.data || []);
      } catch {
        showToast('Không thể tải lịch sử!', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const bookingsByStatus = {
    active: bookings.filter(b => ['Pending', 'Confirmed', 'CheckedIn'].includes(b.trangThai)),
    done: bookings.filter(b => ['CheckedOut', 'Completed'].includes(b.trangThai)),
    cancelled: bookings.filter(b => ['Expired', 'Cancelled', 'Rejected', 'NoShow'].includes(b.trangThai)),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-10 px-4">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      {selectedBookingId && (
        <BookingDetailModal bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} />
      )}

      {selectedReviewBooking && (
        <ReviewModal
          booking={selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          onSuccess={() => {
            // Update local state to hide the review button immediately
            setBookings(prev => prev.map(b => b.id === selectedReviewBooking.id ? { ...b, isReviewed: true } : b));
            setSelectedReviewBooking(null);
            showToast('Cảm ơn bạn đã đánh giá!', 'success');
          }}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 px-2">Lịch sử đặt phòng</h1>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="space-y-8">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🛏️</p>
                <p className="text-gray-500 font-medium">Bạn chưa có đặt phòng nào</p>
                <button onClick={() => navigate('/')}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                  Tìm khách sạn ngay
                </button>
              </div>
            ) : (
              <>
                {bookingsByStatus.active.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                      Đang hoạt động ({bookingsByStatus.active.length})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {bookingsByStatus.active.map(b => (
                        <BookingCard key={b.id} b={b} onDetail={() => setSelectedBookingId(b.id)} />
                      ))}
                    </div>
                  </div>
                )}
                {bookingsByStatus.done.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-4 mt-8">✅ Đã hoàn thành ({bookingsByStatus.done.length})</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {bookingsByStatus.done.map(b => (
                        <BookingCard key={b.id} b={b} onDetail={() => setSelectedBookingId(b.id)} onReview={() => setSelectedReviewBooking(b)} muted />
                      ))}
                    </div>
                  </div>
                )}
                {bookingsByStatus.cancelled.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-4 mt-8">🚫 Đã hủy / Không đến ({bookingsByStatus.cancelled.length})</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {bookingsByStatus.cancelled.map(b => (
                        <BookingCard key={b.id} b={b} onDetail={() => setSelectedBookingId(b.id)} muted />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Booking Card ─────────────────────────────────── */
const BookingCard = ({ b, onDetail, muted }) => {
  const statusBadge = STATUS_BADGE[b.trangThai] || 'bg-gray-100 text-gray-600';
  return (
    <div className={`border rounded-2xl p-4 transition-all hover:shadow-md cursor-pointer ${muted ? 'border-gray-100 bg-gray-50/50' : 'border-gray-100 bg-white hover:border-indigo-100'}`}
         onClick={onDetail}>
      <div className="flex items-start gap-4">
        {/* Hotel thumb */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0 flex items-center justify-center text-2xl">
          {b.phong?.khachSan?.hinhAnhBia
            ? <img src={b.phong.khachSan.hinhAnhBia} alt="" className="w-full h-full object-cover" />
            : '🏨'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="font-bold text-gray-800 text-sm truncate">
                {b.phong?.khachSan?.ten || b.tenKhachSan || 'Khách sạn'}
              </p>
              <p className="text-xs text-gray-500">
                Phòng: {b.phong?.ten || b.tenPhong || '—'}
                {(b.phong?.loaiPhong?.ten || b.loaiPhong) ? ` · ${b.phong?.loaiPhong?.ten || b.loaiPhong}` : ''}
              </p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge}`}>
              {STATUS_LABELS[b.trangThai] || b.trangThai}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
            <span>📅 {fmtDate(b.ngayDen)} → {fmtDate(b.ngayDi)}</span>
            {b.soNgay && <span>🌙 {b.soNgay} đêm</span>}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="font-extrabold text-indigo-600 text-sm">{fmt(b.thanhTien)}</span>
            <div className="flex items-center gap-2">
              {muted && b.isReviewed === false && (
                 <button onClick={(e) => { e.stopPropagation(); onReview?.(); }}
                   className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 font-bold border border-yellow-200 rounded-lg hover:bg-yellow-100 transition shadow-sm">
                   ⭐ Đánh giá
                 </button>
              )}
              {muted && b.isReviewed === true && (
                 <span className="text-xs px-2 py-1 text-gray-400 font-medium italic">
                   Đã đánh giá
                 </span>
              )}
              <button onClick={(e) => { e.stopPropagation(); onDetail(); }}
                className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition">
                Xem chi tiết →
              </button>
            </div>
          </div>

          {/* Mini code */}
          {b.maDatPhong && (
            <p className="text-xs text-gray-400 font-mono mt-1">#{b.maDatPhong}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryPage;
