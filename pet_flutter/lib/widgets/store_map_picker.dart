import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/store.dart';

/// Widget để chọn cửa hàng trên bản đồ với tính năng chỉ đường
class StoreMapPicker extends StatefulWidget {
  final Function(Store)? onStoreSelected;
  final List<Store>? customStores;

  const StoreMapPicker({
    super.key,
    this.onStoreSelected,
    this.customStores,
  });

  @override
  State<StoreMapPicker> createState() => _StoreMapPickerState();
}

class _StoreMapPickerState extends State<StoreMapPicker> {
  GoogleMapController? mapController;
  Position? _currentPosition;
  String _currentAddress = 'Đang tải vị trí...';
  bool _isLoading = true;

  // Vị trí mặc định (có thể thay đổi theo vị trí cửa hàng chính của bạn)
  static const LatLng _defaultLocation = LatLng(10.856186106052398, 106.78558157865945);

  // Markers
  final Set<Marker> _markers = {};

  // Polylines để vẽ đường đi
  final Set<Polyline> _polylines = {};
  List<LatLng> _polylineCoordinates = [];

  // Danh sách cửa hàng mẫu (có thể thay thế bằng dữ liệu từ API)
  late List<Store> _stores;
  List<Store> _filteredStores = []; // Danh sách sau khi filter

  Store? _selectedStore;

  // Search controller
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;

  // Map style
  bool _isDarkMode = false;
  String? _mapStyle;

  @override
  void initState() {
    super.initState();
    
    _loadMapStyle();
    
    // Sử dụng danh sách cửa hàng tùy chỉnh hoặc danh sách mặc định
    _stores = widget.customStores ?? [
      Store(
        id: '1',
        name: 'Cửa hàng 1 - Chi nhánh Thủ Đức',
        address: 'Địa chỉ cửa hàng 1',
        location: const LatLng(10.850748296477967, 106.77192382424526),
        phone: '0901234567',
        openHours: '8:00 - 21:30',
      ),
      Store(
        id: '2',
        name: 'Cơ sở 2 - Chi nhánh Bình Dương',
        address: 'Địa chỉ cơ sở 2',
        location: const LatLng(11.130586995947642, 106.61337558146313),
        phone: '0901234568',
        openHours: '8:00 - 21:00',
      ),
      Store(
        id: '3',
        name: 'Cơ sở 3 - Chi nhánh Quận 9',
        address: 'Địa chỉ cơ sở 3',
        location: const LatLng(10.871284024584325, 106.8029817929056),
        phone: '0901234569',
        openHours: '8:00 - 22:00',
      ),
    ];

    _filteredStores = List.from(_stores); // Copy danh sách ban đầu
    _getCurrentLocation();
    _addStoreMarkers();
  }

  // Load map style based on theme
  Future<void> _loadMapStyle() async {
    // Detect dark mode from system
    final brightness = WidgetsBinding.instance.platformDispatcher.platformBrightness;
    _isDarkMode = brightness == Brightness.dark;
    
    // Load appropriate style
    if (_isDarkMode) {
      _mapStyle = _darkMapStyle;
    } else {
      _mapStyle = _lightMapStyle;
    }
    
    // Apply to controller if available
    if (mapController != null) {
      mapController!.setMapStyle(_mapStyle);
    }
  }

  // Toggle map style manually
  void _toggleMapStyle() {
    setState(() {
      _isDarkMode = !_isDarkMode;
      _mapStyle = _isDarkMode ? _darkMapStyle : _lightMapStyle;
      
      if (mapController != null) {
        mapController!.setMapStyle(_mapStyle);
      }
      
      _showStyledSnackBar(
        title: _isDarkMode ? 'Đã chuyển sang Dark Mode' : 'Đã chuyển sang Light Mode',
        subtitle: 'Bản đồ được tối ưu cho ${_isDarkMode ? 'tối' : 'sáng'}',
        icon: _isDarkMode ? Icons.dark_mode : Icons.light_mode,
        color: _isDarkMode ? Colors.grey.shade800 : Colors.blue.shade600,
        duration: const Duration(seconds: 2),
      );
    });
  }

  // Light mode map style (clean & modern)
  static const String _lightMapStyle = '''
  [
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#e9f4f9"}]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{"color": "#f5f5f5"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#d6d6d6"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#ffeaa7"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#fdcb6e"}]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{"color": "#c8e6c9"}]
    },
    {
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#525252"}]
    }
  ]
  ''';

  // Dark mode map style (elegant & eye-friendly)
  static const String _darkMapStyle = '''
  [
    {
      "elementType": "geometry",
      "stylers": [{"color": "#212121"}]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#212121"}]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#000000"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#3d3d3d"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#2c2c2c"}]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#1a1a1a"}]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#8a8a8a"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#3c3c3c"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#1f1f1f"}]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{"color": "#2f2f2f"}]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{"color": "#263c3f"}]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#6b9a76"}]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#4a4a4a"}]
    },
    {
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{"color": "#2f2f2f"}]
    }
  ]
  ''';

  // Filter cửa hàng theo search query
  void _filterStores(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredStores = List.from(_stores);
      } else {
        _filteredStores = _stores.where((store) {
          final nameLower = store.name.toLowerCase();
          final addressLower = store.address.toLowerCase();
          final queryLower = query.toLowerCase();
          return nameLower.contains(queryLower) || addressLower.contains(queryLower);
        }).toList();
      }
      
      // Update markers để chỉ hiển thị cửa hàng đã filter
      _updateMarkersAfterFilter();
    });
  }

  // Update markers sau khi filter
  void _updateMarkersAfterFilter() {
    // Xóa tất cả markers cũ của cửa hàng (giữ lại marker vị trí hiện tại)
    _markers.removeWhere((marker) => 
      marker.markerId.value != 'current_location' && 
      marker.markerId.value != 'default_location'
    );

    // Thêm markers cho cửa hàng đã filter
    for (var store in _filteredStores) {
      _markers.add(
        Marker(
          markerId: MarkerId(store.id),
          position: store.location,
          infoWindow: InfoWindow(
            title: store.name,
            snippet: store.address,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          onTap: () => _onStoreSelected(store),
        ),
      );
    }
  }

  // Thêm markers cho tất cả cửa hàng
  void _addStoreMarkers() {
    for (var store in _stores) {
      _markers.add(
        Marker(
          markerId: MarkerId(store.id),
          position: store.location,
          infoWindow: InfoWindow(
            title: store.name,
            snippet: store.address,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          onTap: () => _onStoreSelected(store),
        ),
      );
    }
  }

  // Khi chọn một cửa hàng
  void _onStoreSelected(Store store) {
    LatLng currentLocation = _currentPosition != null
        ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
        : _defaultLocation;

    // Tính khoảng cách
    double distance = Geolocator.distanceBetween(
      currentLocation.latitude,
      currentLocation.longitude,
      store.location.latitude,
      store.location.longitude,
    ) / 1000; // Chuyển từ mét sang km

    setState(() {
      _selectedStore = store;
      _selectedStore!.distance = distance;
    });

    // Di chuyển camera đến cửa hàng
    mapController?.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: store.location,
          zoom: 16.0,
        ),
      ),
    );

    // Hiển thị thông tin
    _showStoreInfo(store, distance);
  }

  // Hiển thị thông tin cửa hàng
  void _showStoreInfo(Store store, double distance) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.store, size: 32, color: Colors.orange),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      store.name,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Icon(Icons.location_on, size: 20, color: Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      store.address,
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                ],
              ),
              if (store.phone != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.phone, size: 20, color: Colors.grey),
                    const SizedBox(width: 8),
                    Text(
                      store.phone!,
                      style: const TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              ],
              if (store.openHours != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 20, color: Colors.grey),
                    const SizedBox(width: 8),
                    Text(
                      store.openHours!,
                      style: const TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.directions_walk, color: Colors.blue, size: 24),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Khoảng cách',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                        Text(
                          '${distance.toStringAsFixed(2)} km',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        _showDirections(store);
                      },
                      icon: const Icon(Icons.directions),
                      label: const Text('Chỉ đường'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(16),
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        if (widget.onStoreSelected != null) {
                          widget.onStoreSelected!(store);
                        }
                        Navigator.pop(context);
                        Navigator.pop(context, store);
                      },
                      icon: const Icon(Icons.check_circle),
                      label: const Text('Chọn cửa hàng'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(16),
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  // Hiển thị đường đi (polyline)
  void _showDirections(Store store) {
    LatLng currentLocation = _currentPosition != null
        ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
        : _defaultLocation;

    _getPolyline(currentLocation, store.location);

    _showStyledSnackBar(
      title: 'Đang tìm đường đến ${store.name}',
      subtitle: 'Vui lòng đợi...',
      icon: Icons.directions,
      color: Colors.blue.shade600,
      duration: const Duration(seconds: 2),
    );
  }

  // Lấy polyline - Ưu tiên dùng OSRM miễn phí
  Future<void> _getPolyline(LatLng origin, LatLng destination) async {
    _polylineCoordinates.clear();
    _polylines.clear();

    // Dùng OSRM (Miễn phí, không cần API key)
    try {
      await _getPolylineOSRM(origin, destination);
      return;
    } catch (e) {
      print('⚠️ OSRM lỗi: $e');
      _drawStraightLine(origin, destination);
    }
  }

  // OSRM - Open Source Routing Machine (Miễn phí)
  Future<void> _getPolylineOSRM(LatLng origin, LatLng destination) async {
    try {
      final url = Uri.parse(
        'https://router.project-osrm.org/route/v1/driving/'
        '${origin.longitude},${origin.latitude};'
        '${destination.longitude},${destination.latitude}'
        '?overview=full&geometries=polyline',
      );

      final response = await http.get(url);
      final data = json.decode(response.body);

      if (data['code'] == 'Ok' && data['routes'] != null) {
        final routes = data['routes'] as List;
        if (routes.isNotEmpty) {
          final route = routes[0];
          final polylineString = route['geometry'];

          _polylineCoordinates = _decodePolyline(polylineString);

          setState(() {
            _polylines.add(
              Polyline(
                polylineId: const PolylineId('route'),
                color: Colors.blue,
                width: 6,
                points: _polylineCoordinates,
              ),
            );
          });

          LatLngBounds bounds = _calculateBounds(origin, destination);
          mapController?.animateCamera(
            CameraUpdate.newLatLngBounds(bounds, 100),
          );

          if (mounted) {
            final distance = (route['distance'] / 1000).toStringAsFixed(1);
            final duration = (route['duration'] / 60).toStringAsFixed(0);

            _showStyledSnackBar(
              title: 'Tìm thấy đường đi!',
              subtitle: 'Khoảng cách: $distance km • Thời gian: ~$duration phút',
              icon: Icons.check_circle,
              color: Colors.blue.shade600,
              duration: const Duration(seconds: 4),
            );
          }
          return;
        }
      }

      throw Exception('OSRM: ${data['code']}');
    } catch (e) {
      print('❌ OSRM Exception: $e');
      rethrow;
    }
  }

  // Decode polyline string
  List<LatLng> _decodePolyline(String encoded) {
    List<LatLng> points = [];
    int index = 0;
    int len = encoded.length;
    int lat = 0;
    int lng = 0;

    while (index < len) {
      int b;
      int shift = 0;
      int result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.add(LatLng(lat / 1E5, lng / 1E5));
    }

    return points;
  }

  // Vẽ đường thẳng giữa 2 điểm
  void _drawStraightLine(LatLng origin, LatLng destination) {
    setState(() {
      _polylines.clear();
      _polylines.add(
        Polyline(
          polylineId: const PolylineId('straight_line'),
          color: Colors.blue,
          width: 5,
          points: [origin, destination],
          patterns: [
            PatternItem.dash(20),
            PatternItem.gap(10),
          ],
          startCap: Cap.roundCap,
          endCap: Cap.roundCap,
        ),
      );
    });

    LatLngBounds bounds = _calculateBounds(origin, destination);
    mapController?.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, 100),
    );
  }

  // Tính toán bounds
  LatLngBounds _calculateBounds(LatLng point1, LatLng point2) {
    return LatLngBounds(
      southwest: LatLng(
        point1.latitude < point2.latitude ? point1.latitude : point2.latitude,
        point1.longitude < point2.longitude ? point1.longitude : point2.longitude,
      ),
      northeast: LatLng(
        point1.latitude > point2.latitude ? point1.latitude : point2.latitude,
        point1.longitude > point2.longitude ? point1.longitude : point2.longitude,
      ),
    );
  }

  // Xóa đường đi
  void _clearRoute() {
    setState(() {
      _polylines.clear();
      _polylineCoordinates.clear();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã xóa đường đi'),
        duration: Duration(seconds: 1),
      ),
    );
  }

  // Hiển thị danh sách cửa hàng
  void _showStoreList() {
    LatLng currentLocation = _currentPosition != null
        ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
        : _defaultLocation;

    // Tính khoảng cách cho tất cả cửa hàng
    for (var store in _stores) {
      store.distance = Geolocator.distanceBetween(
        currentLocation.latitude,
        currentLocation.longitude,
        store.location.latitude,
        store.location.longitude,
      ) / 1000;
    }

    // Sắp xếp theo khoảng cách
    _filteredStores.sort((a, b) => (a.distance ?? 0).compareTo(b.distance ?? 0));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (BuildContext context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.3,
          maxChildSize: 0.9,
          builder: (_, controller) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.store, color: Colors.blue),
                        const SizedBox(width: 12),
                        const Text(
                          'Danh sách cửa hàng',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      controller: controller,
                      itemCount: _filteredStores.length,
                      itemBuilder: (context, index) {
                        final store = _filteredStores[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Colors.orange,
                              child: Text(
                                '${index + 1}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              store.name,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Text(store.address),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.directions_walk,
                                      size: 16,
                                      color: Colors.blue,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${store.distance?.toStringAsFixed(2)} km',
                                      style: const TextStyle(
                                        color: Colors.blue,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () {
                              Navigator.pop(context);
                              _onStoreSelected(store);
                            },
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // Kiểm tra quyền truy cập vị trí
  Future<bool> _handleLocationPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      _showStyledSnackBar(
        title: 'Dịch vụ vị trí đang tắt',
        subtitle: 'Vui lòng bật GPS/Location',
        icon: Icons.location_off,
        color: Colors.orange.shade600,
      );
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _showStyledSnackBar(
          title: 'Quyền truy cập vị trí bị từ chối',
          subtitle: 'Vui lòng cấp quyền vị trí cho ứng dụng',
          icon: Icons.location_off,
          color: Colors.red.shade600,
        );
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      _showStyledSnackBar(
        title: 'Quyền vị trí bị từ chối vĩnh viễn',
        subtitle: 'Vui lòng bật trong Cài đặt',
        icon: Icons.settings,
        color: Colors.red.shade600,
        duration: const Duration(seconds: 5),
      );
      return false;
    }

    return true;
  }

  // Lấy vị trí hiện tại
  Future<void> _getCurrentLocation() async {
    final hasPermission = await _handleLocationPermission();
    if (!hasPermission) {
      setState(() {
        _isLoading = false;
        _currentAddress = 'Không có quyền truy cập vị trí. Sử dụng vị trí mặc định.';
      });
      _useDefaultLocation();
      return;
    }

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Kiểm tra vị trí giả của emulator
      bool isEmulatorLocation = (position.latitude >= 37.0 && position.latitude <= 38.0) &&
          (position.longitude >= -123.0 && position.longitude <= -121.0);

      if (isEmulatorLocation) {
        setState(() {
          _isLoading = false;
          _currentAddress = 'Phát hiện emulator. Sử dụng vị trí mặc định tại Việt Nam.';
        });
        _useDefaultLocation();
        return;
      }

      setState(() {
        _currentPosition = position;
        _isLoading = false;
      });

      if (mapController != null) {
        mapController!.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(
              target: LatLng(position.latitude, position.longitude),
              zoom: 15.0,
            ),
          ),
        );
      }

      _addMarker(position);
      _getAddressFromLatLng(position);
    } catch (e) {
      setState(() {
        _isLoading = false;
        _currentAddress = 'Lỗi khi lấy vị trí. Sử dụng vị trí mặc định.';
      });
      _useDefaultLocation();
    }
  }

  // Sử dụng vị trí mặc định
  void _useDefaultLocation() {
    if (mapController != null) {
      mapController!.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: _defaultLocation,
            zoom: 15.0,
          ),
        ),
      );
    }

    setState(() {
      _markers.add(
        Marker(
          markerId: const MarkerId('default_location'),
          position: _defaultLocation,
          infoWindow: const InfoWindow(
            title: 'Vị trí mặc định',
            snippet: 'Vị trí của bạn tại Việt Nam',
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      );
    });

    _getAddressFromLatLng(
      Position(
        latitude: _defaultLocation.latitude,
        longitude: _defaultLocation.longitude,
        timestamp: DateTime.now(),
        accuracy: 0,
        altitude: 0,
        heading: 0,
        speed: 0,
        speedAccuracy: 0,
        altitudeAccuracy: 0,
        headingAccuracy: 0,
      ),
    );
  }

  // Chuyển đổi tọa độ thành địa chỉ
  Future<void> _getAddressFromLatLng(Position position) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        setState(() {
          _currentAddress = '${place.street}, ${place.subLocality}, '
              '${place.locality}, ${place.administrativeArea}, ${place.country}';
        });
      }
    } catch (e) {
      setState(() {
        _currentAddress = 'Không thể lấy địa chỉ';
      });
    }
  }

  // Thêm marker tại vị trí
  void _addMarker(Position position) {
    setState(() {
      _markers.add(
        Marker(
          markerId: const MarkerId('current_location'),
          position: LatLng(position.latitude, position.longitude),
          infoWindow: InfoWindow(
            title: 'Vị trí của bạn',
            snippet: _currentAddress,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        ),
      );
    });
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
    
    // Apply map style
    if (_mapStyle != null) {
      controller.setMapStyle(_mapStyle);
    }

    if (_currentPosition != null) {
      controller.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: LatLng(
              _currentPosition!.latitude,
              _currentPosition!.longitude,
            ),
            zoom: 15.0,
          ),
        ),
      );
    }
  }

  // Helper method để hiển thị SnackBar đẹp
  void _showStyledSnackBar({
    required String title,
    String? subtitle,
    required IconData icon,
    required Color color,
    Duration duration = const Duration(seconds: 3),
  }) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              icon,
              color: Colors.white,
              size: 24,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: Colors.white,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: color,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(16),
        duration: duration,
        elevation: 6,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: _isSearching 
          ? TextField(
              controller: _searchController,
              autofocus: true,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                hintText: 'Tìm cửa hàng...',
                hintStyle: TextStyle(color: Colors.white70),
                border: InputBorder.none,
              ),
              onChanged: _filterStores,
            )
          : const Text('Chọn cửa hàng'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          if (_isSearching)
            IconButton(
              icon: const Icon(Icons.clear),
              tooltip: 'Xóa tìm kiếm',
              onPressed: () {
                setState(() {
                  _isSearching = false;
                  _searchController.clear();
                  _filterStores('');
                });
              },
            )
          else ...[
            IconButton(
              icon: const Icon(Icons.search),
              tooltip: 'Tìm kiếm',
              onPressed: () {
                setState(() {
                  _isSearching = true;
                });
              },
            ),
            IconButton(
              icon: Icon(_isDarkMode ? Icons.light_mode : Icons.dark_mode),
              tooltip: _isDarkMode ? 'Chế độ sáng' : 'Chế độ tối',
              onPressed: _toggleMapStyle,
            ),
            IconButton(
              icon: const Icon(Icons.my_location),
              tooltip: 'Làm mới vị trí',
              onPressed: _getCurrentLocation,
            ),
            IconButton(
              icon: const Icon(Icons.list),
              tooltip: 'Danh sách cửa hàng',
              onPressed: _showStoreList,
            ),
          ],
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _defaultLocation,
              zoom: 15.0,
            ),
            markers: _markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            mapType: MapType.normal,
            zoomControlsEnabled: true,
            compassEnabled: true,
            polylines: _polylines,
          ),
          // Card hiển thị địa chỉ
          Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Nút xóa đường đi
                if (_polylines.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: ElevatedButton.icon(
                      onPressed: _clearRoute,
                      icon: const Icon(Icons.clear),
                      label: const Text('Xóa đường đi'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ),
                // Card thông tin
                Card(
                  elevation: 8,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Hiển thị số lượng cửa hàng đang hiển thị
                        if (_filteredStores.length != _stores.length)
                          Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.blue.shade200),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.filter_list, size: 16, color: Colors.blue),
                                const SizedBox(width: 6),
                                Text(
                                  'Hiển thị ${_filteredStores.length}/${_stores.length} cửa hàng',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.blue,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        Row(
                          children: [
                            const Icon(Icons.location_on, color: Colors.red),
                            const SizedBox(width: 8),
                            const Text(
                              'Địa chỉ hiện tại:',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        _isLoading
                            ? const Row(
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  ),
                                  SizedBox(width: 12),
                                  Text('Đang tải vị trí...'),
                                ],
                              )
                            : Text(
                                _currentAddress,
                                style: const TextStyle(fontSize: 14),
                              ),
                        if (_currentPosition != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            'Tọa độ: ${_currentPosition!.latitude.toStringAsFixed(6)}, '
                            '${_currentPosition!.longitude.toStringAsFixed(6)}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    mapController?.dispose();
    _searchController.dispose();
    super.dispose();
  }
}
