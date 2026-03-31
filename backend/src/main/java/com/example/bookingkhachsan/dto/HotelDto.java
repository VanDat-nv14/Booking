package com.example.bookingkhachsan.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalTime;
import java.util.List;

@Data
public class HotelDto {
    @NotBlank(message = "Tên khách sạn không được để trống")
    @Size(min = 3, max = 200, message = "Tên khách sạn phải từ 3 đến 200 ký tự")
    private String ten;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(min = 5, max = 500, message = "Địa chỉ phải từ 5 đến 500 ký tự")
    private String diaChi;

    @NotNull(message = "Số sao không được để trống")
    @Min(1) @Max(5)
    private Integer soSao;

    @Size(max = 4000, message = "Mô tả không được vượt quá 4000 ký tự")
    private String moTa;

    private LocalTime gioNhanPhong;
    private LocalTime gioTraPhong;

    // Có thể truyền viTriId (chọn từ danh sách) HOẶC viTriName + tinhThanhId (tạo mới)
    private Integer viTriId;

    /** Tên vị trí mới — nếu nhập thì tự tạo/tìm ViTri trong tỉnh tương ứng */
    private String viTriName;

    /** Tỉnh thành cha của vị trí mới */
    private Integer tinhThanhId;
    private String tinhThanhName;

    private Integer quocGiaId;
    private String quocGiaName;

    private Double viDo;
    private Double kinhDo;

    /** Tỷ lệ phần trăm tiền cọc (0–100) */
    private java.math.BigDecimal tiLeCoc;

    private Integer nguoiDungId;   // Manager optional

    /** URL ảnh bìa (ảnh chính) */
    private String hinhAnhBia;

    /** Danh sách URL ảnh phụ */
    private List<String> hinhAnhs;

    // Manager info (optional, for creation only). Cho phép null/empty; validate format trong service khi có giá trị
    private String managerEmail;
    
    /** Chỉ bắt buộc khi tạo quản lý mới; để trống khi gán user đã tồn tại */
    private String managerPassword;
    
    private String managerName;
}

