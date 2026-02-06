class Appointment {
  final int appointmentId;
  final int userId;
  final String userName;
  final int petId;
  final String petName;
  final int serviceId;
  final String serviceName;
  final double servicePrice;
  final int? staffId;
  final String staffName;
  final DateTime appointmentDate;
  final DateTime? endTime;
  final String status;
  final String? notes;
  final String? cancellationReason;

  // Thông tin liên quan (navigation properties)
  final Pet? pet;
  final Service? service;
  final Staff? staff;
  final User? user;

  Appointment({
    required this.appointmentId,
    required this.userId,
    required this.userName,
    required this.petId,
    required this.petName,
    required this.serviceId,
    required this.serviceName,
    required this.servicePrice,
    this.staffId,
    required this.staffName,
    required this.appointmentDate,
    this.endTime,
    required this.status,
    this.notes,
    this.cancellationReason,
    this.pet,
    this.service,
    this.staff,
    this.user,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      appointmentId: json['appointmentId'] ?? 0,
      userId: json['userId'] ?? 0,
      userName: json['userName'] ?? '',
      petId: json['petId'] ?? 0,
      petName: json['petName'] ?? '',
      serviceId: json['serviceId'] ?? 0,
      serviceName: json['serviceName'] ?? '',
      servicePrice: (json['servicePrice'] ?? 0.0).toDouble(),
      staffId: json['staffId'],
      staffName: json['staffName'] ?? '',
      appointmentDate: DateTime.parse(json['appointmentDate']),
      endTime: json['endTime'] != null ? DateTime.parse(json['endTime']) : null,
      status: json['status'] ?? 'Pending',
      notes: json['notes'],
      cancellationReason: json['cancellationReason'],
      pet: json['pet'] != null ? Pet.fromJson(json['pet']) : null,
      service: json['service'] != null ? Service.fromJson(json['service']) : null,
      staff: json['staff'] != null ? Staff.fromJson(json['staff']) : null,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'appointmentId': appointmentId,
      'userId': userId,
      'userName': userName,
      'petId': petId,
      'petName': petName,
      'serviceId': serviceId,
      'serviceName': serviceName,
      'servicePrice': servicePrice,
      'staffId': staffId,
      'staffName': staffName,
      'appointmentDate': appointmentDate.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'status': status,
      'notes': notes,
      'cancellationReason': cancellationReason,
    };
  }

  Appointment copyWith({
    int? appointmentId,
    int? userId,
    String? userName,
    int? petId,
    String? petName,
    int? serviceId,
    String? serviceName,
    double? servicePrice,
    int? staffId,
    String? staffName,
    DateTime? appointmentDate,
    DateTime? endTime,
    String? status,
    String? notes,
    String? cancellationReason,
    Pet? pet,
    Service? service,
    Staff? staff,
    User? user,
  }) {
    return Appointment(
      appointmentId: appointmentId ?? this.appointmentId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      petId: petId ?? this.petId,
      petName: petName ?? this.petName,
      serviceId: serviceId ?? this.serviceId,
      serviceName: serviceName ?? this.serviceName,
      servicePrice: servicePrice ?? this.servicePrice,
      staffId: staffId ?? this.staffId,
      staffName: staffName ?? this.staffName,
      appointmentDate: appointmentDate ?? this.appointmentDate,
      endTime: endTime ?? this.endTime,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      pet: pet ?? this.pet,
      service: service ?? this.service,
      staff: staff ?? this.staff,
      user: user ?? this.user,
    );
  }
}

class Pet {
  final int petId;
  final String name;
  final String species;
  final String? breed;
  final int? age;
  final double? weight;
  final String? gender;
  final String? imageUrl;
  final String? notes;
  final int userId;

  Pet({
    required this.petId,
    required this.name,
    required this.species,
    this.breed,
    this.age,
    this.weight,
    this.gender,
    this.imageUrl,
    this.notes,
    required this.userId,
  });

  factory Pet.fromJson(Map<String, dynamic> json) {
    return Pet(
      petId: json['petId'],
      name: json['name'],
      species: json['species'],
      breed: json['breed'],
      age: json['age'],
      weight: json['weight']?.toDouble(),
      gender: json['gender'],
      imageUrl: json['imageUrl'],
      notes: json['notes'],
      userId: json['userId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'petId': petId,
      'name': name,
      'species': species,
      'breed': breed,
      'age': age,
      'weight': weight,
      'gender': gender,
      'imageUrl': imageUrl,
      'notes': notes,
      'userId': userId,
    };
  }
}

class Service {
  final int serviceId;
  final String name;
  final String description;
  final double price;
  final int duration;
  final String category;
  final String? imageUrl;
  final bool isActive;
  final int? viewCount;
  final int? bookingCount;

  Service({
    required this.serviceId,
    required this.name,
    required this.description,
    required this.price,
    required this.duration,
    required this.category,
    this.imageUrl,
    required this.isActive,
    this.viewCount,
    this.bookingCount,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      serviceId: json['serviceId'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] ?? 0.0).toDouble(),
      duration: json['duration'] ?? 60,
      category: json['category'],
      imageUrl: json['imageUrl'],
      isActive: json['isActive'] ?? true,
      viewCount: json['viewCount'] is int ? json['viewCount'] : (json['viewCount'] is num ? json['viewCount'].toInt() : 0),
      bookingCount: json['bookingCount'] is int ? json['bookingCount'] : (json['bookingCount'] is num ? json['bookingCount'].toInt() : 0),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'serviceId': serviceId,
      'name': name,
      'description': description,
      'price': price,
      'duration': duration,
      'category': category,
      'imageUrl': imageUrl,
      'isActive': isActive,
      'viewCount': viewCount ?? 0,
      'bookingCount': bookingCount ?? 0,
    };
  }
}

class Staff {
  final int staffId;
  final String fullName;
  final String email;
  final String? phone;
  final String? specialization;
  final String? avatarUrl;
  final bool isActive;

  Staff({
    required this.staffId,
    required this.fullName,
    required this.email,
    this.phone,
    this.specialization,
    this.avatarUrl,
    required this.isActive,
  });

  factory Staff.fromJson(Map<String, dynamic> json) {
    return Staff(
      staffId: json['staffId'],
      fullName: json['fullName'],
      email: json['email'],
      phone: json['phone'],
      specialization: json['specialization'],
      avatarUrl: json['avatarUrl'],
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'staffId': staffId,
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'specialization': specialization,
      'avatarUrl': avatarUrl,
      'isActive': isActive,
    };
  }
}

class User {
  final int userId;
  final String fullName;
  final String email;
  final String? phone;
  final String? avatarUrl;

  User({
    required this.userId,
    required this.fullName,
    required this.email,
    this.phone,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userId'],
      fullName: json['fullName'],
      email: json['email'],
      phone: json['phone'],
      avatarUrl: json['avatarUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'avatarUrl': avatarUrl,
    };
  }
}