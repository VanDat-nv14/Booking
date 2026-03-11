import { useEffect, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon lỗi của Leaflet khi dùng với module bundler (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component để map cập nhật view khi center thay đổi
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
       map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

// Helper component để bắt sự kiện click trên bản đồ
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// ── Helpers ────────────────────────────────────
const ROLES = ['Admin', 'HotelManager', 'User'];
const ROLE_COLORS = {
  Admin: 'bg-red-100 text-red-700 border-red-200',
  HotelManager: 'bg-purple-100 text-purple-700 border-purple-200',
  User: 'bg-green-100 text-green-700 border-green-200',
};
const avatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`;

// ── Password strength validator ─────────────────
const validatePassword = (pw) => {
  if (!pw) return '';
  if (pw.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (!/[A-Z]/.test(pw)) return 'Phải có ít nhất 1 chữ hoa (A-Z)';
  if (!/[0-9]/.test(pw)) return 'Phải có ít nhất 1 chữ số (0-9)';
  if (!/@/.test(pw)) return 'Phải chứa ký tự @';
  return ''; // valid
};

const EyeIcon = ({ show }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {show
      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
    }
  </svg>
);

// ── User Modal Component ────────────────────────
const UserModal = ({ user, onClose, onSave }) => {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    hoTen: user?.hoTen || '',
    email: user?.email || '',
    sdt: user?.sdt || '',
    chucVu: user?.chucVu || 'User',
    trangThai: user?.trangThai !== undefined ? user.trangThai : true,
    matKhau: '',
    xacNhanMatKhau: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePwChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, matKhau: val }));
    if (!isEdit || val) setPwError(validatePassword(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password nếu có nhập (bắt buộc khi tạo mới)
    if (!isEdit || form.matKhau) {
      const err = validatePassword(form.matKhau);
      if (err) { setPwError(err); return; }
      if (form.matKhau !== form.xacNhanMatKhau) {
        setPwError('Mật khẩu xác nhận không khớp!');
        return;
      }
    }

    setSaving(true);
    try {
      const { xacNhanMatKhau, ...payload } = form;
      if (isEdit && !payload.matKhau) delete payload.matKhau;
      const res = isEdit
        ? await axiosClient.put(`/admin/users/${user.id}`, payload)
        : await axiosClient.post('/admin/users', payload);
      onSave(res.data, isEdit);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const pwStrength = form.matKhau ? (
    validatePassword(form.matKhau) ? 'weak' :
    form.matKhau.length >= 12 ? 'strong' : 'medium'
  ) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? '✏️ Chỉnh Sửa Người Dùng' : '➕ Thêm Người Dùng Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Họ và tên *</label>
              <input required value={form.hoTen} onChange={set('hoTen')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Nguyễn Văn A" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={set('email')}
                disabled={isEdit}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="user@email.com" />
              {isEdit && <p className="text-xs text-gray-400 mt-0.5">Email không thể thay đổi</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại</label>
              <input value={form.sdt} onChange={set('sdt')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="0901234567" />
            </div>

            {/* Password */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {isEdit ? 'Mật khẩu mới (để trống = không đổi)' : 'Mật khẩu *'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.matKhau}
                  onChange={handlePwChange}
                  required={!isEdit}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 outline-none ${
                    pwError ? 'border-red-400 focus:ring-red-300' :
                    pwStrength === 'strong' ? 'border-green-400 focus:ring-green-300' :
                    'border-gray-200 focus:ring-blue-400'}`}
                  placeholder={isEdit ? '(để trống nếu không muốn đổi)' : 'Ví dụ: MyPass@123'} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon show={showPw} />
                </button>
              </div>

              {/* Strength hint */}
              {form.matKhau && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1">
                    {['weak','medium','strong'].map((lvl, i) => (
                      <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors ${
                        pwStrength === 'strong' ? 'bg-green-500' :
                        pwStrength === 'medium' && i < 2 ? 'bg-yellow-400' :
                        pwStrength === 'weak' && i < 1 ? 'bg-red-400' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  {pwError
                    ? <p className="text-xs text-red-500">{pwError}</p>
                    : <p className="text-xs text-green-600">✓ Mật khẩu hợp lệ</p>}
                </div>
              )}

              {/* Requirements hint */}
              {(!isEdit || form.matKhau) && (
                <ul className="mt-1.5 text-xs text-gray-400 space-y-0.5 pl-1">
                  {[
                    [/[A-Z]/, 'Ít nhất 1 chữ hoa'],
                    [/[0-9]/, 'Ít nhất 1 chữ số'],
                    [/@/, 'Chứa ký tự @'],
                    [/.{8}/, 'Tối thiểu 8 ký tự'],
                  ].map(([regex, label]) => (
                    <li key={label} className={form.matKhau && regex.test(form.matKhau) ? 'text-green-600' : ''}>
                      {form.matKhau && regex.test(form.matKhau) ? '✓' : '○'} {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password — chỉ hiện khi đang nhập mật khẩu */}
            {(!isEdit || form.matKhau) && (
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Xác nhận mật khẩu *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.xacNhanMatKhau}
                    onChange={set('xacNhanMatKhau')}
                    required={!isEdit || !!form.matKhau}
                    className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 outline-none ${
                      form.xacNhanMatKhau && form.xacNhanMatKhau !== form.matKhau
                        ? 'border-red-400 focus:ring-red-300'
                        : form.xacNhanMatKhau && form.xacNhanMatKhau === form.matKhau
                        ? 'border-green-400 focus:ring-green-300'
                        : 'border-gray-200 focus:ring-blue-400'}`}
                    placeholder="Nhập lại mật khẩu" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
                {form.xacNhanMatKhau && (
                  <p className={`text-xs mt-1 ${form.xacNhanMatKhau === form.matKhau ? 'text-green-600' : 'text-red-500'}`}>
                    {form.xacNhanMatKhau === form.matKhau ? '✓ Mật khẩu khớp' : '✗ Mật khẩu không khớp'}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Vai trò *</label>
              <select value={form.chucVu} onChange={set('chucVu')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="text-xs font-semibold text-gray-600">Trạng thái</label>
              <button type="button"
                onClick={() => setForm((f) => ({ ...f, trangThai: !f.trangThai }))}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${form.trangThai ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block w-4 h-4 mt-1 transform bg-white rounded-full transition-transform ${form.trangThai ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs font-medium ${form.trangThai ? 'text-green-600' : 'text-gray-400'}`}>
                {form.trangThai ? 'Hoạt động' : 'Vô hiệu'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ── Role Quick-Change Dropdown ──────────────────
const RoleDropdown = ({ user, onRoleChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition hover:opacity-80 ${ROLE_COLORS[user.chucVu] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        {user.chucVu} ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 min-w-[140px]">
          {ROLES.filter((r) => r !== user.chucVu).map((r) => (
            <button key={r} onClick={() => { onRoleChange(user.id, r); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 transition ${ROLE_COLORS[r]}`}>
              → {r}
            </button>
          ))}
          <button onClick={() => setOpen(false)} className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-50">Đóng</button>
        </div>
      )}
    </div>
  );
};

// ── Toast ────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium
      ${type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
      {msg}
    </div>
  );
};

// ── Main AdminDashboard ──────────────────────────
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, logout, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  // User management state
  const [searchQ, setSearchQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalUser, setModalUser] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [toast, setToast] = useState(null);

  // Hotels state
  const [hotels, setHotels] = useState([]);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const HOTEL_FORM_DEFAULT = {
    ten: '', diaChi: '', soSao: 3, moTa: '',
    quocGiaId: '', tinhThanhId: '', viTriId: '', viTriName: '',
    gioNhanPhong: '14:00', gioTraPhong: '12:00',
    hinhAnhBia: '', hinhAnhs: [],
    managerEmail: '', managerPassword: '', managerName: '', managerConfirmPassword: ''
  };
  const [hotelFormData, setHotelFormData] = useState(HOTEL_FORM_DEFAULT);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [quocGias, setQuocGias]         = useState([]);
  const [tinhThanhs, setTinhThanhs]     = useState([]);
  const [viTrisInProvince, setViTrisInProvince] = useState([]);
  const [viTriMode, setViTriMode]       = useState('select'); // 'select' | 'create'
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  // Hotel Manager Account Form State
  const [showManagerPw, setShowManagerPw] = useState(false);
  const [showManagerConfirmPw, setShowManagerConfirmPw] = useState(false);
  const [managerPwError, setManagerPwError] = useState('');

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchBooking, setSearchBooking] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';

  const StatusBadge = ({ status }) => {
      const colors = {
          Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-blue-100 text-blue-800',
          CheckedIn: 'bg-indigo-100 text-indigo-800', CheckedOut: 'bg-purple-100 text-purple-800',
          Completed: 'bg-emerald-100 text-emerald-800', Cancelled: 'bg-gray-100 text-gray-800',
          Rejected: 'bg-red-100 text-red-800', NoShow: 'bg-orange-100 text-orange-800'
      };
      const label = {
          Pending: 'Chờ xác nhận', Confirmed: 'Đã xác nhận', CheckedIn: 'Đang lưu trú',
          CheckedOut: 'Đã trả phòng', Completed: 'Hoàn tất', Cancelled: 'Đã hủy',
          Rejected: 'Từ chối', NoShow: 'Khách không đến'
      };
      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{label[status] || status}</span>;
  };


  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await axiosClient.get('/admin/users');
      setUsers(res.data);
    } catch {
      if (!silent) showToast('Không thể tải danh sách người dùng!', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) setLoadingBookings(true);
    try {
      const res = await axiosClient.get('/admin/bookings');
      setBookings(res.data);
    } catch {
      if (!silent) showToast('Không thể tải danh sách đặt phòng!', 'error');
    } finally {
      if (!silent) setLoadingBookings(false);
    }
  }, [showToast]);

  const fetchBookingDetails = async (id) => {
      try {
          const res = await axiosClient.get(`/bookings/id/${id}`);
          setSelectedBooking(res.data);
      } catch (err) {
          showToast('Lỗi tải chi tiết đặt phòng', 'error');
      }
  };

  const handleBookingAction = async (action, id) => {
      setActionLoading(`${id}-${action}`);
      try {
          if (['confirm', 'checkin', 'no-show', 'complete'].includes(action)) {
              await axiosClient.put(`/bookings/${id}/${action}`);
          } else if (action === 'reject') {
              await axiosClient.put(`/bookings/${id}/reject`, { ghiChu: 'Admin từ chối' });
          } else if (action === 'checkout') {
              await axiosClient.post(`/bookings/${id}/checkout`, { phuongThuc: 'TienMat' });
          }
          showToast(`Cập nhật trạng thái thành công!`);
          fetchBookings();
          if (selectedBooking && selectedBooking.id === id) {
              fetchBookingDetails(id);
          }
      } catch (err) {
          showToast(err.response?.data?.message || 'Lỗi xử lý.', 'error');
      } finally {
          setActionLoading(null);
      }
  };

  // On first load, show spinner; subsequent tab revisits fetch silently
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchHotels = async () => {
    try {
      const res = await axiosClient.get('/hotels');
      setHotels(res.data);
    } catch { /* ignore */ }
  };

  const fetchQuocGias = async () => {
    try {
      const res = await axiosClient.get('/locations/quocgia');
      setQuocGias(res.data);
    } catch { /* ignore */ }
  };

  const fetchTinhThanhsForCountry = async (quocGiaId) => {
    if (!quocGiaId) { setTinhThanhs([]); return; }
    try {
      const res = await axiosClient.get(`/locations/tinhthanh?quocGiaId=${quocGiaId}`);
      setTinhThanhs(res.data);
    } catch { /* ignore */ }
  };

  const fetchViTrisForProvince = async (tinhThanhId) => {
    if (!tinhThanhId) { setViTrisInProvince([]); return; }
    try {
      const res = await axiosClient.get(`/locations/vitri?tinhThanhId=${tinhThanhId}`);
      setViTrisInProvince(res.data);
    } catch { /* ignore */ }
  };

  const handleQuocGiaChange = (quocGiaId) => {
    setHotelFormData(f => ({ ...f, quocGiaId, tinhThanhId: '', viTriId: '', viTriName: '' }));
    setTinhThanhs([]);
    setViTrisInProvince([]);
    setViTriMode('select');
    fetchTinhThanhsForCountry(quocGiaId);
  };

  const handleTinhThanhChange = (tinhThanhId) => {
    setHotelFormData(f => ({ ...f, tinhThanhId, viTriId: '', viTriName: '' }));
    setViTriMode('select');
    fetchViTrisForProvince(tinhThanhId);
  };

  useEffect(() => { 
    const silent = (activeTab === 'hotels' && hotels.length > 0)
                || (activeTab === 'bookings' && bookings.length > 0)
                || (activeTab === 'users' && users.length > 0);
    if (activeTab === 'hotels') {
      fetchHotels();
      if (quocGias.length === 0) fetchQuocGias();
    } else if (activeTab === 'bookings') {
      fetchBookings(silent);
    } else if (activeTab === 'users') {
      fetchUsers(silent);
    }
  }, [activeTab, fetchBookings, fetchUsers]);

  // ── User Actions ──────────────────────────────
  const handleSaveUser = (savedUser, isEdit) => {
    setUsers((prev) =>
      isEdit ? prev.map((u) => (u.id === savedUser.id ? savedUser : u)) : [savedUser, ...prev]
    );
    setModalUser(undefined);
    showToast(isEdit ? 'Cập nhật thành công!' : 'Tạo người dùng thành công!');
  };

  const handleRoleChange = async (id, newRole) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser?.chucVu === 'Admin' && newRole !== 'Admin') {
      const confirm = window.confirm(
        `⚠️ CẢNH BÁO NHẠY CẢM ⚠️\n\nBạn đang chuẩn bị HẠ QUYỀN của một Quản trị viên (Admin) xuống thành "${newRole}".\nHọ sẽ mất toàn bộ quyền truy cập vào bảng điều khiển này.\n\nBạn có chắc chắn muốn tiếp tục?`
      );
      if (!confirm) return;
    }

    try {
      const res = await axiosClient.put(`/admin/users/${id}/role`, null, { params: { role: newRole } });
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      showToast(`Đã chuyển role → ${newRole}`);
    } catch {
      showToast('Cập nhật role thất bại!', 'error');
    }
  };

  const handleStatusToggle = async (id) => {
    try {
      const res = await axiosClient.put(`/admin/users/${id}/status`);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    } catch {
      showToast('Cập nhật trạng thái thất bại!', 'error');
    }
  };

  const handleDelete = async (user) => {
    let confirmMsg = `Xóa tài khoản "${user.hoTen}" (${user.email})?\n\nNếu người dùng có lịch sử đặt phòng, tài khoản sẽ bị vô hiệu hóa thay vì xóa hẳn.`;
    
    if (user.chucVu === 'Admin') {
        confirmMsg = `⚠️ CẢNH BÁO XÓA QUẢN TRỊ VIÊN ⚠️\n\nBạn đang cố gắng xóa một tài khoản Admin ("${user.hoTen}").\nHành động này có thể ảnh hưởng nghiêm trọng đến hệ thống.\n\nBạn có HIỂU RÕ hành động này và vẫn muốn tiếp tục?`;
    }

    const hasBookings = window.confirm(confirmMsg);
    if (!hasBookings) return;
    try {
      const res = await axiosClient.delete(`/admin/users/${user.id}`);
      const { softDeleted, message } = res.data;
      if (softDeleted) {
        // Có booking liệu → chỉ update trạng thái trong danh sách
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, trangThai: false } : u));
      } else {
        // Xóa hẳn → remove khỏi danh sách
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
      showToast(message || 'Thao tác thành công!');
    } catch {
      showToast('Xóa thất bại!', 'error');
    }
  };


  // ── Hotel Actions ─────────────────────────────
  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel);
    const ttId  = hotel.viTri?.tinhThanh?.id || '';
    const qgId  = hotel.viTri?.tinhThanh?.quocGia?.id || '';
    setViTriMode('select');
    setShowMapPicker(false);
    // Load cascading data
    if (qgId) fetchTinhThanhsForCountry(qgId);
    if (ttId) fetchViTrisForProvince(ttId);
    setHotelFormData({
      ten: hotel.ten,
      diaChi: hotel.diaChi,
      soSao: hotel.soSao,
      moTa: hotel.moTa || '',
      quocGiaId: qgId,
      tinhThanhId: ttId,
      viTriId: hotel.viTri?.id || '',
      viTriName: '',
      gioNhanPhong: hotel.gioNhanPhong || '14:00',
      gioTraPhong: hotel.gioTraPhong || '12:00',
      hinhAnhBia: hotel.hinhAnhBia || '',
      hinhAnhs: hotel.hinhAnhs || [],
      viDo: hotel.viDo || 0,
      kinhDo: hotel.kinhDo || 0,
      managerEmail: '',
      managerPassword: '',
      managerName: '',
      managerConfirmPassword: ''
    });
    setNewImageUrl('');
    setManagerPwError('');
    setShowHotelModal(true);
  };


  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Xóa khách sạn này?')) return;
    try {
      await axiosClient.delete(`/hotels/${id}`);
      setHotels(hotels.filter((h) => h.id !== id));
      showToast('Đã xóa khách sạn!');
    } catch { showToast('Xóa thất bại!', 'error'); }
  };

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editingHotel && hotelFormData.managerEmail) {
        const err = validatePassword(hotelFormData.managerPassword);
        if (err) { setManagerPwError(err); return; }
        if (hotelFormData.managerPassword !== hotelFormData.managerConfirmPassword) {
            setManagerPwError('Mật khẩu xác nhận không khớp!');
            return;
        }
      }

      const { managerConfirmPassword, ...payload } = hotelFormData;
      // Xử lý vị trí: viTriId có sẵn hoặc viTriName mới
      if (payload.viTriId) {
        payload.viTriId = Number(payload.viTriId);
        delete payload.viTriName;
        delete payload.tinhThanhId;
      } else {
        delete payload.viTriId;
        if (payload.tinhThanhId) payload.tinhThanhId = Number(payload.tinhThanhId);
      }
      // Auto cover from first image if not set
      if (!payload.hinhAnhBia && payload.hinhAnhs?.length > 0) {
        payload.hinhAnhBia = payload.hinhAnhs[0];
      }
      
      // Remove empty manager fields to avoid validation errors
      if (!payload.managerEmail) {
        delete payload.managerEmail;
        delete payload.managerPassword;
        delete payload.managerName;
      }

      if (editingHotel) {
        await axiosClient.put(`/hotels/${editingHotel.id}`, payload);
        showToast('Cập nhật thành công!');
      } else {
        await axiosClient.post('/hotels', payload);
        showToast('Thêm khách sạn thành công!');
      }
      setShowHotelModal(false);
      setNewImageUrl('');
      fetchHotels();
    } catch (err) {
      showToast(err.response?.data?.error || 'Lưu thất bại!', 'error');
    }
  };

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setHotelFormData((d) => {
      const imgs = [...(d.hinhAnhs || []), url];
      return { ...d, hinhAnhs: imgs, hinhAnhBia: d.hinhAnhBia || imgs[0] };
    });
    setNewImageUrl('');
  };
  const removeImage = (url) => {
    setHotelFormData((d) => {
      const imgs = d.hinhAnhs.filter((u) => u !== url);
      return { ...d, hinhAnhs: imgs, hinhAnhBia: d.hinhAnhBia === url ? (imgs[0] || '') : d.hinhAnhBia };
    });
  };
  const setCover = (url) => setHotelFormData((d) => ({ ...d, hinhAnhBia: url }));

  /** Đọc file từ máy → base64 data URL rồi thêm vào danh sách */
  const addImageFromFile = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        setHotelFormData((d) => {
          const imgs = [...(d.hinhAnhs || []), dataUrl];
          return { ...d, hinhAnhs: imgs, hinhAnhBia: d.hinhAnhBia || imgs[0] };
        });
      };
      reader.readAsDataURL(file);
    });
    // Reset input để có thể chọn lại cùng file
    e.target.value = '';
  };


  // ── Filtered users ────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchQ = !searchQ || u.hoTen?.toLowerCase().includes(searchQ.toLowerCase()) || u.email?.toLowerCase().includes(searchQ.toLowerCase());
    const matchRole = !roleFilter || u.chucVu === roleFilter;
    return matchQ && matchRole;
  });

  const filteredBookings = bookings.filter(b => {
      let match = true;
      if (searchBooking) {
          const term = searchBooking.toLowerCase();
          const maPhieu = (b.maPhieu || b.maDatPhong || '').toLowerCase();
          const hoTen = (b.hoTenKhach || b.nguoiDung?.hoTen || '').toLowerCase();
          if (!maPhieu.includes(term) && !hoTen.includes(term)) match = false;
      }
      if (filterStatus && b.trangThai !== filterStatus) match = false;
      if (filterDate && b.ngayNhan !== filterDate && b.ngayDen !== filterDate) match = false;
      return match;
  });

  // ── Stats ─────────────────────────────────────
  const stats = {
    total: users.length,
    active: users.filter((u) => u.trangThai).length,
    admins: users.filter((u) => u.chucVu === 'Admin').length,
    managers: users.filter((u) => u.chucVu === 'HotelManager').length,
  };

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'users', label: 'Người Dùng', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'hotels', label: 'Khách Sạn', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'bookings', label: 'Đặt Phòng', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'reports', label: 'Báo Cáo', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center justify-center border-b border-blue-800">
          <h2 className="text-xl font-bold tracking-wide">🏨 ADMIN PANEL</h2>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {NAV.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === id ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800'}`}>
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center px-4 py-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition text-sm">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <span className="text-gray-500 text-sm">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800">{currentUser?.hoTen || 'Administrator'}</div>
              <div className="text-xs text-gray-400">Admin</div>
            </div>
            <img className="h-9 w-9 rounded-full border-2 border-blue-400 object-cover"
              src={avatar(currentUser?.hoTen || 'Admin')} alt="Admin" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">

          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Tổng Quan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tổng Người Dùng', value: stats.total, color: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
                  { label: 'Đang Hoạt Động', value: stats.active, color: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
                  { label: 'Quản Trị Viên', value: stats.admins, color: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
                  { label: 'Hotel Managers', value: stats.managers, color: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600' },
                ].map(({ label, value, color, bg, text }) => (
                  <div key={label} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${color}`}>
                    <p className="text-gray-500 text-xs font-medium">{label}</p>
                    <p className={`text-3xl font-bold mt-1 ${text}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h2>
                <button onClick={() => setModalUser(null)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                  <span className="text-lg leading-none">＋</span> Thêm Người Dùng
                </button>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="🔍 Tìm theo tên, email..."
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white" />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white">
                  <option value="">Tất cả vai trò</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button onClick={fetchUsers} className="px-3 py-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300 transition text-sm">
                  🔄 Tải lại
                </button>
              </div>

              {/* Stats bar */}
              <div className="flex gap-4 text-xs text-gray-500 bg-white rounded-lg px-4 py-2 shadow-sm">
                <span>Tổng: <strong>{filteredUsers.length}</strong></span>
                <span>|</span>
                {ROLES.map((r) => (
                  <span key={r}>{r}: <strong>{filteredUsers.filter((u) => u.chucVu === r).length}</strong></span>
                ))}
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-visible pb-16">
                {loading ? (
                  <div className="py-16 flex justify-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase rounded-tl-xl">Người dùng</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">SĐT</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ngày đăng ký</th>
                        <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Vai trò</th>
                        <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase rounded-tr-xl">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 border-b border-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-blue-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img src={user.avatarUrl || avatar(user.hoTen)} className="w-9 h-9 rounded-full object-cover" alt="" />
                              <div>
                                <p className="font-semibold text-gray-800">{user.hoTen}</p>
                                <p className="text-xs text-gray-400">ID: {user.id}</p>
                                {user.quocTich && <p className="text-xs text-gray-400">🌍 {user.quocTich}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{user.email}</td>
                          <td className="px-5 py-3 text-gray-400 text-xs">{user.sdt || '—'}</td>
                          <td className="px-5 py-3 text-xs text-gray-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <RoleDropdown user={user} onRoleChange={handleRoleChange} />
                          </td>
                          <td className="px-5 py-3 text-center">
                            <button onClick={() => handleStatusToggle(user.id)}
                              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${user.trangThai ? 'bg-green-500' : 'bg-gray-300'}`}>
                              <span className={`inline-block w-4 h-4 mt-1 transform bg-white rounded-full transition-transform ${user.trangThai ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setModalUser(user)}
                                className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition">
                                ✏️ Sửa
                              </button>
                              <button onClick={() => handleDelete(user)}
                                disabled={user.chucVu === 'Admin' && user.id === currentUser?.userId}
                                className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition disabled:opacity-30">
                                🗑️ Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-400">Không có người dùng nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── HOTELS TAB ── */}
          {activeTab === 'hotels' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Quản Lý Khách Sạn</h2>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  onClick={() => {
                    setEditingHotel(null);
                    setHotelFormData(HOTEL_FORM_DEFAULT);
                    setViTriMode('select');
                    setViTrisInProvince([]);
                    setManagerPwError('');
                    setShowHotelModal(true);
                  }}
                  >
                  ＋ Thêm Khách Sạn
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Địa chỉ</th>
                      <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Sao</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {hotels.map((h) => (
                      <tr key={h.id} className="hover:bg-blue-50 transition">
                        <td className="px-5 py-3 font-semibold text-gray-800">{h.ten}</td>
                        <td className="px-5 py-3 text-gray-500">{h.diaChi}</td>
                        <td className="px-5 py-3 text-center text-yellow-500 font-bold">{h.soSao} ★</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => handleEditHotel(h)} className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition mr-2">Sửa</button>
                          <button onClick={() => handleDeleteHotel(h.id)} className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition">Xóa</button>
                        </td>
                      </tr>
                    ))}
                    {hotels.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-gray-400">Chưa có khách sạn</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PLACEHOLDER TABS ── */}
          {['bookings', 'reports'].includes(activeTab) && (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <p className="text-4xl mb-4">🚧</p>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Đang Phát Triển</h3>
              <p className="text-gray-400 text-sm">Module {activeTab} sẽ sớm ra mắt.</p>
            </div>
          )}
        </div>
      </main>

      {/* User Modal */}
      {modalUser !== undefined && (
        <UserModal user={modalUser} onClose={() => setModalUser(undefined)} onSave={handleSaveUser} />
      )}

      {/* Hotel Modal */}
      {showHotelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowHotelModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800">
                {editingHotel ? '✏️ Chỉnh sửa khách sạn' : '🏨 Thêm khách sạn mới'}
              </h2>
              <button onClick={() => setShowHotelModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleHotelSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Basic fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tên khách sạn *</label>
                  <input required value={hotelFormData.ten} onChange={(e) => setHotelFormData({ ...hotelFormData, ten: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Grand Palace Hotel" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Địa chỉ *</label>
                  <input required value={hotelFormData.diaChi} onChange={(e) => setHotelFormData({ ...hotelFormData, diaChi: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="123 Đường ABC, Quận 1, TP.HCM" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Số sao</label>
                  <select value={hotelFormData.soSao} onChange={(e) => setHotelFormData({ ...hotelFormData, soSao: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                    {[1,2,3,4,5].map((s) => <option key={s} value={s}>{s} ★</option>)}
                  </select>
                </div>
                {/* ══ PHÂN CẤP ĐỊA ĐIỂM (3 CẤP) ══ */}
                <div className="col-span-2 bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">📍 Phân cấp địa điểm</p>

                  {/* CẤP 1: Quốc Gia */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">🌏 Quốc gia *</label>
                    <select
                      value={hotelFormData.quocGiaId}
                      onChange={e => handleQuocGiaChange(Number(e.target.value) || '')}
                      className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">-- Chọn quốc gia --</option>
                      {quocGias.map(qg => (
                        <option key={qg.id} value={qg.id}>{qg.ten}</option>
                      ))}
                    </select>
                  </div>

                  {/* CẤP 2: Tỉnh / Thành phố */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">🏙️ Tỉnh / Thành phố *</label>
                    {!hotelFormData.quocGiaId ? (
                      <div className="border border-dashed border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">Chọn quốc gia trước</div>
                    ) : (
                      <select
                        value={hotelFormData.tinhThanhId}
                        onChange={e => handleTinhThanhChange(Number(e.target.value) || '')}
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      >
                        <option value="">-- Chọn tỉnh/thành --</option>
                        {tinhThanhs.map(tt => (
                          <option key={tt.id} value={tt.id}>{tt.ten}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* CẤP 3: Vị trí */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-600">
                        � Vị trí {viTriMode === 'create' ? '(mới)' : ''} *
                      </label>
                      {hotelFormData.tinhThanhId && (
                        <div className="flex items-center gap-2">
                          {viTriMode === 'create' && (
                            <button type="button"
                              onClick={() => setShowMapPicker(v => !v)}
                              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200 font-medium">
                              {showMapPicker ? '✕ Đóng bản đồ' : '🗺 Chọn trên bản đồ'}
                            </button>
                          )}
                          <button type="button"
                            onClick={() => { setViTriMode(m => m === 'select' ? 'create' : 'select'); setShowMapPicker(false); }}
                            className="text-xs text-blue-600 hover:underline font-medium">
                            {viTriMode === 'select' ? '＋ Tạo vị trí mới' : '← Chọn có sẵn'}
                          </button>
                        </div>
                      )}
                    </div>

                    {!hotelFormData.tinhThanhId ? (
                      <div className="border border-dashed border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">Chọn tỉnh/thành trước</div>
                    ) : viTriMode === 'select' ? (
                      <select
                        value={hotelFormData.viTriId}
                        onChange={e => setHotelFormData(f => ({ ...f, viTriId: Number(e.target.value) || '', viTriName: '' }))}
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      >
                        <option value="">-- Chọn vị trí --</option>
                        {viTrisInProvince.map(vt => (
                          <option key={vt.id} value={vt.id}>{vt.ten}</option>
                        ))}
                        {viTrisInProvince.length === 0 && <option disabled>Chưa có vị trí → bấm "Tạo vị trí mới"</option>}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Ví dụ: Trung tâm, Bãi biển Mỹ Khê..."
                          value={hotelFormData.viTriName}
                          onChange={e => setHotelFormData(f => ({ ...f, viTriName: e.target.value, viTriId: '' }))}
                          className="w-full border border-blue-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                          autoFocus
                        />
                        {/* ── Leaflet Map Picker ── */}
                        {showMapPicker && (
                          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex flex-col">
                            <div className="flex flex-col gap-2 p-3 bg-white border-b border-gray-100">
                              <input
                                type="text"
                                placeholder="🔍 Tìm tên khu vực..."
                                value={mapSearchQuery}
                                onChange={e => setMapSearchQuery(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const q = mapSearchQuery.trim();
                                    if (q) setHotelFormData(f => ({ ...f, viTriName: q }));
                                  }
                                }}
                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Vĩ độ (Lat)</label>
                                  <input type="number" step="any" value={hotelFormData.viDo} onChange={e => setHotelFormData(f => ({ ...f, viDo: parseFloat(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm outline-none" />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Kinh độ (Lng)</label>
                                  <input type="number" step="any" value={hotelFormData.kinhDo} onChange={e => setHotelFormData(f => ({ ...f, kinhDo: parseFloat(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm outline-none" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="h-[300px] w-full relative z-0 bg-gray-100 flex items-center justify-center">
                               {typeof hotelFormData.viDo === 'number' && typeof hotelFormData.kinhDo === 'number' && !isNaN(hotelFormData.viDo) && !isNaN(hotelFormData.kinhDo) ? (
                                 <MapContainer center={[hotelFormData.viDo, hotelFormData.kinhDo]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapUpdater center={[hotelFormData.viDo, hotelFormData.kinhDo]} />
                                    <MapClickHandler onLocationSelect={(lat, lng) => setHotelFormData(f => ({...f, viDo: lat, kinhDo: lng}))} />
                                    <Marker position={[hotelFormData.viDo, hotelFormData.kinhDo]} />
                                  </MapContainer>
                               ) : <span className="text-sm text-gray-400">Tọa độ chưa khả dụng</span>}
                            </div>
                            <div className="bg-white p-2 border-t flex justify-between items-center">
                              <p className="text-[10px] text-gray-500 font-medium">✨ Click trên bản đồ để ghim tự động nhận toạ độ.</p>
                              <button type="button"
                                onClick={() => {
                                  if (mapSearchQuery.trim()) {
                                    setHotelFormData(f => ({ ...f, viTriName: mapSearchQuery.trim() }));
                                  }
                                  setShowMapPicker(false);
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium">
                                Xong
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Google Maps Preview (địa chỉ) (tắt ở chức năng Map Leaflet) ── */}
                {hotelFormData.diaChi && !showMapPicker && (
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">🗺️ Xem trước vị trí (theo địa chỉ)</label>
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm relative h-[200px] z-0 bg-gray-100 flex items-center justify-center">
                       {typeof hotelFormData.viDo === 'number' && typeof hotelFormData.kinhDo === 'number' && !isNaN(hotelFormData.viDo) && !isNaN(hotelFormData.kinhDo) ? (
                         <MapContainer center={[hotelFormData.viDo, hotelFormData.kinhDo]} zoom={15} style={{ height: '100%', width: '100%' }} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapUpdater center={[hotelFormData.viDo, hotelFormData.kinhDo]} />
                            <Marker position={[hotelFormData.viDo, hotelFormData.kinhDo]} />
                          </MapContainer>
                       ) : <span className="text-sm text-gray-400">Tọa độ chưa khả dụng</span>}
                        <div className="absolute inset-0 bg-transparent z-[1000]" title="Bản đồ chỉ xem trước. Bấm vào 'Chọn trên bản đồ' ở phần Vị trí để chỉnh sửa toạ độ."></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Bản đồ tự động cập nhật Toạ độ theo ghim vị trí</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Giờ nhận phòng</label>
                  <input type="time" value={hotelFormData.gioNhanPhong} onChange={(e) => setHotelFormData({ ...hotelFormData, gioNhanPhong: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Giờ trả phòng</label>
                  <input type="time" value={hotelFormData.gioTraPhong} onChange={(e) => setHotelFormData({ ...hotelFormData, gioTraPhong: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Mô tả</label>
                  <textarea rows={2} value={hotelFormData.moTa} onChange={(e) => setHotelFormData({ ...hotelFormData, moTa: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                    placeholder="Mô tả ngắn về khách sạn..." />
                </div>
              </div>

              {/* ── Manager Info (Tạo Mới) ── */}
              {!editingHotel && (() => {
                const managerPwStrength = hotelFormData.managerPassword ? (
                  validatePassword(hotelFormData.managerPassword) ? 'weak' :
                  hotelFormData.managerPassword.length >= 12 ? 'strong' : 'medium'
                ) : null;
                
                return (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 space-y-4 bg-white mt-4">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                     <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                     <p className="text-base font-bold text-gray-800 tracking-wide">Thêm Người Dùng Mới (Quản Lý)</p>
                  </div>
                  
                  {managerPwError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{managerPwError}</div>}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-xs font-semibold text-gray-600 block mb-1">Họ và tên *</label>
                       <input value={hotelFormData.managerName} onChange={(e) => setHotelFormData({ ...hotelFormData, managerName: e.target.value })}
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                         placeholder="Nguyễn Văn A" />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Email *</label>
                      <input type="email" value={hotelFormData.managerEmail} onChange={(e) => setHotelFormData({ ...hotelFormData, managerEmail: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-blue-50"
                        placeholder="admin@hotel.com" />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Mật khẩu *</label>
                      <div className="relative">
                        <input type={showManagerPw ? 'text' : 'password'} value={hotelFormData.managerPassword} 
                          onChange={(e) => { 
                             setHotelFormData({ ...hotelFormData, managerPassword: e.target.value });
                             if (e.target.value) setManagerPwError(validatePassword(e.target.value));
                          }}
                          className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 outline-none ${
                            managerPwError ? 'border-red-400 focus:ring-red-300' :
                            managerPwStrength === 'strong' ? 'border-green-400 focus:ring-green-300' :
                            'bg-blue-50 border-gray-200 focus:ring-purple-500'}`}
                          placeholder="••••••" />
                        <button type="button" onClick={() => setShowManagerPw(!showManagerPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <EyeIcon show={showManagerPw} />
                        </button>
                      </div>
                      
                      {hotelFormData.managerPassword && (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex gap-1">
                            {['weak','medium','strong'].map((lvl, i) => (
                              <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors ${
                                managerPwStrength === 'strong' ? 'bg-green-500' :
                                managerPwStrength === 'medium' && i < 2 ? 'bg-yellow-400' :
                                managerPwStrength === 'weak' && i < 1 ? 'bg-red-400' : 'bg-gray-200'}`} />
                            ))}
                          </div>
                          {managerPwError
                            ? <p className="text-xs text-red-500">{managerPwError}</p>
                            : <p className="text-xs text-green-600">✓ Mật khẩu hợp lệ</p>}
                        </div>
                      )}
                      
                      {hotelFormData.managerPassword && (
                        <ul className="mt-2 text-xs text-gray-500 space-y-1 pl-1">
                          {[
                            [/[A-Z]/, 'Ít nhất 1 chữ hoa'],
                            [/[0-9]/, 'Ít nhất 1 chữ số'],
                            [/@/, 'Chứa ký tự @'],
                            [/.{8}/, 'Tối thiểu 8 ký tự'],
                          ].map(([regex, label]) => (
                            <li key={label} className={`flex items-center gap-1.5 ${regex.test(hotelFormData.managerPassword) ? 'text-green-600 font-medium' : ''}`}>
                              {regex.test(hotelFormData.managerPassword) 
                                ? <svg className="w-3.5 h-3.5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                : <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"></circle></svg>}
                              {label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    {hotelFormData.managerPassword && (
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Xác nhận mật khẩu *</label>
                        <div className="relative">
                          <input
                            type={showManagerConfirmPw ? 'text' : 'password'}
                            value={hotelFormData.managerConfirmPassword}
                            onChange={(e) => setHotelFormData({ ...hotelFormData, managerConfirmPassword: e.target.value })}
                            className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 outline-none ${
                              hotelFormData.managerConfirmPassword && hotelFormData.managerConfirmPassword !== hotelFormData.managerPassword
                                ? 'border-red-400 focus:ring-red-300'
                                : hotelFormData.managerConfirmPassword && hotelFormData.managerConfirmPassword === hotelFormData.managerPassword
                                ? 'border-green-400 focus:ring-green-300'
                                : 'border-gray-200 focus:ring-purple-500'}`}
                            placeholder="Nhập lại mật khẩu" />
                          <button type="button" onClick={() => setShowManagerConfirmPw(!showManagerConfirmPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <EyeIcon show={showManagerConfirmPw} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
                );
              })()}

              {/* ── Image Manager ── */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">🖼️ Quản lý hình ảnh</p>

                {/* Add image URL */}
                <div className="flex gap-2">
                  <input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                    placeholder="Dán URL hình ảnh vào đây (https://...)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white" />
                  <button type="button" onClick={addImage}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition whitespace-nowrap">
                    ＋ Thêm URL
                  </button>
                  <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Tải ảnh từ máy
                    <input type="file" multiple accept="image/*" className="hidden" onChange={addImageFromFile} />
                  </label>
                </div>

                {/* Image grid */}
                {hotelFormData.hinhAnhs?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {hotelFormData.hinhAnhs.map((url) => {
                      const isCover = url === hotelFormData.hinhAnhBia;
                      return (
                        <div key={url} className={`relative rounded-xl overflow-hidden group border-2 transition ${
                          isCover ? 'border-yellow-400 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}>
                          <img src={url} alt="" className="w-full h-28 object-cover" onError={(e) => { e.target.src='https://via.placeholder.com/200x112?text=Lỗi+URL'; }}/>

                          {/* Cover badge */}
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                              ★ Bìa
                            </span>
                          )}

                          {/* Overlay actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-2">
                            {!isCover && (
                              <button type="button" onClick={() => setCover(url)}
                                className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 text-xs font-bold px-2 py-1 rounded-lg transition">
                                ★ Đặt bìa
                              </button>
                            )}
                            <button type="button" onClick={() => removeImage(url)}
                              className="ml-auto bg-red-500 hover:bg-red-400 text-white text-xs font-bold px-2 py-1 rounded-lg transition">
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                    Chưa có hình ảnh. Thêm URL ảnh ở trên.
                  </div>
                )}

                {/* Cover preview row */}
                {hotelFormData.hinhAnhBia && (
                  <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <img src={hotelFormData.hinhAnhBia} className="w-10 h-10 rounded-lg object-cover border border-yellow-300" alt="cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-yellow-800">★ Ảnh bìa hiện tại</p>
                      <p className="text-xs text-gray-400 truncate">{hotelFormData.hinhAnhBia}</p>
                    </div>
                    <button type="button" onClick={() => setHotelFormData((d) => ({ ...d, hinhAnhBia: '' }))}
                      className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowHotelModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
                <button type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* ── BOOKINGS TAB ── */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-gray-800">Quản Lý Đặt Phòng Toàn Cầu</h2>
                <button onClick={fetchBookings} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                  ↻ Làm mới
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Tìm Khách / Mã</label>
                      <input value={searchBooking} onChange={e => setSearchBooking(e.target.value)} placeholder="Tên khách, Mã phiếu..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" />
                  </div>
                  <div className="w-40">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Trạng Thái</label>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50">
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
                      <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" />
                  </div>
                  <div className="flex items-end">
                      <button onClick={() => {setSearchBooking(''); setFilterStatus(''); setFilterDate('');}} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors h-[38px]">Xóa Lọc</button>
                  </div>
              </div>

              {loadingBookings ? (
                  <div className="py-20 flex justify-center">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
              ) : filteredBookings.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
                      <p className="text-gray-500 font-medium">Không tìm thấy đặt phòng nào</p>
                  </div>
              ) : (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto pb-6">
                          <table className="min-w-full text-sm">
                              <thead>
                                  <tr className="bg-gray-50 border-b border-gray-100">
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách sạn</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã Phiếu</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nhận Phòng</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tổng Tiền</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng Thái</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hành Động</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                  {filteredBookings.map(b => (
                                      <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                                          <td className="px-4 py-3 text-gray-800 font-medium">{b.phong?.khachSan?.ten}</td>
                                          <td className="px-4 py-3">
                                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                  {b.maPhieu || `#${b.id}`}
                                              </span>
                                          </td>
                                          <td className="px-4 py-3 text-gray-700">{b.hoTenKhach || b.nguoiDung?.hoTen || 'N/A'}</td>
                                          <td className="px-4 py-3 text-gray-600">{formatDate(b.ngayNhan)}</td>
                                          <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(b.thanhTien || 0)}</td>
                                          <td className="px-4 py-3"><StatusBadge status={b.trangThai} /></td>
                                          <td className="px-4 py-3">
                                              <button onClick={() => fetchBookingDetails(b.id)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition">
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

          {/* Booking Details Modal (Admin view) */}
          {selectedBooking && activeTab === 'bookings' && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                          <div>
                              <h2 className="font-bold text-lg text-gray-800">Chi Tiết Đặt Phòng <span className="text-blue-600 font-mono ml-2">#{selectedBooking.maDatPhong || selectedBooking.id}</span></h2>
                              <p className="text-xs text-gray-500 mt-1">Trạng thái: <StatusBadge status={selectedBooking.trangThai} /></p>
                          </div>
                          <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                      </div>
                      <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                          <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                      <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Thông Tin Khách</h4>
                                      <p className="text-sm"><span className="text-gray-500 inline-block w-24">Khách:</span> <span className="font-semibold text-gray-800">{selectedBooking.hoTenKhach || 'N/A'}</span></p>
                                      <p className="text-sm mt-1"><span className="text-gray-500 inline-block w-24">Email:</span> {selectedBooking.emailKhach || 'N/A'}</p>
                                      <p className="text-sm mt-1"><span className="text-gray-500 inline-block w-24">Số điện thoại:</span> {selectedBooking.sdtKhach || 'N/A'}</p>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                      <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Thông Tin Phòng & Khách Sạn</h4>
                                      <p className="text-sm"><span className="text-gray-500 inline-block w-24">Khách sạn:</span> <span className="font-semibold text-gray-800">{selectedBooking.tenKhachSan || 'N/A'}</span></p>
                                      <p className="text-sm"><span className="text-gray-500 inline-block w-24">Phòng:</span> <span className="font-semibold text-gray-800">{selectedBooking.tenPhong || 'N/A'} ({selectedBooking.soPhong || 'N/A'})</span></p>
                                      <p className="text-sm mt-1"><span className="text-gray-500 inline-block w-24">Loại:</span> {selectedBooking.loaiPhong || 'N/A'}</p>
                                      <div className="flex gap-4 mt-3 bg-gray-50 p-2 rounded-lg text-center">
                                          <div className="flex-1">
                                              <p className="text-xs text-gray-400 font-semibold">Ngày Đến</p>
                                              <p className="text-sm font-bold text-blue-700">{formatDate(selectedBooking.ngayDen)}</p>
                                          </div>
                                          <div className="flex-1 border-l border-gray-200">
                                              <p className="text-xs text-gray-400 font-semibold">Ngày Đi</p>
                                              <p className="text-sm font-bold text-orange-700">{formatDate(selectedBooking.ngayDi)}</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div className="space-y-4">
                                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                      <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Hóa Đơn & Thanh Toán</h4>
                                      <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                              <span className="text-gray-600">Tiền phòng gốc:</span>
                                              <span className="font-medium text-gray-800">{formatCurrency(selectedBooking.giaPhongGoc || 0)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                              <span className="text-gray-600">Thanh toán:</span>
                                              <span className="font-medium text-orange-600">{selectedBooking.trangThaiThanhToan}</span>
                                          </div>
                                      </div>

                                      {(selectedBooking.chiTietDichVus?.length > 0 || selectedBooking.phuThus?.length > 0) && (
                                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                                              {selectedBooking.chiTietDichVus?.map((dv, i) => (
                                                  <div key={`dv-${i}`} className="flex justify-between text-gray-600">
                                                      <span>{dv.dichVu?.ten} (x{dv.soLuong})</span>
                                                      <span>{formatCurrency((dv.donGiaLucDat || 0) * (dv.soLuong || 1))}</span>
                                                  </div>
                                              ))}
                                              {selectedBooking.phuThus?.map((pt, i) => (
                                                  <div key={`pt-${i}`} className="flex justify-between text-gray-600">
                                                      <span>Phụ thu: {pt.loaiPhuThu}</span>
                                                      <span>{formatCurrency(pt.soTien || 0)}</span>
                                                  </div>
                                              ))}
                                          </div>
                                      )}

                                      <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center">
                                          <span className="font-bold text-gray-700">TỔNG CỘNG:</span>
                                          <span className="text-lg font-black text-blue-600">{formatCurrency(selectedBooking.thanhTien)}</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="px-6 py-4 bg-white border-t flex flex-wrap gap-3 justify-end items-center">
                          {selectedBooking.trangThai === 'Pending' && (
                              <>
                                  <button onClick={() => handleBookingAction('reject', selectedBooking.id)} disabled={actionLoading} className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold rounded-lg transition-colors">Từ chối (Reject)</button>
                                  <button onClick={() => handleBookingAction('confirm', selectedBooking.id)} disabled={actionLoading} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Xác nhận (Confirm)</button>
                              </>
                          )}
                          {selectedBooking.trangThai === 'Confirmed' && (
                              <button onClick={() => handleBookingAction('checkin', selectedBooking.id)} disabled={actionLoading} className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">Nhận phòng (Check-in)</button>
                          )}
                          {selectedBooking.trangThai === 'CheckedIn' && (
                              <button onClick={() => handleBookingAction('checkout', selectedBooking.id)} disabled={actionLoading} className="px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 shadow-sm transition-colors w-full sm:w-auto">Thanh toán & Trả phòng (Check-out)</button>
                          )}
                          {selectedBooking.trangThai === 'CheckedOut' && (
                              <button onClick={() => handleBookingAction('complete', selectedBooking.id)} disabled={actionLoading} className="px-5 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 shadow-sm transition-colors">Hoàn tất (Complete)</button>
                          )}
                      </div>
                  </div>
              </div>
          )}


      <Toast msg={toast?.msg} type={toast?.type} />
    </div>
  );
};

export default AdminDashboard;
