import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Typography, Space, Divider, Card, Button, Tooltip, Skeleton, Avatar, FloatButton } from 'antd';
import { 
  UserOutlined, CalendarOutlined, ClockCircleOutlined, EyeOutlined,
  HeartOutlined, HeartFilled, BookOutlined, ShareAltOutlined,
  MessageOutlined, TagOutlined, ArrowUpOutlined
} from '@ant-design/icons';
import Comments from './Comments';
import SocialSharing from './SocialSharing';

// Biến đổi animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

// Styled components với thiết kế trang báo
const BlogContainer = styled(motion.div)`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px 60px;
  
  @media (max-width: 768px) {
    padding: 20px 15px 40px;
  }
`;

const BlogHeader = styled.header`
  margin-bottom: 30px;
`;

const BreadcrumbNav = styled.div`
  margin-bottom: 25px;
  font-size: 0.9rem;
  
  a {
    color: #666;
    
    &:hover {
      color: #0073e6;
    }
  }
  
  span {
    color: #999;
    margin: 0 8px;
  }
`;

const CategoryBadge = styled.span`
  background-color: #0073e6;
  color: white;
  padding: 5px 15px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 6px rgba(0, 115, 230, 0.2);
`;

const BlogTitle = styled(Typography.Title)`
  font-size: 3rem !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
  margin-bottom: 25px !important;
  color: #111 !important;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2.2rem !important;
  }
`;

const ArticleIntro = styled.div`
  font-size: 1.3rem;
  line-height: 1.7;
  color: #444;
  font-weight: 500;
  margin-bottom: 30px;
  padding-left: 20px;
  border-left: 5px solid #0073e6;
  background-color: #f7f9fc;
  padding: 20px 25px;
  border-radius: 0 8px 8px 0;
`;

const MetaInfoCard = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
`;

const StyledAvatar = styled(Avatar)`
  width: 50px;
  height: 50px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorMeta = styled.div`
  margin-left: 12px;
`;

const AuthorName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: #333;
`;

const PublishDateWrapper = styled.div`
  font-size: 0.85rem;
  color: #777;
  margin-top: 3px;
  
  .anticon {
    margin-right: 5px;
  }
`;

const ReadTimeWrapper = styled.div`
  font-size: 0.9rem;
  color: #777;
  
  .anticon {
    margin-right: 5px;
  }
`;

const ViewsWrapper = styled.div`
  font-size: 0.9rem;
  color: #777;
  
  .anticon {
    margin-right: 5px;
  }
`;

// Phần nội dung bài viết với thiết kế kiểu báo chí
const Content = styled.article`
  font-family: 'Merriweather', serif;
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 40px;
  
  // Khoảng cách các phần tử
  > * {
    margin-bottom: 1.8rem;
  }
  
  // Kiểu chữ đoạn văn
  p {
    color: #333;
  }
  
  // Kiểu chữ tiêu đề
  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 2.5rem 0 1.2rem;
    color: #111;
  }
  
  h3 {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 2.2rem 0 1rem;
    color: #222;
  }
  
  // Hình ảnh trong bài viết
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 2rem auto;
    display: block;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
  
  // Chú thích hình ảnh
  img + em {
    display: block;
    text-align: center;
    font-size: 0.9rem;
    color: #666;
    margin-top: -1rem;
    margin-bottom: 2rem;
  }
  
  // Danh sách
  ul, ol {
    margin: 1.5rem 0 1.5rem 1rem;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.8rem;
    }
  }
  
  // Trích dẫn
  blockquote {
    border-left: 5px solid #0073e6;
    padding: 1.5rem 2rem;
    margin: 2rem 0;
    background-color: #f7f9fc;
    font-style: italic;
    border-radius: 0 8px 8px 0;
    font-size: 1.25rem;
    color: #444;
  }
  
  // Links
  a {
    color: #0073e6;
    text-decoration: underline;
    transition: color 0.2s;
    
    &:hover {
      color: #005bb5;
    }
  }
  
  // Đoạn code
  pre, code {
    background-color: #f5f6f7;
    border-radius: 4px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.9em;
    padding: 0.2em 0.4em;
  }
  
  pre {
    padding: 1em;
    overflow-x: auto;
  }
`;

const AuthorCard = styled.div`
  display: flex;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 50px 0 40px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #0073e6;
`;

const AuthorAvatar = styled(Avatar)`
  margin-right: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const AuthorInfoSection = styled.div`
  flex: 1;
`;

const AuthorTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #222;
`;

const AuthorBio = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
`;

const TagsCard = styled(Card)`
  margin-bottom: 30px;
  border-radius: 10px !important;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03) !important;
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 0 20px;
  }
`;

const StyledTag = styled.span`
  display: inline-block;
  background: #f5f6f7;
  color: #333;
  padding: 6px 12px;
  border-radius: 20px;
  margin: 0 10px 10px 0;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: #e6f7ff;
    color: #0073e6;
  }
`;

const ActionCard = styled.div`
  display: flex;
  justify-content: center;
  padding: 15px;
  margin: 30px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
`;

const ActionButton = styled(Button)`
  margin: 0 10px;
  height: auto;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  font-weight: 500;
  
  .anticon {
    margin-right: 6px;
  }
  
  &.liked {
    color: #ff4d4f;
    border-color: #ff4d4f;
  }
  
  &.bookmarked {
    color: #faad14;
    border-color: #faad14;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }
`;

const RelatedArticlesSection = styled.section`
  margin: 50px 0;
`;

const RelatedHeader = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 12px;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 60px;
    height: 4px;
    background-color: #0073e6;
    border-radius: 2px;
  }
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 25px;
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const RelatedCard = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.1);
    
    .related-image {
      transform: scale(1.05);
    }
  }
`;

const RelatedImageContainer = styled.div`
  height: 180px;
  overflow: hidden;
`;

const RelatedImage = styled.div`
  height: 100%;
  background-image: url(${props => props.src || ''});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
`;

const RelatedContent = styled.div`
  padding: 20px;
`;

const RelatedTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
  color: #333;
`;

const RelatedDate = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

// Cập nhật component BlogDetail
const BlogDetail = ({ post, comments, loading, onCommentSubmit, isAuthenticated }) => {
  // Trích xuất thông tin từ post
  const formattedDate = post?.publishDate ? new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(post.publishDate)) : '';
  
  const readingTime = post?.content ? Math.ceil(post.content.split(' ').length / 200) : 5;
  const views = post?.viewCount || 0;
  const tags = post?.tags ? post.tags.split(',').map(tag => tag.trim()) : [];
  
  // State để theo dõi tương tác
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likeCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Ref cho nội dung bài viết
  const contentRef = useRef(null);
  
  // Tạo đoạn trích từ nội dung HTML
  const createExcerpt = (html, maxLength = 250) => {
    // Loại bỏ tất cả các thẻ HTML
    const text = html.replace(/<[^>]*>?/gm, '');
    
    // Cắt chuỗi
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  };
  
  // Xử lý sự kiện thích bài viết
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };
  
  // Xử lý sự kiện lưu bài viết
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };
  
  return (
    <>
      <BlogContainer
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {loading ? (
          <>
            <Skeleton active paragraph={{ rows: 1 }} />
            <Skeleton.Input style={{ width: '70%', height: 50, marginBottom: 20 }} active />
            <Skeleton.Avatar active size={40} style={{ marginRight: 12 }} />
            <Skeleton.Input style={{ width: 100 }} active />
            <Skeleton.Image style={{ width: '100%', height: 400, marginTop: 30, marginBottom: 30 }} />
            <Skeleton active paragraph={{ rows: 12 }} />
          </>
        ) : (
          <>
            <BlogHeader>
              <BreadcrumbNav>
                <a href="/">Trang chủ</a> <span>/</span> 
                <a href="/blog">Blog</a> <span>/</span> 
                <a href={`/blog/category/${post?.category}`}>{post?.category}</a>
              </BreadcrumbNav>
              
              {post?.category && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <CategoryBadge>{post.category}</CategoryBadge>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <BlogTitle level={1}>{post?.title}</BlogTitle>
              </motion.div>
              
              {/* Phần tóm tắt bài viết */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ArticleIntro>
                  {post?.excerpt || createExcerpt(post?.content || '', 250)}
                </ArticleIntro>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <MetaInfoCard>
                  <Space size="large" wrap>
                    <AuthorInfo>
                      <StyledAvatar 
                        src={post?.userAvatar} 
                        icon={<UserOutlined />} 
                      />
                      <AuthorMeta>
                        <AuthorName>{post?.authorName || 'Tác giả'}</AuthorName>
                        <PublishDateWrapper>
                          <CalendarOutlined /> {formattedDate}
                        </PublishDateWrapper>
                      </AuthorMeta>
                    </AuthorInfo>
                    
                    <Divider type="vertical" style={{ height: 35 }} />
                    
                    <ReadTimeWrapper>
                      <ClockCircleOutlined /> {readingTime} phút đọc
                    </ReadTimeWrapper>
                    
                    <Divider type="vertical" style={{ height: 35 }} />
                    
                    <ViewsWrapper>
                      <EyeOutlined /> {views.toLocaleString()} lượt xem
                    </ViewsWrapper>
                  </Space>
                </MetaInfoCard>
              </motion.div>
              
              {/* Đã ẩn ảnh đại diện theo yêu cầu */}
            </BlogHeader>
            
            {/* Nội dung bài viết */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Content 
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: post?.content || '' }} 
              />
            </motion.div>
            
            {/* Phần thông tin tác giả bài viết */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <AuthorCard>
                <AuthorAvatar 
                  src={post?.userAvatar} 
                  icon={<UserOutlined />} 
                  size={80}
                />
                <AuthorInfoSection>
                  <AuthorTitle>Viết bởi {post?.authorName || 'Tác giả'}</AuthorTitle>
                  <AuthorBio>
                    {post?.authorBio || 'Chuyên gia trong lĩnh vực thú cưng với nhiều năm kinh nghiệm trong việc chăm sóc và huấn luyện thú cưng. Luôn tâm huyết chia sẻ kiến thức để giúp các chủ nuôi yêu thương và chăm sóc thú cưng tốt hơn.'}
                  </AuthorBio>
                </AuthorInfoSection>
              </AuthorCard>
            </motion.div>
            
            {/* Phần tags */}
            {tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <TagsCard
                  title={
                    <Space>
                      <TagOutlined /> Tags
                    </Space>
                  }
                >
                  {tags.map((tag, index) => (
                    <StyledTag key={index}>{tag}</StyledTag>
                  ))}
                </TagsCard>
              </motion.div>
            )}
            
            {/* Nút tương tác */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ActionCard>
                <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
                  <Tooltip title={isLiked ? "Bỏ thích" : "Thích bài viết"}>
                    <ActionButton 
                      className={`like-button ${isLiked ? 'liked' : ''}`}
                      icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                      onClick={handleLike}
                    >
                      {likes} Thích
                    </ActionButton>
                  </Tooltip>
                  
                  <Tooltip title={isBookmarked ? "Đã lưu" : "Lưu bài viết"}>
                    <ActionButton 
                      className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                      icon={<BookOutlined />}
                      onClick={handleBookmark}
                    >
                      {isBookmarked ? "Đã lưu" : "Lưu lại"}
                    </ActionButton>
                  </Tooltip>
                  
                  <Tooltip title="Chia sẻ bài viết">
                    <ActionButton 
                      className="share-button"
                      icon={<ShareAltOutlined />}
                      onClick={() => document.getElementById('social-sharing').scrollIntoView({ behavior: 'smooth' })}
                    >
                      Chia sẻ
                    </ActionButton>
                  </Tooltip>
                </Space>
              </ActionCard>
            </motion.div>
            
            {/* Phần chia sẻ xã hội */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              id="social-sharing"
            >
              <SocialSharing url={window.location.href} title={post?.title} />
            </motion.div>
            
            {/* Phần bài viết liên quan - Thêm mới */}
            <RelatedArticlesSection>
              <RelatedHeader>Bài viết liên quan</RelatedHeader>
              <RelatedGrid>
                {[1, 2, 3].map((item) => (
                  <a href="#" key={item}>
                    <RelatedCard>
                      <RelatedImageContainer>
                        <RelatedImage className="related-image" src="/images/banners/slide1.png" />
                      </RelatedImageContainer>
                      <RelatedContent>
                        <RelatedTitle>10 loại thức ăn tốt nhất cho chó con trong tháng đầu tiên</RelatedTitle>
                        <RelatedDate>12 tháng 4, 2025</RelatedDate>
                      </RelatedContent>
                    </RelatedCard>
                  </a>
                ))}
              </RelatedGrid>
            </RelatedArticlesSection>
            
            {/* Phần bình luận */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card
                title={
                  <Space>
                    <MessageOutlined /> Bình luận ({comments?.length || 0})
                  </Space>
                }
                style={{ marginTop: 40, borderRadius: 10 }}
              >
                <Comments 
                  comments={comments} 
                  loading={loading} 
                  onSubmit={onCommentSubmit}
                  isAuthenticated={isAuthenticated} 
                />
              </Card>
            </motion.div>
          </>
        )}
      </BlogContainer>
      
      <FloatButton.BackTop>
        <Button 
          type="primary" 
          shape="circle" 
          icon={<ArrowUpOutlined />} 
          size="large"
          style={{ 
            boxShadow: '0 5px 15px rgba(24, 144, 255, 0.4)',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
          }}
        />
      </FloatButton.BackTop>
    </>
  );
};

export default BlogDetail;