import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Avatar,
  Select,
  Input,
  Tabs,
  Tag,
  Badge,
  Button,
  Alert,
  Divider,
  Skeleton,
  Tooltip,
  Empty,
  Space,
  Spin,
  Progress
} from 'antd';
import {
  MedicineBoxOutlined,
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  BellOutlined,
  ExperimentOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  ArrowRightOutlined,
  MedicineBoxFilled,
  EditOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { format } from 'date-fns';
import medicalRecordService from '../services/medicalRecordService';
import petService from '../services/petService';
import useAuth from '../hooks/useAuth';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { Content } = Layout;

// Keyframes for animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40%, 100% {
    background-position: 140px;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Enhanced styled components
const StyledHeader = styled.div`
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  border-radius: 20px;
  padding: 50px;
  margin-bottom: 32px;
  position: relative;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out forwards;
  
  &::before {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(24, 144, 255, 0.15), transparent 70%);
    z-index: 0;
  }
  
  &::after {
    content: "";
    position: absolute;
    left: 20%;
    bottom: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(82, 196, 26, 0.15), transparent 70%);
    z-index: 0;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const StyledCard = styled.div`
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid #f0f0f0;
  background: white;
  animation: ${fadeInUp} 0.6s ease-out forwards;
  animation-delay: ${props => props.delay || '0s'};
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    background-color: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-body {
    padding: 28px 24px;
  }
`;

const AnimatedTag = styled.div`
  display: inline-block;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const StyledBadge = styled(Badge)`
  .ant-badge-dot {
    width: 12px;
    height: 12px;
    box-shadow: 0 0 0 3px #fff;
  }
`;

const StyledTag = styled(Tag)`
  border-radius: 20px;
  font-weight: 600;
  padding: 5px 14px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: auto;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &.active-tag {
    color: #52c41a;
    background: #f6ffed;
    border-color: #b7eb8f;
  }
  
  &.expired-tag {
    color: #f5222d;
    background: #fff1f0;
    border-color: #ffa39e;
  }
  
  &.upcoming-tag {
    color: #1890ff;
    background: #e6f7ff;
    border-color: #91d5ff;
  }
  
  &:hover {
    transform: scale(1.05);
  }
`;

const InfoItem = styled.div`
  margin-bottom: 24px;
  
  .label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 10px;
    font-size: 15px;
  }
  
  .content {
    color: #595959;
    padding-left: 32px;
    line-height: 1.7;
    font-size: 14px;
    position: relative;
    
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 2px;
      background: linear-gradient(to bottom, #1890ff, #52c41a);
      border-radius: 2px;
    }
  }
`;

const StyledAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #1890ff, #52c41a);
  color: white;
  font-size: 36px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    transform: scale(1.05) rotate(5deg);
  }
`;

const StyledTabPane = styled(TabPane)`
  padding: 24px 0;
`;

const EmptyWrapper = styled.div`
  text-align: center;
  padding: 60px 0;
  background: linear-gradient(135deg, #f9f9f9, #f5f5f5);
  border-radius: 16px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.03);
  animation: ${fadeInUp} 0.8s ease-out forwards;
`;

const PetSelectorWrapper = styled.div`
  margin-top: 30px;
  
  .ant-select {
    width: 100%;
  }
  
  .ant-select-selector {
    border-radius: 16px !important;
    border: 2px solid rgba(24, 144, 255, 0.2) !important;
    height: 60px !important;
    padding: 0 20px !important;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s ease !important;
  }
  
  .ant-select-selector:hover {
    border-color: rgba(24, 144, 255, 0.4) !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
  }
  
  .ant-select-focused .ant-select-selector {
    border-color: #1890ff !important;
    box-shadow: 0 8px 20px rgba(24, 144, 255, 0.15) !important;
  }
  
  .ant-select-selection-item {
    display: flex;
    align-items: center;
    line-height: 56px !important;
  }
  
  .pet-option {
    display: flex;
    align-items: center;
    padding: 12px 0;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateX(5px);
    }
  }
  
  .pet-info {
    margin-left: 15px;
  }
  
  .pet-name {
    font-weight: 600;
    line-height: 1.3;
    font-size: 15px;
  }
  
  .pet-breed {
    font-size: 13px;
    color: #8c8c8c;
    margin-top: 2px;
  }
`;

const StyledAlert = styled(Alert)`
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 15px 20px;
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 30px;
  }
  
  .ant-tabs-tab {
    padding: 14px 24px;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    border-radius: 12px;
    margin-right: 12px;
    position: relative;
    overflow: hidden;
  }
  
  .ant-tabs-tab::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.05), rgba(24, 144, 255, 0));
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .ant-tabs-tab:hover::before {
    opacity: 1;
  }
  
  .ant-tabs-tab-active {
    font-weight: 600;
    background-color: #e6f7ff;
  }
  
  .ant-tabs-tab:hover {
    color: #1890ff;
  }
  
  .ant-tabs-ink-bar {
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(90deg, #1890ff, #52c41a);
  }
`;

const CardExtra = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #8c8c8c;
  
  .date-info {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.02);
    padding: 5px 10px;
    border-radius: 12px;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .avatar-wrapper {
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.1) rotate(5deg);
    }
  }
  
  .title-text {
    font-weight: 600;
    font-size: 16px;
    line-height: 1.4;
    color: #262626;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 12px;
  height: 42px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &.ant-btn-primary {
    background: linear-gradient(135deg, #1890ff, #096dd9);
    border: none;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%);
      transform: rotate(30deg);
      animation: ${shine} 3s infinite linear;
      pointer-events: none;
    }
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const AddPetButton = styled(Button)`
  border-radius: 50px;
  height: 54px;
  font-weight: 600;
  font-size: 16px;
  padding: 0 32px;
  box-shadow: 0 10px 20px rgba(24, 144, 255, 0.25);
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    background: linear-gradient(135deg, #40a9ff, #1890ff);
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 15px 25px rgba(24, 144, 255, 0.35);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const StaffWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #f0f0f0;
  
  .staff-avatar {
    background: linear-gradient(135deg, #e6f7ff, #bae7ff);
    box-shadow: 0 3px 8px rgba(24, 144, 255, 0.15);
  }
  
  .staff-info {
    margin-left: 10px;
    font-size: 13px;
    color: #8c8c8c;
  }
`;

const ActionButtonsWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-size: 13px;
  height: 34px;
  padding: 0 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const StatsCard = styled.div`
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${props => props.gradient || '#fafafa, #f5f5f5'});
  color: ${props => props.color || '#262626'};
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out forwards;
  animation-delay: ${props => props.delay || '0s'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
    color: inherit;
  }
  
  p {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 0;
    color: inherit;
  }
  
  .stats-icon {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 32px;
    opacity: 0.6;
  }
  
  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, 30%);
  }
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
  border: none;
  box-shadow: 0 5px 25px rgba(24, 144, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  font-size: 24px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${fadeInUp} 0.3s ease-out forwards;
  
  &:hover {
    transform: scale(1.1) rotate(10deg);
    box-shadow: 0 8px 35px rgba(24, 144, 255, 0.6);
    animation: ${pulse} 1.5s infinite;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const AnimatedSearchButton = styled.div`
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const TabsContainer = styled.div`
  animation: ${fadeInUp} 0.8s ease-out forwards;
`;

// Helper functions
const getPetAvatarUrl = (pet) => {
  if (!pet) return null;
  if (pet.avatarUrl) return pet.avatarUrl;
  
  // Default avatar based on species
  if (pet.species?.toLowerCase() === 'dog') {
    return '/images/avatars/dog_avatar.png';
  } else if (pet.species?.toLowerCase() === 'cat') {
    return '/images/avatars/cat_avatar.png';
  }
  return '/images/avatars/pet_avatar.png';
};

const getStatusTag = (date) => {
  if (!date) return { status: 'default', text: 'Không có ngày hết hạn' };
  const today = new Date();
  const expiryDate = new Date(date);
  
  if (expiryDate > today) {
    return { status: 'active-tag', text: 'Còn hiệu lực', icon: <CheckCircleOutlined /> };
  }
  return { status: 'expired-tag', text: 'Đã hết hạn', icon: <WarningOutlined /> };
};

const calculateDaysRemaining = (date) => {
  if (!date) return null;
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pets, setPets] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddButton, setShowAddButton] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy danh sách thú cưng của người dùng
        const petsData = await petService.getUserPets();
        setPets(petsData);
        
        // Nếu có thú cưng, chọn thú cưng đầu tiên và lấy dữ liệu
        if (petsData && petsData.length > 0) {
          setSelectedPet(petsData[0]);
          
          try {
            // Lấy hồ sơ y tế của thú cưng đầu tiên
            const medicalData = await medicalRecordService.getPetMedicalRecords(petsData[0].petId);
            setMedicalRecords(medicalData || []);
            
            // Lấy lịch sử tiêm chủng
            try {
              const vaccinationData = await medicalRecordService.getPetVaccinations(petsData[0].petId);
              setVaccinations(vaccinationData || []);
            } catch (vaccErr) {
              console.log("Vaccination API might not be available:", vaccErr);
              setVaccinations([]);
            }
            
            // Lấy nhắc nhở chăm sóc
            try {
              const reminderData = await medicalRecordService.getPetCareReminders(petsData[0].petId);
              setReminders(reminderData || []);
            } catch (remErr) {
              console.log("Reminders API might not be available:", remErr);
              setReminders([]);
            }
          } catch (medErr) {
            console.error("Error fetching medical data:", medErr);
            setError('Có lỗi xảy ra khi lấy hồ sơ y tế');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(typeof err === 'string' ? err : 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Listen to scroll events to show/hide floating action button
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowAddButton(true);
      } else {
        setShowAddButton(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handlePetChange = async (petId) => {
    const pet = pets.find(p => p.petId === parseInt(petId));
    setSelectedPet(pet);
    setLoading(true);
    
    try {
      // Lấy hồ sơ y tế của thú cưng được chọn
      const medicalData = await medicalRecordService.getPetMedicalRecords(petId);
      setMedicalRecords(medicalData || []);
      
      // Lấy lịch sử tiêm chủng nếu API có sẵn
      try {
        const vaccinationData = await medicalRecordService.getPetVaccinations(petId);
        setVaccinations(vaccinationData || []);
      } catch (err) {
        console.log("Vaccination data might not be available:", err);
        setVaccinations([]);
      }
      
      // Lấy nhắc nhở chăm sóc nếu API có sẵn
      try {
        const reminderData = await medicalRecordService.getPetCareReminders(petId);
        setReminders(reminderData || []);
      } catch (err) {
        console.log("Reminder data might not be available:", err);
        setReminders([]);
      }
    } catch (err) {
      console.error('Error fetching pet data:', err);
      setError(typeof err === 'string' ? err : 'Có lỗi xảy ra khi tải dữ liệu thú cưng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredMedicalRecords = medicalRecords.filter(record => 
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.treatment && record.treatment.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get upcoming reminders
  const upcomingReminders = reminders.filter(reminder => 
    reminder.status !== "Completed" && 
    new Date(reminder.reminderDate) > new Date()
  );

  // Get active vaccinations count
  const activeVaccinations = vaccinations.filter(vaccination => 
    vaccination.expiryDate && new Date(vaccination.expiryDate) > new Date()
  );

  // Hiển thị skeleton khi đang loading
  if (loading) {
    return (
      <Content style={{ padding: '32px 50px', maxWidth: 1200, margin: '0 auto' }}>
        <Skeleton active avatar paragraph={{ rows: 4 }} style={{ marginBottom: 32 }} />
        
        <Skeleton.Input active style={{ width: '100%', height: 60, marginBottom: 32, borderRadius: 16 }} />
        
        <Row gutter={[24, 24]}>
          {[1, 2, 3, 4].map((item) => (
            <Col xs={24} sm={24} md={12} key={item}>
              <Skeleton 
                active 
                paragraph={{ rows: 6 }} 
                style={{ 
                  borderRadius: 16, 
                  padding: 24, 
                  background: '#fafafa', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                }} 
              />
            </Col>
          ))}
        </Row>
      </Content>
    );
  }

  return (
    <Content style={{ padding: '32px 50px', maxWidth: 1300, margin: '0 auto' }}>
      <StyledHeader>
        <HeaderContent>
          <Row align="middle" gutter={20}>
            <Col>
              <StyledAvatar>
                <SafetyCertificateOutlined style={{ fontSize: 36 }} />
              </StyledAvatar>
            </Col>
            <Col flex="1">
              <Title level={2} style={{ margin: 0, color: '#262626', fontSize: 30, fontWeight: 700 }}>
                Hồ sơ y tế thú cưng
              </Title>
              <Paragraph style={{ margin: '12px 0 0', color: '#595959', fontSize: 16, maxWidth: 600 }}>
                Quản lý và theo dõi lịch sử y tế, tiêm chủng và lịch chăm sóc thú cưng của bạn
              </Paragraph>
            </Col>
          </Row>
          
          {/* Pet Stats overview when pets are available */}
          {pets.length > 0 && selectedPet && (
            <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
              <Col xs={24} sm={8}>
                <StatsCard 
                  gradient="#e6f7ff, #bae7ff" 
                  color="#0050b3"
                  delay="0.1s"
                >
                  <div className="stats-icon"><MedicineBoxFilled /></div>
                  <h3>Hồ sơ y tế</h3>
                  <p>{medicalRecords.length}</p>
                  <div style={{ marginTop: 12 }}>
                    {medicalRecords.length > 0 && (
                      <Text style={{ color: 'inherit', opacity: 0.8 }}>
                        Lần khám gần nhất: {format(new Date(medicalRecords[0].recordDate), 'dd/MM/yyyy')}
                      </Text>
                    )}
                  </div>
                </StatsCard>
              </Col>
              <Col xs={24} sm={8}>
                <StatsCard 
                  gradient="#f6ffed, #d9f7be" 
                  color="#237804"
                  delay="0.2s"
                >
                  <div className="stats-icon"><SafetyCertificateOutlined /></div>
                  <h3>Tiêm chủng</h3>
                  <p>{vaccinations.length}</p>
                  <div style={{ marginTop: 12 }}>
                    <Text style={{ color: 'inherit', opacity: 0.8 }}>
                      Còn hiệu lực: {activeVaccinations.length} / {vaccinations.length}
                    </Text>
                    {activeVaccinations.length > 0 && (
                      <Progress 
                        percent={Math.round((activeVaccinations.length / vaccinations.length) * 100)} 
                        size="small" 
                        showInfo={false}
                        strokeColor="#52c41a"
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                </StatsCard>
              </Col>
              <Col xs={24} sm={8}>
                <StatsCard 
                  gradient="#fff7e6, #ffe7ba" 
                  color="#ad6800"
                  delay="0.3s"
                >
                  <div className="stats-icon"><BellOutlined /></div>
                  <h3>Nhắc nhở</h3>
                  <p>{upcomingReminders.length}</p>
                  <div style={{ marginTop: 12 }}>
                    {upcomingReminders.length > 0 && (
                      <Text style={{ color: 'inherit', opacity: 0.8 }}>
                        Sắp tới: {upcomingReminders[0].title}
                      </Text>
                    )}
                  </div>
                </StatsCard>
              </Col>
            </Row>
          )}
          
          {/* Chọn thú cưng */}
          {pets.length > 0 && (
            <PetSelectorWrapper>
              <Select
                value={selectedPet?.petId || undefined}
                onChange={handlePetChange}
                placeholder="Chọn thú cưng của bạn"
                optionLabelProp="label"
                dropdownStyle={{ borderRadius: 16 }}
                suffixIcon={<UserOutlined style={{ fontSize: 16, color: '#1890ff' }} />}
              >
                {pets.map((pet) => (
                  <Option 
                    key={pet.petId} 
                    value={pet.petId}
                    label={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <StyledBadge dot offset={[-4, 36]}>
                          <Avatar 
                            src={getPetAvatarUrl(pet)} 
                            size={40} 
                            icon={<UserOutlined />}
                            style={{ border: '2px solid #fff', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}
                          />
                        </StyledBadge>
                        <span style={{ marginLeft: 14, fontWeight: 600, fontSize: 15 }}>{pet.name}</span>
                      </div>
                    }
                  >
                    <div className="pet-option">
                      <Avatar 
                        src={getPetAvatarUrl(pet)} 
                        size={46} 
                        icon={<UserOutlined />}
                        style={{ border: '2px solid #fff', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}
                      />
                      <div className="pet-info">
                        <div className="pet-name">{pet.name}</div>
                        <div className="pet-breed">
                          {pet.species === 'Dog' ? 'Chó' : pet.species === 'Cat' ? 'Mèo' : pet.species}
                          {pet.breed ? ` • ${pet.breed}` : ''}
                        </div>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </PetSelectorWrapper>
          )}
        </HeaderContent>
      </StyledHeader>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <StyledAlert 
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 32 }}
          action={
            <StyledButton type="primary" onClick={() => window.location.reload()}>
              Thử lại
            </StyledButton>
          }
        />
      )}

      {pets.length === 0 ? (
        <EmptyWrapper>
          <Empty
            image="/images/pet-empty.svg"
            imageStyle={{ height: 200 }}
            description={
              <Space direction="vertical" size={20}>
                <Title level={3} style={{ margin: '16px 0 0', fontWeight: 700 }}>
                  Bạn chưa có thú cưng nào
                </Title>
                <Paragraph style={{ maxWidth: 650, margin: '0 auto', fontSize: 16, color: '#595959', lineHeight: 1.8 }}>
                  Vui lòng thêm thú cưng của bạn trước khi sử dụng tính năng hồ sơ y tế. 
                  Việc này sẽ giúp bạn theo dõi lịch sử khám chữa bệnh và chăm sóc thú cưng hiệu quả hơn.
                </Paragraph>
              </Space>
            }
          >
            <div style={{ transition: 'all 0.3s ease' }} className="hover-scale">
              <AddPetButton 
                type="primary" 
                icon={<PlusOutlined />} 
                size="large"
                onClick={() => window.location.href = '/pets/add'}
              >
                Thêm thú cưng
              </AddPetButton>
            </div>
          </Empty>
        </EmptyWrapper>
      ) : (
        <TabsContainer>
          <StyledTabs 
            activeKey={activeTab} 
            onChange={handleTabChange}
            type="card"
            size="large"
          >
            <StyledTabPane 
              tab={
                <span>
                  <MedicineBoxOutlined /> Hồ sơ y tế
                  {medicalRecords.length > 0 && (
                    <Tag color="blue" style={{ marginLeft: 10, borderRadius: 12, fontWeight: 600 }}>
                      {medicalRecords.length}
                    </Tag>
                  )}
                </span>
              } 
              key="1"
            >
              <Space direction="vertical" size={30} style={{ width: '100%' }}>
                <Search
                  placeholder="Tìm kiếm theo chẩn đoán, điều trị hoặc ghi chú..."
                  allowClear
                  enterButton={
                    <AnimatedSearchButton>
                      <><SearchOutlined /> Tìm kiếm</>
                    </AnimatedSearchButton>
                  }
                  size="large"
                  onSearch={handleSearch}
                  style={{ borderRadius: 12 }}
                />

                {filteredMedicalRecords.length === 0 ? (
                  <StyledAlert
                    message="Không tìm thấy hồ sơ y tế"
                    description={
                      <div>
                        <p>Không tìm thấy hồ sơ y tế nào cho thú cưng này.</p>
                        <Link to="/medical-records/add">
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            style={{ marginTop: 16, borderRadius: 8 }}
                          >
                            Thêm hồ sơ y tế
                          </Button>
                        </Link>
                      </div>
                    }
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined style={{ fontSize: 24 }} />}
                  />
                ) : (
                  <Row gutter={[24, 24]}>
                    {filteredMedicalRecords.map((record, index) => (
                      <Col xs={24} sm={24} md={12} key={record.recordId}>
                        <StyledCard delay={`${0.1 * index}s`}>
                          <div className="card-header">
                            <CardTitle>
                              <div className="avatar-wrapper">
                                <Avatar 
                                  icon={<HeartOutlined />} 
                                  style={{ 
                                    backgroundColor: '#f9f0ff', 
                                    color: '#722ed1',
                                    boxShadow: '0 4px 12px rgba(114, 46, 209, 0.2)',
                                    width: 42,
                                    height: 42,
                                    fontSize: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }} 
                                />
                              </div>
                              <span className="title-text">{record.diagnosis}</span>
                            </CardTitle>
                            <CardExtra>
                              <div className="date-info">
                                <CalendarOutlined />
                                <span>{record.recordDate ? format(new Date(record.recordDate), 'dd/MM/yyyy') : 'Không có ngày'}</span>
                              </div>
                            </CardExtra>
                          </div>
                          <div className="card-body">
                            {record.treatment && (
                              <InfoItem>
                                <div className="label">
                                  <ExperimentOutlined /> Điều trị
                                </div>
                                <div className="content">{record.treatment}</div>
                              </InfoItem>
                            )}
                            
                            {record.prescription && (
                              <InfoItem>
                                <div className="label">
                                  <FileTextOutlined /> Kê đơn
                                </div>
                                <div className="content">{record.prescription}</div>
                              </InfoItem>
                            )}
                            
                            {record.notes && (
                              <InfoItem>
                                <div className="label">
                                  <InfoCircleOutlined /> Ghi chú
                                </div>
                                <div className="content">{record.notes}</div>
                              </InfoItem>
                            )}
                            
                            <Divider style={{ margin: '20px 0' }} />
                            
                            <Space wrap>
                              {record.nextVisit && (
                                <Tooltip title="Ngày tái khám">
                                  <AnimatedTag>
                                    <StyledTag 
                                      className={getStatusTag(record.nextVisit).status}
                                      icon={<CalendarOutlined />}
                                    >
                                      Tái khám: {format(new Date(record.nextVisit), 'dd/MM/yyyy')}
                                      {calculateDaysRemaining(record.nextVisit) > 0 && (
                                        <span style={{ marginLeft: 5, fontSize: 12, opacity: 0.8 }}>
                                          (còn {calculateDaysRemaining(record.nextVisit)} ngày)
                                        </span>
                                      )}
                                    </StyledTag>
                                  </AnimatedTag>
                                </Tooltip>
                              )}
                            </Space>
                            
                            
                            
                            {record.staffName && (
                              <StaffWrapper>
                                <Avatar 
                                  size="small" 
                                  icon={<UserOutlined />} 
                                  className="staff-avatar" 
                                />
                                <div className="staff-info">
                                  Bác sĩ phụ trách: <Text strong>{record.staffName}</Text>
                                </div>
                              </StaffWrapper>
                            )}
                          </div>
                        </StyledCard>
                      </Col>
                    ))}
                  </Row>
                )}
              </Space>
            </StyledTabPane>
            
            {vaccinations.length > 0 && (
              <StyledTabPane 
                tab={
                  <span>
                    <SafetyCertificateOutlined /> Tiêm chủng
                    <Tag color="green" style={{ marginLeft: 10, borderRadius: 12, fontWeight: 600 }}>
                      {vaccinations.length}
                    </Tag>
                  </span>
                } 
                key="2"
              >
                <Row gutter={[24, 24]}>
                  {vaccinations.map((vaccination, index) => (
                    <Col xs={24} sm={24} md={12} key={vaccination.vaccinationId}>
                      <StyledCard delay={`${0.1 * index}s`}>
                        <div className="card-header">
                          <CardTitle>
                            <div className="avatar-wrapper">
                              <Avatar 
                                icon={<SafetyCertificateOutlined />} 
                                style={{ 
                                  backgroundColor: '#e6f7ff', 
                                  color: '#1890ff',
                                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.2)',
                                  width: 42,
                                  height: 42,
                                  fontSize: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }} 
                              />
                            </div>
                            <span className="title-text">{vaccination.vaccineName}</span>
                          </CardTitle>
                          <CardExtra>
                            <div className="date-info">
                              <CalendarOutlined />
                              <span>{format(new Date(vaccination.vaccineDate), 'dd/MM/yyyy')}</span>
                            </div>
                          </CardExtra>
                        </div>
                        <div className="card-body">
                          {vaccination.expiryDate && (
                            <InfoItem>
                              <div className="label">
                                <ClockCircleOutlined /> Ngày hết hạn
                              </div>
                              <div className="content">
                                {format(new Date(vaccination.expiryDate), 'dd/MM/yyyy')}
                                {calculateDaysRemaining(vaccination.expiryDate) > 0 && (
                                  <div style={{ marginTop: 8, fontSize: 13 }}>
                                    <Progress 
                                      percent={Math.min(100, Math.max(0, calculateDaysRemaining(vaccination.expiryDate) / 3.65))} 
                                      size="small"
                                      strokeColor={{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                      }}
                                      format={() => `${calculateDaysRemaining(vaccination.expiryDate)} ngày`}
                                    />
                                  </div>
                                )}
                              </div>
                              
                              <div style={{ marginTop: 16 }}>
                                <StyledTag 
                                  className={getStatusTag(vaccination.expiryDate).status}
                                  icon={getStatusTag(vaccination.expiryDate).icon}
                                >
                                  {getStatusTag(vaccination.expiryDate).text}
                                </StyledTag>
                              </div>
                            </InfoItem>
                          )}
                          
                          {vaccination.notes && (
                            <InfoItem>
                              <div className="label">
                                <InfoCircleOutlined /> Ghi chú
                              </div>
                              <div className="content">{vaccination.notes}</div>
                            </InfoItem>
                          )}
                          
                          <ActionButtonsWrapper>
                            <ActionButton type="default" icon={<EditOutlined />}>
                              Chỉnh sửa
                            </ActionButton>
                            <ActionButton type="default" icon={<PrinterOutlined />}>
                              In chứng nhận
                            </ActionButton>
                          </ActionButtonsWrapper>
                          
                          {vaccination.administeredByName && (
                            <StaffWrapper>
                              <Avatar 
                                size="small" 
                                icon={<UserOutlined />} 
                                className="staff-avatar" 
                              />
                              <div className="staff-info">
                                Bác sĩ tiêm chủng: <Text strong>{vaccination.administeredByName}</Text>
                              </div>
                            </StaffWrapper>
                          )}
                        </div>
                      </StyledCard>
                    </Col>
                  ))}
                </Row>
              </StyledTabPane>
            )}
            
            {reminders.length > 0 && (
              <StyledTabPane 
                tab={
                  <span>
                    <BellOutlined /> Nhắc nhở chăm sóc
                    <Tag color="orange" style={{ marginLeft: 10, borderRadius: 12, fontWeight: 600 }}>
                      {reminders.length}
                    </Tag>
                  </span>
                } 
                key="3"
              >
                <Row gutter={[24, 24]}>
                  {reminders.map((reminder, index) => (
                    <Col xs={24} sm={24} md={12} key={reminder.reminderId}>
                      <StyledCard delay={`${0.1 * index}s`}>
                        <div className="card-header">
                          <CardTitle>
                            <div className="avatar-wrapper">
                              <Avatar 
                                icon={<BellOutlined />} 
                                style={{ 
                                  backgroundColor: '#fff7e6', 
                                  color: '#fa8c16',
                                  boxShadow: '0 4px 12px rgba(250, 140, 22, 0.2)',
                                  width: 42,
                                  height: 42,
                                  fontSize: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }} 
                              />
                            </div>
                            <span className="title-text">{reminder.title}</span>
                          </CardTitle>
                          <CardExtra>
                            <div className="date-info">
                              <CalendarOutlined />
                              <span>{format(new Date(reminder.reminderDate), 'dd/MM/yyyy')}</span>
                            </div>
                          </CardExtra>
                        </div>
                        <div className="card-body">
                          {reminder.description && (
                            <InfoItem>
                              <div className="label">
                                <FileTextOutlined /> Mô tả
                              </div>
                              <div className="content">{reminder.description}</div>
                            </InfoItem>
                          )}
                          
                          {calculateDaysRemaining(reminder.reminderDate) > 0 && (
                            <InfoItem>
                              <div className="label">
                                <ClockCircleOutlined /> Thời gian còn lại
                              </div>
                              <div className="content">
                                <div style={{ marginTop: 8, fontSize: 13 }}>
                                  <Progress 
                                    percent={Math.min(100, 100 - Math.max(0, calculateDaysRemaining(reminder.reminderDate) / 0.3))} 
                                    size="small"
                                    strokeColor={{
                                      '0%': '#108ee9',
                                      '100%': '#87d068',
                                    }}
                                    format={() => `${calculateDaysRemaining(reminder.reminderDate)} ngày`}
                                  />
                                </div>
                              </div>
                            </InfoItem>
                          )}
                          
                          <Space wrap style={{ marginTop: 20 }}>
                            {reminder.status && (
                              <AnimatedTag>
                                <StyledTag 
                                  className={reminder.status === "Completed" ? "expired-tag" : "active-tag"}
                                  icon={reminder.status === "Completed" ? <CheckCircleOutlined /> : <BellOutlined />}
                                >
                                  {reminder.status === "Completed" ? "Đã hoàn thành" : "Đang hoạt động"}
                                </StyledTag>
                              </AnimatedTag>
                            )}
                            
                            {reminder.frequency && (
                              <AnimatedTag>
                                <StyledTag 
                                  className="upcoming-tag"
                                  icon={<ClockCircleOutlined />}
                                >
                                  {reminder.frequency}
                                </StyledTag>
                              </AnimatedTag>
                            )}
                          </Space>
                          
                          <ActionButtonsWrapper>
                            <ActionButton type="default" icon={<EditOutlined />}>
                              Chỉnh sửa
                            </ActionButton>
                            {reminder.status !== "Completed" && (
                              <ActionButton type="primary" icon={<CheckCircleOutlined />}>
                                Đánh dấu hoàn thành
                              </ActionButton>
                            )}
                          </ActionButtonsWrapper>
                        </div>
                      </StyledCard>
                    </Col>
                  ))}
                </Row>
              </StyledTabPane>
            )}
          </StyledTabs>
        </TabsContainer>
      )}
      
      {/* Floating Action Button */}
      {showAddButton && (
        <FloatingActionButton 
          onClick={() => window.location.href = '/medical-records/add'}
        >
          <PlusOutlined />
        </FloatingActionButton>
      )}
    </Content>
  );
};

export default MedicalRecordsPage;