import { useState, useCallback, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

/**
 * Component quản lý Loyalty Membership Packages (Admin chỉ).
 * Tạo gói thành viên trả phí cho user mua.
 */
export const LoyaltyMembershipsAdminTab = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ten: "",
    moTa: "",
    gia: "",
    thoiHanNgay: "",
    phanTramGiam: "",
    diemThuong: "",
  });
  const [message, setMessage] = useState(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/loyalty-memberships");
      setPackages(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi tải dữ liệu!" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleOpenForm = (pkg = null) => {
    if (pkg) {
      setEditing(pkg.id);
      setForm({
        ten: pkg.ten,
        moTa: pkg.moTa,
        gia: pkg.gia,
        thoiHanNgay: pkg.thoiHanNgay,
        phanTramGiam: pkg.phanTramGiam,
        diemThuong: pkg.diemThuong,
      });
    } else {
      setEditing(null);
      setForm({
        ten: "",
        moTa: "",
        gia: "",
        thoiHanNgay: "",
        phanTramGiam: "",
        diemThuong: "",
      });
    }
    setShowForm(true);
    setMessage(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditing(null);
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const payload = {
        ten: form.ten,
        moTa: form.moTa,
        gia: parseFloat(form.gia),
        thoiHanNgay: parseInt(form.thoiHanNgay),
        phanTramGiam: parseFloat(form.phanTramGiam),
        diemThuong: form.diemThuong ? parseInt(form.diemThuong) : 0,
      };

      let res;
      if (editing) {
        res = await axiosClient.put(`/api/loyalty-memberships/${editing}`, {
          ...payload,
          active: packages.find((p) => p.id === editing)?.active,
        });
        setPackages(packages.map((p) => (p.id === editing ? res.data : p)));
      } else {
        res = await axiosClient.post("/api/loyalty-memberships", payload);
        setPackages([...packages, res.data]);
      }

      setMessage({
        type: "success",
        text: editing ? "Cập nhật thành công!" : "Tạo mới thành công!",
      });
      handleCloseForm();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Lỗi lưu dữ liệu!",
      });
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const pkg = packages.find((p) => p.id === id);
      const res = await axiosClient.put(`/api/loyalty-memberships/${id}`, {
        ten: pkg.ten,
        moTa: pkg.moTa,
        gia: pkg.gia,
        thoiHanNgay: pkg.thoiHanNgay,
        phanTramGiam: pkg.phanTramGiam,
        diemThuong: pkg.diemThuong,
        active: !currentActive,
      });
      setPackages(packages.map((p) => (p.id === id ? res.data : p)));
      setMessage({
        type: "success",
        text: !currentActive ? "Đã kích hoạt gói" : "Đã vô hiệu hóa gói",
      });
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi cập nhật!" });
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Gói Thành Viên Trả Phí
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các gói membership mà user có thể mua
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <span className="text-lg">➕</span> Tạo Gói Mới
        </button>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Grid view */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            <p className="text-lg mb-2">📦</p>
            <p>Chưa có gói nào. Hãy tạo gói đầu tiên!</p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition p-4 ${
                pkg.active
                  ? "border-blue-200 hover:shadow-md"
                  : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{pkg.ten}</h3>
                  {pkg.moTa && (
                    <p className="text-xs text-gray-500 mt-1">{pkg.moTa}</p>
                  )}
                </div>
                {!pkg.active && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                    Tắt
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(pkg.gia)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời hạn:</span>
                  <span className="font-semibold">{pkg.thoiHanNgay} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="font-bold text-green-600">
                    {pkg.phanTramGiam}%
                  </span>
                </div>
                {pkg.diemThuong > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm thưởng:</span>
                    <span className="font-semibold text-amber-600">
                      +{pkg.diemThuong}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => handleToggleActive(pkg.id, pkg.active)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition ${
                    pkg.active
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {pkg.active ? "🟢 Tắt" : "⚫ Bật"}
                </button>
                <button
                  onClick={() => handleOpenForm(pkg)}
                  className="flex-1 px-2 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition"
                >
                  ✏️ Sửa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseForm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">
                {editing ? "✏️ Chỉnh sửa gói" : "📦 Tạo gói mới"}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên gói *
                </label>
                <input
                  type="text"
                  value={form.ten}
                  onChange={(e) => setForm({ ...form, ten: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Ví dụ: VIP 3 tháng"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.moTa}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Mô tả gói..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={form.gia}
                    onChange={(e) => setForm({ ...form, gia: e.target.value })}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Ví dụ: 499000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Thời hạn (ngày) *
                  </label>
                  <input
                    type="number"
                    value={form.thoiHanNgay}
                    onChange={(e) =>
                      setForm({ ...form, thoiHanNgay: e.target.value })
                    }
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Ví dụ: 90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Giảm giá (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.phanTramGiam}
                    onChange={(e) =>
                      setForm({ ...form, phanTramGiam: e.target.value })
                    }
                    required
                    min="0"
                    max="80"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Ví dụ: 15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Điểm thưởng
                  </label>
                  <input
                    type="number"
                    value={form.diemThuong}
                    onChange={(e) =>
                      setForm({ ...form, diemThuong: e.target.value })
                    }
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Ví dụ: 1000"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
                <p className="font-semibold mb-1">💡 Gợi ý</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Giá là chi phí user phải trả để mua gói</li>
                  <li>Thời hạn là số ngày gói có hiệu lực</li>
                  <li>% giảm áp dụng tự động khi user có gói đang hoạt động</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  {editing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-amber-900 mb-2">📢 Lưu ý</h3>
        <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
          <li>
            User có thể mua nhiều gói (chi tạo 1 gói active được hưởng ưu đãi)
          </li>
          <li>Gói tự động hết hạn sau thoiHanNgay (scheduled job)</li>
          <li>Điểm thưởng cộng khi user kích hoạt gói (tức thì)</li>
          <li>Tắt gói = ẩn khỏi danh sách, không ảnh hưởng user hiện tại</li>
        </ul>
      </div>
    </div>
  );
};

export default LoyaltyMembershipsAdminTab;
