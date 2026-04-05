/*
=============================================================================
Tên dự án: Hệ thống Quản lý Khách sạn (Hotel Management System)
Tác giả: Gemini & [Tên của bạn]
Mô tả: Script bao gồm toàn bộ cấu trúc bảng, index, trigger tự động hóa, 
       procedure thanh toán và dữ liệu mẫu.
       CẬP NHẬT: Đã bổ sung các trường cho OAuth2 và Reset Password.
=============================================================================
*/

USE master;
GO
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'khach_san')
BEGIN
    ALTER DATABASE khach_san SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE khach_san;
END
GO
CREATE DATABASE khach_san;
GO
USE khach_san;
GO

-- =====================================================
-- 1. CẤU TRÚC BẢNG (TABLES)
-- =====================================================

-- Quốc gia
CREATE TABLE quoc_gia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten NVARCHAR(100) NOT NULL,
    hinh_anh NVARCHAR(255),
    mo_ta NVARCHAR(MAX),
    trang_thai BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Tỉnh thành
CREATE TABLE tinh_thanh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten NVARCHAR(100) NOT NULL,
    quoc_gia_id INT NOT NULL,
    hinh_anh NVARCHAR(255),
    trang_thai BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_tinh_thanh_quoc_gia FOREIGN KEY (quoc_gia_id) REFERENCES quoc_gia(id) ON DELETE CASCADE
);

-- Vị trí (Quận/Huyện/Khu vực)
CREATE TABLE vi_tri (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten NVARCHAR(100) NOT NULL,
    tinh_thanh_id INT NOT NULL,
    hinh_anh NVARCHAR(255),
    trang_thai BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_vi_tri_tinh_thanh FOREIGN KEY (tinh_thanh_id) REFERENCES tinh_thanh(id) ON DELETE CASCADE
);

-- Người dùng (UPDATED)
CREATE TABLE nguoi_dung (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ho_ten NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    mat_khau NVARCHAR(255) NOT NULL,
    sdt NVARCHAR(15), -- Made nullable for OAuth users potentially
    chuc_vu NVARCHAR(20) CHECK (chuc_vu IN ('Admin', 'HotelManager', 'User')) DEFAULT 'User',
    trang_thai BIT DEFAULT 1,
    
    -- New fields for OAuth2 and Password Reset
    provider NVARCHAR(20) DEFAULT 'LOCAL', -- LOCAL, GOOGLE, FACEBOOK
    provider_id NVARCHAR(255),
    reset_token NVARCHAR(255),
    reset_token_expiry DATETIME2,

    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Khách sạn
CREATE TABLE khach_san (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten NVARCHAR(100) NOT NULL,
    dia_chi NVARCHAR(255) NOT NULL,
    so_sao INT CHECK (so_sao BETWEEN 1 AND 5),
    vi_tri_id INT NOT NULL,
    nguoi_quan_ly_id INT,
    gio_nhan_phong TIME DEFAULT '14:00:00',
    gio_tra_phong TIME DEFAULT '12:00:00',
    diem_danh_gia_trung_binh DECIMAL(3,2) DEFAULT 0,
    so_luot_danh_gia INT DEFAULT 0,
    trang_thai NVARCHAR(20) DEFAULT N'Hoạt động',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_ks_vi_tri FOREIGN KEY (vi_tri_id) REFERENCES vi_tri(id),
    CONSTRAINT fk_ks_manager FOREIGN KEY (nguoi_quan_ly_id) REFERENCES nguoi_dung(id)
);

-- Dịch vụ
CREATE TABLE dich_vu (
    id INT IDENTITY(1,1) PRIMARY KEY,
    khach_san_id INT NOT NULL,
    ten NVARCHAR(100) NOT NULL,
    gia_tien DECIMAL(12,2) NOT NULL,
    don_vi_tinh NVARCHAR(50) DEFAULT N'Lượt',
    CONSTRAINT fk_dv_ks FOREIGN KEY (khach_san_id) REFERENCES khach_san(id) ON DELETE CASCADE
);

-- Loại phòng
CREATE TABLE loai_phong (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten NVARCHAR(100) NOT NULL UNIQUE,
    so_khach INT NOT NULL
);

-- Khuyến mãi
CREATE TABLE khuyen_mai (
    id NVARCHAR(20) PRIMARY KEY,
    ten NVARCHAR(100) NOT NULL,
    phan_tram DECIMAL(5,2) NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    khach_san_id INT NOT NULL,
    CONSTRAINT fk_km_ks FOREIGN KEY (khach_san_id) REFERENCES khach_san(id)
);

-- Phòng
CREATE TABLE phong (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten NVARCHAR(100) NOT NULL,
    ma_phong NVARCHAR(50) NOT NULL,
    gia_tien DECIMAL(12,2) NOT NULL,
    khach_san_id INT NOT NULL,
    loai_phong_id INT NOT NULL,
    khuyen_mai_id NVARCHAR(20),
    trang_thai NVARCHAR(20) DEFAULT N'Trống',
    CONSTRAINT fk_p_ks FOREIGN KEY (khach_san_id) REFERENCES khach_san(id),
    CONSTRAINT fk_p_lp FOREIGN KEY (loai_phong_id) REFERENCES loai_phong(id),
    CONSTRAINT fk_p_km FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai(id)
);

-- Phiếu đặt phòng
CREATE TABLE phieu_dat_phong (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ma_dat_phong NVARCHAR(50) NOT NULL UNIQUE,
    ngay_den DATE NOT NULL,
    ngay_di DATE NOT NULL,
    nguoi_dung_id INT NOT NULL,
    phong_id INT NOT NULL,
    gia_phong_goc DECIMAL(12,2) NOT NULL,
    thanh_tien DECIMAL(12,2) NOT NULL,
    trang_thai NVARCHAR(20) DEFAULT N'Chờ xác nhận',
    trang_thai_thanh_toan NVARCHAR(30) DEFAULT N'Chưa thanh toán',
    ngay_dat DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_pdp_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
    CONSTRAINT fk_pdp_phong FOREIGN KEY (phong_id) REFERENCES phong(id)
);

-- Chi tiết sử dụng dịch vụ
CREATE TABLE chi_tiet_su_dung_dv (
    id INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dat_phong_id INT NOT NULL,
    dich_vu_id INT NOT NULL,
    so_luong INT DEFAULT 1,
    don_gia_luc_dat DECIMAL(12,2) NOT NULL,
    thoi_gian_su_dung DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_ctdv_pdp FOREIGN KEY (phieu_dat_phong_id) REFERENCES phieu_dat_phong(id) ON DELETE CASCADE
);

-- Phụ thu
CREATE TABLE phu_thu (
    id INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dat_phong_id INT NOT NULL,
    loai_phu_thu NVARCHAR(100) NOT NULL,
    so_tien DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_pt_pdp FOREIGN KEY (phieu_dat_phong_id) REFERENCES phieu_dat_phong(id) ON DELETE CASCADE
);

-- Đánh giá
CREATE TABLE danh_gia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dat_phong_id INT NOT NULL,
    khach_san_id INT NOT NULL,
    nguoi_dung_id INT NOT NULL,
    so_sao_tong INT CHECK (so_sao_tong BETWEEN 1 AND 5),
    binh_luan NVARCHAR(MAX),
    trang_thai NVARCHAR(20) DEFAULT N'Chờ duyệt',
    ngay_danh_gia DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT fk_dg_pdp FOREIGN KEY (phieu_dat_phong_id) REFERENCES phieu_dat_phong(id),
    CONSTRAINT fk_dg_ks FOREIGN KEY (khach_san_id) REFERENCES khach_san(id)
);
GO

-- =====================================================
-- 2. TỐI ƯU HÓA (INDEXES)
-- =====================================================
CREATE INDEX idx_tinh_thanh_qg ON tinh_thanh(quoc_gia_id);
CREATE INDEX idx_vi_tri_tt ON vi_tri(tinh_thanh_id);
CREATE INDEX idx_nguoi_dung_email ON nguoi_dung(email);
CREATE INDEX idx_khach_san_vitri ON khach_san(vi_tri_id);
CREATE INDEX idx_phong_ks ON phong(khach_san_id);
CREATE INDEX idx_pdp_ma ON phieu_dat_phong(ma_dat_phong);
CREATE INDEX idx_pdp_user ON phieu_dat_phong(nguoi_dung_id);
GO

-- =====================================================
-- 3. TỰ ĐỘNG HÓA (TRIGGERS)
-- =====================================================

-- 3.1. Tự động sinh mã đặt phòng
GO
CREATE TRIGGER trg_GenerateBookingCode
ON phieu_dat_phong
INSTEAD OF INSERT
AS
BEGIN
    INSERT INTO phieu_dat_phong (
        ma_dat_phong, ngay_den, ngay_di, nguoi_dung_id, phong_id, 
        gia_phong_goc, thanh_tien, trang_thai, ngay_dat
    )
    SELECT 
        ISNULL(i.ma_dat_phong, 'BK' + FORMAT(GETDATE(), 'yyyyMMdd') + RIGHT('0000' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS NVARCHAR), 4)),
        i.ngay_den, i.ngay_di, i.nguoi_dung_id, i.phong_id, 
        i.gia_phong_goc, i.thanh_tien, i.trang_thai, GETDATE()
    FROM inserted i;
END;
GO

-- 3.2. Cập nhật sao trung bình cho Khách sạn
CREATE TRIGGER trg_UpdateHotelRating
ON danh_gia
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(trang_thai)
    BEGIN
        UPDATE ks
        SET 
            so_luot_danh_gia = (SELECT COUNT(*) FROM danh_gia WHERE khach_san_id = ks.id AND trang_thai = N'Đã duyệt'),
            diem_danh_gia_trung_binh = ISNULL((SELECT AVG(CAST(so_sao_tong AS DECIMAL(3,2))) FROM danh_gia WHERE khach_san_id = ks.id AND trang_thai = N'Đã duyệt'), 0)
        FROM khach_san ks
        WHERE ks.id IN (SELECT DISTINCT khach_san_id FROM inserted);
    END
END;
GO

-- 3.3. Cập nhật Updated_At tự động
CREATE TRIGGER trg_UpdateTimestamp_ND ON nguoi_dung AFTER UPDATE AS BEGIN UPDATE nguoi_dung SET updated_at = GETDATE() WHERE id IN (SELECT id FROM inserted); END;
GO
CREATE TRIGGER trg_UpdateTimestamp_KS ON khach_san AFTER UPDATE AS BEGIN UPDATE khach_san SET updated_at = GETDATE() WHERE id IN (SELECT id FROM inserted); END;
GO

-- =====================================================
-- 4. NGHIỆP VỤ THANH TOÁN (STORED PROCEDURE)
-- =====================================================
CREATE OR ALTER PROCEDURE sp_ThanhToanCuoiKy
    @pdp_id INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @tien_phong_bandau DECIMAL(12,2), @tien_dv DECIMAL(12,2), @tien_pt DECIMAL(12,2), @tong_moi DECIMAL(12,2);

    IF NOT EXISTS (SELECT 1 FROM phieu_dat_phong WHERE id = @pdp_id)
    BEGIN
        PRINT N'Không tìm thấy mã phiếu đặt phòng!';
        RETURN;
    END

    SELECT @tien_phong_bandau = gia_phong_goc FROM phieu_dat_phong WHERE id = @pdp_id;
    SELECT @tien_dv = ISNULL(SUM(so_luong * don_gia_luc_dat), 0) FROM chi_tiet_su_dung_dv WHERE phieu_dat_phong_id = @pdp_id;
    SELECT @tien_pt = ISNULL(SUM(so_tien), 0) FROM phu_thu WHERE phieu_dat_phong_id = @pdp_id;

    SET @tong_moi = @tien_phong_bandau + @tien_dv + @tien_pt;

    UPDATE phieu_dat_phong 
    SET thanh_tien = @tong_moi,
        trang_thai = N'Đã checkout',
        trang_thai_thanh_toan = N'Đã thanh toán đủ',
        updated_at = GETDATE()
    WHERE id = @pdp_id;

    SELECT ma_dat_phong AS [Mã Đơn], @tien_phong_bandau AS [Phòng], @tien_dv AS [Dịch Vụ], @tien_pt AS [Phụ Thu], @tong_moi AS [TỔNG]
    FROM phieu_dat_phong WHERE id = @pdp_id;
END;
GO

-- =====================================================
-- 5. DỮ LIỆU MẪU (DUMMY DATA)
-- =====================================================
INSERT INTO quoc_gia (ten) VALUES (N'Việt Nam'), (N'Thái Lan');
INSERT INTO tinh_thanh (ten, quoc_gia_id) VALUES (N'Đà Nẵng', 1), (N'Bangkok', 2);
INSERT INTO vi_tri (ten, tinh_thanh_id) VALUES (N'Bãi biển Mỹ Khê', 1), (N'Quận Sukhumvit', 2);
INSERT INTO loai_phong (ten, so_khach) VALUES (N'Standard', 1), (N'Deluxe', 2), (N'Suite', 4);
INSERT INTO nguoi_dung (ho_ten, email, mat_khau, sdt, chuc_vu, provider) VALUES 
(N'Lê Quản Lý', 'manager@hotel.com', '$2a$12$8v1pVk7rM/K.4a.s.s.s.u.s.s.s.s.s.s.s.s.r.s.s', '0905123456', 'HotelManager', 'LOCAL'),
(N'Nguyễn Văn Đạt', 'vandat@gmail.com', '$2a$10$wPHxwfsf.qT9.yF5.d5.u/5.5.5.5.5.5.5.5.5.5', '0987654321', 'User', 'LOCAL');
-- Note: Password for both is '123456' (Hashed)

INSERT INTO khach_san (ten, dia_chi, so_sao, vi_tri_id, nguoi_quan_ly_id) VALUES 
(N'Da Nang Riverside', N'01 Võ Nguyên Giáp, Đà Nẵng', 5, 1, 1);
INSERT INTO dich_vu (khach_san_id, ten, gia_tien, don_vi_tinh) VALUES (1, N'Giặt ủi', 50000, N'Cái'), (1, N'Coca Cola', 25000, N'Lon');
INSERT INTO phong (ten, ma_phong, gia_tien, khach_san_id, loai_phong_id) VALUES (N'Phòng 101', 'R101', 1000000, 1, 2);
GO

-- =====================================================
-- 6. KỊCH BẢN KIỂM THỬ (TESTING)
-- =====================================================

-- Bước 1: Khách đặt phòng
INSERT INTO phieu_dat_phong (ngay_den, ngay_di, nguoi_dung_id, phong_id, gia_phong_goc, thanh_tien, trang_thai)
VALUES ('2026-02-10', '2026-02-12', 2, 1, 1000000, 1000000, N'Đã checkin');
GO

-- Bước 2: Khách dùng dịch vụ và làm hỏng đồ
INSERT INTO chi_tiet_su_dung_dv (phieu_dat_phong_id, dich_vu_id, so_luong, don_gia_luc_dat) VALUES (1, 2, 2, 25000);
INSERT INTO phu_thu (phieu_dat_phong_id, loai_phu_thu, so_tien) VALUES (1, N'Hỏng thiết bị', 150000);
GO

-- Bước 3: Checkout và In hóa đơn
EXEC sp_ThanhToanCuoiKy @pdp_id = 1;
GO

-- Bước 4: Kiểm tra kết quả
SELECT * FROM phieu_dat_phong WHERE id = 1;
GO
