import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Avatar,
  Tag,
  Divider,
  theme,
  Badge
} from 'antd';
import {
  ArrowRightOutlined,
  CalendarOutlined,
  EyeOutlined,
  HeartOutlined,
  CommentOutlined,
  FireOutlined,
  StarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

// Animations
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const SectionContainer = styled.div`
  margin-bottom: 100px;
  padding: 20px 0;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(30px)'};
  transition: all 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: ${props => `${props.colorPrimary}10`};
    top: -100px;
    right: -100px;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: ${props => `${props.colorPrimary}08`};
    bottom: -70px;
    left: -70px;
    z-index: -1;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;
`;

const SectionTitleWrapper = styled.div`
  display: inline-block;
  position: relative;
  
  &::before {
    content: "📚";
    position: absolute;
    font-size: 40px;
    opacity: 0.2;
    top: -20px;
    left: -35px;
    transform: rotate(-15deg);
    animation: ${float} 3s ease-in-out infinite;
  }
  
  &::after {
    content: "🐾";
    position: absolute;
    font-size: 30px;
    opacity: 0.2;
    bottom: -15px;
    right: -35px;
    transform: rotate(15deg);
    animation: ${float} 4s ease-in-out infinite reverse;
  }
`;

const SectionTitle = styled(Title)`
  font-weight: 800 !important;
  font-size: 36px !important;
  margin-bottom: 16px !important;
  position: relative;
  display: inline-block;
`;

const SubtitleGradient = styled.span`
  background: linear-gradient(90deg, 
    ${props => props.colorPrimary}, 
    ${props => props.colorPrimaryActive}, 
    ${props => props.colorPrimary});
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
  font-weight: 600;
`;

const SectionDivider = styled.div`
  position: relative;
  height: 4px;
  width: 120px;
  margin: 24px auto;
  background: ${props => `linear-gradient(to right, ${props.colorPrimary}, ${props.colorPrimaryActive})`};
  border-radius: 4px;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.6);
    animation: shine 2s infinite;
  }
  
  @keyframes shine {
    to {
      left: 100%;
    }
  }
`;

const BlogCard = styled(motion.div)`
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: white;
  position: relative;
  
  &:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const BlogCardInner = styled(Card)`
  height: 100%;
  border: none;
  overflow: hidden;
  
  .ant-card-cover {
    overflow: hidden;
    height: 220px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.2));
      z-index: 1;
    }
  }
  
  .ant-card-cover img {
    height: 100%;
    object-fit: cover;
    transition: all 0.5s ease;
  }
  
  &:hover .ant-card-cover img {
    transform: scale(1.08);
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const BlogCategoryTag = styled(Tag)`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  padding: 4px 12px;
  font-weight: 600;
  font-size: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const TrendingBadge = styled(Badge)`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  
  .ant-badge-count {
    background: linear-gradient(45deg, #ff4d4f, #ff7875);
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
    padding: 0 10px;
    font-weight: 600;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const BlogMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const BlogDate = styled(Text)`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.colorTextSecondary};
  font-size: 14px;
  background: ${props => `${props.colorPrimary}10`};
  padding: 4px 10px;
  border-radius: 100px;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => `${props.colorPrimary}20`};
  }
`;

const BlogStats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.colorTextSecondary};
  font-size: 14px;
  transition: all 0.3s;
  
  &:hover {
    color: ${props => props.colorPrimary};
  }
  
  .anticon {
    transition: all 0.3s;
  }
  
  &:hover .anticon {
    transform: scale(1.2);
  }
`;

const BlogTitle = styled(Link)`
  display: block;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 12px;
  color: ${props => props.colorTextHeading};
  transition: color 0.3s;
  
  &:hover {
    color: ${props => props.colorPrimary};
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-decoration-color: ${props => props.colorPrimary};
    text-underline-offset: 4px;
  }
  
  /* Limit to 2 lines with ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 62px;
`;

const BlogExcerpt = styled(Paragraph)`
  color: ${props => props.colorTextSecondary};
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 20px;
  
  /* Limit to 3 lines with ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 76px;
`;

const BlogFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const BlogAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateX(5px);
  }
`;

const AuthorAvatar = styled(Avatar)`
  background-color: ${props => `${props.colorPrimary}CC`};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const AuthorName = styled(Text)`
  font-weight: 600;
  color: ${props => props.colorTextHeading};
  transition: all 0.3s;
  
  &:hover {
    color: ${props => props.colorPrimary};
  }
`;

const ReadMoreLink = styled(Link)`
  color: ${props => props.colorPrimary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
  
  &:hover {
    gap: 8px;
    color: ${props => props.colorPrimaryActive};
  }
  
  .icon {
    transition: all 0.3s;
  }
  
  &:hover .icon {
    transform: translateX(4px);
  }
`;

const ViewAllButton = styled(Button)`
  margin-top: 60px;
  height: 52px;
  font-size: 17px;
  font-weight: 600;
  padding: 0 36px;
  border-radius: 100px;
  background: linear-gradient(45deg, ${props => props.colorPrimary}, ${props => props.colorPrimaryActive});
  border: none;
  box-shadow: 0 10px 20px ${props => `${props.colorPrimary}40`};
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 15px 30px ${props => `${props.colorPrimary}50`};
  }
  
  .anticon {
    font-size: 18px;
    transition: transform 0.3s ease;
  }
  
  &:hover .anticon {
    transform: translateX(5px);
  }
`;

const FloatingCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  background: ${props => props.color || props.colorPrimary};
  width: ${props => props.size || '150px'};
  height: ${props => props.size || '150px'};
  top: ${props => props.top || 'auto'};
  left: ${props => props.left || 'auto'};
  right: ${props => props.right || 'auto'};
  bottom: ${props => props.bottom || 'auto'};
  animation: ${float} ${props => props.duration || '20s'} ease-in-out infinite ${props => props.delay || '0s'};
  z-index: 0;
`;

const ShineHighlight = styled.div`
  position: absolute;
  top: ${props => props.top || 0};
  left: ${props => props.left || 0};
  width: ${props => props.width || '100px'};
  height: ${props => props.height || '100px'};
  background: rgba(255, 255, 255, 0.03);
  transform: rotate(${props => props.rotate || '45deg'});
  z-index: 0;
`;

// Main Component
const BlogSection = () => {
  const { token } = useToken();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  // Sample blog data with enhanced details
  const blogPosts = [
    {
      id: 1,
      title: "10 cách giúp thú cưng của bạn thoải mái trong mùa hè nóng bức",
      excerpt: "Mùa hè có thể gây ra nhiều khó chịu cho thú cưng với nhiệt độ cao. Hãy tìm hiểu các cách giúp bạn nhỏ của bạn luôn mát mẻ và thoải mái trong những ngày nắng nóng.",
      imageUrl: "/images/blogs/summer-pet-care.jpg",
      date: "20/06/2024",
      category: "Chăm sóc",
      isTrending: true,
      author: {
        name: "Bác sĩ Nguyễn Văn A",
        avatar: null
      },
      stats: {
        views: 1240,
        likes: 56,
        comments: 18
      }
    },
    {
      id: 2,
      title: "Hướng dẫn dinh dưỡng cho chó con dưới 6 tháng tuổi",
      excerpt: "Giai đoạn đầu đời của chó con rất quan trọng cho sự phát triển. Chế độ dinh dưỡng đúng cách sẽ giúp chó con phát triển khỏe mạnh và tăng cường hệ miễn dịch.",
      imageUrl: "/images/blogs/puppy-nutrition.jpg",
      date: "15/06/2024",
      category: "Dinh dưỡng",
      isTrending: false,
      isNew: true,
      author: {
        name: "Chuyên gia Trần Thị B",
        avatar: null
      },
      stats: {
        views: 956,
        likes: 42,
        comments: 15
      }
    },
    {
      id: 3,
      title: "5 dấu hiệu cho thấy mèo của bạn đang bị stress và cách khắc phục",
      excerpt: "Mèo thường giấu cảm xúc của mình, nhưng có những dấu hiệu tinh tế cho thấy chúng đang bị căng thẳng. Tìm hiểu cách nhận biết và giúp mèo vượt qua stress.",
      imageUrl: "/images/blogs/cat-stress.jpg",
      date: "08/06/2024",
      category: "Sức khỏe",
      isTrending: false,
      author: {
        name: "Bác sĩ Lê Văn C",
        avatar: null
      },
      stats: {
        views: 872,
        likes: 38,
        comments: 10
      }
    }
  ];
  
  // Function to get category color
  const getCategoryColor = (category) => {
    const categoryMap = {
      'Chăm sóc': '#52c41a', // Green with more vibrant color
      'Dinh dưỡng': '#faad14', // Gold with more vibrant color
      'Sức khỏe': '#1890ff', // Blue with more vibrant color
      'Huấn luyện': '#722ed1', // Purple with more vibrant color
      'Thú vị': '#eb2f96'   // Magenta with more vibrant color
    };
    
    return categoryMap[category] || '#1890ff';
  };
  
  // Card animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 50 
    },
    visible: (i) => ({ 
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.7,
        ease: [0.17, 0.67, 0.83, 0.67]
      }
    }),
    hover: {
      y: -15,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <SectionContainer 
      isVisible={isVisible} 
      ref={sectionRef}
      colorPrimary={token.colorPrimary}
    >
      {/* Decorative elements */}
      <FloatingCircle 
        colorPrimary={token.colorPrimary} 
        size="250px" 
        top="5%" 
        right="-5%" 
        duration="25s"
      />
      <FloatingCircle 
        colorPrimary={token.colorPrimary} 
        size="180px" 
        bottom="10%" 
        left="-5%" 
        duration="18s"
        delay="1s" 
      />
      <FloatingCircle 
        colorPrimary={token.colorPrimary} 
        size="120px" 
        top="40%" 
        left="10%" 
        duration="15s"
        delay="0.5s" 
      />
      
      <SectionHeader>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <SectionTitleWrapper>
            <SectionTitle level={2}>
              <span style={{ 
                background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Blog thú cưng
              </span>
            </SectionTitle>
          </SectionTitleWrapper>
          
          <Text style={{ 
            fontSize: '19px', 
            color: token.colorTextSecondary, 
            display: 'block', 
            marginBottom: '16px',
            maxWidth: '700px',
            margin: '24px auto',
            lineHeight: 1.6
          }}>
            Khám phá <SubtitleGradient 
              colorPrimary={token.colorPrimary}
              colorPrimaryActive={token.colorPrimaryActive}
            >kiến thức và mẹo hữu ích</SubtitleGradient> về chăm sóc thú cưng
          </Text>
          
          <SectionDivider 
            colorPrimary={token.colorPrimary} 
            colorPrimaryActive={token.colorPrimaryActive} 
          />
        </motion.div>
      </SectionHeader>
      
      <Row gutter={[32, 40]}>
        {blogPosts.map((post, index) => (
          <Col 
            xs={24} 
            sm={24} 
            md={8} 
            key={post.id}
          >
            <motion.div
              custom={index}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              whileHover="hover"
              variants={cardVariants}
            >
              <BlogCard>
                <BlogCardInner
                  hoverable
                  cover={
                    <img
                      alt={post.title}
                      src={post.imageUrl || `https://via.placeholder.com/600x400?text=${encodeURIComponent(post.title)}`}
                    />
                  }
                >
                  {/* Category Tag */}
                  <BlogCategoryTag color={getCategoryColor(post.category)}>
                    {post.category}
                  </BlogCategoryTag>
                  
                  {/* Trending Badge */}
                  {post.isTrending && (
                    <TrendingBadge count={<><FireOutlined /> Trending</>} />
                  )}
                  
                  {/* New Badge */}
                  {post.isNew && (
                    <TrendingBadge 
                      count={<><StarOutlined /> Mới</>} 
                      style={{ left: 'auto', right: 16, background: '#52c41a' }}
                    />
                  )}
                  
                  <BlogMeta>
                    <BlogDate 
                      colorTextSecondary={token.colorTextSecondary}
                      colorPrimary={token.colorPrimary}
                    >
                      <CalendarOutlined /> {post.date}
                    </BlogDate>
                  </BlogMeta>
                  
                  <BlogTitle 
                    to={`/blog/${post.id}`}
                    colorTextHeading={token.colorTextHeading}
                    colorPrimary={token.colorPrimary}
                  >
                    {post.title}
                  </BlogTitle>
                  
                  <BlogExcerpt colorTextSecondary={token.colorTextSecondary}>
                    {post.excerpt}
                  </BlogExcerpt>
                  
                  <Divider style={{ margin: '16px 0' }} />
                  
                  <BlogFooter>
                    <BlogAuthor>
                      <AuthorAvatar 
                        size={40} 
                        colorPrimary={token.colorPrimary}
                      >
                        {post.author.avatar || post.author.name.charAt(0)}
                      </AuthorAvatar>
                      <AuthorName 
                        colorTextHeading={token.colorTextHeading}
                        colorPrimary={token.colorPrimary}
                      >
                        {post.author.name}
                      </AuthorName>
                    </BlogAuthor>
                    
                    <BlogStats>
                      <StatItem 
                        colorTextSecondary={token.colorTextSecondary}
                        colorPrimary={token.colorPrimary}
                      >
                        <EyeOutlined /> {post.stats.views}
                      </StatItem>
                      <StatItem 
                        colorTextSecondary={token.colorTextSecondary}
                        colorPrimary={token.colorPrimary}
                      >
                        <HeartOutlined /> {post.stats.likes}
                      </StatItem>
                      <StatItem 
                        colorTextSecondary={token.colorTextSecondary}
                        colorPrimary={token.colorPrimary}
                      >
                        <CommentOutlined /> {post.stats.comments}
                      </StatItem>
                    </BlogStats>
                  </BlogFooter>
                </BlogCardInner>
              </BlogCard>
            </motion.div>
          </Col>
        ))}
      </Row>
      
      <motion.div 
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ 
          delay: 0.5, 
          duration: 0.7,
          ease: "easeOut"
        }}
      >
        <ViewAllButton 
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          colorPrimary={token.colorPrimary}
          colorPrimaryActive={token.colorPrimaryActive}
        >
          <Link to="/blog" style={{ color: 'white' }}>
            Xem tất cả bài viết <ArrowRightOutlined className="anticon" />
          </Link>
        </ViewAllButton>
      </motion.div>
    </SectionContainer>
  );
};

export default BlogSection;