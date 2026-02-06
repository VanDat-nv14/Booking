class StaffStatistics {
  final int staffId;
  final String fullName;
  final String email;
  final String? phone;
  final String? specialization;
  final String? avatarUrl;
  final bool isActive;
  final Statistics statistics;

  StaffStatistics({
    required this.staffId,
    required this.fullName,
    required this.email,
    this.phone,
    this.specialization,
    this.avatarUrl,
    required this.isActive,
    required this.statistics,
  });

  factory StaffStatistics.fromJson(Map<String, dynamic> json) {
    return StaffStatistics(
      staffId: json['staffId'] ?? 0,
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      specialization: json['specialization'],
      avatarUrl: json['avatarUrl'],
      isActive: json['isActive'] ?? true,
      statistics: Statistics.fromJson(json['statistics'] ?? {}),
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
      'statistics': statistics.toJson(),
    };
  }
}

class Statistics {
  final int completedServices;
  final double averageRating;
  final int totalReviews;
  final RatingBreakdown ratingBreakdown;

  Statistics({
    required this.completedServices,
    required this.averageRating,
    required this.totalReviews,
    required this.ratingBreakdown,
  });

  factory Statistics.fromJson(Map<String, dynamic> json) {
    return Statistics(
      completedServices: json['completedServices'] ?? 0,
      averageRating: (json['averageRating'] ?? 0.0).toDouble(),
      totalReviews: json['totalReviews'] ?? 0,
      ratingBreakdown: RatingBreakdown.fromJson(json['ratingBreakdown'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'completedServices': completedServices,
      'averageRating': averageRating,
      'totalReviews': totalReviews,
      'ratingBreakdown': ratingBreakdown.toJson(),
    };
  }
}

class RatingBreakdown {
  final int fiveStar;
  final int fourStar;
  final int threeStar;
  final int twoStar;
  final int oneStar;

  RatingBreakdown({
    required this.fiveStar,
    required this.fourStar,
    required this.threeStar,
    required this.twoStar,
    required this.oneStar,
  });

  factory RatingBreakdown.fromJson(Map<String, dynamic> json) {
    return RatingBreakdown(
      fiveStar: json['fiveStar'] ?? 0,
      fourStar: json['fourStar'] ?? 0,
      threeStar: json['threeStar'] ?? 0,
      twoStar: json['twoStar'] ?? 0,
      oneStar: json['oneStar'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fiveStar': fiveStar,
      'fourStar': fourStar,
      'threeStar': threeStar,
      'twoStar': twoStar,
      'oneStar': oneStar,
    };
  }
}
