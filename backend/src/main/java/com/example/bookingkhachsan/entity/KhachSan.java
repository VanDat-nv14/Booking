package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "khach_san")
@Data
public class KhachSan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String ten;

    @Column(name = "dia_chi", nullable = false)
    private String diaChi;

    @Column(name = "so_sao")
    private Integer soSao;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @ManyToOne
    @JoinColumn(name = "vi_tri_id", nullable = false)
    private ViTri viTri;

    @ManyToOne
    @JoinColumn(name = "nguoi_quan_ly_id")
    @JsonIgnore
    private NguoiDung nguoiQuanLy;

    @Column(name = "gio_nhan_phong")
    private LocalTime gioNhanPhong;

    @Column(name = "gio_tra_phong")
    private LocalTime gioTraPhong;

    @Column(name = "diem_danh_gia_trung_binh")
    private BigDecimal diemDanhGiaTrungBinh;

    @Column(name = "so_luot_danh_gia")
    private Integer soLuotDanhGia;

    @Column(name = "trang_thai")
    private String trangThai; // Hoạt động

    @Column(name = "vi_do")
    private Double viDo;

    @Column(name = "kinh_do")
    private Double kinhDo;

    /** URL ảnh bìa (ảnh chính hiển thị cho khách) */
    @Column(name = "hinh_anh_bia", columnDefinition = "NVARCHAR(MAX)")
    private String hinhAnhBia;

    /**
     * Danh sách URL ảnh (lưu dạng JSON array trong 1 cột NVARCHAR(MAX))
     * Ví dụ: ["https://...","https://..."]
     */
    @Convert(converter = StringListConverter.class)
    @Column(name = "hinh_anhs", columnDefinition = "NVARCHAR(MAX)")
    private List<String> hinhAnhs = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "khachSan", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnore
    private List<Phong> phongs;
    
    @OneToMany(mappedBy = "khachSan", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnore
    private List<DichVu> dichVus;

    /** JPA Converter: List<String> <-> JSON NVARCHAR */
    @Converter
    static class StringListConverter implements AttributeConverter<List<String>, String> {
        private static final ObjectMapper om = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(List<String> list) {
            try {
                return list == null || list.isEmpty() ? null : om.writeValueAsString(list);
            } catch (Exception e) { return null; }
        }

        @Override
        public List<String> convertToEntityAttribute(String json) {
            try {
                if (json == null || json.isBlank()) return new ArrayList<>();
                return om.readValue(json, new TypeReference<List<String>>() {});
            } catch (Exception e) { return new ArrayList<>(); }
        }
    }
}
