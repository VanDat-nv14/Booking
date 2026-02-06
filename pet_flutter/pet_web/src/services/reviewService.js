import axiosClient from '../utils/axiosClient';

class ReviewService {
  // Lấy tất cả reviews
  async getAllReviews() {
    try {
      const response = await axiosClient.get('/Reviews');
      return response.data;
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  }

  // Lấy review theo ID
  async getReviewById(reviewId) {
    try {
      const response = await axiosClient.get(`/Reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review by ID:', error);
      throw error;
    }
  }

  // Lấy reviews của sản phẩm
  async getProductReviews(productId, sortBy = 'newest') {
    try {
      const response = await axiosClient.get(`/Reviews/Product/${productId}?sortBy=${sortBy}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  }

  // Lấy reviews của sản phẩm với filter (alias cho getProductReviews)
  async getProductReviewsWithFilter(productId, sortBy = 'newest') {
    return this.getProductReviews(productId, sortBy);
  }

  // Lấy điểm đánh giá trung bình của sản phẩm
  async getProductRating(productId) {
    try {
      const response = await axiosClient.get(`/Reviews/Product/${productId}/Rating`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product rating:', error);
      throw error;
    }
  }

  // Lấy reviews của user
  async getUserReviews(userId) {
    try {
      const response = await axiosClient.get(`/Reviews/User/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  // Lấy reviews của đơn hàng
  async getOrderReviews(orderId) {
    try {
      const response = await axiosClient.get(`/Reviews/Order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order reviews:', error);
      throw error;
    }
  }

  // Tạo review mới
  async createReview(reviewData) {
    try {
      const response = await axiosClient.post('/Reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Cập nhật review
  async updateReview(reviewId, reviewData) {
    try {
      const response = await axiosClient.put(`/Reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Xóa review
  async deleteReview(reviewId) {
    try {
      await axiosClient.delete(`/Reviews/${reviewId}`);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Kiểm tra user đã đánh giá sản phẩm chưa
  async hasUserReviewedProduct(productId, userId) {
    try {
      const reviews = await this.getProductReviews(productId);
      return reviews.some(review => review.userId === userId);
    } catch (error) {
      console.error('Error checking user review status:', error);
      return false;
    }
  }

  // Kiểm tra user đã đánh giá đơn hàng chưa
  async hasUserReviewedOrder(orderId, userId) {
    try {
      const reviews = await this.getOrderReviews(orderId);
      return reviews.some(review => review.userId === userId);
    } catch (error) {
      console.error('Error checking user order review status:', error);
      return false;
    }
  }

  // Lấy review của user cho sản phẩm cụ thể
  async getUserProductReview(productId, userId) {
    try {
      const reviews = await this.getProductReviews(productId);
      return reviews.find(review => review.userId === userId) || null;
    } catch (error) {
      console.error('Error fetching user product review:', error);
      return null;
    }
  }

  // Lấy thống kê đánh giá của sản phẩm
  async getProductReviewStats(productId) {
    try {
      const reviews = await this.getProductReviews(productId);
      const rating = await this.getProductRating(productId);
      
      const stats = {
        totalReviews: reviews.length,
        averageRating: rating.averageRating || 0,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        }
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching product review stats:', error);
      throw error;
    }
  }

  // Lấy trạng thái mua hàng của user cho sản phẩm cụ thể (private - yêu cầu authorization)
  async getUserProductPurchaseStatus(userId, productId) {
    try {
      const response = await axiosClient.get(`/Reviews/User/${userId}/Product/${productId}/PurchaseStatus`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user product purchase status:', error);
      throw error;
    }
  }

  // Lấy trạng thái mua hàng public (không yêu cầu authorization)
  async getPublicUserProductPurchaseStatus(userId, productId) {
    try {
      const response = await axiosClient.get(`/Reviews/Public/User/${userId}/Product/${productId}/PurchaseStatus`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public user product purchase status:', error);
      throw error;
    }
  }

  // Kiểm tra user có thể đánh giá sản phẩm không (đã mua và đơn hàng hoàn tất)
  async canUserReviewProduct(userId, productId) {
    try {
      const status = await this.getPublicUserProductPurchaseStatus(userId, productId);
      return status.hasPurchased && (status.orderStatusDisplay === 'Hoàn thành' || status.orderStatusDisplay === 'Completed');
    } catch (error) {
      console.error('Error checking if user can review product:', error);
      return false;
    }
  }
}

const reviewService = new ReviewService();
export default reviewService; 