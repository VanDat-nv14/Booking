package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.HotelDetailDto;
import com.example.bookingkhachsan.dto.HotelSearchResultDto;
import com.example.bookingkhachsan.entity.DanhGia;
import com.example.bookingkhachsan.entity.DichVu;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.entity.ViTri;
import com.example.bookingkhachsan.entity.TinhThanh;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.Phong;
import com.example.bookingkhachsan.repository.DanhGiaRepository;
import com.example.bookingkhachsan.repository.DichVuRepository;
import com.example.bookingkhachsan.repository.PhieuDatPhongRepository;
import com.example.bookingkhachsan.repository.PhongRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
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

    private final com.example.bookingkhachsan.repository.ViTriRepository viTriRepository;
    private final com.example.bookingkhachsan.repository.TinhThanhRepository tinhThanhRepository;
    private final com.example.bookingkhachsan.repository.QuocGiaRepository quocGiaRepository;
    private final com.example.bookingkhachsan.repository.PhongKhaDungRepository phongKhaDungRepository;

    @Transactional(readOnly = true)
    public List<HotelSearchResultDto> search(Integer viTriId, Integer soSao, BigDecimal minPrice, BigDecimal maxPrice, LocalDate checkIn, LocalDate checkOut) {
        LocalDate cin = checkIn != null ? checkIn : LocalDate.now();
        LocalDate cout = checkOut != null ? checkOut : cin.plusDays(1);
        List<KhachSan> candidates = khachSanRepository.findHotelsForSearchCards(viTriId, soSao, minPrice, maxPrice, "Ngừng hoạt động");
        return candidates.stream()
                .map(h -> {
                    int n = phongKhaDungRepository.findAvailablePhongIds(h.getId(), cin, cout).size();
                    return HotelSearchResultDto.from(h, n);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HotelSearchResultDto> getPublicWithAvailability(Integer limit, LocalDate checkIn, LocalDate checkOut) {
        LocalDate cin = checkIn != null ? checkIn : LocalDate.now();
        LocalDate cout = checkOut != null ? checkOut : cin.plusDays(1);
        List<KhachSan> all = getAll(limit);
        return all.stream()
                .map(h -> {
                    int n = phongKhaDungRepository.findAvailablePhongIds(h.getId(), cin, cout).size();
                    return HotelSearchResultDto.from(h, n);
                })
                .collect(Collectors.toList());
    }

    public List<KhachSan> getAll(Integer limit) {
        List<KhachSan> all;
        if (limit != null && limit > 0) {
            all = khachSanRepository.findAll(PageRequest.of(0, Math.min(limit, 100))).getContent();
        } else {
            all = khachSanRepository.findAll();
        }
        // Chỉ trả về khách sạn đang hoạt động cho public endpoint
        return all.stream()
                .filter(ks -> !"Ngừng hoạt động".equals(ks.getTrangThai()))
                .collect(Collectors.toList());
    }

    /** Admin: lấy toàn bộ khách sạn bất kể trạng thái */
    public List<KhachSan> getAllForAdmin() {
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
            ri.setPhanHoi(r.getPhanHoi());
            ri.setNgayPhanHoi(r.getNgayPhanHoi());
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
                    BigDecimal minPrice = null;
                    if (hotel.getPhongs() != null && !hotel.getPhongs().isEmpty()) {
                         minPrice = hotel.getPhongs().stream()
                                .map(Phong::getGiaTien)
                                .filter(Objects::nonNull)
                                .min(BigDecimal::compareTo)
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
        for (DichVu dv : dichVuRepository.findByKhachSanId(id)) {
            dichVuRepository.delete(dv);
        }
        for (Phong p : phongRepository.findByKhachSanId(id)) {
            phongRepository.delete(p);
        }
        khachSanRepository.delete(hotel);
    }

    /** Admin: bật/tắt trạng thái hoạt động của khách sạn */
    @Transactional
    public KhachSan toggleStatus(Integer id) {
        KhachSan hotel = getDetails(id);
        if ("Ngừng hoạt động".equals(hotel.getTrangThai())) {
            hotel.setTrangThai("Hoạt động");
        } else {
            hotel.setTrangThai("Ngừng hoạt động");
        }
        return khachSanRepository.save(hotel);
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
        if (dto.getNguongCoc() != null) {
            hotel.setNguongCoc(dto.getNguongCoc());
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

        // Logic xử lý địa điểm 3 cấp (Quốc Gia -> Tỉnh Thành -> Vị Trí)
        Integer currentQuocGiaId = dto.getQuocGiaId();
        if (dto.getQuocGiaName() != null && !dto.getQuocGiaName().isBlank()) {
            com.example.bookingkhachsan.entity.QuocGia qg = quocGiaRepository.findByTen(dto.getQuocGiaName().trim())
                    .orElseGet(() -> {
                        com.example.bookingkhachsan.entity.QuocGia nqg = new com.example.bookingkhachsan.entity.QuocGia();
                        nqg.setTen(dto.getQuocGiaName().trim());
                        nqg.setTrangThai(true);
                        return quocGiaRepository.save(nqg);
                    });
            currentQuocGiaId = qg.getId();
        }

        Integer currentTinhThanhId = dto.getTinhThanhId();
        if (dto.getTinhThanhName() != null && !dto.getTinhThanhName().isBlank() && currentQuocGiaId != null) {
            final Integer qgId = currentQuocGiaId;
            com.example.bookingkhachsan.entity.TinhThanh tt = tinhThanhRepository.findByTenAndQuocGia_Id(dto.getTinhThanhName().trim(), qgId)
                    .orElseGet(() -> {
                        com.example.bookingkhachsan.entity.TinhThanh ntt = new com.example.bookingkhachsan.entity.TinhThanh();
                        ntt.setTen(dto.getTinhThanhName().trim());
                        ntt.setTrangThai(true);
                        com.example.bookingkhachsan.entity.QuocGia quocGia = new com.example.bookingkhachsan.entity.QuocGia();
                        quocGia.setId(qgId);
                        ntt.setQuocGia(quocGia);
                        return tinhThanhRepository.save(ntt);
                    });
            currentTinhThanhId = tt.getId();
        }

        if (dto.getViTriId() != null && dto.getViTriId() > 0) {
            // Chọn vị trí có sẵn
            com.example.bookingkhachsan.entity.ViTri viTri = new com.example.bookingkhachsan.entity.ViTri();
            viTri.setId(dto.getViTriId());
            hotel.setViTri(viTri);
        } else if (dto.getViTriName() != null && !dto.getViTriName().isBlank() && currentTinhThanhId != null) {
            // Tạo hoặc tìm vị trí mới theo tên + tỉnh thành
            final Integer ttId = currentTinhThanhId;
            com.example.bookingkhachsan.entity.ViTri viTri = viTriRepository
                    .findByTenAndTinhThanh_Id(dto.getViTriName().trim(), ttId)
                    .orElseGet(() -> {
                        com.example.bookingkhachsan.entity.ViTri nv = new com.example.bookingkhachsan.entity.ViTri();
                        nv.setTen(dto.getViTriName().trim());
                        nv.setTrangThai(true);
                        com.example.bookingkhachsan.entity.TinhThanh tt_ref = new com.example.bookingkhachsan.entity.TinhThanh();
                        tt_ref.setId(ttId);
                        nv.setTinhThanh(tt_ref);
                        return viTriRepository.save(nv);
                    });
            hotel.setViTri(viTri);
        } else if (currentTinhThanhId != null && currentTinhThanhId > 0) {
            // Chỉ chọn tỉnh, chưa chọn vị trí: dùng vị trí đầu tiên của tỉnh hoặc tạo mới
            List<ViTri> list = viTriRepository.findByTinhThanh_Id(currentTinhThanhId);
            ViTri viTri = list.isEmpty()
                    ? viTriRepository.save(createDefaultViTri(currentTinhThanhId))
                    : list.get(0);
            hotel.setViTri(viTri);
        }

        if (dto.getNguoiDungId() != null) {
            NguoiDung nguoiDung = new NguoiDung();
            nguoiDung.setId(dto.getNguoiDungId());
            hotel.setNguoiQuanLy(nguoiDung);
        }
    }

    private ViTri createDefaultViTri(Integer tinhThanhId) {
        ViTri v = new ViTri();
        v.setTen("Tổng quan");
        v.setTrangThai(true);
        TinhThanh tt = new TinhThanh();
        tt.setId(tinhThanhId);
        v.setTinhThanh(tt);
        return v;
    }
}
