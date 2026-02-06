import axiosClient from '../utils/axiosClient';

class AdminReviewService {
  // ===== REVIEWS MANAGEMENT =====

  // Lấy tất cả reviews (admin only)
  async getAllReviews(sortBy = 'newest') {
    try {
      const response = await axiosClient.get(`/Reviews?sortBy=${sortBy}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  }

  // Xóa review (admin only)
  async deleteReview(reviewId) {
    try {
      await axiosClient.delete(`/Reviews/${reviewId}`);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // ===== REVIEW REPLIES MANAGEMENT =====

  // Lấy tất cả replies
  async getAllReplies() {
    try {
      const response = await axiosClient.get('/ReviewReplies');
      return response.data;
    } catch (error) {
      console.error('Error fetching all replies:', error);
      throw error;
    }
  }

  // Lấy reply theo ID
  async getReplyById(replyId) {
    try {
      const response = await axiosClient.get(`/ReviewReplies/${replyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reply by ID:', error);
      throw error;
    }
  }

  // Lấy replies cho một review cụ thể
  async getRepliesByReviewId(reviewId) {
    try {
      const response = await axiosClient.get(`/ReviewReplies/Review/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching replies by review ID:', error);
      throw error;
    }
  }

  // Lấy replies của admin cụ thể
  async getRepliesByAdminId(adminUserId) {
    try {
      const response = await axiosClient.get(`/ReviewReplies/Admin/${adminUserId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching replies by admin ID:', error);
      throw error;
    }
  }

  // Tạo reply mới
  async createReply(replyData) {
    try {
      const response = await axiosClient.post('/ReviewReplies', replyData);
      return response.data;
    } catch (error) {
      console.error('Error creating reply:', error);
      throw error;
    }
  }

  // Cập nhật reply
  async updateReply(replyId, replyData) {
    try {
      const response = await axiosClient.put(`/ReviewReplies/${replyId}`, replyData);
      return response.data;
    } catch (error) {
      console.error('Error updating reply:', error);
      throw error;
    }
  }

  // Xóa reply
  async deleteReply(replyId) {
    try {
      await axiosClient.delete(`/ReviewReplies/${replyId}`);
      return true;
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  }

  // ===== STATISTICS =====

  // Thống kê reviews
  async getReviewStatistics() {
    try {
      const reviews = await this.getAllReviews();
      
      const stats = {
        totalReviews: reviews.length,
        avgRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
        reviewsWithReplies: reviews.filter(r => r.hasAdminReply).length,
        reviewsWithoutReplies: reviews.filter(r => !r.hasAdminReply).length,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        },
        recentReviews: reviews
          .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
          .slice(0, 5)
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching review statistics:', error);
      throw error;
    }
  }
}

const adminReviewService = new AdminReviewService();
export default adminReviewService; 