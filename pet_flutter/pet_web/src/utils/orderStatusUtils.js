import React from 'react';
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  GiftOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

// Trạng thái đơn hàng tiếng Việt
export const ORDER_STATUS = {
  CHO_XU_LY: 'ChoXuLy',
  DANG_XU_LY: 'DangXuLy', 
  DA_XAC_NHAN: 'DaXacNhan',
  DANG_GIAO_HANG: 'DangGiaoHang',
  DA_GIAO_HANG: 'DaGiaoHang',
  HOAN_THANH: 'HoanThanh',
  DA_HUY: 'DaHuy'
};

// Trạng thái thanh toán tiếng Việt
export const PAYMENT_STATUS = {
  CHO_THANH_TOAN: 'ChoThanhToan',
  DA_THANH_TOAN: 'DaThanhToan',
  DA_HUY: 'DaHuy'
};

// Mapping từ trạng thái cũ (tiếng Anh) sang trạng thái mới (tiếng Việt)
export const STATUS_MAPPING = {
  // Order Status
  'Pending': ORDER_STATUS.CHO_XU_LY,
  'Processing': ORDER_STATUS.DANG_XU_LY,
  'Confirmed': ORDER_STATUS.DA_XAC_NHAN,
  'Shipped': ORDER_STATUS.DANG_GIAO_HANG,
  'Delivered': ORDER_STATUS.DA_GIAO_HANG,
  'Completed': ORDER_STATUS.HOAN_THANH,
  'Cancelled': ORDER_STATUS.DA_HUY,
  
  // Payment Status
  'Paid': PAYMENT_STATUS.DA_THANH_TOAN
};

// Hàm chuyển đổi trạng thái từ backend sang frontend
export const normalizeOrderStatus = (status) => {
  if (!status) return ORDER_STATUS.CHO_XU_LY;
  
  // Nếu đã là trạng thái tiếng Việt, trả về nguyên bản
  if (Object.values(ORDER_STATUS).includes(status)) {
    return status;
  }
  
  // Nếu là trạng thái tiếng Anh, chuyển đổi
  return STATUS_MAPPING[status] || status;
};

// Hàm chuyển đổi trạng thái thanh toán
export const normalizePaymentStatus = (status) => {
  if (!status) return PAYMENT_STATUS.CHO_THANH_TOAN;
  
  // Nếu đã là trạng thái tiếng Việt, trả về nguyên bản
  if (Object.values(PAYMENT_STATUS).includes(status)) {
    return status;
  }
  
  // Nếu là trạng thái tiếng Anh, chuyển đổi
      return STATUS_MAPPING[status] || status;
  };

// Hàm lấy thông tin hiển thị cho trạng thái đơn hàng
export const getOrderStatusInfo = (status) => {
  const normalizedStatus = normalizeOrderStatus(status);
  
  switch (normalizedStatus) {
    case ORDER_STATUS.CHO_XU_LY:
      return {
        color: '#faad14',
        bgColor: 'rgba(250, 173, 20, 0.1)',
        text: 'Chờ xử lý',
        step: 0,
        antdStatus: 'processing',
        icon: <ClockCircleOutlined />
      };
    case ORDER_STATUS.DANG_XU_LY:
      return {
        color: '#faad14',
        bgColor: 'rgba(250, 173, 20, 0.1)',
        text: 'Đang xử lý',
        step: 1,
        antdStatus: 'processing',
        icon: <ExclamationCircleOutlined />
      };
    case ORDER_STATUS.DA_XAC_NHAN:
      return {
        color: '#1890ff',
        bgColor: 'rgba(24, 144, 255, 0.1)',
        text: 'Đã xác nhận',
        step: 2,
        antdStatus: 'processing',
        icon: <CheckCircleOutlined />
      };
    case ORDER_STATUS.DANG_GIAO_HANG:
      return {
        color: '#722ed1',
        bgColor: 'rgba(114, 46, 209, 0.1)',
        text: 'Đang giao hàng',
        step: 3,
        antdStatus: 'processing',
        icon: <TruckOutlined />
      };
    case ORDER_STATUS.DA_GIAO_HANG:
      return {
        color: '#52c41a',
        bgColor: 'rgba(82, 196, 26, 0.1)',
        text: 'Đã giao hàng',
        step: 4,
        antdStatus: 'success',
        icon: <GiftOutlined />
      };
    case ORDER_STATUS.HOAN_THANH:
      return {
        color: '#52c41a',
        bgColor: 'rgba(82, 196, 26, 0.1)',
        text: 'Hoàn thành',
        step: 5,
        antdStatus: 'success',
        icon: <CheckCircleOutlined />
      };
    case ORDER_STATUS.DA_HUY:
      return {
        color: '#ff4d4f',
        bgColor: 'rgba(255, 77, 79, 0.1)',
        text: 'Đã hủy',
        step: -1,
        antdStatus: 'error',
        icon: <CloseCircleOutlined />
      };
    default:
      return {
        color: '#8c8c8c',
        bgColor: 'rgba(140, 140, 140, 0.1)',
        text: 'Không xác định',
        step: 0,
        antdStatus: 'default',
        icon: <ClockCircleOutlined />
      };
  }
};

// Hàm lấy tổng số bước trong quy trình đơn hàng
export const getTotalOrderSteps = () => 6; // 0-5: Chờ xử lý -> Hoàn thành

// Hàm lấy mô tả chi tiết cho từng bước
export const getStepDescription = (step) => {
  const descriptions = {
    0: 'Đơn hàng đã được tạo và đang chờ xử lý',
    1: 'Cửa hàng đang chuẩn bị đơn hàng của bạn', 
    2: 'Đơn hàng đã được xác nhận và chuẩn bị giao',
    3: 'Đơn hàng đang trên đường đến với bạn',
    4: 'Đơn hàng đã được giao đến địa chỉ',
    5: 'Đơn hàng đã hoàn tất thành công'
  };
  return descriptions[step] || '';
};

// Hàm lấy thông tin hiển thị cho trạng thái thanh toán
export const getPaymentStatusInfo = (status) => {
  const normalizedStatus = normalizePaymentStatus(status);
  
  switch (normalizedStatus) {
    case PAYMENT_STATUS.CHO_THANH_TOAN:
      return {
        color: 'warning',
        text: 'Chưa thanh toán'
      };
    case PAYMENT_STATUS.DA_THANH_TOAN:
      return {
        color: 'success',
        text: 'Đã thanh toán'
      };
    case PAYMENT_STATUS.DA_HUY:
      return {
        color: 'error',
        text: 'Đã hủy thanh toán'
      };
    default:
      return {
        color: 'default',
        text: 'Không xác định'
      };
  }
};

// Danh sách trạng thái có thể cập nhật cho admin
export const getAdminStatusOptions = () => [
  { value: ORDER_STATUS.CHO_XU_LY, label: 'Chờ xử lý' },
  { value: ORDER_STATUS.DANG_XU_LY, label: 'Đang xử lý' },
  { value: ORDER_STATUS.DA_XAC_NHAN, label: 'Đã xác nhận' },
  { value: ORDER_STATUS.DANG_GIAO_HANG, label: 'Đang giao hàng' },
  { value: ORDER_STATUS.DA_GIAO_HANG, label: 'Đã giao hàng' },
  { value: ORDER_STATUS.HOAN_THANH, label: 'Hoàn thành' },
  { value: ORDER_STATUS.DA_HUY, label: 'Đã hủy' }
];

// Kiểm tra xem đơn hàng có thể hủy được không
export const canCancelOrder = (status) => {
  const normalizedStatus = normalizeOrderStatus(status);
  return [ORDER_STATUS.CHO_XU_LY, ORDER_STATUS.DANG_XU_LY].includes(normalizedStatus);
};

// Kiểm tra xem đơn hàng có thể cập nhật được không
export const canUpdateOrder = (status) => {
  const normalizedStatus = normalizeOrderStatus(status);
  return normalizedStatus !== ORDER_STATUS.DA_HUY && normalizedStatus !== ORDER_STATUS.HOAN_THANH;
}; 