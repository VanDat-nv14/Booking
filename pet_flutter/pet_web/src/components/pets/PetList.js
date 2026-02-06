import React from 'react';
import { Row, Col, Card, Empty, Avatar, Tag, Button, Typography, Space, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { 
  HeartOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  CalendarOutlined, GiftOutlined, HeartFilled, InfoCircleOutlined,
  StarOutlined, FireOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import axiosClient from '../../utils/axiosClient';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const { Text, Title } = Typography;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 123, 69, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 123, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 123, 69, 0); }
`;

const shimmer = keyframes`
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
`;

// Styled components
const StyledCard = styled(motion.div)`
  height: 100%;
  transition: all 0.5s cubic-bezier(0.43, 0.13, 0.23, 0.96);
  position: relative;
  
  &:hover {
    transform: translateY(-8px);
  }
`;

const PetCard = styled(Card)`
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  background: #fff;
  border: none;
  position: relative;
  transition: all 0.5s ease;
  
  .ant-card-cover {
    height: 220px;
    overflow: hidden;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s ease;
    }
  }
  
  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
    
    .ant-card-cover img {
      transform: scale(1.08);
    }
    
    .hover-content {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .ant-card-body {
    padding: 20px 24px;
  }
  
  .ant-card-actions {
    border-top: none;
    background: transparent;
    padding: 0 12px 16px;
    
    li {
      margin: 0 4px;
      border-radius: 12px;
      overflow: hidden;
    }
  }
`;

const PetImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  padding: 16px;
  color: white;
  z-index: 1;
`;

const PetBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
  
  &.featured {
    animation: ${pulse} 2s infinite;
  }
`;

const RoundBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$bg || 'rgba(255, 255, 255, 0.85)'};
  color: ${props => props.$color || '#ff7a45'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const PetName = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const TagsWrapper = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const InfoTag = styled(Tag)`
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  padding: 3px 12px;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 4px;
  
  .anticon {
    font-size: 14px;
  }
`;

const GenderTag = styled(InfoTag)`
  background: ${props => props.$gender === 'Đực' ? 'rgba(24, 144, 255, 0.1)' : 'rgba(245, 34, 45, 0.08)'};
  color: ${props => props.$gender === 'Đực' ? '#1890ff' : '#eb2f96'};
`;

const DetailButton = styled(Button)`
  height: 38px;
  border-radius: 19px;
  background: linear-gradient(90deg, #1890ff, #096dd9);
  border: none;
  padding: 0 20px;
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.25);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(24, 144, 255, 0.35);
    background: linear-gradient(90deg, #40a9ff, #1890ff);
  }
  
  .anticon {
    font-size: 16px;
    margin-right: 6px;
  }
`;

const HoverContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 2;
  
  p {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }
`;

const EmptyState = styled(Empty)`
  margin: 60px 0;
  
  .ant-empty-image {
    height: 160px;
  }
  
  .ant-empty-description {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 24px;
  }
`;

const PetIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
  color: #1890ff;
`;

const PetAge = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.5);
  font-size: 14px;
  
  .anticon {
    margin-right: 4px;
    color: #faad14;
  }
`;

const ActionIconButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  transition: all 0.3s ease;
  
  .anticon {
    font-size: 18px;
  }
  
  &:hover {
    transform: scale(1.1);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: -6px;
  left: 16px;
  background: linear-gradient(90deg, #ff7a45, #fa541c);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(245, 34, 45, 0.2);
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    left: 10px;
    bottom: -6px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 6px solid #fa541c;
  }
`;

const PetList = ({ pets, error, onDelete }) => {
  // Helper function to get pet value regardless of field naming convention
  const getPetValue = (pet, frontendField, backendField) => {
    // Check frontend field name first (e.g., "name")
    if (pet[frontendField] !== undefined) {
      return pet[frontendField];
    }
    // Then check backend field name (e.g., "Name")
    if (pet[backendField] !== undefined) {
      return pet[backendField];
    }
    return null;
  };

  if (pets.length === 0 && !error) {
    return (
      <EmptyState
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Text style={{ fontSize: 16 }}>
            Không tìm thấy thú cưng nào
          </Text>
        }
      />
    );
  }

  const getImageUrl = (photoPath) => {
    const defaultImage = 'https://via.placeholder.com/300?text=No+Image';
    
    if (!photoPath) return defaultImage;
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    // Thêm URL gốc vào đường dẫn
    try {
      const baseURL = axiosClient.defaults.baseURL;
      const serverBaseURL = baseURL.substring(0, baseURL.lastIndexOf('/api'));
      return `${serverBaseURL}${photoPath}`;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return defaultImage;
    }
  };

  const getSpeciesIcon = (species) => {
    if (species?.toLowerCase().includes('chó')) return '🐕';
    if (species?.toLowerCase().includes('mèo')) return '🐈';
    if (species?.toLowerCase().includes('chim')) return '🦜';
    if (species?.toLowerCase().includes('cá')) return '🐠';
    if (species?.toLowerCase().includes('thỏ')) return '🐇';
    return '🐾';
  };

  const getGenderInfo = (gender) => {
    return gender === 'Đực' 
      ? {
          color: '#1890ff',
          icon: <HeartOutlined style={{ color: '#1890ff' }} />,
          name: 'Đực'
        }
      : {
          color: '#eb2f96',
          icon: <HeartFilled style={{ color: '#eb2f96' }} />,
          name: 'Cái'
        };
  };

  const handleDelete = (pet) => {
    const petName = getPetValue(pet, 'name', 'Name');
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${petName}?`)) {
      onDelete(pet.petId);
    }
  };

  // Thêm thuộc tính đặc biệt vào một số thú cưng để demo
  const enhancedPets = pets.map((pet, index) => ({
    ...pet,
    isFeatured: index === 0 || index === 3, // Chỉ làm nổi bật pet đầu tiên và thứ 4
    hasNewHealthRecord: index === 1 || index === 4, // Pet thứ 2 và thứ 5 có hồ sơ sức khỏe mới
    isPopular: index === 2 // Pet thứ 3 là phổ biến
  }));

  return (
    <AnimatePresence>
      <Row gutter={[24, 24]}>
        {enhancedPets.map((pet) => {
          const petName = getPetValue(pet, 'name', 'Name');
          const petGender = getPetValue(pet, 'gender', 'Gender');
          const petSpecies = getPetValue(pet, 'species', 'Species');
          const petBreed = getPetValue(pet, 'breed', 'Breed');
          const petPhoto = getPetValue(pet, 'photo', 'Photo');
          const petDescription = getPetValue(pet, 'description', 'Description');
          const petAge = getPetValue(pet, 'age', 'Age');

          const genderInfo = getGenderInfo(petGender);
          
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={pet.petId}>
              <StyledCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                layout
              >
                <PetCard
                  cover={
                    <div style={{ position: 'relative' }}>
                      <img 
                        alt={petName} 
                        src={getImageUrl(petPhoto)} 
                      />
                      <PetImageOverlay>
                        <PetName>{petName}</PetName>
                        <TagsWrapper>
                          <InfoTag color="#108ee9">{petSpecies}</InfoTag>
                          {petBreed && (
                            <InfoTag color="#87d068">{petBreed}</InfoTag>
                          )}
                          <GenderTag $gender={petGender}>
                            {genderInfo.icon}
                            {petGender}
                          </GenderTag>
                        </TagsWrapper>
                      </PetImageOverlay>
                      
                      <PetBadge className={pet.isFeatured ? 'featured' : ''}>
                        {pet.isFeatured && (
                          <RoundBadge $bg="#ff7a45" $color="#fff">
                            <FireOutlined />
                          </RoundBadge>
                        )}
                        {pet.hasNewHealthRecord && (
                          <RoundBadge $bg="#52c41a" $color="#fff">
                            <ThunderboltOutlined />
                          </RoundBadge>
                        )}
                        {pet.isPopular && (
                          <RoundBadge $bg="#faad14" $color="#fff">
                            <StarOutlined />
                          </RoundBadge>
                        )}
                      </PetBadge>
                      
                      {pet.isFeatured && (
                        <FeaturedBadge>
                          <FireOutlined style={{ marginRight: 4 }} /> Yêu thích
                        </FeaturedBadge>
                      )}
                    </div>
                  }
                  actions={[
                    <Tooltip title="Xem chi tiết">
                      <Link to={`/pets/${pet.petId}`}>
                        <ActionIconButton type="primary" icon={<EyeOutlined />} />
                      </Link>
                    </Tooltip>,
                    <Tooltip title="Chỉnh sửa">
                      <Link to={`/pets/edit/${pet.petId}`}>
                        <ActionIconButton icon={<EditOutlined />} />
                      </Link>
                    </Tooltip>,
                    <Tooltip title="Xóa">
                      <ActionIconButton 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(pet)}
                      />
                    </Tooltip>
                  ]}
                >
                  <Space align="center">
                    <Avatar size={48} style={{ background: 'rgba(24, 144, 255, 0.1)', fontSize: 24 }}>
                      {getSpeciesIcon(petSpecies)}
                    </Avatar>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {petName}
                      </Title>
                      <PetAge>
                        <CalendarOutlined />
                        {petAge || 'Không rõ tuổi'}
                      </PetAge>
                    </div>
                  </Space>
                  
                  <HoverContent className="hover-content">
                    <Text type="secondary" ellipsis={{ rows: 2 }}>
                      {petDescription || 'Không có mô tả chi tiết cho thú cưng này.'}
                    </Text>
                    <Link to={`/pets/${pet.petId}`}>
                      <DetailButton 
                        type="primary" 
                        block
                        icon={<InfoCircleOutlined />}
                      >
                        Xem chi tiết
                      </DetailButton>
                    </Link>
                  </HoverContent>
                </PetCard>
              </StyledCard>
            </Col>
          );
        })}
      </Row>
    </AnimatePresence>
  );
};

export default PetList;