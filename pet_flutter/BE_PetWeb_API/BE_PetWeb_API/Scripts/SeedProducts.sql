-- Thêm dữ liệu sản phẩm mẫu
INSERT INTO Products (Name, Description, Price, Category, Brand, StockQuantity, Photo, IsActive)
VALUES 
-- Thức ăn cho chó
('Royal Canin Adult', 'Thức ăn khô cho chó trưởng thành, dinh dưỡng cân bằng', 250000, 'Food', 'Royal Canin', 50, '/uploads/products/royal-canin-adult.jpg', 1),
('Pedigree Puppy', 'Thức ăn cho chó con dưới 12 tháng tuổi', 180000, 'Food', 'Pedigree', 30, '/uploads/products/pedigree-puppy.jpg', 1),
('Hill''s Science Diet', 'Thức ăn dinh dưỡng khoa học cho chó', 320000, 'Food', 'Hill''s', 25, '/uploads/products/hills-science-diet.jpg', 1),

-- Thức ăn cho mèo
('Whiskas Adult Cat', 'Thức ăn cho mèo trưởng thành', 150000, 'Food', 'Whiskas', 40, '/uploads/products/whiskas-adult.jpg', 1),
('Royal Canin Kitten', 'Thức ăn cho mèo con', 280000, 'Food', 'Royal Canin', 35, '/uploads/products/royal-canin-kitten.jpg', 1),

-- Đồ chơi
('Đồ chơi bóng cao su', 'Bóng cao su an toàn cho thú cưng', 45000, 'Toy', 'PetToy', 100, '/uploads/products/rubber-ball.jpg', 1),
('Cần câu mèo', 'Đồ chơi cần câu với lông vũ cho mèo', 65000, 'Toy', 'CatPlay', 80, '/uploads/products/cat-wand.jpg', 1),
('Xương gặm giả', 'Xương gặm làm từ chất liệu an toàn', 35000, 'Toy', 'BoneChew', 60, '/uploads/products/chew-bone.jpg', 1),

-- Thuốc và vitamin
('Vitamin tổng hợp', 'Vitamin tăng cường sức khỏe cho thú cưng', 120000, 'Medicine', 'VitaPet', 70, '/uploads/products/multivitamin.jpg', 1),
('Thuốc tẩy giun', 'Thuốc tẩy giun cho chó mèo', 85000, 'Medicine', 'DeWorm', 45, '/uploads/products/deworming.jpg', 1),

-- Phụ kiện
('Vòng cổ có chuông', 'Vòng cổ đẹp có chuông cho thú cưng', 55000, 'Accessory', 'PetCollar', 90, '/uploads/products/collar-bell.jpg', 1),
('Dây dắt chó', 'Dây dắt chắc chắn, thoải mái', 75000, 'Accessory', 'WalkEasy', 65, '/uploads/products/dog-leash.jpg', 1),
('Bát ăn inox', 'Bát ăn bằng inox cao cấp', 95000, 'Accessory', 'FoodBowl', 50, '/uploads/products/steel-bowl.jpg', 1),

-- Quần áo
('Áo len ấm', 'Áo len giữ ấm cho chó nhỏ', 120000, 'Clothing', 'WarmPet', 40, '/uploads/products/warm-sweater.jpg', 1),
('Áo mưa cho chó', 'Áo mưa chống thấm nước', 85000, 'Clothing', 'RainCoat', 30, '/uploads/products/rain-coat.jpg', 1);

-- Thêm một số sản phẩm khác
INSERT INTO Products (Name, Description, Price, Category, Brand, StockQuantity, Photo, IsActive)
VALUES 
('Sữa tắm cho chó', 'Sữa tắm làm sạch và thơm tho', 65000, 'Other', 'CleanPet', 55, '/uploads/products/dog-shampoo.jpg', 1),
('Cát vệ sinh mèo', 'Cát vệ sinh khử mùi tốt', 45000, 'Other', 'CatLitter', 75, '/uploads/products/cat-litter.jpg', 1),
('Thức ăn cá', 'Thức ăn viên cho cá cảnh', 25000, 'Food', 'FishFood', 100, '/uploads/products/fish-food.jpg', 1),
('Lều ngủ cho mèo', 'Lều ngủ ấm áp cho mèo', 150000, 'Accessory', 'CatHouse', 20, '/uploads/products/cat-tent.jpg', 1),
('Găng tay chải lông', 'Găng tay chải lông tiện lợi', 55000, 'Accessory', 'GroomGlove', 45, '/uploads/products/grooming-glove.jpg', 1); 