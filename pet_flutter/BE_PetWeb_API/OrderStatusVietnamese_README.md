# Cập nhật Trạng thái Đơn hàng sang Tiếng Việt

## Tổng quan
Đã cập nhật hệ thống quản lý trạng thái đơn hàng từ tiếng Anh sang tiếng Việt để phù hợp với người dùng Việt Nam.

## Các thay đổi chính

### 1. Backend Changes

#### Models/Order.cs
- Thêm `enum OrderStatus` và `enum PaymentStatus` với các giá trị tiếng Việt
- Cập nhật default values trong model `Order`

#### Services/Implementations/OrderService.cs
- Cập nhật tất cả logic validation và status checking
- Sử dụng enum thay vì hard-coded strings

#### Services/Implementations/PaymentService.cs  
- Cập nhật logic xử lý thanh toán với trạng thái tiếng Việt

### 2. Frontend Changes

#### utils/orderStatusUtils.js (Mới)
- Utility functions để quản lý trạng thái đơn hàng
- Mapping giữa trạng thái cũ và mới
- Functions hiển thị thông tin trạng thái

#### Các pages được cập nhật:
- `OrderDetailPage.js` 
- `OrdersPage.js`
- `OrderSuccessPage.js`

## Mapping Trạng thái

### Trạng thái Đơn hàng
| Tiếng Anh (Cũ) | Tiếng Việt (Mới) | Hiển thị |
|---|---|---|
| Pending | ChoXuLy | Chờ xử lý |
| Processing | DangXuLy | Đang xử lý |
| Confirmed | DaXacNhan | Đã xác nhận |
| Shipped | DangGiaoHang | Đang giao hàng |
| Delivered | DaGiaoHang | Đã giao hàng |
| Completed | HoanThanh | Hoàn thành |
| Cancelled | DaHuy | Đã hủy |

### Trạng thái Thanh toán
| Tiếng Anh (Cũ) | Tiếng Việt (Mới) | Hiển thị |
|---|---|---|
| Pending | ChoThanhToan | Chờ thanh toán |
| Paid | DaThanhToan | Đã thanh toán |
| Cancelled | DaHuy | Đã hủy thanh toán |

## Migration Script

Chạy script SQL `UpdateOrderStatusToVietnamese.sql` để cập nhật dữ liệu cũ:

```sql
-- Chạy file: Scripts/UpdateOrderStatusToVietnamese.sql
```

## Testing

### Backend API Testing
1. Tạo đơn hàng mới - kiểm tra default status là `ChoXuLy`
2. Cập nhật trạng thái đơn hàng - kiểm tra validation với trạng thái tiếng Việt
3. Hủy đơn hàng - kiểm tra logic hủy với trạng thái mới

### Frontend Testing  
1. Hiển thị danh sách đơn hàng - kiểm tra labels tiếng Việt
2. Chi tiết đơn hàng - kiểm tra progress bar và status info
3. Admin dashboard - kiểm tra filter options và status updates

## Backward Compatibility

Hệ thống hỗ trợ backward compatibility thông qua `orderStatusUtils.js`:
- Tự động chuyển đổi trạng thái cũ sang mới
- Hiển thị consistent trên frontend
- API endpoints vẫn hoạt động bình thường

## Notes

- Không cần thay đổi database schema
- API responses sẽ trả về trạng thái tiếng Việt
- Frontend tự động xử lý cả trạng thái cũ và mới
- Admin có thể cập nhật trạng thái bằng dropdown tiếng Việt

## Rollback

Nếu cần rollback, chạy script SQL ngược:

```sql
UPDATE Orders 
SET Status = CASE 
    WHEN Status = 'ChoXuLy' THEN 'Pending'
    WHEN Status = 'DangXuLy' THEN 'Processing'
    WHEN Status = 'DaXacNhan' THEN 'Confirmed'
    WHEN Status = 'DangGiaoHang' THEN 'Shipped'
    WHEN Status = 'DaGiaoHang' THEN 'Delivered'
    WHEN Status = 'HoanThanh' THEN 'Completed'
    WHEN Status = 'DaHuy' THEN 'Cancelled'
    ELSE Status
END;
``` 