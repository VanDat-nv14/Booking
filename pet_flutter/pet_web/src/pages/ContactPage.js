import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Form, 
  Input, 
  Button, 
  Card, 
  Space, 
  Divider, 
  notification, 
  message, 
  Spin, 
  Avatar,
  Badge,
  theme
} from 'antd';
import { 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  SendOutlined,
  FacebookOutlined, 
  InstagramOutlined, 
  TwitterOutlined, 
  YoutubeOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;
const { Content } = Layout;
const { TextArea } = Input;

// Animation keyframes
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(125, 86, 240, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(125, 86, 240, 0); }
  100% { box-shadow: 0 0 0 0 rgba(125, 86, 240, 0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled components
const ContactHeader = styled.div`
  padding: 60px 0;
  text-align: center;
  background: linear-gradient(135deg, #7D56F0, #3A82F3);
  border-radius: 0 0 40px 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 60px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    transform: rotate(30deg);
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: ${shimmer} 3s infinite linear;
  }
`;

const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  border: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  height: 100%;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(125, 86, 240, 0.1), rgba(58, 130, 243, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #7D56F0;
  margin-right: 16px;
  transition: all 0.4s ease;
  
  &:hover {
    animation: ${pulse} 1.5s infinite;
    background: linear-gradient(135deg, #7D56F0, #3A82F3);
    color: white;
    transform: rotate(10deg);
  }
`;

const SocialButton = styled(Button)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  font-size: 20px;
  
  &:hover {
    transform: translateY(-5px) scale(1.1);
    background: linear-gradient(135deg, #7D56F0, #3A82F3);
    color: white;
  }
`;

const GradientButton = styled(Button)`
  background: linear-gradient(135deg, #7D56F0, #3A82F3);
  border: none;
  border-radius: 12px;
  height: 50px;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(58, 130, 243, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px rgba(58, 130, 243, 0.4);
    background: linear-gradient(135deg, #8A66FA, #4A92FF);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  background: linear-gradient(135deg, rgba(125, 86, 240, 0.15), rgba(58, 130, 243, 0.1));
  border-radius: 50%;
  z-index: 0;
`;

// Giả lập service gửi email liên hệ
const submitContactForm = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Form submitted:', formData);
      resolve({ success: true, message: 'Thông tin của bạn đã được gửi thành công!' });
    }, 1500);
  });
};

const ContactPage = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const token = useToken().token;
  
  // Intersection Observer để kích hoạt animation khi scroll
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

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      const response = await submitContactForm(values);
      
      if (response.success) {
        // Reset form
        form.resetFields();
        
        // Show success notification with animation
        notification.success({
          message: 'Gửi thành công!',
          description: response.message,
          icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
          placement: 'bottomRight',
          duration: 5
        });
        
        // Show animated success message
        message.success({
          content: 'Cảm ơn bạn đã liên hệ với chúng tôi!',
          icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
          duration: 3
        });
      } else {
        notification.error({
          message: 'Lỗi',
          description: response.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau!',
          placement: 'bottomRight',
          duration: 5
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã có lỗi xảy ra. Vui lòng thử lại sau!',
        placement: 'bottomRight',
        duration: 5
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact info data
  const contactInfo = [
    {
      icon: <PhoneOutlined />,
      title: "Điện thoại",
      details: ["(028) 3822 5678", "0901 234 567"]
    },
    {
      icon: <MailOutlined />,
      title: "Email",
      details: ["info@petweb.com", "support@petweb.com"]
    },
    {
      icon: <EnvironmentOutlined />,
      title: "Địa chỉ",
      details: ["123 Đường ABC, Phường XYZ,", "Quận 1, TP. Hồ Chí Minh"]
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Giờ làm việc",
      details: ["Thứ Hai - Thứ Bảy: 8:00 - 19:00", "Chủ Nhật: 8:00 - 17:00"]
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        damping: 15,
        stiffness: 300
      }
    }
  };

  return (
    <Layout style={{ background: token.colorBgContainer }}>
      <Content>
        {/* Animated Header */}
        <ContactHeader>
          <FloatingElement
            initial={{ scale: 0.8, x: "10%", y: "10%" }}
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              x: ["10%", "15%", "10%"],
              y: ["10%", "5%", "10%"]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut"
            }}
            style={{ 
              width: 200, 
              height: 200, 
              top: 20, 
              right: "20%" 
            }}
          />
          
          <FloatingElement
            initial={{ scale: 0.5, x: "-20%", y: "20%" }}
            animate={{ 
              scale: [0.5, 0.8, 0.5],
              x: ["-20%", "-25%", "-20%"],
              y: ["20%", "15%", "20%"]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 15,
              ease: "easeInOut"
            }}
            style={{ 
              width: 150, 
              height: 150, 
              bottom: 30, 
              left: "15%" 
            }}
          />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Title level={1} style={{ color: 'white', fontWeight: 800, marginBottom: 16, fontSize: 48 }}>
                Liên Hệ Với Chúng Tôi
              </Title>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 18 }}>
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
              </Text>
            </motion.div>
          </div>
        </ContactHeader>

        <div ref={sectionRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <Row gutter={[32, 32]}>
              {/* Contact Form */}
              <Col xs={24} lg={14}>
                <motion.div variants={itemVariants}>
                  <StyledCard>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Title level={3} style={{ fontWeight: 700, marginBottom: 12 }}>
                        <Badge
                          count="Liên hệ"
                          style={{
                            backgroundColor: 'rgba(125, 86, 240, 0.15)',
                            color: '#7D56F0',
                            fontWeight: 600,
                            marginRight: 12
                          }}
                        />
                        Gửi tin nhắn cho chúng tôi
                      </Title>
                      
                      <Paragraph style={{ color: token.colorTextSecondary, marginBottom: 30, fontSize: 16 }}>
                        Vui lòng điền đầy đủ thông tin bên dưới, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
                      </Paragraph>
                      
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        requiredMark={false}
                        size="large"
                      >
                        <Row gutter={16}>
                          <Col xs={24}>
                            <Form.Item
                              name="fullName"
                              label="Họ và tên"
                              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                              <Input 
                                prefix={<UserOutlined style={{ color: token.colorTextSecondary }} />} 
                                placeholder="Nhập họ và tên"
                                style={{ borderRadius: 8 }}
                              />
                            </Form.Item>
                          </Col>
                          
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="email"
                              label="Email"
                              rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' }
                              ]}
                            >
                              <Input 
                                prefix={<MailOutlined style={{ color: token.colorTextSecondary }} />} 
                                placeholder="Nhập email"
                                style={{ borderRadius: 8 }}
                              />
                            </Form.Item>
                          </Col>
                          
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="phone"
                              label="Số điện thoại"
                              rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { 
                                  pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 
                                  message: 'Số điện thoại không hợp lệ' 
                                }
                              ]}
                            >
                              <Input 
                                prefix={<PhoneOutlined style={{ color: token.colorTextSecondary }} />} 
                                placeholder="Nhập số điện thoại"
                                style={{ borderRadius: 8 }}
                              />
                            </Form.Item>
                          </Col>
                          
                          <Col xs={24}>
                            <Form.Item
                              name="subject"
                              label="Tiêu đề"
                              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                            >
                              <Input 
                                placeholder="Nhập tiêu đề"
                                style={{ borderRadius: 8 }}
                              />
                            </Form.Item>
                          </Col>
                          
                          <Col xs={24}>
                            <Form.Item
                              name="message"
                              label="Nội dung"
                              rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn' }]}
                            >
                              <TextArea 
                                prefix={<MessageOutlined style={{ color: token.colorTextSecondary }} />} 
                                placeholder="Nhập nội dung tin nhắn"
                                autoSize={{ minRows: 4, maxRows: 6 }}
                                style={{ borderRadius: 8 }}
                              />
                            </Form.Item>
                          </Col>
                          
                          <Col xs={24}>
                            <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                              <GradientButton 
                                type="primary" 
                                htmlType="submit" 
                                size="large"
                                icon={<SendOutlined />}
                                loading={isSubmitting}
                                style={{ width: 200 }}
                              >
                                Gửi tin nhắn
                              </GradientButton>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </motion.div>
                  </StyledCard>
                </motion.div>
              </Col>
              
              {/* Contact Info */}
              <Col xs={24} lg={10}>
                <motion.div variants={itemVariants}>
                  <StyledCard>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Title level={3} style={{ fontWeight: 700, marginBottom: 12 }}>
                        Thông tin liên hệ
                      </Title>
                      
                      <Paragraph style={{ color: token.colorTextSecondary, marginBottom: 30, fontSize: 16 }}>
                        Bạn có thể liên hệ trực tiếp với chúng tôi theo các thông tin dưới đây:
                      </Paragraph>
                      
                      <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        {contactInfo.map((info, index) => (
                          <motion.div 
                            key={index} 
                            whileHover={{ x: 10 }}
                            style={{ display: 'flex', alignItems: 'flex-start' }}
                          >
                            <IconWrapper>
                              {info.icon}
                            </IconWrapper>
                            
                            <div>
                              <Title level={5} style={{ margin: 0, marginBottom: 6, fontWeight: 600 }}>
                                {info.title}
                              </Title>
                              
                              {info.details.map((detail, i) => (
                                <Text key={i} style={{ display: 'block', color: token.colorTextSecondary }}>
                                  {detail}
                                </Text>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </Space>
                      
                      <Divider style={{ margin: '36px 0 24px' }}>
                        <Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>
                          KẾT NỐI VỚI CHÚNG TÔI
                        </Text>
                      </Divider>
                      
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <SocialButton type="default" icon={<FacebookOutlined />} />
                        <SocialButton type="default" icon={<InstagramOutlined />} />
                        <SocialButton type="default" icon={<TwitterOutlined />} />
                        <SocialButton type="default" icon={<YoutubeOutlined />} />
                      </div>
                    </motion.div>
                  </StyledCard>
                </motion.div>
              </Col>
            </Row>
            
            {/* Map */}
            <motion.div variants={itemVariants} style={{ marginTop: 32 }}>
              <StyledCard style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: 24 }}>
                  <Title level={4} style={{ fontWeight: 700, marginBottom: 16 }}>
                    Vị trí của chúng tôi
                  </Title>
                </div>
                
                <div 
                  style={{ 
                    height: 400, 
                    backgroundColor: token.colorBgContainer, 
                    border: `1px solid ${token.colorBorderSecondary}`,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ textAlign: 'center', color: token.colorTextSecondary }}>
                    <Avatar size={64} icon={<EnvironmentOutlined />} style={{ 
                      backgroundColor: 'rgba(125, 86, 240, 0.1)', 
                      color: '#7D56F0',
                      marginBottom: 16
                    }} />
                    <Title level={5} style={{ margin: 0 }}>Bản đồ Google Maps sẽ được hiển thị ở đây</Title>
                  </div>
                </div>
              </StyledCard>
            </motion.div>
          </motion.div>
        </div>
      </Content>
    </Layout>
  );
};

export default ContactPage;