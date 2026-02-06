import React, { useState } from 'react';
import { Card, Tag, Button, Tooltip, Avatar, Divider, Typography, Space, Badge } from 'antd';
import { Link } from 'react-router-dom';
import { 
  HeartOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  CalendarOutlined, PlusOutlined, GiftOutlined, HeartFilled
} from '@ant-design/icons';
import axiosClient from '../../utils/axiosClient';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;
const { Meta } = Card;

// Styled components for enhanced styling
const StyledCard = styled(motion.div)`
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.5s ease;
  background: white;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  .ant-card-cover {
    overflow: hidden;
    height: 220px;
  }

  .ant-card-cover img {
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
  }

  &:hover .ant-card-cover img {
    transform: scale(1.07);
  }

  .ant-card-body {
    padding: 20px;
  }

  .ant-card-actions {
    border-top: 1px solid #f0f0f0;
  }
`;

const PetImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  height: 50%;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  z-index: 1;
`;

const AnimatedBadge = styled(Badge)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  
  .ant-badge-count {
    box-shadow: 0 0 0 1px #fff;
    padding: 0 8px;
  }
`;

const GenderAvatar = styled(Avatar)`
  background-color: white;
  border: 2px solid ${props => props.$genderColor};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16);
`;

const SpeciesAvatar = styled(Avatar)`
  margin-right: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

const ActionButton = styled(Button)`
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
`;

const InfoTag = styled(Tag)`
  margin: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
`;

const PetCard = ({ pet, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const defaultImage = 'https://via.placeholder.com/300?text=No+Image';
  
  // Hàm lấy URL đầy đủ của hình ảnh
  const getImageUrl = (photoPath) => {
    if (!photoPath) return defaultImage;
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    // Lấy phần baseURL từ axiosClient và loại bỏ phần "/api"
    const baseURL = axiosClient.defaults.baseURL;
    const serverBaseURL = baseURL.substring(0, baseURL.lastIndexOf('/api'));
    
    return `${serverBaseURL}${photoPath}`;
  };
  
  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${pet.name}?`)) {
      onDelete(pet.petId);
    }
  };

  const getSpeciesIcon = (species) => {
    // Đây chỉ là ví dụ, bạn có thể thay đổi theo logic riêng
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
          color: '#1890ff', // blue
          icon: <HeartOutlined style={{ color: '#1890ff' }} />,
          avatarIcon: '♂️'
        }
      : {
          color: '#eb2f96', // pink
          icon: <HeartFilled style={{ color: '#eb2f96' }} />,
          avatarIcon: '♀️'
        };
  };

  const genderInfo = getGenderInfo(pet.gender);

  const imageUrl = getImageUrl(pet.photo);

  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        bordered={false}
        cover={
          <div style={{ position: 'relative' }}>
            <img alt={pet.name} src={imageUrl} />
            <PetImageOverlay>
              <SpeciesAvatar size="large" style={{ backgroundColor: '#7d56f0' }}>
                {getSpeciesIcon(pet.species)}
              </SpeciesAvatar>
              <Text strong style={{ color: 'white', fontSize: '18px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {pet.name}
              </Text>
            </PetImageOverlay>
            <AnimatedBadge 
              count={
                <GenderAvatar size="small" $genderColor={genderInfo.color}>
                  {genderInfo.avatarIcon}
                </GenderAvatar>
              }
            />
          </div>
        }
        actions={[
          <Tooltip title="Xem chi tiết" placement="bottom">
            <Link to={`/pets/${pet.petId}`}>
              <ActionButton 
                type="primary" 
                shape="round" 
                icon={<EyeOutlined />}
                size="middle"
              >
                Chi tiết
              </ActionButton>
            </Link>
          </Tooltip>,
          <Tooltip title="Chỉnh sửa" placement="bottom">
            <Link to={`/pets/edit/${pet.petId}`}>
              <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              />
            </Link>
          </Tooltip>,
          <Tooltip title="Xóa" placement="bottom">
            <Button 
              type="text" 
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} 
              onClick={handleDelete}
            />
          </Tooltip>
        ]}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space wrap>
            <InfoTag color="#7d56f0">{pet.species}</InfoTag>
            {pet.breed && (
              <InfoTag color="processing">{pet.breed}</InfoTag>
            )}
          </Space>

          <Divider style={{ margin: '12px 0' }} />

          <Space align="center">
            {genderInfo.icon}
            <Text type="secondary">
              {`${pet.gender}, ${pet.age || 'Chưa rõ tuổi'}`}
            </Text>
          </Space>

          {pet.birthdate && (
            <Space align="center">
              <CalendarOutlined style={{ color: '#faad14' }} />
              <Text type="secondary">
                {new Date(pet.birthdate).toLocaleDateString('vi-VN')}
              </Text>
            </Space>
          )}

          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Divider style={{ margin: '12px 0' }} />
              <Space>
                <GiftOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary">Đặt lịch thăm khám</Text>
              </Space>
            </motion.div>
          )}
        </Space>
      </Card>
    </StyledCard>
  );
};

export default PetCard;