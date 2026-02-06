import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Model cho cửa hàng/cơ sở
class Store {
  final String id;
  final String name;
  final String address;
  final LatLng location;
  double? distance; // Khoảng cách từ vị trí hiện tại (km)
  final String? phone;
  final String? openHours;

  Store({
    required this.id,
    required this.name,
    required this.address,
    required this.location,
    this.distance,
    this.phone,
    this.openHours,
  });

  factory Store.fromJson(Map<String, dynamic> json) {
    return Store(
      id: json['id'].toString(),
      name: json['name'],
      address: json['address'],
      location: LatLng(
        json['latitude'] ?? 0.0,
        json['longitude'] ?? 0.0,
      ),
      phone: json['phone'],
      openHours: json['openHours'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'latitude': location.latitude,
      'longitude': location.longitude,
      'phone': phone,
      'openHours': openHours,
      'distance': distance,
    };
  }
}
