import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const avatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=4f46e5&color=fff&bold=true&size=128`;

const roleLabel = { Admin: '🛡️ Quản Trị Viên', HotelManager: '🏨 Quản Lý Khách Sạn', User: '👤 Khách Hàng' };
const roleColor = { Admin: 'bg-red-100 text-red-700', HotelManager: 'bg-purple-100 text-purple-700', User: 'bg-blue-100 text-blue-700' };

const statusBadge = (s) => {
  const m = {
    'Chờ xác nhận': 'bg-yellow-100 text-yellow-700',
    'Đã xác nhận': 'bg-blue-100 text-blue-700',
    'Đã check-in': 'bg-green-100 text-green-700',
    'Đã checkout': 'bg-gray-100 text-gray-600',
    'Đã hủy': 'bg-red-100 text-red-600',
  };
  return m[s] || 'bg-gray-100 text-gray-600';
};

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

  // Form chỉnh sửa
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
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axiosClient.put(`/user/${userId}`, { hoTen: form.hoTen, sdt: form.sdt });
      setProfile(prev => ({ ...prev, ...res.data }));
      // Cập nhật AuthContext + localStorage
      localStorage.setItem('hoTen', res.data.hoTen);
      showToast('Cập nhật thông tin thành công!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Cập nhật thất bại!', 'error');
    } finally {
      setSaving(false);
    }
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const TABS = [
    { id: 'info', label: '👤 Thông tin cá nhân', icon: '' },
    { id: 'security', label: '🔒 Bảo mật', icon: '' },
    { id: 'bookings', label: `📋 Lịch sử đặt phòng (${bookings.length})`, icon: '' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-10 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── HERO CARD ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
          <div className="px-8 pb-6 -mt-12 flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <img
              src={avatar(profile.hoTen)}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{profile.hoTen || 'Người dùng'}</h1>
              <p className="text-gray-500 text-sm">{profile.email}</p>
            </div>
            <div className="pb-1 flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleColor[profile.chucVu] || 'bg-gray-100 text-gray-600'}`}>
                {roleLabel[profile.chucVu] || profile.chucVu}
              </span>
              {profile.sdt && <p className="text-gray-400 text-xs">📞 {profile.sdt}</p>}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Tab bar */}
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
            {/* ══ TAB: THÔNG TIN CÁ NHÂN ══ */}
            {activeTab === 'info' && (
              <form onSubmit={handleSaveInfo} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Họ và tên</label>
                  <input
                    required
                    value={form.hoTen}
                    onChange={e => setForm(f => ({ ...f, hoTen: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    value={profile.email}
                    disabled
                    className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                  <input
                    value={form.sdt}
                    onChange={e => setForm(f => ({ ...f, sdt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
                    placeholder="0901234567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Vai trò</label>
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${roleColor[profile.chucVu] || 'bg-gray-100'}`}>
                    {roleLabel[profile.chucVu] || profile.chucVu}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 shadow-sm"
                  >
                    {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}

            {/* ══ TAB: BẢO MẬT ══ */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePw} className="space-y-5 max-w-lg">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                  🔐 Mật khẩu mới cần ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự @
                </div>

                {[
                  { key: 'matKhauCu', label: 'Mật khẩu hiện tại', show: 'cu' },
                  { key: 'matKhauMoi', label: 'Mật khẩu mới', show: 'moi' },
                  { key: 'xacNhanMatKhau', label: 'Xác nhận mật khẩu mới', show: 'xn' },
                ].map(({ key, label, show }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <div className="relative">
                      <input
                        type={showPw[show] ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, [show]: !p[show] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw[show] ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 shadow-sm"
                  >
                    {saving ? '⏳ Đang xử lý...' : '🔑 Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            )}

            {/* ══ TAB: LỊCH SỬ ĐẶT PHÒNG ══ */}
            {activeTab === 'bookings' && (
              <div>
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
                  <div className="space-y-4">
                    {bookings.map(b => (
                      <div key={b.id}
                        className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition bg-white flex flex-col sm:flex-row gap-4">
                        {/* Hotel image */}
                        <div className="w-full sm:w-28 h-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {b.phong?.khachSan?.hinhAnhBia
                            ? <img src={b.phong.khachSan.hinhAnhBia} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl">🏨</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-gray-800">{b.phong?.khachSan?.ten || 'Khách sạn'}</p>
                              <p className="text-sm text-gray-500">Phòng: {b.phong?.ten || b.phong?.soPhong}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge(b.trangThai)}`}>
                              {b.trangThai}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                            <span>📅 {new Date(b.ngayDen).toLocaleDateString('vi-VN')} → {new Date(b.ngayDi).toLocaleDateString('vi-VN')}</span>
                            <span className="text-indigo-600 font-bold text-sm">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.thanhTien || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
