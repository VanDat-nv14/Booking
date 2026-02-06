import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Row, Col, Typography, Button, Spin, Card, Empty, 
  Divider, Space, Tag, Badge, Descriptions, Tabs,
  Alert, Avatar, Image, Tooltip, Timeline, Statistic
} from 'antd';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined,
  HeartOutlined, CalendarOutlined, MedicineBoxOutlined, 
  NotificationOutlined, PictureOutlined, HomeOutlined,
  EnvironmentOutlined, StarOutlined, RocketOutlined,
  HistoryOutlined, BellOutlined, BulbOutlined,
  WarningOutlined, FileTextOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, LoadingOutlined, InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import styled, { keyframes, css } from 'styled-components';
import petService from '../../services/petService';
import axiosClient from '../../utils/axiosClient';
import PetDetail from '../../components/pets/PetDetail';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

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

const breathe = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
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
  overflow: hidden;
  position: relative;
  border-radius: 24px;
  margin-bottom: 30px;
  border: none;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    top: -80px;
    right: -80px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(82, 196, 26, 0.06) 0%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
  }
  
  .ant-card-body {
    position: relative;
    z-index: 1;
  }
`;

const PetImage = styled.div`
  position: relative;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform-origin: center;
  animation: ${breathe} 6s infinite ease-in-out;
  
  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    display: block;
    transition: all 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.3) 100%);
    pointer-events: none;
  }
`;

const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  .placeholder-icon {
    font-size: 72px;
    color: rgba(24, 144, 255, 0.2);
  }
`;

const GradientTitle = styled(Title)`
  background: linear-gradient(90deg, #1890ff, #096dd9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px !important;
  font-weight: 700 !important;
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  height: 44px;
  padding: 0 24px;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s ease;
  
  ${props => props.primary && css`
    background: linear-gradient(90deg, #1890ff, #096dd9);
    border: none;
    color: white;
    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.2);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
      background: linear-gradient(90deg, #40a9ff, #1890ff);
    }
  `}
  
  ${props => props.danger && css`
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.08);
    border: none;
    
    &:hover {
      background: rgba(255, 77, 79, 0.12);
      color: #ff4d4f;
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(255, 77, 79, 0.15);
    }
  `}
  
  ${props => props.back && css`
    background: rgba(0, 0, 0, 0.03);
    border: none;
    color: rgba(0, 0, 0, 0.65);
    
    &:hover {
      background: rgba(0, 0, 0, 0.06);
      transform: translateX(-3px);
    }
  `}
  
  .anticon {
    font-size: 18px;
  }
`;

const StyledBadge = styled(Badge)`
  .ant-badge-count {
    background: linear-gradient(90deg, #1890ff, #096dd9);
    box-shadow: 0 4px 10px rgba(24, 144, 255, 0.3);
    padding: 0 10px;
    font-weight: 500;
  }
`;

const AnimatedTag = styled(Tag)`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin: 0 8px 8px 0;
  border: none;
  background: ${props => props.background || 'linear-gradient(90deg, #1890ff, #096dd9)'};
  background-size: 200% 200%;
  animation: ${shimmer} 3s linear infinite;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  color: white;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
  }
  
  .anticon {
    margin-right: 6px;
    font-size: 16px;
  }
`;

const DetailCard = styled(Card)`
  border-radius: 20px;
  overflow: hidden;
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  }
  
  .ant-card-head {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .ant-card-head-title {
    font-weight: 600;
    font-size: 18px;
    padding-bottom: 8px;
    display: flex;
    align-items: center;
  }
  
  .icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.iconBg || 'rgba(24, 144, 255, 0.1)'};
    margin-right: 10px;
    
    .anticon {
      font-size: 20px;
      color: ${props => props.iconColor || '#1890ff'};
    }
  }
  
  .ant-descriptions-item-label {
    color: rgba(0, 0, 0, 0.5);
    font-weight: 500;
  }
  
  .ant-descriptions-item-content {
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
  }
`;

const StyledStatistic = styled(Statistic)`
  .ant-statistic-title {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .ant-statistic-content {
    font-size: 24px;
    font-weight: 600;
    color: ${props => props.valueColor || '#1890ff'};
  }
`;

const NotesCard = styled(Card)`
  border-radius: 20px;
  overflow: hidden;
  border: none;
  margin-top: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  
  .ant-card-head {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .ant-card-head-title {
    font-weight: 600;
    font-size: 18px;
    padding-bottom: 8px;
    display: flex;
    align-items: center;
  }
  
  .icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(250, 173, 20, 0.1);
    margin-right: 10px;
    
    .anticon {
      font-size: 20px;
      color: #faad14;
    }
  }
`;

const TimelineItem = styled(Timeline.Item)`
  padding-bottom: 20px;
  
  .ant-timeline-item-content {
    background: ${props => props.background || 'rgba(24, 144, 255, 0.05)'};
    padding: 16px;
    border-radius: 12px;
    margin-top: -6px;
    transition: all 0.3s ease;
    border-left: 3px solid ${props => props.borderColor || '#1890ff'};
    
    &:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
  }
  
  .ant-timeline-item-head {
    background-color: ${props => props.dotColor || '#1890ff'};
    width: 14px;
    height: 14px;
  }
`;

const StyledTabs = styled(Tabs)`
  margin-top: 24px;
  
  .ant-tabs-tab {
    padding: 12px 20px;
    transition: all 0.3s ease;
    border-radius: 8px 8px 0 0;
    
    &:hover {
      color: #1890ff;
      transform: translateY(-3px);
    }
  }
  
  .ant-tabs-tab-active {
    background: rgba(24, 144, 255, 0.06);
    
    .ant-tabs-tab-btn {
      color: #1890ff;
      font-weight: 500;
    }
  }
  
  .ant-tabs-tab-btn {
    display: flex;
    align-items: center;
    
    .anticon {
      margin-right: 8px;
      font-size: 18px;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  
  .loading-icon {
    font-size: 48px;
    color: #1890ff;
    margin-bottom: 24px;
    display: inline-block;
    animation: ${rotate} 2s linear infinite;
  }
`;

const PetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

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
    
    // Old format handling
    const baseURL = axiosClient.defaults.baseURL;
    const serverBaseURL = baseURL.substring(0, baseURL.lastIndexOf('/api'));
    
    return `${serverBaseURL}${photoPath.startsWith('/') ? photoPath : `/${photoPath}`}`;
  };

  // Map backend field names to frontend field names
  const mapBackendToFrontend = (petData) => {
    const fieldMapping = {
      // Backend : Frontend
      Name: 'name',
      Species: 'species',
      Breed: 'breed',
      Gender: 'gender',
      DateOfBirth: 'dateOfBirth',
      Weight: 'weight',
      Color: 'color',
      Description: 'description',
      Photo: 'photo'
    };
    
    // Create a new object with both original and mapped properties
    const mappedData = { ...petData };
    
    // Map fields that might be in backend format
    Object.keys(fieldMapping).forEach(backendField => {
      if (petData[backendField] !== undefined) {
        // Store value with frontend field name
        mappedData[fieldMapping[backendField]] = petData[backendField];
      }
    });
    
    return mappedData;
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const data = await petService.getPetById(id);
        
        // Map backend fields to frontend fields
        const processedData = mapBackendToFrontend(data);
        
        // Process image URL before setting to state
        if (processedData && processedData.photo) {
          processedData.photoUrl = getImageUrl(processedData.photo); // Add photoUrl for image display
        }
        
        setPet(processedData);
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
    }
  }, [id]);

  const handleDeletePet = async () => {
    try {
      await petService.deletePet(id);
      navigate('/pets', { state: { message: 'Xóa thú cưng thành công' } });
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError(typeof err === 'string' ? err : 'Không thể xóa thú cưng. Vui lòng thử lại sau.');
    }
  };

  // Generate random data for demonstration purposes
  const generateDummyMedicalHistory = () => {
    return [
      {
        date: '15/04/2025',
        title: 'Khám sức khỏe định kỳ',
        description: 'Thú cưng khỏe mạnh, đã tiêm vaccine phòng bệnh dại.',
        type: 'checkup'
      },
      {
        date: '05/03/2025',
        title: 'Tiêm phòng',
        description: 'Đã tiêm vaccine 6 bệnh cho chó. Thú cưng phản ứng tốt với vaccine.',
        type: 'vaccine'
      },
      {
        date: '10/01/2025',
        title: 'Điều trị',
        description: 'Điều trị viêm da do nấm. Đã kê đơn thuốc uống và thuốc bôi trong 14 ngày.',
        type: 'treatment'
      }
    ];
  };

  const generateDummyReminders = () => {
    return [
      {
        date: '15/05/2025',
        title: 'Hẹn tiêm vaccine',
        description: 'Vaccine phòng bệnh dại định kỳ hàng năm.',
        type: 'vaccine'
      },
      {
        date: '01/06/2025',
        title: 'Tái khám',
        description: 'Kiểm tra tình trạng da sau đợt điều trị nấm.',
        type: 'checkup'
      },
      {
        date: '10/05/2025',
        title: 'Nhắc nhở tẩy giun',
        description: 'Đến hẹn tẩy giun định kỳ 3 tháng/lần.',
        type: 'deworming'
      }
    ];
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="loading-icon">
            <LoadingOutlined />
          </div>
          <Title level={4} style={{ margin: '0 0 8px', fontWeight: 600 }}>
            Đang tải thông tin thú cưng...
          </Title>
          <Paragraph style={{ color: 'rgba(0, 0, 0, 0.45)', maxWidth: 500, margin: '0 auto' }}>
            Vui lòng đợi trong giây lát để hệ thống tải thông tin chi tiết về thú cưng của bạn.
          </Paragraph>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          message="Đã có lỗi xảy ra"
          description={error}
          action={
            <Space>
              <Button 
                onClick={() => navigate('/pets')} 
                icon={<ArrowLeftOutlined />}
              >
                Quay lại
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                icon={<ReloadOutlined />}
                type="primary"
              >
                Thử lại
              </Button>
            </Space>
          }
          style={{ 
            borderRadius: 12,
            boxShadow: '0 6px 16px rgba(255, 77, 79, 0.15)',
          }}
        />
      </PageContainer>
    );
  }

  if (!pet) {
    return (
      <PageContainer>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không tìm thấy thông tin thú cưng."
          style={{ 
            background: 'white', 
            padding: 48, 
            borderRadius: 16,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/pets')}
          >
            Quay lại danh sách
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  // Generate sample data for preview
  const medicalHistory = generateDummyMedicalHistory();
  const reminders = generateDummyReminders();

  return (
    <PageContainer>
      <HeaderCard>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={5}>
            <ActionButton back icon={<ArrowLeftOutlined />} onClick={() => navigate('/pets')}>
              Quay lại
            </ActionButton>
          </Col>
          
          <Col xs={24} lg={14}>
            <GradientTitle level={2}>
              {pet.name}
            </GradientTitle>
            <Space size={[8, 16]} wrap style={{ marginBottom: 16 }}>
              <AnimatedTag>
                <HeartOutlined /> Thú cưng
              </AnimatedTag>
              
              <AnimatedTag background={pet.species === 'Chó' ? 
                'linear-gradient(90deg, #1890ff, #096dd9)' : 
                'linear-gradient(90deg, #eb2f96, #c41d7f)'}>
                {pet.species === 'Chó' ? '🐕' : '🐈'} {pet.species}
              </AnimatedTag>
              
              <AnimatedTag background={pet.gender === 'Đực' ? 
                'linear-gradient(90deg, #1890ff, #096dd9)' : 
                'linear-gradient(90deg, #eb2f96, #c41d7f)'}>
                {pet.gender}
              </AnimatedTag>
              
              {pet.breed && (
                <AnimatedTag background="linear-gradient(90deg, #52c41a, #389e0d)">
                  <InfoCircleOutlined /> {pet.breed}
                </AnimatedTag>
              )}
              
              {pet.age && (
                <AnimatedTag background="linear-gradient(90deg, #faad14, #d48806)">
                  <CalendarOutlined /> {pet.age} tuổi
                </AnimatedTag>
              )}
              
              {pet.color && (
                <AnimatedTag background="linear-gradient(90deg, #722ed1, #531dab)">
                  {pet.color}
                </AnimatedTag>
              )}
            </Space>
          </Col>
          
          <Col xs={24} lg={5} style={{ textAlign: 'right' }}>
            <Space size={12}>
              <ActionButton 
                primary
                icon={<EditOutlined />}
                onClick={() => navigate(`/pets/${id}/edit`)}
              >
                Chỉnh sửa
              </ActionButton>
              
              <Tooltip title="Xóa thú cưng">
                <ActionButton 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa thú cưng này không?')) {
                      handleDeletePet();
                    }
                  }}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </HeaderCard>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10} lg={8}>
          {pet.photoUrl ? (
            <PetImage>
              <Image 
                src={pet.photoUrl} 
                alt={pet.name}
                fallback="https://placekitten.com/500/300"
                preview={{
                  mask: <Space><PictureOutlined /> Xem ảnh lớn</Space>
                }}
              />
            </PetImage>
          ) : (
            <NoImagePlaceholder>
              <PictureOutlined className="placeholder-icon" />
            </NoImagePlaceholder>
          )}
          
          <DetailCard
            title={
              <span>
                <div className="icon-wrapper">
                  <InfoCircleOutlined />
                </div>
                Thông tin chi tiết
              </span>
            }
            style={{ marginTop: 24 }}
          >
            <Descriptions column={1} bordered={false} size="middle">
              <Descriptions.Item label="Tên">
                {pet.name}
              </Descriptions.Item>
              <Descriptions.Item label="Loài">
                {pet.species}
              </Descriptions.Item>
              <Descriptions.Item label="Giống">
                {pet.breed || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {pet.gender}
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi">
                {pet.age ? `${pet.age} tuổi` : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Màu sắc">
                {pet.color || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {pet.weight ? `${pet.weight} kg` : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng tiêm chủng">
                <Tag color={pet.vaccinated ? 'success' : 'warning'}>
                  {pet.vaccinated ? 'Đã tiêm' : 'Chưa tiêm'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng thiến/triệt sản">
                <Tag color={pet.neutered ? 'success' : 'default'}>
                  {pet.neutered ? 'Đã thiến/triệt sản' : 'Chưa thiến/triệt sản'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </DetailCard>
        </Col>
        
        <Col xs={24} md={14} lg={16}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <DetailCard 
                iconBg="rgba(24, 144, 255, 0.1)" 
                iconColor="#1890ff"
              >
                <StyledBadge 
                  count={medicalHistory.length} 
                  style={{ marginBottom: 8 }}
                >
                  <StyledStatistic 
                    title="Lịch sử khám bệnh" 
                    value={medicalHistory.length > 0 ? 'Có dữ liệu' : 'Chưa có'} 
                    valueStyle={{ color: medicalHistory.length > 0 ? '#1890ff' : 'rgba(0,0,0,0.45)' }}
                    prefix={<MedicineBoxOutlined />}
                  />
                </StyledBadge>
              </DetailCard>
            </Col>
            
            <Col xs={24} sm={8}>
              <DetailCard 
                iconBg="rgba(250, 173, 20, 0.1)" 
                iconColor="#faad14"
              >
                <StyledBadge 
                  count={reminders.length} 
                  style={{ marginBottom: 8 }}
                >
                  <StyledStatistic 
                    title="Nhắc nhở" 
                    value={reminders.length > 0 ? 'Sắp tới' : 'Không có'}
                    valueStyle={{ color: reminders.length > 0 ? '#faad14' : 'rgba(0,0,0,0.45)' }}
                    prefix={<BellOutlined />}
                  />
                </StyledBadge>
              </DetailCard>
            </Col>
            
            <Col xs={24} sm={8}>
              <DetailCard 
                iconBg="rgba(82, 196, 26, 0.1)" 
                iconColor="#52c41a"
              >
                <StyledBadge 
                  count="NEW" 
                  style={{ marginBottom: 8 }}
                >
                  <StyledStatistic 
                    title="Dịch vụ đề xuất" 
                    value="Có sẵn"
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<BulbOutlined />}
                  />
                </StyledBadge>
              </DetailCard>
            </Col>
          </Row>
          
          <StyledTabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane 
              tab={<span><FileTextOutlined />Ghi chú</span>} 
              key="1"
            >
              <Card style={{ borderRadius: 16 }}>
                <Typography.Paragraph>
                  {pet.notes ? (
                    pet.notes
                  ) : (
                    <Empty 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có ghi chú về thú cưng này."
                    >
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/pets/${id}/edit`)}
                      >
                        Thêm ghi chú
                      </Button>
                    </Empty>
                  )}
                </Typography.Paragraph>
              </Card>
            </TabPane>
            
            <TabPane 
              tab={<span><MedicineBoxOutlined />Lịch sử y tế</span>} 
              key="2"
            >
              <Card style={{ borderRadius: 16 }}>
                {medicalHistory.length > 0 ? (
                  <Timeline style={{ padding: 16 }}>
                    {medicalHistory.map((record, index) => (
                      <TimelineItem 
                        key={index}
                        color={
                          record.type === 'checkup' ? '#1890ff' : 
                          record.type === 'vaccine' ? '#52c41a' : 
                          '#faad14'
                        }
                        dotColor={
                          record.type === 'checkup' ? '#1890ff' : 
                          record.type === 'vaccine' ? '#52c41a' : 
                          '#faad14'
                        }
                        background={
                          record.type === 'checkup' ? 'rgba(24, 144, 255, 0.05)' : 
                          record.type === 'vaccine' ? 'rgba(82, 196, 26, 0.05)' : 
                          'rgba(250, 173, 20, 0.05)'
                        }
                        borderColor={
                          record.type === 'checkup' ? '#1890ff' : 
                          record.type === 'vaccine' ? '#52c41a' : 
                          '#faad14'
                        }
                      >
                        <div>
                          <Text strong style={{ fontSize: 16 }}>{record.title}</Text>
                          <div style={{ margin: '4px 0 8px' }}>
                            <Tag 
                              color={
                                record.type === 'checkup' ? 'blue' : 
                                record.type === 'vaccine' ? 'green' : 
                                'orange'
                              }
                            >
                              {record.type === 'checkup' ? 'Khám sức khỏe' : 
                               record.type === 'vaccine' ? 'Tiêm phòng' : 
                               'Điều trị'}
                            </Tag>
                            <Text type="secondary">{record.date}</Text>
                          </div>
                          <Paragraph>{record.description}</Paragraph>
                        </div>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có lịch sử y tế."
                  />
                )}
              </Card>
            </TabPane>
            
            <TabPane 
              tab={<span><BellOutlined />Nhắc nhở</span>} 
              key="3"
            >
              <Card style={{ borderRadius: 16 }}>
                {reminders.length > 0 ? (
                  <Timeline style={{ padding: 16 }}>
                    {reminders.map((reminder, index) => (
                      <TimelineItem 
                        key={index}
                        color={
                          reminder.type === 'vaccine' ? '#52c41a' : 
                          reminder.type === 'checkup' ? '#1890ff' : 
                          '#faad14'
                        }
                        dotColor={
                          reminder.type === 'vaccine' ? '#52c41a' : 
                          reminder.type === 'checkup' ? '#1890ff' : 
                          '#faad14'
                        }
                        background={
                          reminder.type === 'vaccine' ? 'rgba(82, 196, 26, 0.05)' : 
                          reminder.type === 'checkup' ? 'rgba(24, 144, 255, 0.05)' : 
                          'rgba(250, 173, 20, 0.05)'
                        }
                        borderColor={
                          reminder.type === 'vaccine' ? '#52c41a' : 
                          reminder.type === 'checkup' ? '#1890ff' : 
                          '#faad14'
                        }
                      >
                        <div>
                          <Text strong style={{ fontSize: 16 }}>{reminder.title}</Text>
                          <div style={{ margin: '4px 0 8px' }}>
                            <Tag 
                              color={
                                reminder.type === 'vaccine' ? 'green' : 
                                reminder.type === 'checkup' ? 'blue' : 
                                'orange'
                              }
                            >
                              {reminder.type === 'vaccine' ? 'Tiêm phòng' : 
                               reminder.type === 'checkup' ? 'Tái khám' : 
                               'Tẩy giun'}
                            </Tag>
                            <Text type="secondary">{reminder.date}</Text>
                          </div>
                          <Paragraph>{reminder.description}</Paragraph>
                        </div>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có nhắc nhở nào sắp tới."
                  />
                )}
              </Card>
            </TabPane>
            
            <TabPane 
              tab={<span><BulbOutlined />Khuyến nghị</span>} 
              key="4"
            >
              <Card style={{ borderRadius: 16 }}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Alert
                    message="Khuyến nghị tiêm vaccine"
                    description={`${pet.name} nên được tiêm vaccine phòng bệnh dại hàng năm để đảm bảo sức khỏe.`}
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ borderRadius: 8 }}
                  />
                  
                  {!pet.neutered && (
                    <Alert
                      message="Thiến/Triệt sản"
                      description={`Việc thiến/triệt sản giúp ${pet.name} tránh được nhiều bệnh lý tiềm ẩn và cải thiện hành vi.`}
                      type="warning"
                      showIcon
                      icon={<ExclamationCircleOutlined />}
                      style={{ borderRadius: 8 }}
                    />
                  )}
                  
                  <Alert
                    message="Chế độ dinh dưỡng"
                    description={`${pet.name} cần được cung cấp đầy đủ dinh dưỡng phù hợp với độ tuổi và tình trạng sức khỏe.`}
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    style={{ borderRadius: 8 }}
                  />
                </Space>
              </Card>
            </TabPane>
          </StyledTabs>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PetDetailPage;