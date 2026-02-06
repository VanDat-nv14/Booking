import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import cartService from '../services/cartService';
import {
  Row,
  Col,
  Typography,
  Input,
  Select,
  Button,
  Card,
  Breadcrumb,
  Spin,
  Alert,
  Tag,
  Slider,
  Divider,
  Pagination,
  Empty,
  message,
  Space,
  Layout,
  theme
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  HomeOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  TagsOutlined,
  ShopOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import ProductCardComponent from '../components/ProductCard';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Content } = Layout;

// Styled components với màu xanh dương chủ đạo
const StyledContent = styled(Content)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 12px;
  color: white;

  .page-title {
    color: white;
    margin-bottom: 16px;
    font-weight: 700;
    font-size: 36px;
  }

  .page-description {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
  }
`;



const FilterSection = styled.div`
  margin-bottom: 32px;
  padding: 24px;
  background: #fafbff;
  border-radius: 12px;
  border: 1px solid #e6f0ff;
`;

const SearchContainer = styled.div`
  margin-bottom: 24px;
  
  .custom-search-wrapper {
    display: flex;
    align-items: center;
    background: white;
    border: 2px solid #e6f0ff;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &:hover, &:focus-within {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
    }
    
    .custom-search-input {
      flex: 1;
      height: 48px;
      padding: 0 16px;
      border: none;
      outline: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
      font-size: 16px;
      color: #262626;
      background: transparent;
      
      &::placeholder {
        color: #8c8c8c;
        font-family: inherit;
        font-size: 16px;
      }
    }
    
    .custom-search-clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      margin-right: 8px;
      border: none;
      background: #f0f0f0;
      border-radius: 50%;
      cursor: pointer;
      color: #8c8c8c;
      font-size: 14px;
      transition: all 0.2s ease;
      
      &:hover {
        background: #d9d9d9;
        color: #595959;
      }
    }
    
    .custom-search-button {
      height: 48px;
      padding: 0 24px;
      border: none;
      background: #1890ff;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      
      &:hover {
        background: #096dd9;
      }
      
      &:active {
        background: #0050b3;
      }
      
      .anticon {
        font-size: 16px;
      }
    }
  }
`;

const FilterRow = styled(Row)`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  
  .ant-select {
    font-family: inherit;
    
    .ant-select-selector {
      height: 44px;
      border: 2px solid #e6f0ff;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      
      &:hover, &:focus {
        border-color: #1890ff;
      }
      
      .ant-select-selection-placeholder {
        font-family: inherit;
        font-size: 14px;
      }
      
      .ant-select-selection-item {
        font-family: inherit;
        font-size: 14px;
      }
    }
  }

  .price-slider {
    .ant-slider-track {
      background: #1890ff;
    }
    
    .ant-slider-handle {
      border-color: #1890ff;
    }
  }
`;

const ActiveFilters = styled.div`
  margin-bottom: 24px;
  
  .filter-tag {
    background: #e6f0ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
    border-radius: 20px;
    padding: 4px 12px;
    margin: 4px 8px 4px 0;
    
    .anticon {
      color: #1890ff;
    }
  }
`;

const ProductStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: white;
  border: 2px solid #e6f0ff;
  border-radius: 12px;

  .stats-info {
    color: #1890ff;
    font-weight: 600;
    font-size: 16px;
  }

  .view-toggle {
    .ant-btn {
      border-color: #1890ff;
      color: #1890ff;
      
      &:hover {
        background: #1890ff;
        color: white;
      }
    }
  }
`;

const ProductGrid = styled(Row)`
  .product-card {
    margin-bottom: 24px;
    
    .ant-card {
      width: 227px;
      height: 420px;
      border: 2px solid #f0f2f5;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      
      &:hover {
        border-color: #1890ff;
        box-shadow: 0 8px 24px rgba(24, 144, 255, 0.15);
      }
      
      .ant-card-cover {
        flex-shrink: 0;
      }
      
      .ant-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 12px;
      }
    }
    
    .product-image {
      height: 160px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .product-name {
      font-weight: 600;
      color: #262626;
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 38px;
    }
    
    .product-price {
      color: #1890ff;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .product-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: auto;
      
      .ant-btn {
        height: 32px;
        border-radius: 6px;
        font-size: 12px;
        padding: 0 8px;
        
        &.view-detail-btn {
          background: #f0f8ff;
          border: 1px solid #1890ff;
          color: #1890ff;
          font-weight: 600;
          
          &:hover {
            background: #1890ff;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
          }
        }
        
        &.add-cart-btn {
          background: white;
          border: 1px solid #1890ff;
          color: #1890ff;
          
          &:hover {
            background: #1890ff;
            color: white;
          }
        }
        
        &.buy-now-btn {
          background: #1890ff;
          border-color: #1890ff;
          
          &:hover {
            background: #096dd9;
            border-color: #096dd9;
          }
        }
      }
    }
  }
`;

const PaginationContainer = styled.div`
  text-align: center;
  margin-top: 40px;
  padding: 24px;
  
  .ant-pagination {
    .ant-pagination-item {
      border-color: #e6f0ff;
      
      a {
        color: #1890ff;
      }
    }
    
    .ant-pagination-item-active {
      background: #1890ff;
      border-color: #1890ff;
      
      a {
        color: white;
      }
    }
    
    .ant-pagination-prev, .ant-pagination-next {
      color: #1890ff;
      
      &:hover {
        color: #096dd9;
      }
    }
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 0;
  
  .ant-spin {
    .ant-spin-dot-item {
      background: #1890ff;
    }
  }
  
  .loading-text {
    color: #1890ff;
    margin-top: 16px;
  }
`;

const ProductsPage = () => {
  // Import cart service instead of using Context
  // const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { token } = theme.useToken();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [productsPerPage] = useState(12);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: 0,
    maxPrice: 5000000,
    searchText: ''
  });

  // Fetch products and categories
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Fetching products and categories...');
        
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getActiveCategories()
        ]);

        console.log('📦 Products data:', productsData);
        console.log('📂 Categories data:', categoriesData);

        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Chuyển đổi categories từ object array thành string array để tương thích
        const categoryNames = categoriesData.map(cat => cat.name);
        setCategories(categoryNames);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
        
        // Không sử dụng fallback categories nữa
        setCategories([]);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  // Listen for stock updates
  useEffect(() => {
    const handleStockUpdate = async () => {
      try {
        // Refresh products data
        const updatedProducts = await productService.getAllProducts();
        setProducts(updatedProducts || []);
        console.log('Products stock updated after order');
      } catch (err) {
        console.error('Error updating products stock:', err);
      }
    };

    window.addEventListener('stockUpdated', handleStockUpdate);
    window.addEventListener('orderSuccess', handleStockUpdate);
    
    return () => {
      window.removeEventListener('stockUpdated', handleStockUpdate);
      window.removeEventListener('orderSuccess', handleStockUpdate);
    };
  }, []);

  // Apply filters
  useEffect(() => {
    const applyFilters = () => {
      let result = [...products];

      if (filters.category) {
        result = result.filter(product => product.category === filters.category);
      }

      if (filters.brand) {
        result = result.filter(product => product.brand === filters.brand);
      }

      result = result.filter(
        product => product.price >= filters.minPrice && product.price <= filters.maxPrice
      );

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        result = result.filter(
          product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
        );
      }

      setFilteredProducts(result);
      setPage(1);
    };

    applyFilters();
  }, [filters, products]);

  // Get unique brands
  const brands = [...new Set(products.map(product => product.brand))].filter(Boolean);

  // Event handlers
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (value) => {
    setFilters(prev => ({ ...prev, minPrice: value[0], maxPrice: value[1] }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, searchText: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 5000000,
      searchText: ''
    });
    message.success('Đã xóa tất cả bộ lọc');
  };

  const handleAddToCart = async (product) => {
    const success = await cartService.addToCart(product, 1);
    // Message will be handled in cartService
  };

  const handleBuyNow = async (product) => {
    const success = await cartService.addToCart(product, 1);
    if (success) {
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Pagination
  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const totalProducts = filteredProducts.length;

  // Get active filters for display
  const activeFilters = [];
  if (filters.category) activeFilters.push({ key: 'category', label: 'Danh mục', value: filters.category });
  if (filters.brand) activeFilters.push({ key: 'brand', label: 'Thương hiệu', value: filters.brand });
  if (filters.searchText) activeFilters.push({ key: 'searchText', label: 'Tìm kiếm', value: filters.searchText });
  if (filters.minPrice > 0 || filters.maxPrice < 5000000) {
    activeFilters.push({ 
      key: 'price', 
      label: 'Giá', 
      value: `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}` 
    });
  }

  const removeFilter = (filterKey) => {
    if (filterKey === 'price') {
      setFilters(prev => ({ ...prev, minPrice: 0, maxPrice: 5000000 }));
    } else {
      setFilters(prev => ({ ...prev, [filterKey]: '' }));
    }
  };

  if (loading) {
    return (
      <StyledContent>
        <LoadingContainer>
          <Spin size="large" />
          <Title level={3} className="loading-text">
            Đang tải sản phẩm...
          </Title>
        </LoadingContainer>
      </StyledContent>
    );
  }

  if (error) {
    return (
      <StyledContent>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          }
        />
      </StyledContent>
    );
  }

  return (
    <StyledContent>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Trang chủ
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <ShopOutlined /> Sản phẩm
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader>
        <Title level={1} className="page-title">
          Cửa hàng sản phẩm cho thú cưng
        </Title>
        <Text className="page-description">
          Khám phá bộ sưu tập đa dạng các sản phẩm chất lượng cao cho thú cưng của bạn
        </Text>
      </PageHeader>



      {/* Filter Section */}
      <FilterSection>
        <Title level={4} style={{ color: '#1890ff', marginBottom: 24 }}>
          <FilterOutlined /> Bộ lọc sản phẩm
          {!loading && (
            <Text style={{ fontSize: 14, fontWeight: 'normal', marginLeft: 16, color: '#666' }}>
              ({categories.length} danh mục, {brands.length} thương hiệu)
            </Text>
          )}
        </Title>
        
        <SearchContainer>
          <div className="custom-search-wrapper">
            <input
              type="text"
              className="custom-search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(filters.searchText);
                }
              }}
            />
            {filters.searchText && (
              <button
                className="custom-search-clear"
                onClick={() => handleFilterChange('searchText', '')}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
            <button
              className="custom-search-button"
              onClick={() => handleSearch(filters.searchText)}
            >
              <SearchOutlined />
              Tìm kiếm
            </button>
          </div>
        </SearchContainer>

        <FilterRow gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ color: '#1890ff' }}>Danh mục:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder={loading ? "Đang tải..." : "Chọn danh mục"}
              allowClear
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              loading={loading}
              disabled={loading}
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            {!loading && categories.length === 0 && (
              <Text type="secondary" style={{ fontSize: 12, color: '#ff4d4f' }}>
                Không thể tải danh mục
              </Text>
            )}
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ color: '#1890ff' }}>Thương hiệu:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder={loading ? "Đang tải..." : brands.length === 0 ? "Chưa có thương hiệu" : "Chọn thương hiệu"}
              allowClear
              value={filters.brand}
              onChange={(value) => handleFilterChange('brand', value)}
              loading={loading}
              disabled={loading || brands.length === 0}
            >
              {brands.map(brand => (
                <Option key={brand} value={brand}>{brand}</Option>
              ))}
            </Select>
            {!loading && brands.length === 0 && (
              <Text type="secondary" style={{ fontSize: 12, color: '#ff4d4f' }}>
                Chưa có thương hiệu nào
              </Text>
            )}
          </Col>

          <Col xs={24} sm={24} md={12}>
            <Text strong style={{ color: '#1890ff' }}>
              Khoảng giá: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
            </Text>
            <Slider
              range
              className="price-slider"
              style={{ marginTop: 16 }}
              min={0}
              max={5000000}
              step={50000}
              value={[filters.minPrice, filters.maxPrice]}
              onChange={handlePriceChange}
              disabled={loading}
            />
          </Col>
        </FilterRow>

        {activeFilters.length > 0 && (
          <ActiveFilters>
            <Text strong style={{ color: '#1890ff', marginRight: 16 }}>Bộ lọc đang áp dụng:</Text>
            {activeFilters.map(filter => (
              <Tag
                key={filter.key}
                closable
                className="filter-tag"
                onClose={() => removeFilter(filter.key)}
              >
                {filter.label}: {filter.value}
              </Tag>
            ))}
            <Button type="link" onClick={resetFilters} style={{ padding: 0, color: '#1890ff' }}>
              <ReloadOutlined /> Xóa tất cả
            </Button>
          </ActiveFilters>
        )}
      </FilterSection>

      {/* Product Stats */}
      <ProductStats>
        <div className="stats-info">
          <AppstoreOutlined /> Hiển thị {currentProducts.length} / {totalProducts} sản phẩm
        </div>
      </ProductStats>

      {/* Products Grid */}
      {currentProducts.length === 0 ? (
        <Empty
          description="Không tìm thấy sản phẩm nào"
          style={{ margin: '60px 0' }}
        />
      ) : (
        <ProductGrid gutter={[24, 24]} justify="start">
          {currentProducts.map(product => (
            <Col key={product.productId}>
              <div className="product-card">
                <Card
                  hoverable
                  cover={
                    <Link to={`/products/${product.productId}`}>
                      <div className="product-image">
                        <img
                          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                      </div>
                    </Link>
                  }
                >
                  <div className="product-info">
                    <Title level={5} className="product-name">
                      <Link 
                        to={`/products/${product.productId}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {product.name}
                      </Link>
                    </Title>
                    
                    <div style={{ marginBottom: 8 }}>
                      <Tag color="blue" style={{ fontSize: '11px', padding: '2px 6px' }}>
                        {product.category}
                      </Tag>
                      {product.brand && (
                        <Tag style={{ fontSize: '11px', padding: '2px 6px' }}>
                          {product.brand}
                        </Tag>
                      )}
                    </div>
                    
                    <div className="product-price">
                      {formatPrice(product.price)}
                    </div>
                    
                    <Text type="secondary" style={{ 
                      display: 'block', 
                      marginBottom: 12, 
                      fontSize: '12px' 
                    }}>
                      Còn lại: {product.stock}
                    </Text>
                    
                    <div className="product-actions">
                      <Button
                        className="view-detail-btn"
                        icon={<SearchOutlined />}
                        onClick={() => navigate(`/products/${product.productId}`)}
                        style={{ marginBottom: 8, width: '100%' }}
                      >
                        Xem chi tiết
                      </Button>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                          className="add-cart-btn"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          style={{ flex: 1 }}
                        >
                          Thêm vào giỏ
                        </Button>
                        <Button
                          type="primary"
                          className="buy-now-btn"
                          onClick={() => handleBuyNow(product)}
                          disabled={product.stock === 0}
                          style={{ flex: 1 }}
                        >
                          Mua ngay
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
          ))}
        </ProductGrid>
      )}

      {/* Pagination */}
      {totalProducts > productsPerPage && (
        <PaginationContainer>
          <Pagination
            current={page}
            total={totalProducts}
            pageSize={productsPerPage}
            onChange={setPage}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trên ${total} sản phẩm`
            }
          />
        </PaginationContainer>
      )}
    </StyledContent>
  );
};

export default ProductsPage;