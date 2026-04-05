-- Initialize DiscountFramework (singleton row) if not exists
-- This script should run once during first deployment

INSERT INTO discount_framework 
(id, phan_tram_toi_da, phan_tram_toi_thieu, so_tien_toi_da, don_hang_toi_thieu_bat_buoc, nguoi_cap_nhat, updated_at)
SELECT 
  1,                        -- id (primary key = 1, singleton)
  50,                       -- phanTramToiDa: max 50% discount
  5,                        -- phanTramToiThieu: min 5% discount
  2000000,                  -- soTienToiDa: max fixed discount 2M VND
  500000,                   -- donHangToiThieuBatBuoc: min order 500K VND
  'System',                 -- nguoiCapNhat
  GETDATE()                 -- updated_at
WHERE NOT EXISTS (SELECT 1 FROM discount_framework WHERE id = 1);
