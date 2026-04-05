package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.*;
import com.example.bookingkhachsan.repository.*;
import com.example.bookingkhachsan.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Quản lý Gói Combo (Phòng + Dịch vụ nội khu) — chỉ Hotel Manager.
 */
@Service
@RequiredArgsConstructor
public class ComboPackageService {

    private final ComboPackageRepository comboPackageRepository;
    private final KhachSanRepository khachSanRepository;
    private final DichVuRepository dichVuRepository;
    private final LoaiPhongRepository loaiPhongRepository;
    private final AuditLogRepository auditLogRepository;
    private final IdGenerator idGenerator;

    public record CreateComboRequest(
            String ten,
            String moTa,
            Integer loaiPhongId,          // nullable
            List<Integer> dichVuIds,       // danh sách dịch vụ
            BigDecimal giaCombo,
            LocalDate ngayBatDau,          // nullable
            LocalDate ngayKetThuc,         // nullable
            Integer soLuongToiDa           // nullable
    ) {}

    public record UpdateComboRequest(
            String ten,
            String moTa,
            Integer loaiPhongId,
            List<Integer> dichVuIds,
            BigDecimal giaCombo,
            LocalDate ngayBatDau,
            LocalDate ngayKetThuc,
            Integer soLuongToiDa,
            String trangThai
    ) {}

    @Transactional
    public ComboPackage create(CreateComboRequest req, Integer managerUserId, String managerEmail) {
        KhachSan ks = resolveManagerHotel(managerUserId);

        validate(req.ten(), req.giaCombo(), req.ngayBatDau(), req.ngayKetThuc());

        LoaiPhong loaiPhong = null;
        if (req.loaiPhongId() != null) {
            loaiPhong = loaiPhongRepository.findById(req.loaiPhongId())
                    .orElseThrow(() -> new IllegalArgumentException("Loại phòng không tồn tại."));
        }

        List<DichVu> dichVus = resolveDichVus(req.dichVuIds(), ks.getId());

        // Tính % giảm so với tổng giá dịch vụ gốc
        BigDecimal tongGiaDV = dichVus.stream()
                .map(DichVu::getGiaTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tiLeGiam = BigDecimal.ZERO;
        if (tongGiaDV.compareTo(BigDecimal.ZERO) > 0 && req.giaCombo().compareTo(tongGiaDV) < 0) {
            tiLeGiam = tongGiaDV.subtract(req.giaCombo())
                    .multiply(new BigDecimal("100"))
                    .divide(tongGiaDV, 2, RoundingMode.HALF_UP);
        }

        ComboPackage combo = ComboPackage.builder()
                .id(idGenerator.generateComboPackageId())
                .ten(req.ten())
                .moTa(req.moTa())
                .khachSan(ks)
                .loaiPhong(loaiPhong)
                .dichVuKemTheo(dichVus)
                .giaCombo(req.giaCombo())
                .tiLeGiam(tiLeGiam)
                .ngayBatDau(req.ngayBatDau())
                .ngayKetThuc(req.ngayKetThuc())
                .soLuongToiDa(req.soLuongToiDa())
                .soLuongDaDung(0)
                .trangThai("ACTIVE")
                .nguoiTao(managerEmail)
                .build();

        ComboPackage saved = comboPackageRepository.save(combo);
        log("CREATE", saved.getId(), "Tạo combo: " + req.ten(), managerEmail);
        return saved;
    }

    @Transactional
    public ComboPackage update(String id, UpdateComboRequest req, Integer managerUserId, String managerEmail) {
        ComboPackage combo = getById(id);
        assertManagerOwns(managerUserId, combo);

        if (req.ten() != null) combo.setTen(req.ten());
        if (req.moTa() != null) combo.setMoTa(req.moTa());
        if (req.giaCombo() != null) {
            if (req.giaCombo().compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Giá combo phải > 0.");
            combo.setGiaCombo(req.giaCombo());
        }
        if (req.loaiPhongId() != null) {
            combo.setLoaiPhong(loaiPhongRepository.findById(req.loaiPhongId())
                    .orElseThrow(() -> new IllegalArgumentException("Loại phòng không tồn tại.")));
        }
        if (req.dichVuIds() != null) {
            combo.setDichVuKemTheo(resolveDichVus(req.dichVuIds(), combo.getKhachSan().getId()));
        }
        if (req.ngayBatDau() != null) combo.setNgayBatDau(req.ngayBatDau());
        if (req.ngayKetThuc() != null) combo.setNgayKetThuc(req.ngayKetThuc());
        if (req.soLuongToiDa() != null) combo.setSoLuongToiDa(req.soLuongToiDa());
        if (req.trangThai() != null) combo.setTrangThai(req.trangThai());

        ComboPackage saved = comboPackageRepository.save(combo);
        log("UPDATE", id, "Cập nhật combo: " + combo.getTen(), managerEmail);
        return saved;
    }

    @Transactional
    public void delete(String id, Integer managerUserId, String managerEmail) {
        ComboPackage combo = getById(id);
        assertManagerOwns(managerUserId, combo);
        comboPackageRepository.delete(combo);
        log("DELETE", id, "Xóa combo: " + combo.getTen(), managerEmail);
    }

    public List<ComboPackage> listForManager(Integer managerUserId) {
        KhachSan ks = resolveManagerHotel(managerUserId);
        return comboPackageRepository.findByKhachSan_IdOrderByCreatedAtDesc(ks.getId());
    }

    public List<ComboPackage> listActiveForHotel(Integer hotelId) {
        return comboPackageRepository.findActiveByHotel(hotelId, LocalDate.now());
    }

    public ComboPackage getById(String id) {
        return comboPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy combo: " + id));
    }

    private KhachSan resolveManagerHotel(Integer managerUserId) {
        return khachSanRepository.findByNguoiQuanLy_Id(managerUserId)
                .orElseThrow(() -> new IllegalStateException("Tài khoản không được gán quản lý khách sạn."));
    }

    private void assertManagerOwns(Integer managerUserId, ComboPackage combo) {
        KhachSan ks = resolveManagerHotel(managerUserId);
        if (!combo.getKhachSan().getId().equals(ks.getId())) {
            throw new IllegalArgumentException("Không có quyền với combo này.");
        }
    }

    private List<DichVu> resolveDichVus(List<Integer> ids, Integer hotelId) {
        if (ids == null || ids.isEmpty()) return new ArrayList<>();
        List<DichVu> result = new ArrayList<>();
        for (Integer dvId : ids) {
            DichVu dv = dichVuRepository.findById(dvId)
                    .orElseThrow(() -> new IllegalArgumentException("Dịch vụ không tồn tại: " + dvId));
            if (!dv.getKhachSan().getId().equals(hotelId)) {
                throw new IllegalArgumentException("Dịch vụ " + dv.getTen() + " không thuộc khách sạn này.");
            }
            result.add(dv);
        }
        return result;
    }

    private void validate(String ten, BigDecimal giaCombo, LocalDate batDau, LocalDate ketThuc) {
        if (ten == null || ten.isBlank()) throw new IllegalArgumentException("Tên combo không được để trống.");
        if (giaCombo == null || giaCombo.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Giá combo phải > 0.");
        if (batDau != null && ketThuc != null && !batDau.isBefore(ketThuc)) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu.");
        }
    }

    private void log(String action, String entityId, String desc, String email) {
        auditLogRepository.save(AuditLog.builder()
                .module("COMBO_PACKAGE")
                .entityId(entityId)
                .action(action)
                .performedBy(email)
                .role("HotelManager")
                .description(desc)
                .build());
    }
}
