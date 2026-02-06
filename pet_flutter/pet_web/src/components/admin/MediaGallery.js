import React, { useState, useEffect } from 'react';
import { Modal, Upload, message, Tabs, Spin, List, Card, Button, Input } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axiosClient from '../../utils/axiosClient';

const { TabPane } = Tabs;

const GalleryContainer = styled.div`
  .ant-upload-list-picture-card .ant-upload-list-item {
    float: left;
    width: 120px;
    height: 120px;
    margin: 0 8px 8px 0;
  }
  
  .ant-upload.ant-upload-select-picture-card {
    width: 120px;
    height: 120px;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
`;

const MediaCard = styled(Card)`
  width: 120px;
  height: 120px;
  margin: 8px;
  overflow: hidden;
  cursor: pointer;
  
  .ant-card-body {
    padding: 0;
    height: 100%;
  }
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.selected {
    border: 2px solid #1890ff;
  }
  
  .media-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    
    .delete-btn {
      color: white;
      font-size: 24px;
      
      &:hover {
        color: #ff4d4f;
      }
    }
  }
  
  &:hover .media-overlay {
    opacity: 1;
  }
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 20px;
  color: #888;
`;

const MediaGallery = ({ visible, onCancel, onSelect, multiple = false }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [fileList, setFileList] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Tải danh sách media từ server khi modal hiển thị
  useEffect(() => {
    if (visible && activeTab === 'gallery') {
      fetchGalleryItems();
    }
  }, [visible, activeTab]);
  
  // Fetch danh sách media từ server
  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/images/gallery');
      setGalleryItems(response.data || []);
    } catch (error) {
      console.error('Error fetching media gallery:', error);
      message.error('Không thể tải thư viện ảnh');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý upload file
  const handleUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('UploadPath', 'uploads/blogs');
    
    try {
      const response = await axiosClient.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          onProgress({ percent: Math.round((e.loaded * 100) / e.total) });
        }
      });
      
      onSuccess(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      onError(error);
      message.error('Không thể tải lên file');
    }
  };
  
  // Xử lý khi chọn file từ thư viện
  const handleSelectItem = (item) => {
    if (multiple) {
      // Chọn nhiều
      if (selectedItems.some(selected => selected.id === item.id)) {
        // Nếu đã chọn thì bỏ chọn
        setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
      } else {
        // Nếu chưa chọn thì thêm vào
        setSelectedItems([...selectedItems, item]);
      }
    } else {
      // Chọn một
      setSelectedItems([item]);
    }
  };
  
  // Xử lý xóa file
  const handleDeleteItem = async (item, e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
    
    try {
      await axiosClient.delete(`/api/images/${item.id}`);
      message.success('Đã xóa file');
      
      // Cập nhật lại danh sách
      setGalleryItems(galleryItems.filter(i => i.id !== item.id));
      
      // Nếu đang chọn thì bỏ chọn
      if (selectedItems.some(selected => selected.id === item.id)) {
        setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      message.error('Không thể xóa file');
    }
  };
  
  // Lọc các item phù hợp với từ khóa tìm kiếm
  const filteredGalleryItems = galleryItems.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // Kiểm tra xem một item có được chọn không
  const isItemSelected = (item) => {
    return selectedItems.some(selected => selected.id === item.id);
  };
  
  // Xử lý khi ấn OK để chọn file
  const handleOk = () => {
    if (activeTab === 'upload') {
      // Lấy danh sách các file đã upload thành công
      const successFiles = fileList
        .filter(file => file.status === 'done' && file.response)
        .map(file => ({
          id: file.uid,
          name: file.name,
          url: file.response.imageUrl,
          type: file.type
        }));
      
      if (successFiles.length > 0) {
        onSelect(multiple ? successFiles : successFiles[0]);
        setFileList([]);
      } else {
        message.warning('Vui lòng tải lên ít nhất một file');
        return;
      }
    } else {
      // Sử dụng các file đã chọn từ thư viện
      if (selectedItems.length > 0) {
        onSelect(multiple ? selectedItems : selectedItems[0]);
        setSelectedItems([]);
      } else {
        message.warning('Vui lòng chọn ít nhất một file');
        return;
      }
    }
    
    onCancel();
  };
  
  // Properties cho Upload component
  const uploadProps = {
    name: 'file',
    multiple: multiple,
    listType: 'picture-card',
    fileList: fileList,
    customRequest: handleUpload,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: (file) => {
      setFileList(fileList.filter(item => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      // Kiểm tra kiểu file
      const isImageOrVideo = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isImageOrVideo) {
        message.error('Chỉ có thể tải lên ảnh hoặc video!');
        return false;
      }
      
      // Kiểm tra kích thước file
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File phải nhỏ hơn 10MB!');
        return false;
      }
      
      return true;
    }
  };
  
  return (
    <Modal
      title="Thư viện media"
      visible={visible}
      onCancel={() => {
        setFileList([]);
        setSelectedItems([]);
        onCancel();
      }}
      onOk={handleOk}
      width={800}
      okText="Chọn"
      cancelText="Hủy"
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <TabPane tab="Tải lên mới" key="upload">
          <GalleryContainer>
            <Upload {...uploadProps}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </GalleryContainer>
        </TabPane>
        
        <TabPane tab="Thư viện" key="gallery">
          <SearchContainer>
            <Input
              placeholder="Tìm kiếm file..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </SearchContainer>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin />
            </div>
          ) : filteredGalleryItems.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 5, xl: 6, xxl: 7 }}
              dataSource={filteredGalleryItems}
              renderItem={item => (
                <List.Item style={{ marginBottom: 0 }}>
                  <MediaCard
                    hoverable
                    className={isItemSelected(item) ? 'selected' : ''}
                    onClick={() => handleSelectItem(item)}
                    bodyStyle={{ padding: 0 }}
                  >
                    {item.type?.startsWith('image/') ? (
                      <img src={item.url} alt={item.name} />
                    ) : item.type?.startsWith('video/') ? (
                      <video src={item.url} />
                    ) : (
                      <div>{item.name}</div>
                    )}
                    
                    <div className="media-overlay">
                      <DeleteOutlined 
                        className="delete-btn" 
                        onClick={(e) => handleDeleteItem(item, e)} 
                      />
                    </div>
                  </MediaCard>
                </List.Item>
              )}
            />
          ) : (
            <EmptyText>
              Không có file nào trong thư viện
            </EmptyText>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default MediaGallery;
