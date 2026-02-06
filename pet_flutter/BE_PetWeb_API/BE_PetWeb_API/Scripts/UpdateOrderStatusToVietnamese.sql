-- Script cập nhật trạng thái đơn hàng từ tiếng Anh sang tiếng Việt
-- Chạy script này để migration dữ liệu cũ

-- Cập nhật trạng thái đơn hàng
UPDATE Orders 
SET Status = CASE 
    WHEN Status = 'Pending' THEN 'ChoXuLy'
    WHEN Status = 'Processing' THEN 'DangXuLy'
    WHEN Status = 'Confirmed' THEN 'DaXacNhan'
    WHEN Status = 'Shipped' THEN 'DangGiaoHang'
    WHEN Status = 'Delivered' THEN 'DaGiaoHang'
    WHEN Status = 'Completed' THEN 'HoanThanh'
    WHEN Status = 'Cancelled' THEN 'DaHuy'
    ELSE Status -- Giữ nguyên nếu không khớp
END
WHERE Status IN ('Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Completed', 'Cancelled');

-- Cập nhật trạng thái thanh toán
UPDATE Orders 
SET PaymentStatus = CASE 
    WHEN PaymentStatus = 'Pending' THEN 'ChoThanhToan'
    WHEN PaymentStatus = 'Paid' THEN 'DaThanhToan'
    WHEN PaymentStatus = 'Cancelled' THEN 'DaHuy'
    ELSE PaymentStatus -- Giữ nguyên nếu không khớp
END
WHERE PaymentStatus IN ('Pending', 'Paid', 'Cancelled');

-- Kiểm tra kết quả
SELECT 
    Status,
    COUNT(*) as SoLuong
FROM Orders 
GROUP BY Status
ORDER BY Status;

SELECT 
    PaymentStatus,
    COUNT(*) as SoLuong
FROM Orders 
GROUP BY PaymentStatus
ORDER BY PaymentStatus;

PRINT 'Đã cập nhật thành công trạng thái đơn hàng sang tiếng Việt!'; 