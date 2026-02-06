import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Rate, 
  Button, 
  Space, 
  Typography,
  message 
} from 'antd';
import { StarOutlined, SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const SimpleReviewTest = () => {
  const [form] = Form.useForm();
  const [rating, setRating] = useState(0);

  const handleSubmit = (values) => {
    console.log('Form values:', values);
    message.success(`Đánh giá: ${values.rating} sao - Nội dung: ${values.comment}`);
  };

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        title={
          <Space>
            <StarOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Test Form Đánh Giá (Đơn Giản)
            </Title>
          </Space>
        }
        style={{ 
          maxWidth: 600, 
          margin: '0 auto',
          borderRadius: 16
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={<Text strong>Đánh giá sao</Text>}
            name="rating"
            rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
          >
            <Rate 
              value={rating}
              onChange={setRating}
              style={{ fontSize: 24 }}
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Nội dung đánh giá</Text>}
            name="comment"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung đánh giá!' },
              { min: 5, message: 'Nội dung phải có ít nhất 5 ký tự!' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập nội dung đánh giá của bạn..."
              showCount
              maxLength={500}
              style={{
                fontSize: 14,
                borderRadius: 8
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              size="large"
              style={{ borderRadius: 8 }}
            >
              Gửi đánh giá
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          background: '#e6f7ff', 
          padding: 16, 
          borderRadius: 8, 
          marginTop: 16 
        }}>
          <Text strong>Hướng dẫn test:</Text>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            <li>Chọn số sao (1-5)</li>
            <li>Nhập nội dung vào ô TextArea</li>
            <li>Click "Gửi đánh giá"</li>
            <li>Kiểm tra console.log và message</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SimpleReviewTest; 