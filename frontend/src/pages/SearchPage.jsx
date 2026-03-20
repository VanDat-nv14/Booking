import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [flatLocations, setFlatLocations] = useState([]);

    const viTriId = searchParams.get('viTriId') || '';
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';
    const guests = searchParams.get('guests') || '1';

    // Local filter state (for the search bar on this page)
    const [localViTri, setLocalViTri] = useState(viTriId);
    const [localCheckIn, setLocalCheckIn] = useState(checkIn);
    const [localCheckOut, setLocalCheckOut] = useState(checkOut);
    const [localGuests, setLocalGuests] = useState(guests);

    // Load locations for the search bar
    useEffect(() => {
        axiosClient.get('/locations/tree').then(res => {
            const flat = [];
            (res.data || []).forEach(qg => {
                (qg.tinhThanhs || []).forEach(tt => {
                    (tt.viTris || []).forEach(vt => {
                        flat.push({ id: vt.id, name: `${vt.ten}, ${tt.ten}` });
                    });
                });
            });
            setFlatLocations(flat);
        }).catch(() => {});
    }, []);

    // Fetch hotels whenever search params change
    useEffect(() => {
        const fetchHotels = async () => {
            setLoading(true);
            try {
                const params = {};
                if (viTriId) params.viTriId = viTriId;
                if (checkIn) params.checkIn = checkIn;
                if (checkOut) params.checkOut = checkOut;

                const res = await axiosClient.get('/hotels/search', { params });
                setHotels(res.data || []);
            } catch (error) {
                console.error('Failed to fetch hotels', error);
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [viTriId, checkIn, checkOut]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (localViTri) params.set('viTriId', localViTri);
        if (localCheckIn) params.set('checkIn', localCheckIn);
        if (localCheckOut) params.set('checkOut', localCheckOut);
        if (localGuests) params.set('guests', localGuests);
        navigate(`/search?${params.toString()}`);
    };

    const locationName = flatLocations.find(l => String(l.id) === String(viTriId))?.name;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Search bar sticky at top */}
            <div className="bg-white shadow-md sticky top-0 z-20 py-3 px-4">
                <div className="container mx-auto flex flex-col md:flex-row gap-2 flex-wrap">
                    {/* Location */}
                    <select
                        className="flex-1 min-w-[180px] p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localViTri}
                        onChange={e => setLocalViTri(e.target.value)}
                    >
                        <option value="">📍 Tất cả điểm đến</option>
                        {flatLocations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>

                    {/* Check-in */}
                    <input
                        type="date"
                        className="flex-1 min-w-[140px] p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localCheckIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setLocalCheckIn(e.target.value)}
                    />

                    {/* Check-out */}
                    <input
                        type="date"
                        className="flex-1 min-w-[140px] p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localCheckOut}
                        min={localCheckIn || new Date().toISOString().split('T')[0]}
                        onChange={e => setLocalCheckOut(e.target.value)}
                    />

                    {/* Guests */}
                    <select
                        className="w-28 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={localGuests}
                        onChange={e => setLocalGuests(e.target.value)}
                    >
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} khách</option>)}
                    </select>

                    <button
                        onClick={handleSearch}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm shadow flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Tìm kiếm
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {locationName ? `Khách sạn tại ${locationName}` : 'Tất cả Khách sạn'}
                        {checkIn && checkOut && (
                            <span className="text-base font-normal text-gray-500 ml-2">
                                · {checkIn} → {checkOut}
                            </span>
                        )}
                    </h2>
                    {!loading && (
                        <span className="text-gray-500 text-sm">{hotels.length} kết quả</span>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : hotels.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <p className="text-4xl mb-4">🏨</p>
                        <p className="text-gray-600 font-medium text-lg">Không tìm thấy khách sạn phù hợp</p>
                        <p className="text-gray-400 text-sm mt-1">Hãy thử thay đổi điều kiện tìm kiếm</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-1 gap-5">
                        {hotels.map(hotel => (
                            <div key={hotel.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="md:w-72 md:flex-shrink-0 h-52 md:h-auto relative overflow-hidden bg-gray-100">
                                    <img
                                        src={(() => {
                                            const raw = hotel.hinhAnhBia || hotel.viTri?.hinhAnh || null;
                                            if (!raw) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                            return (raw.startsWith('http') || raw.startsWith('data:')) ? raw : (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080') + raw;
                                        })()}
                                        alt={hotel.ten}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-amber-500 text-xs font-bold px-2 py-1 rounded-lg shadow">
                                        {'★'.repeat(hotel.soSao || 0)}
                                    </div>
                                    {hotel.diemDanhGiaTrungBinh && (
                                        <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-bold w-9 h-9 rounded-xl flex items-center justify-center shadow">
                                            {Number(hotel.diemDanhGiaTrungBinh).toFixed(1)}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">{hotel.ten}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                            <span>📍</span><span>{hotel.diaChi}</span>
                                        </p>
                                        {hotel.viTri && (
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                                {hotel.viTri.ten}
                                            </span>
                                        )}
                                        {hotel.moTa && (
                                            <p className="text-sm text-gray-500 mt-3 line-clamp-2">{hotel.moTa}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                        <div>
                                            {hotel.diemDanhGiaTrungBinh ? (
                                                <p className="text-sm text-gray-500">⭐ {Number(hotel.diemDanhGiaTrungBinh).toFixed(1)}/5 · {hotel.soLuotDanhGia || 0} đánh giá</p>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">Chưa có đánh giá</p>
                                            )}
                                        </div>
                                        <Link
                                            to={`/hotels/${hotel.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-semibold shadow-sm"
                                        >
                                            Xem Chi Tiết →
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
