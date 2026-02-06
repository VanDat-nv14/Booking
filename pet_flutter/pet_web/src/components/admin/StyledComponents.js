import styled from 'styled-components';

// Styled components cho tính năng gán nhân viên
export const UnassignedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 170, 0, 0.1), rgba(255, 140, 22, 0.15));
  border: 2px solid rgba(255, 170, 0, 0.3);
  color: #FFAA00;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 170, 0, 0.25);
    border-color: rgba(255, 170, 0, 0.5);
    
    &::before {
      left: 100%;
    }
    
    .warning-icon {
      animation: pulse 1s infinite;
    }
  }
  
  .warning-icon {
    font-size: 16px;
    color: #FF8C16;
  }
  
  .text {
    font-weight: 700;
  }
  
  .team-icon {
    font-size: 14px;
    opacity: 0.8;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

export const AssignedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(5, 205, 153, 0.1), rgba(0, 184, 148, 0.15));
  border: 2px solid rgba(5, 205, 153, 0.3);
  color: #05CD99;
  font-size: 13px;
  font-weight: 600;
  
  .team-icon {
    font-size: 16px;
    color: #00B894;
  }
  
  .text {
    font-weight: 700;
  }
`;

export const StaffAssignButton = styled.button`
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, rgba(67, 24, 255, 0.1), rgba(143, 107, 255, 0.15));
  color: #304FFE;
  border: 2px solid rgba(67, 24, 255, 0.2);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(67, 24, 255, 0.2), rgba(143, 107, 255, 0.25));
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(67, 24, 255, 0.25);
    border-color: rgba(67, 24, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  .anticon {
    font-size: 16px;
  }
`; 
