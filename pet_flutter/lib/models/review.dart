class Review {
  final int reviewId;
  final int userId;
  final String userName;
  final String? userAvatar;
  final int? serviceId;
  final String? serviceName;
  final int? productId;
  final String? productName;
  final int? appointmentId;
  final int? orderId;
  final int rating;
  final String comment;
  final DateTime? reviewDate;
  final bool hasPurchased;
  final List<ReviewReply> replies;
  final bool hasAdminReply;
  final List<String> images;

  Review({
    required this.reviewId,
    required this.userId,
    required this.userName,
    this.userAvatar,
    this.serviceId,
    this.serviceName,
    this.productId,
    this.productName,
    this.appointmentId,
    this.orderId,
    required this.rating,
    required this.comment,
    this.reviewDate,
    this.hasPurchased = false,
    this.replies = const [],
    this.hasAdminReply = false,
    this.images = const [],
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      reviewId: json['reviewId'] ?? 0,
      userId: json['userId'] ?? 0,
      userName: json['userName'] ?? '',
      userAvatar: json['userAvatar'],
      serviceId: json['serviceId'],
      serviceName: json['serviceName'],
      productId: json['productId'],
      productName: json['productName'],
      appointmentId: json['appointmentId'],
      orderId: json['orderId'],
      rating: json['rating'] ?? 0,
      comment: json['comment'] ?? '',
      reviewDate: json['reviewDate'] != null 
          ? DateTime.parse(json['reviewDate']) 
          : null,
      hasPurchased: json['hasPurchased'] ?? false,
      replies: (json['replies'] as List<dynamic>?)
          ?.map((reply) => ReviewReply.fromJson(reply))
          .toList() ?? [],
      hasAdminReply: json['hasAdminReply'] ?? false,
      images: (json['images'] as List<dynamic>?)
          ?.map((image) => image.toString())
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'reviewId': reviewId,
      'userId': userId,
      'userName': userName,
      'userAvatar': userAvatar,
      'serviceId': serviceId,
      'serviceName': serviceName,
      'productId': productId,
      'productName': productName,
      'appointmentId': appointmentId,
      'orderId': orderId,
      'rating': rating,
      'comment': comment,
      'reviewDate': reviewDate?.toIso8601String(),
      'hasPurchased': hasPurchased,
      'replies': replies.map((reply) => reply.toJson()).toList(),
      'hasAdminReply': hasAdminReply,
      'images': images,
    };
  }
}

class ReviewReply {
  final int replyId;
  final int reviewId;
  final String content;
  final DateTime? replyDate;
  final bool isAdminReply;

  ReviewReply({
    required this.replyId,
    required this.reviewId,
    required this.content,
    this.replyDate,
    this.isAdminReply = false,
  });

  factory ReviewReply.fromJson(Map<String, dynamic> json) {
    return ReviewReply(
      replyId: json['replyId'] ?? 0,
      reviewId: json['reviewId'] ?? 0,
      content: json['content'] ?? '',
      replyDate: json['replyDate'] != null 
          ? DateTime.parse(json['replyDate']) 
          : null,
      isAdminReply: json['isAdminReply'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'replyId': replyId,
      'reviewId': reviewId,
      'content': content,
      'replyDate': replyDate?.toIso8601String(),
      'isAdminReply': isAdminReply,
    };
  }
}

class CreateReviewRequest {
  final int? serviceId;
  final int? productId;
  final int? appointmentId;
  final int? orderId;
  final int rating;
  final String comment;
  final List<String> images;

  CreateReviewRequest({
    this.serviceId,
    this.productId,
    this.appointmentId,
    this.orderId,
    required this.rating,
    required this.comment,
    this.images = const [],
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'rating': rating,
      'comment': comment,
      'images': images,
    };
    
    // Only add non-null values
    if (serviceId != null) data['serviceId'] = serviceId;
    if (productId != null) data['productId'] = productId;
    if (appointmentId != null) data['appointmentId'] = appointmentId;
    if (orderId != null) data['orderId'] = orderId;
    
    return data;
  }
}

class UpdateReviewRequest {
  final int rating;
  final String comment;
  final List<String> images;

  UpdateReviewRequest({
    required this.rating,
    required this.comment,
    this.images = const [],
  });

  Map<String, dynamic> toJson() {
    return {
      'rating': rating,
      'comment': comment,
      'images': images,
    };
  }
}
