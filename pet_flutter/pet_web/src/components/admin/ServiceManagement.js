import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../utils/axiosClient';
import serviceService from '../../services/serviceService';
import { 
  PlusOutlined, 
  SearchOutlined, 
  SyncOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  CloseOutlined, 
  UploadOutlined, 
  PictureOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  FileTextOutlined,
  HomeOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';

// Styled Components
const ServiceManagementContainer = styled.div`
  width: 100%;
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #1890ff 0%, #36cfc9 50%, #1890ff 100%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite linear;
  }

  h1 {
    font-size: 32px;
    font-weight: 600;
    color: #1f1f1f;
    margin: 0 0 35px 0;
    display: flex;
    align-items: center;
    gap: 15px;
    
    .anticon {
      font-size: 30px;
      background: linear-gradient(135deg, #1890ff, #36cfc9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  flex-wrap: wrap;
  gap: 16px;
  background: #f9fafb;
  padding: 16px 20px;
  border-radius: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 12px;
  font-size: 14px;
  padding: 14px 24px;

  &.primary {
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    color: white;
    box-shadow: 0 8px 16px rgba(24, 144, 255, 0.25);

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(24, 144, 255, 0.4);
    }
    
    &:active {
      transform: translateY(-2px);
    }
    
    .anticon {
      font-size: 16px;
    }
  }

  &.refresh {
    background: white;
    color: #5a5a5a;
    border: 1px solid #e8e8e8;

    &:hover {
      background: #f5f5f5;
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }

    .anticon-sync {
      font-size: 16px;
      color: #1890ff;
    }
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  input {
    width: 100%;
    padding: 14px 20px 14px 50px;
    border: 2px solid #e8e8e8;
    border-radius: 12px;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    color: #1f1f1f;
    background: white;

    &:focus {
      outline: none;
      border-color: #1890ff;
      box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.15);
    }
  }

  .anticon-search {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #8c8c8c;
    font-size: 18px;
    transition: all 0.3s ease;
  }
  
  &:focus-within .anticon-search {
    color: #1890ff;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #8c8c8c;

  .loader {
    width: 60px;
    height: 60px;
    border: 3px solid rgba(24, 144, 255, 0.1);
    border-radius: 50%;
    border-top: 3px solid #1890ff;
    margin-bottom: 20px;
    animation: spin 0.8s linear infinite;
    box-shadow: 0 5px 15px rgba(24, 144, 255, 0.15);
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    font-size: 16px;
    font-weight: 500;
    animation: pulse 1.5s ease infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const ErrorMessage = styled.div`
  background-color: #fff2f0;
  border-left: 4px solid #ff4d4f;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #ff4d4f;

  .anticon {
    font-size: 24px;
  }

  .error-text {
    font-weight: 500;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #8c8c8c;
  background: #f9fafb;
  border-radius: 16px;

  .anticon {
    font-size: 56px;
    margin-bottom: 20px;
    color: #1890ff;
  }

  p {
    font-size: 18px;
    max-width: 500px;
    margin: 0 auto;
  }
`;

const ServiceCategorySection = styled.div`
  margin-bottom: 45px;
  animation: slideUp 0.5s ease forwards;
  opacity: 0;
  
  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }

  &:last-child {
    margin-bottom: 0;
  }

  .category-title {
    font-size: 20px;
    font-weight: 600;
    color: #2B3674;
    margin-bottom: 25px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(67, 24, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    
    .anticon {
      color: #304FFE;
      font-size: 18px;
    }
  }
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  /* Thêm staggered animation */
  & > * {
    opacity: 0;
    animation: cardAppear 0.5s ease forwards;
  }
  
  & > *:nth-child(1) { animation-delay: 0.1s; }
  & > *:nth-child(2) { animation-delay: 0.2s; }
  & > *:nth-child(3) { animation-delay: 0.3s; }
  & > *:nth-child(4) { animation-delay: 0.4s; }
  & > *:nth-child(5) { animation-delay: 0.5s; }
  & > *:nth-child(6) { animation-delay: 0.6s; }
  
  @keyframes cardAppear {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Cập nhật ServiceCard để thêm hiệu ứng parallax khi hover
const ServiceCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, box-shadow;
  transform: perspective(1000px) rotateX(0) rotateY(0);
  position: relative;
  isolation: isolate;

  &:hover {
    transform: perspective(1000px) translateY(-15px) rotateX(2deg) rotateY(-2deg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      rgba(67, 24, 255, 0.03) 0%,
      rgba(134, 140, 255, 0.03) 100%
    );
    border-radius: 20px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
`;

const ServiceImage = styled.div`
  height: 180px;
  background: #F4F7FE;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .no-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #707EAE;

    .anticon {
      font-size: 40px;
      margin-bottom: 10px;
    }
  }
`;

// Cập nhật ServiceInfo để hiển thị giá và thời gian đẹp hơn
const ServiceInfo = styled.div`
  padding: 20px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    font-weight: 600;
    color: #2B3674;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #304FFE, transparent);
      transition: width 0.3s ease;
    }
  }

  ${ServiceCard}:hover h3::after {
    width: 100%;
  }

  .service-description {
    color: #707EAE;
    font-size: 14px;
    margin-bottom: 15px;
    height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .service-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    align-items: center;

    .price {
      display: flex;
      align-items: center;
      gap: 6px;

      span {
        background: linear-gradient(135deg, #05CD99 0%, #00A3FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
        font-size: 17px;
      }
      
      .anticon {
        color: #05CD99;
        font-size: 16px;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
      }
    }

    .duration {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #707EAE;

      span {
        font-weight: 500;
      }
      
      .anticon {
        color: #707EAE;
        font-size: 15px;
      }
    }
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 15px;
  
  &.active {
    background-color: rgba(5, 205, 153, 0.1);
    color: #05CD99;
    box-shadow: 0 5px 15px rgba(5, 205, 153, 0.15);
  }
  
  &.inactive {
    background-color: rgba(255, 82, 82, 0.1);
    color: #FF5252;
    box-shadow: 0 5px 15px rgba(255, 82, 82, 0.15);
  }
  
  .anticon {
    font-size: 14px;
  }
`;

const CardActions = styled.div`
  display: flex;
  border-top: 1px solid #E6E9F0;
  
  button {
    flex: 1;
    padding: 12px;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 500;
    color: #707EAE;
    transition: all 0.3s;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    
    &:hover {
      background: #F4F7FE;
    }
    
    &.button-edit:hover {
      color: #304FFE;
    }
    
    &.button-delete:hover {
      color: #FF5252;
    }
    
    &:first-child {
      border-right: 1px solid #E6E9F0;
    }
  }
`;

// Thêm component mới: FilterBar để lọc dịch vụ theo danh mục
const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
`;

const FilterButton = styled.button`
  padding: 10px 16px;
  border-radius: 12px;
  background: ${props => props.active ? 'linear-gradient(135deg, #304FFE 0%, #304FFE 100%)' : '#F4F7FE'};
  color: ${props => props.active ? 'white' : '#707EAE'};
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 8px 20px rgba(67, 24, 255, 0.25)' : 'none'};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(67, 24, 255, 0.2);
  }
`;

// Thêm component Stat Cards để hiển thị số lượng dịch vụ
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  
  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.bgColor || 'linear-gradient(135deg, #304FFE 0%, #304FFE 100%)'};
    color: white;
    font-size: 20px;
  }
  
  .content {
    h4 {
      font-size: 13px;
      color: #707EAE;
      margin: 0 0 5px;
    }
    
    .number {
      font-size: 24px;
      font-weight: 700;
      color: #2B3674;
      margin: 0;
    }
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 30px;
`;

const Modal = styled(motion.div)`
  background: white;
  width: 90%;
  max-width: 900px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(67, 24, 255, 0.05);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #304FFE, #304FFE);
    z-index: 1;
  }
`;

// Thêm các styled component cho form và modal ở phần styled components
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #E6E9F0;
  
  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #2B3674;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #707EAE;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  
  &:hover {
    background: #F4F7FE;
    color: #304FFE;
  }
`;

const ModalContent = styled.div`
  padding: 30px;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  
  label {
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
    color: #2B3674;
    font-size: 14px;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 14px;
    border: 2px solid #e6e9f0;
    border-radius: 14px;
    font-size: 14px;
    transition: all 0.3s;
    background: #F9FAFC;
    color: #2B3674;
    
    &:focus {
      outline: none;
      border-color: #304FFE;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.15);
      background: white;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .toggle-group {
    display: flex;
    gap: 10px;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 25px;
  }
  
  ${FormGroup} {
    flex: 1;
    margin-bottom: 0;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
  
  button {
    min-width: 120px;
  }
  
  .cancel {
    background: #F4F7FE;
    color: #707EAE;
    border: 1px solid #e6e9f0;
    
    &:hover {
      background: #E5ECF6;
    }
  }
  
  .danger {
    background: linear-gradient(135deg, #FF5252, #FF7676);
    color: white;
    box-shadow: 0 8px 20px rgba(255, 82, 82, 0.25);
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 25px rgba(255, 82, 82, 0.4);
    }
  }
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 2px solid ${props => props.active ? '#304FFE' : '#e6e9f0'};
  background: ${props => props.active ? 'rgba(67, 24, 255, 0.1)' : '#F9FAFC'};
  color: ${props => props.active ? '#304FFE' : '#707EAE'};
  border-radius: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  .anticon {
    font-size: 16px;
  }
  
  &:hover {
    background: ${props => props.active ? 'rgba(67, 24, 255, 0.15)' : '#F4F7FE'};
  }
`;

const ImageUpload = styled.div`
  .upload-area {
    width: 100%;
    height: 200px;
    border: 2px dashed #e6e9f0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    background: #F9FAFC;
    overflow: hidden;
    position: relative;
    
    &:hover {
      border-color: #304FFE;
      background: rgba(67, 24, 255, 0.05);
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    }
    
    .upload-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #707EAE;
      
      .anticon {
        font-size: 32px;
        margin-bottom: 10px;
      }
    }
  }
`;

const Toast = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px 25px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 300px;
  z-index: 2000;
  
  &.success {
    border-left: 5px solid #05CD99;
    
    .anticon {
      color: #05CD99;
      font-size: 20px;
    }
  }
  
  &.error {
    border-left: 5px solid #FF5252;
    
    .anticon {
      color: #FF5252;
      font-size: 20px;
    }
  }
  
  span {
    font-weight: 500;
  }
  
  animation: slideIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  thead tr {
    background: #f5f7fa;
    height: 60px;
  }

  th {
    font-weight: 600;
    color: #262626;
    text-align: left;
    padding: 20px 24px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1px;
      background-color: #f0f0f0;
    }
  }

  tr {
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.2s ease;
  }

  tbody tr {
    &:hover {
      background-color: #f5f7fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
  }

  td {
    padding: 18px 24px;
    color: #595959;
    font-size: 14px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }

  .title-cell {
    font-weight: 600;
    color: #262626;
    display: flex;
    align-items: center;
    gap: 15px;

    img {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      object-fit: cover;
      background-color: #f5f5f5;
      border: 1px solid #f0f0f0;
    }

    .title-details {
      display: flex;
      flex-direction: column;
      
      small {
        font-weight: normal;
        color: #8c8c8c;
        margin-top: 4px;
      }
    }
  }

  .price-cell {
    font-weight: 600;
    color: #52c41a;
  }

  .actions-cell {
    display: flex;
    gap: 15px;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.danger ? 'rgba(255, 77, 79, 0.1)' : 'rgba(24, 144, 255, 0.1)'};
  color: ${props => props.danger ? '#ff4d4f' : '#1890ff'};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.danger ? 'rgba(255, 77, 79, 0.2)' : 'rgba(24, 144, 255, 0.2)'};
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(0);
  }

  .anticon {
    font-size: 16px;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  .pagination-info {
    color: #8c8c8c;
    font-size: 14px;
  }

  .pagination-controls {
    display: flex;
    gap: 10px;
  }
`;

const PageButton = styled.button`
  min-width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 14px;
  background: ${props => props.active ? '#1890ff' : 'white'};
  color: ${props => props.active ? 'white' : '#595959'};
  border: 1px solid ${props => props.active ? '#1890ff' : '#e8e8e8'};

  &:hover:not(:disabled) {
    border-color: #1890ff;
    color: ${props => props.active ? 'white' : '#1890ff'};
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.icon-button {
    width: 40px;
  }

  .anticon {
    font-size: 14px;
  }
`;

// Thêm hàm formatCurrency ngay trước hoặc sau các hàm helper khác
const formatCurrency = (value) => {
  if (!value) return '';
  // Loại bỏ tất cả ký tự không phải số
  const numericValue = value.toString().replace(/[^0-9]/g, '');
  // Định dạng số với dấu phân cách hàng nghìn
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Thêm hàm parseCurrency để chuyển chuỗi định dạng về số
const parseCurrency = (formattedValue) => {
  if (!formattedValue) return '';
  // Loại bỏ tất cả ký tự không phải số
  return formattedValue.toString().replace(/[^0-9]/g, '');
};

// Định nghĩa component ServiceManagement
const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef(null);
  const [newImage, setNewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    isActive: true
  });
  
  // Thêm state mới
  const [filterCategory, setFilterCategory] = useState('All');
  const [stats, setStats] = useState({
    all: 0,
    active: 0,
    inactive: 0
  });

  // Thêm useEffect để tính toán stats
  useEffect(() => {
    if (services.length) {
      const activeServices = services.filter(s => s.isActive).length;
      setStats({
        all: services.length,
        active: activeServices,
        inactive: services.length - activeServices
      });
    }
  }, [services]);

  useEffect(() => {
    fetchServices();
  }, []);

  // Cập nhật fetchServices để xử lý URL ảnh đúng cách
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const servicesData = await serviceService.getAllServices();
      console.log("Services fetched:", servicesData);
      
      // Đảm bảo URL ảnh đúng định dạng
      const processedServices = servicesData.map(service => {
        if (service.photo && !service.photo.startsWith('http') && !service.photo.startsWith('data:')) {
          // Thêm tiền tố cho URL ảnh
          const photoPath = service.photo.startsWith('/') ? service.photo : `/${service.photo}`;
          return {
            ...service,
            photo: `https://localhost:7164${photoPath}`
          };
        }
        return service;
      });
      
      setServices(processedServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Các xử lý khác
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      isActive: true
    });
    setNewImage(null);
  };

  const handleAddNew = () => {
    resetForm();
    setEditMode(false);
    setCurrentService(null);
    setShowForm(true);
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Cập nhật handleSubmit để xử lý ảnh đúng cách
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.description.trim() || !formData.category || !formData.price || !formData.duration) {
      showToast('Vui lòng điền đầy đủ thông tin dịch vụ', 'error');
      return;
    }
    
    try {
      setLoading(true);
      console.log("Submitting form:", formData);
      
      // Prepare service data
      const serviceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(parseCurrency(formData.price)), // Chuyển đổi từ chuỗi định dạng về số
        duration: parseInt(formData.duration),
        isActive: formData.isActive
      };
      
      // Chỉ thêm ảnh vào formData nếu có ảnh mới được chọn
      if (newImage) {
        serviceData.photo = newImage;
      }
      
      let response;
      
      // Trong phần handleSubmit, cập nhật cách xử lý ảnh
      if (editMode) {
        // Update existing service
        response = await serviceService.updateService(currentService.serviceId, serviceData);
        
        // Nếu response không có ảnh nhưng service hiện tại có, giữ lại ảnh cũ
        if (!response.photo && currentService.photo) {
          response.photo = currentService.photo;
        } else if (response.photo && !response.photo.startsWith('http') && !response.photo.startsWith('data:')) {
          // Đảm bảo URL ảnh trả về từ API có tiền tố đúng
          const photoPath = response.photo.startsWith('/') ? response.photo : `/${response.photo}`;
          response.photo = `https://localhost:7164${photoPath}`;
        }
        
        // Update state
        setServices(services.map(service => 
          service.serviceId === currentService.serviceId ? 
          { ...response, serviceId: currentService.serviceId } : service
        ));
        
        showToast('Cập nhật dịch vụ thành công', 'success');
      } else {
        // Create new service
        response = await serviceService.createService(serviceData);
        
        // Đảm bảo URL ảnh trả về từ API có tiền tố đúng
        if (response.photo && !response.photo.startsWith('http') && !response.photo.startsWith('data:')) {
          const photoPath = response.photo.startsWith('/') ? response.photo : `/${response.photo}`;
          response.photo = `https://localhost:7164${photoPath}`;
        }
        
        // Add to state
        setServices([...services, response]);
        showToast('Thêm dịch vụ mới thành công', 'success');
      }
      
      // Reset form and close modal
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Error submitting service:', err);
      showToast(`Không thể ${editMode ? 'cập nhật' : 'thêm'} dịch vụ: ${err}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật handleDelete để sử dụng serviceService
  const confirmDeleteService = async () => {
    if (!confirmDelete) return;
    
    try {
      await serviceService.deleteService(confirmDelete);
      
      // Update local state after successful deletion
      setServices(services.filter(service => service.serviceId !== confirmDelete));
      showToast('Đã xóa dịch vụ thành công', 'success');
    } catch (err) {
      console.error('Error deleting service:', err);
      showToast('Không thể xóa dịch vụ. Vui lòng thử lại sau.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  // Helper functions
  const getCategoryLabel = (category) => {
    const categories = {
      'Grooming': 'Chăm sóc & Làm đẹp',
      'Healthcare': 'Y tế & Sức khỏe',
      'Training': 'Huấn luyện',
      'Boarding': 'Trông giữ qua đêm',
      'DayCare': 'Trông giữ ban ngày',
      'Other': 'Dịch vụ khác'
    };
    return categories[category] || category;
  };

  // Helper function to get the appropriate icon for a category
  const getCategoryIcon = (category) => {
    const icons = {
      'Grooming': <TagsOutlined />,
      'Healthcare': <InfoCircleOutlined />,
      'Training': <TagsOutlined />,
      'Boarding': <HomeOutlined />,
      'DayCare': <ClockCircleOutlined />,
      'Other': <FileTextOutlined />
    };
    return icons[category] || <FileTextOutlined />;
  };

  // Filter services based on selected category
  const filteredServicesByCategory = filterCategory === 'All' 
    ? services
    : services.filter(service => service.category === filterCategory);
  
  // Filter further by search term
  const filteredServices = filteredServicesByCategory.filter(service => 
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group services by category
  const servicesByCategory = filteredServices.reduce((acc, service) => {
    const category = service.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  // Thêm hàm handleEdit trong component ServiceManagement
  const handleEdit = (service) => {
    // Đảm bảo URL ảnh đã có tiền tố đúng
    const currentService = { ...service };
    if (currentService.photo && !currentService.photo.startsWith('http') && !currentService.photo.startsWith('data:')) {
      const photoPath = currentService.photo.startsWith('/') ? currentService.photo : `/${currentService.photo}`;
      currentService.photo = `https://localhost:7164${photoPath}`;
    }

    setCurrentService(currentService);
    setFormData({
      name: currentService.name || '',
      description: currentService.description || '',
      category: currentService.category || '',
      price: currentService.price || '',
      duration: currentService.duration || '',
      isActive: currentService.isActive === undefined ? true : currentService.isActive
    });
    setEditMode(true);
    setShowForm(true);
  };

  // Thêm hàm handleDelete trong component ServiceManagement
  const handleDelete = (serviceId) => {
    setConfirmDelete(serviceId);
  };

  // Cập nhật phần render của component
  return (
    <ServiceManagementContainer>
      <h1><CustomerServiceOutlined /> Quản lý dịch vụ</h1>
      
      {/* Stats Cards */}
      <StatsContainer>
        <StatCard>
          <div className="icon" style={{ background: 'linear-gradient(135deg, #304FFE 0%, #304FFE 100%)' }}>
            <CustomerServiceOutlined />
          </div>
          <div className="content">
            <h4>Tổng số dịch vụ</h4>
            <p className="number">{stats.all}</p>
          </div>
        </StatCard>
        <StatCard>
          <div className="icon" style={{ background: 'linear-gradient(135deg, #05CD99 0%, #00A3FF 100%)' }}>
            <CheckCircleOutlined />
          </div>
          <div className="content">
            <h4>Đang hoạt động</h4>
            <p className="number">{stats.active}</p>
          </div>
        </StatCard>
        <StatCard>
          <div className="icon" style={{ background: 'linear-gradient(135deg, #FF5252 0%, #FF7676 100%)' }}>
            <CloseCircleOutlined />
          </div>
          <div className="content">
            <h4>Ngừng hoạt động</h4>
            <p className="number">{stats.inactive}</p>
          </div>
        </StatCard>
      </StatsContainer>
      
      <ActionBar>
        <Button className="primary" onClick={handleAddNew}>
          <PlusOutlined /> Thêm dịch vụ mới
        </Button>
        
        <SearchBox>
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <SearchOutlined className="search-icon" />
        </SearchBox>
        
        <Button className="refresh" onClick={fetchServices}>
          <SyncOutlined spin={loading} /> Làm mới
        </Button>
      </ActionBar>
      
      {/* Filter Bar */}
      <FilterBar>
        <FilterButton 
          active={filterCategory === 'All'} 
          onClick={() => setFilterCategory('All')}
        >
          Tất cả
        </FilterButton>
        <FilterButton 
          active={filterCategory === 'Grooming'} 
          onClick={() => setFilterCategory('Grooming')}
        >
          Chăm sóc & Làm đẹp
        </FilterButton>
        <FilterButton 
          active={filterCategory === 'Healthcare'} 
          onClick={() => setFilterCategory('Healthcare')}
        >
          Y tế & Sức khỏe
        </FilterButton>
        <FilterButton 
          active={filterCategory === 'Training'} 
          onClick={() => setFilterCategory('Training')}
        >
          Huấn luyện
        </FilterButton>
        <FilterButton 
          active={filterCategory === 'Boarding'} 
          onClick={() => setFilterCategory('Boarding')}
        >
          Trông giữ qua đêm
        </FilterButton>
      </FilterBar>
      
      {/* Loading và error states */}
      {loading && (
        <LoadingContainer>
          <div className="loader"></div>
          <p>Đang tải danh sách dịch vụ...</p>
        </LoadingContainer>
      )}
      
      {error && !loading && (
        <ErrorMessage>
          <ExclamationCircleOutlined />
          <p className="error-text">{error}</p>
        </ErrorMessage>
      )}
      
      {/* Danh sách dịch vụ */}
      {!loading && !error && filteredServices.length === 0 && (
        <EmptyState>
          <InfoCircleOutlined />
          <p>Không tìm thấy dịch vụ nào. Hãy thêm dịch vụ mới.</p>
        </EmptyState>
      )}
      
      {!loading && !error && Object.keys(servicesByCategory).length > 0 && (
        <>
          {Object.keys(servicesByCategory).map(category => (
            <ServiceCategorySection key={category}>
              <h2 className="category-title">
                {getCategoryIcon(category)} {getCategoryLabel(category)}
              </h2>
              <ServiceGrid>
                {servicesByCategory[category].map(service => (
                  <ServiceCard 
                    key={service.serviceId}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ServiceImage>
                      {service.photo ? (
                        <img src={service.photo} alt={service.name} />
                      ) : (
                        <div className="no-image">
                          <PictureOutlined />
                          <span>Không có ảnh</span>
                        </div>
                      )}
                    </ServiceImage>
                    <ServiceInfo>
                      <h3>{service.name}</h3>
                      <p className="service-description">{service.description}</p>
                      <div className="service-details">
                        <span className="price">
                          <DollarOutlined /> 
                          <span>{service.price?.toLocaleString('vi-VN')} VNĐ</span>
                        </span>
                        <span className="duration">
                          <ClockCircleOutlined /> 
                          <span>{service.duration} phút</span>
                        </span>
                      </div>
                      <StatusBadge className={service.isActive ? 'active' : 'inactive'}>
                        {service.isActive ? 
                          <CheckCircleOutlined /> : 
                          <CloseCircleOutlined />
                        }
                        {service.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </StatusBadge>
                    </ServiceInfo>
                    <CardActions>
                      <button className="button-edit" onClick={() => handleEdit(service)}>
                        <EditOutlined /> Sửa
                      </button>
                      <button className="button-delete" onClick={() => handleDelete(service.serviceId)}>
                        <DeleteOutlined /> Xóa
                      </button>
                    </CardActions>
                  </ServiceCard>
                ))}
              </ServiceGrid>
            </ServiceCategorySection>
          ))}
        </>
      )}

      {/* Modal form thêm/sửa dịch vụ */}
      {showForm && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Modal
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <ModalHeader>
              <h2>{editMode ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}</h2>
              <CloseButton onClick={() => setShowForm(false)}>
                <CloseOutlined />
              </CloseButton>
            </ModalHeader>
            <ModalContent>
              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <label>Tên dịch vụ</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nhập tên dịch vụ"
                  />
                </FormGroup>
                <FormGroup>
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Nhập mô tả dịch vụ"
                    rows={4}
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <label>Danh mục</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      <option value="Grooming">Chăm sóc & Làm đẹp</option>
                      <option value="Healthcare">Y tế & Sức khỏe</option>
                      <option value="Training">Huấn luyện</option>
                      <option value="Boarding">Trông giữ qua đêm</option>
                      <option value="DayCare">Trông giữ ban ngày</option>
                      <option value="Other">Dịch vụ khác</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>Trạng thái</label>
                    <div className="toggle-group">
                      <ToggleButton 
                        active={formData.isActive} 
                        onClick={() => setFormData({...formData, isActive: true})}
                      >
                        <CheckCircleOutlined /> Hoạt động
                      </ToggleButton>
                      <ToggleButton 
                        active={!formData.isActive} 
                        onClick={() => setFormData({...formData, isActive: false})}
                      >
                        <CloseCircleOutlined /> Không hoạt động
                      </ToggleButton>
                    </div>
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <label>Giá (VNĐ)</label>
                    <input
                      type="text"
                      value={formatCurrency(formData.price)}
                      onChange={(e) => {
                        const numericValue = parseCurrency(e.target.value);
                        setFormData({...formData, price: numericValue});
                      }}
                      placeholder="Nhập giá dịch vụ (VNĐ)"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Thời gian (phút)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="Nhập thời gian thực hiện"
                      min="0"
                    />
                  </FormGroup>
                </FormRow>
                <FormGroup>
                  <label>Hình ảnh</label>
                  <ImageUpload>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setNewImage(file);
                          const reader = new FileReader();
                          reader.onload = function(evt) {
                            document.getElementById('imagePreview').src = evt.target.result;
                            document.getElementById('imagePreview').style.display = 'block';
                            document.getElementById('uploadIcon').style.display = 'none';
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div 
                      className="upload-area"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {editMode && currentService.photo && !newImage ? (
                        <img 
                          src={currentService.photo} 
                          alt="Preview" 
                          id="imagePreview" 
                          style={{ display: 'block' }}
                        />
                      ) : (
                        <>
                          <img 
                            src="" 
                            alt="Preview" 
                            id="imagePreview" 
                            style={{ display: 'none' }}
                          />
                          <div id="uploadIcon" className="upload-icon">
                            <UploadOutlined />
                            <span>Nhấn để tải lên hoặc kéo thả</span>
                          </div>
                        </>
                      )}
                    </div>
                  </ImageUpload>
                </FormGroup>
                <FormActions>
                  <Button type="button" className="cancel" onClick={() => setShowForm(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" className="primary" disabled={loading}>
                    {loading ? <SyncOutlined spin /> : null}
                    {editMode ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                </FormActions>
              </form>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}

      {/* Modal xác nhận xóa */}
      {confirmDelete && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Modal
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{ maxWidth: '500px' }}
          >
            <ModalHeader>
              <h2>Xác nhận xóa</h2>
              <CloseButton onClick={() => setConfirmDelete(null)}>
                <CloseOutlined />
              </CloseButton>
            </ModalHeader>
            <ModalContent style={{ textAlign: 'center', padding: '30px 20px' }}>
              <div className="confirm-icon">
                <ExclamationCircleOutlined style={{ fontSize: '60px', color: '#FF5252' }} />
              </div>
              <p style={{ fontSize: '16px', margin: '20px 0' }}>
                Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác.
              </p>
              <FormActions>
                <Button type="button" className="cancel" onClick={() => setConfirmDelete(null)}>
                  Hủy
                </Button>
                <Button 
                  type="button" 
                  className="danger" 
                  onClick={confirmDeleteService}
                  disabled={loading}
                >
                  {loading ? <SyncOutlined spin /> : null}
                  Xóa
                </Button>
              </FormActions>
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}

      {/* Toast notification */}
      {toast.show && (
        <Toast className={toast.type}>
          {toast.type === 'success' ? (
            <CheckCircleOutlined />
          ) : (
            <ExclamationCircleOutlined />
          )}
          <span>{toast.message}</span>
        </Toast>
      )}
    </ServiceManagementContainer>
  );
};

export default ServiceManagement;
