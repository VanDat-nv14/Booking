import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Input, 
  Badge, 
  Avatar, 
  Divider, 
  Tag, 
  Typography, 
  Card, 
  theme
} from 'antd';
import {
  SendOutlined,
  CommentOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  HeartTwoTone,
  MessageOutlined,
  PlusOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const { Text, Title } = Typography;
const { useToken } = theme;

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const typing = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

// Styled Components
const ChatButtonContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FloatingButton = styled(Button)`
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  overflow: hidden;
  background: linear-gradient(135deg, ${props => props.colorPrimary}, ${props => props.colorPrimaryActive}) !important;
  
  &:hover {
    transform: rotate(15deg) scale(1.1);
    box-shadow: 0 8px 25px rgba(24, 144, 255, 0.6) !important;
  }
  
  .anticon {
    font-size: 24px !important;
  }
  
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
    animation: ${pulse} 3s infinite;
  }
`;

const ChatWindowContainer = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 360px;
  height: 550px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  background: white;
`;

const ChatHeader = styled.div`
  padding: 16px 20px;
  background: linear-gradient(135deg, ${props => props.colorPrimary}, ${props => props.colorPrimaryActive});
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='white' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  
  .avatar {
    margin-right: 12px;
    background: white;
    color: ${props => props.colorPrimary};
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      right: -50%;
      bottom: -50%;
      background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
      transform: rotate(45deg);
      animation: ${shimmer} 2s linear infinite;
    }
  }
  
  .title {
    font-weight: 700;
    font-size: 16px;
    color: white;
    margin: 0;
    
    span {
      display: block;
      font-size: 12px;
      opacity: 0.8;
      font-weight: normal;
    }
  }
`;

const CloseButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2) !important;
  border: none !important;
  color: white !important;
  width: 28px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  border-radius: 50% !important;
  transition: all 0.3s !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3) !important;
    transform: rotate(90deg);
  }
  
  .anticon {
    font-size: 14px;
  }
`;

const MessageSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: ${props => props.background || '#f9f9f9'};
  position: relative;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: linear-gradient(to bottom, rgba(249, 249, 249, 1), rgba(249, 249, 249, 0));
    pointer-events: none;
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: linear-gradient(to top, rgba(249, 249, 249, 1), rgba(249, 249, 249, 0));
    pointer-events: none;
    z-index: 1;
  }
`;

const MessageBubbleContainer = styled(motion.div)`
  display: flex;
  margin-bottom: 16px;
  justify-content: ${props => props.sender === 'bot' ? 'flex-start' : 'flex-end'};
`;

const BotMessageAvatar = styled(Avatar)`
  margin-right: 8px;
  background: linear-gradient(135deg, ${props => props.colorPrimary}, ${props => props.colorPrimaryActive}) !important;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMessageAvatar = styled(Avatar)`
  margin-left: 8px;
  background: linear-gradient(135deg, ${props => props.colorSecondary}, ${props => props.colorSecondaryActive}) !important;
  box-shadow: 0 4px 10px rgba(120, 120, 120, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: ${props => props.sender === 'bot' ? '2px 20px 20px 20px' : '20px 2px 20px 20px'};
  background: ${props => props.sender === 'bot' 
    ? 'white' 
    : `linear-gradient(135deg, ${props.colorPrimary}, ${props.colorPrimaryActive})`};
  color: ${props => props.sender === 'bot' ? props.colorText : 'white'};
  box-shadow: ${props => props.sender === 'bot' 
    ? '0 2px 10px rgba(0, 0, 0, 0.08)' 
    : '0 2px 10px rgba(24, 144, 255, 0.2)'};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    ${props => props.sender === 'bot' ? 'left: -10px' : 'right: -10px'};
    border-width: 0 10px 10px 0;
    border-style: solid;
    border-color: ${props => props.sender === 'bot' ? 'transparent white transparent transparent' : 'transparent'};
    display: ${props => props.sender === 'bot' ? 'block' : 'none'};
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  width: fit-content;
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${props => props.colorPrimary};
    animation: ${typing} 1.4s infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

const SuggestionsContainer = styled.div`
  padding: 16px;
  background: white;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid #f0f0f0;
`;

const SuggestionTag = styled(Tag)`
  padding: 6px 12px !important;
  border-radius: 100px !important;
  cursor: pointer !important;
  margin: 0 !important;
  font-size: 13px !important;
  border: 1px solid ${props => `${props.color}60`} !important;
  background: ${props => `${props.color}10`} !important;
  color: ${props => props.color} !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    background: ${props => `${props.color}20`} !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }
`;

const InputContainer = styled.div`
  padding: 16px;
  background: white;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: 10%;
    right: 10%;
    height: 3px;
    background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.05), transparent);
    border-radius: 50%;
  }
`;

const ChatInput = styled(Input)`
  border-radius: 100px !important;
  padding: 10px 16px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
  transition: all 0.3s !important;
  border-color: ${props => `${props.colorPrimary}30`} !important;
  
  &:hover, &:focus {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    border-color: ${props => props.colorPrimary} !important;
  }
`;

const SendButton = styled(Button)`
  width: 46px !important;
  height: 46px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.colorPrimary}, ${props => props.colorPrimaryActive}) !important;
  border: none !important;
  box-shadow: 0 4px 12px ${props => `${props.colorPrimary}40`} !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  
  &:hover {
    transform: rotate(15deg) scale(1.1);
    box-shadow: 0 6px 16px ${props => `${props.colorPrimary}60`} !important;
  }
  
  &:disabled {
    opacity: 0.6;
    background: #d9d9d9 !important;
    box-shadow: none !important;
  }
  
  .anticon {
    font-size: 20px;
  }
`;

// Main Component
const ChatbotSupport = () => {
  const { token } = useToken();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: 'Xin chào! Tôi là trợ lý AI của Pet Care. Rất vui được hỗ trợ bạn ngày hôm nay. Bạn cần tư vấn về vấn đề gì?', 
      sender: 'bot' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Danh sách gợi ý câu hỏi với màu sắc
  const suggestedQuestions = [
    { text: 'Dịch vụ của bạn là gì?', color: token.colorPrimary },
    { text: 'Làm thế nào để đặt lịch?', color: token.colorSuccess }, 
    { text: 'Chi phí như thế nào?', color: token.colorWarning },
    { text: 'Cách liên hệ với bạn?', color: token.colorInfo }
  ];

  // Hàm xử lý các câu trả lời tự động
  const getBotResponse = (userMessage) => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    const responses = {
      'dịch vụ': 'Chúng tôi cung cấp các dịch vụ toàn diện cho thú cưng của bạn, bao gồm:\n\n• Khám và điều trị bệnh\n• Tiêm phòng và xét nghiệm\n• Phẫu thuật và chăm sóc hậu phẫu\n• Tắm và cắt tỉa lông\n• Dịch vụ Spa và massage thư giãn\n• Khách sạn thú cưng cao cấp',
      'đặt lịch': 'Bạn có thể đặt lịch hẹn thông qua các cách sau:\n\n• Đặt lịch trực tiếp trên website của chúng tôi\n• Sử dụng ứng dụng di động PetCare\n• Gọi điện thoại đến tổng đài 1900-6789\n• Nhắn tin trực tiếp qua Fanpage Facebook\n\nHãy đặt lịch trước ít nhất 24 giờ để đảm bảo có chỗ cho thú cưng của bạn.',
      'giá': 'Giá dịch vụ của chúng tôi phụ thuộc vào loại thú cưng, kích thước và dịch vụ bạn lựa chọn. Một số mức giá tham khảo:\n\n• Khám tổng quát: 200.000đ - 500.000đ\n• Tiêm phòng: 300.000đ - 600.000đ\n• Tắm và vệ sinh: 150.000đ - 450.000đ\n• Cắt tỉa lông: 250.000đ - 800.000đ\n\nChúng tôi thường xuyên có các chương trình khuyến mãi cho khách hàng thân thiết.',
      'liên hệ': 'Bạn có thể liên hệ với chúng tôi qua:\n\n• Hotline: 1900-6789\n• Email: support@petcare.com\n• Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM\n• Facebook: fb.com/petcare\n• Instagram: @petcare.vn\n\nThời gian làm việc: 8:00 - 20:00 (Tất cả các ngày trong tuần)',
      'khám bệnh': 'Dịch vụ khám bệnh của chúng tôi bao gồm:\n\n• Khám tổng quát và kiểm tra sức khỏe định kỳ\n• Chẩn đoán bệnh với thiết bị hiện đại\n• Xét nghiệm máu và sinh hóa\n• Siêu âm và chụp X-quang\n• Tư vấn dinh dưỡng và chăm sóc sức khỏe\n\nĐội ngũ bác sĩ của chúng tôi đều được đào tạo tại các trường thú y hàng đầu và có nhiều năm kinh nghiệm.',
    };

    // Tìm từ khóa trong tin nhắn
    for (let [keyword, response] of Object.entries(responses)) {
      if (lowercaseMessage.includes(keyword)) {
        return response;
      }
    }

    return 'Cảm ơn bạn đã liên hệ. Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về dịch vụ, cách đặt lịch, giá cả, hoặc thông tin liên hệ. Hoặc bạn có thể để lại số điện thoại, chúng tôi sẽ gọi lại cho bạn sớm nhất có thể.';
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Thêm tin nhắn người dùng
    const newMessages = [
      ...messages, 
      { text: inputMessage, sender: 'user' }
    ];
    setMessages(newMessages);
    setInputMessage('');

    // Hiển thị bot đang nhập
    setIsTyping(true);

    // Lấy phản hồi của bot
    const botResponse = getBotResponse(inputMessage);
    
    // Thêm phản hồi của bot sau 1-2 giây để tạo hiệu ứng đang nhập
    setTimeout(() => {
      setIsTyping(false);
      setTimeout(() => {
        setMessages([
          ...newMessages,
          { text: botResponse, sender: 'bot' }
        ]);
      }, 300);
    }, 1000 + Math.random() * 1000);
  };

  // Hàm chọn câu hỏi gợi ý
  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    // Cần setTimeout để đảm bảo input được cập nhật trước khi gửi
    setTimeout(() => {
      handleSendMessage();
    }, 10);
  };

  // Chỉnh trạng thái khi mở/đóng chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  // Đặt badge khi nhận tin nhắn mới và chat đang đóng
  useEffect(() => {
    if (messages.length > 1 && !isOpen && messages[messages.length - 1].sender === 'bot') {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  // Format message text with line breaks
  const formatMessageText = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Animation variants for chat window
  const chatWindowVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      } 
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.9,
      transition: { 
        duration: 0.2 
      } 
    }
  };

  // Animation variants for message bubbles
  const messageBubbleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 20 
      } 
    }
  };

  return (
    <>
      <ChatButtonContainer>
        <Badge 
          count={hasNewMessage ? <HeartTwoTone twoToneColor="#eb2f96" /> : 0}
          offset={[-5, 5]}
        >
          <FloatingButton
            type="primary"
            shape="circle"
            icon={<CommentOutlined />}
            onClick={toggleChat}
            colorPrimary={token.colorPrimary}
            colorPrimaryActive={token.colorPrimaryActive}
          />
        </Badge>
      </ChatButtonContainer>

      <AnimatePresence>
        {isOpen && (
          <ChatWindowContainer
            variants={chatWindowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ChatHeader colorPrimary={token.colorPrimary} colorPrimaryActive={token.colorPrimaryActive}>
              <HeaderTitle colorPrimary={token.colorPrimary}>
                <Avatar 
                  className="avatar"
                  icon={<CustomerServiceOutlined />} 
                  size={40}
                />
                <div className="title">
                  Trợ lý Pet Care
                  <span>Hỗ trợ trực tuyến 24/7</span>
                </div>
              </HeaderTitle>
              <CloseButton 
                type="text"
                icon={<CloseOutlined />}
                onClick={toggleChat}
              />
            </ChatHeader>

            <MessageSection background={token.colorBgContainer}>
              {messages.map((msg, index) => (
                <MessageBubbleContainer
                  key={index}
                  sender={msg.sender}
                  variants={messageBubbleVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {msg.sender === 'bot' && (
                    <BotMessageAvatar 
                      icon={<RobotOutlined />} 
                      size={32}
                      colorPrimary={token.colorPrimary}
                      colorPrimaryActive={token.colorPrimaryActive}
                    />
                  )}
                  
                  <MessageBubble 
                    sender={msg.sender}
                    colorText={token.colorText}
                    colorPrimary={token.colorPrimary}
                    colorPrimaryActive={token.colorPrimaryActive}
                  >
                    <Text style={{ fontSize: '14px', lineHeight: 1.6 }}>
                      {formatMessageText(msg.text)}
                    </Text>
                  </MessageBubble>
                  
                  {msg.sender === 'user' && (
                    <UserMessageAvatar 
                      icon={<UserOutlined />} 
                      size={32}
                      colorSecondary={token.colorSuccess}
                      colorSecondaryActive={token.colorSuccessActive || token.colorSuccess}
                    />
                  )}
                </MessageBubbleContainer>
              ))}
              
              {isTyping && (
                <MessageBubbleContainer
                  sender="bot"
                  variants={messageBubbleVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <BotMessageAvatar 
                    icon={<RobotOutlined />} 
                    size={32}
                    colorPrimary={token.colorPrimary}
                    colorPrimaryActive={token.colorPrimaryActive}
                  />
                  <TypingIndicator colorPrimary={token.colorPrimary}>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </TypingIndicator>
                </MessageBubbleContainer>
              )}
              
              <div ref={messagesEndRef} />
            </MessageSection>

            {messages.length <= 1 && (
              <SuggestionsContainer>
                <div style={{ width: '100%', textAlign: 'center', marginBottom: '10px' }}>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    <QuestionCircleOutlined style={{ marginRight: '5px' }} />
                    Bạn có thể hỏi về:
                  </Text>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                  {suggestedQuestions.map((question, index) => (
                    <SuggestionTag
                      key={index}
                      color={question.color}
                      onClick={() => handleSuggestedQuestion(question.text)}
                      icon={<MessageOutlined />}
                    >
                      {question.text}
                    </SuggestionTag>
                  ))}
                </div>
              </SuggestionsContainer>
            )}

            <InputContainer>
              <ChatInput
                placeholder="Nhập câu hỏi của bạn..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={handleSendMessage}
                bordered
                colorPrimary={token.colorPrimary}
                prefix={<QuestionCircleOutlined style={{ color: `${token.colorPrimary}80` }} />}
              />
              <SendButton
                type="primary"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                icon={<SendOutlined />}
                colorPrimary={token.colorPrimary}
                colorPrimaryActive={token.colorPrimaryActive}
              />
            </InputContainer>
          </ChatWindowContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotSupport;