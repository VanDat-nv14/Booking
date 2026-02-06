-- Seed Categories Data
-- Thay thế hardcoded categories bằng dữ liệu từ database

-- Kiểm tra và chèn categories nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Food')
INSERT INTO Categories (Name, Description, IsActive, CreatedAt, ImageUrl) 
VALUES ('Food', 'Thức ăn và dinh dưỡng cho thú cưng', 1, GETDATE(), '/images/categories/food.png');

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Toy')
INSERT INTO Categories (Name, Description, IsActive, CreatedAt, ImageUrl) 
VALUES ('Toy', 'Đồ chơi và giải trí cho thú cưng', 1, GETDATE(), '/images/categories/toy.png');

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Medicine')
INSERT INTO Categories (Name, Description, IsActive, CreatedAt, ImageUrl) 
VALUES ('Medicine', 'Thuốc và sản phẩm y tế cho thú cưng', 1, GETDATE(), '/images/categories/medicine.png');

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Accessory')
INSERT INTO Categories (Name, Description, IsActive, CreatedAt, ImageUrl) 
VALUES ('Accessory', 'Phụ kiện và đồ dùng cho thú cưng', 1, GETDATE(), '/images/categories/accessory.png');

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Clothing')
INSERT INTO Categories (Name, Description, IsActive, CreatedAt, ImageUrl) 
VALUES ('Clothing', 'Quần áo và trang phục cho thú cưng', 1, GETDATE(), '/images/categories/clothing.png');

IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Other')
INSERT INTO Categories (Name, Description, IsActive, CreatedAt, ImageUrl) 
VALUES ('Other', 'Sản phẩm khác cho thú cưng', 1, GETDATE(), '/images/categories/other.png');

-- Cập nhật CategoryId cho các sản phẩm hiện có
UPDATE Products 
SET CategoryId = (SELECT CategoryId FROM Categories WHERE Name = Products.Category)
WHERE CategoryId IS NULL AND Category IS NOT NULL;

PRINT 'Categories seeded successfully!';
PRINT 'Updated CategoryId for existing products!'; 