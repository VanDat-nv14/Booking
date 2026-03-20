package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.HotelDetailDto;
import com.example.bookingkhachsan.entity.DanhGia;
import com.example.bookingkhachsan.entity.DichVu;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.entity.ViTri;
import com.example.bookingkhachsan.entity.TinhThanh;
import com.example.bookingkhachsan.repository.DanhGiaRepository;
import com.example.bookingkhachsan.repository.DichVuRepository;
import com.example.bookingkhachsan.repository.KhuyenMaiRepository;
import com.example.bookingkhachsan.repository.PhieuDatPhongRepository;
import com.example.bookingkhachsan.repository.PhongRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class HotelService {
    
    private final KhachSanRepository khachSanRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;
    private final DichVuRepository dichVuRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final PhieuDatPhongRepository phieuDatPhongRepository;
    private final PhongRepository phongRepository;
    private final KhuyenMaiRepository khuyenMaiRepository;

    private final com.example.bookingkhachsan.repository.ViTriRepository viTriRepository;

    public List<KhachSan> search(Integer viTriId, Integer soSao, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, java.time.LocalDate checkIn, java.time.LocalDate checkOut) {
        if (checkIn == null) checkIn = java.time.LocalDate.now();
        if (checkOut == null) checkOut = checkIn.plusDays(1);
        
        return khachSanRepository.findAvailableHotels(viTriId, soSao, minPrice, maxPrice, checkIn, checkOut);
    }

    public List<KhachSan> getAll(Integer limit) {
        if (limit != null && limit > 0) {
            return khachSanRepository.findAll(PageRequest.of(0, Math.min(limit, 100))).getContent();
        }
        return khachSanRepository.findAll();
    }

    public KhachSan getMyHotel(Integer managerId) {
        return khachSanRepository.findByNguoiQuanLy_Id(managerId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa được phân công quản lý khách sạn nào"));
    }

    public KhachSan getDetails(Integer id) {
        return khachSanRepository.findById(id).orElseThrow(() -> new RuntimeException("Hotel not found"));
    }

    /**
     * Trả về đầy đủ thông tin khách sạn cho trang chi tiết (ảnh, vị trí, dịch vụ, đánh giá).
     */
    @Transactional(readOnly = true)
    public HotelDetailDto getHotelDetail(Integer id) {
        KhachSan hotel = khachSanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khách sạn không tìm thấy"));

        HotelDetailDto dto = new HotelDetailDto();
        dto.setId(hotel.getId());
        dto.setTen(hotel.getTen());
        dto.setDiaChi(hotel.getDiaChi());
        dto.setSoSao(hotel.getSoSao());
        dto.setMoTa(hotel.getMoTa());
        dto.setGioNhanPhong(hotel.getGioNhanPhong());
        dto.setGioTraPhong(hotel.getGioTraPhong());
        dto.setDiemDanhGiaTrungBinh(hotel.getDiemDanhGiaTrungBinh());
        dto.setSoLuotDanhGia(hotel.getSoLuotDanhGia());
        dto.setTrangThai(hotel.getTrangThai());
        dto.setHinhAnhBia(hotel.getHinhAnhBia());
        dto.setHinhAnhs(hotel.getHinhAnhs());

        // Vị trí
        if (hotel.getViTri() != null) {
            ViTri vt = hotel.getViTri();
            dto.setTenViTri(vt.getTen());
            dto.setHinhAnhViTri(vt.getHinhAnh());
            if (vt.getTinhThanh() != null) {
                TinhThanh tt = vt.getTinhThanh();
                dto.setTenTinhThanh(tt.getTen());
                if (tt.getQuocGia() != null) {
                    dto.setTenQuocGia(tt.getQuocGia().getTen());
                }
            }
        }

        // Dịch vụ
        List<DichVu> dichVus = dichVuRepository.findByKhachSanId(id);
        dto.setDichVus(dichVus.stream().map(dv -> {
            HotelDetailDto.DichVuInfo info = new HotelDetailDto.DichVuInfo();
            info.setId(dv.getId());
            info.setTen(dv.getTen());
            info.setGiaTien(dv.getGiaTien());
            info.setDonViTinh(dv.getDonViTinh());
            return info;
        }).collect(Collectors.toList()));

        // Đánh giá (chỉ lấy đã duyệt)
        List<DanhGia> reviews = danhGiaRepository.findByKhachSanIdAndTrangThai(id, "Đã duyệt");
        dto.setDanhGias(reviews.stream().map(r -> {
            HotelDetailDto.ReviewInfo ri = new HotelDetailDto.ReviewInfo();
            ri.setId(r.getId());
            ri.setTenKhach(r.getNguoiDung() != null ? r.getNguoiDung().getHoTen() : "Khách ẩn danh");
            ri.setSoSaoTong(r.getSoSaoTong());
            ri.setBinhLuan(r.getBinhLuan());
            ri.setTrangThai(r.getTrangThai());
            ri.setNgayDanhGia(r.getNgayDanhGia());
            return ri;
        }).collect(Collectors.toList()));

        return dto;
    }

    public KhachSan createHotel(com.example.bookingkhachsan.dto.HotelDto dto) {
        KhachSan hotel = new KhachSan();
        mapDtoToEntity(dto, hotel);

        if (hotel.getViTri() == null) {
            throw new RuntimeException("Vui lòng chọn tỉnh thành và vị trí (hoặc nhập tên vị trí mới)!");
        }

        if (dto.getManagerEmail() != null && !dto.getManagerEmail().isBlank()) {
            String email = dto.getManagerEmail().trim();
            if (!email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
                throw new RuntimeException("Email quản lý không hợp lệ!");
            }
            NguoiDung manager = nguoiDungRepository.findByEmail(email).orElse(null);
            if (manager != null) {
                // Email đã tồn tại: gán user hiện có làm quản lý (không đổi mật khẩu)
                manager.setChucVu("HotelManager");
                if (dto.getManagerName() != null && !dto.getManagerName().isBlank()) {
                    manager.setHoTen(dto.getManagerName().trim());
                }
                manager = nguoiDungRepository.save(manager);
            } else {
                // Email mới: tạo user quản lý mới (cần mật khẩu)
                if (dto.getManagerPassword() == null || dto.getManagerPassword().isBlank()) {
                    throw new RuntimeException("Vui lòng nhập mật khẩu cho quản lý mới!");
                }
                manager = new NguoiDung();
                manager.setEmail(email);
                manager.setMatKhau(passwordEncoder.encode(dto.getManagerPassword()));
                manager.setHoTen(dto.getManagerName() != null && !dto.getManagerName().isBlank() ? dto.getManagerName().trim() : "Quản lý " + dto.getTen());
                manager.setChucVu("HotelManager");
                manager.setTrangThai(true);
                manager.setProvider(NguoiDung.Provider.LOCAL);
                manager = nguoiDungRepository.save(manager);
            }
            hotel.setNguoiQuanLy(manager);
        }

        return khachSanRepository.save(hotel);
    }

    /** Lấy dữ liệu rút gọn cho Custom Map toàn màn hình */
    @Transactional(readOnly = true)
    public List<com.example.bookingkhachsan.dto.HotelMapDto> getMapData() {
        return khachSanRepository.findAllWithPhongsForMap().stream()
                .filter(hotel -> hotel.getViDo() != null && hotel.getKinhDo() != null)
                .map(hotel -> {
                    com.example.bookingkhachsan.dto.HotelMapDto dto = new com.example.bookingkhachsan.dto.HotelMapDto();
                    dto.setId(hotel.getId());
                    dto.setTen(hotel.getTen());
                    dto.setHinhAnhBia(hotel.getHinhAnhBia());
                    dto.setSoSao(hotel.getSoSao());
                    dto.setDiemDanhGiaTrungBinh(hotel.getDiemDanhGiaTrungBinh());
                    dto.setSoLuotDanhGia(hotel.getSoLuotDanhGia());
                    dto.setViDo(hotel.getViDo());
                    dto.setKinhDo(hotel.getKinhDo());
                    
                    // Tìm giá thấp nhất từ danh sách phòng
                    java.math.BigDecimal minPrice = null;
                    if (hotel.getPhongs() != null && !hotel.getPhongs().isEmpty()) {
                         minPrice = hotel.getPhongs().stream()
                                .map(com.example.bookingkhachsan.entity.Phong::getGiaTien)
                                .filter(java.util.Objects::nonNull)
                                .min(java.math.BigDecimal::compareTo)
                                .orElse(null);
                    }
                    dto.setGiaThapNhat(minPrice);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public KhachSan updateHotel(Integer id, com.example.bookingkhachsan.dto.HotelDto dto) {
        KhachSan hotel = getDetails(id);
        mapDtoToEntity(dto, hotel);
        return khachSanRepository.save(hotel);
    }

    @Transactional
    public void deleteHotel(Integer id) {
        KhachSan hotel = getDetails(id);
        var bookings = phieuDatPhongRepository.findByPhong_KhachSan_IdOrderByNgayDatDesc(id);
        if (!bookings.isEmpty()) {
            throw new RuntimeException("Không thể xóa khách sạn đã có đặt phòng. Vui lòng hủy hoặc hoàn tất các đặt phòng trước.");
        }
        for (DanhGia d : danhGiaRepository.findByKhachSanId(id)) {
            danhGiaRepository.delete(d);
        }
        for (com.example.bookingkhachsan.entity.DichVu dv : dichVuRepository.findByKhachSanId(id)) {
            dichVuRepository.delete(dv);
        }
        for (com.example.bookingkhachsan.entity.Phong p : phongRepository.findByKhachSanId(id)) {
            phongRepository.delete(p);
        }
        for (com.example.bookingkhachsan.entity.KhuyenMai km : khuyenMaiRepository.findByKhachSan_Id(id)) {
            khuyenMaiRepository.delete(km);
        }
        khachSanRepository.delete(hotel);
    }

    /**
     * HotelManager cập nhật: tiền cọ, giờ nhận/trả phòng, hình ảnh (hinhAnhBia, hinhAnhs).
     */
    @Transactional
    public KhachSan updateHotelSettings(Integer id, com.example.bookingkhachsan.dto.HotelDto dto) {
        KhachSan hotel = getDetails(id);
        if (dto.getTiLeCoc() != null) {
            hotel.setTiLeCoc(dto.getTiLeCoc());
        }
        if (dto.getGioNhanPhong() != null) {
            hotel.setGioNhanPhong(dto.getGioNhanPhong());
        }
        if (dto.getGioTraPhong() != null) {
            hotel.setGioTraPhong(dto.getGioTraPhong());
        }
        if (dto.getHinhAnhBia() != null) {
            hotel.setHinhAnhBia(dto.getHinhAnhBia());
        }
        if (dto.getHinhAnhs() != null) {
            hotel.setHinhAnhs(dto.getHinhAnhs());
        }
        return khachSanRepository.save(hotel);
    }

    private void mapDtoToEntity(com.example.bookingkhachsan.dto.HotelDto dto, KhachSan hotel) {
        hotel.setTen(dto.getTen());
        hotel.setDiaChi(dto.getDiaChi());
        hotel.setSoSao(dto.getSoSao());
        hotel.setMoTa(dto.getMoTa());
        hotel.setGioNhanPhong(dto.getGioNhanPhong());
        hotel.setGioTraPhong(dto.getGioTraPhong());
        hotel.setViDo(dto.getViDo());
        hotel.setKinhDo(dto.getKinhDo());
        if (dto.getTiLeCoc() != null) {
            hotel.setTiLeCoc(dto.getTiLeCoc());
        }

        // Images
        hotel.setHinhAnhBia(dto.getHinhAnhBia());
        if (dto.getHinhAnhs() != null) {
            hotel.setHinhAnhs(dto.getHinhAnhs());
        }
        // Auto-set cover from first image if not set
        if ((hotel.getHinhAnhBia() == null || hotel.getHinhAnhBia().isBlank())
                && hotel.getHinhAnhs() != null && !hotel.getHinhAnhs().isEmpty()) {
            hotel.setHinhAnhBia(hotel.getHinhAnhs().get(0));
        }

        if (dto.getViTriId() != null && dto.getViTriId() > 0) {
            // Chọn vị trí có sẵn
            com.example.bookingkhachsan.entity.ViTri viTri = new com.example.bookingkhachsan.entity.ViTri();
            viTri.setId(dto.getViTriId());
            hotel.setViTri(viTri);
        } else if (dto.getViTriName() != null && !dto.getViTriName().isBlank() && dto.getTinhThanhId() != null) {
            // Tạo hoặc tìm vị trí mới theo tên + tỉnh thành
            com.example.bookingkhachsan.entity.ViTri viTri = viTriRepository
                    .findByTenAndTinhThanh_Id(dto.getViTriName().trim(), dto.getTinhThanhId())
                    .orElseGet(() -> {
                        com.example.bookingkhachsan.entity.ViTri nv = new com.example.bookingkhachsan.entity.ViTri();
                        nv.setTen(dto.getViTriName().trim());
                        nv.setTrangThai(true);
                        com.example.bookingkhachsan.entity.TinhThanh tt = new com.example.bookingkhachsan.entity.TinhThanh();
                        tt.setId(dto.getTinhThanhId());
                        nv.setTinhThanh(tt);
                        return viTriRepository.save(nv);
                    });
            hotel.setViTri(viTri);
        } else if (dto.getTinhThanhId() != null && dto.getTinhThanhId() > 0) {
            // Chỉ chọn tỉnh, chưa chọn vị trí: dùng vị trí đầu tiên của tỉnh hoặc tạo mới
            java.util.List<com.example.bookingkhachsan.entity.ViTri> list = viTriRepository.findByTinhThanh_Id(dto.getTinhThanhId());
            com.example.bookingkhachsan.entity.ViTri viTri = list.isEmpty()
                    ? viTriRepository.save(createDefaultViTri(dto.getTinhThanhId()))
                    : list.get(0);
            hotel.setViTri(viTri);
        }

        if (dto.getNguoiDungId() != null) {
            com.example.bookingkhachsan.entity.NguoiDung nguoiDung = new com.example.bookingkhachsan.entity.NguoiDung();
            nguoiDung.setId(dto.getNguoiDungId());
            hotel.setNguoiQuanLy(nguoiDung);
        }
    }

    private com.example.bookingkhachsan.entity.ViTri createDefaultViTri(Integer tinhThanhId) {
        com.example.bookingkhachsan.entity.ViTri v = new com.example.bookingkhachsan.entity.ViTri();
        v.setTen("Tổng quan");
        v.setTrangThai(true);
        com.example.bookingkhachsan.entity.TinhThanh tt = new com.example.bookingkhachsan.entity.TinhThanh();
        tt.setId(tinhThanhId);
        v.setTinhThanh(tt);
        return v;
    }
}

