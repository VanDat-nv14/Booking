import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const HomePage = () => {
    const [locations, setLocations] = useState([]); // Tree structure: QuocGia -> TinhThanh -> ViTri
    const [selectedLocation, setSelectedLocation] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const navigate = useNavigate();

    // Flatten tree to get searchable options or just use a simple select for now
    const [flatLocations, setFlatLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await axiosClient.get('/locations/tree');
                const quocGias = res.data;
                const flat = [];
                // Simple flattening for the dropdown to show "LocationName (CityName)"
                quocGias.forEach(qg => {
                    if (qg.tinhThanhs) {
                        qg.tinhThanhs.forEach(tt => {
                            if (tt.viTris) {
                                tt.viTris.forEach(vt => {
                                    flat.push({
                                        id: vt.id,
                                        name: `${vt.ten}, ${tt.ten}`
                                    });
                                });
                            }
                        });
                    }
                });
                setFlatLocations(flat);
            } catch (error) {
                console.error("Failed to fetch locations", error);
            }
        };
        fetchLocations();
    }, []);

    const handleSearch = () => {
        if (!selectedLocation) {
            alert("Vui lòng chọn điểm đến");
            return;
        }
        navigate(`/search?viTriId=${selectedLocation}&checkIn=${checkIn}&checkOut=${checkOut}`);
    };

    return (
        <div className="font-sans">
            {/* HERO SECTION */}
            <div className="relative h-[calc(100vh-64px)] min-h-[600px]">
                <img 
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                    alt="Luxury Hotel Pool" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl tracking-tight">
                        Kỳ Nghỉ Trong Mơ<br/>Đang Chờ Bạn
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 max-w-3xl font-light drop-shadow-lg text-gray-100">
                        Hơn 100+ khách sạn sang trọng tại Việt Nam với mức giá ưu đãi độc quyền.
                    </p>
                    
                    {/* Search Bar Widget */}
                    <div className="bg-white/95 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 w-full max-w-5xl border border-white/20">
                         <div className="flex-1">
                            <label className="block text-left text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Điểm đến</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">Bạn muốn đi đâu?</option>
                                {flatLocations.map(loc => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                         </div>
                         <div className="flex-1">
                            <label className="block text-left text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Nhận phòng</label>
                            <input 
                                type="date" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                         </div>
                         <div className="flex-1">
                            <label className="block text-left text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">Trả phòng</label>
                            <input 
                                type="date" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                            />
                         </div>
                         <div className="flex items-end">
                            <button 
                                onClick={handleSearch}
                                className="w-full bg-blue-600 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                Tìm Kiếm
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="py-20 bg-gray-50">
                 <div className="container mx-auto px-4">
                     <div className="text-center mb-16">
                         <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại Sao Chọn Chúng Tôi?</h2>
                         <p className="text-gray-600 max-w-2xl mx-auto">Chúng tôi cam kết mang đến trải nghiệm đặt phòng tốt nhất với những ưu điểm vượt trội.</p>
                     </div>
                     <div className="grid md:grid-cols-3 gap-8">
                         <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition duration-300">
                             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl">
                                💎
                             </div>
                             <h3 className="text-xl font-bold mb-3">Giá Tốt Nhất</h3>
                             <p className="text-gray-600">Đảm bảo giá tốt nhất cho mọi đặt phòng. Hoàn tiền nếu bạn tìm thấy giá thấp hơn.</p>
                         </div>
                         <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition duration-300">
                             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 text-2xl">
                                🛡️
                             </div>
                             <h3 className="text-xl font-bold mb-3">Thanh Toán An Toàn</h3>
                             <p className="text-gray-600">Hệ thống bảo mật tiên tiến giúp bảo vệ thông tin thanh toán của bạn tuyệt đối.</p>
                         </div>
                         <div className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition duration-300">
                             <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 text-2xl">
                                🎧
                             </div>
                             <h3 className="text-xl font-bold mb-3">Hỗ Trợ 24/7</h3>
                             <p className="text-gray-600">Đội ngũ hỗ trợ chuyên nghiệp luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
                         </div>
                     </div>
                 </div>
            </div>

            {/* FEATURED HOTELS */}
            <div className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                         <div>
                             <h2 className="text-3xl font-bold text-gray-900 mb-2">Khách Sạn Nổi Bật</h2>
                             <p className="text-gray-600">Những điểm đến được yêu thích nhất tuần qua</p>
                         </div>
                         <Link to="/booking" className="text-blue-600 font-semibold hover:underline">Xem tất cả &rarr;</Link>
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-20 bg-blue-600 text-center text-white">
                <h2 className="text-4xl font-bold mb-6">Sẵn Sàng Cho Kỳ Nghỉ Tiếp Theo?</h2>
                <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">Đăng ký thành viên ngay hôm nay để nhận ưu đãi giảm giá lên đến 50% cho lần đặt phòng đầu tiên.</p>
                <div className="space-x-4">
                    <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg">Đăng Ký Ngay</Link>
                    <Link to="/booking" className="border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">Tìm Hiểu Thêm</Link>
                </div>
            </div>
            
             {/* FOOTER - Simplified */}
            <footer className="bg-gray-900 text-white py-12">
                 <div className="container mx-auto px-4 text-center">
                     <h3 className="text-2xl font-bold mb-4">BookingKhachSan</h3>
                     <p className="text-gray-400">© 2026 Copyright by Gemini. All rights reserved.</p>
                 </div>
            </footer>
        </div>
    );
};

export default HomePage;
