import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import axiosClient from '../../utils/axiosClient';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  TagOutlined,
  DollarOutlined,
  ShopOutlined,
  InboxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  SaveOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  LoadingOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined
} from '@ant-design/icons';
import { 
  Table,
  Button,
  Input,
  Select,
  Form,
  InputNumber,
  Upload,
  Typography,
  Space,
  Divider,
  Card,
  Tag,
  Modal,
  message,
  Badge,
  Spin,
  Image,
  Tooltip,
  Row,
  Col
} from 'antd';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

// Keyframes 
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const ProductManagementContainer = styled.div`
  width: 100%;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.04);
  animation: ${fadeIn} 0.5s ease;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  .ant-input-affix-wrapper {
    width: 300px;
  @media (max-width: 768px) {
    width: 100%;
    }
  }
  
  .ant-select {
    min-width: 180px;
    @media (max-width: 768px) {
    width: 100%;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  flex-direction: column;
  }
`;

const StyledCard = styled(Card)`
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
  
  .ant-card-body {
    padding: 24px;
  }
  
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
      border-radius: 8px;
        overflow: hidden;
`;

const ProductStatus = styled(Tag)`
  padding: 4px 8px;
  border-radius: 4px;
    font-weight: 500;
    font-size: 12px;
`;

const EmptyStateWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  padding: 60px 0;
  text-align: center;
  background: #f9fafc;
      border-radius: 8px;
  border: 1px dashed #d9d9d9;
  margin: 20px 0;
  
  .anticon {
    font-size: 48px;
    color: #1890ff;
    margin-bottom: 16px;
  }
`;

const ProductManagement = () => {
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // State cho quản lý nhiều ảnh
  const [productImages, setProductImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  // State cho categories
  const [categories, setCategories] = useState([]);
  
  // State cho confirm delete modal
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Fallback danh sách danh mục
  // Xóa fallback categories hardcoded

  // Lấy URL đầy đủ của hình ảnh
  const getImageUrl = (photoPath) => {
    if (!photoPath) return 'https://via.placeholder.com/150x150?text=No+Image';
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    if (photoPath.startsWith('/')) {
      return `https://localhost:7164${photoPath}`;
    }
    
    return `https://localhost:7164/uploads/products/${photoPath}`;
  };

  // Tải lên hình ảnh sản phẩm
  const uploadProductImage = async (productId, imageFile) => {
    try {
      setUploading(true);
      
      const imageData = new FormData();
      imageData.append('file', imageFile);
      
      try {
        const uploadResponse = await axiosClient.post(
          `/Products/${productId}/upload-image`, 
          imageData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        return uploadResponse.data;
      } catch (firstErr) {
        const uploadResponse = await axiosClient.post(
          `/Products/${productId}/upload-image`, 
          imageData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        return uploadResponse.data;
      }
    } catch (err) {
      console.error('Lỗi khi tải lên ảnh:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Upload nhiều ảnh sản phẩm
  const uploadMultipleProductImages = async (productId, imageFiles) => {
    try {
      setUploadingImages(true);
      const uploadPromises = imageFiles.map(async (file) => {
        try {
          return await productService.uploadProductImages(productId, [file]);
        } catch (error) {
          console.error(`Lỗi upload ảnh ${file.name}:`, error);
          throw error;
        }
      });
      
      await Promise.all(uploadPromises);
      message.success('Upload tất cả ảnh thành công');
    } catch (error) {
      console.error('Lỗi upload nhiều ảnh:', error);
      message.error('Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploadingImages(false);
    }
  };

  // Lấy danh sách ảnh sản phẩm
  const fetchProductImages = async (productId) => {
    try {
      const images = await productService.getProductImages(productId);
      setProductImages(images || []);
      return images || [];
    } catch (error) {
      console.error('Lỗi lấy danh sách ảnh:', error);
      setProductImages([]);
      return [];
    }
  };

  // Xóa ảnh sản phẩm
  const deleteProductImage = async (productId, imageId) => {
    Modal.confirm({
      title: 'Xóa ảnh sản phẩm',
      content: 'Bạn có chắc chắn muốn xóa ảnh này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await productService.deleteProductImage(productId, imageId);
          // Refresh danh sách ảnh
          await fetchProductImages(productId);
          message.success('Xóa ảnh thành công');
        } catch (error) {
          console.error('Lỗi xóa ảnh:', error);
          message.error('Có lỗi xảy ra khi xóa ảnh');
        }
      }
    });
  };

  // Đặt ảnh chính
  const setPrimaryImage = async (productId, imageId) => {
    Modal.confirm({
      title: 'Đặt ảnh chính',
      content: 'Bạn có muốn đặt ảnh này làm ảnh chính của sản phẩm không?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      icon: <StarOutlined style={{ color: '#faad14' }} />,
      onOk: async () => {
        try {
          await productService.setPrimaryProductImage(productId, imageId);
          // Refresh danh sách ảnh
          await fetchProductImages(productId);
          message.success({
            content: 'Đã đặt ảnh chính thành công!',
            icon: <StarFilled style={{ color: '#faad14' }} />
          });
        } catch (error) {
          console.error('Lỗi đặt ảnh chính:', error);
          message.error('Có lỗi xảy ra khi đặt ảnh chính');
        }
      }
    });
  };

  // Tải dữ liệu categories từ API
  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories(true); // Include inactive
      const categoryNames = categoriesData.map(cat => cat.name);
      setCategories(categoryNames);
    } catch (err) {
      console.error('Lỗi khi tải categories:', err);
      message.error('Không thể tải danh mục. Vui lòng thử lại sau.');
      setCategories([]); // Không sử dụng fallback nữa
    }
  };

  // Tải dữ liệu sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let response;
      try {
        // Admin có thể xem tất cả sản phẩm bao gồm cả những sản phẩm đã ẩn
        response = await axiosClient.get('/Products?includeInactive=true');
      } catch (apiError) {
        response = await axiosClient.get('/Products?includeInactive=true');
      }
      
      setProducts(response.data);
      setError(null);
      message.success('Đã tải danh sách sản phẩm thành công');
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách sản phẩm');    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu sản phẩm và categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Xử lý thêm sản phẩm mới
  const handleAdd = () => {
    setCurrentProduct(null);
    setImageUrl('');
    setImageFile(null);
    setImageFiles([]);
    setProductImages([]);
    form.resetFields();
    setIsModalVisible(true);
  };
  // Xử lý chỉnh sửa sản phẩm
  const handleEdit = async (product) => {
    setCurrentProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      stockQuantity: product.stockQuantity
    });
    setImageUrl(product.photo ? getImageUrl(product.photo) : '');
    setImageFile(null);
    setImageFiles([]);
    
    // Lấy danh sách ảnh sản phẩm khi edit
    if (product.productId) {
      await fetchProductImages(product.productId);
    }
    
    setIsModalVisible(true);
  };

  // Xử lý xóa sản phẩm - theo cách ServiceManagement
  const handleDelete = (product) => {
    console.log('🚀 handleDelete called with product:', product);
    setConfirmDelete(product);
  };
  
  // Xác nhận xóa sản phẩm
  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return;
    
    console.log('🟢 User confirmed deletion');
    try {
      // Hiển thị thông báo đang xóa
      message.loading({ content: 'Đang xử lý...', key: 'deleteProduct', duration: 0 });
      
      console.log(`Xóa sản phẩm: ${confirmDelete.productId} - ${confirmDelete.name}`);
      
      // Thử xóa bằng fetch API thay vì sử dụng productService
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7164/api/Products/${confirmDelete.productId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Lỗi xóa sản phẩm (HTTP ${response.status})`);
      }
      
      // Cập nhật UI khi xóa thành công - reload danh sách từ server
      message.success({ content: 'Đã ẩn sản phẩm thành công', key: 'deleteProduct', duration: 2 });
      
      // Reload toàn bộ danh sách sản phẩm từ server
      await fetchProducts();
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
      message.error({ 
        content: `Lỗi: ${err.message || 'Không thể xóa sản phẩm'}`, 
        key: 'deleteProduct' 
      });
    } finally {
      setConfirmDelete(null);
    }
  };
  // Xử lý lưu sản phẩm
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        brand: values.brand || '',
        stockQuantity: values.stockQuantity,
        photo: currentProduct?.photo || ''
      };
      
      if (currentProduct) {
        // Cập nhật sản phẩm
        try {
          await axiosClient.put(`/Products/${currentProduct.productId}`, productData);
          
          // Upload ảnh chính nếu có
          if (imageFile) {
            await uploadProductImage(currentProduct.productId, imageFile);
          }
          
          // Upload nhiều ảnh nếu có
          if (imageFiles.length > 0) {
            await uploadMultipleProductImages(currentProduct.productId, imageFiles);
          }
          
          message.success('Cập nhật sản phẩm thành công');
        } catch (err) {
          await axiosClient.put(`/Products/${currentProduct.productId}`, productData);
          
          if (imageFile) {
            await uploadProductImage(currentProduct.productId, imageFile);
          }
          
          if (imageFiles.length > 0) {
            await uploadMultipleProductImages(currentProduct.productId, imageFiles);
          }
          
          message.success('Cập nhật sản phẩm thành công');
        }
      } else {
        // Tạo sản phẩm mới
        try {
          const response = await axiosClient.post('/Products', productData);
          
          // Upload ảnh chính nếu có
          if (imageFile && response.data.productId) {
            await uploadProductImage(response.data.productId, imageFile);
          }
          
          // Upload nhiều ảnh nếu có
          if (imageFiles.length > 0 && response.data.productId) {
            await uploadMultipleProductImages(response.data.productId, imageFiles);
          }
          
          message.success('Thêm sản phẩm mới thành công');
        } catch (err) {
          const response = await axiosClient.post('/Products', productData);
          
          if (imageFile && response.data.productId) {
            await uploadProductImage(response.data.productId, imageFile);
          }
          
          if (imageFiles.length > 0 && response.data.productId) {
            await uploadMultipleProductImages(response.data.productId, imageFiles);
          }
          
          message.success('Thêm sản phẩm mới thành công');
        }
      }
      
      setIsModalVisible(false);
      fetchProducts();
    } catch (validationError) {
      console.error('Lỗi kiểm tra form:', validationError);
    } finally {
      setLoading(false);
    }
  };

  // Props upload nhiều ảnh
  const multipleUploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Bạn chỉ có thể tải lên file hình ảnh!');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Kích thước hình ảnh không được vượt quá 5MB!');
        return false;
      }
      
      // Thêm file vào danh sách
      setImageFiles(prev => [...prev, file]);
      return false;
    },
    showUploadList: false,
    multiple: true,
  };
  const uploadProps = {
    beforeUpload: (file) => {
      // Kiểm tra file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Bạn chỉ có thể tải lên file hình ảnh!');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Kích thước hình ảnh không được vượt quá 5MB!');
        return false;
      }
      
      // Tạo URL xem trước
      setImageUrl(URL.createObjectURL(file));
      setImageFile(file);
      return false; // Ngăn upload tự động
    },
    showUploadList: false,
  };

  // Lọc sản phẩm
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Thêm một hàm test xóa trực tiếp
  const testDirectDelete = async (productId) => {
    try {
      console.log(`Thử xóa trực tiếp sản phẩm ID: ${productId}`);
      
      // Sử dụng fetch API trực tiếp
      const response = await fetch(`https://localhost:7164/api/Products/${productId}`, {
        method: 'DELETE'
      });
      
      console.log('Kết quả xóa:', response.status, response.ok);
      
      if (response.ok) {
        message.success('Xóa thành công!');
        // Cập nhật UI
        setProducts(prev => prev.filter(p => p.productId !== productId));
      } else {
        const errorText = await response.text();
        message.error(`Lỗi: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error('Không thể xóa sản phẩm');
    }
  };

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 80,
      sorter: (a, b) => a.productId - b.productId
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'photo',
      key: 'photo',
      width: 120,
      render: (photo) => (
        <Image
          src={getImageUrl(photo)}
          alt="Product"
          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/80x80?text=No+Image"
          preview={{ src: getImageUrl(photo) }}
        />
      )
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.brand && (
            <div>
              <Text type="secondary">{record.brand}</Text>
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        // Dynamic color mapping based on category name hash
        const getCategoryColor = (categoryName) => {
          if (!categoryName) return 'default';
          const colors = ['blue', 'green', 'red', 'orange', 'purple', 'cyan', 'magenta', 'lime', 'gold', 'volcano'];
          let hash = 0;
          for (let i = 0; i < categoryName.length; i++) {
            hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
          }
          return colors[Math.abs(hash) % colors.length];
        };
        
        return <Tag color={getCategoryColor(category)}>{category}</Tag>;
      },
              filters: categories.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text style={{ color: '#f50', fontWeight: 'bold' }}>
          {new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(price)}
        </Text>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <ProductStatus color={isActive ? 'success' : 'error'}>
          {isActive ? (
            <>
              <CheckCircleOutlined /> Hoạt động
            </>
          ) : (
            <>
              <CloseCircleOutlined /> Đã ẩn
            </>
          )}
        </ProductStatus>
      ),
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Đã ẩn', value: false }
      ],
      onFilter: (value, record) => record.isActive === value
    },
    {
      title: 'Số lượng',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (quantity) => {
        let status, text;
        if (quantity <= 0) {
          status = 'error';
          text = 'Hết hàng';
        } else if (quantity < 10) {
          status = 'warning';
          text = `Còn ${quantity}`;
        } else {
          status = 'success';
          text = quantity;
        }
        return <Badge status={status} text={text} />;
      },
      sorter: (a, b) => a.stockQuantity - b.stockQuantity
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space style={{ display: 'flex', visibility: 'visible', zIndex: 1000 }}>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            type="primary"
            ghost
            style={{ visibility: 'visible', zIndex: 1001 }}
          >
            Sửa
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={(e) => {
              console.log('🔥 BUTTON CLICKED! Record:', record);
              console.log('🔥 Event:', e);
              e.stopPropagation();
              e.preventDefault();
              handleDelete(record);
            }}
            danger
            style={{ 
              visibility: 'visible', 
              zIndex: 1001,
              pointerEvents: 'auto'
            }}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const EmptyState = () => (
    <EmptyStateWrapper>
      <InboxOutlined style={{ fontSize: '54px', color: '#bfbfbf', marginBottom: '16px' }} />
      <Title level={4}>Không tìm thấy sản phẩm nào</Title>
      <Text type="secondary" style={{ marginBottom: '20px' }}>
        {searchTerm || filterCategory 
          ? 'Không tìm thấy sản phẩm nào khớp với bộ lọc của bạn. Vui lòng thử các tiêu chí tìm kiếm khác.'
          : 'Hiện chưa có sản phẩm nào trong hệ thống. Hãy thêm sản phẩm mới để bắt đầu.'}
      </Text>
      {(searchTerm || filterCategory) ? (
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={() => {setSearchTerm(''); setFilterCategory('');}}
        >
          Xóa bộ lọc
        </Button>
      ) : (        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm sản phẩm mới
        </Button>
      )}
    </EmptyStateWrapper>
  );

  // Main render
  return (
    <ProductManagementContainer>
      <HeaderSection>
        <Title level={3}>
          <ShopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Quản lý sản phẩm
        </Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="large"
          >
            Thêm sản phẩm
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchProducts}
            size="large"
          >
            Làm mới
          </Button>
        </Space>
      </HeaderSection>
      
      {error && (
        <StyledCard style={{ borderLeft: '4px solid #ff4d4f', marginBottom: '24px' }}>
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            <Text type="danger">{error}</Text>
          </Space>
        </StyledCard>
      )}

      <StyledCard bordered={false}>
        <FilterSection>
          <Input 
              placeholder="Tìm kiếm theo tên, mô tả hoặc thương hiệu"
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
          />
          <Select
            placeholder="Lọc theo danh mục"
              value={filterCategory} 
            onChange={setFilterCategory}
            style={{ minWidth: '200px' }}
            allowClear
            size="large"
            >
              {categories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </FilterSection>

        {loading && products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
            <div style={{ marginTop: '16px' }}>Đang tải dữ liệu sản phẩm...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="productId"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} sản phẩm` 
            }}
            loading={loading}
            scroll={{ x: 'max-content' }}
            size="middle"
          />
        )}
      </StyledCard>

      <Modal
        title={
          <Space>
            {currentProduct ? (
              <><EditOutlined style={{ color: '#1890ff' }} /> Chỉnh sửa sản phẩm</>
            ) : (
              <><PlusOutlined style={{ color: '#52c41a' }} /> Thêm sản phẩm mới</>
            )}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading || uploading}
            onClick={handleSave}
            icon={<SaveOutlined />}
          >
            Lưu
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="productForm"
          initialValues={{
            name: '',
            description: '',
            price: 0,
            category: undefined,
            brand: '',
            stockQuantity: 0
          }}
        >
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ width: '180px', textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }}
                    fallback="https://via.placeholder.com/180x180?text=No+Image"
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '180px', 
                    background: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '4px',
                    border: '1px dashed #d9d9d9' 
                  }}>
                    <PictureOutlined style={{ fontSize: '32px', color: '#bfbfbf' }} />
              </div>
                )}
              </div>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </div>
            
            <div style={{ flex: 1 }}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
              >
                <Input prefix={<TagOutlined />} placeholder="Nhập tên sản phẩm" />
              </Form.Item>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                  style={{ flex: 1 }}
                >
                  <Select placeholder="Chọn danh mục">
                  {categories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                  ))}
                  </Select>
                </Form.Item>
              
                <Form.Item
                  name="brand"
                  label="Thương hiệu"
                  style={{ flex: 1 }}
                >
                  <Input placeholder="Nhập thương hiệu (không bắt buộc)" />
                </Form.Item>
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item
                  name="price"
                  label="Giá"
                  rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    min={0}
                    placeholder="Nhập giá sản phẩm"
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>
                
                <Form.Item
                  name="stockQuantity"
                  label="Số lượng"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Nhập số lượng trong kho"
                    prefix={<InboxOutlined />}
                  />
                </Form.Item>
              </div>
                </div>
              </div>
                <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm!' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả chi tiết sản phẩm" 
              prefix={<FileTextOutlined />} 
            />
          </Form.Item>

          {/* Section quản lý nhiều ảnh */}
          {currentProduct && (
            <Card 
              title={
                <Space>
                  <PictureOutlined />
                  Gallery sản phẩm
                </Space>
              } 
              size="small" 
              style={{ marginTop: 16 }}
            >
              <Row gutter={[16, 16]}>
                {/* Upload nhiều ảnh */}
                <Col span={24}>
                  <Upload {...multipleUploadProps}>
                    <Button 
                      icon={<UploadOutlined />} 
                      loading={uploadingImages}
                      block
                    >
                      Thêm nhiều ảnh sản phẩm
                    </Button>
                  </Upload>
                </Col>

                {/* Hiển thị ảnh preview từ files được chọn */}
                {imageFiles.length > 0 && (
                  <Col span={24}>
                    <Typography.Text strong>Ảnh chờ upload:</Typography.Text>
                    <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                      {imageFiles.map((file, index) => (
                        <Col key={index} span={6}>
                          <div style={{ position: 'relative' }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #d9d9d9'
                              }}
                            />
                            <Button
                              size="small"
                              type="text"
                              danger
                              icon={<CloseOutlined />}
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                background: 'rgba(255, 255, 255, 0.8)'
                              }}
                              onClick={() => {
                                setImageFiles(prev => prev.filter((_, i) => i !== index));
                              }}
                            />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Col>
                )}

                {/* Hiển thị ảnh đã upload */}
                {productImages.length > 0 && (
                  <Col span={24}>
                    <Typography.Text strong>Ảnh đã upload:</Typography.Text>
                    <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                      {productImages.map((image) => (
                        <Col key={image.id} span={6}>
                          <div style={{ position: 'relative' }}>
                            <img
                              src={image.imageUrl}
                              alt="Product"
                              style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: image.isPrimary ? '3px solid #1890ff' : '1px solid #d9d9d9',
                                boxShadow: image.isPrimary ? '0 0 10px rgba(24, 144, 255, 0.3)' : 'none'
                              }}
                            />
                            {image.isPrimary && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'linear-gradient(to bottom, rgba(24, 144, 255, 0.8), transparent)',
                                  borderRadius: '4px 4px 0 0',
                                  padding: '4px 8px'
                                }}
                              >
                                <Tag
                                  color="blue"
                                  icon={<StarFilled />}
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    margin: 0,
                                    padding: '2px 6px',
                                    border: 'none'
                                  }}
                                >
                                  Ảnh chính
                                </Tag>
                              </div>
                            )}
                            <Space
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                background: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '4px',
                                padding: '2px'
                              }}
                            >
                              {!image.isPrimary && (
                                <Tooltip title="Đặt làm ảnh chính">
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<StarOutlined />}
                                    onClick={() => setPrimaryImage(currentProduct.productId, image.id)}
                                  />
                                </Tooltip>
                              )}
                              <Tooltip title="Xóa ảnh">
                                <Button
                                  size="small"
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => deleteProductImage(currentProduct.productId, image.id)}
                                />
                              </Tooltip>
                            </Space>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Col>
                )}

                {productImages.length === 0 && imageFiles.length === 0 && (
                  <Col span={24}>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '20px',
                      color: '#999',
                      border: '1px dashed #d9d9d9',
                      borderRadius: '4px'
                    }}>
                      <PictureOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <div>Chưa có ảnh nào. Hãy upload ảnh cho sản phẩm.</div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          )}
        </Form>
      </Modal>

      {/* Modal xác nhận xóa sản phẩm */}
      {confirmDelete && (
        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>Xác nhận xóa sản phẩm</span>
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
              onClick={confirmDeleteProduct}
            >
              Xóa sản phẩm
            </Button>
          ]}
          width={500}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '16px', margin: '20px 0' }}>
              Bạn có chắc chắn muốn xóa sản phẩm <strong>"{confirmDelete.name}"</strong>?
            </p>
            <p style={{ color: '#8c8c8c' }}>
              Sản phẩm sẽ bị ẩn khỏi hệ thống. Bạn vẫn có thể khôi phục sau này.
            </p>
          </div>
        </Modal>
      )}
    </ProductManagementContainer>
  );
};

export default ProductManagement;
