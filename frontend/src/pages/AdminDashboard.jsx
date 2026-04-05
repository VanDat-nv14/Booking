import { useEffect, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';

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

const ADMIN_TAB_IDS = new Set([
  'dashboard', 'users', 'hotels', 'bookings', 'reports', 'guestReports',
  'notifications', 'discounts',
]);

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
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]); // All bookings

  // ── REVENUE REPORT STATE ──
  const [revenueData, setRevenueData] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState('');
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // ── FILTER & SEARCH ──
  const [loading, setLoading] = useState(true);
  const { token, logout, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ADMIN_TAB_IDS.has(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  // User management state
  const [searchQ, setSearchQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalUser, setModalUser] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [toast, setToast] = useState(null);

  // Hotels state
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const HOTEL_FORM_DEFAULT = {
    ten: '', diaChi: '', soSao: 3, moTa: '',
    quocGiaId: '', quocGiaName: '', tinhThanhId: '', tinhThanhName: '', viTriId: '', viTriName: '',
    gioNhanPhong: '14:00', gioTraPhong: '12:00',
    hinhAnhBia: '', hinhAnhs: [],
    viDo: null, kinhDo: null, // Tọa độ hiển thị trên bản đồ
    managerEmail: '', managerPassword: '', managerName: '', managerConfirmPassword: ''
  };
  const [hotelFormData, setHotelFormData] = useState(HOTEL_FORM_DEFAULT);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [quocGias, setQuocGias]         = useState([]);
  const [tinhThanhs, setTinhThanhs]     = useState([]);
  const [viTrisInProvince, setViTrisInProvince] = useState([]);
  const [quocGiaMode, setQuocGiaMode]   = useState('select'); // 'select' | 'create'
  const [tinhThanhMode, setTinhThanhMode] = useState('select'); // 'select' | 'create'
  const [viTriMode, setViTriMode]       = useState('select'); // 'select' | 'create'
  const [showMapPicker, setShowMapPicker] = useState(false);
  // Luôn hiển thị bản đồ để gắn tọa độ khách sạn
  const [showMapPickerForCoords, setShowMapPickerForCoords] = useState(true);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  // Hotel Manager Account Form State
  const [showManagerPw, setShowManagerPw] = useState(false);
  const [showManagerConfirmPw, setShowManagerConfirmPw] = useState(false);
  const [managerPwError, setManagerPwError] = useState('');

  // Bookings state
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

  const handleQuocGiaChange = (val) => {
    if (val === 'CREATE_NEW') {
      setQuocGiaMode('create');
      setHotelFormData(f => ({ ...f, quocGiaId: '', quocGiaName: '', tinhThanhId: '', tinhThanhName: '', viTriId: '', viTriName: '' }));
      setTinhThanhs([]);
      setViTrisInProvince([]);
      setTinhThanhMode('create');
      setViTriMode('create');
    } else {
      const qId = Number(val) || '';
      setHotelFormData(f => ({ ...f, quocGiaId: qId, quocGiaName: '', tinhThanhId: '', tinhThanhName: '', viTriId: '', viTriName: '' }));
      setTinhThanhs([]);
      setViTrisInProvince([]);
      setTinhThanhMode('select');
      setViTriMode('select');
      fetchTinhThanhsForCountry(qId);
    }
  };

  const handleTinhThanhChange = (val) => {
    if (val === 'CREATE_NEW') {
      setTinhThanhMode('create');
      setHotelFormData(f => ({ ...f, tinhThanhId: '', tinhThanhName: '', viTriId: '', viTriName: '' }));
      setViTrisInProvince([]);
      setViTriMode('create');
    } else {
      const tId = Number(val) || '';
      setHotelFormData(f => ({ ...f, tinhThanhId: tId, tinhThanhName: '', viTriId: '', viTriName: '' }));
      setViTriMode('select');
      fetchViTrisForProvince(tId);
    }
  };

  const fetchRevenueReport = useCallback(async () => {
    setLoadingRevenue(true);
    try {
      const res = await axiosClient.get(`/admin/reports/revenue?year=${revenueYear}`);
      setRevenueData(res.data);
    } catch (err) {
      showToast('Lỗi khi tải báo cáo doanh thu', 'error');
    } finally {
      setLoadingRevenue(false);
    }
  }, [showToast, revenueYear]);

  // ── Guest Reports State ──
  const [guestReports, setGuestReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportFilter, setReportFilter] = useState('');
  const [reportResponse, setReportResponse] = useState('');

  // ── Notifications State ──
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [notifForm, setNotifForm] = useState({ tieuDe: '', noiDung: '', loai: 'INFO', doiTuong: 'ALL', kenhGui: 'APP', lichGui: '' });
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [editingNotifId, setEditingNotifId] = useState(null);

  // ── Discounts State ──
  const [discounts, setDiscounts] = useState([]);
  const [loadingDisc, setLoadingDisc] = useState(false);
  const [discForm, setDiscForm] = useState({ code: '', ten: '', loai: 'PERCENT', giaTri: '', giamToiDa: '', donHangToiThieu: '', soLanSuDungToiDa: '', ngayBatDau: '', ngayKetThuc: '' });
  const [showDiscForm, setShowDiscForm] = useState(false);
  const [editingDisc, setEditingDisc] = useState(null);
  const [validateCode, setValidateCode] = useState('');
  const [validateAmount, setValidateAmount] = useState('');
  const [validateResult, setValidateResult] = useState(null);


  // ── Fetch functions ──
  const fetchGuestReports = useCallback(async () => {
    setLoadingReports(true);
    try { const r = await axiosClient.get('/guest-reports'); setGuestReports(r.data); }
    catch { showToast('Không tải được báo cáo khách', 'error'); }
    finally { setLoadingReports(false); }
  }, [showToast]);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotif(true);
    try { const r = await axiosClient.get('/system-notifications'); setNotifications(r.data); }
    catch { showToast('Không tải được thông báo', 'error'); }
    finally { setLoadingNotif(false); }
  }, [showToast]);

  const fetchDiscounts = useCallback(async () => {
    setLoadingDisc(true);
    try { const r = await axiosClient.get('/discounts'); setDiscounts(r.data); }
    catch { showToast('Không tải được giảm giá', 'error'); }
    finally { setLoadingDisc(false); }
  }, [showToast]);


  // ── EXCEL EXPORT ──
  const handleExportExcel = () => {
    if (!revenueData) return;
    
    // 1. Sheet Tổng quan & Khách sạn
    const wbk = XLSX.utils.book_new();
    
    const hotelData = revenueData.doanhThuTheoKhachSan?.map(hs => ({
      'Khách Sạn': hs.tenKhachSan,
      'Số Đơn Hoàn Tất': hs.tongSoDon,
      'Doanh Thu (VNĐ)': hs.tongDoanhThu
    })) || [];
    hotelData.push({ 'Khách Sạn': 'TỔNG CỘNG HỆ THỐNG', 'Số Đơn Hoàn Tất': '', 'Doanh Thu (VNĐ)': revenueData.tongDoanhThuToanHeThong });
    
    const ws1 = XLSX.utils.json_to_sheet(hotelData);
    XLSX.utils.book_append_sheet(wbk, ws1, "Tổng Quan & Khách Sạn");

    // 2. Sheet Doanh thu theo tháng
    if (revenueData.monthlyStats?.length > 0) {
      const monthData = revenueData.monthlyStats.map(m => ({
        'Tháng': m.month,
        'Tiền Phòng (VNĐ)': m.roomRevenue,
        'Tiền Dịch Vụ (VNĐ)': m.serviceRevenue,
        'Tiền Phụ Thu (VNĐ)': m.surchargeRevenue,
        'Tổng Cộng (VNĐ)': m.totalRevenue
      }));
      const ws2 = XLSX.utils.json_to_sheet(monthData);
      XLSX.utils.book_append_sheet(wbk, ws2, "Theo Tháng");
    }

    // 3. Sheet Chi tiết Phụ thu
    if (revenueData.surcharges?.length > 0) {
      const surchargeData = revenueData.surcharges.map(s => ({
        'Mã Phiếu': s.maDatPhong,
        'Loại Phụ Thu': s.loaiPhuThu,
        'Số Tiền (VNĐ)': s.soTien,
        'Ngày Thu': s.ngayThu ? new Date(s.ngayThu).toLocaleString('vi-VN') : ''
      }));
      const ws3 = XLSX.utils.json_to_sheet(surchargeData);
      XLSX.utils.book_append_sheet(wbk, ws3, "Lịch Sử Phụ Thu");
    }

    XLSX.writeFile(wbk, `Admin_BaoCaoDoanhThu_${revenueYear}.xlsx`);
  };

  useEffect(() => { 
    const silent = (activeTab === 'hotels' && hotels.length > 0)
                || (activeTab === 'bookings' && bookings.length > 0)
                || (activeTab === 'users' && users.length > 0)
                || (activeTab === 'reports' && revenueData !== null);
    if (activeTab === 'hotels') {
      fetchHotels();
      if (quocGias.length === 0) fetchQuocGias();
    } else if (activeTab === 'bookings') {
      fetchBookings(silent);
    } else if (activeTab === 'users') {
      fetchUsers(silent);
    } else if (activeTab === 'reports') {
      fetchRevenueReport();
    } else if (activeTab === 'guestReports') {
      fetchGuestReports();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    } else if (activeTab === 'discounts') {
      fetchDiscounts();
    }
  }, [activeTab, fetchBookings, fetchUsers, fetchRevenueReport, fetchGuestReports, fetchNotifications, fetchDiscounts]);

  // Auto-geocode: debounced khi diaChi + quocGiaId + tinhThanhId thay đổi (chỉ khi modal hotel mở)
  useEffect(() => {
    if (!showHotelModal) return;
    const diaChi = hotelFormData.diaChi?.trim();
    const quocGiaId = hotelFormData.quocGiaId;
    const tinhThanhId = hotelFormData.tinhThanhId;
    if (!diaChi || !quocGiaId || !tinhThanhId) return;

    const timer = setTimeout(async () => {
      try {
        const qg = quocGias.find(q => q.id === quocGiaId);
        const tt = tinhThanhs.find(t => t.id === tinhThanhId);
        const vtName = hotelFormData.viTriName?.trim() || viTrisInProvince.find(v => v.id === hotelFormData.viTriId)?.ten || '';
        const parts = [diaChi, vtName, tt?.ten, qg?.ten].filter(Boolean);
        const query = parts.join(', ');
        if (!query) return;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
          headers: { 'Accept-Language': 'vi' }
        });
        const data = await res.json();
        if (data?.[0]?.lat && data?.[0]?.lon) {
          setHotelFormData(f => ({ ...f, viDo: parseFloat(data[0].lat), kinhDo: parseFloat(data[0].lon) }));
        }
      } catch { /* silent - giữ nút "Ghim từ địa chỉ" để thử lại thủ công */ }
    }, 600);

    return () => clearTimeout(timer);
  }, [showHotelModal, hotelFormData.diaChi, hotelFormData.quocGiaId, hotelFormData.tinhThanhId, hotelFormData.viTriId, hotelFormData.viTriName, quocGias, tinhThanhs, viTrisInProvince]);

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
    let confirmMsg = `Xóa tài khoản "${user.hoTen}" (${user.email})?\n\nNếu người dùng có lịch sử đặt phòng, đánh giá hoặc đang quản lý khách sạn, tài khoản sẽ bị vô hiệu hóa và ẩn thông tin thay vì xóa hẳn. Lịch sử giao dịch được giữ nguyên.`;
    
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
    setQuocGiaMode('select');
    setTinhThanhMode('select');
    setViTriMode('select');
    setShowMapPicker(false);
    setShowMapPickerForCoords(true);
    // Load cascading data
    if (qgId) fetchTinhThanhsForCountry(qgId);
    if (ttId) fetchViTrisForProvince(ttId);
    setHotelFormData({
      ten: hotel.ten,
      diaChi: hotel.diaChi,
      soSao: hotel.soSao,
      moTa: hotel.moTa || '',
      quocGiaId: qgId,
      quocGiaName: '',
      tinhThanhId: ttId,
      tinhThanhName: '',
      viTriId: hotel.viTri?.id || '',
      viTriName: '',
      gioNhanPhong: hotel.gioNhanPhong || '14:00',
      gioTraPhong: hotel.gioTraPhong || '12:00',
      hinhAnhBia: hotel.hinhAnhBia || '',
      hinhAnhs: hotel.hinhAnhs || [],
      viDo: hotel.viDo ?? null,
      kinhDo: hotel.kinhDo ?? null,
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
    } catch (err) {
      const msg = err?.response?.data?.error || 'Xóa thất bại!';
      showToast(msg, 'error');
    }
  };

  const handleToggleHotelStatus = async (id) => {
    try {
      const res = await axiosClient.put(`/hotels/${id}/toggle-status`);
      setHotels(prev => prev.map(h => h.id === id ? res.data : h));
      const newStatus = res.data.trangThai;
      showToast(newStatus === 'Ngừng hoạt động' ? 'Đã tắt hoạt động khách sạn!' : 'Đã bật hoạt động khách sạn!');
    } catch (err) {
      showToast('Cập nhật trạng thái thất bại!', 'error');
    }
  };

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chỉ validate mật khẩu khi nhập (tạo quản lý mới). Để trống = gán user đã tồn tại
      if (!editingHotel && hotelFormData.managerEmail && hotelFormData.managerPassword) {
        const err = validatePassword(hotelFormData.managerPassword);
        if (err) { setManagerPwError(err); return; }
        if (hotelFormData.managerPassword !== hotelFormData.managerConfirmPassword) {
            setManagerPwError('Mật khẩu xác nhận không khớp!');
            return;
        }
      }

      const { managerConfirmPassword, ...payload } = hotelFormData;
      // Đảm bảo viDo/kinhDo hợp lệ để hiển thị marker trên bản đồ
      payload.viDo = (typeof payload.viDo === 'number' && !isNaN(payload.viDo)) ? payload.viDo : null;
      payload.kinhDo = (typeof payload.kinhDo === 'number' && !isNaN(payload.kinhDo)) ? payload.kinhDo : null;
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
      const data = err.response?.data;
      let msg = data?.error || 'Lưu thất bại!';
      if (data?.errors && typeof data.errors === 'object') {
        const first = Object.values(data.errors)[0];
        if (first) msg = String(first);
      }
      showToast(msg, 'error');
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
    { id: 'guestReports', label: 'Báo Cáo Khách', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'notifications', label: 'Thông Báo HT', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'discounts', label: 'Giảm Giá', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
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
        <div className="p-4 border-t border-blue-800 flex justify-center">
          <button onClick={() => { logout(); navigate('/login'); }}
            title="Đăng xuất"
            className="flex items-center justify-center w-10 h-10 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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
                    setShowMapPickerForCoords(true);
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
                      <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trạng Thái</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {hotels.map((h) => (
                      <tr key={h.id} className={`hover:bg-blue-50 transition ${h.trangThai === 'Ngừng hoạt động' ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3 font-semibold text-gray-800">{h.ten}</td>
                        <td className="px-5 py-3 text-gray-500">{h.diaChi}</td>
                        <td className="px-5 py-3 text-center text-yellow-500 font-bold">{h.soSao} ★</td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => handleToggleHotelStatus(h.id)}
                            title={h.trangThai === 'Ngừng hoạt động' ? 'Nhấn để bật hoạt động' : 'Nhấn để tắt hoạt động'}
                            className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none ${
                              h.trangThai === 'Ngừng hoạt động' ? 'bg-gray-300' : 'bg-green-500'
                            }`}
                          >
                            <span className={`inline-block w-4 h-4 mt-1 transform bg-white rounded-full shadow transition-transform ${
                              h.trangThai === 'Ngừng hoạt động' ? 'translate-x-1' : 'translate-x-6'
                            }`} />
                          </button>
                          <span className={`ml-2 text-xs font-medium ${
                            h.trangThai === 'Ngừng hoạt động' ? 'text-gray-400' : 'text-green-600'
                          }`}>
                            {h.trangThai === 'Ngừng hoạt động' ? 'Ngừng HĐ' : 'Hoạt động'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => handleEditHotel(h)} className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition mr-2">Sửa</button>
                          <button onClick={() => handleDeleteHotel(h.id)} className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition">Xóa</button>
                        </td>
                      </tr>
                    ))}
                    {hotels.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400">Chưa có khách sạn</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PLACEHOLDER TABS ── */}
          {[].includes(activeTab) && (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <p className="text-4xl mb-4">🚧</p>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Đang Phát Triển</h3>
              <p className="text-gray-400 text-sm">Module {activeTab} sẽ sớm ra mắt.</p>
            </div>
          )}

          {/* ── REVENUE REPORT TAB ── */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Báo Cáo Doanh Thu</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={revenueYear} 
                    onChange={e => setRevenueYear(Number(e.target.value))}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {[...Array(5)].map((_, i) => {
                      const y = new Date().getFullYear() - i;
                      return <option key={y} value={y}>Năm {y}</option>;
                    })}
                  </select>
                  <button onClick={handleExportExcel} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                    Xuất Excel
                  </button>
                  <button onClick={fetchRevenueReport} className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                    🔄 Tải Lại
                  </button>
                </div>
              </div>

              {loadingRevenue ? (
                <div className="py-16 flex justify-center bg-white rounded-xl shadow-sm">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : revenueData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 flex flex-col justify-center">
                      <p className="text-gray-500 text-sm font-medium">Tổng Doanh Thu Hệ Thống ({revenueYear})</p>
                      <p className="text-4xl font-bold mt-2 text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueData.tongDoanhThuToanHeThong || 0)}
                      </p>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-sm font-bold text-gray-800 mb-4">Biểu Đồ Doanh Thu Từng Tháng</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueData.monthlyStats || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickFormatter={(val) => val.split('-')[1]} tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(val) => (val / 1000000).toFixed(0) + 'M'} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="roomRevenue" name="Tiền Phòng" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="serviceRevenue" name="Dịch Vụ" stackId="a" fill="#F59E0B" />
                            <Bar dataKey="surchargeRevenue" name="Phụ Thu" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Doanh Thu Theo Khách Sạn</h3>
                        <select 
                          value={revenueFilter} 
                          onChange={(e) => setRevenueFilter(e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-400 outline-none"
                        >
                          <option value="">Tất cả</option>
                          {revenueData.doanhThuTheoKhachSan?.map((hs, i) => (
                            <option key={i} value={hs.tenKhachSan}>{hs.tenKhachSan}</option>
                          ))}
                        </select>
                      </div>

                      <div className="overflow-x-auto max-h-[400px]">
                        <table className="min-w-full text-sm">
                          <thead className="sticky top-0 bg-gray-50">
                            <tr className="border-b border-gray-100">
                              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Khách sạn</th>
                              <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase">Đơn</th>
                              <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase">Doanh thu</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {revenueData.doanhThuTheoKhachSan
                              ?.filter(hs => !revenueFilter || hs.tenKhachSan === revenueFilter)
                              .map((hs, i) => (
                              <tr key={i} className="hover:bg-blue-50 transition">
                                <td className="px-5 py-3 font-semibold text-gray-800">
                                  {hs.khachSanId ? (
                                    <Link to={`/hotels/${hs.khachSanId}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                      {hs.tenKhachSan}
                                    </Link>
                                  ) : (
                                    hs.tenKhachSan
                                  )}
                                </td>
                                <td className="px-5 py-3 text-center text-gray-600 font-medium">{hs.tongSoDon}</td>
                                <td className="px-5 py-3 text-right text-green-600 font-bold whitespace-nowrap">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hs.tongDoanhThu || 0)}
                                </td>
                              </tr>
                            ))}
                            {revenueData.doanhThuTheoKhachSan?.length === 0 && (
                              <tr><td colSpan={3} className="py-8 text-center text-gray-400">Không có dữ liệu</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Lịch Sử Phụ Thu</h3>
                      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3">
                        {revenueData.surcharges && revenueData.surcharges.length > 0 ? (
                          revenueData.surcharges.map((surcharge, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 sm:p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition shadow-sm">
                              <div>
                                <p className="font-bold text-gray-800">{surcharge.loaiPhuThu}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Mã phiếu: <span className="font-mono text-gray-700 bg-gray-200 px-1 py-0.5 rounded">{surcharge.maDatPhong}</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(surcharge.ngayThu).toLocaleString('vi-VN')}</p>
                              </div>
                              <p className="font-black text-red-600 text-right">
                                +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(surcharge.soTien || 0)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 text-gray-400">
                            <p>Chưa có khoản phụ thu nào trong năm {revenueYear}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-xl shadow-sm text-gray-400">
                  <p>Không thể tải dữ liệu doanh thu.</p>
                </div>
              )}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-600">
                        🌏 Quốc gia {quocGiaMode === 'create' ? '(mới)' : ''} *
                      </label>
                      {quocGiaMode === 'create' && (
                        <button type="button"
                          onClick={() => { setQuocGiaMode('select'); setHotelFormData(f => ({ ...f, quocGiaName: '' })); }}
                          className="text-xs text-blue-600 hover:underline font-medium">
                          ← Chọn từ danh sách
                        </button>
                      )}
                    </div>
                    {quocGiaMode === 'select' ? (
                      <select
                        value={hotelFormData.quocGiaId}
                        onChange={e => handleQuocGiaChange(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      >
                        <option value="">-- Chọn quốc gia --</option>
                        {quocGias.map(qg => (
                          <option key={qg.id} value={qg.id}>{qg.ten}</option>
                        ))}
                        <option value="CREATE_NEW" className="font-semibold text-blue-600">➕ Tự nhập quốc gia mới...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Ví dụ: Thái Lan, Hàn Quốc..."
                        value={hotelFormData.quocGiaName}
                        onChange={e => setHotelFormData(f => ({ ...f, quocGiaName: e.target.value }))}
                        className="w-full border border-blue-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        autoFocus
                      />
                    )}
                  </div>

                  {/* CẤP 2: Tỉnh / Thành phố */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-600">
                        🏙️ Tỉnh / Thành phố {tinhThanhMode === 'create' ? '(mới)' : ''} *
                      </label>
                      {tinhThanhMode === 'create' && (
                        <button type="button"
                          onClick={() => { setTinhThanhMode('select'); setHotelFormData(f => ({ ...f, tinhThanhName: '' })); }}
                          className="text-xs text-blue-600 hover:underline font-medium">
                          ← Chọn từ danh sách
                        </button>
                      )}
                    </div>
                    {!(hotelFormData.quocGiaId || quocGiaMode === 'create') ? (
                      <div className="border border-dashed border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">Chọn hoặc nhập quốc gia trước</div>
                    ) : tinhThanhMode === 'select' ? (
                      <select
                        value={hotelFormData.tinhThanhId}
                        onChange={e => handleTinhThanhChange(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      >
                        <option value="">-- Chọn tỉnh/thành --</option>
                        {tinhThanhs.map(tt => (
                          <option key={tt.id} value={tt.id}>{tt.ten}</option>
                        ))}
                        <option value="CREATE_NEW" className="font-semibold text-blue-600">➕ Tự nhập tỉnh thành mới...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Ví dụ: Bangkok, Seoul..."
                        value={hotelFormData.tinhThanhName}
                        onChange={e => setHotelFormData(f => ({ ...f, tinhThanhName: e.target.value }))}
                        className="w-full border border-blue-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        autoFocus
                      />
                    )}
                  </div>

                  {/* CẤP 3: Vị trí */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-600">
                        📍 Vị trí {viTriMode === 'create' ? '(mới)' : ''} *
                      </label>
                      {(hotelFormData.tinhThanhId || tinhThanhMode === 'create') && (
                        <div className="flex items-center gap-2">
                          {viTriMode === 'create' && (
                            <>
                              <button type="button"
                                onClick={() => setShowMapPicker(v => !v)}
                                className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200 font-medium">
                                {showMapPicker ? '✕ Đóng bản đồ' : '🗺 Chọn trên bản đồ'}
                              </button>
                              <button type="button"
                                onClick={() => { setViTriMode('select'); setShowMapPicker(false); setHotelFormData(f => ({ ...f, viTriName: '' })); }}
                                className="text-xs text-blue-600 hover:underline font-medium">
                                ← Chọn từ danh sách
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {!(hotelFormData.tinhThanhId || tinhThanhMode === 'create') ? (
                      <div className="border border-dashed border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">Chọn hoặc nhập tỉnh/thành trước</div>
                    ) : viTriMode === 'select' ? (
                      <select
                        value={hotelFormData.viTriId}
                        onChange={e => {
                          if (e.target.value === 'CREATE_NEW') {
                            setViTriMode('create');
                            setHotelFormData(f => ({ ...f, viTriId: '', viTriName: '' }));
                          } else {
                            setHotelFormData(f => ({ ...f, viTriId: Number(e.target.value) || '', viTriName: '' }))
                          }
                        }}
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      >
                        <option value="">-- Chọn vị trí --</option>
                        {viTrisInProvince.map(vt => (
                          <option key={vt.id} value={vt.id}>{vt.ten}</option>
                        ))}
                        <option value="CREATE_NEW" className="font-semibold text-blue-600">➕ Tự nhập vị trí mới...</option>
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

                {/* ── VỊ TRÍ TRÊN BẢN ĐỒ (luôn hiển thị - Admin gắn tọa độ để khách sạn hiện marker) ── */}
                <div className="col-span-2 bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">📍 Vị trí trên bản đồ (hiển thị cho người dùng)</p>
                  <p className="text-xs text-amber-700">Gắn tọa độ để khách sạn xuất hiện trên bản đồ tại trang /hotels/map. Click trên bản đồ hoặc nhập thủ công.</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-gray-600">Vĩ độ</label>
                      <input type="number" step="any" placeholder="VD: 16.0544"
                        value={hotelFormData.viDo ?? ''} onChange={e => setHotelFormData(f => ({ ...f, viDo: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                        className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-gray-600">Kinh độ</label>
                      <input type="number" step="any" placeholder="VD: 108.2022"
                        value={hotelFormData.kinhDo ?? ''} onChange={e => setHotelFormData(f => ({ ...f, kinhDo: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                        className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <button type="button"
                      onClick={() => {
                        const lat = hotelFormData.viDo ?? 16.0544;
                        const lng = hotelFormData.kinhDo ?? 108.2022;
                        setHotelFormData(f => ({ ...f, viDo: lat, kinhDo: lng }));
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition">
                      Đặt về mặc định
                    </button>
                    <button type="button" disabled={geocoding || !hotelFormData.diaChi?.trim()}
                      onClick={async () => {
                        setGeocoding(true);
                        try {
                          const qg = quocGias.find(q => q.id === hotelFormData.quocGiaId);
                          const tt = tinhThanhs.find(t => t.id === hotelFormData.tinhThanhId);
                          const vtName = hotelFormData.viTriName?.trim() || viTrisInProvince.find(v => v.id === hotelFormData.viTriId)?.ten || '';
                          const parts = [hotelFormData.diaChi?.trim(), vtName, tt?.ten, qg?.ten].filter(Boolean);
                          const query = parts.join(', ');
                          if (!query) { showToast('Nhập địa chỉ và chọn tỉnh thành để ghim tự động', 'error'); return; }
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
                            headers: { 'Accept-Language': 'vi' }
                          });
                          const data = await res.json();
                          if (data?.[0]?.lat && data?.[0]?.lon) {
                            setHotelFormData(f => ({ ...f, viDo: parseFloat(data[0].lat), kinhDo: parseFloat(data[0].lon) }));
                            showToast('Đã ghim vị trí từ địa chỉ!');
                          } else {
                            showToast('Không tìm thấy tọa độ. Thử địa chỉ chi tiết hơn hoặc click trên bản đồ.', 'error');
                          }
                        } catch (e) {
                          showToast('Lỗi geocoding: ' + (e.message || 'Thử lại'), 'error');
                        } finally {
                          setGeocoding(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition">
                      {geocoding ? '⏳ Đang tìm...' : '📍 Ghim từ địa chỉ'}
                    </button>
                  </div>
                  {showMapPickerForCoords && (
                    <div className="rounded-xl overflow-hidden border border-amber-200 shadow-sm bg-white flex flex-col mt-2">
                      <div className="h-[280px] w-full relative z-0 bg-gray-100 flex items-center justify-center">
                        <MapContainer
                          center={[
                            (typeof hotelFormData.viDo === 'number' && !isNaN(hotelFormData.viDo)) ? hotelFormData.viDo : 16.0544,
                            (typeof hotelFormData.kinhDo === 'number' && !isNaN(hotelFormData.kinhDo)) ? hotelFormData.kinhDo : 108.2022
                          ]}
                          zoom={13} style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                          <MapUpdater center={[
                            (typeof hotelFormData.viDo === 'number' && !isNaN(hotelFormData.viDo)) ? hotelFormData.viDo : 16.0544,
                            (typeof hotelFormData.kinhDo === 'number' && !isNaN(hotelFormData.kinhDo)) ? hotelFormData.kinhDo : 108.2022
                          ]} />
                          <MapClickHandler onLocationSelect={(lat, lng) => setHotelFormData(f => ({ ...f, viDo: lat, kinhDo: lng }))} />
                          {(typeof hotelFormData.viDo === 'number' && typeof hotelFormData.kinhDo === 'number' && !isNaN(hotelFormData.viDo) && !isNaN(hotelFormData.kinhDo)) && (
                            <Marker position={[hotelFormData.viDo, hotelFormData.kinhDo]} />
                          )}
                        </MapContainer>
                      </div>
                      <div className="bg-white p-2 border-t flex justify-between items-center">
                        <p className="text-[10px] text-gray-500 font-medium">✨ Click trên bản đồ để ghim vị trí khách sạn.</p>
                        <button type="button" onClick={() => setShowMapPickerForCoords(true)}
                          className="px-3 py-1 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700 font-medium">Đang bật</button>
                      </div>
                    </div>
                  )}
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
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Mật khẩu (để trống nếu gán user đã tồn tại)</label>
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
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Xác nhận mật khẩu</label>
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
                                          <td className="px-4 py-3 text-gray-800 font-medium">{b.tenKhachSan || b.phong?.khachSan?.ten || 'N/A'}</td>
                                          <td className="px-4 py-3">
                                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                  {b.maDatPhong || b.maPhieu || `#${b.id}`}
                                              </span>
                                          </td>
                                          <td className="px-4 py-3 text-gray-700">{b.hoTenKhach || b.nguoiDung?.hoTen || 'N/A'}</td>
                                          <td className="px-4 py-3 text-gray-600">{formatDate(b.ngayDen || b.ngayNhan)}</td>
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
                          <button onClick={() => setSelectedBooking(null)} className="px-5 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 shadow-sm transition-colors">Đóng</button>
                      </div>
                  </div>
              </div>
          )}



      {/* ── GUEST REPORTS TAB ── */}
      {activeTab === 'guestReports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">⚠️ Báo Cáo Sự Cố Khách Hàng</h2>
            <button onClick={fetchGuestReports} className="px-3 py-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300 text-sm">🔄 Tải lại</button>
          </div>
          <div className="flex gap-3">
            {['', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
              <button key={s} onClick={() => setReportFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${reportFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
                {s || 'Tất cả'}
              </button>
            ))}
          </div>
          {loadingReports ? <div className="py-16 flex justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div> : (
            <div className="grid grid-cols-1 gap-3">
              {guestReports.filter(r => !reportFilter || r.trangThai === reportFilter).map(r => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 cursor-pointer hover:shadow-md transition"
                  style={{ borderColor: r.priority === 'HIGH' ? '#ef4444' : r.priority === 'MEDIUM' ? '#f59e0b' : '#10b981' }}
                  onClick={() => setSelectedReport(r)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.priority === 'HIGH' ? 'bg-red-100 text-red-700' : r.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{r.priority}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{r.trangThai}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600">{r.loaiVanDe}</span>
                      </div>
                      <p className="font-semibold text-gray-800">{r.id} — {r.hoTen}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {r.bookingCode ? `Mã đặt: ${r.bookingCode}` : r.khachSanTen ? `Khách sạn: ${r.khachSanTen}` : '—'}
                        {' '}| {r.email || r.sdt}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.moTa}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                  </div>
                </div>
              ))}
              {guestReports.filter(r => !reportFilter || r.trangThai === reportFilter).length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400">Không có báo cáo nào.</div>
              )}
            </div>
          )}
          {/* Detail Modal */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReport(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="font-bold text-gray-800">Chi tiết: {selectedReport.id}</h3>
                  <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-xs text-gray-400">Khách</span><p className="font-medium">{selectedReport.hoTen}</p></div>
                    <div><span className="text-xs text-gray-400">Mã đặt / KS</span><p className="font-medium">{selectedReport.bookingCode || '—'}</p></div>
                    {selectedReport.khachSanTen && (
                      <div className="col-span-2"><span className="text-xs text-gray-400">Khách sạn</span><p className="font-medium">{selectedReport.khachSanTen}</p></div>
                    )}
                    <div><span className="text-xs text-gray-400">Email</span><p>{selectedReport.email || '—'}</p></div>
                    <div><span className="text-xs text-gray-400">SĐT</span><p>{selectedReport.sdt || '—'}</p></div>
                    <div><span className="text-xs text-gray-400">Loại vấn đề</span><p>{selectedReport.loaiVanDe}</p></div>
                    <div><span className="text-xs text-gray-400">Priority</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${selectedReport.priority === 'HIGH' ? 'bg-red-100 text-red-700' : selectedReport.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{selectedReport.priority}</span>
                    </div>
                  </div>
                  <div><span className="text-xs text-gray-400">Mô tả</span><p className="mt-1 text-gray-700 bg-gray-50 rounded-lg p-3">{selectedReport.moTa}</p></div>
                  {selectedReport.phanHoi && <div><span className="text-xs text-gray-400">Phản hồi</span><p className="mt-1 text-gray-700 bg-blue-50 rounded-lg p-3">{selectedReport.phanHoi}</p></div>}
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500">Cập nhật trạng thái</p>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue={selectedReport.trangThai}
                      onChange={async e => {
                        await axiosClient.put(`/guest-reports/${selectedReport.id}`, { trangThai: e.target.value });
                        showToast('Đã cập nhật!'); fetchGuestReports(); setSelectedReport(null);
                      }}>
                      {['PENDING','IN_PROGRESS','RESOLVED','CLOSED'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Ghi phản hồi..."
                      value={reportResponse} onChange={e => setReportResponse(e.target.value)} />
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                      onClick={async () => {
                        await axiosClient.put(`/guest-reports/${selectedReport.id}`, { phanHoi: reportResponse, nguoiXuLy: currentUser?.email });
                        showToast('Đã gửi phản hồi!'); fetchGuestReports(); setSelectedReport(null); setReportResponse('');
                      }}>Gửi Phản Hồi</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SYSTEM NOTIFICATIONS TAB ── */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">🔔 Thông Báo Hệ Thống</h2>
            <button onClick={() => {
              setEditingNotifId(null);
              setNotifForm({ tieuDe: '', noiDung: '', loai: 'INFO', doiTuong: 'ALL', kenhGui: 'APP', lichGui: '' });
              setShowNotifForm(true);
            }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">＋ Tạo Thông Báo</button>
          </div>
          {/* Pending ALERT banner */}
          {notifications.filter(n => n.trangThai === 'PENDING_CONFIRM').length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-700 mb-2">⚠️ {notifications.filter(n => n.trangThai === 'PENDING_CONFIRM').length} thông báo ALERT cần xác nhận lần 2:</p>
              {notifications.filter(n => n.trangThai === 'PENDING_CONFIRM').map(n => (
                <div key={n.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 mt-2 border border-red-100">
                  <span className="text-sm font-medium text-gray-700">{n.tieuDe}</span>
                  <button onClick={async () => {
                    try { await axiosClient.put(`/system-notifications/${n.id}/confirm-alert`); showToast('Đã xác nhận gửi ALERT!'); fetchNotifications(); }
                    catch(e) { showToast(e.response?.data?.message || 'Lỗi xác nhận', 'error'); }
                  }} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">Xác Nhận Gửi</button>
                </div>
              ))}
            </div>
          )}
          {loadingNotif ? <div className="py-12 flex justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div> : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>{['ID','Tiêu Đề','Loại','Đối Tượng','Trạng Thái','Ngày Tạo','Hành Động'].map(h=><th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notifications.map(n => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{n.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{n.tieuDe}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${n.loai==='ALERT'?'bg-red-100 text-red-700':n.loai==='SYSTEM'?'bg-purple-100 text-purple-700':n.loai==='POLICY'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>{n.loai}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{n.doiTuong}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${n.trangThai==='SENT'?'bg-green-100 text-green-700':n.trangThai==='PENDING_CONFIRM'?'bg-red-100 text-red-700':n.trangThai==='SCHEDULED'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`}>{n.trangThai}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : ''}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => {
                            setEditingNotifId(n.id);
                            setNotifForm({ tieuDe: n.tieuDe, noiDung: n.noiDung, loai: n.loai, doiTuong: n.doiTuong, kenhGui: n.kenhGui, lichGui: n.lichGui ? n.lichGui.substring(0, 16) : '' });
                            setShowNotifForm(true);
                          }} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition">Sửa</button>
                          
                          <button onClick={async () => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn thông báo này?')) {
                              try { await axiosClient.delete(`/system-notifications/${n.id}`); showToast('Đã xóa!'); fetchNotifications(); }
                              catch(e) { showToast('Xóa thất bại','error'); }
                            }
                          }} className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition">Xóa</button>

                          {!['SENT','CANCELLED'].includes(n.trangThai) && (
                            <button onClick={async () => { await axiosClient.put(`/system-notifications/${n.id}/cancel`); showToast('Đã hủy!'); fetchNotifications(); }}
                              className="px-2 py-1 text-xs bg-amber-50 text-amber-600 border border-amber-200 rounded hover:bg-amber-100 transition">Hủy</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {notifications.length === 0 && <div className="py-12 text-center text-gray-400">Chưa có thông báo nào.</div>}
            </div>
          )}
          {/* Create Modal */}
          {showNotifForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNotifForm(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="font-bold text-gray-800">{editingNotifId ? '🔔 Chỉnh Sửa Thông Báo' : '🔔 Tạo Thông Báo Mới'}</h3>
                  <button onClick={() => setShowNotifForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề *</label>
                    <input value={notifForm.tieuDe} onChange={e => setNotifForm(f=>({...f,tieuDe:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Tiêu đề thông báo..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung *</label>
                    <textarea value={notifForm.noiDung} onChange={e => setNotifForm(f=>({...f,noiDung:e.target.value}))} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Nội dung chi tiết..."/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Loại</label>
                      <select value={notifForm.loai} onChange={e => setNotifForm(f=>({...f,loai:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                        {['INFO','SYSTEM','POLICY','ALERT'].map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Đối tượng</label>
                      <select value={notifForm.doiTuong} onChange={e => setNotifForm(f=>({...f,doiTuong:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                        {['ALL', 'Admin', 'HotelManager', 'User'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Lên lịch gửi (để trống = gửi ngay)</label>
                    <input type="datetime-local" value={notifForm.lichGui} onChange={e => setNotifForm(f=>({...f,lichGui:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"/>
                  </div>
                  {notifForm.loai === 'ALERT' && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">⚠️ Loại ALERT yêu cầu xác nhận lần 2 từ một Admin khác trước khi gửi.</div>}
                  <div className="flex justify-end gap-3 pt-2 border-t">
                    <button onClick={() => setShowNotifForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
                    <button onClick={async () => {
                      try {
                        if (editingNotifId) {
                          await axiosClient.put(`/system-notifications/${editingNotifId}`, { ...notifForm, lichGui: notifForm.lichGui || null });
                          showToast('Cập nhật thông báo thành công!');
                        } else {
                          await axiosClient.post('/system-notifications', { ...notifForm, lichGui: notifForm.lichGui || null });
                          showToast('Tạo thông báo thành công!');
                        }
                        setShowNotifForm(false); 
                        setNotifForm({ tieuDe:'',noiDung:'',loai:'INFO',doiTuong:'ALL',kenhGui:'APP',lichGui:'' }); 
                        fetchNotifications();
                      } catch(e) { showToast(e.response?.data?.message || 'Lỗi lưu thông báo','error'); }
                    }} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                      {editingNotifId ? 'Cập Nhật' : 'Tạo Thông Báo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'discounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Quản Lý Mã Giảm Giá</h2>
            <button onClick={() => { setEditingDisc(null); setShowDiscForm(true); setDiscForm({ code:'',ten:'',loai:'PERCENT',giaTri:'',giamToiDa:'',donHangToiThieu:'',soLanSuDungToiDa:'',ngayBatDau:'',ngayKetThuc:'' }); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">+ Tạo Mã Giảm Giá</button>
          </div>

          {/* Validate tool */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Kiểm tra mã giảm giá</p>
            <div className="flex gap-3 flex-wrap">
              <input value={validateCode} onChange={e => setValidateCode(e.target.value)} placeholder="Nhập mã coupon..." className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"/>
              <input value={validateAmount} onChange={e => setValidateAmount(e.target.value)} placeholder="Số tiền đơn hàng (VNĐ)" type="number" className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"/>
              <button onClick={async () => {
                try { const r = await axiosClient.post('/discounts/validate', { code: validateCode, orderAmount: parseFloat(validateAmount)||0 }); setValidateResult(r.data); }
                catch { showToast('Lỗi kiểm tra mã','error'); }
              }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Kiểm tra</button>
            </div>
            {validateResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${validateResult.valid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {validateResult.valid ? `Hợp lệ! Giảm: ${new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(validateResult.discountAmount)}` : validateResult.message}
              </div>
            )}
          </div>

          {loadingDisc ? <div className="py-12 flex justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/></div> : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>{['Mã Code','Tên','Loại','Giá Trị','G.Tối Đa','Tối Thiểu','Đã Dùng','Hiệu Lực','Trạng Thái','Hành Động'].map(h=><th key={h} className="px-3 py-3 text-left font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-3 font-mono font-bold text-gray-800 text-xs">{d.code}</td>
                      <td className="px-3 py-3 text-gray-700 max-w-[120px] truncate" title={d.ten}>{d.ten}</td>
                      <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d.loai==='PERCENT'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>{d.loai}</span></td>
                      <td className="px-3 py-3 font-semibold text-gray-800">{d.loai==='PERCENT'?`${d.giaTri}%`:new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(d.giaTri)}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{d.giamToiDa ? new Intl.NumberFormat('vi-VN').format(d.giamToiDa) : '—'}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{d.donHangToiThieu ? new Intl.NumberFormat('vi-VN').format(d.donHangToiThieu) : '—'}</td>
                      <td className="px-3 py-3 text-gray-600 text-center">{d.soLanDaDung}{d.soLanSuDungToiDa?`/${d.soLanSuDungToiDa}`:''}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{d.ngayBatDau} → {d.ngayKetThuc}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.trangThai==='ACTIVE'?'bg-green-100 text-green-700':d.trangThai==='EXPIRED'?'bg-gray-100 text-gray-500':'bg-red-100 text-red-600'}`}>{d.trangThai}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Edit */}
                          <button onClick={() => {
                            setEditingDisc(d);
                            setDiscForm({ code: d.code, ten: d.ten, loai: d.loai, giaTri: d.giaTri, giamToiDa: d.giamToiDa||'', donHangToiThieu: d.donHangToiThieu||'', soLanSuDungToiDa: d.soLanSuDungToiDa||'', ngayBatDau: d.ngayBatDau, ngayKetThuc: d.ngayKetThuc });
                            setShowDiscForm(true);
                          }} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition">Sửa</button>
                          {/* Toggle active/inactive */}
                          {d.trangThai === 'ACTIVE' && (
                            <button onClick={async () => { await axiosClient.put(`/discounts/${d.id}`,{trangThai:'INACTIVE'}); showToast('Vô hiệu!'); fetchDiscounts(); }}
                              className="px-2 py-1 text-xs bg-amber-50 text-amber-600 border border-amber-200 rounded hover:bg-amber-100 transition">Tắt</button>
                          )}
                          {d.trangThai === 'INACTIVE' && (
                            <button onClick={async () => { await axiosClient.put(`/discounts/${d.id}`,{trangThai:'ACTIVE'}); showToast('Kích hoạt!'); fetchDiscounts(); }}
                              className="px-2 py-1 text-xs bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 transition">Bật</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {discounts.length === 0 && <div className="py-12 text-center text-gray-400">Chưa có mã giảm giá nào.</div>}
            </div>
          )}

          {/* Create/Edit Discount Modal */}
          {showDiscForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDiscForm(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="font-bold text-gray-800">{editingDisc ? 'Chỉnh Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá'}</h3>
                  <button onClick={() => setShowDiscForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Mã coupon *</label>
                      <input value={discForm.code} onChange={e=>setDiscForm(f=>({...f,code:e.target.value.toUpperCase()}))} disabled={!!editingDisc} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" placeholder="VD: SUMMER20"/></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tên *</label>
                      <input value={discForm.ten} onChange={e=>setDiscForm(f=>({...f,ten:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="Tên mã giảm giá"/></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Loại</label>
                      <select value={discForm.loai} onChange={e=>setDiscForm(f=>({...f,loai:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                        <option value="PERCENT">PERCENT (%)</option><option value="FIXED">FIXED (số tiền)</option>
                      </select></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giá trị * {discForm.loai==='PERCENT'?'(% tối đa 80)':'(VNĐ)'}</label>
                      <input type="number" value={discForm.giaTri} onChange={e=>setDiscForm(f=>({...f,giaTri:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder={discForm.loai==='PERCENT'?'20':'100000'}/></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giảm tối đa (VNĐ)</label>
                      <input type="number" value={discForm.giamToiDa} onChange={e=>setDiscForm(f=>({...f,giamToiDa:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="500000"/></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Đơn hàng tối thiểu</label>
                      <input type="number" value={discForm.donHangToiThieu} onChange={e=>setDiscForm(f=>({...f,donHangToiThieu:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="1000000"/></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Số lượt dùng</label>
                      <input type="number" value={discForm.soLanSuDungToiDa} onChange={e=>setDiscForm(f=>({...f,soLanSuDungToiDa:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="Để trống = không giới hạn"/></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu *</label>
                      <input type="date" value={discForm.ngayBatDau} onChange={e=>setDiscForm(f=>({...f,ngayBatDau:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"/></div>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc *</label>
                      <input type="date" value={discForm.ngayKetThuc} onChange={e=>setDiscForm(f=>({...f,ngayKetThuc:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"/></div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t">
                    <button onClick={() => setShowDiscForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
                    <button onClick={async () => {
                      try {
                        const payload = { ...discForm, giaTri: parseFloat(discForm.giaTri), giamToiDa: discForm.giamToiDa?parseFloat(discForm.giamToiDa):null, donHangToiThieu: discForm.donHangToiThieu?parseFloat(discForm.donHangToiThieu):null, soLanSuDungToiDa: discForm.soLanSuDungToiDa?parseInt(discForm.soLanSuDungToiDa):null, khachSanId: null };
                        if (editingDisc) {
                          await axiosClient.put(`/discounts/${editingDisc.id}`, payload);
                          showToast('Cập nhật mã giảm giá thành công!');
                        } else {
                          await axiosClient.post('/discounts', payload);
                          showToast('Tạo mã giảm giá thành công!');
                        }
                        setShowDiscForm(false); fetchDiscounts();
                        setDiscForm({ code:'',ten:'',loai:'PERCENT',giaTri:'',giamToiDa:'',donHangToiThieu:'',soLanSuDungToiDa:'',ngayBatDau:'',ngayKetThuc:'' });
                      } catch(e) { showToast(e.response?.data?.error || e.response?.data?.message || 'Lỗi lưu mã giảm giá','error'); }
                    }} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">{editingDisc ? 'Cập Nhật' : 'Tạo Mã'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Toast msg={toast?.msg} type={toast?.type} />
    </div>
  );
};

export default AdminDashboard;
