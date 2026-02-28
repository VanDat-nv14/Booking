import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

// Helper component to update map view dynamically
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

const HotelMapPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialHotelId = parseInt(searchParams.get('hotelId')) || null;

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Center map on Vietnam roughly if no specific hotel
  const [mapCenter, setMapCenter] = useState([16.0544, 108.2022]); 
  const [mapZoom, setMapZoom] = useState(6);
  const [selectedHotelId, setSelectedHotelId] = useState(initialHotelId);

  useEffect(() => {
    // Fetch all map data optimized for markers
    axiosClient.get('/hotels/map')
      .then(res => {
        const data = res.data || [];
        setHotels(data);
        
        // Find center
        if (initialHotelId) {
          const target = data.find(h => h.id === initialHotelId);
          if (target && target.viDo && target.kinhDo) {
            setMapCenter([parseFloat(target.viDo), parseFloat(target.kinhDo)]);
            setMapZoom(15); // Zoom in on the selected hotel
          }
        } else if (data.length > 0) {
           // Find first valid coordinate if no specific hotel
           const firstAvail = data.find(h => h.viDo && h.kinhDo);
           if(firstAvail) {
               setMapCenter([parseFloat(firstAvail.viDo), parseFloat(firstAvail.kinhDo)]);
               setMapZoom(12);
           }
        }
      })
      .catch(err => console.error("Could not load map data", err))
      .finally(() => setLoading(false));
  }, [initialHotelId]);
  
  
  // Create a Custom Marker Icon for each hotel showing price
  const createPriceIcon = (price, isSelected) => {
    const displayPrice = price ? fmt(price).replace(' ₫', 'đ') : 'Hết phòng';
    
    return L.divIcon({
      className: 'bg-transparent border-0',
      html: `
        <div class="relative transform -translate-y-1/2 -translate-x-1/2 transition-transform duration-200 ${isSelected ? 'scale-110 z-50' : 'hover:scale-105 z-10'}">
          <div class="shadow-lg rounded-xl overflow-hidden flex flex-col items-center">
             <div class="px-2.5 py-1 ${isSelected ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 border-2 border-orange-500'} font-bold text-[13px] whitespace-nowrap">
                ${displayPrice}
             </div>
             <div class="w-3 h-3 ${isSelected ? 'bg-orange-500' : 'bg-white border-b-2 border-r-2 border-orange-500'} transform rotate-45 -mt-2.5 mb-1 z-[-1]"></div>
          </div>
        </div>
      `,
      iconSize: [80, 40],
      iconAnchor: [40, 40], // Point the arrow at the exactly coordinate
      popupAnchor: [0, -40] // Show popup above the marker
    });
  };

  const SidebarCard = ({ hotel }) => {
    const isSelected = selectedHotelId === hotel.id;
    return (
      <div 
        id={`hotel-card-${hotel.id}`}
        className={`bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'}`}
        onClick={() => {
          setSelectedHotelId(hotel.id);
          if (hotel.viDo && hotel.kinhDo) {
            setMapCenter([parseFloat(hotel.viDo), parseFloat(hotel.kinhDo)]);
            setMapZoom(16);
          }
        }}
      >
        <div className="flex h-32">
          {/* Img */}
          <div className="w-1/3 flex-shrink-0 bg-gray-100 relative">
             {hotel.hinhAnhBia ? (
                <img src={hotel.hinhAnhBia} alt={hotel.ten} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🏨</div>
             )}
             {/* Score */}
             {hotel.diemDanhGiaTrungBinh > 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                   {Number(hotel.diemDanhGiaTrungBinh).toFixed(1)}
                </div>
             )}
          </div>
          
          {/* Info */}
          <div className="w-2/3 p-3 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-1">
                 {Array.from({length: hotel.soSao || 0}).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xs">★</span>
                 ))}
              </div>
              <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight">{hotel.ten}</h3>
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{hotel.soLuotDanhGia || 0} đánh giá</p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block mb-0.5">Giá mỗi đêm từ</span>
              <span className="font-bold text-base text-gray-900 leading-none">
                 {hotel.giaThapNhat ? fmt(hotel.giaThapNhat) : 'Hết phòng'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      
      {/* ── Header ── */}
      <div className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 z-20 flex-shrink-0">
         <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             </button>
             <h1 className="text-lg font-bold text-blue-900 border-l border-gray-200 pl-3">
               Bản Đồ Khách Sạn
             </h1>
         </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row relative z-0">
          {/* ── Sidebar (List) ── */}
          <div className="w-full md:w-[400px] lg:w-[450px] bg-gray-50 flex-shrink-0 flex flex-col shadow-[4px_0_15px_rgba(0,0,0,0.05)] z-10 md:h-full">
             <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-2">
                <h2 className="font-bold text-gray-800 text-sm">
                   {loading ? 'Đang tìm khách sạn...' : `Tìm thấy ${hotels.length} khách sạn trên bản đồ`}
                </h2>
             </div>
             
             {/* List */}
             <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24 md:pb-4 scrollbar-thin scrollbar-thumb-gray-300">
                {loading ? (
                   [1,2,3,4,5].map(i => (
                     <div key={i} className="animate-pulse flex h-32 bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="w-1/3 bg-gray-200"></div>
                        <div className="w-2/3 p-4 flex flex-col justify-between">
                           <div><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div>
                           <div className="h-5 bg-gray-200 rounded w-1/3 self-end"></div>
                        </div>
                     </div>
                   ))
                ) : hotels.length > 0 ? (
                   hotels.map(h => <SidebarCard key={h.id} hotel={h} />)
                ) : (
                   <div className="text-center text-gray-400 mt-10 p-5">Không có khách sạn nào được ghi nhận vị trí trên bản đồ.</div>
                )}
             </div>
          </div>
          
          {/* ── Main Map Content ── */}
          <div className="flex-1 h-[50vh] md:h-full bg-gray-200 relative z-0">
             <MapContainer 
               center={mapCenter} 
               zoom={mapZoom} 
               style={{ height: '100%', width: '100%' }}
               zoomControl={false} // We can add it back custom if needed
             >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                <MapUpdater center={mapCenter} zoom={mapZoom} />
                
                {/* Render markers */}
                {!loading && hotels.map(hotel => {
                  if (!hotel.viDo || !hotel.kinhDo) return null;
                  const isSelected = selectedHotelId === hotel.id;
                  
                  return (
                    <Marker 
                      key={hotel.id}
                      position={[parseFloat(hotel.viDo), parseFloat(hotel.kinhDo)]}
                      icon={createPriceIcon(hotel.giaThapNhat, isSelected)}
                      eventHandlers={{
                        click: () => {
                           setSelectedHotelId(hotel.id);
                           setMapCenter([parseFloat(hotel.viDo), parseFloat(hotel.kinhDo)]);
                           // Scroll sidebar to this card
                           const card = document.getElementById(`hotel-card-${hotel.id}`);
                           if(card) {
                              card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                           }
                        }
                      }}
                      zIndexOffset={isSelected ? 1000 : 0}
                    >
                      <Popup closeButton={false} offset={[0, -20]} className="hotel-map-popup">
                         <div className="w-48 overflow-hidden rounded-xl bg-white m-[-14px] cursor-pointer" onClick={() => navigate(`/hotels/${hotel.id}`)}>
                            <div className="h-32 bg-gray-100 relative">
                               {hotel.hinhAnhBia ? <img src={hotel.hinhAnhBia} className="w-full h-full object-cover" /> : null}
                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                               <div className="absolute bottom-2 left-2 text-white font-bold text-sm drop-shadow-md pr-2 line-clamp-2">
                                  {hotel.ten}
                               </div>
                               {hotel.diemDanhGiaTrungBinh > 0 && (
                                  <div className="absolute top-2 right-2 bg-blue-600 text-white font-bold text-xs px-1.5 py-0.5 rounded shadow">
                                    {Number(hotel.diemDanhGiaTrungBinh).toFixed(1)}
                                  </div>
                               )}
                            </div>
                            <div className="p-2.5 bg-white">
                               <p className="text-xs text-gray-500 mb-1">{hotel.soSao || 0} sao · {hotel.soLuotDanhGia || 0} đánh giá</p>
                               <div className="flex justify-between items-end">
                                  <span className="font-bold text-blue-700 text-sm">{hotel.giaThapNhat ? fmt(hotel.giaThapNhat) : 'Hết phòng'}</span>
                                  <span className="text-[10px] bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded">Xem &rarr;</span>
                               </div>
                            </div>
                         </div>
                      </Popup>
                    </Marker>
                  );
                })}
             </MapContainer>
             
             {/* Map controls floating over the map */}
             <div className="absolute top-4 right-4 z-[400] bg-white rounded-lg shadow-md overflow-hidden">
                <button 
                  onClick={() => setMapZoom(z => Math.min(18, z + 1))}
                  className="w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-gray-50 border-b border-gray-100 text-gray-700"
                >+</button>
                <button 
                  onClick={() => setMapZoom(z => Math.max(3, z - 1))}
                  className="w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-gray-50 text-gray-700"
                >−</button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default HotelMapPage;
