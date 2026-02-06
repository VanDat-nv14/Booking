import axiosClient from '../utils/axiosClient';

// Thêm helper function để chuẩn hóa đường dẫn ảnh
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return null;
  
  // Nếu đường dẫn đã có http/https, giữ nguyên
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Nếu đường dẫn không bắt đầu bằng /uploads/blogs, thêm vào
  let path = imagePath;
  if (!path.includes('/uploads/blogs')) {
    path = path.startsWith('/') ? `/uploads/blogs${path}` : `/uploads/blogs/${path}`;
  }
  
  // Đảm bảo đường dẫn có tiền tố domain
  return `https://localhost:7164${path.startsWith('/') ? path : `/${path}`}`;
};

// Thêm hàm uploadImage để xử lý tải ảnh lên
export const uploadImage = async (formData) => {
  try {
    const response = await axiosClient.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Lấy tất cả bài viết blog (kèm theo filter trạng thái nếu có)
export const getAllPosts = async (status = null) => {
  try {
    const response = await axiosClient.get(`/BlogPosts${status ? `?status=${status}` : ''}`);
    
    // Chuẩn hóa đường dẫn ảnh cho tất cả bài viết
    const postsWithFixedImages = response.data.map(post => ({
      ...post,
      featuredImage: normalizeImagePath(post.featuredImage)
    }));
    
    return postsWithFixedImages;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    throw error;
  }
};

// Lấy bài viết blog theo ID
export const getPostById = async (id) => {
  try {
    // Kiểm tra id hợp lệ
    if (!id) {
      throw new Error('ID bài viết không được để trống');
    }
    
    // Gọi API lấy chi tiết bài viết
    const response = await axiosClient.get(`/BlogPosts/${id}`);
    
    // Kiểm tra dữ liệu trả về
    if (!response.data) {
      throw new Error('Không tìm thấy bài viết');
    }
    
    // Chuẩn hóa đường dẫn ảnh
    return {
      ...response.data,
      featuredImage: normalizeImagePath(response.data.featuredImage)
    };
  } catch (error) {
    console.error(`Error fetching blog post with ID ${id}:`, error);
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    throw error;
  }
};

// Lấy bài viết blog theo danh mục
export const getPostsByCategory = async (category) => {
  try {
    const response = await axiosClient.get(`/BlogPosts/Category/${category}`);
    
    // Chuẩn hóa đường dẫn ảnh
    const postsWithFixedImages = response.data.map(post => ({
      ...post,
      featuredImage: normalizeImagePath(post.featuredImage)
    }));
    
    return postsWithFixedImages;
  } catch (error) {
    console.error(`Error fetching blog posts in category ${category}:`, error);
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    throw error;
  }
};

// Lấy bài viết blog của người dùng hiện tại
export const getMyPosts = async () => {
  try {
    const response = await axiosClient.get('/BlogPosts/MyPosts');
    
    // Chuẩn hóa đường dẫn ảnh
    const postsWithFixedImages = response.data.map(post => ({
      ...post,
      featuredImage: normalizeImagePath(post.featuredImage)
    }));
    
    return postsWithFixedImages;
  } catch (error) {
    console.error('Error fetching my blog posts:', error);
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    throw error;
  }
};

// Tìm kiếm bài viết blog
export const searchPosts = async (query) => {
  try {
    const response = await axiosClient.get(`/BlogPosts/Search?query=${query}`);
    
    // Chuẩn hóa đường dẫn ảnh
    const postsWithFixedImages = response.data.map(post => ({
      ...post,
      featuredImage: normalizeImagePath(post.featuredImage)
    }));
    
    return postsWithFixedImages;
  } catch (error) {
    console.error(`Error searching blog posts with query "${query}":`, error);
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    throw error;
  }
};

// Tạo bài viết blog mới
export const createPost = async (blogData) => {
  try {
    // Kiểm tra các trường bắt buộc theo API spec
    if (!blogData.title || !blogData.content || !blogData.category) {
      throw new Error('Title, content và category là bắt buộc');
    }
    
    // Sử dụng FormData vì API yêu cầu multipart/form-data
    const formData = new FormData();
    
    // Append các trường bắt buộc
    formData.append('Title', blogData.title);
    formData.append('Content', blogData.content);
    formData.append('Category', blogData.category);
    
    // Append các trường không bắt buộc
    if (blogData.tags) formData.append('Tags', blogData.tags);
    if (blogData.status) formData.append('Status', blogData.status);
    
    // Thêm đường dẫn thư mục để server lưu ảnh vào uploads/blogs
    formData.append('UploadPath', 'uploads/blogs');
    
    // Append image if exists
    if (blogData.featuredImage) {
      formData.append('FeaturedImage', blogData.featuredImage);
    }
    
    // Log để debug
    console.log('Blog data being sent:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const response = await axiosClient.post('/BlogPosts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Chuẩn hóa đường dẫn ảnh trong kết quả trả về
    const result = {
      ...response.data,
      featuredImage: normalizeImagePath(response.data.featuredImage)
    };
    
    console.log('Blog post created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error.response) {
      console.error('Server error details:', error.response.data);
      if (error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

// Cập nhật bài viết blog
export const updatePost = async (id, blogData) => {
  try {
    // Kiểm tra ID hợp lệ
    if (!id) {
      throw new Error('ID bài viết không được để trống');
    }
    
    // Kiểm tra các trường bắt buộc theo API spec
    if (!blogData.title || !blogData.content || !blogData.category) {
      throw new Error('Title, content và category là bắt buộc');
    }
    
    // Sử dụng FormData vì có thể có file upload
    const formData = new FormData();
    
    // Append text fields
    formData.append('Title', blogData.title);
    formData.append('Content', blogData.content);
    formData.append('Category', blogData.category);
    if (blogData.tags) formData.append('Tags', blogData.tags);
    if (blogData.status) formData.append('Status', blogData.status);
    
    // Thêm đường dẫn thư mục để server lưu ảnh vào uploads/blogs
    formData.append('UploadPath', 'uploads/blogs');
    
    // Khác với backend, chúng ta gửi flag là Boolean thay vì string
    // Và đảm bảo nó luôn được gửi đi, không phụ thuộc có ảnh mới hay không
    formData.append('KeepExistingImage', !blogData.featuredImage);
    
    // Chỉ append image nếu có file mới
    if (blogData.featuredImage) {
      formData.append('FeaturedImage', blogData.featuredImage);
    } else {
      // Nếu không có ảnh mới, gửi một "dummy file" rỗng
      // Đây là một hack tạm thời để giải quyết vấn đề với backend
      // Tạo một file nhỏ nhất có thể để gửi đi
      // const emptyBlob = new Blob([''], { type: 'image/png' });
      // formData.append('FeaturedImage', emptyBlob, 'dummyfile.png');
    }
    
    console.log(`Updating blog post with ID: ${id}`);
    console.log('Form data being sent:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[0] === 'FeaturedImage' ? 'File object' : pair[1]));
    }
    
    const response = await axiosClient.put(`/BlogPosts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Chuẩn hóa đường dẫn ảnh trong kết quả trả về
    const result = {
      ...response.data,
      featuredImage: normalizeImagePath(response.data.featuredImage)
    };
    
    return result;
  } catch (error) {
    console.error(`Error updating blog post with ID ${id}:`, error);
    if (error.response) {
      console.error('Server error details:', error.response.data);
      if (error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

// Xóa bài viết blog
export const deletePost = async (id) => {
  try {
    // Kiểm tra ID hợp lệ
    if (!id) {
      throw new Error('ID bài viết không được để trống');
    }
    
    console.log(`Deleting blog post with ID: ${id}`);
    
    const response = await axiosClient.delete(`/BlogPosts/${id}`);
    console.log('Blog post deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting blog post with ID ${id}:`, error);
    
    // Kiểm tra và log chi tiết lỗi từ server
    if (error.response) {
      console.error('Server error details:', error.response.data);
      console.error('Status code:', error.response.status);
      
      if (error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      
      // Xử lý theo mã lỗi
      if (error.response.status === 404) {
        throw new Error('Không tìm thấy bài viết cần xóa.');
      } else if (error.response.status === 403) {
        throw new Error('Bạn không có quyền xóa bài viết này.');
      }
    }
    
    // Ném lỗi với thông báo cụ thể hơn
    throw new Error(`Không thể xóa bài viết: ${error.message}`);
  }
};

// Xuất bản bài viết blog
export const publishPost = async (id) => {
  try {
    const response = await axiosClient.patch(`/BlogPosts/${id}/Publish`);
    return response.data;
  } catch (error) {
    console.error(`Error publishing blog post with ID ${id}:`, error);
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    throw error;
  }
};

// Thêm comment vào bài viết
export const addComment = async (postId, content) => {
  try {
    const response = await axiosClient.post(`/Comments`, {
      postId,
      content
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding comment to post ID ${postId}:`, error);
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    throw error;
  }
};

// Lấy comments của bài viết
export const getComments = async (postId) => {
  try {
    const response = await axiosClient.get(`/Comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ID ${postId}:`, error);
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    throw error;
  }
};