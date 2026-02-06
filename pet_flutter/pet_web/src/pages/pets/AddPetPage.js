import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Row, Col, Alert, Steps, Avatar, 
  Space, Divider, Badge, Tag
} from 'antd';
import { 
  PlusCircleOutlined, CheckCircleOutlined, PieChartOutlined, 
  CalendarOutlined, MedicineBoxOutlined, HeartOutlined, 
  SafetyCertificateOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import PetForm from '../../components/pets/PetForm';
import petService from '../../services/petService';
import { getPetImageUrl } from '../../utils/imageUtils';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Styled components for enhanced styling
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto 80px;
  padding: 0 24px;
`;

const HeaderCard = styled(Card)`
  border-radius: 16px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f5ff 100%);
  border: none;
  box-shadow: 0 10px 30px rgba(24, 144, 255, 0.1);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.1), transparent 70%);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: 30%;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.05), transparent 70%);
  }

  .ant-card-body {
    padding: 40px;
  }
`;

const StyledAvatar = styled(Avatar)`
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 8px 16px rgba(24, 144, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
`;

const FormCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  border: none;
  overflow: hidden;
`;

const BenefitsCard = styled(Card)`
  border-radius: 12px;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  background: linear-gradient(145deg, #ffffff 0%, #f9fafc 100%);
`;

const BenefitItem = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(24, 144, 255, 0.05);
    transform: translateX(5px);
  }

  .ant-typography {
    margin-bottom: 0;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f5ff;
  margin-right: 16px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  color: #1890ff;
`;

const StyledBadge = styled(Badge)`
  .ant-badge-count {
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
    box-shadow: 0 3px 6px rgba(82, 196, 26, 0.2);
    padding: 0 10px;
  }
`;

const AddPetPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  const steps = [
    {
      title: 'Nhập thông tin',
      description: 'Điền thông tin thú cưng'
    },
    {
      title: 'Kiểm tra',
      description: 'Xác nhận thông tin'
    },
    {
      title: 'Hoàn tất',
      description: 'Thêm thành công'
    }
  ];
  
  const handleSubmit = async (formData) => {
    try {
      // In ra dữ liệu form trước khi gửi
      console.log('Form data submitted:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'photo' ? 'File object' : pair[1]));
      }
      
      await petService.createPet(formData);
      navigate('/pets', { state: { message: 'Thêm thú cưng thành công' } });
    } catch (err) {
      console.error('Error creating pet:', err);
      
      // Xử lý hiển thị lỗi validation chi tiết
      if (typeof err === 'object' && err.errors) {
        // Có lỗi validation từ API
        const errorMessages = [];
        
        // Tạo danh sách lỗi từ các trường
        Object.keys(err.errors).forEach(field => {
          err.errors[field].forEach(message => {
            errorMessages.push(`${field}: ${message}`);
          });
        });
        
        // Hiển thị lỗi dạng danh sách
        const errorMessage = `Lỗi nhập liệu: ${errorMessages.join(', ')}`;
        setError(errorMessage);
      } else {
        // Lỗi khác
        setError(typeof err === 'string' ? err : 'Không thể thêm thú cưng. Vui lòng thử lại sau.');
      }
    }
  };
  
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeaderCard>
          <Space size={24} align="start">
            <StyledAvatar size={64} icon={<PlusCircleOutlined style={{ fontSize: 32 }} />} />
            <div>
              <Title level={2} style={{ marginBottom: 8, fontWeight: 600 }}>
                Thêm thú cưng mới
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Điền thông tin để thêm thú cưng của bạn vào hệ thống
              </Text>
            </div>
          </Space>
          
          <Steps 
            current={0} 
            style={{ marginTop: 40 }}
            responsive={true}
            items={steps}
          />
        </HeaderCard>
        
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FormCard>
                {error && (
                  <Alert
                    message="Lỗi"
                    description={typeof error === 'string' ? error : 'Đã xảy ra lỗi'}
                    type="error"
                    showIcon
                    style={{ 
                      marginBottom: 24,
                      borderRadius: 8
                    }}
                  />
                )}
                
                <PetForm onSubmit={handleSubmit} />
              </FormCard>
            </motion.div>
          </Col>
          
          <Col xs={24} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <BenefitsCard>
                <Space align="center" style={{ marginBottom: 16 }}>
                  <StyledBadge count="PRO" />
                  <Title level={4} style={{ margin: 0 }}>
                    Lợi ích khi thêm thú cưng
                  </Title>
                </Space>
                
                <Divider style={{ marginTop: 8, marginBottom: 24 }} />
                
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  <BenefitItem
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <IconWrapper>
                      <MedicineBoxOutlined style={{ fontSize: 18 }} />
                    </IconWrapper>
                    <Text>Quản lý hồ sơ y tế của thú cưng</Text>
                  </BenefitItem>
                  
                  <BenefitItem
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <IconWrapper>
                      <CalendarOutlined style={{ fontSize: 18 }} />
                    </IconWrapper>
                    <Text>Nhận lịch nhắc tiêm phòng và chăm sóc</Text>
                  </BenefitItem>
                  
                  <BenefitItem
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <IconWrapper>
                      <CheckCircleOutlined style={{ fontSize: 18 }} />
                    </IconWrapper>
                    <Text>Dễ dàng đặt lịch dịch vụ với thông tin có sẵn</Text>
                  </BenefitItem>
                  
                  <BenefitItem
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <IconWrapper>
                      <PieChartOutlined style={{ fontSize: 18 }} />
                    </IconWrapper>
                    <Text>Lưu trữ lịch sử chăm sóc và điều trị</Text>
                  </BenefitItem>
                  
                  <BenefitItem
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <IconWrapper>
                      <HeartOutlined style={{ fontSize: 18 }} />
                    </IconWrapper>
                    <Text>Nhận tư vấn dinh dưỡng phù hợp với thú cưng</Text>
                  </BenefitItem>
                </motion.div>
                
                <Divider style={{ marginTop: 16, marginBottom: 16 }} />
                
                <Tag color="blue" style={{ padding: '5px 10px', borderRadius: 4 }}>
                  <SafetyCertificateOutlined /> Bảo mật thông tin
                </Tag>
                <Tag color="green" style={{ padding: '5px 10px', borderRadius: 4, marginLeft: 8 }}>
                  <ThunderboltOutlined /> Cập nhật nhanh chóng
                </Tag>
              </BenefitsCard>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </PageContainer>
  );
};

export default AddPetPage;