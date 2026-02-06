import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FeaturedProductsSection from '../components/FeaturedProductsSection';
import PartnersSection from '../components/PartnersSection';
import FAQSection from '../components/FAQSection';
import ChatbotSupport from '../components/ChatbotSupport';
import ServiceSection from '../components/ServiceSection';
import BlogSection from '../components/BlogSection';
import { 
  Layout,
  Typography, 
  Button, 
  Row, 
  Col, 
  Card, 
  Divider,
  Avatar,
  Rate,
  Carousel,
  Image,
  Space,
  Tag,
  Statistic,
  Badge,
  Tooltip,
  theme
} from 'antd';

import { 
  CalendarOutlined, 
  MedicineBoxOutlined, 
  ArrowRightOutlined, 
  CheckCircleOutlined, 
  StarFilled, 
  LeftOutlined, 
  RightOutlined, 
  TeamOutlined, 
  MedicineBoxOutlined as DoctorIcon, 
  CustomerServiceOutlined, 
  ClockCircleOutlined,
  MessageOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RocketOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { useToken } = theme;

// Custom Pet Icon since Ant Design doesn't have one
const PetIcon = props => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M4.5,9.5c0,0.8,0.7,1.5,1.5,1.5S7.5,10.3,7.5,9.5S6.8,8,6,8S4.5,8.7,4.5,9.5z M9,6c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1 S9.6,6,9,6z M13,6c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S13.6,6,13,6z M16.5,8c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5 s1.5-0.7,1.5-1.5S17.3,8,16.5,8z M19.5,10c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5S20.3,10,19.5,10z M18.5,13 c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5S19.3,13,18.5,13z M16,16c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1 S16.6,16,16,16z M12,16c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S12.6,16,12,16z M14.5,11c0,1.4-1.1,2.5-2.5,2.5S9.5,12.4,9.5,11 c0-0.3,0-0.5,0.1-0.7c-0.2,0.2-0.3,0.4-0.3,0.7c0,0.6,0.4,1,1,1s1-0.4,1-1c0-0.1,0-0.3-0.1-0.4c0.2,0.3,0.5,0.4,0.8,0.4 c0.3,0,0.5-0.1,0.7-0.3c0,0,0,0,0,0c0.5,0,0.9-0.2,1.3-0.4C14.3,10.3,14.5,10.6,14.5,11z M8,16c-0.6,0-1,0.4-1,1s0.4,1,1,1 s1-0.4,1-1S8.6,16,8,16z M4.5,13c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5S6,15.3,6,14.5S5.3,13,4.5,13z M3,10 c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S3.6,10,3,10z"></path>
  </svg>
);

// Enhanced ImageSlideshow Component
const ImageSlideshow = () => {
  const { token } = useToken();
  const carouselRef = useRef();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: '/images/banners/slide1.png',
      title: 'Chăm sóc thú cưng tận tình',
      description: 'Mang đến dịch vụ tốt nhất cho thú cưng của bạn',
      cta: 'Đặt lịch ngay',
      link: '/services'
    },
    {
      image: '/images/banners/slide2.png',
      title: 'Dịch vụ y tế chuyên nghiệp',
      description: 'Đội ngũ bác sĩ giàu kinh nghiệm',
      cta: 'Tìm hiểu thêm',
      link: '/services'
    },
    {
      image: '/images/banners/slide3.png',
      title: 'Không gian thân thiện',
      description: 'Môi trường an toàn và thoải mái cho thú cưng',
      cta: 'Xem không gian',
      link: '/about'
    }
  ];

  const handleSlideChange = (current) => {
    setCurrentSlide(current);
  };

  const SlideContent = ({ slide, index }) => (
    <div style={{ 
      position: 'relative',
      height: '550px',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${slide.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '20px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '850px',
        opacity: currentSlide === index ? 1 : 0,
        transform: currentSlide === index ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease-out'
      }}>
        <Title 
          level={1} 
          style={{ 
            color: 'white', 
            textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
            marginBottom: '20px',
            fontWeight: 800,
            fontSize: '3.5rem',
            letterSpacing: '-0.5px',
            transform: currentSlide === index ? 'scale(1)' : 'scale(0.95)',
            transition: 'transform 1s ease-out'
          }}
        >
          {slide.title}
        </Title>
        <Paragraph 
          style={{ 
            color: 'white', 
            fontSize: '22px',
            textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
            marginBottom: '40px',
            maxWidth: '700px',
            margin: '0 auto 40px'
          }}
        >
          {slide.description}
        </Paragraph>
        <Button
          type="primary"
          size="large"
          shape="round"
          style={{ 
            height: '54px',
            padding: '0 40px',
            fontSize: '18px',
            fontWeight: 600,
            background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
            boxShadow: '0 8px 25px rgba(24, 144, 255, 0.5)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="hero-button"
        >
          <Link to={slide.link} style={{ color: 'white' }}>{slide.cta}</Link>
        </Button>
      </div>
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px'
      }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => carouselRef.current.goTo(i)}
            style={{
              width: currentSlide === i ? '30px' : '10px',
              height: '10px',
              borderRadius: '5px',
              background: currentSlide === i 
                ? `linear-gradient(to right, ${token.colorPrimary}, ${token.colorPrimaryActive})`
                : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ 
      position: 'relative',
      marginBottom: '84px'
    }}>
      <Carousel
        autoplay
        effect="fade"
        afterChange={handleSlideChange}
        dots={false}
        ref={carouselRef}
        style={{ 
          boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {slides.map((slide, index) => (
          <div key={index}>
            <SlideContent slide={slide} index={index} />
          </div>
        ))}
      </Carousel>
      
      <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', zIndex: 2 }}>
        <Button 
          type="default" 
          shape="circle" 
          icon={<LeftOutlined />} 
          onClick={() => carouselRef.current.prev()}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            width: '50px',
            height: '50px'
          }}
          size="large"
          className="slider-nav-button"
        />
      </div>
      
      <div style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', zIndex: 2 }}>
        <Button 
          type="default" 
          shape="circle" 
          icon={<RightOutlined />} 
          onClick={() => carouselRef.current.next()}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            width: '50px',
            height: '50px'
          }}
          size="large"
          className="slider-nav-button"
        />
      </div>
      
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '10%',
        width: '80%',
        height: '60px',
        background: `linear-gradient(90deg, ${token.colorPrimaryBg}00, ${token.colorPrimaryBg}80, ${token.colorPrimaryBg}00)`,
        borderRadius: '50%',
        filter: 'blur(20px)',
        zIndex: -1
      }} />
    </div>
  );
};

// Enhanced StatsSection Component
const StatsSection = () => {
  const { token } = useToken();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);
  const sectionRef = useRef(null);
  const [animatedValues, setAnimatedValues] = useState({
    0: 0,
    1: 0,
    2: 0,
    3: 0
  });
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
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
  
  const stats = [
    { 
      value: 1000, 
      label: 'Khách hàng hài lòng', 
      icon: <TeamOutlined />,
      description: 'Các khách hàng tin tưởng chọn dịch vụ của chúng tôi'
    },
    { 
      value: 15, 
      label: 'Bác sĩ thú y', 
      icon: <DoctorIcon />,
      description: 'Đội ngũ bác sĩ chuyên môn cao, giàu kinh nghiệm'
    },
    { 
      value: 20, 
      label: 'Dịch vụ chuyên nghiệp', 
      icon: <CustomerServiceOutlined />,
      description: 'Đa dạng dịch vụ chăm sóc toàn diện cho thú cưng'
    },
    { 
      value: 5, 
      label: 'Năm kinh nghiệm', 
      icon: <ClockCircleOutlined />,
      description: 'Kinh nghiệm lâu năm trong ngành thú y và chăm sóc thú cưng'
    }
  ];
  
  useEffect(() => {
    if (isVisible) {
      stats.forEach((stat, index) => {
        const timer = setInterval(() => {
          setAnimatedValues(prev => {
            const current = prev[index];
            const increment = Math.ceil(stat.value / 30);
            const next = Math.min(current + increment, stat.value);
            
            if (next === stat.value) {
              clearInterval(timer);
            }
            
            return { ...prev, [index]: next };
          });
        }, 50);
        
        return () => clearInterval(timer);
      });
    }
  }, [isVisible]);
  
  return (
    <div 
      ref={sectionRef}
      style={{
        padding: '56px 40px',
        background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorPrimaryBgHover})`,
        borderRadius: '24px',
        marginBottom: '84px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 42px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '350px',
        height: '350px',
        background: `radial-gradient(circle at top right, ${token.colorPrimaryBg}40, transparent 70%)`,
        zIndex: 0
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '350px',
        height: '350px',
        background: `radial-gradient(circle at bottom left, ${token.colorPrimaryBg}40, transparent 70%)`,
        zIndex: 0
      }} />
      
      <Title 
        level={2} 
        style={{ 
          textAlign: 'center', 
          marginBottom: '50px',
          color: token.colorTextHeading,
          fontWeight: 700,
          position: 'relative',
          zIndex: 1,
          fontSize: '32px'
        }}
      >
        <span style={{ 
          background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Chúng tôi tự hào về
        </span>
        <div style={{
          width: '100px',
          height: '4px',
          background: `linear-gradient(to right, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
          margin: '16px auto 0',
          borderRadius: '2px'
        }} />
      </Title>
      
      <Row gutter={[48, 48]} justify="center">
        {stats.map((stat, index) => (
          <Col xs={12} sm={12} md={6} key={index}>
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isVisible 
                  ? hoveredStat === index 
                    ? 'translateY(-10px)' 
                    : 'translateY(0)' 
                  : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transitionDelay: `${index * 150}ms`,
                zIndex: 1,
                cursor: 'pointer',
                padding: '20px 10px',
                borderRadius: '16px',
                background: hoveredStat === index ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                boxShadow: hoveredStat === index ? '0 10px 30px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <Avatar
                size={90}
                icon={stat.icon}
                style={{
                  backgroundColor: hoveredStat === index ? token.colorPrimary : `${token.colorPrimary}CC`,
                  boxShadow: `0 12px 20px ${token.colorPrimary}40`,
                  marginBottom: '20px',
                  fontSize: '36px',
                  transition: 'all 0.3s ease'
                }}
              />
              <Statistic 
                value={animatedValues[index]} 
                suffix="+"
                valueStyle={{ 
                  color: hoveredStat === index ? token.colorPrimary : token.colorTextHeading, 
                  fontWeight: 700,
                  fontSize: '42px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
              <Text 
                style={{ 
                  fontSize: '18px', 
                  color: token.colorTextHeading,
                  marginTop: '8px',
                  textAlign: 'center',
                  fontWeight: 600
                }}
              >
                {stat.label}
              </Text>
              
              <Paragraph
                style={{
                  fontSize: '14px',
                  color: token.colorTextSecondary,
                  textAlign: 'center',
                  margin: '8px 0 0',
                  maxHeight: hoveredStat === index ? '60px' : '0',
                  opacity: hoveredStat === index ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {stat.description}
              </Paragraph>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// Enhanced StyledCard Component
const StyledCard = ({ icon, title, description, buttonText, buttonLink }) => {
  const { token } = useToken();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card
      hoverable
      style={{
        height: '100%',
        overflow: 'hidden',
        borderRadius: '18px',
        boxShadow: isHovered 
          ? `0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 2px ${token.colorPrimary}30` 
          : '0 6px 20px rgba(0, 0, 0, 0.07)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex',
        flexDirection: 'column',
        border: 'none',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0)'
      }}
      bodyStyle={{
        padding: '40px 30px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ 
        marginBottom: '24px',
        position: 'relative'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          background: isHovered 
            ? `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})` 
            : token.colorPrimaryBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s ease',
          transform: isHovered ? 'rotate(10deg)' : 'rotate(0)',
          boxShadow: isHovered 
            ? `0 12px 20px ${token.colorPrimary}50` 
            : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Avatar
            icon={icon}
            size={50}
            style={{
              backgroundColor: 'transparent',
              color: isHovered ? 'white' : token.colorPrimary,
              transition: 'all 0.3s',
              zIndex: 2
            }}
          />
          {isHovered && (
            <div style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              animation: 'ripple 1.5s infinite',
              zIndex: 1
            }} />
          )}
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '-5px',
          left: '10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isHovered ? token.colorPrimaryBg : 'transparent',
          transition: 'all 0.4s ease',
          opacity: isHovered ? 1 : 0
        }} />
      </div>
      
      <Title 
        level={4} 
        style={{ 
          marginBottom: '16px', 
          color: isHovered ? token.colorPrimary : token.colorTextHeading,
          transition: 'all 0.3s',
          fontSize: '22px'
        }}
      >
        {title}
      </Title>
      
      <Paragraph 
        style={{ 
          marginBottom: '28px', 
          color: token.colorTextSecondary, 
          fontSize: '16px', 
          flex: 1,
          lineHeight: 1.7
        }}
      >
        {description}
      </Paragraph>
      
      {buttonText && buttonLink && (
        <Button
          type="primary"
          size="large"
          icon={<ArrowRightOutlined style={{ 
            opacity: isHovered ? 1 : 0, 
            transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
            transition: 'all 0.3s ease',
            position: 'absolute',
            right: isHovered ? '20px' : '30px'
          }} />}
          style={{
            marginTop: 'auto',
            borderRadius: '12px',
            background: isHovered 
              ? `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})` 
              : `linear-gradient(45deg, ${token.colorPrimary}E0, ${token.colorPrimaryActive}E0)`,
            border: 'none',
            boxShadow: isHovered 
              ? `0 8px 20px ${token.colorPrimary}50` 
              : `0 4px 12px ${token.colorPrimary}30`,
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Link to={buttonLink} style={{ 
            color: 'white',
            padding: isHovered ? '0 28px 0 12px' : '0 12px',
            transition: 'all 0.3s ease',
            display: 'block'
          }}>
            {buttonText}
          </Link>
        </Button>
      )}
    </Card>
  );
};

// Enhanced ReviewsSection Component
const ReviewsSection = () => {
  const { token } = useToken();
  const carouselRef = useRef();
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
      { threshold: 0.2 }
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
  
  const reviews = [
    {
      name: 'Nguyễn Văn A',
      avatar: null,
      rating: 5,
      comment: 'Dịch vụ chăm sóc rất tốt, nhân viên nhiệt tình và chu đáo. Thú cưng của tôi rất thích đến đây. Tôi sẽ quay lại và giới thiệu cho bạn bè.',
      petType: 'Chó Golden',
      date: '12/08/2024'
    },
    {
      name: 'Trần Thị B',
      avatar: null,
      rating: 5,
      comment: 'Bác sĩ khám rất kỹ lưỡng và tư vấn chi tiết về cách chăm sóc sức khỏe cho mèo của tôi. Không gian sạch sẽ và rất thoải mái.',
      petType: 'Mèo Anh lông ngắn',
      date: '05/07/2024'
    },
    {
      name: 'Lê Văn C',
      avatar: null,
      rating: 4,
      comment: 'Dịch vụ cắt tỉa lông rất đẹp, thú cưng của tôi trông gọn gàng và đáng yêu hơn rất nhiều. Giá cả hợp lý cho chất lượng dịch vụ.',
      petType: 'Chó Poodle',
      date: '23/06/2024'
    }
  ];
  
  return (
    <div 
      ref={sectionRef}
      style={{ 
        marginBottom: '84px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'all 0.6s ease'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <Title level={2} style={{ 
          fontWeight: 700, 
          color: token.colorTextHeading,
          fontSize: '32px'
        }}>
          <span style={{ 
            background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Khách hàng nói gì về chúng tôi
          </span>
        </Title>
        <Text style={{ 
          fontSize: '18px', 
          color: token.colorTextSecondary, 
          display: 'block', 
          marginBottom: '16px',
          maxWidth: '700px',
          margin: '16px auto'
        }}>
          Những đánh giá chân thực từ khách hàng đã sử dụng dịch vụ
        </Text>
        <div style={{
          width: '80px',
          height: '4px',
          background: `linear-gradient(to right, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
          margin: '0 auto',
          borderRadius: '2px'
        }} />
      </div>
      
      <div style={{ 
        position: 'relative',
        marginTop: '30px'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '-5%',
          width: '110%',
          height: '60%',
          background: `linear-gradient(90deg, ${token.colorPrimaryBg}00, ${token.colorPrimaryBg}20, ${token.colorPrimaryBg}00)`,
          borderRadius: '50%',
          transform: 'translateY(-50%)',
          filter: 'blur(30px)',
          zIndex: -1
        }} />
        
        <Carousel
          ref={carouselRef}
          dots={false}
          autoplay
          autoplaySpeed={5000}
          effect="scrollx"
          style={{
            paddingBottom: '40px'
          }}
        >
          {reviews.map((review, index) => (
            <div key={index} style={{ padding: '10px' }}>
              <Card
                className="review-card"
                style={{
                  margin: '10px 20px 30px',
                  borderRadius: '24px',
                  border: 'none',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
                  overflow: 'visible',
                  background: `linear-gradient(145deg, white, ${token.colorBgElevated})`
                }}
                bodyStyle={{ padding: '40px 32px' }}
              >
                <MessageOutlined 
                  style={{ 
                    fontSize: '42px', 
                    color: token.colorPrimary, 
                    opacity: 0.15,
                    position: 'absolute',
                    top: 25,
                    left: 25
                  }} 
                />
                
                <div style={{ 
                  position: 'relative', 
                  zIndex: 1 
                }}>
                  <Rate 
                    disabled 
                    defaultValue={review.rating} 
                    character={<StarFilled style={{ fontSize: '18px' }} />}
                    style={{ marginBottom: '20px' }}
                  />
                  
                  <Paragraph 
                    style={{ 
                      fontSize: '18px',
                      fontStyle: 'italic',
                      marginBottom: '30px',
                      color: token.colorTextSecondary,
                      lineHeight: 1.7
                    }}
                  >
                    "{review.comment}"
                  </Paragraph>
                  
                  <Divider style={{ margin: '24px 0' }} />
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        size={70} 
                        style={{ 
                          backgroundColor: `${token.colorPrimary}CC`,
                          marginRight: '20px',
                          boxShadow: `0 8px 20px ${token.colorPrimary}40`,
                          fontSize: '28px',
                          fontWeight: 600
                        }}
                      >
                        {review.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Text style={{ 
                          fontSize: '20px', 
                          fontWeight: 600, 
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          {review.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '15px' }}>
                          {review.petType} • {review.date}
                        </Text>
                      </div>
                    </div>
                    
                    <Badge 
                      count={<HeartFilled style={{ color: '#ff4d4f' }} />} 
                      style={{
                        backgroundColor: 'white',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                        padding: '8px 12px',
                        borderRadius: '20px'
                      }}
                    >
                      <Text style={{ paddingRight: '8px', fontWeight: 500 }}>
                        Khách hàng yêu thích
                      </Text>
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </Carousel>
        
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '12px'
        }}>
          {reviews.map((_, index) => (
            <div
              key={index}
              onClick={() => carouselRef.current.goTo(index)}
              style={{
                width: '40px',
                height: '8px',
                borderRadius: '4px',
                background: `${token.colorPrimary}${index === 0 ? 'FF' : '40'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
        
        <Button
          type="default"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={() => carouselRef.current.prev()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '-25px',
            transform: 'translateY(-80%)',
            zIndex: 2,
            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
            width: '50px',
            height: '50px'
          }}
          size="large"
          className="slider-nav-button"
        />
        
        <Button
          type="default"
          shape="circle"
          icon={<RightOutlined />}
          onClick={() => carouselRef.current.next()}
          style={{
            position: 'absolute',
            top: '50%',
            right: '-25px',
            transform: 'translateY(-80%)',
            zIndex: 2,
            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
            width: '50px',
            height: '50px'
          }}
          size="large"
          className="slider-nav-button"
        />
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Button
          type="primary"
          icon={<ArrowRightOutlined />}
          size="large"
          shape="round"
          style={{
            padding: '0 40px',
            height: '50px',
            fontSize: '16px',
            background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
            border: 'none',
            boxShadow: `0 8px 20px ${token.colorPrimary}40`,
            position: 'relative',
            overflow: 'hidden'
          }}
          className="pulse-button"
        >
          <Link to="/reviews" style={{ color: 'white' }}>Xem tất cả đánh giá</Link>
        </Button>
      </div>
    </div>
  );
};

// Enhanced WhyChooseUsSection Component
const WhyChooseUsSection = () => {
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
      { threshold: 0.2 }
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
  
  const reasons = [
    {
      title: 'Đội ngũ chuyên nghiệp',
      description: 'Bác sĩ thú y và nhân viên giàu kinh nghiệm, được đào tạo bài bản, luôn cập nhật kiến thức chuyên môn và kỹ năng mới nhất.',
      icon: <TeamOutlined />
    },
    {
      title: 'Trang thiết bị hiện đại',
      description: 'Sử dụng công nghệ và thiết bị y tế tiên tiến nhất, đảm bảo thú cưng của bạn được chăm sóc với chất lượng tốt nhất.',
      icon: <SafetyCertificateOutlined />
    },
    {
      title: 'Dịch vụ toàn diện',
      description: 'Đáp ứng mọi nhu cầu từ khám chữa bệnh đến làm đẹp cho thú cưng với phương pháp chăm sóc toàn diện và cá nhân hóa.',
      icon: <TrophyOutlined />
    },
    {
      title: 'Môi trường thân thiện',
      description: 'Không gian sạch sẽ, thoáng mát, thân thiện với thú cưng, giúp thú cưng của bạn cảm thấy thoải mái và an toàn.',
      icon: <HeartFilled />
    }
  ];
  
  return (
    <div 
      ref={sectionRef}
      style={{ 
        marginBottom: '84px',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}
    >
      <Title 
        level={2} 
        style={{ 
          textAlign: 'center', 
          fontWeight: 700, 
          marginBottom: '16px',
          fontSize: '32px'
        }}
      >
        <span style={{ 
          background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Tại sao chọn chúng tôi?
        </span>
      </Title>
      
      <div style={{
        width: '80px',
        height: '4px',
        background: `linear-gradient(to right, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
        margin: '0 auto 20px',
        borderRadius: '2px'
      }} />
      
      <Paragraph style={{
        fontSize: '18px',
        color: token.colorTextSecondary,
        textAlign: 'center',
        maxWidth: '700px',
        margin: '0 auto 40px',
        lineHeight: 1.7
      }}>
        Chúng tôi cam kết mang đến dịch vụ chăm sóc thú cưng hàng đầu với sự tận tâm và chuyên nghiệp
      </Paragraph>
      
      <Row gutter={[32, 32]}>
        {reasons.map((reason, index) => (
          <Col xs={24} sm={12} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible ? 1 : 0,
                transitionDelay: `${index * 150}ms`
              }}
              bodyStyle={{ padding: '30px' }}
              className="feature-card"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar
                  icon={reason.icon}
                  size={56}
                  style={{
                    backgroundColor: `${token.colorPrimary}15`,
                    color: token.colorPrimary,
                    marginRight: '20px',
                    marginTop: '4px',
                    fontSize: '26px',
                    transition: 'all 0.3s'
                  }}
                  className="feature-icon"
                />
                
                <div>
                  <Title level={4} style={{ 
                    marginBottom: '14px', 
                    color: token.colorPrimary,
                    transition: 'all 0.3s',
                    fontSize: '22px'
                  }}>
                    {reason.title}
                  </Title>
                  <Paragraph style={{ 
                    marginBottom: 0, 
                    color: token.colorTextSecondary, 
                    fontSize: '16px',
                    lineHeight: 1.7
                  }}>
                    {reason.description}
                  </Paragraph>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// Enhanced FeaturesList Component for non-logged-in users
const FeaturesList = () => {
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
      { threshold: 0.2 }
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
  
  return (
    <div 
      ref={sectionRef}
      style={{ 
        marginTop: '84px',
        marginBottom: '84px',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at 80% 20%, ${token.colorPrimaryBg}50, transparent 60%)`,
        zIndex: -1
      }} />
      
      <Title 
        level={2} 
        style={{ 
          textAlign: 'center', 
          fontWeight: 700, 
          marginBottom: '16px',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.6s ease',
          fontSize: '32px'
        }}
      >
        <span style={{ 
          background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Tính năng nổi bật
        </span>
      </Title>
      
      <div style={{
        width: '80px',
        height: '4px',
        background: `linear-gradient(to right, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
        margin: '0 auto 40px',
        borderRadius: '2px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease 0.1s'
      }} />
      
      <Paragraph style={{
        fontSize: '18px',
        color: token.colorTextSecondary,
        textAlign: 'center',
        maxWidth: '700px',
        margin: '0 auto 40px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease 0.2s',
        lineHeight: 1.7
      }}>
        Trải nghiệm các tính năng hiện đại giúp chăm sóc thú cưng của bạn tốt hơn
      </Paragraph>
      
      <Row gutter={[40, 40]}>
        <Col 
          xs={24} 
          md={8}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
          }}
        >
          <StyledCard
            icon={<PetIcon />}
            title="Quản lý thú cưng"
            description="Lưu trữ thông tin thú cưng, theo dõi chế độ ăn uống và lịch trình tiêm chủng. Đồng bộ dữ liệu trên mọi thiết bị để dễ dàng theo dõi."
          />
        </Col>
        
        <Col 
          xs={24} 
          md={8}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s'
          }}
        >
          <StyledCard
            icon={<CalendarOutlined />}
            title="Đặt lịch dễ dàng"
            description="Đặt lịch hẹn trực tuyến với bác sĩ thú y và các dịch vụ chăm sóc. Nhận thông báo nhắc nhở và xác nhận tự động qua email hoặc SMS."
          />
        </Col>
        
        <Col 
          xs={24} 
          md={8}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s'
          }}
        >
          <StyledCard
            icon={<MedicineBoxOutlined />}
            title="Theo dõi sức khỏe"
            description="Hồ sơ y tế đầy đủ, lịch sử điều trị và nhắc nhở tiêm chủng. Theo dõi quá trình phát triển và sức khỏe thú cưng qua các biểu đồ trực quan."
          />
        </Col>
      </Row>
    </div>
  );
};

// Enhanced CTASection Component
const CTASection = () => {
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
      { threshold: 0.2 }
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
  
  return (
    <div 
      ref={sectionRef}
      style={{ 
        margin: '100px 0',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease'
      }}
    >
      <Card
        style={{
          background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorPrimaryBgHover})`,
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: 'none',
          overflow: 'hidden',
          position: 'relative'
        }}
        bodyStyle={{ padding: '60px 40px' }}
      >
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${token.colorPrimary}20, transparent 70%)`,
          zIndex: 0
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${token.colorPrimary}20, transparent 70%)`,
          zIndex: 0
        }} />
        
        <Row align="middle" justify="center">
          <Col xs={24} md={16} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Title 
              level={2} 
              style={{ 
                color: token.colorTextHeading, 
                marginBottom: '24px',
                fontWeight: 700,
                fontSize: '36px'
              }}
            >
              <span style={{ 
                background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Bắt đầu chăm sóc thú cưng của bạn ngay hôm nay
              </span>
            </Title>
            
            <Paragraph style={{
              fontSize: '18px',
              color: token.colorTextSecondary,
              marginBottom: '40px',
              maxWidth: '700px',
              margin: '0 auto 40px',
              lineHeight: 1.7
            }}>
              Đăng ký tài khoản để sử dụng đầy đủ các tính năng và nhận ưu đãi đặc biệt dành cho thành viên mới
            </Paragraph>
            
            <Space size="large">
              <Button
                type="primary"
                size="large"
                style={{ 
                  height: '54px',
                  padding: '0 40px',
                  fontWeight: 600,
                  fontSize: '18px',
                  background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                  border: 'none',
                  boxShadow: `0 10px 20px ${token.colorPrimary}40`,
                  borderRadius: '27px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="pulse-button"
              >
                <Link to="/login" style={{ color: 'white', position: 'relative', zIndex: 2 }}>Đăng nhập</Link>
                <div className="button-glow" />
              </Button>
              
              <Button
                size="large"
                style={{ 
                  height: '54px',
                  padding: '0 40px',
                  borderRadius: '27px',
                  fontWeight: 600,
                  fontSize: '18px',
                  border: `2px solid ${token.colorPrimary}`,
                  color: token.colorPrimary,
                  background: 'white'
                }}
                className="scale-button"
              >
                <Link to="/register">Đăng ký</Link>
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// Main HomePage Component
const HomePage = () => {
  const auth = useAuth();
  const user = auth?.user;
  const { token } = useToken();
  
  return (
    <Layout style={{ background: token.colorBgContainer }}>
      <Content>
        {/* Hero section / Slideshow */}
        <ImageSlideshow />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Stats section */}
          <StatsSection />
          
          {user ? (
            <div>
              <Title 
                level={2} 
                style={{ 
                  marginBottom: '32px', 
                  fontWeight: 700,
                  fontSize: '32px'
                }}
              >
                Xin chào, <span style={{ 
                  color: token.colorPrimary,
                  background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {user.fullName || user.username}
                </span>!
              </Title>
              
              <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                  <StyledCard 
                    icon={<PetIcon />}
                    title="Thú cưng của bạn"
                    description="Quản lý thông tin thú cưng và theo dõi lịch chăm sóc"
                    buttonText="Xem thú cưng"
                    buttonLink="/pets"
                  />
                </Col>
                
                <Col xs={24} md={8}>
                  <StyledCard 
                    icon={<CalendarOutlined />}
                    title="Lịch hẹn"
                    description="Đặt lịch hẹn chăm sóc và khám sức khỏe cho thú cưng"
                    buttonText="Quản lý lịch hẹn"
                    buttonLink="/appointments"
                  />
                </Col>
                
                <Col xs={24} md={8}>
                  <StyledCard 
                    icon={<MedicineBoxOutlined />}
                    title="Hồ sơ y tế"
                    description="Theo dõi lịch sử y tế, tiêm chủng và điều trị"
                    buttonText="Xem hồ sơ"
                    buttonLink="/medical-records"
                  />
                </Col>
              </Row>
              
              {/* Service section */}
              <div style={{ marginTop: '84px' }}>
                <ServiceSection />
              </div>
              
              {/* Why choose us section */}
              <div style={{ marginTop: '84px' }}>
                <WhyChooseUsSection />
              </div>
              
              <FeaturedProductsSection />
              
              <BlogSection />
              {/* Reviews section */}
              <ReviewsSection />
              
              <FAQSection />
              
              <PartnersSection />
            </div>
          ) : (
            <div>
              {/* Service section - Đặt đầu tiên cho user chưa đăng nhập */}
              <ServiceSection />
              
              {/* Why choose us section */}
              <div style={{ marginTop: '84px' }}>
                <WhyChooseUsSection />
              </div>
              
              <FeaturesList />
              
              {/* Reviews section */}
              <ReviewsSection />
              
              <FeaturedProductsSection />
              
              <BlogSection /> 


              <PartnersSection />
              
              <FAQSection />
              
              <CTASection />
            </div>
          )}
        </div>
      </Content>
      <ChatbotSupport />
      
      {/* Global styles for animations */}
      <style jsx="true">{`
        .hero-button {
          position: relative;
          overflow: hidden;
        }
        
        .hero-button::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }
        
        @keyframes shine {
          0% {
            left: -100%;
            top: -100%;
          }
          20%, 100% {
            left: 100%;
            top: 100%;
          }
        }
        
        .slider-nav-button:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
        }
        
        .pulse-button {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
          }
        }
        
        .scale-button:hover {
          transform: scale(1.05);
          transition: transform 0.3s ease;
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.2) rotate(10deg);
          background-color: ${token.colorPrimary} !important;
          color: white !important;
        }

        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .review-card {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .review-card:hover {
          transform: translateY(-10px);
        }
      `}</style>
    </Layout>
  );
};

export default HomePage;