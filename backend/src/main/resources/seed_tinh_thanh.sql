-- =====================================================
-- SEED DỮ LIỆU TỈNH THÀNH VIỆT NAM
-- Chạy script này trong SQL Server Management Studio
-- hoặc: sqlcmd -S localhost -d khach_san -i seed_tinh_thanh.sql
-- =====================================================

-- Đổi tên database nếu của bạn khác
USE khach_san;
GO

-- Chỉ chạy khi chưa có dữ liệu tỉnh thành
IF (SELECT COUNT(*) FROM tinh_thanh) = 0
BEGIN
-- 1. Lấy hoặc tạo Quốc gia Việt Nam
DECLARE @quocGiaId INT;
SELECT @quocGiaId = id FROM quoc_gia WHERE ten = N'Việt Nam';
IF @quocGiaId IS NULL
BEGIN
    INSERT INTO quoc_gia (ten, trang_thai) VALUES (N'Việt Nam', 1);
    SET @quocGiaId = SCOPE_IDENTITY();
    PRINT N'Đã tạo quốc gia: Việt Nam';
END

-- 2. Insert 63 tỉnh/thành phố
INSERT INTO tinh_thanh (ten, quoc_gia_id, trang_thai) VALUES
(N'Thành phố Hà Nội', @quocGiaId, 1),
(N'Tỉnh Hà Giang', @quocGiaId, 1),
(N'Tỉnh Cao Bằng', @quocGiaId, 1),
(N'Tỉnh Bắc Kạn', @quocGiaId, 1),
(N'Tỉnh Tuyên Quang', @quocGiaId, 1),
(N'Tỉnh Lào Cai', @quocGiaId, 1),
(N'Tỉnh Điện Biên', @quocGiaId, 1),
(N'Tỉnh Lai Châu', @quocGiaId, 1),
(N'Tỉnh Sơn La', @quocGiaId, 1),
(N'Tỉnh Yên Bái', @quocGiaId, 1),
(N'Tỉnh Hoà Bình', @quocGiaId, 1),
(N'Tỉnh Thái Nguyên', @quocGiaId, 1),
(N'Tỉnh Lạng Sơn', @quocGiaId, 1),
(N'Tỉnh Quảng Ninh', @quocGiaId, 1),
(N'Tỉnh Bắc Giang', @quocGiaId, 1),
(N'Tỉnh Phú Thọ', @quocGiaId, 1),
(N'Tỉnh Vĩnh Phúc', @quocGiaId, 1),
(N'Tỉnh Bắc Ninh', @quocGiaId, 1),
(N'Tỉnh Hải Dương', @quocGiaId, 1),
(N'Thành phố Hải Phòng', @quocGiaId, 1),
(N'Tỉnh Hưng Yên', @quocGiaId, 1),
(N'Tỉnh Thái Bình', @quocGiaId, 1),
(N'Tỉnh Hà Nam', @quocGiaId, 1),
(N'Tỉnh Nam Định', @quocGiaId, 1),
(N'Tỉnh Ninh Bình', @quocGiaId, 1),
(N'Tỉnh Thanh Hóa', @quocGiaId, 1),
(N'Tỉnh Nghệ An', @quocGiaId, 1),
(N'Tỉnh Hà Tĩnh', @quocGiaId, 1),
(N'Tỉnh Quảng Bình', @quocGiaId, 1),
(N'Tỉnh Quảng Trị', @quocGiaId, 1),
(N'Thành phố Huế', @quocGiaId, 1),
(N'Thành phố Đà Nẵng', @quocGiaId, 1),
(N'Tỉnh Quảng Nam', @quocGiaId, 1),
(N'Tỉnh Quảng Ngãi', @quocGiaId, 1),
(N'Tỉnh Bình Định', @quocGiaId, 1),
(N'Tỉnh Phú Yên', @quocGiaId, 1),
(N'Tỉnh Khánh Hòa', @quocGiaId, 1),
(N'Tỉnh Ninh Thuận', @quocGiaId, 1),
(N'Tỉnh Bình Thuận', @quocGiaId, 1),
(N'Tỉnh Kon Tum', @quocGiaId, 1),
(N'Tỉnh Gia Lai', @quocGiaId, 1),
(N'Tỉnh Đắk Lắk', @quocGiaId, 1),
(N'Tỉnh Đắk Nông', @quocGiaId, 1),
(N'Tỉnh Lâm Đồng', @quocGiaId, 1),
(N'Tỉnh Bình Phước', @quocGiaId, 1),
(N'Tỉnh Tây Ninh', @quocGiaId, 1),
(N'Tỉnh Bình Dương', @quocGiaId, 1),
(N'Tỉnh Đồng Nai', @quocGiaId, 1),
(N'Tỉnh Bà Rịa - Vũng Tàu', @quocGiaId, 1),
(N'Thành phố Hồ Chí Minh', @quocGiaId, 1),
(N'Tỉnh Long An', @quocGiaId, 1),
(N'Tỉnh Tiền Giang', @quocGiaId, 1),
(N'Tỉnh Bến Tre', @quocGiaId, 1),
(N'Tỉnh Trà Vinh', @quocGiaId, 1),
(N'Tỉnh Vĩnh Long', @quocGiaId, 1),
(N'Tỉnh Đồng Tháp', @quocGiaId, 1),
(N'Tỉnh An Giang', @quocGiaId, 1),
(N'Tỉnh Kiên Giang', @quocGiaId, 1),
(N'Thành phố Cần Thơ', @quocGiaId, 1),
(N'Tỉnh Hậu Giang', @quocGiaId, 1),
(N'Tỉnh Sóc Trăng', @quocGiaId, 1),
(N'Tỉnh Bạc Liêu', @quocGiaId, 1),
(N'Tỉnh Cà Mau', @quocGiaId, 1);

PRINT N'Đã thêm 63 tỉnh/thành phố.';

-- 3. Thêm vị trí mặc định "Tổng quan" cho mỗi tỉnh
INSERT INTO vi_tri (ten, tinh_thanh_id, trang_thai)
SELECT N'Tổng quan', id, 1 FROM tinh_thanh WHERE quoc_gia_id = @quocGiaId;

PRINT N'Đã thêm vị trí mặc định cho mỗi tỉnh.';
PRINT N'Hoàn tất seed dữ liệu tỉnh thành!';
END
ELSE
    PRINT N'Đã có dữ liệu tỉnh thành, bỏ qua seed.';
GO
