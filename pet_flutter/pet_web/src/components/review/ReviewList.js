import React, { useState, useContext, useEffect } from 'react';
import {
  List,
  Card,
  Rate,
  Typography,
  Space,
  Avatar,
  Button,
  Popconfirm,
  message,
  Tag,
  Empty,
  Modal,
  Divider,
  Select,
  Row,
  Col,
  Image
} from 'antd';
import {
  StarOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  FilterOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import ReviewForm from './ReviewForm';

import styled from 'styled-components';
import moment from 'moment';

const { Text, Paragraph, Title } = Typography;
const { Option } = Select;

const ReviewListContainer = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: none;
  margin-bottom: 24px;

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
  }

  .ant-card-body {
    padding: 24px;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const ReviewItem = styled(List.Item)`
  padding: 20px 0 !important;
  border-bottom: 1px solid #f5f5f5 !important;

  &:last-child {
    border-bottom: none !important;
  }

  .ant-list-item-meta {
    align-items: flex-start;
  }

  .ant-list-item-meta-content {
    flex: 1;
  }

  .ant-list-item-action {
    margin-left: 16px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const UserName = styled(Text)`
  font-weight: 600;
  font-size: 16px;
  color: #1890ff;
`;

const ReviewDate = styled(Text)`
  font-size: 12px;
  color: #8c8c8c;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const ReviewComment = styled(Paragraph)`
  margin-bottom: 0 !important;
  font-size: 14px;
  line-height: 1.6;
  color: #262626;
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-weight: 500;

  &.edit-btn {
    color: #1890ff;
    border-color: #1890ff;

    &:hover {
      background-color: rgba(24, 144, 255, 0.1);
    }
  }

  &.delete-btn {
    color: #ff4d4f;
    border-color: #ff4d4f;

    &:hover {
      background-color: rgba(255, 77, 79, 0.1);
    }
  }
`;

const EmptyReviews = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #8c8c8c;
`;

const PurchasedTag = styled(Tag)`
  border-radius: 8px;
  font-weight: 500;
  font-size: 12px;
`;

const ReviewImagesContainer = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ReviewImageWrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  
  .ant-image {
    border-radius: 8px;
  }
`;

const ReviewList = ({ productId, reviews = [], onReviewUpdate, sortBy, onSortChange }) => {
  const [editingReview, setEditingReview] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  const isLoggedIn = isAuthenticated();

  const handleEditReview = (review) => {
    setEditingReview(review);
    setIsEditModalVisible(true);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      message.success('Xóa đánh giá thành công!');
      
      // Callback to parent to refresh reviews
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      message.error('Không thể xóa đánh giá!');
    }
  };

  const handleEditSubmitSuccess = (updatedReview) => {
    setIsEditModalVisible(false);
    setEditingReview(null);
    message.success('Cập nhật đánh giá thành công!');
    
    // Callback to parent to refresh reviews
    if (onReviewUpdate) {
      onReviewUpdate();
    }
  };

  // No need to load purchase status anymore

  const canModifyReview = (review) => {
    if (!isLoggedIn || !currentUser) return false;
    
    // Chỉ admin mới có thể sửa/xóa đánh giá
    return currentUser.role === 'Admin' || currentUser.role === 'admin';
  };

  const formatReviewDate = (dateString) => {
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  const renderReviewActions = (review) => {
    if (!canModifyReview(review)) {
      return [];
    }

    return [
      <ActionButton
        key="edit"
        type="text"
        size="small"
        icon={<EditOutlined />}
        className="edit-btn"
        onClick={() => handleEditReview(review)}
      >
        Sửa
      </ActionButton>,
      <Popconfirm
        key="delete"
        title="Xóa đánh giá"
        description="Bạn có chắc chắn muốn xóa đánh giá này?"
        onConfirm={() => handleDeleteReview(review.reviewId)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <ActionButton
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          className="delete-btn"
        >
          Xóa
        </ActionButton>
      </Popconfirm>
    ];
  };

  if (!reviews || reviews.length === 0) {
    return (
      <ReviewListContainer
        title={
          <Space>
            <StarOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Đánh giá sản phẩm
            </Title>
          </Space>
        }
      >
        <EmptyReviews>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Chưa có đánh giá nào
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Hãy là người đầu tiên đánh giá sản phẩm này!
                </Text>
              </div>
            }
          />
        </EmptyReviews>
      </ReviewListContainer>
    );
  }

  return (
    <>
      <ReviewListContainer
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <StarOutlined />
                <Title level={4} style={{ margin: 0 }}>
                  Đánh giá sản phẩm ({reviews.length})
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                <FilterOutlined />
                <Text type="secondary">Sắp xếp theo:</Text>
                <Select
                  value={sortBy}
                  onChange={onSortChange}
                  style={{ width: 150 }}
                  size="small"
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="oldest">Cũ nhất</Option>
                  <Option value="highest">Điểm cao nhất</Option>
                  <Option value="lowest">Điểm thấp nhất</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        }
      >
        <List
          dataSource={reviews}
          renderItem={(review) => (
            <ReviewItem actions={renderReviewActions(review)}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={48}
                    icon={<UserOutlined />}
                    src={review.userAvatar}
                    style={{
                      backgroundColor: '#1890ff',
                      fontSize: 20
                    }}
                  />
                }
                description={
                  <div>
                    <UserInfo>
                      <UserName>
                        {review.userName || 'Người dùng ẩn danh'}
                      </UserName>
                      <Space size="small" style={{ flexWrap: 'wrap' }}>
                        <Tag color="blue" icon={<CalendarOutlined />}>
                          <ReviewDate>
                            {formatReviewDate(review.reviewDate)}
                          </ReviewDate>
                        </Tag>
                        {review.hasPurchased && (
                          <PurchasedTag color="green" icon={<CheckCircleOutlined />}>
                            Đã mua hàng
                          </PurchasedTag>
                        )}
                      </Space>
                    </UserInfo>

                    <RatingSection>
                      <Rate 
                        disabled 
                        value={review.rating} 
                        style={{ fontSize: 16 }}
                      />
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        ({review.rating}/5)
                      </Text>
                    </RatingSection>

                    {review.comment && (
                      <ReviewComment>
                        {review.comment}
                      </ReviewComment>
                    )}

                    {/* Review Images */}
                    {console.log('Review images data:', review.images)}
                    {review.images && review.images.length > 0 && (
                      <ReviewImagesContainer>
                        {review.images.map((imagePath, index) => {
                          console.log('Processing image path:', imagePath);
                          const imageUrl = imagePath.startsWith('http') 
                            ? imagePath 
                            : `https://localhost:7164${imagePath}`;
                          
                          console.log('Final image URL:', imageUrl);
                          return (
                            <ReviewImageWrapper key={index}>
                              <Image
                                width={80}
                                height={80}
                                src={imageUrl}
                                style={{ 
                                  objectFit: 'cover',
                                  borderRadius: 8
                                }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+RDOsKPgAy+QDEE6UhMgiK5EF8C1oW2KBJBBQ= "
                                preview={{
                                  src: imageUrl
                                }}
                              />
                            </ReviewImageWrapper>
                          );
                        })}
                      </ReviewImagesContainer>
                    )}

                    {/* Admin Replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        {review.replies.map(reply => (
                          <div
                            key={reply.replyId}
                            style={{
                              background: '#f0f8ff',
                              padding: '12px 16px',
                              borderRadius: 8,
                              marginTop: 8,
                              borderLeft: '3px solid #1890ff'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                              <Avatar
                                size={24}
                                src={reply.adminUserAvatar}
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#1890ff', marginRight: 8 }}
                              />
                              <Text strong style={{ color: '#1890ff' }}>
                                {reply.adminUserName || 'Admin'}
                              </Text>
                              <Tag color="blue" size="small" style={{ marginLeft: 8 }}>
                                Quản trị viên
                              </Tag>
                              <Text type="secondary" style={{ marginLeft: 'auto', fontSize: 12 }}>
                                {moment(reply.replyDate).format('DD/MM/YYYY HH:mm')}
                              </Text>
                            </div>
                            <Text>{reply.replyContent}</Text>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
            </ReviewItem>
          )}
        />
      </ReviewListContainer>

      {/* Edit Review Modal */}
      <Modal
        title="Chỉnh sửa đánh giá"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingReview(null);
        }}
        footer={null}
        width={600}
        centered
        destroyOnClose
      >
        {editingReview && (
          <ReviewForm
            productId={productId}
            existingReview={editingReview}
            onSubmitSuccess={handleEditSubmitSuccess}
            onCancel={() => {
              setIsEditModalVisible(false);
              setEditingReview(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default ReviewList; 