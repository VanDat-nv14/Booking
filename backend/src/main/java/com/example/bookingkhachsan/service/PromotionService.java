package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.AuditLog;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.entity.Promotion;
import com.example.bookingkhachsan.repository.AuditLogRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import com.example.bookingkhachsan.repository.PromotionRepository;
import com.example.bookingkhachsan.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final KhachSanRepository khachSanRepository;
    private final AuditLogRepository auditLogRepository;
    private final IdGenerator idGenerator;
    private final SystemNotificationService systemNotificationService;

    /** Ngưỡng ngân sách mặc định để yêu cầu phê duyệt Admin: 10 triệu VNĐ */
    private static final BigDecimal DEFAULT_BUDGET_THRESHOLD = new BigDecimal("10000000");

    private static final List<String> VALID_TYPES =
            Arrays.asList("COMBO", "BUY_X_GET_Y", "SEASONAL", "FLASH_SALE", "LOYALTY");

    // DTO inner classes
    public record CreatePromotionRequest(
            String ten,
            String moTa,
            String loai,
            Integer soLuongX,
            Integer soLuongY,
            BigDecimal tiLeGiam,
            BigDecimal nganSach,
            LocalDate ngayBatDau,
            LocalDate ngayKetThuc,
            Integer khachSanId,
            String ghiChu
    ) {}

    public record UpdatePromotionRequest(
            String ten,
            String moTa,
            BigDecimal tiLeGiam,
            BigDecimal nganSach,
            LocalDate ngayKetThuc,
            String ghiChu
    ) {}

    public record ReviewPromotionRequest(
            boolean approved,
            String lyDoTuChoi
    ) {}

    /**
     * Manager tạo nháp chương trình khuyến mãi.
     */
    @Transactional
    public Promotion createDraft(CreatePromotionRequest req, String managerEmail) {
        validateCreateRequest(req);

        KhachSan khachSan = null;
        if (req.khachSanId() != null) {
            khachSan = khachSanRepository.findById(req.khachSanId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Khách sạn ID " + req.khachSanId() + " không tồn tại."));
        }

        Promotion promotion = Promotion.builder()
                .id(idGenerator.generatePromotionId())
                .ten(req.ten())
                .moTa(req.moTa())
                .loai(req.loai())
                .soLuongX(req.soLuongX())
                .soLuongY(req.soLuongY())
                .tiLeGiam(req.tiLeGiam())
                .nganSach(req.nganSach())
                .nguongNganSach(DEFAULT_BUDGET_THRESHOLD)
                .ngayBatDau(req.ngayBatDau())
                .ngayKetThuc(req.ngayKetThuc())
                .khachSan(khachSan)
                .trangThai("DRAFT")
                .nguoiTao(managerEmail)
                .ghiChu(req.ghiChu())
                .build();

        Promotion saved = promotionRepository.save(promotion);

        auditLogRepository.save(AuditLog.builder()
                .module("PROMOTION")
                .entityId(saved.getId())
                .action("CREATE_DRAFT")
                .performedBy(managerEmail)
                .role("HotelManager")
                .description("Tạo nháp khuyến mãi: " + req.ten() + " | Loại: " + req.loai())
                .build());

        return saved;
    }

    /**
     * Manager gửi khuyến mãi để phê duyệt.
     * - Nếu ngân sách > ngưỡng -> PENDING_APPROVAL (bắt buộc Admin duyệt)
     * - Nếu ngân sách <= ngưỡng -> tự động APPROVED và ACTIVE nếu trong thời hạn
     */
    @Transactional
    public Promotion submitForApproval(String promotionId, String managerEmail) {
        Promotion promotion = getById(promotionId);

        if (!"DRAFT".equals(promotion.getTrangThai())) {
            throw new IllegalStateException(
                    "Chỉ có thể gửi duyệt khuyến mãi ở trạng thái DRAFT. Hiện tại: "
                            + promotion.getTrangThai());
        }
        if (!managerEmail.equals(promotion.getNguoiTao())) {
            throw new IllegalArgumentException("Chỉ người tạo mới có thể gửi duyệt khuyến mãi này.");
        }

        BigDecimal budget = promotion.getNganSach() != null ? promotion.getNganSach() : BigDecimal.ZERO;
        BigDecimal threshold = promotion.getNguongNganSach() != null
                ? promotion.getNguongNganSach() : DEFAULT_BUDGET_THRESHOLD;

        String newStatus;
        if (budget.compareTo(threshold) > 0) {
            // Ngân sách cao -> yêu cầu Admin phê duyệt
            newStatus = "PENDING_APPROVAL";
            log.info("[PROMOTION] {} gửi duyệt, ngân sách {} > {} -> PENDING_APPROVAL",
                    promotionId, budget, threshold);
        } else {
            // Ngân sách thấp -> tự động duyệt
            newStatus = determineAutoApprovedStatus(promotion);
            log.info("[PROMOTION] {} tự động duyệt, ngân sách {} <= {} -> {}",
                    promotionId, budget, threshold, newStatus);
        }

        promotion.setTrangThai(newStatus);
        Promotion updated = promotionRepository.save(promotion);

        auditLogRepository.save(AuditLog.builder()
                .module("PROMOTION")
                .entityId(promotionId)
                .action("SUBMIT_FOR_APPROVAL")
                .performedBy(managerEmail)
                .role("HotelManager")
                .description("Gửi duyệt khuyến mãi | Ngân sách: " + budget
                        + " | Ngưỡng: " + threshold + " | Kết quả: " + newStatus)
                .build());

        return updated;
    }

    /**
     * Admin phê duyệt hoặc từ chối khuyến mãi.
     */
    @Transactional
    public Promotion reviewPromotion(String promotionId, ReviewPromotionRequest req, String adminEmail) {
        Promotion promotion = getById(promotionId);

        if (!"PENDING_APPROVAL".equals(promotion.getTrangThai())) {
            throw new IllegalStateException(
                    "Khuyến mãi không ở trạng thái chờ phê duyệt. Hiện tại: "
                            + promotion.getTrangThai());
        }

        String newStatus;
        if (req.approved()) {
            newStatus = determineAutoApprovedStatus(promotion);
            promotion.setNguoiPheDuyet(adminEmail);
        } else {
            if (req.lyDoTuChoi() == null || req.lyDoTuChoi().isBlank()) {
                throw new IllegalArgumentException("Phải có lý do từ chối.");
            }
            newStatus = "REJECTED";
            promotion.setLyDoTuChoi(req.lyDoTuChoi());
            promotion.setNguoiPheDuyet(adminEmail);
        }

        promotion.setTrangThai(newStatus);
        Promotion updated = promotionRepository.save(promotion);

        auditLogRepository.save(AuditLog.builder()
                .module("PROMOTION")
                .entityId(promotionId)
                .action(req.approved() ? "APPROVE" : "REJECT")
                .performedBy(adminEmail)
                .role("Admin")
                .description((req.approved() ? "Phê duyệt" : "Từ chối") + " khuyến mãi: "
                        + promotion.getTen()
                        + (req.approved() ? "" : " | Lý do: " + req.lyDoTuChoi()))
                .build());

        // Gửi thông báo hệ thống cho Manager
        String title = "Kết quả duyệt khuyến mãi: " + promotion.getTen();
        String statusText = req.approved() ? "được PHÊ DUYỆT" : "bị TỪ CHỐI";
        String content = String.format("Khuyến mãi %s %s.%s", 
                promotion.getId(), 
                statusText, 
                req.approved() ? "" : " Lý do: " + req.lyDoTuChoi());
        
        systemNotificationService.createDirectNotification(promotion.getNguoiTao(), title, content, req.approved() ? "INFO" : "SYSTEM");

        return updated;
    }

    /**
     * Manager cập nhật nháp (chỉ khi DRAFT hoặc REJECTED).
     */
    @Transactional
    public Promotion updateDraft(String promotionId, UpdatePromotionRequest req, String managerEmail) {
        Promotion promotion = getById(promotionId);

        if (!List.of("DRAFT", "REJECTED").contains(promotion.getTrangThai())) {
            throw new IllegalStateException(
                    "Chỉ có thể chỉnh sửa khuyến mãi ở trạng thái DRAFT hoặc REJECTED.");
        }

        if (req.ten() != null) promotion.setTen(req.ten());
        if (req.moTa() != null) promotion.setMoTa(req.moTa());
        if (req.tiLeGiam() != null) promotion.setTiLeGiam(req.tiLeGiam());
        if (req.nganSach() != null) promotion.setNganSach(req.nganSach());
        if (req.ngayKetThuc() != null) {
            if (!promotion.getNgayBatDau().isBefore(req.ngayKetThuc())) {
                throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu.");
            }
            promotion.setNgayKetThuc(req.ngayKetThuc());
        }
        if (req.ghiChu() != null) promotion.setGhiChu(req.ghiChu());

        // Reset về DRAFT nếu đang REJECTED (để gửi duyệt lại)
        if ("REJECTED".equals(promotion.getTrangThai())) {
            promotion.setTrangThai("DRAFT");
            promotion.setLyDoTuChoi(null);
        }

        Promotion updated = promotionRepository.save(promotion);

        auditLogRepository.save(AuditLog.builder()
                .module("PROMOTION")
                .entityId(promotionId)
                .action("UPDATE_DRAFT")
                .performedBy(managerEmail)
                .role("HotelManager")
                .description("Cập nhật nháp khuyến mãi: " + promotion.getTen())
                .build());

        return updated;
    }

    /**
     * Hủy khuyến mãi (Manager hủy DRAFT/PENDING, Admin hủy bất kỳ trừ EXPIRED).
     */
    @Transactional
    public Promotion cancelPromotion(String promotionId, String cancellerEmail, String role) {
        Promotion promotion = getById(promotionId);

        boolean isAdmin = "Admin".equals(role) || "ADMIN".equals(role);
        boolean canCancel = isAdmin
                ? !List.of("EXPIRED", "CANCELLED").contains(promotion.getTrangThai())
                : List.of("DRAFT", "PENDING_APPROVAL").contains(promotion.getTrangThai());

        if (!canCancel) {
            throw new IllegalStateException(
                    "Không thể hủy khuyến mãi ở trạng thái: " + promotion.getTrangThai());
        }

        promotion.setTrangThai("CANCELLED");
        Promotion updated = promotionRepository.save(promotion);

        auditLogRepository.save(AuditLog.builder()
                .module("PROMOTION")
                .entityId(promotionId)
                .action("CANCEL")
                .performedBy(cancellerEmail)
                .role(role)
                .description("Hủy khuyến mãi: " + promotion.getTen())
                .build());

        return updated;
    }

    public Promotion getById(String id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi: " + id));
    }

    public List<Promotion> getAll() {
        return promotionRepository.findAll();
    }

    public List<Promotion> getPendingApprovals() {
        return promotionRepository.findPendingApprovals();
    }

    public List<Promotion> getActivePromotions(Integer hotelId) {
        if (hotelId != null) {
            return promotionRepository.findActivePromotionsForHotel(hotelId, LocalDate.now());
        }
        return promotionRepository.findActivePromotions(LocalDate.now());
    }

    public List<Promotion> getByCreator(String managerEmail) {
        return promotionRepository.findByNguoiTaoOrderByCreatedAtDesc(managerEmail);
    }

    /**
     * Xóa khuyến mãi: Manager chỉ DRAFT/REJECTED của chính mình; Admin DRAFT/REJECTED/CANCELLED.
     */
    @Transactional
    public void deletePromotion(String promotionId, String userEmail, String role) {
        Promotion p = getById(promotionId);
        boolean isAdmin = "Admin".equals(role) || "ADMIN".equals(role);
        if (!isAdmin) {
            if (!userEmail.equals(p.getNguoiTao())) {
                throw new IllegalArgumentException("Chỉ có thể xóa khuyến mãi do bạn tạo.");
            }
            if (!List.of("DRAFT", "REJECTED").contains(p.getTrangThai())) {
                throw new IllegalStateException("Chỉ xóa được khuyến mãi ở trạng thái DRAFT hoặc REJECTED.");
            }
        } else {
            if (!List.of("DRAFT", "REJECTED", "CANCELLED").contains(p.getTrangThai())) {
                throw new IllegalStateException(
                        "Admin chỉ xóa được khuyến mãi nháp, từ chối hoặc đã hủy.");
            }
        }
        promotionRepository.delete(p);
        auditLogRepository.save(AuditLog.builder()
                .module("PROMOTION")
                .entityId(promotionId)
                .action("DELETE")
                .performedBy(userEmail)
                .role(isAdmin ? "Admin" : "HotelManager")
                .description("Xóa khuyến mãi: " + p.getTen())
                .build());
    }

    /**
     * Scheduled: Hàng ngày lúc 1h, đánh dấu các KM đã hết hạn.
     */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void expireOutdatedPromotions() {
        List<Promotion> expired = promotionRepository.findExpiredPromotions(LocalDate.now());
        for (Promotion p : expired) {
            p.setTrangThai("EXPIRED");
            promotionRepository.save(p);
            log.info("[PROMOTION] Đã đánh dấu hết hạn: {}", p.getId());
        }
    }

    // === Private helpers ===

    private void validateCreateRequest(CreatePromotionRequest req) {
        if (req.ten() == null || req.ten().isBlank()) {
            throw new IllegalArgumentException("Tên khuyến mãi không được để trống.");
        }
        if (!VALID_TYPES.contains(req.loai())) {
            throw new IllegalArgumentException("Loại khuyến mãi không hợp lệ: " + req.loai()
                    + ". Phải là: " + VALID_TYPES);
        }
        if ("BUY_X_GET_Y".equals(req.loai())) {
            if (req.soLuongX() == null || req.soLuongX() <= 0) {
                throw new IllegalArgumentException("BUY_X_GET_Y yêu cầu soLuongX > 0.");
            }
            if (req.soLuongY() == null || req.soLuongY() <= 0) {
                throw new IllegalArgumentException("BUY_X_GET_Y yêu cầu soLuongY > 0.");
            }
        }
        if (req.ngayBatDau() == null || req.ngayKetThuc() == null) {
            throw new IllegalArgumentException("Ngày bắt đầu và ngày kết thúc không được để trống.");
        }
        if (!req.ngayBatDau().isBefore(req.ngayKetThuc())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc.");
        }
    }

    private String determineAutoApprovedStatus(Promotion promotion) {
        LocalDate today = LocalDate.now();
        if (today.isBefore(promotion.getNgayBatDau())) {
            return "APPROVED"; // Chưa tới ngày bắt đầu
        } else if (!today.isAfter(promotion.getNgayKetThuc())) {
            return "ACTIVE"; // Đang trong thời hạn
        } else {
            return "EXPIRED"; // Đã hết hạn
        }
    }
}
