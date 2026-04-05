/*
  Migration: mã giảm giá nền tảng (discount) + promotion_code (manager) + coupon_redemption + cột booking.
  SQL Server. Chạy trên DB hiện có (không DROP database).
*/
USE khach_san;
GO

-- Cột mới trên discount (Admin): giới hạn lượt / user
IF COL_LENGTH('dbo.discount', 'so_lan_toi_da_moi_user') IS NULL
BEGIN
    ALTER TABLE dbo.discount ADD so_lan_toi_da_moi_user INT NULL;
END
GO

-- Cột snapshot coupon trên phiếu đặt (JDBC insert)
IF COL_LENGTH('dbo.phieu_dat_phong', 'coupon_nguon') IS NULL
BEGIN
    ALTER TABLE dbo.phieu_dat_phong ADD
        coupon_nguon NVARCHAR(20) NULL,
        coupon_ref_id NVARCHAR(40) NULL,
        ma_coupon NVARCHAR(50) NULL,
        tien_giam_coupon DECIMAL(15,2) NULL;
END
GO

IF OBJECT_ID('dbo.promotion_code', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.promotion_code (
        id NVARCHAR(40) NOT NULL PRIMARY KEY,
        code NVARCHAR(50) NOT NULL UNIQUE,
        ten NVARCHAR(200) NOT NULL,
        mo_ta NVARCHAR(MAX) NULL,
        loai NVARCHAR(20) NOT NULL,
        gia_tri DECIMAL(15,2) NOT NULL,
        giam_toi_da DECIMAL(15,2) NULL,
        don_hang_toi_thieu DECIMAL(15,2) NULL,
        so_dem_toi_thieu INT NULL,
        loai_phong_id INT NULL,
        ngay_bat_dau DATE NOT NULL,
        ngay_ket_thuc DATE NOT NULL,
        so_lan_su_dung_toi_da INT NULL,
        so_lan_da_dung INT NOT NULL DEFAULT 0,
        so_lan_toi_da_moi_user INT NULL,
        khach_san_id INT NOT NULL,
        trang_thai NVARCHAR(20) NOT NULL DEFAULT N'ACTIVE',
        nguoi_tao NVARCHAR(200) NULL,
        created_at DATETIME2 NULL,
        updated_at DATETIME2 NULL,
        CONSTRAINT fk_pc_ks FOREIGN KEY (khach_san_id) REFERENCES dbo.khach_san(id)
    );
    CREATE INDEX ix_promotion_code_ks ON dbo.promotion_code(khach_san_id);
END
GO

IF OBJECT_ID('dbo.coupon_redemption', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.coupon_redemption (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        nguoi_dung_id INT NOT NULL,
        phieu_dat_phong_id INT NOT NULL,
        source_type NVARCHAR(20) NOT NULL,
        discount_id NVARCHAR(30) NULL,
        promotion_code_id NVARCHAR(40) NULL,
        ma_snapshot NVARCHAR(50) NULL,
        so_tien_giam DECIMAL(15,2) NULL,
        created_at DATETIME2 NULL,
        CONSTRAINT fk_cr_nd FOREIGN KEY (nguoi_dung_id) REFERENCES dbo.nguoi_dung(id),
        CONSTRAINT fk_cr_pdp FOREIGN KEY (phieu_dat_phong_id) REFERENCES dbo.phieu_dat_phong(id)
    );
    CREATE INDEX ix_cr_user_discount ON dbo.coupon_redemption(nguoi_dung_id, discount_id);
    CREATE INDEX ix_cr_user_promo ON dbo.coupon_redemption(nguoi_dung_id, promotion_code_id);
END
GO
