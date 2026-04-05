package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.AuditLog;
import com.example.bookingkhachsan.entity.DiscountFramework;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.entity.PromotionCode;
import com.example.bookingkhachsan.repository.AuditLogRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import com.example.bookingkhachsan.repository.PromotionCodeRepository;
import com.example.bookingkhachsan.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Mã khuyến mãi nhập khi đặt phòng — chỉ Hotel Manager, gắn khách sạn của manager.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionCodeService {

    private static final BigDecimal MAX_PERCENT = new BigDecimal("80");

    private final PromotionCodeRepository promotionCodeRepository;
    private final KhachSanRepository khachSanRepository;
    private final AuditLogRepository auditLogRepository;
    private final IdGenerator idGenerator;
    private final DiscountFrameworkService discountFrameworkService;

    public record CreatePromotionCodeRequest(
            String code,
            String ten,
            String moTa,
            String loai,
            BigDecimal giaTri,
            BigDecimal giamToiDa,
            BigDecimal donHangToiThieu,
            Integer soDemToiThieu,
            Integer loaiPhongId,
            Integer soLanSuDungToiDa,
            Integer soLanToiDaMoiUser,
            LocalDate ngayBatDau,
            LocalDate ngayKetThuc,
            Integer khachSanId
    ) {}

    public record UpdatePromotionCodeRequest(
            String ten,
            String moTa,
            BigDecimal giamToiDa,
            BigDecimal donHangToiThieu,
            Integer soDemToiThieu,
            Integer soLanSuDungToiDa,
            Integer soLanToiDaMoiUser,
            LocalDate ngayKetThuc,
            String trangThai
    ) {}

    @Transactional
    public PromotionCode create(CreatePromotionCodeRequest req, Integer managerUserId, String managerEmail) {
        Integer managedHotelId = resolveManagedHotelId(managerUserId);
        if (!managedHotelId.equals(req.khachSanId())) {
            throw new IllegalArgumentException("Chỉ được tạo mã cho khách sạn mà bạn quản lý.");
        }
        if (req.code() == null || req.code().isBlank()) {
            throw new IllegalArgumentException("Mã không được để trống.");
        }
        String code = req.code().trim().toUpperCase();
        if (promotionCodeRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Mã '" + code + "' đã tồn tại.");
        }
        if (!List.of("PERCENT", "FIXED").contains(req.loai())) {
            throw new IllegalArgumentException("Loại phải là PERCENT hoặc FIXED.");
        }
        if (req.giaTri() == null || req.giaTri().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị phải > 0.");
        }
        
        // Validate giá trị theo DiscountFramework
        log.info("[PromotionCode.create] Code={}, Type={}, Value={}, MinOrder={}", code, req.loai(), req.giaTri(), req.donHangToiThieu());
        DiscountFramework framework = discountFrameworkService.getFramework();
        log.info("[PromotionCode.create] Framework loaded: id={}, phanTramToiDa={}, phanTramToiThieu={}, soTienToiDa={}, donHangToiThieu={}", 
            framework != null ? framework.getId() : "null",
            framework != null ? framework.getPhanTramToiDa() : "null",
            framework != null ? framework.getPhanTramToiThieu() : "null",
            framework != null ? framework.getSoTienToiDa() : "null",
            framework != null ? framework.getDonHangToiThieuBatBuoc() : "null");
        
        try {
            validatePromotionCodeWithFramework(req.loai(), req.giaTri(), req.donHangToiThieu(), framework);
            log.info("[PromotionCode.create] Framework validation passed for code={}", code);
        } catch (IllegalArgumentException e) {
            log.error("[PromotionCode.create] Framework validation error for code={}: {}", code, e.getMessage());
            throw e;
        }
        
        if ("PERCENT".equals(req.loai()) && req.giaTri().compareTo(MAX_PERCENT) > 0) {
            throw new IllegalArgumentException("Phần trăm giảm tối đa " + MAX_PERCENT + "%.");
        }
        if (req.ngayBatDau() == null || req.ngayKetThuc() == null
                || !req.ngayBatDau().isBefore(req.ngayKetThuc())) {
            throw new IllegalArgumentException("Khoảng ngày hiệu lực không hợp lệ.");
        }
        KhachSan ks = khachSanRepository.findById(req.khachSanId())
                .orElseThrow(() -> new IllegalArgumentException("Khách sạn không tồn tại."));

        PromotionCode p = PromotionCode.builder()
                .id(idGenerator.generatePromotionCodeId())
                .code(code)
                .ten(req.ten())
                .moTa(req.moTa())
                .loai(req.loai())
                .giaTri(req.giaTri())
                .giamToiDa(req.giamToiDa())
                .donHangToiThieu(req.donHangToiThieu())
                .soDemToiThieu(req.soDemToiThieu())
                .loaiPhongId(req.loaiPhongId())
                .ngayBatDau(req.ngayBatDau())
                .ngayKetThuc(req.ngayKetThuc())
                .soLanSuDungToiDa(req.soLanSuDungToiDa())
                .soLanDaDung(0)
                .soLanToiDaMoiUser(req.soLanToiDaMoiUser())
                .khachSan(ks)
                .trangThai("ACTIVE")
                .nguoiTao(managerEmail)
                .build();

        PromotionCode saved = promotionCodeRepository.save(p);
        auditLogRepository.save(AuditLog.builder()
                .module("PROMOTION_CODE")
                .entityId(saved.getId())
                .action("CREATE")
                .performedBy(managerEmail)
                .role("HotelManager")
                .description("Tạo mã khuyến mãi KS: " + code)
                .build());
        return saved;
    }

    @Transactional
    public PromotionCode update(String id, UpdatePromotionCodeRequest req, Integer managerUserId, String managerEmail) {
        PromotionCode p = getById(id);
        assertManagerOwnsPromotion(managerUserId, p);

        if (req.ten() != null) {
            p.setTen(req.ten());
        }
        if (req.moTa() != null) {
            p.setMoTa(req.moTa());
        }
        if (req.giamToiDa() != null) {
            p.setGiamToiDa(req.giamToiDa());
        }
        if (req.donHangToiThieu() != null) {
            // Validate with framework when donHangToiThieu changes
            DiscountFramework framework = discountFrameworkService.getFramework();
            validatePromotionCodeWithFramework(p.getLoai(), p.getGiaTri(), req.donHangToiThieu(), framework);
            p.setDonHangToiThieu(req.donHangToiThieu());
        }
        if (req.soDemToiThieu() != null) {
            p.setSoDemToiThieu(req.soDemToiThieu());
        }
        if (req.soLanSuDungToiDa() != null) {
            p.setSoLanSuDungToiDa(req.soLanSuDungToiDa());
        }
        if (req.soLanToiDaMoiUser() != null) {
            p.setSoLanToiDaMoiUser(req.soLanToiDaMoiUser());
        }
        if (req.ngayKetThuc() != null) {
            if (!p.getNgayBatDau().isBefore(req.ngayKetThuc())) {
                throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu.");
            }
            p.setNgayKetThuc(req.ngayKetThuc());
        }
        if (req.trangThai() != null) {
            p.setTrangThai(req.trangThai());
        }
        PromotionCode saved = promotionCodeRepository.save(p);
        auditLogRepository.save(AuditLog.builder()
                .module("PROMOTION_CODE")
                .entityId(id)
                .action("UPDATE")
                .performedBy(managerEmail)
                .role("HotelManager")
                .description("Cập nhật mã: " + p.getCode())
                .build());
        return saved;
    }

    /**
     * Validate promotion code attributes theo DiscountFramework.
     * Chỉ validate nếu framework có giới hạn được set (khác null).
     */
    private void validatePromotionCodeWithFramework(String loai, BigDecimal giaTri, BigDecimal donHangToiThieu, DiscountFramework framework) {
        if (framework == null) {
            log.warn("[validateFramework] Framework is NULL - skipping validation. This may cause 400 error if framework is required.");
            return;
        }
        if (giaTri == null) {
            log.warn("[validateFramework] giaTri is NULL - skipping validation");
            return;
        }
        
        try {
            log.debug("[validateFramework] Starting validation: loai={}, giaTri={}, donHangToiThieu={}", loai, giaTri, donHangToiThieu);
            
            if ("PERCENT".equals(loai)) {
                log.debug("[validateFramework] PERCENT validation: min={}, max={}, value={}", 
                    framework.getPhanTramToiThieu(), framework.getPhanTramToiDa(), giaTri);
                
                if (framework.getPhanTramToiThieu() != null && framework.getPhanTramToiThieu().compareTo(BigDecimal.ZERO) > 0) {
                    if (giaTri.compareTo(framework.getPhanTramToiThieu()) < 0) {
                        log.error("[validateFramework] PERCENT below minimum: value={}, min={}", giaTri, framework.getPhanTramToiThieu());
                        throw new IllegalArgumentException("Phần trăm giảm tối thiểu là " + framework.getPhanTramToiThieu() + "%.");
                    }
                }
                if (framework.getPhanTramToiDa() != null && framework.getPhanTramToiDa().compareTo(BigDecimal.ZERO) > 0) {
                    if (giaTri.compareTo(framework.getPhanTramToiDa()) > 0) {
                        log.error("[validateFramework] PERCENT above maximum: value={}, max={}", giaTri, framework.getPhanTramToiDa());
                        throw new IllegalArgumentException("Phần trăm giảm tối đa là " + framework.getPhanTramToiDa() + "%.");
                    }
                }
            } else if ("FIXED".equals(loai)) {
                log.debug("[validateFramework] FIXED validation: max={}, value={}", framework.getSoTienToiDa(), giaTri);
                
                if (framework.getSoTienToiDa() != null && framework.getSoTienToiDa().compareTo(BigDecimal.ZERO) > 0) {
                    if (giaTri.compareTo(framework.getSoTienToiDa()) > 0) {
                        log.error("[validateFramework] FIXED above maximum: value={}, max={}", giaTri, framework.getSoTienToiDa());
                        throw new IllegalArgumentException("Số tiền giảm tối đa là " + framework.getSoTienToiDa() + " VND.");
                    }
                }
            }
            
            // Validate donHangToiThieu >= donHangToiThieuBatBuoc (only if both are set)
            log.debug("[validateFramework] MinOrder validation: required={}, provided={}", 
                framework.getDonHangToiThieuBatBuoc(), donHangToiThieu);
                
            if (framework.getDonHangToiThieuBatBuoc() != null && framework.getDonHangToiThieuBatBuoc().compareTo(BigDecimal.ZERO) > 0) {
                if (donHangToiThieu == null) {
                    log.error("[validateFramework] MinOrder is NULL but framework requires {}", framework.getDonHangToiThieuBatBuoc());
                    throw new IllegalArgumentException("Đơn hàng tối thiểu bắt buộc là " + framework.getDonHangToiThieuBatBuoc() + " VND.");
                }
                if (donHangToiThieu.compareTo(framework.getDonHangToiThieuBatBuoc()) < 0) {
                    log.error("[validateFramework] MinOrder below required: provided={}, required={}", donHangToiThieu, framework.getDonHangToiThieuBatBuoc());
                    throw new IllegalArgumentException("Đơn hàng tối thiểu bắt buộc là " + framework.getDonHangToiThieuBatBuoc() + " VND.");
                }
            }
            log.info("[validateFramework] Validation PASSED");
        } catch (IllegalArgumentException e) {
            log.error("[validateFramework] Validation FAILED: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("[validateFramework] Unexpected error during validation: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Lỗi xác thực khung công tác: " + e.getMessage());
        }
    }

    public List<PromotionCode> listForManager(Integer managerUserId) {
        Integer hid = resolveManagedHotelId(managerUserId);
        return promotionCodeRepository.findByKhachSan_IdOrderByCreatedAtDesc(hid);
    }

    public PromotionCode getById(String id) {
        return promotionCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã khuyến mãi: " + id));
    }

    public PromotionCode getByIdForManager(String id, Integer managerUserId) {
        PromotionCode p = getById(id);
        assertManagerOwnsPromotion(managerUserId, p);
        return p;
    }

    private Integer resolveManagedHotelId(Integer managerUserId) {
        return khachSanRepository.findByNguoiQuanLy_Id(managerUserId)
                .map(KhachSan::getId)
                .orElseThrow(() -> new IllegalStateException("Tài khoản không được gán quản lý khách sạn."));
    }

    private void assertManagerOwnsPromotion(Integer managerUserId, PromotionCode p) {
        Integer hid = resolveManagedHotelId(managerUserId);
        if (p.getKhachSan() == null || !p.getKhachSan().getId().equals(hid)) {
            throw new IllegalArgumentException("Không có quyền với mã này.");
        }
    }
}
