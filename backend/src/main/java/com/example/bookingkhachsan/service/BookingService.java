package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.BookingDto;
import com.example.bookingkhachsan.entity.*;
import com.example.bookingkhachsan.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final PhieuDatPhongRepository bookingRepo;
    private final PhongRepository phongRepo;
    private final NguoiDungRepository userRepo;
    private final DichVuRepository dichVuRepo;
    private final ChiTietSuDungDVRepository ctsdRepo;
    private final PhuThuRepository phuThuRepo;
    private final PhongKhaDungRepository phongKhaDungRepo;
    private final LichSuThanhToanRepository lichSuRepo;
    private final DanhGiaRepository danhGiaRepo;
    private final JdbcTemplate jdbcTemplate;

    // Hoa hong mac dinh 5% neu la mo hinh san
    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05");

    // =====================================================
    // KIEM TRA PHONG TRONG (AVAILABILITY)
    // =====================================================

    /**
     * Lay danh sach phong con trong cua khach san trong khoang ngay cho.
     * Su dung bang phong_kha_dung de kiem tra, khong dua vao trung booking.
     */
    public List<BookingDto.AvailableRoomResponse> getAvailableRooms(
            Integer khachSanId, LocalDate checkIn, LocalDate checkOut, Integer loaiPhongId) {

        validateDateRange(checkIn, checkOut);
        long soNgay = ChronoUnit.DAYS.between(checkIn, checkOut);

        // Lay danh sach phong_id con trong
        List<Integer> availablePhongIds = phongKhaDungRepo.findAvailablePhongIds(
                khachSanId, checkIn, checkOut);

        // Lay phong theo id, loc them theo loai phong neu co
        List<Phong> phongs = phongRepo.findAllById(availablePhongIds);
        if (loaiPhongId != null) {
            phongs = phongs.stream()
                    .filter(p -> p.getLoaiPhong().getId().equals(loaiPhongId))
                    .collect(Collectors.toList());
        }

        return phongs.stream().map(phong -> {
            LoaiPhong lp = phong.getLoaiPhong();
            BigDecimal giaTien = tinhGiaDong(phong.getGiaTien(), lp, checkIn, checkOut);
            BigDecimal tongTien = giaTien.multiply(BigDecimal.valueOf(soNgay));
            // Doc ti le coc tu khach san
            BigDecimal tiLeCoc = BigDecimal.ZERO;
            if (phong.getKhachSan() != null && phong.getKhachSan().getTiLeCoc() != null) {
                tiLeCoc = phong.getKhachSan().getTiLeCoc();
            }
            BigDecimal tienCocDuTinh = tongTien.multiply(tiLeCoc)
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            return BookingDto.AvailableRoomResponse.builder()
                    .phongId(phong.getId())
                    .tenPhong(phong.getTen())
                    .maPhong(phong.getMaPhong())
                    .tang(phong.getTang())
                    .soPhong(phong.getSoPhong())
                    .giaTien(phong.getGiaTien())
                    .giaTheoNgay(giaTien)
                    .loaiPhongId(lp.getId())
                    .tenLoaiPhong(lp.getTen())
                    .soKhach(lp.getSoKhach())
                    .dienTich(lp.getDienTich())
                    .soGiuong(lp.getSoGiuong())
                    .loaiGiuong(lp.getLoaiGiuong())
                    .tienIch(lp.getTienIch())
                    .hinhAnh(lp.getHinhAnh())
                    .choPhepHuy(lp.getChoPhepHuy())
                    .mienPhiHuyTruocGio(lp.getMienPhiHuyTruocGio())
                    .phiHuyPct(lp.getPhiHuyPct())
                    .soNgay((int) soNgay)
                    .tongTienDuTinh(tongTien)
                    .tiLeCocKhachSan(tiLeCoc)
                    .tienCocDuTinh(tienCocDuTinh)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Tinh gia dong theo ngay: cuoi tuan tang %, ngay le tang %.
     * Lay gia cao nhat ap dung trong khoang ngay dat.
     */
    private BigDecimal tinhGiaDong(BigDecimal giaMacDinh, LoaiPhong lp,
                                    LocalDate checkIn, LocalDate checkOut) {
        if (giaMacDinh == null) return BigDecimal.ZERO;
        BigDecimal gia = giaMacDinh;
        // Kiem tra co ngay cuoi tuan trong khoang
        boolean hasCuoiTuan = checkIn.datesUntil(checkOut)
                .anyMatch(d -> d.getDayOfWeek().getValue() >= 6);
        if (hasCuoiTuan && lp.getGiaCuoiTuanPct() != null
                && lp.getGiaCuoiTuanPct().compareTo(BigDecimal.ZERO) > 0) {
            gia = gia.multiply(BigDecimal.ONE.add(
                    lp.getGiaCuoiTuanPct().divide(BigDecimal.valueOf(100))));
        }
        return gia.setScale(0, RoundingMode.HALF_UP);
    }

    // =====================================================
    // STATE: None → PENDING (Tao dat phong)
    // =====================================================

    /**
     * Tao dat phong moi.
     * - Kiem tra trung ngay bang phong_kha_dung
     * - Giu phong tam (TamGiu) trong 30 phut
     * - Neu InstantBooking: tu dong confirm sau khi tao
     */
    @Transactional
    public BookingDto.BookingResponse createBooking(BookingDto.CreateBookingRequest request) {
        validateDateRange(request.getNgayDen(), request.getNgayDi());

        Phong phong = phongRepo.findById(request.getPhongId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay phong!"));

        // Kiem tra overbooking qua phong_kha_dung
        long blocked = phongKhaDungRepo.countUnavailableDays(
                request.getPhongId(), request.getNgayDen(), request.getNgayDi(), null);
        if (blocked > 0) {
            throw new RuntimeException("Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn ngày khác!");
        }

        // Kiem tra khach hang khong duoc dat cung phong trong khoang ngay dang co booking active
        long userOverlap = bookingRepo.countActiveUserBookingsForRoom(
                request.getPhongId(), request.getNguoiDungId(),
                request.getNgayDen(), request.getNgayDi());
        if (userOverlap > 0) {
            throw new RuntimeException("Bạn đã có đặt phòng cho phòng này trong khoảng thời gian này. Vui lòng hoàn thành hoặc hủy đặt phòng cũ trước khi đặt lại!");
        }

        NguoiDung user = userRepo.findById(request.getNguoiDungId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung!"));

        long soNgay = ChronoUnit.DAYS.between(request.getNgayDen(), request.getNgayDi());
        if (soNgay < 1) soNgay = 1;

        LoaiPhong lp = phong.getLoaiPhong();
        BigDecimal giaDong = tinhGiaDong(phong.getGiaTien(), lp,
                request.getNgayDen(), request.getNgayDi());
        BigDecimal thanhTien = giaDong.multiply(BigDecimal.valueOf(soNgay));

        // Tao phieu dat phong
        PhieuDatPhong booking = new PhieuDatPhong();
        // Sinh ma dat phong trong Java de tranh loi "null identifier" tren SQL Server + trigger
        booking.setMaDatPhong(sinhMaDatPhong());
        booking.setNgayDen(request.getNgayDen());
        booking.setNgayDi(request.getNgayDi());
        booking.setPhong(phong);
        booking.setNguoiDung(user);
        booking.setGiaPhongGoc(giaDong);
        booking.setThanhTien(thanhTien);
        booking.setTrangThai("Pending");
        booking.setTrangThaiThanhToan("ChuaThanhToan");
        booking.setLoaiDatPhong(request.getLoaiDatPhong());
        booking.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        booking.setSoNguoiLon(request.getSoNguoiLon() != null ? request.getSoNguoiLon() : 1);
        booking.setSoTreEm(request.getSoTreEm() != null ? request.getSoTreEm() : 0);
        booking.setGhiChuKhach(request.getGhiChuKhach());
        booking.setPendingExpiresAt(LocalDateTime.now().plusMinutes(30));


        // Tinh tien coc dua tren ti le coc cua khach san
        BigDecimal tiLeCoc = BigDecimal.ZERO;
        if (phong.getKhachSan() != null && phong.getKhachSan().getTiLeCoc() != null) {
            tiLeCoc = phong.getKhachSan().getTiLeCoc();
        }
        BigDecimal tienCoc = thanhTien.multiply(tiLeCoc)
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        booking.setTienCoc(tienCoc);
        booking.setTrangThaiCoc("ChuaCoc");

        // ================================================================
        // BYPASS Hibernate save() de tranh loi "null identifier" tren
        // SQL Server khi bang co INSTEAD OF INSERT trigger.
        // Dung raw JDBC INSERT, sau do SELECT id theo ma_dat_phong.
        // ================================================================
        String maDatPhong = booking.getMaDatPhong();
        jdbcTemplate.update(
                "INSERT INTO phieu_dat_phong (" +
                "  ma_dat_phong, ngay_den, ngay_di, nguoi_dung_id, phong_id," +
                "  gia_phong_goc, thanh_tien, trang_thai, trang_thai_thanh_toan," +
                "  loai_dat_phong, phuong_thuc_thanh_toan, so_nguoi_lon, so_tre_em," +
                "  ghi_chu_khach, pending_expires_at, tien_coc, trang_thai_coc" +
                ") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                maDatPhong,
                booking.getNgayDen(),
                booking.getNgayDi(),
                booking.getNguoiDung().getId(),
                booking.getPhong().getId(),
                booking.getGiaPhongGoc(),
                booking.getThanhTien(),
                booking.getTrangThai(),
                booking.getTrangThaiThanhToan(),
                booking.getLoaiDatPhong(),
                booking.getPhuongThucThanhToan(),
                booking.getSoNguoiLon(),
                booking.getSoTreEm(),
                booking.getGhiChuKhach(),
                booking.getPendingExpiresAt(),
                booking.getTienCoc(),
                booking.getTrangThaiCoc()
        );

        // Lay ID vua duoc INSERT. Dung @@IDENTITY de lay ID bat ke trigger co INSTEAD OF hay khong.
        // @@IDENTITY tra ve identity cuoi cung duoc sinh trong session hien tai (bao gom ca trigger).
        Integer newId = jdbcTemplate.queryForObject(
                "SELECT CAST(@@IDENTITY AS INT)",
                Integer.class);
        if (newId == null) {
            throw new RuntimeException("Loi he thong: Khong the lay ID phieu dat phong!");
        }

        // Load entity vao JPA context bang findById
        PhieuDatPhong savedBooking = bookingRepo.findById(newId)
                .orElseThrow(() -> new RuntimeException("Loi he thong: Khong tim thay phieu sau khi tao!"));

        // Giu phong tam thoi (TamGiu) cho tat ca ngay trong khoang dat
        initPhongKhaDung(phong, savedBooking, request.getNgayDen(), request.getNgayDi(), giaDong);

        // Neu dat ngay (InstantBooking): tu dong confirm
        if ("InstantBooking".equals(request.getLoaiDatPhong())) {
            savedBooking = doConfirm(savedBooking);
        }

        return toBookingResponse(savedBooking);
    }

    /** Tao bản ghi phong_kha_dung theo tung ngay trong khoang dat */
    private void initPhongKhaDung(Phong phong, PhieuDatPhong booking,
                                   LocalDate from, LocalDate to, BigDecimal gia) {
        from.datesUntil(to).forEach(ngay -> {
            PhongKhaDung pkd = new PhongKhaDung();
            pkd.setPhong(phong);
            pkd.setNgay(ngay);
            pkd.setTrangThai("TamGiu");
            pkd.setGiaTheongay(gia);
            pkd.setPhieuDatPhong(booking);
            try {
                phongKhaDungRepo.save(pkd);
            } catch (Exception e) {
                // Unique constraint violation: ngay da bi dat boi booking khac
                throw new RuntimeException("Phong da bi dat vao ngay " + ngay + "!");
            }
        });
    }

    // =====================================================
    // STATE: PENDING → CONFIRMED
    // =====================================================

    @Transactional
    public BookingDto.BookingResponse confirmBooking(Integer bookingId) {
        PhieuDatPhong booking = findBookingById(bookingId);
        assertStatus(booking, "Pending", "Chi co the xac nhan don o trang thai Pending!");

        // Kiem tra con trong han khong
        if (booking.getPendingExpiresAt() != null &&
                booking.getPendingExpiresAt().isBefore(LocalDateTime.now())) {
            expireBooking(bookingId);
            throw new RuntimeException("Phieu dat phong da het han! Vui long dat lai.");
        }

        booking = doConfirm(booking);
        return toBookingResponse(booking);
    }

    private PhieuDatPhong doConfirm(PhieuDatPhong booking) {
        booking.setTrangThai("Confirmed");
        booking = bookingRepo.save(booking);
        // Trigger trg_OnBookingStatusChange se tu chuyen TamGiu → DaDat
        log.info("Booking {} confirmed.", booking.getMaDatPhong());
        return booking;
    }

    // =====================================================
    // STATE: PENDING → EXPIRED (Scheduled job)
    // =====================================================

    /** Chay moi 5 phut de quet va xu ly cac Pending het han */
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void processExpiredBookings() {
        List<PhieuDatPhong> expiredList = bookingRepo.findAll().stream()
                .filter(b -> "Pending".equals(b.getTrangThai())
                        && b.getPendingExpiresAt() != null
                        && b.getPendingExpiresAt().isBefore(LocalDateTime.now()))
                .collect(Collectors.toList());

        for (PhieuDatPhong booking : expiredList) {
            expireBooking(booking.getId());
        }
        if (!expiredList.isEmpty()) {
            log.info("Auto-expired {} pending bookings.", expiredList.size());
        }
    }

    @Transactional
    public void expireBooking(Integer bookingId) {
        PhieuDatPhong booking = findBookingById(bookingId);
        booking.setTrangThai("Expired");
        booking.setTrangThaiThanhToan("Huy");
        bookingRepo.save(booking);
        // Trigger se tu giai phong phong_kha_dung → Trong
        log.info("Booking {} expired.", booking.getMaDatPhong());
    }

    // =====================================================
    // STATE: CONFIRMED → REJECTED (Manager tu choi)
    // =====================================================

    @Transactional
    public BookingDto.BookingResponse rejectBooking(Integer bookingId, String ghiChu) {
        PhieuDatPhong booking = findBookingById(bookingId);
        assertStatus(booking, "Pending", "Chi co the tu choi don o trang thai Pending!");
        booking.setTrangThai("Rejected");
        booking.setGhiChuHuy(ghiChu);
        bookingRepo.save(booking);
        return toBookingResponse(booking);
    }

    // =====================================================
    // STATE: CONFIRMED → CANCELLED (Khach huy)
    // =====================================================

    /**
     * Huy dat phong theo chinh sach:
     * - Huy truoc N gio: hoan 100%
     * - Huy muon: thu phi theo % da cau hinh
     */
    @Transactional
    public BookingDto.BookingResponse cancelBooking(Integer bookingId, String ghiChuHuy) {
        PhieuDatPhong booking = findBookingById(bookingId);
        if (!List.of("Pending", "Confirmed").contains(booking.getTrangThai())) {
            throw new RuntimeException("Chi co the huy don o trang thai Pending hoac Confirmed!");
        }

        LoaiPhong lp = booking.getPhong().getLoaiPhong();
        // Tinh so gio con lai truoc check-in
        long gioConLai = ChronoUnit.HOURS.between(LocalDateTime.now(),
                booking.getNgayDen().atTime(14, 0)); // check-in mac dinh 14:00

        BigDecimal giaPhong = booking.getGiaPhongGoc();
        BigDecimal soTienHoan;
        BigDecimal phiHuy = BigDecimal.ZERO;

        int gioMienPhi = lp.getMienPhiHuyTruocGio() != null ? lp.getMienPhiHuyTruocGio() : 48;
        BigDecimal pctPhiHuy = lp.getPhiHuyPct() != null ? lp.getPhiHuyPct() : BigDecimal.ZERO;

        if (gioConLai >= gioMienPhi || pctPhiHuy.compareTo(BigDecimal.ZERO) == 0) {
            phiHuy = BigDecimal.ZERO;
            soTienHoan = giaPhong;  // Hoan 100%
        } else {
            phiHuy = giaPhong.multiply(pctPhiHuy).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            soTienHoan = giaPhong.subtract(phiHuy);
            if (soTienHoan.compareTo(BigDecimal.ZERO) < 0) soTienHoan = BigDecimal.ZERO;
        }

        booking.setTrangThai("Cancelled");
        booking.setTrangThaiThanhToan(soTienHoan.compareTo(BigDecimal.ZERO) > 0 ? "DaHoanTien" : "Huy");
        booking.setGhiChuHuy(ghiChuHuy);
        bookingRepo.save(booking);

        // Ghi lich su hoan tien
        String executor = getCurrentUserEmail();
        if (soTienHoan.compareTo(BigDecimal.ZERO) > 0) {
            saveLichSu(booking, soTienHoan, "HoanTien", "HeThong", "ThanhCong",
                    "Hoan tien huy phong. Phi huy: " + phiHuy.toPlainString(), executor);
        }
        if (phiHuy.compareTo(BigDecimal.ZERO) > 0) {
            saveLichSu(booking, phiHuy, "ThuPhiHuy", "HeThong", "ThanhCong",
                    "Phi huy " + pctPhiHuy + "% do huy muon", executor);
        }

        log.info("Booking {} cancelled. Hoan: {}, Phi huy: {}", booking.getMaDatPhong(), soTienHoan, phiHuy);
        return toBookingResponse(booking);
    }

    // =====================================================
    // STATE: CONFIRMED → CHECKED-IN
    // =====================================================

    @Transactional
    public BookingDto.BookingResponse checkin(Integer bookingId) {
        PhieuDatPhong booking = findBookingById(bookingId);
        assertStatus(booking, "Confirmed", "Chi co the check-in don o trang thai Confirmed!");
        booking.setTrangThai("CheckedIn");
        bookingRepo.save(booking);
        log.info("Booking {} checked in.", booking.getMaDatPhong());
        return toBookingResponse(booking);
    }

    // =====================================================
    // STATE: CONFIRMED → NO-SHOW
    // =====================================================

    @Transactional
    public BookingDto.BookingResponse markNoShow(Integer bookingId) {
        PhieuDatPhong booking = findBookingById(bookingId);
        assertStatus(booking, "Confirmed", "Chi co the danh dau No-show tu trang thai Confirmed!");

        LoaiPhong lp = booking.getPhong().getLoaiPhong();
        BigDecimal pctPhiHuy = lp.getPhiHuyPct() != null ? lp.getPhiHuyPct() : new BigDecimal("100");
        BigDecimal phiNoShow = booking.getGiaPhongGoc()
                .multiply(pctPhiHuy).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);

        booking.setTrangThai("NoShow");

        String executor = getCurrentUserEmail();

        // Kiem tra xem khach hang da thanh toan 100% qua ChuyenKhoan hay chua
        if ("DaThanhToan".equals(booking.getTrangThaiThanhToan()) && 
            "ChuyenKhoan".equals(booking.getPhuongThucThanhToan())) {
            
            // Neu da thanh toan 100%, phi No-show se duoc tru vao tienCoc da cọc ban dau
            BigDecimal tienCoc = booking.getTienCoc() != null ? booking.getTienCoc() : BigDecimal.ZERO;
            
            // Hoan lai phan tien chenh lech (100% - Tien coc)
            BigDecimal soTienHoan = booking.getThanhTien().subtract(tienCoc);
            if (soTienHoan.compareTo(BigDecimal.ZERO) < 0) soTienHoan = BigDecimal.ZERO;
            
            booking.setTrangThaiThanhToan(soTienHoan.compareTo(BigDecimal.ZERO) > 0 ? "DaHoanTien" : "ThuPhiNoShow");
            
            if (soTienHoan.compareTo(BigDecimal.ZERO) > 0) {
                saveLichSu(booking, soTienHoan, "HoanTien", "HeThong", "ThanhCong",
                        "Hoan tien No-show (phi vắng mặt: " + tienCoc.toPlainString() + ")", executor);
            }
            if (tienCoc.compareTo(BigDecimal.ZERO) > 0) {
                saveLichSu(booking, tienCoc, "ThuPhiNoShow", "HeThong", "ThanhCong",
                        "Thu phi No-show tuong duong tien coc", executor);
            }
        } else {
            // Truong hop khong phai ChuyenKhoan 100%
            booking.setTrangThaiThanhToan("ThuPhiNoShow");
            saveLichSu(booking, phiNoShow, "ThuPhiNoShow", "HeThong", "ThanhCong",
                    "Phi No-show " + pctPhiHuy + "% tren gia phong", executor);
        }

        bookingRepo.save(booking);

        return toBookingResponse(booking);
    }

    // =====================================================
    // STATE: CHECKED-IN → CHECKED-OUT
    // =====================================================

    @Transactional
    public BookingDto.BookingResponse checkout(Integer bookingId, String phuongThuc) {
        PhieuDatPhong booking = findBookingById(bookingId);
        assertStatus(booking, "CheckedIn", "Chi co the checkout tu trang thai CheckedIn!");

        // Tinh toan hoa don cuoi (phong goc + dich vu + phu thu)
        BigDecimal tienDV = ctsdRepo.findAll().stream()
                .filter(ct -> ct.getPhieuDatPhong().getId().equals(bookingId))
                .map(ct -> {
                    BigDecimal donGia = ct.getDonGiaLucDat() != null ? ct.getDonGiaLucDat() : BigDecimal.ZERO;
                    int sl = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
                    return donGia.multiply(BigDecimal.valueOf(sl));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tienPT = phuThuRepo.findAll().stream()
                .filter(pt -> pt.getPhieuDatPhong().getId().equals(bookingId))
                .map(pt -> pt.getSoTien() != null ? pt.getSoTien() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal giaPhongGoc = booking.getGiaPhongGoc() != null ? booking.getGiaPhongGoc() : (booking.getThanhTien() != null ? booking.getThanhTien() : BigDecimal.ZERO);
        BigDecimal tongCuoi = giaPhongGoc.add(tienDV).add(tienPT);

        booking.setThanhTien(tongCuoi);
        booking.setTrangThai("CheckedOut");
        booking.setTrangThaiThanhToan("DaThanhToan");

        // Tinh hoa hong (5%)
        BigDecimal hoaHong = tongCuoi.multiply(COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP);
        booking.setTienHoaHong(hoaHong);
        booking.setTiLeHoaHong(COMMISSION_RATE.multiply(BigDecimal.valueOf(100)));

        bookingRepo.save(booking);

        // Ghi lich su
        saveLichSu(booking, tongCuoi, "ThanhToan",
                phuongThuc != null ? phuongThuc : "TienMat",
                "ThanhCong",
                "Checkout: Phong " + booking.getGiaPhongGoc() +
                " + DV " + tienDV + " + PhuThu " + tienPT,
                getCurrentUserEmail());

        log.info("Booking {} checked out. Total: {}", booking.getMaDatPhong(), tongCuoi);
        return toBookingResponse(booking);
    }

    // =====================================================
    // STATE: CHECKED-OUT → COMPLETED
    // =====================================================

    @Transactional
    public BookingDto.BookingResponse completeBooking(Integer bookingId) {
        PhieuDatPhong booking = findBookingById(bookingId);
        assertStatus(booking, "CheckedOut", "Chi co the hoan tat tu trang thai CheckedOut!");
        booking.setTrangThai("Completed");
        bookingRepo.save(booking);
        log.info("Booking {} completed.", booking.getMaDatPhong());
        return toBookingResponse(booking);
    }

    // =====================================================
    // NGHIEP VU KHAC
    // =====================================================

    /** Ghi nhan thanh toan tho cong (TienMat, CK, ...) */
    @Transactional
    public void recordPayment(BookingDto.RecordPaymentRequest request) {
        PhieuDatPhong booking = findBookingById(request.getPhieuDatPhongId());
        saveLichSu(booking, request.getSoTien(), request.getLoaiGiaoDich(),
                request.getPhuongThuc(), "ThanhCong",
                request.getGhiChu(), getCurrentUserEmail());
        booking.setTrangThaiThanhToan("DaThanhToan");
        bookingRepo.save(booking);
    }

    public void addService(BookingDto.AddServiceRequest request) {
        PhieuDatPhong booking = findBookingById(request.getPhieuDatPhongId());
        assertStatus(booking, "CheckedIn", "Chi co the them dich vu khi khach dang o!");
        DichVu dv = dichVuRepo.findById(request.getDichVuId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay dich vu!"));
        ChiTietSuDungDV ct = new ChiTietSuDungDV();
        ct.setPhieuDatPhong(booking);
        ct.setDichVu(dv);
        ct.setSoLuong(request.getSoLuong());
        ct.setDonGiaLucDat(dv.getGiaTien());
        ctsdRepo.save(ct);
    }

    public void addSurcharge(BookingDto.AddSurchargeRequest request) {
        PhieuDatPhong booking = findBookingById(request.getPhieuDatPhongId());
        PhuThu pt = new PhuThu();
        pt.setPhieuDatPhong(booking);
        pt.setLoaiPhuThu(request.getLoaiPhuThu());
        pt.setSoTien(request.getSoTien());
        phuThuRepo.save(pt);
    }

    @Transactional(readOnly = true)
    public BookingDto.BookingResponse getBookingByIdResponse(Integer id) {
        return toBookingResponse(findBookingById(id));
    }

    @Transactional(readOnly = true)
    public BookingDto.BookingResponse getBookingByCodeResponse(String code) {
        PhieuDatPhong booking = bookingRepo.findByMaDatPhong(code)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu dat phong: " + code));
        return toBookingResponse(booking);
    }

    public PhieuDatPhong getBookingById(Integer id) {
        return findBookingById(id);
    }

    public PhieuDatPhong getBookingByCode(String code) {
        return bookingRepo.findByMaDatPhong(code)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu dat phong: " + code));
    }

    @Transactional(readOnly = true)
    public List<BookingDto.BookingResponse> getBookingsByUser(Integer userId) {
        return bookingRepo.findByNguoiDungId(userId)
                .stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDto.BookingResponse> getBookingsByHotel(Integer hotelId) {
        return bookingRepo.findByPhong_KhachSan_IdOrderByNgayDatDesc(hotelId)
                .stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    public List<BookingDto.PaymentHistoryResponse> getPaymentHistory(Integer bookingId) {
        return lichSuRepo.findByPhieuDatPhongIdOrderByNgayGiaoDichDesc(bookingId)
                .stream().map(ls -> BookingDto.PaymentHistoryResponse.builder()
                        .id(ls.getId())
                        .soTien(ls.getSoTien())
                        .loaiGiaoDich(ls.getLoaiGiaoDich())
                        .phuongThuc(ls.getPhuongThuc())
                        .trangThai(ls.getTrangThai())
                        .maGiaoDich(ls.getMaGiaoDich())
                        .ghiChu(ls.getGhiChu())
                        .nguoiThucHien(ls.getNguoiThucHien())
                        .ngayGiaoDich(ls.getNgayGiaoDich())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Tinh toan va tra ve hoa don chi tiet cho mot booking.
     * Co the goi bat ky luc nao sau khi tao booking.
     */
    @Transactional(readOnly = true)
    public BookingDto.InvoiceResponse getInvoice(Integer bookingId) {
        PhieuDatPhong b = findBookingById(bookingId);
        long soNgay = b.getNgayDen() != null && b.getNgayDi() != null
                ? ChronoUnit.DAYS.between(b.getNgayDen(), b.getNgayDi()) : 1;
        if (soNgay < 1) soNgay = 1;

        BigDecimal giaPhongMot = b.getGiaPhongGoc() != null ? b.getGiaPhongGoc() : BigDecimal.ZERO;
        BigDecimal tienPhong = giaPhongMot.multiply(BigDecimal.valueOf(soNgay));

        // Lay danh sach dich vu su dung
        List<ChiTietSuDungDV> ctList = ctsdRepo.findAll().stream()
                .filter(ct -> ct.getPhieuDatPhong().getId().equals(bookingId))
                .collect(Collectors.toList());

        List<BookingDto.InvoiceServiceItem> dichVus = ctList.stream().map(ct -> {
            BigDecimal donGia = ct.getDonGiaLucDat() != null ? ct.getDonGiaLucDat() : BigDecimal.ZERO;
            int sl = ct.getSoLuong() != null ? ct.getSoLuong() : 1;
            return BookingDto.InvoiceServiceItem.builder()
                    .tenDichVu(ct.getDichVu() != null ? ct.getDichVu().getTen() : "Dịch vụ")
                    .soLuong(sl)
                    .donGia(donGia)
                    .thanhTien(donGia.multiply(BigDecimal.valueOf(sl)))
                    .build();
        }).collect(Collectors.toList());

        BigDecimal tienDV = dichVus.stream()
                .map(BookingDto.InvoiceServiceItem::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Lay danh sach phu thu
        List<PhuThu> ptList = phuThuRepo.findAll().stream()
                .filter(pt -> pt.getPhieuDatPhong().getId().equals(bookingId))
                .collect(Collectors.toList());

        List<BookingDto.InvoiceSurchargeItem> phuThus = ptList.stream().map(pt ->
                BookingDto.InvoiceSurchargeItem.builder()
                        .loaiPhuThu(pt.getLoaiPhuThu())
                        .soTien(pt.getSoTien() != null ? pt.getSoTien() : BigDecimal.ZERO)
                        .build()
        ).collect(Collectors.toList());

        BigDecimal tienPT = phuThus.stream()
                .map(BookingDto.InvoiceSurchargeItem::getSoTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tongCong = tienPhong.add(tienDV).add(tienPT);

        NguoiDung kh = b.getNguoiDung();
        Phong phong = b.getPhong();

        return BookingDto.InvoiceResponse.builder()
                .bookingId(b.getId())
                .maDatPhong(b.getMaDatPhong())
                .trangThai(b.getTrangThai())
                .trangThaiThanhToan(b.getTrangThaiThanhToan())
                .hoTenKhach(kh != null ? kh.getHoTen() : null)
                .emailKhach(kh != null ? kh.getEmail() : null)
                .sdtKhach(kh != null ? kh.getSdt() : null)
                .tenPhong(phong != null ? phong.getTen() : null)
                .loaiPhong(phong != null && phong.getLoaiPhong() != null ? phong.getLoaiPhong().getTen() : null)
                .ngayDen(b.getNgayDen())
                .ngayDi(b.getNgayDi())
                .soNgay((int) soNgay)
                .giaPhongMot(giaPhongMot)
                .tienPhong(tienPhong)
                .dichVus(dichVus)
                .phuThus(phuThus)
                .tienDichVu(tienDV)
                .tienPhuThu(tienPT)
                .tongCong(tongCong)
                .tienCoc(b.getTienCoc())
                .trangThaiCoc(b.getTrangThaiCoc())
                .phuongThucThanhToan(b.getPhuongThucThanhToan())
                .build();
    }

    // =====================================================
    // PRIVATE HELPERS
    // =====================================================

    private void validateDateRange(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null)
            throw new RuntimeException("Ngay nhan/tra phong khong duoc de trong!");
        if (!checkOut.isAfter(checkIn))
            throw new RuntimeException("Ngay tra phong phai sau ngay nhan phong!");
    }

    private PhieuDatPhong findBookingById(Integer id) {
        return bookingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu dat phong #" + id));
    }

    private void assertStatus(PhieuDatPhong booking, String expected, String errorMsg) {
        if (!expected.equals(booking.getTrangThai())) {
            throw new RuntimeException(errorMsg + " (trang thai hien tai: " + booking.getTrangThai() + ")");
        }
    }

    private void saveLichSu(PhieuDatPhong booking, BigDecimal soTien, String loai,
                              String phuongThuc, String trangThai, String ghiChu, String nguoiThucHien) {
        LichSuThanhToan ls = new LichSuThanhToan();
        ls.setPhieuDatPhong(booking);
        ls.setSoTien(soTien);
        ls.setLoaiGiaoDich(loai);
        ls.setPhuongThuc(phuongThuc);
        ls.setTrangThai(trangThai);
        ls.setGhiChu(ghiChu);
        ls.setNguoiThucHien(nguoiThucHien);
        lichSuRepo.save(ls);
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "System";
    }

    private BookingDto.BookingResponse toBookingResponse(PhieuDatPhong b) {
        long soNgay = b.getNgayDen() != null && b.getNgayDi() != null
                ? ChronoUnit.DAYS.between(b.getNgayDen(), b.getNgayDi()) : 0;
        NguoiDung kh = b.getNguoiDung();
        return BookingDto.BookingResponse.builder()
                .id(b.getId())
                .maDatPhong(b.getMaDatPhong())
                .trangThai(b.getTrangThai())
                .trangThaiThanhToan(b.getTrangThaiThanhToan())
                .phongId(b.getPhong() != null ? b.getPhong().getId() : null)
                .tenPhong(b.getPhong() != null ? b.getPhong().getTen() : null)
                .maPhong(b.getPhong() != null ? b.getPhong().getMaPhong() : null)
                .tang(b.getPhong() != null ? b.getPhong().getTang() : null)
                .soPhong(b.getPhong() != null ? b.getPhong().getSoPhong() : null)
                .loaiPhong(b.getPhong() != null && b.getPhong().getLoaiPhong() != null
                        ? b.getPhong().getLoaiPhong().getTen() : null)
                .khachSanId(b.getPhong() != null && b.getPhong().getKhachSan() != null
                        ? b.getPhong().getKhachSan().getId() : null)
                .tenKhachSan(b.getPhong() != null && b.getPhong().getKhachSan() != null
                        ? b.getPhong().getKhachSan().getTen() : null)
                .nguoiDungId(kh != null ? kh.getId() : null)
                .hoTenKhach(kh != null ? kh.getHoTen() : null)
                .emailKhach(kh != null ? kh.getEmail() : null)
                .sdtKhach(kh != null ? kh.getSdt() : null)
                .ngayDen(b.getNgayDen())
                .ngayDi(b.getNgayDi())
                .soNgay((int) soNgay)
                .giaPhongGoc(b.getGiaPhongGoc())
                .thanhTien(b.getThanhTien())
                .phuongThucThanhToan(b.getPhuongThucThanhToan())
                .tienCoc(b.getTienCoc())
                .trangThaiCoc(b.getTrangThaiCoc())
                .loaiDatPhong(b.getLoaiDatPhong())
                .pendingExpiresAt(b.getPendingExpiresAt())
                .ngayDat(b.getNgayDat())
                .ghiChuKhach(b.getGhiChuKhach())
                .isReviewed(danhGiaRepo.existsByPhieuDatPhongId(b.getId()))
                .build();
    }
    /**
     * Sinh ma dat phong theo format BKyyyyMMddXXXX.
     * Dung de thay the trigger SQL Server, tranh loi "null identifier".
     */
    private String sinhMaDatPhong() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randPart = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        return "BK" + datePart + randPart;
    }
}
