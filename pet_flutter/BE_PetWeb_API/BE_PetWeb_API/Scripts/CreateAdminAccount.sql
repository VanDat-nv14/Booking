-- Script tạo tài khoản admin với mật khẩu plain text
-- Mật khẩu sẽ được mã hóa tự động khi đăng nhập lần đầu

USE PetWeb;
GO

-- Xóa tài khoản admin cũ nếu có
IF EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    DELETE FROM Users WHERE Username = 'admin';
    PRINT 'Đã xóa tài khoản admin cũ';
END

-- Tạo tài khoản admin mới
INSERT INTO Users (
    Username, 
    Email, 
    Password,  -- Mật khẩu plain text, sẽ được mã hóa tự động khi đăng nhập lần đầu
    FullName, 
    Phone, 
    Address, 
    Avatar, 
    Role, 
    CreatedAt, 
    UpdatedAt, 
    IsActive
) VALUES (
    'admin',                    -- Username
    'admin@petservice.com',     -- Email
    'admin123',                 -- Password (plain text)
    'Administrator',            -- FullName
    '0123456789',              -- Phone
    'Việt Nam',                -- Address
    'default-avatar.png',       -- Avatar
    'Admin',                    -- Role
    GETDATE(),                  -- CreatedAt
    GETDATE(),                  -- UpdatedAt
    1                           -- IsActive
);

PRINT 'Đã tạo tài khoản admin thành công!';
PRINT 'Username: admin';
PRINT 'Password: admin123';
PRINT 'Mật khẩu sẽ được mã hóa tự động khi đăng nhập lần đầu';

-- Kiểm tra tài khoản đã tạo
SELECT 
    UserId,
    Username,
    Email,
    FullName,
    Role,
    IsActive,
    CreatedAt
FROM Users 
WHERE Username = 'admin'; 