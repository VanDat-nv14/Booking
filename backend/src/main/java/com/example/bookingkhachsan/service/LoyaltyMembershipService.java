package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.AuditLog;
import com.example.bookingkhachsan.entity.LoyaltyMembership;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.UserMembership;
import com.example.bookingkhachsan.repository.AuditLogRepository;
import com.example.bookingkhachsan.repository.LoyaltyMembershipRepository;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import com.example.bookingkhachsan.repository.UserMembershipRepository;
import com.example.bookingkhachsan.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoyaltyMembershipService {

    private final LoyaltyMembershipRepository membershipRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final LoyaltyService loyaltyService;
    private final AuditLogRepository auditLogRepository;
    private final IdGenerator idGenerator;

    public record CreateMembershipRequest(
            String ten,
            String moTa,
            BigDecimal gia,
            Integer thoiHanNgay,
            BigDecimal phanTramGiam,
            Integer diemThuong
    ) {}

    public record UpdateMembershipRequest(
            String ten,
            String moTa,
            BigDecimal gia,
            Integer thoiHanNgay,
            BigDecimal phanTramGiam,
            Integer diemThuong,
            Boolean active
    ) {}

    public List<LoyaltyMembership> getAllPackages() {
        return membershipRepository.findAll();
    }

    public List<LoyaltyMembership> getActivePackages() {
        return membershipRepository.findByActiveTrueOrderByGiaAsc();
    }

    @Transactional
    public LoyaltyMembership createPackage(CreateMembershipRequest req, String adminEmail) {
        if (req.ten() == null || req.ten().isBlank()) throw new IllegalArgumentException("Tên gói không được để trống.");
        if (req.gia() == null || req.gia().compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Giá phải > 0.");
        if (req.thoiHanNgay() == null || req.thoiHanNgay() <= 0) throw new IllegalArgumentException("Thời hạn phải > 0 ngày.");
        if (req.phanTramGiam() == null || req.phanTramGiam().compareTo(BigDecimal.ZERO) <= 0
                || req.phanTramGiam().compareTo(new BigDecimal("80")) > 0) {
            throw new IllegalArgumentException("% giảm phải trong khoảng 0-80%.");
        }

        LoyaltyMembership m = LoyaltyMembership.builder()
                .id(idGenerator.generateLoyaltyMembershipId())
                .ten(req.ten())
                .moTa(req.moTa())
                .gia(req.gia())
                .thoiHanNgay(req.thoiHanNgay())
                .phanTramGiam(req.phanTramGiam())
                .diemThuong(req.diemThuong() != null ? req.diemThuong() : 0)
                .active(true)
                .nguoiTao(adminEmail)
                .build();

        LoyaltyMembership saved = membershipRepository.save(m);
        log("CREATE", saved.getId(), "Tạo gói thành viên: " + req.ten(), adminEmail);
        return saved;
    }

    @Transactional
    public LoyaltyMembership updatePackage(String id, UpdateMembershipRequest req, String adminEmail) {
        LoyaltyMembership m = membershipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói: " + id));

        if (req.ten() != null) m.setTen(req.ten());
        if (req.moTa() != null) m.setMoTa(req.moTa());
        if (req.gia() != null) m.setGia(req.gia());
        if (req.thoiHanNgay() != null) m.setThoiHanNgay(req.thoiHanNgay());
        if (req.phanTramGiam() != null) m.setPhanTramGiam(req.phanTramGiam());
        if (req.diemThuong() != null) m.setDiemThuong(req.diemThuong());
        if (req.active() != null) m.setActive(req.active());

        LoyaltyMembership saved = membershipRepository.save(m);
        log("UPDATE", id, "Cập nhật gói: " + m.getTen(), adminEmail);
        return saved;
    }

    /**
     * User mua gói thành viên.
     */
    @Transactional
    public UserMembership purchaseMembership(String membershipId, Integer userId) {
        LoyaltyMembership pkg = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói: " + membershipId));
        if (!pkg.isActive()) throw new IllegalStateException("Gói này hiện không khả dụng.");

        NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + userId));

        LocalDate today = LocalDate.now();
        UserMembership um = UserMembership.builder()
                .nguoiDung(user)
                .goiThanhVien(pkg)
                .ngayBatDau(today)
                .ngayKetThuc(today.plusDays(pkg.getThoiHanNgay()))
                .trangThai("ACTIVE")
                .build();
        UserMembership saved = userMembershipRepository.save(um);

        // Thưởng điểm khi kích hoạt
        if (pkg.getDiemThuong() > 0) {
            loyaltyService.awardBonusPoints(userId, pkg.getDiemThuong());
        }

        log("PURCHASE", membershipId, "User " + user.getEmail() + " mua gói: " + pkg.getTen(), user.getEmail());
        return saved;
    }

    /**
     * Lấy gói ACTIVE còn hạn của user (% giảm cao nhất).
     */
    public Optional<UserMembership> getActiveMembership(Integer userId) {
        return userMembershipRepository.findActiveMembership(userId, LocalDate.now());
    }

    /**
     * % giảm giá từ gói membership đang active của user.
     */
    public BigDecimal getMembershipDiscount(Integer userId) {
        return getActiveMembership(userId)
                .map(um -> um.getGoiThanhVien().getPhanTramGiam())
                .orElse(BigDecimal.ZERO);
    }

    public List<UserMembership> getUserMemberships(Integer userId) {
        return userMembershipRepository.findByNguoiDung_IdOrderByCreatedAtDesc(userId);
    }

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void expireOutdatedMemberships() {
        List<UserMembership> expired = userMembershipRepository.findExpiredMemberships(LocalDate.now());
        for (UserMembership um : expired) {
            um.setTrangThai("EXPIRED");
        }
        if (!expired.isEmpty()) {
            userMembershipRepository.saveAll(expired);
        }
    }

    private void log(String action, String entityId, String desc, String email) {
        auditLogRepository.save(AuditLog.builder()
                .module("LOYALTY_MEMBERSHIP")
                .entityId(entityId)
                .action(action)
                .performedBy(email)
                .role("Admin")
                .description(desc)
                .build());
    }
}
