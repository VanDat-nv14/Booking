# Tính Năng Hiển Thị Trạng Thái Mua Hàng Trong Đánh Giá Sản Phẩm

## Tổng quan
Tính năng này cho phép hiển thị trạng thái đơn hàng của khách hàng trong phần đánh giá sản phẩm, giúp xác định khách hàng đã mua sản phẩm hay chưa và ở trạng thái nào.

## Tính năng chính

### 1. **Kiểm tra trạng thái mua hàng**
- Xác định khách hàng đã mua sản phẩm hay chưa
- Hiển thị trạng thái đơn hàng gần nhất chứa sản phẩm đó
- Sử dụng trạng thái tiếng Việt đã cập nhật

### 2. **Hiển thị thông tin trong review**
- **Nếu đã mua**: Hiển thị trạng thái đơn hàng (ví dụ: "✓ Đã giao hàng")
- **Nếu chưa mua**: Hiển thị "Chưa mua sản phẩm"
- Hiển thị thông tin đơn hàng và ngày đặt

### 3. **Kiểm soát quyền đánh giá**
- Vô hiệu hóa nút "Viết đánh giá" nếu chưa mua sản phẩm
- Chỉ cho phép đánh giá khi có quyền hợp lệ

## Thay đổi Backend

### 1. **IReviewService.cs**
```csharp
Task<UserProductPurchaseStatusDto> GetUserProductPurchaseStatusAsync(int userId, int productId);

public class UserProductPurchaseStatusDto
{
    public bool HasPurchased { get; set; }
    public string? OrderStatus { get; set; }
    public string? OrderStatusDisplay { get; set; }
    public int? OrderId { get; set; }
    public DateTime? OrderDate { get; set; }
    public string Message { get; set; }
}
```

### 2. **ReviewService.cs**
- Thêm method `GetUserProductPurchaseStatusAsync()` để kiểm tra trạng thái mua hàng
- Thêm method `GetOrderStatusDisplay()` để chuyển đổi trạng thái sang tiếng Việt

### 3. **ReviewsController.cs**
- Thêm endpoint `GET /api/Reviews/User/{userId}/Product/{productId}/PurchaseStatus`
- Kiểm soát quyền truy cập (chỉ user hoặc admin)

## Thay đổi Frontend

### 1. **reviewService.js**
```javascript
async getUserProductPurchaseStatus(userId, productId) {
  const response = await axiosClient.get(`/Reviews/User/${userId}/Product/${productId}/PurchaseStatus`);
  return response.data;
}
```

### 2. **ReviewSection.js**
- Hiển thị thông báo trạng thái mua hàng
- Vô hiệu hóa nút "Viết đánh giá" nếu chưa mua
- Hiển thị thông tin đơn hàng và ngày mua

### 3. **ReviewList.js**
- Hiển thị tag trạng thái mua hàng cho từng review
- Load trạng thái cho user hiện tại hoặc admin

### 4. **OrderReviewSection.js**
- Cập nhật logic `canReviewOrder()` sử dụng trạng thái tiếng Việt mới
- Hiển thị trạng thái đơn hàng trong modal đánh giá

## Cách hoạt động

### 1. **Khi user xem sản phẩm**
1. Tự động kiểm tra trạng thái mua hàng của user cho sản phẩm đó
2. Hiển thị thông báo trạng thái phù hợp
3. Cho phép/không cho phép viết đánh giá dựa trên trạng thái

### 2. **Khi hiển thị danh sách review**
1. Load trạng thái mua hàng cho các user có review
2. Hiển thị tag trạng thái bên cạnh thông tin reviewer
3. Phân biệt màu sắc: xanh (đã mua), vàng (chưa mua)

### 3. **Logic kiểm tra trạng thái**
- Tìm đơn hàng gần nhất của user chứa sản phẩm
- Lấy trạng thái đơn hàng và chuyển đổi sang tiếng Việt
- Trả về thông tin đầy đủ để hiển thị

## Mapping trạng thái

| Trạng thái Database | Hiển thị |
|---------------------|----------|
| ChoXuLy | Chờ xử lý |
| DangXuLy | Đang xử lý |
| DaXacNhan | Đã xác nhận |
| DangGiaoHang | Đang giao hàng |
| DaGiaoHang | Đã giao hàng |
| HoanThanh | Hoàn thành |
| DaHuy | Đã hủy |

## Bảo mật
- API kiểm tra quyền: chỉ user hoặc admin mới xem được trạng thái
- Không leak thông tin đơn hàng của user khác
- Validate đầu vào để tránh lỗi bảo mật

## Ưu điểm
1. **Tăng tính tin cậy**: Xác minh reviewer đã mua sản phẩm
2. **Minh bạch thông tin**: Hiển thị rõ trạng thái mua hàng
3. **Trải nghiệm tốt**: Thông tin đầy đủ, rõ ràng
4. **Kiểm soát chất lượng**: Giảm spam review từ người chưa mua

## Test Cases

### 1. **User đã mua sản phẩm**
- Hiển thị trạng thái đơn hàng
- Cho phép viết đánh giá
- Hiển thị tag "✓ [Trạng thái]" trong review

### 2. **User chưa mua sản phẩm**
- Hiển thị "Chưa mua sản phẩm"
- Vô hiệu hóa nút đánh giá
- Không hiển thị tag trạng thái

### 3. **Admin xem review**
- Xem được trạng thái mua hàng của tất cả user
- Có thể chỉnh sửa/xóa review

### 4. **Xử lý lỗi**
- API lỗi: Hiển thị "Không thể kiểm tra trạng thái"
- Không có quyền: Trả về Forbidden
- Dữ liệu không hợp lệ: Trả về Bad Request

## Kế hoạch tương lai
1. **Thêm filter review theo trạng thái mua hàng**
2. **Hiển thị số lượng verified reviews**
3. **Badge đặc biệt cho verified reviewers**
4. **Tích hợp với hệ thống loyalty points** 