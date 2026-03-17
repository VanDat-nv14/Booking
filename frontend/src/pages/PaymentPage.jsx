import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = parseInt(searchParams.get('bookingId') || '', 10);
  const method = searchParams.get('method') || 'VNPAY';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError('Không tìm thấy thông tin đặt phòng.');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await axiosClient.get(`/bookings/id/${bookingId}`);
        setBooking(res.data);
      } catch (e) {
        setError(e.response?.data?.message || 'Không thể tải thông tin đặt phòng.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-6 text-center">
        <p className="text-red-600 font-semibold mb-3">{error || 'Không tìm thấy đặt phòng.'}</p>
        <button
          onClick={() => navigate('/user/bookings')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          Về lịch sử đặt phòng
        </button>
      </div>
    );
  }

  const gatewayLabel = method === 'MoMo' ? 'MoMo' : 'VNPAY';

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Thanh toán trực tuyến ({gatewayLabel})
      </h1>
      <p className="text-sm text-gray-500 text-center mb-4">
        Đơn đặt phòng đang ở trạng thái <strong className="text-yellow-700">ĐANG CHỜ THANH TOÁN</strong>. 
        Sau khi thanh toán thành công, hệ thống/khách sạn sẽ xác nhận đơn cho bạn.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Thông tin đặt phòng</h2>
          <p className="text-sm text-gray-700 font-medium">
            {booking.tenKhachSan || 'Khách sạn'} · {booking.tenPhong}
          </p>
          <p className="text-xs text-gray-500">
            Mã đặt phòng: <span className="font-mono font-semibold">{booking.maDatPhong}</span>
          </p>
          <p className="text-xs text-gray-500">
            Ngày: {fmtDate(booking.ngayDen)} → {fmtDate(booking.ngayDi)} ({booking.soNgay || 1} đêm)
          </p>
          <p className="text-xs text-gray-500">
            Khách: {booking.hoTenKhach || '—'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Số tiền cần thanh toán</h2>
          <p className="text-2xl font-extrabold text-blue-700">
            {fmt(booking.thanhTien || booking.giaPhongGoc)}
          </p>
          {booking.tienCoc > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Trong đó tiền cọc tối thiểu: <span className="font-semibold text-amber-700">{fmt(booking.tienCoc)}</span>
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            * Đây mới là bước chuyển sang cổng thanh toán. Hóa đơn/phiếu đặt phòng sẽ 
            được cập nhật sau khi cổng {gatewayLabel} trả về trạng thái thành công.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-dashed border-gray-200">
        <button
          type="button"
          onClick={async () => {
            try {
              setRedirecting(true);
              const res = await axiosClient.post(`/payments/vnpay/create`, null, {
                params: { bookingId }
              });
              const url = res.data?.paymentUrl;
              if (!url) {
                throw new Error('Không nhận được URL thanh toán từ server.');
              }
              window.location.href = url;
            } catch (e) {
              setRedirecting(false);
              alert(e.response?.data?.message || 'Không thể tạo link thanh toán. Vui lòng thử lại sau.');
            }
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition"
        >
          {redirecting ? 'Đang chuyển tới cổng thanh toán...' : `Tiếp tục tới cổng ${gatewayLabel}`}
        </button>
        <button
          type="button"
          onClick={() => navigate('/user/bookings')}
          className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
        >
          Về lịch sử đặt phòng
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;

