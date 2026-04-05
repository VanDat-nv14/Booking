import { useState, useCallback, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

/**
 * Component quản lý Loyalty Tiers (Admin chỉ).
 * Thiết lập các hạng thành viên (Thành Viên, Bạc, Vàng, Kim Cương).
 */
export const LoyaltyTiersTab = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tenHang: "",
    diemToiThieu: "",
    phanTramUuDai: "",
    mauSac: "#E5E5E5",
    thuTu: "",
    active: true,
  });
  const [message, setMessage] = useState(null);

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/loyalty-tiers");
      setTiers(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi tải dữ liệu!" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const handleOpenForm = (tier = null) => {
    if (tier) {
      setEditing(tier.id);
      setForm({
        tenHang: tier.tenHang,
        diemToiThieu: tier.diemToiThieu,
        phanTramUuDai: tier.phanTramUuDai,
        mauSac: tier.mauSac,
        thuTu: tier.thuTu,
        active: tier.active,
      });
    } else {
      setEditing(null);
      setForm({
        tenHang: "",
        diemToiThieu: "",
        phanTramUuDai: "",
        mauSac: "#E5E5E5",
        thuTu: "",
        active: true,
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
        tenHang: form.tenHang,
        diemToiThieu: parseInt(form.diemToiThieu),
        phanTramUuDai: parseFloat(form.phanTramUuDai),
        mauSac: form.mauSac,
        thuTu: parseInt(form.thuTu),
        active: form.active,
      };

      let res;
      if (editing) {
        res = await axiosClient.put(`/api/loyalty-tiers/${editing}`, payload);
        setTiers(tiers.map((t) => (t.id === editing ? res.data : t)));
      } else {
        res = await axiosClient.post("/api/loyalty-tiers", payload);
        setTiers([...tiers, res.data]);
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

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Xóa hạng này? (Chỉ có thể xóa nếu không có user nào trong hạng)",
      )
    )
      return;

    try {
      await axiosClient.delete(`/api/loyalty-tiers/${id}`);
      setTiers(tiers.filter((t) => t.id !== id));
      setMessage({ type: "success", text: "Xóa thành công!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Lỗi xóa dữ liệu!",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hạng Thành Viên</h2>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các cấp độ thành viên và ưu đãi tương ứng
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <span className="text-lg">➕</span> Thêm Hạng Mới
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

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Tên Hạng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Điểm Tối Thiểu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Ưu Đãi (%)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                    Màu Sắc
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                    Thứ Tự
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                    Trạng Thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tiers
                  .sort((a, b) => a.thuTu - b.thuTu)
                  .map((tier) => (
                    <tr key={tier.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">
                          {tier.tenHang}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {tier.diemToiThieu.toLocaleString("vi-VN")} điểm
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">
                        {tier.phanTramUuDai}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className="w-6 h-6 rounded-full mx-auto border-2 border-gray-200 shadow-sm"
                          style={{ backgroundColor: tier.mauSac }}
                          title={tier.mauSac}
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {tier.thuTu}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            tier.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tier.active ? "✓ Hoạt động" : "○ Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenForm(tier)}
                          className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition mr-2"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(tier.id)}
                          className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition"
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                {tiers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Chưa có hạng nào. Hãy tạo hạng đầu tiên!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseForm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {editing ? "✏️ Chỉnh sửa hạng" : "➕ Tạo hạng mới"}
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
                  Tên hạng *
                </label>
                <input
                  type="text"
                  value={form.tenHang}
                  onChange={(e) =>
                    setForm({ ...form, tenHang: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Ví dụ: Vàng"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Điểm tối thiểu *
                </label>
                <input
                  type="number"
                  value={form.diemToiThieu}
                  onChange={(e) =>
                    setForm({ ...form, diemToiThieu: e.target.value })
                  }
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Ví dụ: 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ưu đãi (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.phanTramUuDai}
                  onChange={(e) =>
                    setForm({ ...form, phanTramUuDai: e.target.value })
                  }
                  required
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Ví dụ: 10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Màu sắc
                </label>
                <input
                  type="color"
                  value={form.mauSac}
                  onChange={(e) => setForm({ ...form, mauSac: e.target.value })}
                  className="w-full h-10 px-1 py-1 border border-gray-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Thứ tự sắp xếp *
                </label>
                <input
                  type="number"
                  value={form.thuTu}
                  onChange={(e) => setForm({ ...form, thuTu: e.target.value })}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Ví dụ: 1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="w-4 h-4 border border-gray-200 rounded focus:ring-2 focus:ring-blue-400 cursor-pointer"
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Hoạt động
                </label>
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-blue-900 mb-2">📢 Ghi chú</h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>User tự động nâng hạng khi tích lũy điểm vượt diemToiThieu</li>
          <li>% ưu đãi áp dụng tự động khi đặt phòng (không cần code khác)</li>
          <li>Thứ tự sắp xếp dùng để hiển thị trên UI (từ thấp đến cao)</li>
          <li>
            Tắt hoạt động = ẩn hạng khỏi UI, không ảnh hưởng user hiện tại
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LoyaltyTiersTab;
