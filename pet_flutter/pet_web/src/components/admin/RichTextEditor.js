import React, { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import styled from 'styled-components';
import { Button, Upload, Modal, message } from 'antd';
import { UploadOutlined, VideoCameraOutlined, PictureOutlined } from '@ant-design/icons';
import axiosClient from '../../utils/axiosClient';

const EditorContainer = styled.div`
  .ck-editor__editable {
    min-height: 300px;
    max-height: 600px;
    overflow-y: auto;
  }
  
  .ck.ck-content {
    font-size: 16px;
    line-height: 1.6;
  }
  
  .ck-content .image {
    text-align: center;
    margin: 20px 0;
  }
  
  .ck-content .image img {
    max-width: 100%;
    height: auto;
    border-radius: 5px;
  }
  
  .ck-content .video {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 ratio */
    height: 0;
    margin: 20px 0;
  }
  
  .ck-content .video iframe, 
  .ck-content .video video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 5px;
  }
  
  .ck-content blockquote {
    border-left: 5px solid #ccc;
    padding-left: 20px;
    font-style: italic;
  }
  
  .ck-content pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
  }
`;

const MediaButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const MediaPreviewContainer = styled.div`
  margin-top: 15px;
  
  img, video {
    max-width: 100%;
    max-height: 200px;
    border-radius: 5px;
  }
`;

const VideoInputContainer = styled.div`
  margin-top: 15px;
  
  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 12px;
    color: #888;
    margin-bottom: 5px;
  }
`;

// Cấu hình tùy chỉnh cho CKEditor
const editorConfig = {
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'link',
    'bulletedList',
    'numberedList',
    '|',
    'outdent',
    'indent',
    '|',
    'blockQuote',
    'insertTable',
    'undo',
    'redo'
  ],
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  }
};

const RichTextEditor = ({ value, onChange }) => {
  const [editorInstance, setEditorInstance] = useState(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Xử lý thêm ảnh từ modal
  const handleInsertImages = () => {
    if (imageList.length === 0 || !editorInstance) return;

    // Lấy vị trí con trỏ hiện tại
    const selection = editorInstance.model.document.selection;
    
    // Thêm từng ảnh vào vị trí con trỏ
    imageList.forEach((file) => {
      if (file.response && file.response.imageUrl) {
        const imageUrl = file.response.imageUrl;
        
        // Tạo thẻ img HTML
        const imageHtml = `<figure class="image"><img src="${imageUrl}" alt="Uploaded image"></figure>`;
        
        // Chèn HTML vào editor
        const viewFragment = editorInstance.data.processor.toView(imageHtml);
        const modelFragment = editorInstance.data.toModel(viewFragment);
        editorInstance.model.insertContent(modelFragment, selection);
      }
    });
    
    // Đóng modal và xóa danh sách ảnh
    setIsImageModalVisible(false);
    setImageList([]);
  };

  // Xử lý thêm video từ modal
  const handleInsertVideo = () => {
    if (!videoUrl.trim() || !editorInstance) return;
    
    let videoHtml = '';
    
    // Xử lý URL từ các nền tảng phổ biến
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Xử lý YouTube URL
      const youtubeId = extractYoutubeId(videoUrl);
      if (youtubeId) {
        videoHtml = `<div class="video"><iframe src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe></div>`;
      }
    } else if (videoUrl.includes('vimeo.com')) {
      // Xử lý Vimeo URL
      const vimeoId = extractVimeoId(videoUrl);
      if (vimeoId) {
        videoHtml = `<div class="video"><iframe src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allowfullscreen></iframe></div>`;
      }
    } else if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      // URL trực tiếp đến file video
      videoHtml = `<div class="video"><video controls><source src="${videoUrl}" type="video/${videoUrl.split('.').pop()}"></video></div>`;
    } else {
      // Thử xử lý như URL video bất kỳ
      videoHtml = `<div class="video"><iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe></div>`;
    }
    
    if (videoHtml) {
      // Chèn HTML vào editor
      const viewFragment = editorInstance.data.processor.toView(videoHtml);
      const modelFragment = editorInstance.data.toModel(viewFragment);
      editorInstance.model.insertContent(modelFragment);
    }
    
    // Đóng modal và xóa URL
    setIsVideoModalVisible(false);
    setVideoUrl('');
  };

  // Helper function để trích xuất YouTube ID
  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper function để trích xuất Vimeo ID
  const extractVimeoId = (url) => {
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return match ? match[3] : null;
  };

  // Xử lý upload ảnh
  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('UploadPath', 'uploads/blogs');
    
    try {
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
  };

  return (
    <EditorContainer>
      <MediaButtonsContainer>
        <Button
          icon={<PictureOutlined />}
          onClick={() => setIsImageModalVisible(true)}
        >
          Thêm ảnh
        </Button>
        <Button
          icon={<VideoCameraOutlined />}
          onClick={() => setIsVideoModalVisible(true)}
        >
          Thêm video
        </Button>
      </MediaButtonsContainer>
      
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={editorConfig}
        onReady={editor => {
          setEditorInstance(editor);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
      
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
          <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
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
          
          {videoUrl && (
            <div>
              <p>Xem trước:</p>
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrl)}`}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : videoUrl.includes('vimeo.com') ? (
                <iframe
                  width="100%"
                  height="200"
                  src={`https://player.vimeo.com/video/${extractVimeoId(videoUrl)}`}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video width="100%" height="200" controls>
                  <source src={videoUrl} type={`video/${videoUrl.split('.').pop()}`} />
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              ) : (
                <p>Không thể hiển thị xem trước cho URL này.</p>
              )}
            </div>
          )}
        </VideoInputContainer>
      </Modal>
    </EditorContainer>
  );
};

export default RichTextEditor;
