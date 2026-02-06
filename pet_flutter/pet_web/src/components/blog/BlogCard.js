import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Card container chính với hiệu ứng hover mượt mà
const Card = styled(motion.div)`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
              box-shadow 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-7px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

// Phần chứa ảnh với hiệu ứng hover zoom
const ImageContainer = styled.div`
  height: 220px;
  overflow: hidden;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
    z-index: 1;
    opacity: 0.8;
    transition: opacity 0.4s ease;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  &:hover img {
    transform: scale(1.07);
  }
  
  &:hover:after {
    opacity: 0.4;
  }
`;

// Badge thể hiện danh mục
const CategoryBadge = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: #0073e6;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
`;

// Phần nội dung với thiết kế báo chí
const Content = styled.div`
  padding: 25px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

// Tiêu đề bài viết với font báo chí
const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 22px;
  font-weight: 700;
  color: #222;
  line-height: 1.3;
  letter-spacing: -0.3px;
  
  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: #0073e6;
    }
  }
`;

// Phần meta info với thiết kế hiện đại
const Meta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
  
  span {
    margin-right: 18px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 5px;
      opacity: 0.8;
    }
  }
`;

// Đoạn trích của bài viết
const Excerpt = styled.p`
  color: #555;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
`;

// Phần dưới cùng của card
const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
`;

// Nút đọc thêm
const ReadMore = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0073e6;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.2s;
  
  svg {
    margin-left: 5px;
    transition: transform 0.2s;
  }
  
  &:hover {
    color: #005bb5;
    
    svg {
      transform: translateX(3px);
    }
  }
`;

// Stats section
const Stats = styled.div`
  display: flex;
  align-items: center;
  
  span {
    display: flex;
    align-items: center;
    margin-left: 15px;
    color: #777;
    font-size: 13px;
    
    svg {
      margin-right: 4px;
    }
  }
`;

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const BlogCard = ({ post, index }) => {
  // Format publish date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Xử lý ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/default-blog.jpg';
    return imagePath;
  };
  
  // Tạo excerpt từ content
  const createExcerpt = (content, maxLength = 150) => {
    // Loại bỏ các thẻ HTML
    const plainText = content.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };
  
  // Tính thời gian đọc dựa trên độ dài nội dung
  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime || 1;
  };
  
  const readingTime = calculateReadingTime(post.content);
  
  return (
    <Card 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
    >
      <ImageContainer>
        <CategoryBadge>{post.category}</CategoryBadge>
        <img src={getImageUrl(post.featuredImage)} alt={post.title} />
      </ImageContainer>
      
      <Content>
        <Title>
          <Link to={`/blog/${post.postId}`}>{post.title}</Link>
        </Title>
        
        <Meta>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
            {formatDate(post.publishDate)}
          </span>
          
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
            {post.authorName || "Admin"}
          </span>
        </Meta>
        
        <Excerpt>{createExcerpt(post.content)}</Excerpt>
        
        <CardFooter>
          <ReadMore to={`/blog/${post.postId}`}>
            Đọc tiếp
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
            </svg>
          </ReadMore>
          
          <Stats>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
              </svg>
              {readingTime} phút đọc
            </span>
            
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              {post.viewCount || 0} lượt xem
            </span>
          </Stats>
        </CardFooter>
      </Content>
    </Card>
  );
};

export default BlogCard;