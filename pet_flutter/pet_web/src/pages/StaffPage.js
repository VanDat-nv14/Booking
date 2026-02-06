import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Input, 
  Spin, 
  Alert, 
  Tag, 
  Modal, 
  Typography, 
  Divider,
  Avatar,
  Tabs,
  Badge,
  Tooltip,
  message
} from 'antd';
import { 
  SearchOutlined, 
  TeamOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  StarOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
  TrophyOutlined,
  SolutionOutlined,
  SafetyCertificateOutlined,
  LikeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Meta } = Card;

// Animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.9 },
  visible: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 120, 
      damping: 15,
      mass: 1
    }
  },
  hover: {
    y: -15,
    transition: { type: "spring", stiffness: 300, damping: 15 }
  }
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Keyframes for animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shine = keyframes`
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
`;

const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const morphBackground = keyframes`
  0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const slideGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ripple = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5), 
                0 0 0 1px rgba(255, 255, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 0 12px rgba(255, 255, 255, 0), 
                0 0 0 16px rgba(255, 255, 255, 0);
  }
`;

const blinkStar = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
`;

// Styled components
const StyledHeader = styled.div`
  background: linear-gradient(-45deg, #4285f4, #21D4FD, #0063e6, #21D4FD);
  background-size: 400% 400%;
  animation: ${slideGradient} 15s ease infinite;
  padding: 80px 0 90px;
  margin-bottom: 60px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 35vw;
    height: 35vw;
    max-width: 500px;
    max-height: 500px;
    background: rgba(255, 255, 255, 0.1);
    animation: ${morphBackground} 15s ease-in-out infinite;
  }
  
  &::before {
    top: -8%;
    right: -5%;
    backdrop-filter: blur(5px);
  }
  
  &::after {
    bottom: -15%;
    left: -8%;
    backdrop-filter: blur(5px);
  }
`;

const MainContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
`;

const StyledSearchInput = styled(Input)`
  border-radius: 50px;
  padding: 16px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-size: 16px;
  border: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  
  .ant-input-prefix {
    margin-right: 16px;
    color: #1890ff;
    font-size: 18px;
    transition: all 0.3s ease;
  }
  
  &:hover, &:focus {
    box-shadow: 0 12px 28px rgba(24, 144, 255, 0.3);
    transform: translateY(-3px) scale(1.02);
    
    .ant-input-prefix {
      transform: scale(1.2);
      color: #0063e6;
    }
  }
  
  &:focus {
    background: linear-gradient(to right, rgba(255, 255, 255, 0.98) 20%, rgba(236, 246, 255, 0.98) 40%, rgba(236, 246, 255, 0.98) 60%, rgba(255, 255, 255, 0.98) 80%);
    background-size: 200% auto;
    animation: ${shine} 3s linear infinite;
  }
`;

const HeaderTitle = styled(Title)`
  margin-bottom: 8px !important;
  background: linear-gradient(90deg, #ffffff, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.5px;
  font-weight: 800 !important;
  
  @media (max-width: 576px) {
    font-size: 28px !important;
  }
  
  &::after {
    content: '⭐';
    position: absolute;
    font-size: 0.6em;
    margin-left: 8px;
    animation: ${blinkStar} 3s ease infinite;
    -webkit-text-fill-color: #ffeb3b;
    text-shadow: 0 0 10px rgba(255, 235, 59, 0.7);
  }
`;

const SubTitle = styled(Text)`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  max-width: 780px;
  margin: 0 auto;
  display: block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.6;
  letter-spacing: 0.3px;
  font-weight: 400;
  
  @media (max-width: 576px) {
    font-size: 16px;
  }
`;

const StyledCard = styled(motion(Card))`
  border-radius: 24px;
  overflow: hidden;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: none;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  transform-style: preserve-3d;
  perspective: 1000px;
  
  &:hover {
    transform: translateY(-12px) scale(1.02) rotateX(3deg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  }
  
  .ant-card-cover {
    height: 280px;
    overflow: hidden;
    position: relative;
    transform-style: preserve-3d;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 50%);
      z-index: 2;
      opacity: 0.8;
      transition: opacity 0.4s ease;
    }
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(66, 133, 244, 0.2), transparent 70%);
      z-index: 1;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    
    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      transition: transform 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
      transform: scale(1.05);
    }
  }
  
  &:hover .ant-card-cover {
    &::before {
      opacity: 1;
    }
    
    &::after {
      opacity: 1;
    }
    
    img {
      transform: scale(1.15) rotate(2deg);
    }
  }
  
  .ant-card-body {
    padding: 24px;
    position: relative;
    z-index: 2;
    background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,1));
    border-top: 1px solid rgba(240, 240, 240, 0.8);
    
    &::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 0;
      right: 0;
      height: 20px;
      background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
      z-index: 5;
    }
  }
  
  .ant-card-meta-title {
    font-size: 20px;
    margin-bottom: 6px;
    color: #1890ff;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  &:hover .ant-card-meta-title {
    background: linear-gradient(90deg, #1890ff, #0063e6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transform: translateX(5px);
  }
  
  .ant-card-meta-description {
    color: #555;
    font-size: 15px;
  }
`;

const StaffDescription = styled(Paragraph)`
  margin: 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: #666;
  height: 63px;
`;

const CardActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const StyledButton = styled(Button)`
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const DetailButton = styled(StyledButton)`
  color: #1890ff;
  border-color: #1890ff;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0%;
    background: #1890ff;
    z-index: -1;
    transition: all 0.3s ease;
  }
  
  &:hover {
    color: #fff;
    border-color: #1890ff;
    
    &::before {
      height: 100%;
    }
  }
`;

const BookingButton = styled(StyledButton)`
  background: ${props => props.color || 'linear-gradient(90deg, #1890ff, #4285f4)'};
  border: none;
  color: white;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 15px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.4s ease;
    z-index: -1;
  }
  
  &:hover {
    opacity: 1;
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 65, 255, 0.25);
    
    &::before {
      left: 100%;
      transition: all 0.8s ease;
    }
  }
`;

const StyledTag = styled(Tag)`
  border-radius: 30px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  border: none;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  background: ${props => props.background || 'linear-gradient(135deg, #1890ff, #0063e6)'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: all 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
    
    &::before {
      left: 100%;
      transition: all 0.5s ease;
    }
  }
  
  .anticon {
    margin-right: 5px;
    font-size: 12px;
  }
`;

const StyledBadge = styled(Badge)`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  
  .ant-badge-count {
    padding: 0 16px;
    height: 32px;
    line-height: 32px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
    transition: all 0.3s ease;
    transform: translateZ(20px);
    background: ${props => props.color || '#1890ff'};
    background: linear-gradient(135deg, ${props => props.color || '#1890ff'}, ${props => props.secondaryColor || '#0063e6'});
  }
  
  &:hover .ant-badge-count {
    transform: scale(1.1) translateZ(30px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const StyledDivider = styled(Divider)`
  margin: 12px 0;
`;

const StyledModalImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  .anticon {
    font-size: 18px;
    color: #1890ff;
    margin-right: 12px;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
`;

const StaffStatItem = styled.div`
  text-align: center;
  padding: 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f8fafc, #f0f7ff);
  margin-bottom: 16px;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(240, 240, 240, 0.8);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, transparent, ${props => props.accentColor || '#4285f4'}, transparent);
    opacity: 0.3;
    border-radius: 5px;
    transform: translateY(-5px);
    transition: all 0.4s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, #f0f7ff, #e6f1ff);
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 20px 35px rgba(66, 133, 244, 0.12);
    border-color: rgba(66, 133, 244, 0.1);
    
    &::before {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .icon {
    font-size: 32px;
    color: ${props => props.accentColor || '#4285f4'};
    margin-bottom: 14px;
    transition: all 0.3s ease;
  }
  
  &:hover .icon {
    transform: scale(1.2) translateY(-5px);
    color: ${props => props.hoverColor || '#0063e6'};
  }
  
  .title {
    font-size: 15px;
    color: #666;
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .value {
    font-size: 28px;
    font-weight: 800;
    color: ${props => props.accentColor || '#4285f4'};
    text-shadow: 0 2px 6px rgba(66, 133, 244, 0.15);
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 3px;
      background: ${props => props.accentColor || '#4285f4'};
      border-radius: 3px;
      opacity: 0.3;
    }
  }
`;

const ExperienceItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  .title {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
  }
  
  .icon {
    color: #52c41a;
    margin-right: 8px;
  }
  
  .period {
    color: #999;
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .description {
    color: #666;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  
  .anticon {
    font-size: 48px;
    color: #d9d9d9;
    margin-bottom: 16px;
  }
  
  .text {
    font-size: 16px;
    color: #999;
  }
`;

const StaffCounter = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 70px;
  perspective: 1000px;
  
  .stat-box {
    background: linear-gradient(135deg, #f8fafc, #eaf4fe);
    border-radius: 30px;
    padding: 36px 45px;
    text-align: center;
    min-width: 280px;
    box-shadow: 0 20px 40px rgba(66, 133, 244, 0.08);
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
    transform: rotateX(10deg);
    transform-style: preserve-3d;
    
    &:hover {
      transform: rotateX(0deg) translateY(-10px);
      box-shadow: 0 25px 50px rgba(66, 133, 244, 0.12);
      background: linear-gradient(135deg, #f0f7ff, #e6f1ff);
    }
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      background: rgba(66, 133, 244, 0.05);
      animation: ${morphBackground} 15s ease-in-out infinite;
    }
    
    &::before {
      width: 150px;
      height: 150px;
      top: -40px;
      left: -40px;
    }
    
    &::after {
      width: 120px;
      height: 120px;
      bottom: -30px;
      right: -30px;
    }
  }
  
  .stat-number {
    font-size: 54px;
    font-weight: 800;
    color: #4285f4;
    margin-bottom: 10px;
    text-shadow: 0 5px 10px rgba(66, 133, 244, 0.2);
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 5px;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent, #4285f4, transparent);
      border-radius: 2px;
      transform: scaleX(0.7);
      opacity: 0.3;
    }
  }
  
  .stat-text {
    font-size: 18px;
    color: #555;
    font-weight: 500;
    position: relative;
    padding-bottom: 8px;
    
    &::after {
      content: '';
      position: absolute;
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, #4285f4, rgba(66, 133, 244, 0.5));
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 3px;
    }
  }
`;

const StyledModalHeader = styled.div`
  background: ${props => `linear-gradient(135deg, ${props.bgColor || '#4285f4'}, ${props.secondaryColor || 'rgba(255, 255, 255, 0.9)'})`};
  padding: 40px;
  border-radius: 24px 24px 0 0;
  position: relative;
  overflow: hidden;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    animation: ${morphBackground} 15s ease-in-out infinite;
  }
  
  &::before {
    width: 200px;
    height: 200px;
    top: -60px;
    right: -60px;
    backdrop-filter: blur(5px);
  }
  
  &::after {
    width: 150px;
    height: 150px;
    bottom: -40px;
    left: -40px;
    backdrop-filter: blur(5px);
  }
`;

const StyledModalBody = styled.div`
  padding: 32px;
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-right: 6px;
  
  .avatar {
    border: 4px solid white;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.4s ease;
    
    &:hover {
      transform: scale(1.05) rotate(5deg);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    animation: ${ripple} 2s infinite;
    z-index: -1;
  }
`;

const StaffName = styled(Title)`
  margin: 0 !important;
  color: white !important;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 60px;
    height: 3px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 3px;
  }
`;

const StyledTabPane = styled(TabPane)`
  .ant-tabs-tab {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
    }
  }
  
  .ant-tabs-tab-active {
    font-weight: 600;
  }
`;

const InfoSection = styled.div`
  margin-bottom: 36px;
  position: relative;
  
  .section-title {
    position: relative;
    margin-bottom: 24px;
    padding-left: 18px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      background: linear-gradient(to bottom, #4285f4, #21D4FD);
      border-radius: 5px;
    }
  }
`;

const CertificateTag = styled(Tag)`
  margin: 0 8px 10px 0;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 13px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
`;

const ScrollFadeSection = styled(motion.div)`
  opacity: 0;
`;

// Thêm styled component mới cho loading state
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  background: linear-gradient(135deg, #f6f8fe 0%, #e9f1f9 100%);
`;

const LoadingTitle = styled(Title)`
  margin-top: 24px !important;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const searchRef = useRef(null);

  // Enhanced staff data with additional fields
  const staffData = [
    {
      staffId: 1,
      fullName: "Nguyễn Thị Minh Tâm",
      position: "Bác sĩ Thú y",
      specialization: "Thú y",
      description: "Bác sĩ Tâm có hơn 10 năm kinh nghiệm trong lĩnh vực thú y. Chuyên về chẩn đoán và điều trị các bệnh thường gặp ở chó, mèo và các thú cưng nhỏ.",
      avatarUrl: "/avatars/user2.png",
      email: "minhtam@petcare.com",
      phone: "0901234567",
      experience: "Tốt nghiệp Đại học Nông Lâm TP.HCM, chuyên ngành Thú y. Có chứng chỉ hành nghề thú y và từng làm việc tại các phòng khám thú y hàng đầu.",
      yearsOfExperience: 10,
      patientsTreated: 1500,
      specialties: ["Phẫu thuật nhỏ", "Chăm sóc động vật nhỏ", "Chẩn đoán hình ảnh"],
      certifications: ["Chứng chỉ hành nghề thú y", "Chuyên gia điều trị bệnh lý tiêu hóa"],
      awards: ["Bác sĩ thú y xuất sắc 2022"],
      education: [
        {
          degree: "Bác sĩ Thú y",
          institution: "Đại học Nông Lâm TP.HCM",
          year: "2013"
        }
      ],
      schedule: {
        weekdays: "8:00 - 17:00",
        weekend: "8:00 - 12:00"
      }
    },
    {
      staffId: 2,
      fullName: "Trần Văn Đức",
      position: "Bác sĩ Phẫu thuật Thú y",
      specialization: "Phẫu thuật",
      description: "Bác sĩ Đức chuyên về phẫu thuật thú cưng với hơn 8 năm kinh nghiệm. Sở hữu kỹ thuật tiên tiến trong phẫu thuật và chăm sóc hậu phẫu.",
      avatarUrl: "/avatars/user1.png",
      email: "vanduc@petcare.com",
      phone: "0912345678",
      experience: "Tốt nghiệp Thạc sĩ Thú y tại Đại học Nông Lâm Hà Nội. Từng tu nghiệp tại Singapore về phẫu thuật thú cưng và cứu hộ động vật hoang dã.",
      yearsOfExperience: 8,
      patientsTreated: 1200,
      specialties: ["Phẫu thuật thú cưng", "Phẫu thuật chỉnh hình", "Phẫu thuật tiêu hóa"],
      certifications: ["Chứng chỉ phẫu thuật thú y nâng cao", "Chứng nhận tu nghiệp Singapore"],
      awards: ["Giải thưởng phẫu thuật sáng tạo 2021"],
      education: [
        {
          degree: "Thạc sĩ Thú y",
          institution: "Đại học Nông Lâm Hà Nội",
          year: "2015"
        }
      ],
      schedule: {
        weekdays: "8:00 - 17:00",
        weekend: "Nghỉ"
      }
    },
    {
      staffId: 3,
      fullName: "Lê Thị Thanh Hương",
      position: "Chuyên viên Dinh dưỡng Thú cưng",
      specialization: "Dinh dưỡng",
      description: "Chuyên viên Hương tư vấn về chế độ dinh dưỡng cân bằng và lành mạnh cho thú cưng, giúp tăng cường sức khỏe và phòng ngừa bệnh tật.",
      avatarUrl: "/avatars/user3.png",
      email: "thanhhuong@petcare.com",
      phone: "0978123456",
      experience: "Tốt nghiệp chuyên ngành Dinh dưỡng động vật tại Đại học Nông Lâm. Có chứng chỉ tư vấn dinh dưỡng thú cưng của Hiệp hội Thú y Châu Á.",
      yearsOfExperience: 6,
      patientsTreated: 900,
      specialties: ["Dinh dưỡng cho chó mèo", "Chế độ ăn cho thú bệnh lý", "Tư vấn dinh dưỡng"],
      certifications: ["Chứng chỉ tư vấn dinh dưỡng thú cưng", "Chuyên gia dinh dưỡng thú y"],
      awards: ["Chuyên gia dinh dưỡng xuất sắc 2022"],
      education: [
        {
          degree: "Cử nhân Dinh dưỡng động vật",
          institution: "Đại học Nông Lâm",
          year: "2017"
        }
      ],
      schedule: {
        weekdays: "9:00 - 16:00",
        weekend: "9:00 - 12:00"
      }
    },
    {
      staffId: 4,
      fullName: "Phạm Minh Tuấn",
      position: "Nhân viên Grooming",
      specialization: "Làm đẹp",
      description: "Anh Tuấn có hơn 5 năm kinh nghiệm trong lĩnh vực làm đẹp cho thú cưng. Chuyên về cắt tỉa lông, tắm spa và các dịch vụ làm đẹp cho chó mèo.",
      avatarUrl: "/avatars/user4.png",
      email: "minhtuan@petcare.com",
      phone: "0987654321",
      experience: "Được đào tạo tại các trường dạy nghề grooming chuyên nghiệp. Từng đạt nhiều giải thưởng trong các cuộc thi cắt tỉa lông thú cưng.",
      yearsOfExperience: 5,
      patientsTreated: 2000,
      specialties: ["Cắt tỉa lông nghệ thuật", "Spa cho thú cưng", "Chăm sóc da và lông"],
      certifications: ["Chứng chỉ grooming chuyên nghiệp", "Kỹ thuật viên spa thú cưng"],
      awards: ["Huy chương vàng cuộc thi cắt tỉa lông nghệ thuật 2020"],
      education: [
        {
          degree: "Chứng chỉ Grooming",
          institution: "Học viện Grooming Thú cưng",
          year: "2018"
        }
      ],
      schedule: {
        weekdays: "8:00 - 18:00",
        weekend: "8:00 - 16:00"
      }
    },
    {
      staffId: 5,
      fullName: "Võ Thị Kim Ngân",
      position: "Huấn luyện viên Thú cưng",
      specialization: "Huấn luyện",
      description: "Cô Ngân là chuyên gia huấn luyện hành vi cho thú cưng, đặc biệt là chó. Cung cấp các khóa học từ cơ bản đến nâng cao giúp thú cưng ngoan ngoãn và vâng lời.",
      avatarUrl: "/avatars/user5.png",
      email: "kimngan@petcare.com",
      phone: "0932145678",
      experience: "Có chứng chỉ huấn luyện viên chó quốc tế. Đã huấn luyện hơn 500 chú chó với nhiều giống khác nhau và các vấn đề hành vi phức tạp.",
      yearsOfExperience: 7,
      patientsTreated: 500,
      specialties: ["Huấn luyện vâng lời cơ bản", "Sửa chữa hành vi", "Huấn luyện trình diễn"],
      certifications: ["Chứng chỉ huấn luyện viên chó quốc tế", "Huấn luyện viên hành vi thú cưng"],
      awards: ["Huấn luyện viên xuất sắc 2021"],
      education: [
        {
          degree: "Chứng chỉ Huấn luyện Quốc tế",
          institution: "Hiệp hội huấn luyện chó Châu Á",
          year: "2016"
        }
      ],
      schedule: {
        weekdays: "9:00 - 17:00",
        weekend: "9:00 - 15:00"
      }
    },
    {
      staffId: 6,
      fullName: "Đỗ Quang Huy",
      position: "Bác sĩ Nha khoa Thú y",
      specialization: "Nha khoa",
      description: "Bác sĩ Huy chuyên về vấn đề răng miệng của thú cưng. Sở hữu kỹ thuật hiện đại trong điều trị các bệnh răng miệng, cạo vôi răng và phẫu thuật nha khoa.",
      avatarUrl: "/avatars/user6.jpg",
      email: "quanghuy@petcare.com",
      phone: "0965432198",
      experience: "Tốt nghiệp chuyên ngành Thú y và có chứng chỉ chuyên sâu về nha khoa thú y. Từng làm việc tại các bệnh viện thú y lớn chuyên về răng miệng.",
      yearsOfExperience: 6,
      patientsTreated: 800,
      specialties: ["Nha khoa thú y", "Cạo vôi răng", "Nhổ răng và implant"],
      certifications: ["Chứng chỉ nha khoa thú y", "Chuyên gia phẫu thuật răng miệng"],
      awards: ["Bác sĩ nha khoa tiêu biểu 2023"],
      education: [
        {
          degree: "Bác sĩ Thú y - Chuyên sâu Nha khoa",
          institution: "Đại học Thú y",
          year: "2017"
        }
      ],
      schedule: {
        weekdays: "8:30 - 16:30",
        weekend: "8:30 - 11:30"
      }
    },
    {
      staffId: 7,
      fullName: "Hoàng Thị Lan Anh",
      position: "Nhân viên Chăm sóc & Lưu trú",
      specialization: "Lưu trú",
      description: "Chị Lan Anh phụ trách dịch vụ trông giữ và chăm sóc thú cưng. Đảm bảo thú cưng được chăm sóc tận tình, có môi trường sạch sẽ và hoạt động vui chơi phù hợp.",
      avatarUrl: "/avatars/user8.png",
      email: "lananh@petcare.com",
      phone: "0912378456",
      experience: "Có 7 năm kinh nghiệm chăm sóc thú cưng và quản lý dịch vụ pet hotel. Được đào tạo về cấp cứu cơ bản và xử lý tình huống khẩn cấp cho thú cưng.",
      yearsOfExperience: 7,
      patientsTreated: 3000,
      specialties: ["Quản lý pet hotel", "Chăm sóc hàng ngày", "Hoạt động vui chơi"],
      certifications: ["Chứng chỉ quản lý dịch vụ pet hotel", "Sơ cấp cứu cho thú cưng"],
      awards: ["Nhân viên xuất sắc 2022"],
      education: [
        {
          degree: "Cử nhân Quản trị Dịch vụ",
          institution: "Đại học Kinh tế",
          year: "2016"
        }
      ],
      schedule: {
        weekdays: "7:00 - 19:00",
        weekend: "7:00 - 19:00"
      }
    },
    {
      staffId: 8,
      fullName: "Nguyễn Văn Thành",
      position: "Bác sĩ Siêu âm & Chẩn đoán hình ảnh",
      specialization: "Chẩn đoán",
      description: "Bác sĩ Thành chuyên về siêu âm và chẩn đoán hình ảnh cho thú cưng. Giúp phát hiện sớm các vấn đề sức khỏe bên trong cơ thể mà không can thiệp xâm lấn.",
      avatarUrl: "/avatars/user7.png",
      email: "vanthanh@petcare.com",
      phone: "0976123987",
      experience: "Tốt nghiệp Thạc sĩ Thú y và có chứng chỉ chuyên sâu về chẩn đoán hình ảnh. Đã công tác tại các bệnh viện thú y lớn trong và ngoài nước.",
      yearsOfExperience: 9,
      patientsTreated: 1800,
      specialties: ["Siêu âm", "X-quang", "CT scan"],
      certifications: ["Thạc sĩ Thú y", "Chuyên gia chẩn đoán hình ảnh"],
      awards: ["Bác sĩ chẩn đoán xuất sắc 2020"],
      education: [
        {
          degree: "Thạc sĩ Thú y",
          institution: "Đại học Nông Lâm",
          year: "2014"
        }
      ],
      schedule: {
        weekdays: "8:00 - 17:00",
        weekend: "8:00 - 11:00"
      }
    }
  ];

  // Thêm hooks cho scroll animations
  const [staffSectionRef, staffSectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    // Giả lập việc lấy dữ liệu
    const fetchStaff = async () => {
      try {
        setLoading(true);
        // Giả lập thời gian tải
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStaffList(staffData);
        setError(null);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Không thể tải danh sách nhân viên. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
    
    // Animation for search input focus
    if (searchRef.current) {
      setTimeout(() => {
        searchRef.current.focus();
      }, 2000);
    }
  }, []);

  // Lọc nhân viên theo tên hoặc chuyên môn
  const filteredStaff = staffList.filter(staff =>
    staff.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    staff.specialization.toLowerCase().includes(filter.toLowerCase()) ||
    staff.position.toLowerCase().includes(filter.toLowerCase())
  );

  // Xử lý show modal chi tiết
  const handleShowDetails = (staff) => {
    setSelectedStaff(staff);
    setShowModal(true);
  };

  // Xử lý đặt lịch
  const handleBooking = (staffId) => {
    const staff = staffList.find(s => s.staffId === staffId);
    message.success({
      content: `Đã gửi yêu cầu đặt lịch với ${staff?.fullName}. Chúng tôi sẽ liên hệ lại sớm!`,
      duration: 5,
      icon: <CalendarOutlined style={{ color: '#52c41a' }} />
    });
    setShowModal(false);
  };

  // Render map for specialization colors
  const specializationColors = {
    'Thú y': '#1890ff',
    'Phẫu thuật': '#f5222d',
    'Dinh dưỡng': '#52c41a',
    'Làm đẹp': '#722ed1',
    'Huấn luyện': '#fa8c16',
    'Nha khoa': '#eb2f96',
    'Lưu trú': '#faad14',
    'Chẩn đoán': '#13c2c2'
  };

  // Render map for specialization icons
  const specializationIcons = {
    'Thú y': <MedicineBoxOutlined />,
    'Phẫu thuật': <MedicineBoxOutlined />,
    'Dinh dưỡng': <MedicineBoxOutlined />,
    'Làm đẹp': <HeartOutlined />,
    'Huấn luyện': <StarOutlined />,
    'Nha khoa': <MedicineBoxOutlined />,
    'Lưu trú': <HeartOutlined />,
    'Chẩn đoán': <MedicineBoxOutlined />
  };

  if (loading) {
    return (
      <LoadingContainer>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Spin size="large" tip="Đang tải..." />
          <LoadingTitle level={3}>
            Đang tải thông tin đội ngũ chuyên gia
          </LoadingTitle>
          <Paragraph style={{ textAlign: 'center', color: '#888' }}>
            Vui lòng đợi trong giây lát...
          </Paragraph>
        </motion.div>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <MainContainer style={{ marginTop: 40 }}>
        <Alert
          message="Lỗi khi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      </MainContainer>
    );
  }

  return (
    <>
      {/* Header Section */}
      <StyledHeader>
        <MainContainer>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <HeaderTitle level={1} className="text-center">
              Đội Ngũ Chuyên Gia Thú Cưng
            </HeaderTitle>
            <SubTitle className="text-center">
              Với đội ngũ bác sĩ thú y và nhân viên chăm sóc giàu kinh nghiệm, chúng tôi cam kết mang đến dịch vụ chăm sóc tận tình và chuyên nghiệp cho thú cưng của bạn
            </SubTitle>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ maxWidth: 600, margin: '40px auto 0' }}
            >
              <StyledSearchInput 
                prefix={<SearchOutlined />} 
                placeholder="Tìm kiếm theo tên hoặc chuyên môn..." 
                onChange={(e) => setFilter(e.target.value)}
                value={filter}
                size="large"
                ref={searchRef}
              />
            </motion.div>
          </motion.div>
        </MainContainer>
      </StyledHeader>

      {/* Animated Staff Counter */}
      <motion.div
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
      >
        <StaffCounter>
          <div className="stat-box">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="stat-number">{staffList.length}</div>
              <div className="stat-text">Chuyên Gia Thú Cưng</div>
            </motion.div>
          </div>
        </StaffCounter>
      </motion.div>

      <MainContainer>
        {/* Staff Section with Scroll Animation */}
        <ScrollFadeSection
          ref={staffSectionRef}
          animate={staffSectionInView ? 
            { opacity: 1, y: 0, transition: { duration: 0.8 } } : 
            { opacity: 0, y: 50 }
          }
        >
          <div style={{ marginBottom: 40 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={staffSectionInView ? 
                { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } } : 
                { opacity: 0, x: -30 }
              }
            >
              <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
                Gặp gỡ đội ngũ chuyên gia
              </Title>
              <Paragraph 
                style={{ 
                  textAlign: 'center', 
                  fontSize: 16, 
                  maxWidth: 800, 
                  margin: '0 auto 40px',
                  color: '#666'
                }}
              >
                Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng chăm sóc và phục vụ thú cưng của bạn với tất cả tình yêu và chuyên môn
              </Paragraph>
            </motion.div>
          </div>

          {/* Staff Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={staffSectionInView ? "visible" : "hidden"}
            className="staff-grid"
          >
            <Row gutter={[32, 32]}>
              {filteredStaff.map((staff) => (
                <Col xs={24} sm={12} md={8} lg={6} key={staff.staffId}>
                  <motion.div 
                    variants={itemVariants}
                    whileHover="hover"
                  >
                    <StyledCard
                      cover={
                        <div style={{ position: 'relative', height: 280 }}>
                          <img
                            alt={staff.fullName}
                            src={staff.avatarUrl}
                          />
                          <div style={{ position: 'absolute', left: 20, bottom: 20, zIndex: 10, color: 'white', textAlign: 'left', transform: 'translateY(10px)', opacity: 0, transition: 'all 0.4s ease', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, position: 'relative' }}>
                              {staff.fullName}
                              <div style={{ position: 'absolute', bottom: -6, left: 0, width: 40, height: 3, background: 'white', borderRadius: 3 }} />
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 10 }}>{staff.position}</div>
                          </div>
                          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '8px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-10px)', opacity: 0, transition: 'all 0.4s ease 0.1s' }}>
                            <ClockCircleOutlined style={{ color: '#4285f4' }} />
                            <span style={{ fontWeight: 700, color: '#4285f4', marginLeft: 6 }}>{staff.yearsOfExperience} năm kinh nghiệm</span>
                          </div>
                          <StyledBadge 
                            count={staff.specialization} 
                            color={specializationColors[staff.specialization] || '#4285f4'} 
                            secondaryColor={
                              staff.specialization === 'Thú y' ? '#36C5F0' :
                              staff.specialization === 'Phẫu thuật' ? '#E01E5A' :
                              staff.specialization === 'Dinh dưỡng' ? '#2EB67D' :
                              staff.specialization === 'Làm đẹp' ? '#9333EA' :
                              '#1890ff'
                            }
                          />
                        </div>
                      }
                      hoverable
                    >
                      <Meta
                        title={staff.fullName}
                        description={staff.position}
                      />
                      
                      <StaffDescription>{staff.description}</StaffDescription>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <StyledTag 
                          background={`linear-gradient(135deg, ${specializationColors[staff.specialization]}, 
                            ${staff.specialization === 'Thú y' ? '#36C5F0' :
                              staff.specialization === 'Phẫu thuật' ? '#E01E5A' :
                              staff.specialization === 'Dinh dưỡng' ? '#2EB67D' :
                              staff.specialization === 'Làm đẹp' ? '#9333EA' :
                              '#0063e6'})`
                          }
                        >
                          {specializationIcons[staff.specialization]} {staff.specialization}
                        </StyledTag>
                      </motion.div>
                      
                      <CardActionContainer>
                        <DetailButton 
                          icon={<InfoCircleOutlined />}
                          onClick={() => handleShowDetails(staff)}
                        >
                          Chi tiết
                        </DetailButton>
                        
                        <BookingButton 
                          icon={<CalendarOutlined />}
                          onClick={() => handleBooking(staff.staffId)}
                          color={`linear-gradient(90deg, ${specializationColors[staff.specialization]}, 
                            ${staff.specialization === 'Thú y' ? '#36C5F0' :
                              staff.specialization === 'Phẫu thuật' ? '#E01E5A' :
                              staff.specialization === 'Dinh dưỡng' ? '#2EB67D' :
                              staff.specialization === 'Làm đẹp' ? '#9333EA' :
                              '#4285f4'})`
                          }
                        >
                          Đặt lịch
                        </BookingButton>
                      </CardActionContainer>
                    </StyledCard>
                  </motion.div>
                </Col>
              ))}
            </Row>
            
            {filteredStaff.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <EmptyState>
                  <UserOutlined />
                  <div className="text">Không tìm thấy nhân viên phù hợp với tiêu chí tìm kiếm</div>
                  <Button 
                    type="primary" 
                    style={{ marginTop: 16 }}
                    onClick={() => setFilter('')}
                  >
                    Xem tất cả nhân viên
                  </Button>
                </EmptyState>
              </motion.div>
            )}
          </motion.div>
        </ScrollFadeSection>
      </MainContainer>

      {/* Staff Detail Modal */}
      <Modal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={900}
        centered
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        <AnimatePresence>
          {selectedStaff && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
            >
              <StyledModalHeader 
                bgColor={specializationColors[selectedStaff.specialization]}
                secondaryColor={
                  selectedStaff.specialization === 'Thú y' ? '#36C5F0' :
                  selectedStaff.specialization === 'Phẫu thuật' ? '#E01E5A' :
                  selectedStaff.specialization === 'Dinh dưỡng' ? '#2EB67D' :
                  selectedStaff.specialization === 'Làm đẹp' ? '#9333EA' :
                  '#4285f4'
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <AvatarContainer>
                    <Avatar 
                      src={selectedStaff.avatarUrl} 
                      size={100} 
                      className="avatar"
                    />
                  </AvatarContainer>
                  <div>
                    <StaffName level={2}>
                      {selectedStaff.fullName}
                    </StaffName>
                    <div style={{ marginTop: 16 }}>
                      <StyledTag 
                        color="#fff" 
                        style={{ 
                          color: specializationColors[selectedStaff.specialization],
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '14px',
                          padding: '6px 16px',
                          fontWeight: 600
                        }}
                      >
                        {specializationIcons[selectedStaff.specialization]} {selectedStaff.specialization}
                      </StyledTag>
                    </div>
                  </div>
                </div>
              </StyledModalHeader>
              
              <StyledModalBody>
                <Tabs defaultActiveKey="1" animated={{ inkBar: true, tabPane: true }}>
                  <StyledTabPane tab={<span><UserOutlined /> Thông tin chung</span>} key="1">
                    <Row gutter={[32, 32]}>
                      <Col xs={24} md={12}>
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <StyledModalImage 
                            src={selectedStaff.avatarUrl} 
                            alt={selectedStaff.fullName} 
                          />
                          
                          <InfoSection>
                            <Title level={4} className="section-title">Thống kê</Title>
                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <StaffStatItem>
                                  <ClockCircleOutlined className="icon" />
                                  <div className="title">Kinh nghiệm</div>
                                  <div className="value">{selectedStaff.yearsOfExperience} năm</div>
                                </StaffStatItem>
                              </Col>
                              <Col span={12}>
                                <StaffStatItem>
                                  <TeamOutlined className="icon" />
                                  <div className="title">Đã phục vụ</div>
                                  <div className="value">{selectedStaff.patientsTreated}+</div>
                                </StaffStatItem>
                              </Col>
                            </Row>
                          </InfoSection>
                          
                          <InfoSection>
                            <Title level={4} className="section-title">Thông tin liên hệ</Title>
                            <ContactInfo>
                              <MailOutlined />
                              <Text>{selectedStaff.email}</Text>
                            </ContactInfo>
                            <ContactInfo>
                              <PhoneOutlined />
                              <Text>{selectedStaff.phone}</Text>
                            </ContactInfo>
                            <ContactInfo>
                              <ClockCircleOutlined />
                              <div>
                                <div>T2-T6: {selectedStaff.schedule.weekdays}</div>
                                <div>T7-CN: {selectedStaff.schedule.weekend}</div>
                              </div>
                            </ContactInfo>
                          </InfoSection>
                        </motion.div>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <motion.div
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          <InfoSection>
                            <Title level={4} className="section-title">Giới thiệu</Title>
                            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                              {selectedStaff.description}
                            </Paragraph>
                          </InfoSection>
                          
                          <InfoSection>
                            <Title level={4} className="section-title">Chuyên môn</Title>
                            <div style={{ marginBottom: 16 }}>
                              {selectedStaff.specialties.map((specialty, index) => (
                                <CertificateTag 
                                  color={specializationColors[selectedStaff.specialization]}
                                  key={index}
                                >
                                  <SafetyCertificateOutlined /> {specialty}
                                </CertificateTag>
                              ))}
                            </div>
                          </InfoSection>
                          
                          <InfoSection>
                            <Title level={4} className="section-title">Trình độ học vấn</Title>
                            {selectedStaff.education.map((edu, index) => (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                                key={index}
                              >
                                <ExperienceItem>
                                  <div className="title">
                                    <IdcardOutlined className="icon" /> {edu.degree}
                                  </div>
                                  <div className="period">{edu.institution} - {edu.year}</div>
                                </ExperienceItem>
                              </motion.div>
                            ))}
                          </InfoSection>
                          
                          <InfoSection>
                            <Title level={4} className="section-title">Chứng chỉ</Title>
                            {selectedStaff.certifications.map((cert, index) => (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                                key={index}
                              >
                                <ExperienceItem>
                                  <div className="title">
                                    <SafetyCertificateOutlined className="icon" /> {cert}
                                  </div>
                                </ExperienceItem>
                              </motion.div>
                            ))}
                          </InfoSection>
                          
                          {selectedStaff.awards.length > 0 && (
                            <InfoSection>
                              <Title level={4} className="section-title">Giải thưởng</Title>
                              {selectedStaff.awards.map((award, index) => (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                                  key={index}
                                >
                                  <ExperienceItem>
                                    <div className="title">
                                      <TrophyOutlined className="icon" style={{ color: '#faad14' }} /> {award}
                                    </div>
                                  </ExperienceItem>
                                </motion.div>
                              ))}
                            </InfoSection>
                          )}
                        </motion.div>
                      </Col>
                    </Row>
                  </StyledTabPane>
                  
                  <TabPane tab={<span><SolutionOutlined /> Kinh nghiệm</span>} key="2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                        {selectedStaff.experience}
                      </Paragraph>
                    </motion.div>
                  </TabPane>
                </Tabs>
                
                <ModalFooter>
                  <Button 
                    onClick={() => setShowModal(false)} 
                    size="large"
                    style={{ padding: '0 24px', height: '42px' }}
                  >
                    Đóng
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<CalendarOutlined />}
                    onClick={() => handleBooking(selectedStaff.staffId)}
                    style={{ 
                      background: `linear-gradient(90deg, ${specializationColors[selectedStaff.specialization]}, 
                        ${selectedStaff.specialization === 'Thú y' ? '#36C5F0' :
                          selectedStaff.specialization === 'Phẫu thuật' ? '#E01E5A' :
                          selectedStaff.specialization === 'Dinh dưỡng' ? '#2EB67D' :
                          selectedStaff.specialization === 'Làm đẹp' ? '#9333EA' :
                          '#4285f4'})`,
                      border: 'none',
                      padding: '0 28px',
                      height: '44px',
                      borderRadius: '12px',
                      boxShadow: `0 8px 20px rgba(0, 0, 0, 0.15)`,
                      fontSize: '16px',
                      fontWeight: '600',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>
                      Đặt lịch với {selectedStaff.fullName.split(' ').pop()}
                    </span>
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      transform: 'translateX(-100%)',
                      transition: 'transform 0.6s ease',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }} className="button-shine" />
                  </Button>
                </ModalFooter>
              </StyledModalBody>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
};

export default StaffPage;