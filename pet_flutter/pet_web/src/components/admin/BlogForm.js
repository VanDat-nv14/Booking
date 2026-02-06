import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Modal, Button as AntButton, Upload, message, Tooltip } from 'antd';
import { 
  UploadOutlined, PictureOutlined, VideoCameraOutlined, 
  SaveOutlined, CloseOutlined, PlusOutlined, DeleteOutlined
} from '@ant-design/icons';
import axiosClient from '../../utils/axiosClient';

// Styled Components
const FormContainer = styled.div`
  background: linear-gradient(145deg, #ffffff, #f5f7fa);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 30px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid rgba(230, 235, 240, 0.8);
`;

const FormTitle = styled.h2`
  font-size: 26px;
  margin-bottom: 30px;
  color: #2c3e50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f4f8;
  font-weight: 700;
  
  .close-button {
    cursor: pointer;
    font-size: 20px;
    color: #999;
    background: #f5f7fa;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s;
    
    &:hover {
      color: #e53935;
      background: #fef0ef;
      transform: rotate(90deg);
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  
  label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: #2c3e50;
    font-size: 15px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 25px;
      height: 2px;
      background: #3498db;
      border-radius: 2px;
    }
  }
  
  input, select, textarea {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    font-size: 15px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    transition: all 0.3s;
    background-color: #f9fafc;
    
    &:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
      background-color: #fff;
    }
    
    &::placeholder {
      color: #b3b3b3;
    }
  }
  
  select {
    height: 46px;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 40px;
  }
  
  .editor {
    margin-top: 10px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    
    .ql-toolbar {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      background-color: #f8f9fa;
      border: 1px solid #e1e8ed;
      display: flex !important;
      flex-wrap: wrap !important;
      visibility: visible !important;
      padding: 10px;
    }
    
    .ql-container {
      min-height: 350px;
      font-size: 16px;
      border: 1px solid #e1e8ed;
      border-top: none;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }
  
  /* Thêm CSS để đảm bảo các nút trong toolbar hiển thị */
  .ql-formats {
    display: inline-flex !important;
    margin-right: 15px !important;
    margin-bottom: 6px;
  }
  
  /* Thêm border rõ ràng cho editor */
  .quill {
    border-radius: 8px;
    overflow: hidden;
  }
  
  .error-text {
    color: #e53935;
    margin-top: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    
    &:before {
      content: "⚠️";
      margin-right: 5px;
    }
  }
  
  .error {
    border-color: #e53935 !important;
    background-color: #ffefef !important;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f0f4f8;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  font-size: 15px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  
  &.primary {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #41a9f5, #2c8fd0);
      box-shadow: 0 5px 12px rgba(52, 152, 219, 0.3);
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      background: linear-gradient(135deg, #b3b3b3, #999);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
  
  &.secondary {
    background: white;
    color: #555;
    border: 1px solid #e1e8ed;
    
    &:hover {
      background-color: #f5f7fa;
      box-shadow: 0 5px 12px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      color: #ccc;
      border-color: #eee;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
  
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const UploadButton = styled.div`
  position: relative;
  display: inline-block;
  padding: 10px 18px;
  border: 2px dashed #3498db;
  border-radius: 8px;
  background-color: #f0f7fc;
  color: #3498db;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  
  &:hover {
    background-color: #e6f2fb;
    border-color: #2980b9;
    transform: translateY(-2px);
  }
  
  input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  margin-top: 20px;
  display: inline-block;
  max-width: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  img {
    width: 100%;
    display: block;
  }
  
  .remove-image {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.9);
    color: #e53935;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    
    &:hover {
      background-color: #e53935;
      color: white;
      transform: rotate(90deg);
    }
  }
`;

const MediaButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const EditorToolbar = styled.div`
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ToolbarButton = styled(AntButton)`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const MediaPreviewContainer = styled.div`
  margin-top: 15px;
  
  img, video {
    max-width: 100%;
    max-height: 200px;
    border-radius: 5px;
    display: block;
    margin: 0 auto;
  }
`;

const VideoInputContainer = styled.div`
  margin-top: 15px;
  
  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 13px;
    color: #777;
    margin-bottom: 8px;
  }
  
  .preview-container {
    margin-top: 15px;
    border-radius: 5px;
    overflow: hidden;
  }
`;

// Cập nhật component cho các nút editor tự tạo
const EditorButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
  background: #f8f9fa;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
`;

const EditorButton = styled(AntButton)`
  &.ant-btn {
    height: auto;
    padding: 8px 15px;
    display: flex;
    align-items: center;
    border-radius: 6px;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .anticon {
      font-size: 16px;
    }
  }
`;

// Danh sách danh mục blog
const CATEGORIES = [
  'Chăm sóc thú cưng',
  'Sức khỏe',
  'Huấn luyện',
  'Dinh dưỡng',
  'Về chúng tôi',
  'Thông tin hữu ích',
  'Tổng hợp'
];

// Các trạng thái của bài viết
const STATUSES = [
  { value: 'Draft', label: 'Bản nháp' },
  { value: 'Published', label: 'Đã xuất bản' },
  { value: 'Archived', label: 'Đã lưu trữ' }
];

const BlogForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'Draft',
    featuredImage: null,
    ...initialData
  });
  
  const [imagePreview, setImagePreview] = useState(initialData?.featuredImage || null);
  const [validationErrors, setValidationErrors] = useState({});
  const quillRef = useRef(null);
  
  // State cho modal và media
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  
  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || '',
        tags: initialData.tags || '',
        status: initialData.status || 'Draft',
        featuredImage: null // Don't set the file input
      });
      
      setImagePreview(initialData.featuredImage || null);
    }
  }, [initialData]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Tiêu đề không được để trống';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Nội dung không được để trống';
    }
    
    if (!formData.category) {
      errors.category = 'Vui lòng chọn danh mục';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };
  
  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
    
    // Clear content validation error when user edits
    if (validationErrors.content) {
      setValidationErrors({
        ...validationErrors,
        content: null
      });
    }
  };
  
  // Xử lý upload ảnh đại diện
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 5MB');
      return;
    }
    
    // Kiểm tra loại file
    if (!file.type.match('image.*')) {
      message.error('Vui lòng chọn file hình ảnh');
      return;
    }
    
    setFormData({ ...formData, featuredImage: file });
    
    // Hiển thị preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = () => {
    setFormData({ ...formData, featuredImage: null });
    setImagePreview(null);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    onSubmit(formData);
  };
  
  // Xử lý upload ảnh vào editor
  const insertImage = () => {
    setIsImageModalVisible(true);
  };
  
  // Xử lý upload video vào editor
  const insertVideo = () => {
    setIsVideoModalVisible(true);
  };
  
  // Các module quill
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: insertImage,
        video: insertVideo
      }
    }
  };
  
  // Xử lý upload ảnh lên server
  const handleUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('UploadPath', 'uploads/blogs');
    
    try {
      onProgress({ percent: 50 });
      
      const response = await axiosClient.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onSuccess(response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
      onError(error);
      message.error('Không thể tải lên hình ảnh');
    }
  };
  
  // Properties cho Upload component
  const uploadProps = {
    name: 'image',
    multiple: true,
    customRequest: handleUpload,
    onChange: ({ fileList }) => setImageList(fileList),
    onRemove: (file) => {
      const newFileList = imageList.filter(item => item.uid !== file.uid);
      setImageList(newFileList);
    },
    fileList: imageList,
    listType: 'picture',
    accept: 'image/*'
  };
  
  // Xử lý thêm ảnh vào editor
  const handleInsertImages = () => {
    if (imageList.length === 0 || !quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    
    // Thêm từng ảnh vào editor
    imageList.forEach((file, index) => {
      if (file.status === 'done' && file.response && file.response.imageUrl) {
        // Thêm xuống dòng nếu có nhiều ảnh và không phải ảnh đầu tiên
        if (index > 0) {
          quill.insertText(range.index, '\n', 'user');
        }
        
        // Chèn ảnh vào editor
        quill.insertEmbed(range.index, 'image', file.response.imageUrl, 'user');
        
        // Di chuyển con trỏ sau ảnh
        quill.setSelection(range.index + 1, 'silent');
      }
    });
    
    // Thêm xuống dòng sau tất cả ảnh
    quill.insertText(quill.getSelection().index, '\n', 'user');
    
    // Đóng modal và xóa danh sách ảnh
    setIsImageModalVisible(false);
    setImageList([]);
  };
  
  // Xử lý trích xuất ID từ YouTube URL
  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Xử lý trích xuất ID từ Vimeo URL
  const extractVimeoId = (url) => {
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return match ? match[3] : null;
  };
  
  // Xử lý thêm video vào editor
  const handleInsertVideo = () => {
    if (!videoUrl.trim() || !quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    
    let videoHtml = '';
    
    // Xử lý URL từ các nền tảng phổ biến
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // YouTube URL
      const youtubeId = extractYoutubeId(videoUrl);
      if (youtubeId) {
        videoHtml = `<iframe src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen class="ql-video" style="width: 100%; height: 350px;"></iframe>`;
      }
    } else if (videoUrl.includes('vimeo.com')) {
      // Vimeo URL
      const vimeoId = extractVimeoId(videoUrl);
      if (vimeoId) {
        videoHtml = `<iframe src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allowfullscreen class="ql-video" style="width: 100%; height: 350px;"></iframe>`;
      }
    } else if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      // URL trực tiếp đến file video
      videoHtml = `<video controls class="ql-video" style="width: 100%; height: auto;"><source src="${videoUrl}" type="video/${videoUrl.split('.').pop()}"></video>`;
    } else {
      // URL video bất kỳ
      videoHtml = `<iframe src="${videoUrl}" frameborder="0" allowfullscreen class="ql-video" style="width: 100%; height: 350px;"></iframe>`;
    }
    
    if (videoHtml) {
      // Chèn xuống dòng trước khi thêm video
      quill.insertText(range.index, '\n', 'user');
      
      // Chèn video
      quill.clipboard.dangerouslyPasteHTML(range.index, videoHtml, 'user');
      
      // Di chuyển con trỏ xuống dòng sau video
      quill.insertText(range.index + videoHtml.length, '\n', 'user');
      quill.setSelection(range.index + videoHtml.length + 1, 'silent');
    }
    
    // Đóng modal và xóa URL
    setIsVideoModalVisible(false);
    setVideoUrl('');
  };
  
  // Kiểm tra xem có thể hiển thị xem trước video hay không
  const canPreviewVideo = () => {
    return videoUrl && (
      extractYoutubeId(videoUrl) || 
      extractVimeoId(videoUrl) || 
      videoUrl.match(/\.(mp4|webm|ogg)$/i)
    );
  };
  
  return (
    <FormContainer>
      <FormTitle>
        {initialData ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        <span className="close-button" onClick={onCancel}>
          <CloseOutlined />
        </span>
      </FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="title">Tiêu đề *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tiêu đề bài viết"
            className={validationErrors.title ? 'error' : ''}
          />
          {validationErrors.title && <div className="error-text">{validationErrors.title}</div>}
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="category">Danh mục *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={validationErrors.category ? 'error' : ''}
          >
            <option value="">-- Chọn danh mục --</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {validationErrors.category && <div className="error-text">{validationErrors.category}</div>}
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="content">Nội dung *</label>
          
          {/* Các nút tự tạo riêng biệt */}
          <EditorButtons>
            <EditorButton 
              icon={<PictureOutlined />} 
              onClick={insertImage}
            >
              Thêm ảnh vào bài viết
            </EditorButton>
            
            <EditorButton 
              icon={<VideoCameraOutlined />} 
              onClick={insertVideo}
            >
              Thêm video vào bài viết
            </EditorButton>
          </EditorButtons>
          
          <div className={validationErrors.content ? 'editor error' : 'editor'}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={modules}
              placeholder="Viết nội dung bài viết tại đây..."
            />
          </div>
          {validationErrors.content && <div className="error-text">{validationErrors.content}</div>}
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="tags">Tags (cách nhau bởi dấu phẩy)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Ví dụ: chó, mèo, thú cưng, chăm sóc"
          />
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="status">Trạng thái</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </FormGroup>
        
        <FormGroup>
          <label>Ảnh đại diện</label>
          <UploadButton>
            <UploadOutlined /> Chọn ảnh
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </UploadButton>
          
          {imagePreview && (
            <ImagePreviewContainer>
              <img src={imagePreview} alt="Preview" />
              <span className="remove-image" onClick={removeImage}>
                <CloseOutlined />
              </span>
            </ImagePreviewContainer>
          )}
        </FormGroup>
        
        <ButtonGroup>
          <Button
            type="button"
            className="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <SaveOutlined />
                {initialData ? 'Cập nhật' : 'Tạo bài viết'}
              </>
            )}
          </Button>
        </ButtonGroup>
      </form>
      
      {/* Modal thêm ảnh */}
      <Modal
        title="Thêm hình ảnh"
        open={isImageModalVisible}
        onOk={handleInsertImages}
        onCancel={() => {
          setIsImageModalVisible(false);
          setImageList([]);
        }}
        okText="Chèn ảnh"
        cancelText="Hủy"
      >
        <Upload {...uploadProps}>
          <AntButton icon={<UploadOutlined />}>Tải lên ảnh</AntButton>
        </Upload>
        
        <MediaPreviewContainer>
          {imageList.length > 0 && imageList.map(file => {
            if (file.status === 'done' && file.response && file.response.imageUrl) {
              return <img key={file.uid} src={file.response.imageUrl} alt="Preview" />;
            }
            return null;
          })}
        </MediaPreviewContainer>
      </Modal>
      
      {/* Modal thêm video */}
      <Modal
        title="Thêm video"
        open={isVideoModalVisible}
        onOk={handleInsertVideo}
        onCancel={() => {
          setIsVideoModalVisible(false);
          setVideoUrl('');
        }}
        okText="Chèn video"
        cancelText="Hủy"
      >
        <VideoInputContainer>
          <p>Nhập URL video từ YouTube, Vimeo hoặc URL trực tiếp đến file video</p>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=XXXX"
          />
          
          {canPreviewVideo() && (
            <div className="preview-container">
              <p>Xem trước:</p>
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <iframe
                  width="100%"
                  height="215"
                  src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrl)}`}
                  frameBorder="0"
                  allowFullScreen
                  title="YouTube video preview"
                ></iframe>
              ) : videoUrl.includes('vimeo.com') ? (
                <iframe
                  width="100%"
                  height="215"
                  src={`https://player.vimeo.com/video/${extractVimeoId(videoUrl)}`}
                  frameBorder="0"
                  allowFullScreen
                  title="Vimeo video preview"
                ></iframe>
              ) : videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video width="100%" height="215" controls>
                  <source src={videoUrl} type={`video/${videoUrl.split('.').pop()}`} />
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              ) : null}
            </div>
          )}
        </VideoInputContainer>
      </Modal>
    </FormContainer>
  );
};

export default BlogForm;
