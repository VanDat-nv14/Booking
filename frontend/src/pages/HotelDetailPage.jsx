import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const HotelDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Booking Form State
    const [bookingData, setBookingData] = useState({
        ngayDen: '',
        ngayDi: '',
        phongId: '',
        nguoiDungId: 1 // TODO: Get from Auth Context
    });

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await axiosClient.get(`/hotels/${id}/details`);
                setHotel(res.data);
            } catch (error) {
                console.error("Failed to fetch hotel details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            // Check auth
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Vui lòng đăng nhập để đặt phòng!");
                navigate('/login');
                return;
            }

            // Need user ID. Assuming we parse it from token or get from context. 
            // For now, hardcoded or relying on backend to extract from token (if we updated backend to do so).
            // Backend createBooking expects `nguoiDungId`.
            // Let's assume we decode token here or store user info.
            const userStr = localStorage.getItem('user'); // We saved this in AuthContext or Login?
            // If verification needed, we should improve AuthContext. 
            // I'll assume userId is available in localStorage for now (saved during login).
            
            const userId = localStorage.getItem('userId');
            if (userId) bookingData.nguoiDungId = parseInt(userId);

            await axiosClient.post('/bookings/create', bookingData);
            alert("Đặt phòng thành công!");
            navigate('/user/profile');
        } catch (error) {
            console.error("Booking failed", error);
            alert(error.response?.data?.message || "Đặt phòng thất bại.");
        }
    };

    if (loading) return <div className="text-center py-20">Đang tải...</div>;
    if (!hotel) return <div className="text-center py-20">Không tìm thấy khách sạn.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header Image */}
            <div className="h-[400px] relative">
                <img 
                    src={hotel.viTri?.hinhAnh || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"} 
                    alt={hotel.ten} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end">
                    <div className="container mx-auto px-4 pb-10 text-white">
                        <h1 className="text-4xl font-bold mb-2">{hotel.ten}</h1>
                        <p className="text-xl opacity-90">📍 {hotel.diaChi}</p>
                        <div className="mt-4 inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                            ⭐ {hotel.soSao} Sao | Đánh giá: {hotel.diemDanhGiaTrungBinh}/5
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Trải nghiệm kỳ nghỉ tuyệt vời tại {hotel.ten}. Chúng tôi cung cấp các dịch vụ đẳng cấp quốc tế
                            với không gian sang trọng và tiện nghi hiện đại.
                        </p>
                    </div>

                    {/* Rooms List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Danh sách phòng</h2>
                        <div className="space-y-6">
                            {hotel.phongs && hotel.phongs.map(phong => (
                                <div key={phong.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition">
                                    <div>
                                        <h3 className="text-lg font-bold">{phong.ten} - {phong.maPhong}</h3>
                                        <p className="text-gray-500">Loại: {phong.loaiPhong?.ten}</p>
                                        <p className="text-sm text-green-600 mt-1">{phong.trangThai}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(phong.giaTien)}</p>
                                        <button 
                                            onClick={() => setBookingData({...bookingData, phongId: phong.id})}
                                            className={`mt-2 px-4 py-2 rounded-lg font-bold transition ${bookingData.phongId === phong.id ? 'bg-green-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                        >
                                            {bookingData.phongId === phong.id ? 'Đã chọn' : 'Chọn phòng'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Services */}
                     <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Dịch vụ</h2>
                         <ul className="list-disc list-inside text-gray-600 grid grid-cols-2 gap-2">
                             {hotel.dichVus && hotel.dichVus.map(dv => (
                                 <li key={dv.id}>{dv.ten} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dv.giaTien)}/{dv.donViTinh}</li>
                             ))}
                         </ul>
                     </div>
                </div>

                {/* Booking Form Sidebar */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
                        <h3 className="text-xl font-bold mb-6 text-center">Đặt Phòng Ngay</h3>
                        <form onSubmit={handleBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày đến</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={bookingData.ngayDen}
                                    onChange={(e) => setBookingData({...bookingData, ngayDen: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày đi</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={bookingData.ngayDi}
                                    onChange={(e) => setBookingData({...bookingData, ngayDi: e.target.value})}
                                />
                            </div>
                            
                            <hr className="border-gray-100 my-4" />
                            
                            {bookingData.phongId ? (
                                <div className="text-sm bg-blue-50 text-blue-800 p-3 rounded mb-4">
                                    Đã chọn phòng ID: <strong>{bookingData.phongId}</strong>
                                </div>
                            ) : (
                                <div className="text-sm text-red-500 mb-4">* Vui lòng chọn phòng từ danh sách</div>
                            )}

                            <button 
                                type="submit" 
                                disabled={!bookingData.phongId}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Xác Nhận Đặt Phòng
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetailPage;
