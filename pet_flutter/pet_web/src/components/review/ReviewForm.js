import React, { useState, useContext, useEffect } from 'react';
import { 
  Form, 
  Rate, 
  Input, 
  Button, 
  Card, 
  Space, 
  Typography, 
  message,
  Alert,
  Spin,
  Upload,
  Image
} from 'antd';
import { 
  StarOutlined, 
  EditOutlined, 
  SendOutlined,
  UserOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ReviewFormContainer = styled(Card)`
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

const StyledRate = styled(Rate)`
  font-size: 24px;
  
  .ant-rate-star {
    margin-right: 8px;
  }
  
  .ant-rate-star-focused,
  .ant-rate-star:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }
`;

const SubmitButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  
  &.ant-btn-primary {
    background: #1890ff;
    border-color: #1890ff;
    
    &:hover {
      background: #40a9ff;
      border-color: #40a9ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
    }
  }
`;

const RatingDescription = styled.div`
  margin-top: 8px;
  color: #8c8c8c;
  font-size: 14px;
`;

const ImageUploadContainer = styled.div`
  .ant-upload-select-picture-card {
    width: 104px;
    height: 104px;
    border-radius: 8px;
  }
  
  .ant-upload-list-picture-card .ant-upload-list-item {
    border-radius: 8px;
  }
`;

const ReviewForm = ({ 
  productId, 
  orderId, 
  existingReview = null, 
  onSubmitSuccess, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [images, setImages] = useState(existingReview?.images || []);
  const [imageFileList, setImageFileList] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { user: currentUser } = useContext(AuthContext);

  const isEditing = !!existingReview;

  useEffect(() => {
    if (existingReview) {
      form.setFieldsValue({
        rating: existingReview.rating,
        comment: existingReview.comment
      });
      setRating(existingReview.rating);
      
      // Khởi tạo imageFileList từ existing images
      if (existingReview.images && existingReview.images.length > 0) {
        const fileList = existingReview.images.map((imagePath, index) => ({
          uid: `existing-${index}`,
          name: `image-${index + 1}`,
          status: 'done',
          url: imagePath.startsWith('http') ? imagePath : `https://localhost:7164${imagePath}`
        }));
        setImageFileList(fileList);
      }
    }
  }, [existingReview, form]);

  const getRatingDescription = (value) => {
    switch (value) {
      case 1: return 'Rất không hài lòng';
      case 2: return 'Không hài lòng';
      case 3: return 'Bình thường';
      case 4: return 'Hài lòng';
      case 5: return 'Rất hài lòng';
      default: return 'Vui lòng chọn đánh giá';
    }
  };

  // Xử lý thay đổi trong upload component
  const handleImageChange = ({ fileList: newFileList }) => {
    console.log('handleImageChange called with fileList:', newFileList);
    setImageFileList(newFileList);
    
    // Cập nhật danh sách images từ các file đã upload thành công
    const uploadedImages = newFileList
      .filter(file => file.status === 'done' && file.response?.images)
      .flatMap(file => {
        console.log('Processing successful upload, response:', file.response);
        return file.response.images;
      });
    
    const existingImages = newFileList
      .filter(file => file.status === 'done' && file.url && !file.response)
      .map(file => {
        console.log('Processing existing image:', file.url);
        // Chuyển đổi URL thành relative path
        const url = file.url;
        if (url.includes('/uploads/reviews/')) {
          return url.substring(url.indexOf('/uploads/reviews/'));
        }
        return url;
      });
    
    const allImages = [...existingImages, ...uploadedImages];
    console.log('All images collected:', allImages);
    setImages(allImages);
  };

  // Xử lý xóa ảnh
  const handleImageRemove = (file) => {
    const updatedImages = images.filter(img => {
      const fileUrl = file.url || file.response?.images?.[0];
      return !img.includes(file.name) && img !== fileUrl;
    });
    setImages(updatedImages);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file ảnh!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    
    return true;
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      console.log('Custom request called with file:', file.name);
      
      const formData = new FormData();
      formData.append('files', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7164/api/Reviews/upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const result = await response.json();
      console.log('Upload response:', result);
      
      if (result.images && result.images.length > 0) {
        // Không cập nhật state ở đây, để handleImageChange xử lý
        message.success('Tải ảnh lên thành công!');
        onSuccess(result, file);
      } else {
        throw new Error('No images returned from server');
      }
    } catch (error) {
      console.error('Error in customRequest:', error);
      message.error('Lỗi khi tải ảnh lên: ' + error.message);
      onError(error);
    }
  };

  const handleSubmit = async (values) => {
    if (!currentUser) {
      message.error('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    // Kiểm tra điều kiện mua hàng nếu là đánh giá sản phẩm mới (không phải edit)
    if (!isEditing && productId) {
      try {
        const canReview = await reviewService.canUserReviewProduct(
          currentUser.userId,
          productId
        );
        
        if (!canReview) {
          const status = await reviewService.getPublicUserProductPurchaseStatus(
            currentUser.userId,
            productId
          );
          
          if (!status.hasPurchased) {
            message.error('Bạn cần mua sản phẩm này để có thể đánh giá');
            return;
          } else {
            message.error('Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn tất');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking review conditions:', error);
        message.error('Không thể kiểm tra điều kiện đánh giá');
        return;
      }
    }

    setLoading(true);
    
    try {
      console.log('Images being sent:', images); // Debug log
      
      const reviewData = {
        rating: values.rating,
        comment: values.comment || '',
        images: images, // Thêm images vào data
        ...(productId && { productId: parseInt(productId) }),
        ...(orderId && { orderId: parseInt(orderId) })
      };

      console.log('Review data being sent:', reviewData); // Debug log

      let result;
      if (isEditing) {
        result = await reviewService.updateReview(existingReview.reviewId, reviewData);
        message.success('Cập nhật đánh giá thành công!');
      } else {
        result = await reviewService.createReview(reviewData);
        message.success('Đánh giá sản phẩm thành công!');
      }

      console.log('API response:', result); // Debug log

      // Reset form if creating new review
      if (!isEditing) {
        form.resetFields();
        setRating(0);
        setImages([]);
        setImageFileList([]);
      }

      // Callback to parent component
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || error.response.data;
        message.error(errorMessage);
      } else {
        message.error(isEditing ? 'Không thể cập nhật đánh giá!' : 'Không thể gửi đánh giá!');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Alert
        message="Cần đăng nhập"
        description="Vui lòng đăng nhập để có thể đánh giá sản phẩm"
        type="info"
        showIcon
        style={{ 
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.1)'
        }}
      />
    );
  }

  const uploadButton = (
    <div>
      {uploadingImages ? <Spin size="small" /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  return (
    <ReviewFormContainer
      title={
        <Space>
          {isEditing ? <EditOutlined /> : <StarOutlined />}
          <Title level={4} style={{ margin: 0 }}>
            {isEditing ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
          </Title>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            rating: existingReview?.rating || 0,
            comment: existingReview?.comment || ''
          }}
        >
          <Form.Item
            name="rating"
            label={<Text strong>Đánh giá của bạn</Text>}
            rules={[
              { required: true, message: 'Vui lòng chọn số sao đánh giá!' },
              { 
                validator: (_, value) => {
                  if (value && value >= 1 && value <= 5) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Đánh giá phải từ 1 đến 5 sao!'));
                }
              }
            ]}
          >
            <div>
              <StyledRate 
                value={rating}
                onChange={(value) => {
                  setRating(value);
                  form.setFieldsValue({ rating: value });
                }}
                character={<StarOutlined />}
              />
              <RatingDescription>
                <Text type="secondary">
                  {getRatingDescription(rating)}
                </Text>
              </RatingDescription>
            </div>
          </Form.Item>

          <Form.Item
            name="comment"
            label={<Text strong>Nhận xét chi tiết</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập nhận xét về sản phẩm!' },
              { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự!' },
              { max: 500, message: 'Nhận xét không được quá 500 ký tự!' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              showCount
              maxLength={500}
              style={{
                borderRadius: 8,
                fontSize: 14
              }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Ảnh minh họa (không bắt buộc)</Text>}
          >
            <ImageUploadContainer>
              <Upload
                action="https://localhost:7164/api/Reviews/upload-images"
                listType="picture-card"
                fileList={imageFileList}
                onChange={handleImageChange}
                onRemove={handleImageRemove}
                beforeUpload={beforeUpload}
                customRequest={customRequest}
                maxCount={5}
                multiple
                headers={{
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }}
              >
                {imageFileList.length >= 5 ? null : uploadButton}
              </Upload>
            </ImageUploadContainer>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Bạn có thể tải lên tối đa 5 ảnh, mỗi ảnh tối đa 5MB
            </Text>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space size="middle">
              <SubmitButton
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                size="large"
              >
                {isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </SubmitButton>
              
              {onCancel && (
                <Button
                  size="large"
                  onClick={onCancel}
                  style={{
                    borderRadius: 12,
                    height: 48,
                    fontWeight: 600
                  }}
                >
                  Hủy
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </ReviewFormContainer>
  );
};

export default ReviewForm; 