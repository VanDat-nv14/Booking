import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Upload,
  Image,
  Tooltip,
  Alert,
  Typography,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  TagsOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PictureOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import categoryService from '../../services/categoryService';
import styled from 'styled-components';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;

// Styled Components
const CategoryManagementContainer = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
  
  .page-header {
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      
      .header-icon {
        color: #1890ff;
        font-size: 24px;
      }
      
      h1 {
        margin: 0;
        color: #262626;
      }
    }
    
    .header-description {
      color: #8c8c8c;
      margin-bottom: 24px;
    }
  }
  
  .stats-container {
    margin-bottom: 24px;
    
    .ant-card {
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .ant-statistic-title {
        color: #8c8c8c;
        font-weight: 500;
      }
      
      &.total-categories .ant-statistic-content {
        color: #1890ff;
      }
      
      &.active-categories .ant-statistic-content {
        color: #52c41a;
      }
      
      &.inactive-categories .ant-statistic-content {
        color: #ff4d4f;
      }
    }
  }
  
  .actions-bar {
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .search-input {
      width: 300px;
    }
  }
  
  .categories-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
    }
    
    .category-image {
      border-radius: 4px;
    }
    
    .category-name {
      font-weight: 600;
      color: #262626;
    }
    
    .category-description {
      color: #8c8c8c;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
`;

const CategoryModal = styled(Modal)`
  .ant-modal-header {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
    
    .ant-modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .ant-modal-body {
    padding: 24px;
  }
  
  .form-section {
    margin-bottom: 24px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .upload-container {
    .ant-upload {
      width: 120px;
      height: 120px;
      border-radius: 8px;
    }
    
    .ant-upload-select-picture-card {
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      
      &:hover {
        border-color: #1890ff;
      }
    }
  }
`;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  
  // State cho confirm delete modal
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories(true); // Include inactive
      setCategories(data);
      
      // Calculate stats
      const activeCount = data.filter(cat => cat.isActive).length;
      const inactiveCount = data.filter(cat => !cat.isActive).length;
      setStats({
        total: data.length,
        active: activeCount,
        inactive: inactiveCount
      });
      
      message.success('Tải danh sách danh mục thành công');
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search and show inactive
  useEffect(() => {
    let filtered = categories;
    
    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter(cat => cat.isActive);
    }
    
    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredCategories(filtered);
  }, [categories, searchText, showInactive]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle create/update category
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const categoryData = {
        name: values.name,
        description: values.description || '',
        imageUrl: values.imageUrl || '',
        isActive: values.isActive !== false
      };

      if (editingCategory) {
        // Update category
        await categoryService.updateCategory(editingCategory.categoryId, categoryData);
        message.success('Cập nhật danh mục thành công');
      } else {
        // Create new category
        await categoryService.createCategory(categoryData);
        message.success('Tạo danh mục mới thành công');
      }
      
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      message.error(editingCategory ? 'Không thể cập nhật danh mục' : 'Không thể tạo danh mục mới');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete category - theo cách ServiceManagement
  const handleDelete = (category) => {
    console.log('🚀 CategoryManagement handleDelete called with category:', category);
    setConfirmDelete(category);
  };
  
  // Xác nhận xóa danh mục
  const confirmDeleteCategory = async () => {
    if (!confirmDelete) return;
    
    console.log('🟢 User confirmed category deletion');
    try {
      await categoryService.deleteCategory(confirmDelete.categoryId);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Không thể xóa danh mục');
    } finally {
      setConfirmDelete(null);
    }
  };

  // Open create modal
  const handleCreate = () => {
    setEditingCategory(null);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      isActive: true
    });
  };

  // Open edit modal
  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalVisible(true);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: category.isActive
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl, record) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={record.name}
              width={60}
              height={60}
              className="category-image"
              fallback="/api/placeholder/60/60"
            />
          ) : (
            <div style={{
              width: 60,
              height: 60,
              background: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PictureOutlined style={{ color: '#bfbfbf', fontSize: 20 }} />
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="category-name">{text}</span>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Tooltip title={text}>
          <span className="category-description">{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <Tag color="blue" icon={<AppstoreOutlined />}>
          {count || 0}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (isActive) => (
        <Tag 
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? 'success' : 'error'}
        >
          {isActive ? 'Hoạt động' : 'Đã ẩn'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => {
                console.log('🔥 CATEGORY DELETE CLICKED! Record:', record);
                console.log('🔥 Event:', e);
                e.stopPropagation();
                e.preventDefault();
                handleDelete(record);
              }}
              style={{ 
                pointerEvents: 'auto',
                zIndex: 1001
              }}
            />
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <CategoryManagementContainer>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-title">
          <TagsOutlined className="header-icon" />
          <Title level={2}>Quản lý danh mục</Title>
        </div>
        <Text className="header-description">
          Quản lý danh mục sản phẩm, tạo mới, chỉnh sửa và xóa danh mục
        </Text>
        
        {/* Statistics */}
        <Row gutter={[16, 16]} className="stats-container">
          <Col xs={24} sm={8}>
            <Card className="total-categories">
              <Statistic
                title="Tổng danh mục"
                value={stats.total}
                prefix={<TagsOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="active-categories">
              <Statistic
                title="Đang hoạt động"
                value={stats.active}
                prefix={<EyeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="inactive-categories">
              <Statistic
                title="Đã ẩn"
                value={stats.inactive}
                prefix={<EyeInvisibleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Input
                placeholder="Tìm kiếm danh mục..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCategories}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Switch
                checkedChildren="Hiện tất cả"
                unCheckedChildren="Chỉ hiện hoạt động"
                checked={showInactive}
                onChange={setShowInactive}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Thêm danh mục
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Categories Table */}
      <Card className="categories-table">
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="categoryId"
          loading={loading}
          pagination={{
            total: filteredCategories.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} danh mục`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <CategoryModal
        title={
          <span>
            <TagsOutlined />
            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </span>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="form-section">
            <div className="section-title">
              <TagsOutlined />
              Thông tin cơ bản
            </div>
            
            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên danh mục' },
                { max: 100, message: 'Tên danh mục không được vượt quá 100 ký tự' }
              ]}
            >
              <Input placeholder="Nhập tên danh mục..." />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { max: 500, message: 'Mô tả không được vượt quá 500 ký tự' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Nhập mô tả danh mục..." 
              />
            </Form.Item>
          </div>

          <div className="form-section">
            <div className="section-title">
              <PictureOutlined />
              Hình ảnh danh mục
            </div>
            
            <Form.Item
              label="URL Hình ảnh"
              name="imageUrl"
              rules={[
                { type: 'url', message: 'Vui lòng nhập URL hợp lệ' },
                { max: 255, message: 'URL không được vượt quá 255 ký tự' }
              ]}
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
          </div>

          <Divider />

          <Form.Item
            label="Trạng thái"
            name="isActive"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Ẩn" 
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  setEditingCategory(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                {editingCategory ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </CategoryModal>

      {/* Modal xác nhận xóa danh mục */}
      {confirmDelete && (
        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>Xác nhận xóa danh mục</span>
            </Space>
          }
          open={true}
          onCancel={() => setConfirmDelete(null)}
          footer={[
            <Button key="cancel" onClick={() => setConfirmDelete(null)}>
              Hủy
            </Button>,
            <Button 
              key="delete" 
              type="primary" 
              danger
              loading={loading}
              onClick={confirmDeleteCategory}
            >
              Xóa danh mục
            </Button>
          ]}
          width={500}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '16px', margin: '20px 0' }}>
              Bạn có chắc chắn muốn xóa danh mục <strong>"{confirmDelete.name}"</strong>?
            </p>
            <p style={{ color: '#8c8c8c' }}>
              Danh mục sẽ bị ẩn khỏi hệ thống. Bạn vẫn có thể khôi phục sau này.
            </p>
          </div>
        </Modal>
      )}
    </CategoryManagementContainer>
  );
};

export default CategoryManagement; 
