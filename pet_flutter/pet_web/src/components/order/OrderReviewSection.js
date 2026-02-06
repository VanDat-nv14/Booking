import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Rate,
  message,
  Modal,
  Tag,
  Avatar,
  Divider,
  Alert
} from 'antd';
import {
  StarOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import ReviewForm from '../review/ReviewForm';
import { getOrderStatusInfo } from '../../utils/orderStatusUtils';
import styled from 'styled-components';
import moment from 'moment';

const { Title, Text } = Typography;

const OrderReviewCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: none;
  margin-bottom: 24px;

  .ant-card-body {
    padding: 24px;
  }
`;

const ProductItem = styled.div`
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled(Text)`
  font-weight: 600;
  font-size: 16px;
  color: #262626;
  display: block;
  margin-bottom: 4px;
`;

const ProductPrice = styled(Text)`
  color: #ff4d4f;
  font-weight: 600;
  font-size: 14px;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-weight: 500;
  height: 36px;

  &.primary {
    background: #1890ff;
    border-color: #1890ff;

    &:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }
  }

  &.secondary {
    color: #1890ff;
    border-color: #1890ff;

    &:hover {
      background: rgba(24, 144, 255, 0.1);
    }
  }
`;

const ExistingReview = styled.div`
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
`;

const ReviewText = styled(Text)`
  font-size: 14px;
  color: #262626;
  line-height: 1.5;
`;

const ReviewDate = styled(Text)`
  font-size: 12px;
  color: #8c8c8c;
`;

const OrderReviewSection = ({ order, onReviewUpdate }) => {
  const [productReviews, setProductReviews] = useState({});
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    if (order && isLoggedIn && currentUser) {
      fetchProductReviews();
    }
  }, [order, isLoggedIn, currentUser]);

  const fetchProductReviews = async () => {
    try {
      setLoading(true);
      const reviews = {};

      // Fetch reviews for each product in the order
      for (const item of order.orderItems) {
        try {
          const userReview = await reviewService.getUserProductReview(
            item.productId,
            currentUser.userId
          );
          if (userReview) {
            reviews[item.productId] = userReview;
          }
        } catch (error) {
          console.error(`Error fetching review for product ${item.productId}:`, error);
        }
      }

      setProductReviews(reviews);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = (product) => {
    setSelectedProduct(product);
    setEditingReview(null);
    setReviewModalVisible(true);
  };



  const handleReviewSubmitSuccess = () => {
    setReviewModalVisible(false);
    setSelectedProduct(null);
    setEditingReview(null);
    fetchProductReviews(); // Refresh reviews
    
    if (onReviewUpdate) {
      onReviewUpdate();
    }
  };

  const canReviewOrder = () => {
    if (!order) return false;
    
    const statusInfo = getOrderStatusInfo(order.status);
    // Cho phép review khi đơn hàng đã giao hàng hoặc hoàn thành
    return statusInfo.step >= 4; // DaGiaoHang (step 4) hoặc HoanThanh (step 5)
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  if (!canReviewOrder()) {
    return (
      <Alert
        message="Chưa thể đánh giá"
        description="Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng được giao thành công."
        type="info"
        showIcon
        style={{ borderRadius: 12, marginBottom: 24 }}
      />
    );
  }

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  return (
    <>
      <OrderReviewCard
        title={
          <Space>
            <StarOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Đánh giá sản phẩm
            </Title>
          </Space>
        }
      >
        {order.orderItems.map((item) => {
          const existingReview = productReviews[item.productId];
          const hasReviewed = !!existingReview;

          return (
            <ProductItem key={item.productId}>
              <ProductInfo>
                <ProductImage
                  src={item.product?.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}
                  alt={item.product?.name}
                />
                <ProductDetails>
                  <ProductName>{item.product?.name || 'Sản phẩm không tên'}</ProductName>
                  <Space size="small">
                    <Text type="secondary">Số lượng: {item.quantity}</Text>
                    <Divider type="vertical" />
                    <ProductPrice>{formatPrice(item.price)}</ProductPrice>
                  </Space>
                </ProductDetails>
              </ProductInfo>

              {hasReviewed ? (
                <ExistingReview>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Đã đánh giá
                      </Tag>
                      <Rate disabled value={existingReview.rating} style={{ fontSize: 14 }} />
                      <ReviewDate>
                        {formatDate(existingReview.reviewDate)}
                      </ReviewDate>
                    </Space>
                    
                    {existingReview.comment && (
                      <ReviewText>
                        "{existingReview.comment}"
                      </ReviewText>
                    )}
                  </Space>
                </ExistingReview>
              ) : (
                <ReviewActions>
                  <ActionButton
                    type="primary"
                    icon={<StarOutlined />}
                    className="primary"
                    onClick={() => handleWriteReview(item.product)}
                  >
                    Viết đánh giá
                  </ActionButton>
                </ReviewActions>
              )}
            </ProductItem>
          );
        })}
      </OrderReviewCard>

      {/* Review Modal */}
      <Modal
        title="Viết đánh giá sản phẩm"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setSelectedProduct(null);
          setEditingReview(null);
        }}
        footer={null}
        width={600}
        centered
        destroyOnClose
      >
        {selectedProduct && (
          <>
            <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Space>
                <Avatar
                  size={48}
                  src={selectedProduct.imageUrl}
                  style={{ border: '1px solid #d9d9d9' }}
                />
                <div>
                  <Text strong style={{ fontSize: 16 }}>
                    {selectedProduct.name}
                  </Text>
                  <br />
                  <Text type="secondary">
                    Đơn hàng #{order.orderId} - {getOrderStatusInfo(order.status).text}
                  </Text>
                </div>
              </Space>
            </div>

            <ReviewForm
              productId={selectedProduct.productId}
              orderId={order.orderId}
              onSubmitSuccess={handleReviewSubmitSuccess}
              onCancel={() => {
                setReviewModalVisible(false);
                setSelectedProduct(null);
                setEditingReview(null);
              }}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default OrderReviewSection; 