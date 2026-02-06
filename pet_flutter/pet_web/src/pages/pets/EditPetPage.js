import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Row, Col, Alert, Spin, Card, 
  Space, Tag, Avatar, Divider, Skeleton,
  Result, Button, Badge
} from 'antd';
import {
  EditOutlined, 
  ArrowLeftOutlined,
  SaveOutlined,
  PictureOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  LoadingOutlined,
  HeartOutlined,
  TeamOutlined,
  RocketOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import PetForm from '../../components/pets/PetForm';
import petService from '../../services/petService';
import axiosClient from '../../utils/axiosClient';

const { Title, Text, Paragraph } = Typography;

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 32px auto 64px;
  padding: 0 24px;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const HeaderCard = styled(Card)`
  margin-bottom: 32px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(120deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
  border: none;
  
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.07) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(82, 196, 26, 0.05) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
  }
  
  .ant-card-body {
    position: relative;
    z-index: 1;
  }
`;

const StyledIconAvatar = styled(Avatar)`
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
  animation: ${pulse} 2s infinite;
  border: 4px solid white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05) rotate(5deg);
  }
  
  .anticon {
    font-size: 36px;
  }
`;

const PetAvatar = styled(Avatar)`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: -30px;
  margin-left: 20px;
  position: relative;
  z-index: 2;
  overflow: hidden;
  
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
`;

const AnimatedTag = styled(Tag)`
  padding: 6px 12px;
  margin-top: 16px;
  border-radius: 20px;
  animation: ${float} 3s ease-in-out infinite;
  background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
  background-size: 200% 200%;
  animation: ${shimmer} 3s linear infinite;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  border: none;
  color: white;
  font-weight: 500;
  font-size: 14px;
`;

const GradientTitle = styled(Title)`
  margin-bottom: 8px !important;
  background: linear-gradient(90deg, #1890ff, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700 !important;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 40px;
    background: linear-gradient(90deg, #1890ff, #36cfc9);
    border-radius: 3px;
  }
`;

const FormCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: none;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(-5px);
  }
  
  .ant-card-body {
    padding: 0;
  }
`;

const BackButton = styled(Button)`
  margin-right: 16px;
  background: rgba(24, 144, 255, 0.1);
  border: none;
  color: #1890ff;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(24, 144, 255, 0.2);
    transform: translateX(-3px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  }
`;

const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.03) 0%, rgba(24, 144, 255, 0.06) 100%);
  border-radius: 16px 16px 0 0;
  z-index: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 48px 24px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(82, 196, 26, 0.04) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
  }
`;

const RotatingIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  font-size: 36px;
  margin-bottom: 24px;
  color: #1890ff;
  animation: ${rotate} 2s linear infinite;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: ${props => props.accent || '#1890ff'};
  }
  
  .feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 24px;
    background: ${props => props.iconBg || 'rgba(24, 144, 255, 0.1)'};
    color: ${props => props.accent || '#1890ff'};
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const EditPetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get full image URL
  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    // Check if the path is in the format '/uploads/pets/filename.png'
    if (photoPath.includes('/uploads/pets/')) {
      const baseURL = 'https://localhost:7164';
      return `${baseURL}${photoPath}`;
    }
    
    // Get baseURL from axiosClient and remove "/api"
    const baseURL = axiosClient.defaults.baseURL;
    const serverBaseURL = baseURL.substring(0, baseURL.lastIndexOf('/api'));
    
    return `${serverBaseURL}${photoPath.startsWith('/') ? photoPath : `/${photoPath}`}`;
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch pet with ID:', id);
        const data = await petService.getPetById(id);
        
        console.log('Fetched pet data:', data);
        
        // Process image URL before setting to state
        if (data && data.photo) {
          data.photoUrl = getImageUrl(data.photo); // Add photoUrl for image display
        }
        
        setPet(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError(typeof err === 'string' ? err : 'Không thể tải thông tin thú cưng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPet();
    } else {
      console.error('No pet ID provided in URL');
      setError('Không tìm thấy ID thú cưng trong URL');
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await petService.updatePet(id, formData);
      navigate(`/pets/${id}`, { state: { message: 'Cập nhật thú cưng thành công' } });
    } catch (err) {
      console.error('Error updating pet:', err);
      setError(typeof err === 'string' ? err : 'Không thể cập nhật thú cưng. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <RotatingIcon>
            <LoadingOutlined />
          </RotatingIcon>
          <Title level={4} style={{ margin: '0 0 8px', fontWeight: 600 }}>
            Đang tải thông tin thú cưng...
          </Title>
          <Paragraph style={{ color: 'rgba(0, 0, 0, 0.45)', maxWidth: 400 }}>
            Vui lòng đợi trong giây lát để hệ thống tải thông tin thú cưng của bạn.
          </Paragraph>
          <Skeleton 
            active 
            avatar={{size: 64}} 
            paragraph={{rows: 4}} 
            style={{
              maxWidth: 600,
              marginTop: 24,
              padding: 16,
              background: 'rgba(24, 144, 255, 0.02)',
              borderRadius: 8
            }}
          />
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error && !pet) {
    return (
      <PageContainer>
        <Result
          status="warning"
          title="Không thể tải thông tin thú cưng"
          subTitle={error || "Đã xảy ra lỗi khi tải thông tin thú cưng"}
          icon={<WarningOutlined style={{ color: '#faad14' }} />}
          extra={[
            <Button 
              type="primary" 
              key="back" 
              onClick={() => navigate('/pets')}
              icon={<ArrowLeftOutlined />}
            >
              Quay lại danh sách
            </Button>,
            <Button 
              key="try-again" 
              onClick={() => window.location.reload()}
              icon={<RocketOutlined />}
            >
              Thử lại
            </Button>,
          ]}
        />
      </PageContainer>
    );
  }

  if (!pet) {
    return (
      <PageContainer>
        <Result
          status="404"
          title="Không tìm thấy thú cưng"
          subTitle="Thú cưng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          extra={
            <Button 
              type="primary" 
              onClick={() => navigate('/pets')}
              icon={<ArrowLeftOutlined />}
            >
              Quay lại danh sách
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderCard>
        <HeaderOverlay />
        <Row align="middle" gutter={16}>
          <Col>
            <Space align="start">
              <BackButton 
                type="default" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(`/pets/${id}`)}
              />
              <StyledIconAvatar icon={<EditOutlined />} />
            </Space>
          </Col>
          <Col flex="1">
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500, fontSize: 12 }}>
                Cập nhật thông tin
              </Text>
              
              <GradientTitle level={3}>
                Chỉnh sửa thông tin của {pet.name}
              </GradientTitle>
              
              <Space size={12} style={{ marginTop: 8 }}>
                <AnimatedTag>
                  <EditOutlined style={{ marginRight: 8 }} />
                  Chỉnh sửa
                </AnimatedTag>
                {pet.species && (
                  <Tag color={pet.species === 'Chó' ? 'blue' : 'magenta'} style={{ borderRadius: 20, padding: '2px 10px' }}>
                    {pet.species === 'Chó' ? '🐕' : '🐈'} {pet.species}
                  </Tag>
                )}
                {pet.gender && (
                  <Tag color={pet.gender === 'Đực' ? 'blue' : 'pink'} style={{ borderRadius: 20, padding: '2px 10px' }}>
                    {pet.gender}
                  </Tag>
                )}
              </Space>
            </Space>
          </Col>
          {pet.photoUrl && (
            <Col>
              <Badge 
                count={
                  <Avatar 
                    style={{ background: '#1890ff', fontSize: 12 }} 
                    size={20}
                    icon={<InfoCircleOutlined />}
                  />
                } 
                offset={[-5, 5]}
              >
                <PetAvatar src={pet.photoUrl} />
              </Badge>
            </Col>
          )}
        </Row>
        
        <Divider style={{ margin: '24px 0 16px' }} />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <FeatureCard 
              bordered={false}
              accent="#1890ff"
              iconBg="rgba(24, 144, 255, 0.1)"
              hoverable
            >
              <div className="feature-icon">
                <SaveOutlined />
              </div>
              <Title level={5}>Lưu thông tin chính xác</Title>
              <Text type="secondary">
                Cập nhật thông tin mới nhất về thú cưng của bạn để chúng tôi có thể chăm sóc tốt hơn.
              </Text>
            </FeatureCard>
          </Col>
          
          <Col xs={24} md={8}>
            <FeatureCard 
              bordered={false}
              accent="#52c41a"
              iconBg="rgba(82, 196, 26, 0.1)"
              hoverable
            >
              <div className="feature-icon">
                <HeartOutlined style={{ color: '#52c41a' }} />
              </div>
              <Title level={5}>Chăm sóc tối ưu</Title>
              <Text type="secondary">
                Thông tin cập nhật giúp bác sĩ thú y đưa ra phương pháp điều trị tốt nhất.
              </Text>
            </FeatureCard>
          </Col>
          
          <Col xs={24} md={8}>
            <FeatureCard 
              bordered={false}
              accent="#722ed1"
              iconBg="rgba(114, 46, 209, 0.1)"
              hoverable
            >
              <div className="feature-icon">
                <TeamOutlined style={{ color: '#722ed1' }} />
              </div>
              <Title level={5}>Kết nối dịch vụ</Title>
              <Text type="secondary">
                Thông tin được chia sẻ với các đối tác để cung cấp dịch vụ tốt nhất cho bạn.
              </Text>
            </FeatureCard>
          </Col>
        </Row>
      </HeaderCard>
      
      <FormCard>
        {error && (
          <Alert 
            message="Lỗi cập nhật thông tin"
            description={error}
            type="error" 
            showIcon
            icon={<WarningOutlined />}
            style={{ 
              margin: 24, 
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)'
            }}
          />
        )}
        
        <PetForm 
          initialValues={{...pet, photo: null}} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </FormCard>
    </PageContainer>
  );
};

export default EditPetPage;