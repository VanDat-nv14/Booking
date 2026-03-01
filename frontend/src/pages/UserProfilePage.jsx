import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const UserProfilePage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        // Fetch User Info (Mock or from Endpoint)
        // For now using mock or just relying on what we know
        const userStr = localStorage.getItem('user');
        if (userStr) setUserInfo(JSON.parse(userStr));

        // Fetch Bookings
        const fetchBookings = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                try {
                    const res = await axiosClient.get(`/bookings/user/${userId}`);
                    setBookings(res.data);
                } catch (error) {
                    console.error("Failed to fetch bookings", error);
                }
            }
            setLoading(false);
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="text-center py-20">Đang tải...</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="bg-white rounded-xl shadow p-8 mb-8">
                    <h2 className="text-3xl font-bold mb-4">Hồ Sơ Của Tôi</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                            {userInfo.hoTen ? userInfo.hoTen.charAt(0) : 'U'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{userInfo.hoTen || 'Khách hàng'}</h3>
                            <p className="text-gray-500">{userInfo.email}</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-2xl font-bold mb-6">Lịch Sử Đặt Phòng</h3>
                {bookings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                        Bạn chưa có đơn đặt phòng nào.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <div key={booking.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-blue-500">
                                <div className="flex flex-col md:flex-row justify-between md:items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                {booking.maDatPhong}
                                            </span>
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                                                booking.trangThai === 'Đã hủy' ? 'bg-red-100 text-red-800' :
                                                booking.trangThai === 'Đã checkout' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {booking.trangThai}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold">{booking.phong?.khachSan?.ten}</h4>
                                        <p className="text-gray-600">Phòng: {booking.phong?.ten}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(booking.ngayDen).toLocaleDateString()} - {new Date(booking.ngayDi).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-right">
                                        <p className="text-xl font-bold text-blue-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.thanhTien || 0)}
                                        </p>
                                        {booking.trangThai !== 'Đã hủy' && booking.trangThai !== 'Đã checkout' && (
                                            <button className="mt-2 text-sm text-red-600 hover:underline">
                                                Hủy đặt phòng
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
