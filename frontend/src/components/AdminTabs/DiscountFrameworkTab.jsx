import { useState, useCallback, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

/**
 * Component quản lý Discount Framework (Admin chỉ).
 * Thiết lập trần/sàn cho PromotionCode mà Manager tạo.
 */
export const DiscountFrameworkTab = () => {
  const [framework, setFramework] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState(null);

  const fetchFramework = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/discount-framework");
      setFramework(res.data);
      setForm(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi tải dữ liệu!" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFramework();
  }, [fetchFramework]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await axiosClient.put("/discount-framework", {
        phanTramToiDa: form.phanTramToiDa
          ? parseFloat(form.phanTramToiDa)
          : null,
        phanTramToiThieu: form.phanTramToiThieu
          ? parseFloat(form.phanTramToiThieu)
          : null,
        soTienToiDa: form.soTienToiDa ? parseFloat(form.soTienToiDa) : null,
        donHangToiThieuBatBuoc: form.donHangToiThieuBatBuoc
          ? parseFloat(form.donHangToiThieuBatBuoc)
          : null,
      });
      setFramework(res.data);
      setForm(res.data);
      setEditing(false);
      setMessage({ type: "success", text: "Cập nhật thành công!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || err.response?.data?.message || "Lỗi cập nhật!",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-96 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Khung Chính Sách Giảm Giá
      </h2>
      <p className="text-gray-500 text-sm">
        Admin thiết lập giới hạn trần/sàn cho mã khuyến mãi mà Manager tạo.
      </p>

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

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phần trăm tối thiểu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phần trăm giảm tối thiểu (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.phanTramToiThieu || ""}
                onChange={(e) =>
                  setForm({ ...form, phanTramToiThieu: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Ví dụ: 5"
              />
              <p className="text-xs text-gray-400 mt-1">
                Manager phải đặt % giảm ≥ giá trị này
              </p>
            </div>

            {/* Phần trăm tối đa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phần trăm giảm tối đa (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.phanTramToiDa || ""}
                onChange={(e) =>
                  setForm({ ...form, phanTramToiDa: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Ví dụ: 30"
              />
              <p className="text-xs text-gray-400 mt-1">
                Manager phải đặt % giảm ≤ giá trị này
              </p>
            </div>

            {/* Số tiền tối đa (FIXED) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số tiền giảm tối đa (VND) — khi loại = FIXED
              </label>
              <input
                type="number"
                step="1000"
                value={form.soTienToiDa || ""}
                onChange={(e) =>
                  setForm({ ...form, soTienToiDa: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Ví dụ: 2000000"
              />
              <p className="text-xs text-gray-400 mt-1">
                Manager phải đặt giá trị ≤ giá trị này khi chọn loại "FIXED"
              </p>
            </div>

            {/* Đơn hàng tối thiểu bắt buộc */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đơn hàng tối thiểu bắt buộc (VND)
              </label>
              <input
                type="number"
                step="10000"
                value={form.donHangToiThieuBatBuoc || ""}
                onChange={(e) =>
                  setForm({ ...form, donHangToiThieuBatBuoc: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="Ví dụ: 500000"
              />
              <p className="text-xs text-gray-400 mt-1">
                Mọi mã khuyến mãi phải có donHangToiThieu ≥ giá trị này
              </p>
            </div>

            {/* Ngày cập nhật cuối */}
            {framework?.updatedAt && (
              <div className="col-span-full">
                <p className="text-xs text-gray-400">
                  Cập nhật lần cuối:{" "}
                  {new Date(framework.updatedAt).toLocaleString("vi-VN")}
                </p>
                <p className="text-xs text-gray-400">
                  Người cập nhật: {framework.nguoiCapNhat}
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
              >
                ✏️ Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm(framework);
                  }}
                  className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  💾 Lưu thay đổi
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-blue-900 mb-2">📢 Hướng dẫn</h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Các giới hạn này áp dụng cho TẤT CẢ mã khuyến mãi Manager tạo</li>
          <li>Manager sẽ thấy lỗi nếu cố tạo mã vượt quá giới hạn</li>
          <li>
            Thay đổi sẽ áp dụng ngay cho mã mới; mã cũ giữ giá trị ban đầu
          </li>
          <li>
            Đặt giá trị = 0 hoặc để trống để tắt giới hạn (không khuyến nghị)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DiscountFrameworkTab;
