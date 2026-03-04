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
const BAD_STATUSES = ['Expired', 'Cancelled', 'Rejected'];

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
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get(`/bookings/id/${bookingId}`);
        setDetail(res.data);
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
              <span className="font-bold">{isBad ? '⚠️' : '●'} Trạng thái: {detail.trangThai}</span>
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

            {/* Invoice */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span>🧾</span>
                <p className="font-bold text-gray-800">Hóa đơn</p>
              </div>
              <div className="divide-y divide-gray-50 text-sm">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-500">Tiền phòng</span>
                  <span className="font-medium">{fmt(detail.giaPhongGoc)}/đêm × {detail.soNgay || Math.max(1, Math.ceil((new Date(detail.ngayDi) - new Date(detail.ngayDen)) / 86400000))}</span>
                </div>
                {/* Services */}
                {detail.chiTietDichVus?.map((ct, i) => (
                  <div key={i} className="flex justify-between px-4 py-2 bg-blue-50/30">
                    <span className="text-gray-500 pl-2">🛎 {ct.dichVu?.ten || ct.tenDichVu || 'Dịch vụ'} ×{ct.soLuong}</span>
                    <span className="text-gray-700">{fmt((ct.donGiaLucDat || 0) * (ct.soLuong || 1))}</span>
                  </div>
                ))}
                {/* Surcharges */}
                {detail.phuThus?.map((pt, i) => (
                  <div key={i} className="flex justify-between px-4 py-2 bg-orange-50/30">
                    <span className="text-gray-500 pl-2">⚠️ {pt.loaiPhuThu}</span>
                    <span className="text-orange-600">+{fmt(pt.soTien)}</span>
                  </div>
                ))}
                {detail.tienCoc > 0 && (
                  <div className="flex justify-between px-4 py-2.5 bg-amber-50/40">
                    <span className="text-amber-600 font-medium">💰 Tiền cọc ({detail.trangThaiCoc === 'DaCoc' ? '✓ Đã cọc' : 'Chưa cọc'})</span>
                    <span className="text-amber-600 font-medium">{fmt(detail.tienCoc)}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-3 bg-gray-50">
                  <span className="font-bold text-gray-800">Tổng cộng</span>
                  <span className="font-extrabold text-blue-700 text-base">{fmt(detail.thanhTien)}</span>
                </div>
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

/* ── Main UserProfilePage ─────────────────────────────────── */
const UserProfilePage = () => {
  const { user: authUser, login, token } = useAuth();
  const navigate = useNavigate();
  const userId = authUser?.userId;

  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState({ hoTen: '', email: '', sdt: '', chucVu: '' });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const [form, setForm] = useState({ hoTen: '', sdt: '' });
  const [pwForm, setPwForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
  const [showPw, setShowPw] = useState({ cu: false, moi: false, xn: false });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    const load = async () => {
      try {
        const [profileRes, bookingRes] = await Promise.all([
          axiosClient.get(`/user/${userId}`),
          axiosClient.get(`/bookings/user/${userId}`).catch(() => ({ data: [] })),
        ]);
        setProfile(profileRes.data);
        setForm({ hoTen: profileRes.data.hoTen || '', sdt: profileRes.data.sdt || '' });
        setBookings(bookingRes.data || []);
      } catch {
        showToast('Không thể tải thông tin!', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleSaveInfo = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await axiosClient.put(`/user/${userId}`, { hoTen: form.hoTen, sdt: form.sdt });
      setProfile(prev => ({ ...prev, ...res.data }));
      localStorage.setItem('hoTen', res.data.hoTen);
      showToast('Cập nhật thông tin thành công!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Cập nhật thất bại!', 'error');
    } finally { setSaving(false); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.matKhauMoi !== pwForm.xacNhanMatKhau) {
      showToast('Mật khẩu xác nhận không khớp!', 'error'); return;
    }
    setSaving(true);
    try {
      await axiosClient.put(`/user/${userId}`, pwForm);
      setPwForm({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
      showToast('Đổi mật khẩu thành công!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Đổi mật khẩu thất bại!', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const TABS = [
    { id: 'info', label: '👤 Thông tin cá nhân' },
    { id: 'security', label: '🔒 Bảo mật' },
    { id: 'bookings', label: `📋 Lịch sử đặt phòng (${bookings.length})` },
  ];

  const bookingsByStatus = {
    active: bookings.filter(b => ['Pending', 'Confirmed', 'CheckedIn'].includes(b.trangThai)),
    done: bookings.filter(b => ['CheckedOut', 'Completed'].includes(b.trangThai)),
    cancelled: bookings.filter(b => ['Expired', 'Cancelled', 'Rejected'].includes(b.trangThai)),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-10 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBookingId && (
        <BookingDetailModal
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
          <div className="px-8 pb-6 -mt-12 flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <img src={avatar(profile.hoTen)} alt="Avatar"
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover" />
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{profile.hoTen || 'Người dùng'}</h1>
              <p className="text-gray-500 text-sm">{profile.email}</p>
            </div>
            <div className="pb-1 flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleColor[profile.chucVu] || 'bg-gray-100 text-gray-600'}`}>
                {roleLabel[profile.chucVu] || profile.chucVu}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === t.id
                    ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* TAB: Thông tin */}
            {activeTab === 'info' && (
              <form onSubmit={handleSaveInfo} className="space-y-5 max-w-lg">
                {[
                  { label: 'Họ và tên', key: 'hoTen', type: 'text', required: true, placeholder: 'Nguyễn Văn A' },
                  { label: 'Số điện thoại', key: 'sdt', type: 'tel', placeholder: '0901234567' },
                ].map(({ label, key, type, required, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input required={required} type={type} value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
                      placeholder={placeholder} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input value={profile.email} disabled
                    className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                </div>
                <button type="submit" disabled={saving}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 shadow-sm">
                  {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </form>
            )}

            {/* TAB: Bảo mật */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePw} className="space-y-5 max-w-lg">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                  🔐 Mật khẩu mới cần ít nhất 8 ký tự
                </div>
                {[
                  { key: 'matKhauCu', label: 'Mật khẩu hiện tại', show: 'cu' },
                  { key: 'matKhauMoi', label: 'Mật khẩu mới', show: 'moi' },
                  { key: 'xacNhanMatKhau', label: 'Xác nhận mật khẩu mới', show: 'xn' },
                ].map(({ key, label, show }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <div className="relative">
                      <input type={showPw[show] ? 'text' : 'password'} value={pwForm[key]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} required
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, [show]: !p[show] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw[show] ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={saving}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 shadow-sm">
                  {saving ? '⏳ Đang xử lý...' : '🔑 Đổi mật khẩu'}
                </button>
              </form>
            )}

            {/* TAB: Lịch sử đặt phòng */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
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
                    {/* Active bookings */}
                    {bookingsByStatus.active.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                          Đang hoạt động ({bookingsByStatus.active.length})
                        </h3>
                        <div className="space-y-3">
                          {bookingsByStatus.active.map(b => (
                            <BookingCard key={b.id} b={b} onDetail={() => setSelectedBookingId(b.id)} />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Done */}
                    {bookingsByStatus.done.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-500 mb-3">✅ Đã hoàn thành ({bookingsByStatus.done.length})</h3>
                        <div className="space-y-3">
                          {bookingsByStatus.done.map(b => (
                            <BookingCard key={b.id} b={b} onDetail={() => setSelectedBookingId(b.id)} muted />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Cancelled */}
                    {bookingsByStatus.cancelled.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 mb-3">🚫 Đã hủy / Hết hạn ({bookingsByStatus.cancelled.length})</h3>
                        <div className="space-y-3">
                          {bookingsByStatus.cancelled.map(b => (
                            <BookingCard key={b.id} b={b} onDetail={() => setSelectedBookingId(b.id)} muted />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
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
              {b.trangThai}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
            <span>📅 {fmtDate(b.ngayDen)} → {fmtDate(b.ngayDi)}</span>
            {b.soNgay && <span>🌙 {b.soNgay} đêm</span>}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-extrabold text-indigo-600 text-sm">{fmt(b.thanhTien)}</span>
            <button onClick={(e) => { e.stopPropagation(); onDetail(); }}
              className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition">
              Xem chi tiết →
            </button>
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

export default UserProfilePage;
