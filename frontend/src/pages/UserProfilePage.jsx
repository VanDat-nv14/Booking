import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=4f46e5&color=fff&bold=true&size=128`;

/** Avatar hiển thị ảnh hoặc fallback initials khi load lỗi */
const AvatarImage = ({ src, fallbackName, className }) => {
  const [error, setError] = useState(false);
  const initials = (fallbackName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-indigo-500 text-white font-bold ${className}`}>
        {initials}
      </div>
    );
  }
  return (
    <img src={src} alt="Avatar" className={className}
      onError={() => setError(true)} />
  );
};

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
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookRes, invRes] = await Promise.all([
          axiosClient.get(`/bookings/id/${bookingId}`),
          axiosClient.get(`/bookings/${bookingId}/invoice`).catch(() => ({ data: null })),
        ]);
        setDetail(bookRes.data);
        setInvoice(invRes.data);
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
  const { user: authUser, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const userId = authUser?.userId;

  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState({
    hoTen: '', tenHienThi: '', email: '', sdt: '', chucVu: '',
    ngaySinh: '', quocTich: '', gioiTinh: '', diaChi: '',
    soHoChieu: '', hoChieuTen: '', hoChieuHo: '', hoChieuQuocGia: '', hoChieuNgayHetHan: '',
    avatarUrl: ''
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);

  // Edit state per field (null = closed, fieldKey = open)
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Passport form state
  const [showPassportForm, setShowPassportForm] = useState(false);
  const [passportForm, setPassportForm] = useState({ soHoChieu: '', hoChieuTen: '', hoChieuHo: '', hoChieuQuocGia: '', hoChieuNgayHetHan: '' });

  // Avatar editing state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarInput, setAvatarInput] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarTab, setAvatarTab] = useState('file'); // 'file' | 'url'

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
        setBookings(bookingRes.data || []);
      } catch {
        showToast('Không thể tải thông tin!', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const saveField = async (fieldData) => {
    setSaving(true);
    try {
      const res = await axiosClient.put(`/user/${userId}`, fieldData);
      setProfile(prev => ({ ...prev, ...res.data }));
      setEditingField(null);
      showToast('Cập nhật thành công!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Cập nhật thất bại!', 'error');
    } finally { setSaving(false); }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    setSaving(true);
    try {
      if (avatarTab === 'file' && avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const res = await axiosClient.post(`/user/${userId}/avatar`, formData, {
          headers: { 'Content-Type': undefined }   // let browser set multipart/form-data + boundary
        });
        setProfile(prev => ({ ...prev, ...res.data }));
        showToast('Cập nhật ảnh đại diện thành công!');
        updateAvatar(res.data.avatarUrl || null);
      } else if (avatarTab === 'url' && avatarInput.trim()) {
        const res = await axiosClient.put(`/user/${userId}`, { avatarUrl: avatarInput.trim() });
        setProfile(prev => ({ ...prev, ...res.data }));
        showToast('Cập nhật ảnh đại diện thành công!');
        updateAvatar(avatarInput.trim());
      } else {
        showToast('Vui lòng chọn ảnh hoặc nhập URL!', 'error');
        setSaving(false);
        return;
      }
      setShowAvatarModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarInput('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Cập nhật thất bại!', 'error');
    } finally { setSaving(false); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.matKhauMoi !== pwForm.xacNhanMatKhau) { showToast('Mật khẩu xác nhận không khớp!', 'error'); return; }
    setSaving(true);
    try {
      await axiosClient.put(`/user/${userId}`, pwForm);
      setPwForm({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
      showToast('Đổi mật khẩu thành công!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Đổi mật khẩu thất bại!', 'error');
    } finally { setSaving(false); }
  };

  const BACKEND = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
  const avatarUrl = profile.avatarUrl || authUser?.avatarUrl;
  const displayAvatar = avatarUrl
    ? (avatarUrl.startsWith('http') ? avatarUrl : BACKEND + avatarUrl)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.hoTen || authUser?.hoTen || 'U')}&background=4f46e5&color=fff&bold=true&size=128`;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Profile field rows config
  const profileRows = [
    {
      key: 'hoTen', label: 'Tên', value: profile.hoTen, inputType: 'text',
      placeholder: 'Nguyễn Văn A', required: true,
      hint: null
    },
    {
      key: 'tenHienThi', label: 'Tên hiển thị', value: profile.tenHienThi,
      inputType: 'text', placeholder: 'Chọn tên hiển thị',
      hint: null
    },
    {
      key: 'email', label: 'Địa chỉ email', value: profile.email,
      inputType: 'email', readOnly: true,
      hint: 'Đây là địa chỉ email bạn dùng để đăng nhập. Chúng tôi cũng sẽ gửi các xác nhận đặt chỗ tới địa chỉ này.',
      badge: { text: 'Xác thực', color: 'bg-green-600 text-white' }
    },
    {
      key: 'sdt', label: 'Số điện thoại', value: profile.sdt,
      inputType: 'tel', placeholder: 'Thêm số điện thoại của bạn',
      hint: 'Chỗ nghỉ hoặc địa điểm tham quan bạn đặt sẽ liên lạc với bạn qua số này nếu cần.'
    },
    {
      key: 'ngaySinh', label: 'Ngày sinh', value: profile.ngaySinh,
      inputType: 'date', placeholder: 'Nhập ngày sinh của bạn',
      hint: null
    },
    {
      key: 'quocTich', label: 'Quốc tịch', value: profile.quocTich,
      inputType: 'text', placeholder: 'Chọn vùng/quốc gia của bạn',
      hint: null
    },
    {
      key: 'gioiTinh', label: 'Giới tính', value: profile.gioiTinh,
      inputType: 'select', placeholder: 'Chọn giới tính',
      options: ['Nam', 'Nữ', 'Khác'],
      hint: null
    },
    {
      key: 'diaChi', label: 'Địa chỉ', value: profile.diaChi,
      inputType: 'text', placeholder: 'Nhập địa chỉ',
      hint: null
    },
  ];

  const passportSummary = profile.soHoChieu
    ? `${[profile.hoChieuHo, profile.hoChieuTen].filter(Boolean).join(' ')} · ${profile.soHoChieu}${profile.hoChieuNgayHetHan ? ` · HH: ${profile.hoChieuNgayHetHan}` : ''}`
    : null;

  const TABS = [
    { id: 'info', label: '👤 Thông tin cá nhân' },
    { id: 'security', label: '🔒 Bảo mật' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBookingId && (
        <BookingDetailModal bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} />
      )}

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={e => { if (e.target === e.currentTarget) setShowAvatarModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">📷 Cập nhật ảnh đại diện</h3>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {[{ id: 'file', label: '📁 Từ máy tính' }, { id: 'url', label: '🔗 Từ URL' }].map(t => (
                <button key={t.id} onClick={() => { setAvatarTab(t.id); setAvatarFile(null); setAvatarPreview(null); setAvatarInput(''); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${avatarTab === t.id ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* File upload tab */}
            {avatarTab === 'file' && (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
                  <span className="text-3xl mb-1">📷</span>
                  <span className="text-sm text-blue-600 font-semibold">Nhấn để chọn ảnh</span>
                  <span className="text-xs text-gray-400">JPEG, PNG, GIF, WebP — tối đa 50MB</span>
                </label>
                {avatarPreview && (
                  <div className="flex justify-center">
                    <img src={avatarPreview} alt="Preview" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                  </div>
                )}
              </div>
            )}

            {/* URL tab */}
            {avatarTab === 'url' && (
              <div className="space-y-3">
                <input type="url" value={avatarInput} onChange={e => setAvatarInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                {avatarInput && (
                  <div className="flex justify-center">
                    <img src={avatarInput} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow"
                         onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleSaveAvatar} disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60">
                {saving ? '⏳ Đang lưu...' : '💾 Lưu ảnh'}
              </button>
              <button onClick={() => { setShowAvatarModal(false); setAvatarFile(null); setAvatarPreview(null); setAvatarInput(''); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-500 mt-1 text-sm">Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng ra sao.</p>
          </div>

          {/* Avatar with camera button */}
          <div className="relative flex-shrink-0 ml-4">
            <AvatarImage
              src={displayAvatar}
              fallbackName={profile.hoTen || authUser?.hoTen || 'U'}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button onClick={() => { setAvatarInput(profile.avatarUrl || authUser?.avatarUrl || ''); setShowAvatarModal(true); }}
              className="absolute bottom-0 right-0 w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-gray-800 transition border-2 border-white"
              title="Thay đổi ảnh đại diện">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === t.id
                  ? 'text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Thông tin */}
        {activeTab === 'info' && (
          <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {profileRows.map((row) => (
              <div key={row.key}>
                {/* View row */}
                {editingField !== row.key ? (
                  <div className="flex items-start justify-between px-6 py-5 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{row.label}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm ${row.value ? 'text-gray-700' : 'text-gray-400'}`}>
                          {row.value || row.placeholder}
                        </span>
                        {row.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${row.badge.color}`}>
                            {row.badge.text}
                          </span>
                        )}
                      </div>
                      {row.hint && <p className="text-xs text-gray-500 mt-1.5 max-w-md">{row.hint}</p>}
                    </div>
                    {!row.readOnly && (
                      <button
                        onClick={() => { setEditingField(row.key); setEditValue(row.value || ''); }}
                        className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition flex-shrink-0 mt-0.5">
                        {row.actionLabel || 'Chỉnh sửa'}
                      </button>
                    )}
                  </div>
                ) : (
                  /* Edit row */
                  <div className="px-6 py-5 bg-blue-50/30 space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">{row.label}</label>
                    {row.inputType === 'select' ? (
                      <select value={editValue} onChange={e => setEditValue(e.target.value)}
                        className="w-full max-w-sm border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white">
                        <option value="">{row.placeholder}</option>
                        {row.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={row.inputType}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        placeholder={row.placeholder}
                        className="w-full max-w-sm border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        autoFocus
                      />
                    )}
                    <div className="flex gap-2">
                      <button
                        disabled={saving}
                        onClick={() => saveField({ [row.key]: editValue })}
                        className="px-5 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-60">
                        {saving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button onClick={() => setEditingField(null)}
                        className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Passport Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-start justify-between px-6 py-5 gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 mb-1">Thông tin hộ chiếu</p>
                <p className={`text-sm ${passportSummary ? 'text-gray-700' : 'text-gray-400'}`}>
                  {passportSummary || 'Lưu thông tin hộ chiếu để sử dụng cho lần tới khi đặt chỗ nghỉ, chuyến bay hoặc hoạt động tham quan.'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!showPassportForm) {
                    setPassportForm({
                      soHoChieu: profile.soHoChieu || '',
                      hoChieuTen: profile.hoChieuTen || '',
                      hoChieuHo: profile.hoChieuHo || '',
                      hoChieuQuocGia: profile.hoChieuQuocGia || '',
                      hoChieuNgayHetHan: profile.hoChieuNgayHetHan || '',
                    });
                  }
                  setShowPassportForm(f => !f);
                }}
                className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition flex-shrink-0 mt-0.5">
                {showPassportForm ? 'Hủy' : (passportSummary ? 'Chỉnh sửa' : 'Thêm hộ chiếu')}
              </button>
            </div>

            {showPassportForm && (
              <div className="px-6 pb-6 border-t border-gray-100 pt-5 space-y-4 bg-blue-50/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên <span className="text-red-500">*</span></label>
                    <input type="text" value={passportForm.hoChieuTen}
                      onChange={e => setPassportForm(f => ({ ...f, hoChieuTen: e.target.value }))}
                      placeholder="Nhập tên"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                    <p className="text-xs text-gray-400 mt-1">Vui lòng nhập chính xác tên như trên hộ chiếu</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Họ <span className="text-red-500">*</span></label>
                    <input type="text" value={passportForm.hoChieuHo}
                      onChange={e => setPassportForm(f => ({ ...f, hoChieuHo: e.target.value }))}
                      placeholder="Nhập họ"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quốc gia cấp giấy tờ <span className="text-red-500">*</span></label>
                    <input type="text" value={passportForm.hoChieuQuocGia}
                      onChange={e => setPassportForm(f => ({ ...f, hoChieuQuocGia: e.target.value }))}
                      placeholder="Việt Nam"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số hộ chiếu <span className="text-red-500">*</span></label>
                    <input type="text" value={passportForm.soHoChieu}
                      onChange={e => setPassportForm(f => ({ ...f, soHoChieu: e.target.value }))}
                      placeholder="Nhập mã số giấy tờ"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                </div>
                <div className="max-w-xs">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày hết hạn <span className="text-red-500">*</span></label>
                  <input type="date" value={passportForm.hoChieuNgayHetHan}
                    onChange={e => setPassportForm(f => ({ ...f, hoChieuNgayHetHan: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                  <p className="text-xs text-gray-400 mt-1.5">Chúng tôi sẽ lưu trữ và bảo mật dữ liệu này.</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button disabled={saving}
                    onClick={async () => { await saveField(passportForm); setShowPassportForm(false); }}
                    className="px-5 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-60">
                    {saving ? 'Đang lưu...' : 'Lưu hộ chiếu'}
                  </button>
                  <button onClick={() => setShowPassportForm(false)}
                    className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        )}

        {/* TAB: Bảo mật */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <form onSubmit={handleChangePw} className="p-6 space-y-5 max-w-lg">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                🔐 Mật khẩu mới cần ít nhất 8 ký tự, chứa chữ hoa, số và ký tự @
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
          </div>
        )}
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
