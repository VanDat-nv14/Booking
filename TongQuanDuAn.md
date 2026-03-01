# Tổng Quan Dự Án Web Đặt Phòng Khách Sạn

## 1. Các Chức Năng Hiện Tại (Chức Năng & Nghiệp Vụ)

Dựa trên cấu trúc Database, Backend (Spring Boot) và Frontend (React) hiện tại, hệ thống cung cấp các chức năng chính sau:

### 1.1 Quản Lý Người Dùng & Phân Quyền (User Management)
- **Đăng ký / Đăng nhập**: Hỗ trợ đăng nhập truyền thống (Email/Password) và OAuth2 (Google/Facebook).
- **Quản lý phiên bản mật khẩu**: Hỗ trợ Quên mật khẩu / Đặt lại mật khẩu (Reset Password) thông qua mã token.
- **Phân quyền**: Có 3 vai trò chính trong hệ thống:
  - `Admin`: Quản lý toàn bộ hệ thống (người dùng, khách sạn, phê duyệt...).
  - `HotelManager`: Quản lý khách sạn của họ, bao gồm phòng, dịch vụ, khuyến mãi.
  - `User`: Tìm kiếm, xem chi tiết, đặt phòng và quản lý giao dịch cá nhân.
- **Trang cá nhân (UserProfile)**: Xem thông tin cá nhân và lịch sử đặt phòng.

### 1.2 Quản Lý Khách Sạn & Dịch Vụ (Hotel Management)
- **Quản lý danh mục vị trí**: Lưu trữ thông tin Quốc Gia, Tỉnh Thành, Vị Trí (Quận/Khu vực).
- **Thông tin khách sạn**: Quản lý thông tin chi tiết khách sạn (tên, địa chỉ, số sao, giờ nhận/trả phòng). 
- **Tích hợp Bản Đồ (Map View)**: Xem vị trí khách sạn trên bản đồ, chọn tọa độ (mini-map và full-map) khi tạo/chỉnh sửa khách sạn.
- **Quản lý Loại Phòng & Phòng**: Quản lý các loại phòng (Standard, Deluxe, Suite) và từng phòng cụ thể (giá, mã phòng, trạng thái trống/đang thuê).
- **Quản lý Dịch vụ đi kèm**: Giặt ủi, đồ uống, spa... gắn liền với từng khách sạn.
- **Quản lý Khuyến mãi**: Cho phép tạo các chương trình giảm giá theo phần trăm (.%).

### 1.3 Nghiệp Vụ Đặt Phòng (Booking Flow)
- **Tìm kiếm & Lọc**: Người dùng có thể tìm kiếm khách sạn theo địa điểm, ngày tháng, và xem danh sách kết quả (SearchPage, HomePage).
- **Đặt phòng (Phieu_Dat_Phong)**: Người dùng chọn ngày đến, ngày đi, phòng. Hệ thống tự động sinh `mã đặt phòng` qua trigger.
- **Sử dụng Dịch vụ (Chi tiết sử dụng DV)**: Ghi nhận các dịch vụ phát sinh trong quá trình lưu trú.
- **Phụ thu**: Ghi nhận phí phát sinh (ví dụ: làm hỏng đồ).
- **Thanh toán & Trả phòng (Checkout)**: SP Database `sp_ThanhToanCuoiKy` tính tổng tiền (Tiền phòng gốc + Dịch vụ + Phụ thu) và nâng trạng thái lên "Đã thanh toán đủ".

### 1.4 Hệ Thống Đánh Giá (Review & Rating)
- **Viết đánh giá**: Người dùng đánh giá (1-5 sao) và bình luận.
- **Kiểm duyệt**: Đánh giá cần được phê duyệt.
- **Tự động cập nhật**: Hệ thống có trigger tự động tính lại `điểm đánh giá trung bình` và cập nhật vào record của khách sạn.

---

## 2. Các Chức Năng Cần Phát Triển Thêm (Đề Xuất Tương Lai)

Dựa trên hiện trạng dự án và chuẩn mực của một nền tảng OTA (Online Travel Agent), các chức năng dưới đây có thể được đưa vào lộ trình phát triển tiếp theo:

### 2.1 Cổng Thanh Toán Trực Tuyến (Payment Gateway)
- **Thực trạng**: Hệ thống đang quản lý trạng thái thanh toán nội bộ chứ chưa tích hợp thanh toán thực thế.
- **Phát triển**: Tích hợp VNPAY, MoMo (dùng cho VN) hoặc Stripe/PayPal để User có thể cọc/thanh toán trực tuyến khi đặt phòng hoặc thanh toán hóa đơn checkout.

### 2.2 Hệ Thống Thông Báo (Notification System)
- **Gửi Email/SMS**: Gửi email xác nhận đặt phòng với vé điện tử (E-ticket QR Code), và email nhắc nhở/hóa đơn.
- **Push Notification (Web/App)**: Thông báo realtime cho HotelManager khi có khách vừa booking thành công và nhắc nhở khách khi sát ngày check-in. Khách hàng cũng được nhận thông báo tình trạng duyệt đánh giá.

### 2.3 Chính Sách Hủy Phòng & Tính Phí (Cancellation & Refunds rules)
- **Nghiệp vụ**: Thêm Policy (Chính sách): Người dùng được phép hủy phòng miễn phí trước X ngày; tính phí Y% nếu hủy quá sát ngày.
- **Luồng xử lý**: User ấn hủy, hệ thống rà soát thời gian đến check-in, tự động cập nhật số tiền hoàn và tiến hành refund nếu có thanh toán trước.

### 2.4 Quản Trị Quỹ Phòng & Lịch Trực Quan (Room Calendar View)
- **Phát triển UI**: Tại trang Admin/Manager, cần biểu đồ dạng Lịch (Gantt Chart/Calendar) cho phép Chủ Khách Sạn kéo thả, đánh dấu các ngày lễ/Tết, khóa phòng nhanh (Maintainance) hay điều chỉnh giá phòng linh hoạt (Dynamic Pricing) theo ngày (VD thứ 7, CN tăng 10%).

### 2.5 Chăm Sóc Khách Hàng (Live Chat / Bot Support)
- **Tích hợp Chatbot**: Gợi ý phòng tự động qua chatbot cho khách có nhu cầu.
- **Live Chat**: Kênh trao đổi trực tiếp qua WebSocket giữa Người thuê phòng - Khách sạn để giải quyết các vấn đề phát sinh tức thời (yêu cầu báo thức, dọn phòng).

### 2.6 Đa Ngôn Ngữ & Tiền Tệ (i18n)
- Hỗ trợ đổi giao diện Tiếng Việt/Tiếng Anh (i18n React).
- Cập nhật chức năng quy đổi tiền tệ từ VND sang USD (cho khách nước ngoài) theo tỷ giá thời gian thực.

### 2.7 Bộ Lọc Nâng Cao & Gợi Ý Thông Minh (Advanced Filters & Recommendations)
- Tính năng lọc theo các tiện nghi (Có hồ bơi, buffet sáng, cho phép mang thú cưng).
- Hệ thống Recommendation (gợi ý): "Khách sạn tương tự", "Được yêu thích nhất trong tuần", "Đề xuất theo hành vi đặt phòng cũ".
