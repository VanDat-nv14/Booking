package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.BookingDto;
import com.example.bookingkhachsan.entity.PhieuDatPhong;
import com.example.bookingkhachsan.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.bookingkhachsan.entity.NguoiDung;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    // =====================================================
    // KIEM TRA PHONG TRONG
    // =====================================================

    /**
     * GET /api/hotels/{id}/available-rooms?checkIn=2026-03-01&checkOut=2026-03-03
     * Lay phong con trong cua khach san trong khoang ngay. Public endpoint.
     */
    @GetMapping("/hotels/{khachSanId}/available-rooms")
    public ResponseEntity<List<BookingDto.AvailableRoomResponse>> getAvailableRooms(
            @PathVariable Integer khachSanId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Integer loaiPhongId
    ) {
        return ResponseEntity.ok(bookingService.getAvailableRooms(khachSanId, checkIn, checkOut, loaiPhongId));
    }

    // =====================================================
    // TAO & QUAN LY DAT PHONG
    // =====================================================

    /** POST /api/bookings/create — Khach dat phong */
    @PostMapping("/bookings/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDto.BookingResponse> createBooking(
            @Valid @RequestBody BookingDto.CreateBookingRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        // Dam bao nguoi dung chi dat cho chinh minh (hoac Admin)
        if (currentUser != null && !"Admin".equals(currentUser.getChucVu())) {
            request.setNguoiDungId(currentUser.getId());
        }
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    /** GET /api/bookings/{code} — Xem chi tiet theo ma phieu */
    @GetMapping("/bookings/{code}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDto.BookingResponse> getBooking(@PathVariable String code) {
        return ResponseEntity.ok(bookingService.getBookingByCodeResponse(code));
    }

    /** GET /api/bookings/id/{id} — Xem chi tiet theo ID */
    @GetMapping("/bookings/id/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDto.BookingResponse> getBookingById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.getBookingByIdResponse(id));
    }

    /** GET /api/bookings/user/{userId} — Danh sach booking cua user */
    @GetMapping("/bookings/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingDto.BookingResponse>> getBookingsByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    /** GET /api/bookings/hotel/{hotelId} — Danh sach booking cua hotel (HotelManager) */
    @GetMapping("/bookings/hotel/{hotelId}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<List<BookingDto.BookingResponse>> getBookingsByHotel(@PathVariable Integer hotelId) {
        return ResponseEntity.ok(bookingService.getBookingsByHotel(hotelId));
    }

    /** GET /api/bookings/hotel/{hotelId}/revenue — Bao cao doanh thu cua hotel (HotelManager) */
    @GetMapping("/bookings/hotel/{hotelId}/revenue")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<BookingDto.HotelRevenueReport> getHotelRevenue(
            @PathVariable Integer hotelId,
            @RequestParam(required = false, defaultValue = "2026") Integer year) {
        return ResponseEntity.ok(bookingService.getHotelRevenueReport(hotelId, year));
    }

    // =====================================================
    // STATE TRANSITIONS
    // =====================================================

    /** PUT /api/bookings/{id}/confirm — Xac nhan booking (sau thanh toan) */
    @PutMapping("/bookings/{id}/confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDto.BookingResponse> confirm(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.confirmBooking(id));
    }

    /** PUT /api/bookings/{id}/reject — Manager tu choi (RequestToBook) */
    @PutMapping("/bookings/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<BookingDto.BookingResponse> reject(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String ghiChu = body != null ? body.getOrDefault("ghiChu", "Khong co ly do") : "Khong co ly do";
        return ResponseEntity.ok(bookingService.rejectBooking(id, ghiChu));
    }

    /** PUT /api/bookings/{id}/cancel — Khach huy phong */
    @PutMapping("/bookings/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDto.BookingResponse> cancel(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body
    ) {
        String ghiChu = body.getOrDefault("ghiChuHuy", "Khach chu dong huy");
        return ResponseEntity.ok(bookingService.cancelBooking(id, ghiChu));
    }

    /** PUT /api/bookings/{id}/checkin — Nhan phong */
    @PutMapping("/bookings/{id}/checkin")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<BookingDto.BookingResponse> checkin(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.checkin(id));
    }

    /** PUT /api/bookings/{id}/no-show — Danh dau khach khong den */
    @PutMapping("/bookings/{id}/no-show")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<BookingDto.BookingResponse> noShow(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.markNoShow(id));
    }

    /** POST /api/bookings/{id}/checkout — Tra phong + tinh hoa don */
    @PostMapping("/bookings/{id}/checkout")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<BookingDto.BookingResponse> checkout(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String phuongThuc = body != null ? body.getOrDefault("phuongThuc", "TienMat") : "TienMat";
        return ResponseEntity.ok(bookingService.checkout(id, phuongThuc));
    }

    /** PUT /api/bookings/{id}/complete — Hoan tat sau checkout */
    @PutMapping("/bookings/{id}/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<BookingDto.BookingResponse> complete(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.completeBooking(id));
    }

    // =====================================================
    // THANH TOAN & LICH SU
    // =====================================================

    /** POST /api/bookings/{id}/payment — Ghi nhan thanh toan */
    @PostMapping("/bookings/{id}/payment")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<Void> recordPayment(
            @PathVariable Integer id,
            @Valid @RequestBody BookingDto.RecordPaymentRequest request
    ) {
        request.setPhieuDatPhongId(id);
        bookingService.recordPayment(request);
        return ResponseEntity.ok().build();
    }

    /** GET /api/bookings/{id}/payment-history — Xem lich su thanh toan */
    @GetMapping("/bookings/{id}/payment-history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingDto.PaymentHistoryResponse>> paymentHistory(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.getPaymentHistory(id));
    }

    /** GET /api/bookings/{id}/invoice — Xem hoa don chi tiet (phong + DV + phu thu) */
    @GetMapping("/bookings/{id}/invoice")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDto.InvoiceResponse> getInvoice(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.getInvoice(id));
    }

    // =====================================================
    // DICH VU & PHU THU
    // =====================================================

    @PostMapping("/services/add-to-booking")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<Void> addService(@Valid @RequestBody BookingDto.AddServiceRequest request) {
        bookingService.addService(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/surcharges/add")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<Void> addSurcharge(@Valid @RequestBody BookingDto.AddSurchargeRequest request) {
        bookingService.addSurcharge(request);
        return ResponseEntity.ok().build();
    }
}
