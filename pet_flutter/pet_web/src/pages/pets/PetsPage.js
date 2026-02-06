import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Row, Col, Typography, Button, Input, Empty, 
  Card, Spin, Alert, Pagination, Select, Space,
  Divider, Badge, notification, App
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, FilterOutlined, 
  AppstoreOutlined, BarsOutlined, SortAscendingOutlined,
  ReloadOutlined, PieChartOutlined
} from '@ant-design/icons';
import petService from '../../services/petService';
import PetCard from '../../components/pets/PetCard';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto 80px;
  padding: 0 24px;
`;

const HeaderSection = styled.div`
  margin-bottom: 32px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 0;
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #1890ff 0%, #69c0ff 100%);
    border-radius: 2px;
  }
`;

const ActionButton = styled(Button)`
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  border-radius: 8px;
  
  &.ant-btn-primary {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  }
`;

const StyledSearch = styled(Input.Search)`
  .ant-input {
    height: 44px;
    border-radius: 8px;
    padding-left: 16px;
  }
  
  .ant-input-search-button {
    height: 44px;
    border-radius: 0 8px 8px 0 !important;
    width: 60px;
  }
`;

const FilterCard = styled(Card)`
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  border: none;
  
  .ant-card-head {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .ant-card-head-title {
    font-weight: 600;
  }
  
  .ant-card-body {
    padding-top: 12px;
  }
`;

const ControlBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StyledSelect = styled(Select)`
  min-width: 180px;
  
  .ant-select-selector {
    height: 44px !important;
    border-radius: 8px !important;
    display: flex;
    align-items: center;
  }
  
  .ant-select-selection-item {
    font-weight: 500;
  }
`;

const StyledDivider = styled(Divider)`
  margin: 16px 0;
`;

const ViewToggle = styled.div`
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .toggle-btn {
    height: 44px;
    border: none;
    
    &:first-child {
      border-radius: 8px 0 0 8px;
    }
    
    &:last-child {
      border-radius: 0 8px 8px 0;
    }
    
    &.active {
      background-color: #1890ff;
      color: white;
    }
  }
`;

const EmptyContainer = styled.div`
  margin: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  .ant-empty {
    margin-bottom: 24px;
  }
  
  .ant-typography {
    max-width: 500px;
  }
`;

const StyledPagination = styled(Pagination)`
  margin-top: 48px;
  text-align: center;
  
  .ant-pagination-item-active {
    background-color: #1890ff;
    border-color: #1890ff;
    
    a {
      color: white;
    }
  }
`;

const StatsSection = styled.div`
  margin-bottom: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const StatCard = styled(Card)`
  flex: 1;
  min-width: 180px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: none;
  overflow: hidden;
  
  .ant-card-body {
    padding: 20px;
  }
  
  .stat-icon {
    margin-bottom: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${props => props.$color || '#1890ff'};
    color: white;
    font-size: 24px;
    box-shadow: 0 4px 10px ${props => props.$shadowColor || 'rgba(24, 144, 255, 0.2)'};
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 4px;
    background: ${props => props.$gradient || 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const PetsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');
  const [stats, setStats] = useState({
    total: 0,
    dogs: 0,
    cats: 0,
    other: 0
  });
  
  const [sort, setSort] = useState('newest');
  const [filter, setFilter] = useState('all');
  
  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0
  });
  
  // Load pets when component mounts
  useEffect(() => {
    loadPets();
  }, [pagination.current, sort, filter]);
  
  // Show notification if redirected with message
  useEffect(() => {
    if (location.state?.message) {
      notification.success({
        message: 'Thành công',
        description: location.state.message,
        placement: 'topRight',
        duration: 4
      });
      
      // Clear message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location]);
  
  const loadPets = async () => {
    try {
      setLoading(true);
      
      // Sử dụng API đúng từ petService
      const data = await petService.getUserPets();
      
      // Kiểm tra dữ liệu trả về
      if (Array.isArray(data)) {
        // Áp dụng filter và sort
        let filteredData = [...data];
        
        // Áp dụng filter
        if (filter !== 'all') {
          filteredData = filteredData.filter(pet => {
            if (filter === 'dogs') return pet.species?.toLowerCase() === 'chó';
            if (filter === 'cats') return pet.species?.toLowerCase() === 'mèo';
            return true;
          });
        }
        
        // Áp dụng sort
        if (sort === 'newest') {
          filteredData.sort((a, b) => new Date(b.createdAt || b.dateAdded || 0) - new Date(a.createdAt || a.dateAdded || 0));
        } else if (sort === 'oldest') {
          filteredData.sort((a, b) => new Date(a.createdAt || a.dateAdded || 0) - new Date(b.createdAt || b.dateAdded || 0));
        } else if (sort === 'name') {
          filteredData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        
        // Áp dụng phân trang
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setPets(paginatedData);
        setPagination({
          ...pagination,
          total: filteredData.length
        });
        
        // Calculate stats
        const totalPets = data.length;
        const dogs = data.filter(pet => pet.species?.toLowerCase() === 'chó').length;
        const cats = data.filter(pet => pet.species?.toLowerCase() === 'mèo').length;
        const other = totalPets - dogs - cats;
        
        setStats({
          total: totalPets,
          dogs,
          cats,
          other
        });
      } else {
        throw new Error('Dữ liệu không hợp lệ');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading pets:', err);
      setError('Không thể tải danh sách thú cưng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    loadPets();
  };
  
  const handleDelete = async (petId) => {
    try {
      await petService.deletePet(petId);
      notification.success({
        message: 'Xóa thành công',
        description: 'Thú cưng đã được xóa khỏi hệ thống',
        placement: 'topRight'
      });
      loadPets();
    } catch (err) {
      console.error('Error deleting pet:', err);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa thú cưng. Vui lòng thử lại sau.',
        placement: 'topRight'
      });
    }
  };
  
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      current: page
    });
  };
  
  const renderPets = () => {
    if (pets.length === 0) {
      return (
        <EmptyContainer>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={null}
          />
          <Title level={4}>Không tìm thấy thú cưng</Title>
          <Text type="secondary">
            Bạn chưa có thú cưng nào trong hệ thống. Hãy thêm thú cưng để quản lý thông tin, lịch tiêm phòng, và đặt lịch khám bệnh dễ dàng.
          </Text>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            style={{ marginTop: 24 }}
            onClick={() => navigate('/pets/add')}
          >
            Thêm thú cưng mới
          </Button>
        </EmptyContainer>
      );
    }
    
    return (
      <AnimatePresence>
        <Row gutter={[24, 24]}>
          {pets.map((pet) => (
            <Col 
              xs={24} 
              sm={view === 'grid' ? 12 : 24} 
              md={view === 'grid' ? 8 : 24} 
              lg={view === 'grid' ? 6 : 24} 
              key={pet.petId}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                layout
              >
                <PetCard pet={pet} onDelete={handleDelete} />
              </motion.div>
            </Col>
          ))}
        </Row>
      </AnimatePresence>
    );
  };
  
  return (
    <App>
      <PageContainer>
        <HeaderSection>
          <Title level={2} style={{ marginBottom: 8, fontWeight: 600 }}>
            Thú cưng của bạn
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Quản lý thông tin và lịch sử chăm sóc sức khỏe cho thú cưng
          </Text>
        </HeaderSection>
        
        <StatsSection>
          <StatCard
            $color="#1890ff"
            $shadowColor="rgba(24, 144, 255, 0.2)"
            $gradient="linear-gradient(135deg, #1890ff 0%, #096dd9 100%)"
          >
            <div className="stat-icon">
              <PieChartOutlined />
            </div>
            <div className="stat-value">{stats.total}</div>
            <Text type="secondary">Tổng số thú cưng</Text>
          </StatCard>
          
          <StatCard
            $color="#52c41a"
            $shadowColor="rgba(82, 196, 26, 0.2)"
            $gradient="linear-gradient(135deg, #52c41a 0%, #389e0d 100%)"
          >
            <div className="stat-icon" style={{ background: '#52c41a' }}>
              <span role="img" aria-label="dog">🐕</span>
            </div>
            <div className="stat-value">{stats.dogs}</div>
            <Text type="secondary">Chó</Text>
          </StatCard>
          
          <StatCard
            $color="#eb2f96"
            $shadowColor="rgba(235, 47, 150, 0.2)"
            $gradient="linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)"
          >
            <div className="stat-icon" style={{ background: '#eb2f96' }}>
              <span role="img" aria-label="cat">🐈</span>
            </div>
            <div className="stat-value">{stats.cats}</div>
            <Text type="secondary">Mèo</Text>
          </StatCard>
          
          <StatCard
            $color="#722ed1"
            $shadowColor="rgba(114, 46, 209, 0.2)"
            $gradient="linear-gradient(135deg, #722ed1 0%, #531dab 100%)"
          >
            <div className="stat-icon" style={{ background: '#722ed1' }}>
              <span role="img" aria-label="other">🐾</span>
            </div>
            <div className="stat-value">{stats.other}</div>
            <Text type="secondary">Khác</Text>
          </StatCard>
        </StatsSection>
        
        <FilterCard title={<Space><FilterOutlined /> Bộ lọc và tìm kiếm</Space>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={14}>
              <StyledSearch
                placeholder="Tìm kiếm theo tên, giống..."
                enterButton={<SearchOutlined />}
                size="large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>
            
            <Col xs={24} md={12} lg={10}>
              <Space size={16} style={{ width: '100%', justifyContent: 'flex-end' }}>
                <StyledSelect
                  defaultValue="all"
                  onChange={(value) => setFilter(value)}
                  size="large"
                >
                  <Option value="all">Tất cả thú cưng</Option>
                  <Option value="dog">Chó</Option>
                  <Option value="cat">Mèo</Option>
                  <Option value="other">Khác</Option>
                </StyledSelect>
                
                <Link to="/pets/add">
                  <ActionButton type="primary" icon={<PlusOutlined />}>
                    Thêm mới
                  </ActionButton>
                </Link>
              </Space>
            </Col>
          </Row>
          
          <StyledDivider />
          
          <ControlBar>
            <Space>
              <Text>Sắp xếp theo:</Text>
              <StyledSelect
                defaultValue="newest"
                onChange={(value) => setSort(value)}
                size="large"
                style={{ minWidth: 160 }}
              >
                <Option value="newest">
                  <Space>
                    <SortAscendingOutlined />
                    <span>Mới nhất</span>
                  </Space>
                </Option>
                <Option value="oldest">
                  <Space>
                    <SortAscendingOutlined style={{ transform: 'rotate(180deg)' }} />
                    <span>Cũ nhất</span>
                  </Space>
                </Option>
                <Option value="name">Tên A-Z</Option>
              </StyledSelect>
            </Space>
            
            <ViewToggle>
              <Button 
                className={view === 'grid' ? 'toggle-btn active' : 'toggle-btn'}
                icon={<AppstoreOutlined />} 
                onClick={() => setView('grid')}
              />
              <Button 
                className={view === 'list' ? 'toggle-btn active' : 'toggle-btn'}
                icon={<BarsOutlined />} 
                onClick={() => setView('list')}
              />
            </ViewToggle>
          </ControlBar>
        </FilterCard>
        
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
            action={
              <Button 
                size="small" 
                type="primary" 
                onClick={loadPets}
                icon={<ReloadOutlined />}
              >
                Thử lại
              </Button>
            }
          />
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Đang tải danh sách thú cưng...</Text>
            </div>
          </div>
        ) : (
          renderPets()
        )}
        
        {pets.length > 0 && (
          <StyledPagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        )}
      </PageContainer>
    </App>
  );
};

export default PetsPage;