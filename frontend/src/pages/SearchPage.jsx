import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const viTriId = searchParams.get('viTriId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    useEffect(() => {
        const fetchHotels = async () => {
            setLoading(true);
            try {
                const params = {
                    viTriId: viTriId,
                    checkIn: checkIn,
                    checkOut: checkOut
                };
                // Remove undefined keys
                Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

                const res = await axiosClient.get('/hotels/search', { params });
                setHotels(res.data);
            } catch (error) {
                console.error("Failed to fetch hotels", error);
            } finally {
                setLoading(false);
            }
        };

        if (viTriId) {
            fetchHotels();
        } else {
            setLoading(false);
        }
    }, [viTriId, checkIn, checkOut]);

    if (loading) return <div className="text-center py-20">Đang tìm kiếm...</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold mb-8">Kết quả tìm kiếm</h2>
                {hotels.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded shadow">
                        Không tìm thấy khách sạn nào phù hợp.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-1 gap-6">
                        {hotels.map(hotel => (
                            <div key={hotel.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition">
                                <div className="md:w-1/3 h-48 md:h-auto relative">
                                    <img 
                                        src={hotel.viTri?.hinhAnh || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                                        alt={hotel.ten} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold">
                                        ⭐ {hotel.soSao}
                                    </div>
                                </div>
                                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{hotel.ten}</h3>
                                        <p className="text-gray-500 mb-2">📍 {hotel.diaChi}</p>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {hotel.diemDanhGiaTrungBinh ? `Đánh giá: ${hotel.diemDanhGiaTrungBinh}/5 (${hotel.soLuotDanhGia} lượt)` : 'Chưa có đánh giá'}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="text-blue-600 font-bold text-xl">
                                             Liên hệ để biết giá
                                        </div>
                                        <Link 
                                            to={`/hotels/${hotel.id}`} 
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Xem Chi Tiết
                                        </Link>
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

export default SearchPage;
