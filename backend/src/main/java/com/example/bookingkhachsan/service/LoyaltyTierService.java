package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.AuditLog;
import com.example.bookingkhachsan.entity.LoyaltyTier;
import com.example.bookingkhachsan.repository.AuditLogRepository;
import com.example.bookingkhachsan.repository.LoyaltyTierRepository;
import com.example.bookingkhachsan.repository.UserLoyaltyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoyaltyTierService {

    private final LoyaltyTierRepository tierRepository;
    private final UserLoyaltyRepository userLoyaltyRepository;
    private final AuditLogRepository auditLogRepository;

    public record CreateTierRequest(
            String tenHang,
            Integer diemToiThieu,
            BigDecimal phanTramUuDai,
            String mauSac,
            Integer thuTu
    ) {}

    public record UpdateTierRequest(
            String tenHang,
            Integer diemToiThieu,
            BigDecimal phanTramUuDai,
            String mauSac,
            Integer thuTu,
            Boolean active
    ) {}

    public List<LoyaltyTier> getAll() {
        return tierRepository.findAll();
    }

    public List<LoyaltyTier> getActiveAll() {
        return tierRepository.findByActiveTrueOrderByThuTuAsc();
    }

    @Transactional
    public LoyaltyTier create(CreateTierRequest req, String adminEmail) {
        if (req.tenHang() == null || req.tenHang().isBlank()) {
            throw new IllegalArgumentException("Tên hạng không được để trống.");
        }
        if (req.diemToiThieu() == null || req.diemToiThieu() < 0) {
            throw new IllegalArgumentException("Điểm tối thiểu phải >= 0.");
        }
        if (req.phanTramUuDai() != null && req.phanTramUuDai().compareTo(new BigDecimal("80")) > 0) {
            throw new IllegalArgumentException("% ưu đãi tối đa 80%.");
        }

        LoyaltyTier tier = LoyaltyTier.builder()
                .tenHang(req.tenHang())
                .diemToiThieu(req.diemToiThieu())
                .phanTramUuDai(req.phanTramUuDai() != null ? req.phanTramUuDai() : BigDecimal.ZERO)
                .mauSac(req.mauSac())
                .thuTu(req.thuTu() != null ? req.thuTu() : 0)
                .active(true)
                .build();

        LoyaltyTier saved = tierRepository.save(tier);
        log("CREATE", String.valueOf(saved.getId()), "Tạo hạng thành viên: " + req.tenHang(), adminEmail);
        return saved;
    }

    @Transactional
    public LoyaltyTier update(Integer id, UpdateTierRequest req, String adminEmail) {
        LoyaltyTier tier = tierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng: " + id));

        if (req.tenHang() != null) tier.setTenHang(req.tenHang());
        if (req.diemToiThieu() != null) tier.setDiemToiThieu(req.diemToiThieu());
        if (req.phanTramUuDai() != null) {
            if (req.phanTramUuDai().compareTo(new BigDecimal("80")) > 0) {
                throw new IllegalArgumentException("% ưu đãi tối đa 80%.");
            }
            tier.setPhanTramUuDai(req.phanTramUuDai());
        }
        if (req.mauSac() != null) tier.setMauSac(req.mauSac());
        if (req.thuTu() != null) tier.setThuTu(req.thuTu());
        if (req.active() != null) tier.setActive(req.active());

        LoyaltyTier saved = tierRepository.save(tier);
        log("UPDATE", String.valueOf(id), "Cập nhật hạng: " + tier.getTenHang(), adminEmail);
        return saved;
    }

    @Transactional
    public void delete(Integer id, String adminEmail) {
        LoyaltyTier tier = tierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng: " + id));
        if (userLoyaltyRepository.findAll().stream()
                .anyMatch(ul -> ul.getHangHienTai() != null && ul.getHangHienTai().getId().equals(id))) {
            throw new IllegalStateException("Không thể xóa hạng đang được user sử dụng. Hãy vô hiệu hóa thay vào đó.");
        }
        tierRepository.delete(tier);
        log("DELETE", String.valueOf(id), "Xóa hạng: " + tier.getTenHang(), adminEmail);
    }

    private void log(String action, String entityId, String desc, String email) {
        auditLogRepository.save(AuditLog.builder()
                .module("LOYALTY_TIER")
                .entityId(entityId)
                .action(action)
                .performedBy(email)
                .role("Admin")
                .description(desc)
                .build());
    }
}
