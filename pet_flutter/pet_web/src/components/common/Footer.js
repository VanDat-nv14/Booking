import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layout, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Divider, 
  Card, 
  Space, 
  Tooltip,
  FloatButton,
  Form,
  Input,
  message
} from 'antd';
import { 
  FacebookFilled, 
  InstagramFilled, 
  WechatOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  HomeOutlined, 
  MedicineBoxOutlined, 
  FileTextOutlined, 
  CustomerServiceOutlined, 
  RightOutlined,
  ArrowUpOutlined,
  HeartOutlined,
  SendOutlined,
  BellOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  GiftOutlined,
  StarOutlined,
  ClockCircleOutlined,
  SmileOutlined,
  CreditCardOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  TeamOutlined,
  
} from '@ant-design/icons';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const { Footer: AntFooter } = Layout;
const { Title, Text, Paragraph } = Typography;

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

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const wave = keyframes`
  0% { transform: translateY(0); }
  25% { transform: translateY(-5px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(5px); }
  100% { transform: translateY(0); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.6); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const morphBackground = keyframes`
  0% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
  50% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
  100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
`;

// Styled Components with updated animations
const AnimatedWave = styled.div`
  position: absolute;
  top: -40px;
  left: 0;
  width: 100%;
  height: 50px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%231890ff'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,118.92,22.88,168.9,57.32,37.94,26.08,78.09,46.21,117.71,69.07,24.4,14.05,70.52,23.05,70.52,23.05L0,0Z' opacity='.5' fill='%231890ff'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%231890ff'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 2;
  animation: ${css`${wave} 15s ease-in-out infinite`};
`;

const StyledFooter = styled(AntFooter)`
  position: relative;
  margin-top: 64px;
  padding: 60px 0 24px;
  color: white;
  background: linear-gradient(135deg, ${props => props.colors.primaryDark} 0%, ${props => props.colors.primary} 60%, ${props => props.colors.primaryLight} 100%);
  box-shadow: 0 -10px 40px rgba(9, 109, 217, 0.2);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 10% 20%, rgba(255,255,255,0.05) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(255,255,255,0.05) 0%, transparent 20%);
    z-index: 1;
    pointer-events: none;
  }
`;

const FloatingShape = styled.div`
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
  z-index: 0;
  background: ${props => props.color || '#ffffff'};
  transform-origin: center center;
  
  &.shape1 {
    width: 300px;
    height: 300px;
    top: -100px;
    right: 5%;
    animation: ${css`${morphBackground} 15s ease-in-out infinite, ${float} 20s ease-in-out infinite`};
  }
  
  &.shape2 {
    width: 200px;
    height: 200px;
    bottom: 10%;
    left: 10%;
    animation: ${css`${morphBackground} 20s ease-in-out infinite alternate, ${float} 15s ease-in-out infinite reverse`};
  }
  
  &.shape3 {
    width: 120px;
    height: 120px;
    bottom: 30%;
    right: 15%;
    animation: ${css`${morphBackground} 25s ease-in-out infinite, ${float} 17s ease-in-out infinite`};
  }
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
  
  .logo-icon {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 50%;
      border: 2px dashed rgba(255, 255, 255, 0.4);
      animation: ${css`${rotate} 12s linear infinite`};
    }
    
    &::before {
      content: '';
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
      animation: ${css`${pulse} 3s ease-in-out infinite`};
    }
  }
`;

const LogoText = styled(Title)`
  margin: 0;
  font-weight: 700;
  background: linear-gradient(90deg, #ffffff 0%, #e0e0e0 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${css`${shimmer} 3s ease-in-out infinite`};
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1px;
`;

const InfoCard = styled(Card)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
  perspective: 1000px;
  
  &:hover {
    transform: translateY(-8px) rotateX(5deg);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .ant-card-body {
    padding: 20px;
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      transform: rotate(30deg);
      opacity: 0;
      transition: opacity 0.5s ease;
    }
  }
  
  &:hover .ant-card-body::after {
    opacity: 1;
  }
`;

const SectionHeading = styled.div`
  position: relative;
  margin-bottom: 28px;
  padding-bottom: 12px;
  z-index: 1;
  
  h5 {
    font-weight: 700;
    color: white;
    margin: 0;
    font-size: 22px;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-family: 'Poppins', sans-serif;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 70px;
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(90deg, #FFC53D, #FF9F1C);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100px;
  }
`;

const FooterLinkButton = styled(Button)`
  text-align: left;
  padding: 12px 14px;
  height: auto;
  color: white;
  border: none;
  background: transparent;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 10px;
  margin-bottom: 6px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
    clip-path: polygon(0 0, 0% 100%, 100% 100%);
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: -1;
  }
  
  &:hover {
    padding-left: 22px;
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(5px);
    
    &::before {
      transform: translateX(0);
    }
    
    .arrow-icon {
      transform: translateX(5px);
      opacity: 1;
    }
  }
  
  .link-text {
    position: relative;
    z-index: 2;
    color: white;
    font-weight: 500;
    font-size: 15px;
    transition: all 0.3s ease;
  }
  
  &:hover .link-text {
    font-weight: 600;
  }
  
  .arrow-icon {
    margin-left: auto;
    font-size: 12px;
    opacity: 0.7;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: translateX(0);
    color: white;
  }
  
  .anticon {
    margin-right: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
  }
  
  &:hover .anticon {
    transform: scale(1.2);
  }
`;

const ContactCard = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    
    .contact-icon {
      transform: scale(1.15) rotate(10deg);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
      animation: ${css`${glow} 2s infinite`};
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      30deg, 
      rgba(255,255,255,0) 30%, 
      rgba(255,255,255,0.2) 50%, 
      rgba(255,255,255,0) 70%
    );
    transform: rotate(30deg) translateY(100%);
    transition: transform 0.6s ease;
  }
  
  &:hover::before {
    transform: rotate(30deg) translateY(-100%);
  }
  
  .contact-icon {
    background: linear-gradient(135deg, ${props => props.colors.primaryDark}, ${props => props.colors.primary});
    padding: 12px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    color: white;
    font-size: 20px;
  }
`;

const IconBubble = styled(motion.div)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, white, #f0f0f0);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15),
              inset 0 -2px 5px rgba(0,0,0,0.1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    box-shadow: inset 0 2px 5px rgba(255,255,255,0.6);
    z-index: 1;
  }
  
  .anticon {
    color: ${props => props.colors.primary};
    font-size: 22px;
    z-index: 2;
  }
`;

const SocialIcon = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 22px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.hoverBg};
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    transform: scale(0);
    transition: transform 0.5s ease;
    z-index: 1;
  }
  
  .anticon {
    position: relative;
    z-index: 2;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.1);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      transform: scale(1);
    }
  }
`;

const SubscribeForm = styled(Form)`
  margin-top: 20px;
  
  .ant-input {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 30px;
    height: 52px;
    padding: 0 20px;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 15px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    &:hover, &:focus {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }
  
  .subscribe-btn {
    height: 42px;
    border-radius: 25px;
    background: white;
    color: ${props => props.colors.primary};
    border: none;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    font-weight: 600;
    
    &:hover {
      transform: translateY(-3px) scale(1.05);
      background: white;
      color: ${props => props.colors.primaryDark};
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
    
    .btn-icon {
      margin-left: 6px;
      font-size: 16px;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    &:hover .btn-icon {
      transform: translateX(6px);
    }
  }
`;

const FooterFeatures = styled.div`
  display: flex;
  justify-content: center;
  margin: 40px 0 20px;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;

const FeatureItem = styled(motion.div)`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px;
  flex: 1;
  min-width: 200px;
  max-width: calc(33.333% - 14px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
    
    &::before {
      opacity: 1;
    }
    
    .feature-icon {
      transform: scale(1.2) rotate(10deg);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }
  }
  
  .feature-icon {
    margin-right: 14px;
    background: linear-gradient(135deg, white, #f0f0f0);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 1;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      box-shadow: inset 0 2px 5px rgba(255,255,255,0.6);
      z-index: 1;
    }
    
    .anticon {
      color: ${props => props.colors.primary};
      font-size: 20px;
      z-index: 2;
    }
  }
  
  .feature-text {
    color: white;
    font-weight: 600;
    font-size: 15px;
    line-height: 1.4;
    transition: all 0.3s ease;
  }
  
  &:hover .feature-text {
    transform: translateX(3px);
  }
  
  @media (max-width: 576px) {
    max-width: 100%;
    width: 100%;
  }
`;

const CopyrightText = styled(Text)`
  opacity: 0.9;
  font-size: 0.95rem;
  color: white;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    opacity: 1;
    transform: scale(1.03);
  }
`;

const BackToTopButton = styled(FloatButton.BackTop)`
  .ant-back-top-content {
    background: linear-gradient(135deg, ${props => props.colors.primary}, ${props => props.colors.primaryDark});
    height: 54px;
    width: 54px;
    border-radius: 50%;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%);
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 10px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      filter: blur(3px);
    }
    
    &:hover {
      background: linear-gradient(135deg, ${props => props.colors.primaryLight}, ${props => props.colors.primary});
      transform: translateY(-8px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
      
      .anticon {
        animation: ${css`${pulse} 1s infinite`};
      }
    }
    
    .anticon {
      position: relative;
      z-index: 2;
      transition: all 0.3s ease;
    }
  }
`;

// New Components
const ServiceTimes = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px;
  margin-top: 20px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
  }
  
  .time-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
    
    &:last-child {
      border-bottom: none;
    }
    
    .day {
      font-weight: 600;
      color: white;
    }
    
    .hours {
      color: rgba(255, 255, 255, 0.8);
    }
  }
`;

const AnimatedBadge = styled(motion.div)`
  background: #FF9F1C;
  color: white;
  font-weight: 600;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 20px;
  position: absolute;
  top: -10px;
  right: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
`;

const AchievementCounter = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 24px;
  gap: 12px;
  
  .counter-item {
    flex: 1;
    min-width: 110px;
    text-align: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-5px);
    }
    
    .count {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }
  }
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);
  
  // Sử dụng HeartOutlined thay cho PawOutlined
  const PetIcon = () => (
    <HeartOutlined style={{ fontSize: 24 }} />
  );
  
  // Màu sắc chính cho footer
  const footerColors = {
    primary: '#1890ff',
    primaryDark: '#096dd9',
    primaryLight: '#40a9ff',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    divider: 'rgba(255, 255, 255, 0.2)',
    iconBg: 'rgba(255, 255, 255, 0.1)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    socialFacebook: '#1877F2',
    socialInstagram: '#E4405F',
    socialZalo: '#0068FF'
  };
  
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };
  
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
    
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    
    return () => {
      if (footerRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  // Handle newsletter subscription
  const handleSubscribe = (values) => {
    console.log('Subscribed with email:', values.email);
    message.success('Cảm ơn bạn đã đăng ký nhận tin!');
  };
  
  return (
    <StyledFooter colors={footerColors} ref={footerRef}>
      <AnimatedWave />
      
      {/* Floating background shapes */}
      <FloatingShape className="shape1" color="white" />
      <FloatingShape className="shape2" color="white" />
      <FloatingShape className="shape3" color="white" />
      
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Main Footer Content */}
          <Row gutter={[48, 32]}>
            {/* Logo and Info Section */}
            <Col xs={24} md={8}>
              <motion.div variants={itemVariants}>
                <LogoContainer>
                  <div className="logo-icon">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      style={{
                        background: 'white',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      }}
                    >
                      <PetIcon style={{ color: footerColors.primary }} />
                    </motion.div>
                  </div>
                  <LogoText level={4}>
                    Pet Web
                  </LogoText>
                </LogoContainer>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <InfoCard bordered={false}>
                  <Paragraph style={{ color: 'white', margin: 0, lineHeight: 1.8, fontSize: '15px' }}>
                    Hệ thống quản lý thú cưng toàn diện, mang đến trải nghiệm tốt nhất cho thú cưng và chủ nuôi của bạn.
                    Chúng tôi hiểu tầm quan trọng của người bạn bốn chân trong cuộc sống của bạn.
                  </Paragraph>
                </InfoCard>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <AchievementCounter>
                  <motion.div 
                    className="counter-item"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="count">5K+</div>
                    <div className="label">Khách hàng</div>
                  </motion.div>
                  <motion.div 
                    className="counter-item"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="count">20+</div>
                    <div className="label">Bác sĩ</div>
                  </motion.div>
                  <motion.div 
                    className="counter-item"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="count">10+</div>
                    <div className="label">Năm kinh nghiệm</div>
                  </motion.div>
                </AchievementCounter>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <SubscribeForm 
                  colors={footerColors} 
                  layout="vertical" 
                  onFinish={handleSubscribe}
                >
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input 
                      placeholder="Nhận thông tin mới nhất..." 
                      suffix={
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          className="subscribe-btn"
                        >
                          Đăng ký <SendOutlined className="btn-icon" />
                        </Button>
                      }
                    />
                  </Form.Item>
                </SubscribeForm>
                
                <Text
                  style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    marginTop: 24,
                    marginBottom: 12,
                    letterSpacing: 0.5,
                    color: 'white',
                  }}
                >
                  KẾT NỐI VỚI CHÚNG TÔI
                </Text>
                
                <Space size={12}>
                  <Tooltip title="Facebook">
                    <SocialIcon 
                      href="https://facebook.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      colors={footerColors}
                      hoverBg={footerColors.socialFacebook}
                      whileHover={{ y: -5, scale: 1.1 }}
                    >
                      <FacebookFilled />
                    </SocialIcon>
                  </Tooltip>
                  
                  <Tooltip title="Instagram">
                    <SocialIcon 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      colors={footerColors}
                      hoverBg={footerColors.socialInstagram}
                      whileHover={{ y: -5, scale: 1.1 }}
                    >
                      <InstagramFilled />
                    </SocialIcon>
                  </Tooltip>
                  
                  <Tooltip title="Zalo">
                    <SocialIcon 
                      href="https://zalo.me" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      colors={footerColors}
                      hoverBg={footerColors.socialZalo}
                      whileHover={{ y: -5, scale: 1.1 }}
                    >
                      <WechatOutlined />
                    </SocialIcon>
                  </Tooltip>
                </Space>
              </motion.div>
            </Col>
            
            {/* Quick Links Section */}
            <Col xs={24} sm={12} md={8}>
              <motion.div variants={itemVariants}>
                <SectionHeading colors={footerColors}>
                  <Title level={5} style={{ color: 'white' }}>
                    Liên kết hữu ích
                  </Title>
                </SectionHeading>
              </motion.div>
              
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <motion.div variants={itemVariants}>
                  <FooterLinkButton
                    icon={<HomeOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Trang chủ</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <FooterLinkButton
                    icon={<MedicineBoxOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/services" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Dịch vụ</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <FooterLinkButton
                    icon={<ShopOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/products" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Sản phẩm</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <FooterLinkButton
                    icon={<FileTextOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/blog" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Blog & Tin tức</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <FooterLinkButton
                    icon={<TeamOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/staff" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Đội ngũ chuyên gia</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <FooterLinkButton
                    icon={<CustomerServiceOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/contact" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Liên hệ</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                </motion.div>
              </Space>
              
              <motion.div 
                variants={itemVariants} 
                style={{ marginTop: 32 }}
              >
                <SectionHeading colors={footerColors}>
                  <Title level={5} style={{ color: 'white' }}>
                    Chính sách
                  </Title>
                </SectionHeading>
                
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <FooterLinkButton
                    icon={<SafetyCertificateOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/policy/privacy" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Chính sách bảo mật</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                  
                  <FooterLinkButton
                    icon={<FileTextOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/policy/terms" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Điều khoản sử dụng</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                  
                  <FooterLinkButton
                    icon={<CreditCardOutlined style={{ color: 'white' }} />}
                    type="link"
                    block
                    colors={footerColors}
                  >
                    <Link to="/policy/payment" style={{ color: 'white', width: '100%', display: 'flex' }}>
                      <span className="link-text">Phương thức thanh toán</span>
                      <RightOutlined className="arrow-icon" />
                    </Link>
                  </FooterLinkButton>
                </Space>
              </motion.div>
            </Col>
            
            {/* Contact Info Section */}
            <Col xs={24} sm={12} md={8}>
              <motion.div variants={itemVariants}>
                <SectionHeading colors={footerColors}>
                  <Title level={5} style={{ color: 'white' }}>
                    Thông tin liên hệ
                  </Title>
                </SectionHeading>
              </motion.div>
              
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
                  <ContactCard 
                    colors={footerColors}
                    whileHover={{ y: -5 }}
                  >
                    <Space align="start">
                      <div className="contact-icon">
                        <MailOutlined style={{ color: 'white' }} />
                      </div>
                      <div>
                        <Text style={{ fontSize: '12px', opacity: 0.7, color: 'white', display: 'block' }}>
                          Email
                        </Text>
                        <Text strong style={{ color: 'white', fontSize: '16px' }}>
                          info@petweb.com
                        </Text>
                      </div>
                    </Space>
                  </ContactCard>
                </motion.div>
                
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
                  <ContactCard 
                    colors={footerColors}
                    whileHover={{ y: -5 }}
                  >
                    <Space align="start">
                      <div className="contact-icon">
                        <PhoneOutlined style={{ color: 'white' }} />
                      </div>
                      <div>
                        <Text style={{ fontSize: '12px', opacity: 0.7, color: 'white', display: 'block' }}>
                          Điện thoại
                        </Text>
                        <Text strong style={{ color: 'white', fontSize: '16px' }}>
                          0123 456 789
                        </Text>
                      </div>
                    </Space>
                  </ContactCard>
                </motion.div>
                
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
                  <ContactCard 
                    colors={footerColors}
                    whileHover={{ y: -5 }}
                  >
                    <Space align="start">
                      <div className="contact-icon">
                        <EnvironmentOutlined style={{ color: 'white' }} />
                      </div>
                      <div>
                        <Text style={{ fontSize: '12px', opacity: 0.7, color: 'white', display: 'block' }}>
                          Địa chỉ
                        </Text>
                        <Text strong style={{ color: 'white', fontSize: '16px' }}>
                          123 Đường ABC, Quận XYZ, Thành phố HCM
                        </Text>
                      </div>
                    </Space>
                  </ContactCard>
                </motion.div>
              </Space>
              
              <motion.div 
                variants={itemVariants}
                style={{ position: 'relative' }}
              >
                <AnimatedBadge
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 1 }}
                >
                  Mở cửa
                </AnimatedBadge>
                
                <ServiceTimes
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Text strong style={{ color: 'white', marginBottom: 8, fontSize: '16px' }}>
                    Giờ làm việc:
                  </Text>
                  
                  <div className="time-item">
                    <span className="day">Thứ Hai - Thứ Sáu:</span>
                    <span className="hours">8:00 - 19:00</span>
                  </div>
                  
                  <div className="time-item">
                    <span className="day">Thứ Bảy:</span>
                    <span className="hours">9:00 - 18:00</span>
                  </div>
                  
                  <div className="time-item">
                    <span className="day">Chủ Nhật:</span>
                    <span className="hours">9:00 - 17:00</span>
                  </div>
                </ServiceTimes>
              </motion.div>
            </Col>
          </Row>
          
          {/* Features Section */}
          <motion.div variants={fadeInVariants}>
            <FooterFeatures>
              <FeatureItem 
                colors={footerColors}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <div className="feature-icon">
                  <SafetyCertificateOutlined />
                </div>
                <div className="feature-text">Dịch vụ chất lượng cao</div>
              </FeatureItem>
              
              <FeatureItem 
                colors={footerColors}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <div className="feature-icon">
                  <CustomerServiceOutlined />
                </div>
                <div className="feature-text">Hỗ trợ 24/7</div>
              </FeatureItem>
              
              <FeatureItem 
                colors={footerColors}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <div className="feature-icon">
                  <ThunderboltOutlined />
                </div>
                <div className="feature-text">Phản hồi nhanh chóng</div>
              </FeatureItem>
              
              <FeatureItem 
                colors={footerColors}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <div className="feature-icon">
                  <SmileOutlined />
                </div>
                <div className="feature-text">Chăm sóc tận tình</div>
              </FeatureItem>
            </FooterFeatures>
          </motion.div>
          
          {/* Divider */}
          <Divider
            style={{
              margin: '32px 0 24px',
              borderColor: footerColors.divider,
            }}
          >
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            >
              <IconBubble 
                colors={footerColors}
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <PetIcon />
              </IconBubble>
            </motion.div>
          </Divider>
          
          {/* Copyright */}
          <motion.div
            variants={itemVariants}
            style={{
              textAlign: 'center',
              marginTop: 24,
              position: 'relative',
              zIndex: 1
            }}
          >
            <CopyrightText colors={footerColors}>
              © {currentYear} Pet Web. Tất cả quyền được bảo lưu | Thiết kế bởi ❤️ cho thú cưng của bạn
            </CopyrightText>
          </motion.div>
        </motion.div>
      </div>

      {/* Back to top button */}
      <BackToTopButton colors={footerColors}>
        <div className="ant-back-top-content">
          <ArrowUpOutlined />
        </div>
      </BackToTopButton>
    </StyledFooter>
  );
};

export default Footer;