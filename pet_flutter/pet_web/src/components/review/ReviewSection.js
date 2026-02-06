import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Rate,
  Typography,
  Statistic,
  Progress,
  Space,
  Button,
  Divider,
  message,
  Spin,
  Alert
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  UserOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import styled from 'styled-components';

const { Title, Text } = Typography;

const ReviewSectionContainer = styled.div`
  margin: 32px 0;
`;

const OverviewCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: none;
  margin-bottom: 24px;

  .ant-card-body {
    padding: 32px;
  }
`;

const RatingOverview = styled.div`
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  margin-bottom: 24px;
`;

const AverageRating = styled.div`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const RatingStars = styled(Rate)`
  font-size: 24px;
  
  .ant-rate-star {
    color: #ffd700 !important;
  }
`;

const RatingBreakdown = styled.div`
  margin-top: 24px;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
`;

const StarLabel = styled.div`
  display: flex;
  align-items: center;
  min-width: 60px;
  font-weight: 500;
`;

const ProgressBar = styled(Progress)`
  flex: 1;
  
  .ant-progress-bg {
    background: #1890ff !important;
  }
`;

const WriteReviewButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: #1890ff;
  border-color: #1890ff;
  margin-top: 16px;
  
  &:hover {
    background: #40a9ff;
    border-color: #40a9ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
`;

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [canUserReview, setCanUserReview] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  const isLoggedIn = isAuthenticated();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch reviews and stats in parallel
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getProductReviews(productId, sortBy),
        reviewService.getProductReviewStats(productId)
      ]);

      setReviews(reviewsData);
      setReviewStats(statsData);

      // Check if current user has reviewed this product
      if (isLoggedIn && currentUser) {
        const hasReviewed = await reviewService.hasUserReviewedProduct(
          productId, 
          currentUser.userId
        );
        setUserHasReviewed(hasReviewed);

        // Check if user can review (has purchased and order completed)
        const canReview = await reviewService.canUserReviewProduct(
          currentUser.userId,
          productId
        );
        setCanUserReview(canReview);

        // Get purchase status for display
        const status = await reviewService.getPublicUserProductPurchaseStatus(
          currentUser.userId,
          productId
        );
        setPurchaseStatus(status);
      } else {
        setUserHasReviewed(false);
        setCanUserReview(false);
        setPurchaseStatus(null);
      }

    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải đánh giá sản phẩm!');
    } finally {
      setLoading(false);
    }
  }, [productId, isLoggedIn, currentUser, sortBy]);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, fetchReviews]);

  const handleReviewSubmitSuccess = () => {
    setShowReviewForm(false);
    fetchReviews(); // Refresh reviews after successful submission
  };

  const handleReviewUpdate = () => {
    fetchReviews(); // Refresh reviews after update/delete
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const getRatingPercentage = (rating) => {
    if (!reviewStats?.totalReviews) return 0;
    return Math.round((reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100);
  };

  const renderRatingBreakdown = () => {
    return [5, 4, 3, 2, 1].map(rating => (
      <RatingRow key={rating}>
        <StarLabel>
          <StarFilled style={{ color: '#ffd700', marginRight: 4 }} />
          <Text>{rating}</Text>
        </StarLabel>
        <ProgressBar
          percent={getRatingPercentage(rating)}
          showInfo={false}
          strokeColor="#1890ff"
          trailColor="#f5f5f5"
        />
        <Text type="secondary" style={{ minWidth: 40, textAlign: 'right' }}>
          {reviewStats?.ratingDistribution[rating] || 0}
        </Text>
      </RatingRow>
    ));
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" tip="Đang tải đánh giá..." />
      </LoadingContainer>
    );
  }

  return (
    <ReviewSectionContainer>
      {/* Review Overview */}
      <OverviewCard>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={10}>
            <RatingOverview>
              <AverageRating>
                {reviewStats?.averageRating?.toFixed(1) || '0.0'}
              </AverageRating>
              <RatingStars
                disabled
                value={reviewStats?.averageRating || 0}
                allowHalf
              />
              <div style={{ marginTop: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                  Dựa trên {reviewStats?.totalReviews || 0} đánh giá
                </Text>
              </div>
            </RatingOverview>
            


            {/* Write Review Button */}
            {!userHasReviewed && !showReviewForm && isLoggedIn && canUserReview && (
              <WriteReviewButton
                type="primary"
                icon={<StarOutlined />}
                onClick={() => setShowReviewForm(true)}
              >
                Viết đánh giá
              </WriteReviewButton>
            )}

            {!userHasReviewed && !showReviewForm && isLoggedIn && !canUserReview && purchaseStatus && (
              <Alert
                message="Chưa đủ điều kiện đánh giá"
                description={
                  !purchaseStatus.hasPurchased 
                    ? "Bạn cần mua sản phẩm này để có thể đánh giá"
                    : "Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn tất"
                }
                type="info"
                showIcon
                style={{ 
                  borderRadius: 12,
                  marginTop: 16,
                  border: 'none'
                }}
              />
            )}
            
            {userHasReviewed && (
              <Alert
                message="Bạn đã đánh giá sản phẩm này"
                description="Bạn có thể chỉnh sửa hoặc xóa đánh giá của mình trong danh sách bên dưới."
                type="success"
                showIcon
                style={{ 
                  borderRadius: 12,
                  marginTop: 16,
                  border: 'none'
                }}
              />
            )}
            
            {!isLoggedIn && (
              <Alert
                message="Cần đăng nhập để đánh giá"
                description="Vui lòng đăng nhập để có thể viết đánh giá sản phẩm"
                type="warning"
                showIcon
                style={{ 
                  borderRadius: 12,
                  marginTop: 16,
                  border: 'none'
                }}
              />
            )}
          </Col>
          
          <Col xs={24} md={14}>
            <Title level={4} style={{ marginBottom: 24 }}>
              Chi tiết đánh giá
            </Title>
            
            <RatingBreakdown>
              {renderRatingBreakdown()}
            </RatingBreakdown>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Tổng đánh giá"
                  value={reviewStats?.totalReviews || 0}
                  prefix={<CommentOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Điểm trung bình"
                  value={reviewStats?.averageRating || 0}
                  precision={1}
                  prefix={<StarOutlined />}
                  suffix="/ 5"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </OverviewCard>

      {/* Review Form */}
      {showReviewForm && !userHasReviewed && (
        <ReviewForm
          productId={productId}
          onSubmitSuccess={handleReviewSubmitSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}



      {/* Reviews List */}
      <ReviewList
        productId={productId}
        reviews={reviews}
        onReviewUpdate={handleReviewUpdate}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />
    </ReviewSectionContainer>
  );
};

export default ReviewSection; 