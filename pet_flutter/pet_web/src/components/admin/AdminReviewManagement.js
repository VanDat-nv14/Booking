import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Table,
  Rate,
  Button,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  Modal,
  Input,
  Form,
  Select,
  Row,
  Col,
  Statistic,
  Progress,
  Spin,
  Avatar,
  Tooltip,
  Alert,
  Image
} from 'antd';
import {
  StarOutlined,
  MessageOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import adminReviewService from '../../services/adminReviewService';
import moment from 'moment';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const StatCard = styled(Card)`
  text-align: center;
  border-radius: 12px;
  .ant-statistic-title {
    font-size: 14px;
    color: #666;
  }
  .ant-statistic-content {
    color: #1890ff;
  }
`;

const ReplySection = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  border-left: 4px solid #1890ff;
`;

const ReviewImagesContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const ReviewImageWrapper = styled.div`
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  
  .ant-image {
    border-radius: 6px;
  }
`;

const AdminReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [replyForm] = Form.useForm();
  const [editingReply, setEditingReply] = useState(null);

  const { user: currentUser } = useContext(AuthContext);

  // Function để lấy URL đầy đủ của hình ảnh review - giống ProductManagement
  const getReviewImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/80x80?text=No+Image';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `https://localhost:7164${imagePath}`;
    }
    
    return `https://localhost:7164/uploads/reviews/${imagePath}`;
  };

  useEffect(() => {
    fetchData();
  }, [sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        adminReviewService.getAllReviews(sortBy),
        adminReviewService.getReviewStatistics()
      ]);
      
      console.log('🔍 Reviews data from API:', reviewsData);
      console.log('🔍 Sample review images:', reviewsData[0]?.images);
      
      setReviews(reviewsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải danh sách đánh giá!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await adminReviewService.deleteReview(reviewId);
      message.success('Xóa đánh giá thành công!');
      fetchData();
    } catch (error) {
      console.error('Error deleting review:', error);
      message.error('Không thể xóa đánh giá!');
    }
  };

  const handleReplyToReview = (review) => {
    setSelectedReview(review);
    setEditingReply(null);
    replyForm.resetFields();
    setIsReplyModalVisible(true);
  };

  const handleEditReply = (review, reply) => {
    setSelectedReview(review);
    setEditingReply(reply);
    replyForm.setFieldsValue({
      replyContent: reply.replyContent
    });
    setIsReplyModalVisible(true);
  };

  const handleSubmitReply = async (values) => {
    try {
      const replyData = {
        reviewId: selectedReview.reviewId,
        replyContent: values.replyContent
      };

      if (editingReply) {
        await adminReviewService.updateReply(editingReply.replyId, {
          replyContent: values.replyContent
        });
        message.success('Cập nhật trả lời thành công!');
      } else {
        await adminReviewService.createReply(replyData);
        message.success('Trả lời đánh giá thành công!');
      }

      setIsReplyModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting reply:', error);
      message.error('Không thể gửi trả lời!');
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await adminReviewService.deleteReply(replyId);
      message.success('Xóa trả lời thành công!');
      fetchData();
    } catch (error) {
      console.error('Error deleting reply:', error);
      message.error('Không thể xóa trả lời!');
    }
  };

  const showReviewDetail = (review) => {
    setSelectedReview(review);
    setIsDetailModalVisible(true);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#52c41a';
    if (rating >= 3) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      render: (text, record) => (
        <Space>
          <Avatar 
            src={record.userAvatar} 
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text || 'Ẩn danh'}</div>
            {record.hasPurchased && (
              <Tag color="green" size="small">Đã mua hàng</Tag>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Sản phẩm/Dịch vụ',
      key: 'target',
      width: 200,
      render: (record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            <ShopOutlined style={{ marginRight: 4 }} />
            {record.productName || record.serviceName || 'N/A'}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.productId ? 'Sản phẩm' : 'Dịch vụ'}
          </Text>
        </div>
      )
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 120,
      render: (record) => (
        <div>
          <Rate disabled value={record.rating} style={{ fontSize: 14 }} />
          <div style={{ color: getRatingColor(record.rating), fontWeight: 500 }}>
            {record.rating}/5
          </div>
        </div>
      )
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, maxWidth: 200 }}>
            {text || 'Không có nội dung'}
          </Paragraph>
        </Tooltip>
      )
    },
    {
      title: 'Ảnh',
      key: 'images',
      width: 100,
      render: (record) => {
        console.log('🖼️ Review record images:', record.images);
        console.log('🖼️ Full record:', record);
        
        return record.images && record.images.length > 0 ? (
          <div style={{ display: 'flex', gap: 4 }}>
            {record.images.slice(0, 2).map((imagePath, index) => {
              const imageUrl = getReviewImageUrl(imagePath);
              console.log('🖼️ Image path:', imagePath);
              console.log('🖼️ Final URL:', imageUrl);
              
              return (
                <ReviewImageWrapper key={index}>
                  <Image
                    width={40}
                    height={40}
                    src={imageUrl}
                    style={{ 
                      objectFit: 'cover',
                      borderRadius: 6
                    }}
                    preview={{
                      src: imageUrl
                    }}
                    fallback="https://via.placeholder.com/40x40?text=No+Image"
                  />
                </ReviewImageWrapper>
              );
            })}
            {record.images.length > 2 && (
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 6, 
                background: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 12,
                color: '#666'
              }}>
                +{record.images.length - 2}
              </div>
            )}
          </div>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>Không có ảnh</Text>
        );
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      width: 120,
      render: (date) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          <div>{moment(date).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {moment(date).format('HH:mm')}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (record) => (
        <div>
          {record.hasAdminReply ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Đã trả lời
            </Tag>
          ) : (
            <Tag color="orange" icon={<ExclamationCircleOutlined />}>
              Chưa trả lời
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => showReviewDetail(record)}
            />
          </Tooltip>
          
          {!record.hasAdminReply ? (
            <Tooltip title="Trả lời">
              <Button 
                type="text" 
                icon={<MessageOutlined />} 
                onClick={() => handleReplyToReview(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Sửa trả lời">
              <Button 
                type="text" 
                icon={<MessageOutlined />} 
                onClick={() => handleEditReply(record, record.replies[0])}
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title="Xóa đánh giá"
            description="Bạn có chắc chắn muốn xóa đánh giá này?"
            onConfirm={() => handleDeleteReview(record.reviewId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <StarOutlined style={{ marginRight: 8 }} />
        Quản lý Đánh giá
      </Title>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <StatCard>
              <Statistic 
                title="Tổng đánh giá" 
                value={statistics.totalReviews}
                prefix={<StarOutlined />}
              />
            </StatCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard>
              <Statistic 
                title="Điểm trung bình" 
                value={statistics.avgRating} 
                precision={1}
                suffix="/ 5"
                valueStyle={{ color: getRatingColor(statistics.avgRating) }}
              />
            </StatCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard>
              <Statistic 
                title="Đã trả lời" 
                value={statistics.reviewsWithReplies}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </StatCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard>
              <Statistic 
                title="Chưa trả lời" 
                value={statistics.reviewsWithoutReplies}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </StatCard>
          </Col>
        </Row>
      )}

      {/* Filters and Actions */}
      <StyledCard>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <FilterOutlined />
              <Text>Sắp xếp theo:</Text>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 150 }}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="oldest">Cũ nhất</Option>
                <Option value="highest">Điểm cao nhất</Option>
                <Option value="lowest">Điểm thấp nhất</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={fetchData}
            >
              Làm mới
            </Button>
          </Col>
        </Row>

        {/* Reviews Table */}
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="reviewId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đánh giá`
          }}
          scroll={{ x: 1300 }}
        />
      </StyledCard>

      {/* Reply Modal */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            {editingReply ? 'Sửa trả lời' : 'Trả lời đánh giá'}
          </Space>
        }
        open={isReplyModalVisible}
        onCancel={() => setIsReplyModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedReview && (
          <div>
            <Alert
              message="Thông tin đánh giá"
              description={
                <div style={{ marginTop: 8 }}>
                  <div><strong>Khách hàng:</strong> {selectedReview.userName}</div>
                  <div><strong>Đánh giá:</strong> <Rate disabled value={selectedReview.rating} size="small" /></div>
                  <div><strong>Nội dung:</strong> {selectedReview.comment || 'Không có nội dung'}</div>
                  
                  {/* Hiển thị ảnh trong reply modal */}
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <strong>Ảnh đính kèm:</strong>
                      <ReviewImagesContainer>
                        {selectedReview.images.map((imagePath, index) => {
                          const imageUrl = getReviewImageUrl(imagePath);
                          
                          return (
                            <ReviewImageWrapper key={index}>
                              <Image
                                width={60}
                                height={60}
                                src={imageUrl}
                                style={{ 
                                  objectFit: 'cover',
                                  borderRadius: 6
                                }}
                                preview={{
                                  src: imageUrl
                                }}
                                fallback="https://via.placeholder.com/60x60?text=No+Image"
                              />
                            </ReviewImageWrapper>
                          );
                        })}
                      </ReviewImagesContainer>
                    </div>
                  )}
                </div>
              }
              type="info"
              style={{ marginBottom: 24 }}
            />
            
            <Form
              form={replyForm}
              layout="vertical"
              onFinish={handleSubmitReply}
            >
              <Form.Item
                name="replyContent"
                label="Nội dung trả lời"
                rules={[
                  { required: true, message: 'Vui lòng nhập nội dung trả lời!' },
                  { max: 1000, message: 'Nội dung không được vượt quá 1000 ký tự!' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập nội dung trả lời cho khách hàng..."
                  maxLength={1000}
                  showCount
                />
              </Form.Item>
              
              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => setIsReplyModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingReply ? 'Cập nhật' : 'Gửi trả lời'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Chi tiết đánh giá
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedReview && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Thông tin khách hàng">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Avatar src={selectedReview.userAvatar} icon={<UserOutlined />} />
                      <span style={{ marginLeft: 8 }}>{selectedReview.userName || 'Ẩn danh'}</span>
                    </div>
                    {selectedReview.hasPurchased && (
                      <Tag color="green">Đã mua hàng</Tag>
                    )}
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Thông tin đánh giá">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <strong>Đối tượng:</strong> {selectedReview.productName || selectedReview.serviceName}
                    </div>
                    <div>
                      <strong>Điểm đánh giá:</strong> 
                      <Rate disabled value={selectedReview.rating} style={{ marginLeft: 8 }} />
                    </div>
                    <div>
                      <strong>Thời gian:</strong> {moment(selectedReview.reviewDate).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card size="small" title="Nội dung đánh giá" style={{ marginTop: 16 }}>
              <Paragraph>{selectedReview.comment || 'Không có nội dung'}</Paragraph>
              
              {/* Hiển thị ảnh đánh giá */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <strong style={{ marginBottom: 8, display: 'block' }}>Ảnh đính kèm:</strong>
                  <ReviewImagesContainer>
                    {selectedReview.images.map((imagePath, index) => {
                      const imageUrl = getReviewImageUrl(imagePath);
                      
                      return (
                        <ReviewImageWrapper key={index}>
                          <Image
                            width={80}
                            height={80}
                            src={imageUrl}
                            style={{ 
                              objectFit: 'cover',
                              borderRadius: 6
                            }}
                            preview={{
                              src: imageUrl
                            }}
                            fallback="https://via.placeholder.com/80x80?text=No+Image"
                          />
                        </ReviewImageWrapper>
                      );
                    })}
                  </ReviewImagesContainer>
                </div>
              )}
            </Card>

            {selectedReview.replies && selectedReview.replies.length > 0 && (
              <Card size="small" title="Trả lời từ admin" style={{ marginTop: 16 }}>
                {selectedReview.replies.map(reply => (
                  <ReplySection key={reply.replyId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>
                          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                          {reply.adminUserName}
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            {moment(reply.replyDate).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        </div>
                        <Paragraph style={{ margin: 0 }}>{reply.replyContent}</Paragraph>
                      </div>
                      <Space>
                        <Button
                          type="text"
                          size="small"
                          icon={<MessageOutlined />}
                          onClick={() => handleEditReply(selectedReview, reply)}
                        >
                          Sửa
                        </Button>
                        <Popconfirm
                          title="Xóa trả lời này?"
                          onConfirm={() => handleDeleteReply(reply.replyId)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                            Xóa
                          </Button>
                        </Popconfirm>
                      </Space>
                    </div>
                  </ReplySection>
                ))}
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminReviewManagement; 
