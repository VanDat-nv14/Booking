import axiosClient from '../utils/axiosClient';
import axios from 'axios';

const BASE_URL = '/Products';

const productService = {
 // Lấy tất cả sản phẩm với các filter
 getAllProducts: async (filters = {}) => {
   try {
     console.log('🔍 Debug: Calling getAllProducts with filters:', filters);
     console.log('🌐 Debug: Base URL:', axiosClient.defaults.baseURL);
     
     const { category, brand, minPrice, maxPrice } = filters;
     let url = BASE_URL;
     
     // Xây dựng query string
     const params = new URLSearchParams();
     if (category) params.append('category', category);
     if (brand) params.append('brand', brand);
     if (minPrice) params.append('minPrice', minPrice);
     if (maxPrice) params.append('maxPrice', maxPrice);
     
     // Thêm query string vào URL nếu có filter
     if (params.toString()) {
       url += `?${params.toString()}`;
     }
     
     console.log('📡 Debug: Full API URL:', axiosClient.defaults.baseURL + url);
     
     const response = await axiosClient.get(url);
     
     console.log('✅ Debug: API Response:', response.data);
     console.log('📊 Debug: Response status:', response.status);
     
     // Ánh xạ từ stockQuantity sang stock và photo sang imageUrl
     const mappedProducts = response.data.map(product => ({
       productId: product.productId,
       name: product.name,
       description: product.description,
       price: product.price,
       category: product.category,
       brand: product.brand,
       stock: product.stockQuantity, // Ánh xạ từ stockQuantity sang stock
       imageUrl: product.photo 
         ? `https://localhost:7164${product.photo.startsWith('/') ? product.photo : '/' + product.photo}` 
         : null
     }));
     
     console.log('🔄 Debug: Mapped products:', mappedProducts);
     return mappedProducts;
   } catch (error) {
     console.error('❌ Debug: Error fetching products:', error);
     console.error('❌ Debug: Error response:', error.response);
     console.error('❌ Debug: Error status:', error.response?.status);
     console.error('❌ Debug: Error data:', error.response?.data);
     // Trả về mảng rỗng nếu có lỗi để tránh crash
     return [];
   }
 },
  // Lấy thông tin chi tiết sản phẩm
 getProductById: async (id) => {
   try {
     const response = await axiosClient.get(`${BASE_URL}/${id}`);
     
     // Ánh xạ từ stockQuantity sang stock và photo sang imageUrl
     const product = response.data;
     const mappedProduct = {
       productId: product.productId,
       name: product.name,
       description: product.description,
       price: product.price,
       category: product.category,
       brand: product.brand,
       stock: product.stockQuantity, // Ánh xạ từ stockQuantity sang stock
       imageUrl: product.photo 
         ? `https://localhost:7164${product.photo.startsWith('/') ? product.photo : '/' + product.photo}` 
         : null,
       createdAt: product.createdAt,
       updatedAt: product.updatedAt,
       isActive: product.isActive
     };

     // Lấy tất cả ảnh của sản phẩm nếu có
     try {
       const images = await productService.getProductImages(id);
       mappedProduct.images = images;
       
       // Nếu có ảnh, sử dụng ảnh primary làm imageUrl chính
       const primaryImage = images.find(img => img.isPrimary);
       if (primaryImage) {
         mappedProduct.imageUrl = primaryImage.imageUrl;
       } else if (images.length > 0) {
         mappedProduct.imageUrl = images[0].imageUrl;
       }
     } catch (imageError) {
       console.warn(`Could not load images for product ${id}:`, imageError);
       mappedProduct.images = [];
     }
     
     return mappedProduct;
   } catch (error) {
     console.error(`Error fetching product with id ${id}:`, error);
     throw error;
   }
 },
 
 // Lấy danh sách categories
 getProductCategories: async () => {
   try {
     const response = await axiosClient.get(`${BASE_URL}/Categories`);
     return response.data;
   } catch (error) {
     console.error('Error fetching product categories:', error);
     // Trả về các danh mục mặc định nếu không thể lấy từ API
     return ["Food", "Toy", "Medicine", "Accessory", "Clothing", "Other"];
   }
 },
 
 // Các API dành cho Admin
 
 // Thêm sản phẩm mới
 createProduct: async (productData) => {
   try {
     // Ánh xạ ngược lại từ stock sang stockQuantity và imageUrl sang photo
     const mappedProductData = {
       name: productData.name,
       description: productData.description,
       price: productData.price,
       category: productData.category,
       brand: productData.brand,
       stockQuantity: productData.stock,
       photo: productData.imageUrl ? productData.imageUrl.split('/').pop() : null
     };
     
     const response = await axiosClient.post(BASE_URL, mappedProductData);
     return response.data;
   } catch (error) {
     console.error('Error creating product:', error);
     throw error;
   }
 },
 
 // Cập nhật sản phẩm
 updateProduct: async (id, productData) => {
   try {
     // Ánh xạ ngược lại từ stock sang stockQuantity và imageUrl sang photo
     const mappedProductData = {};
     
     if (productData.name !== undefined) mappedProductData.name = productData.name;
     if (productData.description !== undefined) mappedProductData.description = productData.description;
     if (productData.price !== undefined) mappedProductData.price = productData.price;
     if (productData.category !== undefined) mappedProductData.category = productData.category;
     if (productData.brand !== undefined) mappedProductData.brand = productData.brand;
     if (productData.stock !== undefined) mappedProductData.stockQuantity = productData.stock;
     if (productData.imageUrl !== undefined) {
       mappedProductData.photo = productData.imageUrl ? productData.imageUrl.split('/').pop() : null;
     }
     
     const response = await axiosClient.put(`${BASE_URL}/${id}`, mappedProductData);
     return response.data;
   } catch (error) {
     console.error(`Error updating product with id ${id}:`, error);
     throw error;
   }
 },
 
 // Xóa sản phẩm
 deleteProduct: async (id) => {
   console.log(`Đang cố gắng xóa sản phẩm ID: ${id}`);
   
   try {
     // Lấy token từ localStorage
     const token = localStorage.getItem('token');
     
     // Cách 1: Dùng fetch API thay vì axios (bypass các vấn đề CORS của axios)
     const response = await fetch(`https://localhost:7164/api/Products/${id}`, {
       method: 'DELETE',
       headers: {
         'Accept': 'application/json',
         'Authorization': `Bearer ${token}`
       }
     });
     
     if (!response.ok) {
       const errorText = await response.text();
       console.error(`Lỗi HTTP ${response.status}: ${errorText}`);
       throw new Error(errorText || `Lỗi xóa sản phẩm (HTTP ${response.status})`);
     }
     
     console.log('Xóa sản phẩm thành công!');
     return true;
   } catch (error) {
     console.error(`Lỗi khi xóa sản phẩm ID ${id}:`, error);
     throw error;
   }
 },
 
 // Lấy sản phẩm có số lượng thấp (dành cho Admin)
 getLowStockProducts: async (threshold = 10) => {
   try {
     const response = await axiosClient.get(`${BASE_URL}/LowStock?threshold=${threshold}`);
     
     // Ánh xạ từ stockQuantity sang stock và photo sang imageUrl
     const mappedProducts = response.data.map(product => ({
       productId: product.productId,
       name: product.name,
       description: product.description,
       price: product.price,
       category: product.category,
       brand: product.brand,
       stock: product.stockQuantity, // Ánh xạ từ stockQuantity sang stock
       imageUrl: product.photo 
         ? `https://localhost:7164${product.photo.startsWith('/') ? product.photo : '/' + product.photo}` 
         : null // Đường dẫn uploads/products
     }));
     
     return mappedProducts;
   } catch (error) {
     console.error('Error fetching low stock products:', error);
     throw error;
   }
 },

 // ===== PRODUCT IMAGES MANAGEMENT =====

 // Upload nhiều ảnh cho sản phẩm
 uploadProductImages: async (productId, files) => {
   try {
     const formData = new FormData();
     
     // Thêm từng file vào FormData với key đúng
     for (let i = 0; i < files.length; i++) {
       formData.append('files', files[i]);
     }
     
     // Lấy token từ localStorage
     const token = localStorage.getItem('token');
     
     const response = await fetch(`https://localhost:7164/api/Products/${productId}/images`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`
       },
       body: formData
     });
     
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`HTTP ${response.status}: ${errorText}`);
     }
     
     const result = await response.json();
     
     // Xử lý response để có đường dẫn đầy đủ
     if (result.images) {
       result.images = result.images.map(img => ({
         ...img,
         id: img.imageId, // Map ImageId to id for frontend consistency
         imageUrl: img.imageUrl 
           ? `https://localhost:7164${img.imageUrl.startsWith('/') ? img.imageUrl : '/' + img.imageUrl}`
           : null
       }));
     }
     
     return result;
   } catch (error) {
     console.error(`Error uploading images for product ${productId}:`, error);
     throw error;
   }
 },

 // Lấy tất cả ảnh của sản phẩm
 getProductImages: async (productId) => {
   try {
     const response = await axiosClient.get(`${BASE_URL}/${productId}/images`);
     
     // Xử lý response để có đường dẫn đầy đủ
     const images = response.data.map(img => ({
       ...img,
       id: img.imageId, // Map ImageId to id for frontend consistency
       imageUrl: img.imageUrl 
         ? `https://localhost:7164${img.imageUrl.startsWith('/') ? img.imageUrl : '/' + img.imageUrl}`
         : null
     }));
     
     return images;
   } catch (error) {
     console.error(`Error fetching images for product ${productId}:`, error);
     throw error;
   }
 },

 // Xóa ảnh sản phẩm
 deleteProductImage: async (productId, imageId) => {
   try {
     const token = localStorage.getItem('token');
     
     const response = await fetch(`https://localhost:7164/api/Products/${productId}/images/${imageId}`, {
       method: 'DELETE',
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });
     
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`HTTP ${response.status}: ${errorText}`);
     }
     
     return true;
   } catch (error) {
     console.error(`Error deleting image ${imageId} for product ${productId}:`, error);
     throw error;
   }
 },

 // Đặt ảnh làm ảnh chính
 setPrimaryImage: async (productId, imageId) => {
   try {
     const token = localStorage.getItem('token');
     
     const response = await fetch(`https://localhost:7164/api/Products/${productId}/images/${imageId}/primary`, {
       method: 'PUT',
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });
     
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`HTTP ${response.status}: ${errorText}`);
     }
     
     const result = await response.json();
     return result;
   } catch (error) {
     console.error(`Error setting primary image ${imageId} for product ${productId}:`, error);
     throw error;
   }
 }
};

export default productService; 