/*
=============================================================================
BOOKING SYSTEM - SQL MIGRATION SCRIPT
Mo ta: Script nang cap schema de ho tro day du nghiep vu dat phong:
  - Extend loai_phong, phong, phieu_dat_phong
  - Tao phong_kha_dung (inventory by date)
  - Tao lich_su_thanh_toan (payment history)
  - State machine triggers + Stored Procedures
=============================================================================
*/

USE khach_san;
GO

-- =====================================================
-- PHAN 1: MO RONG BANG HIEN CO
-- =====================================================

-- 1.1 Mo rong loai_phong: them thong tin chi tiet + pricing + policy
ALTER TABLE loai_phong ADD
    mo_ta NVARCHAR(MAX),
    dien_tich DECIMAL(6,2),                  -- m2
    so_giuong INT DEFAULT 1,
    loai_giuong NVARCHAR(50),                -- 'Doi', 'Don', 'King', 'Twin'
    tien_ich NVARCHAR(1000),                 -- CSV: 'WiFi,TV,Dieu hoa,Tu lanh'
    hinh_anh NVARCHAR(500),
    -- Gia dong theo kieu ngay
    gia_cuoi_tuan_pct DECIMAL(5,2) DEFAULT 0,   -- % tang gia cuoi tuan (VD: 20.00 = +20%)
    gia_le_pct DECIMAL(5,2) DEFAULT 0,           -- % tang gia ngay le
    -- Chinh sach huy phong
    cho_phep_huy BIT DEFAULT 1,
    mien_phi_huy_truoc_gio INT DEFAULT 48,       -- So gio truoc check-in duoc huy mien phi
    phi_huy_pct DECIMAL(5,2) DEFAULT 0           -- % phi huy neu huy muon (0 = mien phi)
;
GO

-- 1.2 Mo rong phong: them tang va so phong cu the
ALTER TABLE phong ADD
    tang INT,                          -- So tang (1, 2, 3...)
    so_phong NVARCHAR(20),            -- Ma phong cu the: '101', '202A'
    mo_ta NVARCHAR(MAX)
;
GO

-- 1.3 Mo rong phieu_dat_phong: them day du thong tin cho state machine
ALTER TABLE phieu_dat_phong ADD
    loai_dat_phong NVARCHAR(30) DEFAULT 'InstantBooking',   -- 'InstantBooking' | 'RequestToBook'
    phuong_thuc_thanh_toan NVARCHAR(50),                    -- 'TienMat', 'ChuyenKhoan', 'VNPAY'
    pending_expires_at DATETIME2,                            -- Thoi diem het han giu phong tam
    so_nguoi_lon INT DEFAULT 1,
    so_tre_em INT DEFAULT 0,
    ghi_chu_khach NVARCHAR(MAX),                            -- Ghi chu cua khach khi dat
    ghi_chu_huy NVARCHAR(MAX),                              -- Li do huy
    ti_le_hoa_hong DECIMAL(5,2) DEFAULT 0,                  -- % hoa hong nen tang thu
    tien_hoa_hong DECIMAL(12,2) DEFAULT 0                   -- So tien hoa hong thuc te
;
GO

-- =====================================================
-- PHAN 2: BANG MOI
-- =====================================================

-- 2.1 phong_kha_dung: Bang quan ly so phong trong theo tung ngay
-- Bang QUAN TRONG NHAT de tranh overbooking
CREATE TABLE phong_kha_dung (
    id INT IDENTITY(1,1) PRIMARY KEY,
    phong_id INT NOT NULL,
    ngay DATE NOT NULL,

    -- Trang thai cua phong trong ngay nay
    -- 'Trong': Chao ban, 'TamGiu': Dang cho thanh toan (Pending),
    -- 'DaDat': Da xac nhan (Confirmed/CheckedIn), 'BaoTri': Dong phong bao tri
    trang_thai NVARCHAR(20) NOT NULL DEFAULT 'Trong',

    -- Gia hien hanh cua phong trong ngay (co the override gia mac dinh)
    gia_theo_ngay DECIMAL(12,2),

    -- Lien ket voi booking dang giu / da dat phong nay
    phieu_dat_phong_id INT,

    CONSTRAINT fk_pkd_phong FOREIGN KEY (phong_id) REFERENCES phong(id) ON DELETE CASCADE,
    CONSTRAINT fk_pkd_pdp FOREIGN KEY (phieu_dat_phong_id) REFERENCES phieu_dat_phong(id),
    CONSTRAINT uq_phong_ngay UNIQUE (phong_id, ngay)
);
GO

CREATE INDEX idx_pkd_phong_ngay ON phong_kha_dung(phong_id, ngay);
CREATE INDEX idx_pkd_ngay_tt ON phong_kha_dung(ngay, trang_thai);
GO

-- 2.2 lich_su_thanh_toan: Toan bo giao dich (thanh toan, hoan tien, thu phi)
CREATE TABLE lich_su_thanh_toan (
    id INT IDENTITY(1,1) PRIMARY KEY,
    phieu_dat_phong_id INT NOT NULL,
    so_tien DECIMAL(12,2) NOT NULL,

    -- Loai giao dich
    loai_giao_dich NVARCHAR(30) NOT NULL,  -- 'ThanhToan', 'HoanTien', 'ThuPhiHuy', 'ThuPhiNoShow'

    -- Phuong thuc thanh toan
    phuong_thuc NVARCHAR(50) NOT NULL,     -- 'TienMat', 'ChuyenKhoan', 'VNPAY', 'HeThong'

    -- Trang thai giao dich
    trang_thai NVARCHAR(30) NOT NULL,      -- 'ThanhCong', 'ThatBai', 'DangXuLy', 'DaHoan'

    ma_giao_dich NVARCHAR(100),            -- Transaction ID tu payment gateway
    ghi_chu NVARCHAR(MAX),
    nguoi_thuc_hien NVARCHAR(100),         -- Email/ID cua nguoi thuc hien
    ngay_giao_dich DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT fk_lstt_pdp FOREIGN KEY (phieu_dat_phong_id) REFERENCES phieu_dat_phong(id)
);
GO

CREATE INDEX idx_lstt_pdp ON lich_su_thanh_toan(phieu_dat_phong_id);
GO

-- =====================================================
-- PHAN 3: TRIGGERS CHO STATE MACHINE
-- =====================================================

-- 3.1. Khi tao booking moi (Pending):
--      - Sinh ma dat phong
--      - Dat pending_expires_at = NOW + 30 phut
--      - Giu phong tam thoi (TamGiu) trong phong_kha_dung

DROP TRIGGER IF EXISTS trg_GenerateBookingCode;
GO

CREATE TRIGGER trg_OnBookingCreated
ON phieu_dat_phong
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Insert voi ma dat phong tu generate + thoi han pending
    INSERT INTO phieu_dat_phong (
        ma_dat_phong, ngay_den, ngay_di, nguoi_dung_id, phong_id,
        gia_phong_goc, thanh_tien, trang_thai, trang_thai_thanh_toan,
        loai_dat_phong, phuong_thuc_thanh_toan, pending_expires_at,
        so_nguoi_lon, so_tre_em, ghi_chu_khach, ngay_dat
    )
    SELECT
        'BK' + FORMAT(GETDATE(), 'yyyyMMdd') + RIGHT('0000' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS NVARCHAR), 4),
        i.ngay_den, i.ngay_di, i.nguoi_dung_id, i.phong_id,
        i.gia_phong_goc, i.thanh_tien,
        ISNULL(i.trang_thai, N'Pending'),
        ISNULL(i.trang_thai_thanh_toan, N'ChuaThanhToan'),
        ISNULL(i.loai_dat_phong, 'InstantBooking'),
        i.phuong_thuc_thanh_toan,
        DATEADD(MINUTE, 30, GETDATE()),  -- Pending expires in 30 minutes
        ISNULL(i.so_nguoi_lon, 1), ISNULL(i.so_tre_em, 0),
        i.ghi_chu_khach, GETDATE()
    FROM inserted i;
END;
GO

-- 3.2. Sau khi booking duoc confirm/cancel:
--      - Confirmed: doi TamGiu → DaDat trong phong_kha_dung
--      - Cancelled/Expired: doi TamGiu/DaDat → Trong, giai phong kho

CREATE TRIGGER trg_OnBookingStatusChange
ON phieu_dat_phong
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chi xu ly khi trang_thai thay doi
    IF NOT UPDATE(trang_thai) RETURN;

    DECLARE @booking_id INT, @phong_id INT, @ngay_den DATE, @ngay_di DATE;
    DECLARE @old_status NVARCHAR(20), @new_status NVARCHAR(20);

    SELECT
        @booking_id = i.id,
        @phong_id = i.phong_id,
        @ngay_den = i.ngay_den,
        @ngay_di = i.ngay_di,
        @new_status = i.trang_thai,
        @old_status = d.trang_thai
    FROM inserted i
    JOIN deleted d ON i.id = d.id;

    -- Confirmed: Chuyen TamGiu thanh DaDat (tru kho vinh vien)
    IF @new_status = 'Confirmed'
    BEGIN
        UPDATE phong_kha_dung
        SET trang_thai = 'DaDat', phieu_dat_phong_id = @booking_id
        WHERE phong_id = @phong_id
          AND ngay >= @ngay_den AND ngay < @ngay_di
          AND trang_thai = 'TamGiu' AND phieu_dat_phong_id = @booking_id;
    END

    -- CheckedIn: Ghi nhan phong co nguoi o (khong can thay doi phong_kha_dung)

    -- Cancelled / Expired / Rejected: Giai phong kho
    IF @new_status IN ('Cancelled', 'Expired', 'Rejected')
    BEGIN
        UPDATE phong_kha_dung
        SET trang_thai = 'Trong', phieu_dat_phong_id = NULL
        WHERE phong_id = @phong_id
          AND ngay >= @ngay_den AND ngay < @ngay_di
          AND phieu_dat_phong_id = @booking_id;
    END

    -- Completed: Giai phong kho sau checkout (phong san sang cho chu ky tiep theo)
    IF @new_status = 'Completed'
    BEGIN
        UPDATE phong_kha_dung
        SET trang_thai = 'Trong', phieu_dat_phong_id = NULL
        WHERE phong_id = @phong_id
          AND ngay >= @ngay_di  -- Giai phong ngay check-out tro di
          AND phieu_dat_phong_id = @booking_id;
    END
END;
GO

-- =====================================================
-- PHAN 4: STORED PROCEDURES
-- =====================================================

-- 4.1. sp_KhoiTaoPhongKhaDung: Giu phong tam thoi khi tao booking
CREATE OR ALTER PROCEDURE sp_KhoiTaoPhongKhaDung
    @phong_id INT,
    @phieu_dat_phong_id INT,
    @ngay_den DATE,
    @ngay_di DATE,
    @gia_mac_dinh DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;

    -- Them tung ngay tu ngay_den den ngay_di-1
    DECLARE @current_date DATE = @ngay_den;

    WHILE @current_date < @ngay_di
    BEGIN
        -- Chi insert neu ngay chua bị dat boi booking khac
        IF NOT EXISTS (
            SELECT 1 FROM phong_kha_dung
            WHERE phong_id = @phong_id AND ngay = @current_date
              AND trang_thai IN ('TamGiu', 'DaDat', 'BaoTri')
        )
        BEGIN
            -- Upsert: cap nhat neu co san, them moi neu chua co
            MERGE phong_kha_dung AS target
            USING (SELECT @phong_id, @current_date) AS source(phong_id, ngay)
            ON (target.phong_id = source.phong_id AND target.ngay = source.ngay)
            WHEN MATCHED AND target.trang_thai = 'Trong' THEN
                UPDATE SET trang_thai = 'TamGiu',
                           phieu_dat_phong_id = @phieu_dat_phong_id,
                           gia_theo_ngay = @gia_mac_dinh
            WHEN NOT MATCHED THEN
                INSERT (phong_id, ngay, trang_thai, gia_theo_ngay, phieu_dat_phong_id)
                VALUES (@phong_id, @current_date, 'TamGiu', @gia_mac_dinh, @phieu_dat_phong_id);
        END

        SET @current_date = DATEADD(DAY, 1, @current_date);
    END
END;
GO

-- 4.2. sp_ThanhToanCuoiKy: Tinh toan hoa don checkout (giu nguyen logic cu + them lich su)
CREATE OR ALTER PROCEDURE sp_ThanhToanCuoiKy
    @pdp_id INT,
    @phuong_thuc NVARCHAR(50) = 'TienMat',
    @nguoi_thuc_hien NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @tien_phong DECIMAL(12,2), @tien_dv DECIMAL(12,2),
            @tien_pt DECIMAL(12,2), @tong_moi DECIMAL(12,2);
    DECLARE @ma_phieu NVARCHAR(50);

    IF NOT EXISTS (SELECT 1 FROM phieu_dat_phong WHERE id = @pdp_id AND trang_thai = 'CheckedIn')
    BEGIN
        RAISERROR(N'Phieu dat phong khong ton tai hoac chua o trang thai CheckedIn!', 16, 1);
        RETURN;
    END

    SELECT @tien_phong = thanh_tien, @ma_phieu = ma_dat_phong
    FROM phieu_dat_phong WHERE id = @pdp_id;

    SELECT @tien_dv = ISNULL(SUM(so_luong * don_gia_luc_dat), 0)
    FROM chi_tiet_su_dung_dv WHERE phieu_dat_phong_id = @pdp_id;

    SELECT @tien_pt = ISNULL(SUM(so_tien), 0)
    FROM phu_thu WHERE phieu_dat_phong_id = @pdp_id;

    SET @tong_moi = @tien_phong + @tien_dv + @tien_pt;

    -- Cap nhat phieu dat phong
    UPDATE phieu_dat_phong
    SET thanh_tien = @tong_moi, trang_thai = 'CheckedOut',
        trang_thai_thanh_toan = 'DaThanhToan', updated_at = GETDATE()
    WHERE id = @pdp_id;

    -- Ghi nhan lich su thanh toan
    INSERT INTO lich_su_thanh_toan
        (phieu_dat_phong_id, so_tien, loai_giao_dich, phuong_thuc, trang_thai, ghi_chu, nguoi_thuc_hien)
    VALUES
        (@pdp_id, @tong_moi, 'ThanhToan', @phuong_thuc, 'ThanhCong',
         'Checkout: Phong ' + CAST(@tien_phong AS NVARCHAR) +
         ' + DV ' + CAST(@tien_dv AS NVARCHAR) +
         ' + PhuThu ' + CAST(@tien_pt AS NVARCHAR),
         @nguoi_thuc_hien);

    -- Tra ve hoa don
    SELECT @ma_phieu AS MaPhieu, @tien_phong AS TienPhong,
           @tien_dv AS TienDichVu, @tien_pt AS PhuThu, @tong_moi AS TongCong;
END;
GO

-- 4.3. sp_HuyDatPhong: Huy dat phong va xu ly hoan tien theo chinh sach
CREATE OR ALTER PROCEDURE sp_HuyDatPhong
    @pdp_id INT,
    @ghi_chu_huy NVARCHAR(MAX) = NULL,
    @nguoi_thuc_hien NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @trang_thai NVARCHAR(20), @ngay_den DATE, @ngay_dat DATETIME2;
    DECLARE @thanh_tien DECIMAL(12,2), @gia_phong_goc DECIMAL(12,2);
    DECLARE @loai_phong_id INT, @gio_duoc_huy INT, @phi_huy_pct DECIMAL(5,2);
    DECLARE @gio_con_lai FLOAT, @so_tien_hoan DECIMAL(12,2), @phi_huy DECIMAL(12,2);

    -- Lay thong tin booking
    SELECT
        @trang_thai = p.trang_thai,
        @ngay_den = p.ngay_den,
        @ngay_dat = p.ngay_dat,
        @thanh_tien = p.thanh_tien,
        @gia_phong_goc = p.gia_phong_goc,
        @loai_phong_id = ph.loai_phong_id
    FROM phieu_dat_phong p
    JOIN phong ph ON p.phong_id = ph.id
    WHERE p.id = @pdp_id;

    IF @trang_thai IS NULL
    BEGIN
        RAISERROR(N'Khong tim thay phieu dat phong!', 16, 1); RETURN;
    END

    IF @trang_thai NOT IN ('Pending', 'Confirmed')
    BEGIN
        RAISERROR(N'Chi co the huy don o trang thai Pending hoac Confirmed!', 16, 1); RETURN;
    END

    -- Lay chinh sach huy tu loai phong
    SELECT @gio_duoc_huy = ISNULL(mien_phi_huy_truoc_gio, 48),
           @phi_huy_pct = ISNULL(phi_huy_pct, 0)
    FROM loai_phong WHERE id = @loai_phong_id;

    -- Tinh so gio con lai truoc check-in
    SET @gio_con_lai = DATEDIFF(HOUR, GETDATE(), @ngay_den);

    -- Tinh hoan tien
    IF @gio_con_lai >= @gio_duoc_huy OR @phi_huy_pct = 0
    BEGIN
        -- Huy mien phi hoac con du gio: hoan 100%
        SET @so_tien_hoan = @gia_phong_goc;
        SET @phi_huy = 0;
    END
    ELSE
    BEGIN
        -- Huy muon: thu phi
        SET @phi_huy = @gia_phong_goc * @phi_huy_pct / 100;
        SET @so_tien_hoan = @gia_phong_goc - @phi_huy;
        IF @so_tien_hoan < 0 SET @so_tien_hoan = 0;
    END

    -- Cap nhat trang thai phieu dat phong → Cancelled
    UPDATE phieu_dat_phong
    SET trang_thai = 'Cancelled', trang_thai_thanh_toan = 'DaHoanTien',
        ghi_chu_huy = @ghi_chu_huy, updated_at = GETDATE()
    WHERE id = @pdp_id;

    -- Ghi nhan hoan tien (neu co)
    IF @so_tien_hoan > 0
    BEGIN
        INSERT INTO lich_su_thanh_toan
            (phieu_dat_phong_id, so_tien, loai_giao_dich, phuong_thuc, trang_thai, ghi_chu, nguoi_thuc_hien)
        VALUES
            (@pdp_id, @so_tien_hoan, 'HoanTien', 'HeThong', 'ThanhCong',
             'Hoan tien huy phong. Phi huy: ' + CAST(@phi_huy AS NVARCHAR),
             @nguoi_thuc_hien);
    END

    -- Ghi nhan phi huy (neu co)
    IF @phi_huy > 0
    BEGIN
        INSERT INTO lich_su_thanh_toan
            (phieu_dat_phong_id, so_tien, loai_giao_dich, phuong_thuc, trang_thai, ghi_chu, nguoi_thuc_hien)
        VALUES
            (@pdp_id, @phi_huy, 'ThuPhiHuy', 'HeThong', 'ThanhCong',
             'Thu phi huy phong (' + CAST(@phi_huy_pct AS NVARCHAR) + '%)',
             @nguoi_thuc_hien);
    END

    SELECT @so_tien_hoan AS SoTienHoan, @phi_huy AS PhiHuy;
END;
GO

-- 4.4. sp_XuLyPendingHetHan: Job quet Pending het han
CREATE OR ALTER PROCEDURE sp_XuLyPendingHetHan
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @expired_ids TABLE (id INT, phong_id INT, ngay_den DATE, ngay_di DATE);

    -- Tim cac booking Pending da het han
    INSERT INTO @expired_ids
    SELECT id, phong_id, ngay_den, ngay_di
    FROM phieu_dat_phong
    WHERE trang_thai = 'Pending' AND pending_expires_at < GETDATE();

    -- Chuyen sang Expired
    UPDATE phieu_dat_phong
    SET trang_thai = 'Expired', trang_thai_thanh_toan = 'Huy',
        updated_at = GETDATE()
    WHERE id IN (SELECT id FROM @expired_ids);

    -- Giai phong kho phong
    UPDATE pkd SET pkd.trang_thai = 'Trong', pkd.phieu_dat_phong_id = NULL
    FROM phong_kha_dung pkd
    JOIN @expired_ids e ON pkd.phong_id = e.phong_id
    WHERE pkd.ngay >= e.ngay_den AND pkd.ngay < e.ngay_di;

    SELECT COUNT(*) AS SoLuongHetHan FROM @expired_ids;
END;
GO

-- =====================================================
-- PHAN 5: VIEW TIEN LOI
-- =====================================================

-- 5.1. View phong con trong theo khoang ngay
CREATE OR ALTER VIEW v_PhongConTrong AS
SELECT
    p.id AS phong_id,
    p.ten AS ten_phong,
    p.ma_phong,
    p.trang_thai AS trang_thai_phong,
    p.tang, p.so_phong,
    p.gia_tien AS gia_mac_dinh,
    p.khach_san_id,
    lp.ten AS loai_phong,
    lp.so_khach, lp.dien_tich, lp.so_giuong, lp.loai_giuong,
    lp.tien_ich, lp.hinh_anh AS loai_phong_anh,
    lp.cho_phep_huy, lp.mien_phi_huy_truoc_gio, lp.phi_huy_pct
FROM phong p
JOIN loai_phong lp ON p.loai_phong_id = lp.id
WHERE p.trang_thai != N'BaoTri';
GO

-- =====================================================
-- PHAN 6: CAP NHAT DU LIEU MAU
-- =====================================================

-- Cap nhat loai phong mau
UPDATE loai_phong SET
    mo_ta = N'Phong tieu chuan, thoai mai voi day du tien nghi co ban',
    dien_tich = 25.0, so_giuong = 1, loai_giuong = N'Don',
    tien_ich = 'WiFi,TV,Dieu_hoa,Nha_tam_rieng',
    mien_phi_huy_truoc_gio = 24, phi_huy_pct = 50, cho_phep_huy = 1
WHERE ten = N'Standard';

UPDATE loai_phong SET
    mo_ta = N'Phong Deluxe rong rai voi view dep',
    dien_tich = 35.0, so_giuong = 1, loai_giuong = N'King',
    tien_ich = 'WiFi,TV,Dieu_hoa,Ban_cong,Tu_lanh,May_pha_ca_phe',
    gia_cuoi_tuan_pct = 15, mien_phi_huy_truoc_gio = 48, phi_huy_pct = 30, cho_phep_huy = 1
WHERE ten = N'Deluxe';

UPDATE loai_phong SET
    mo_ta = N'Phong Suite hang sang voi khong gian rong rai va dich vu VIP',
    dien_tich = 65.0, so_giuong = 2, loai_giuong = N'King + Sofa Bed',
    tien_ich = 'WiFi,TV_55inch,Dieu_hoa,Phong_khach_rieng,Boi,Minibar,Dich_vu_phong_24h',
    gia_cuoi_tuan_pct = 20, gia_le_pct = 30, mien_phi_huy_truoc_gio = 72, phi_huy_pct = 50, cho_phep_huy = 1
WHERE ten = N'Suite';

-- Cap nhat phong mau
UPDATE phong SET tang = 1, so_phong = '101' WHERE ma_phong = 'R101';
GO
