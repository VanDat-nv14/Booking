package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.ReviewDto;
import com.example.bookingkhachsan.dto.UserReviewResponse;
import com.example.bookingkhachsan.entity.*;
import com.example.bookingkhachsan.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final DanhGiaRepository danhGiaRepo;
    private final PhieuDatPhongRepository bookingRepo;
    private final KhachSanRepository hotelRepo;
    private final NguoiDungRepository userRepo;

    public void createReview(ReviewDto request) {
        PhieuDatPhong booking = bookingRepo.findById(request.getPhieuDatPhongId()).orElseThrow(() -> new RuntimeException("Booking not found"));
        if (danhGiaRepo.existsByPhieuDatPhongId(booking.getId())) {
            throw new RuntimeException("Đơn đặt phòng này đã được đánh giá.");
        }
        KhachSan hotel = hotelRepo.findById(request.getKhachSanId()).orElseThrow(() -> new RuntimeException("Hotel not found"));
        NguoiDung user = userRepo.findById(request.getNguoiDungId()).orElseThrow(() -> new RuntimeException("User not found"));

        DanhGia review = new DanhGia();
        review.setPhieuDatPhong(booking);
        review.setKhachSan(hotel);
        review.setNguoiDung(user);
        review.setSoSaoTong(request.getSoSaoTong());
        review.setBinhLuan(request.getBinhLuan());
        review.setTrangThai("Đã duyệt");
        review.setNgayDanhGia(java.time.LocalDateTime.now());
        danhGiaRepo.save(review);
        
        // Cập nhật lại điểm đánh giá trung bình
        int oldLuot = hotel.getSoLuotDanhGia() != null ? hotel.getSoLuotDanhGia() : 0;
        java.math.BigDecimal oldTrungBinh = hotel.getDiemDanhGiaTrungBinh() != null ? hotel.getDiemDanhGiaTrungBinh() : java.math.BigDecimal.ZERO;
        
        int newLuot = oldLuot + 1;
        double newTrungBinh = ((oldTrungBinh.doubleValue() * oldLuot) + request.getSoSaoTong()) / newLuot;
        
        hotel.setSoLuotDanhGia(newLuot);
        hotel.setDiemDanhGiaTrungBinh(java.math.BigDecimal.valueOf(newTrungBinh));
        hotelRepo.save(hotel);
    }

    public List<DanhGia> getReviews(Integer hotelId) {
        return danhGiaRepo.findByKhachSanIdAndTrangThai(hotelId, "Đã duyệt");
    }
    
    public List<DanhGia> getReviewsForManager(Integer hotelId) {
        return danhGiaRepo.findByKhachSanIdOrderByNgayDanhGiaDesc(hotelId);
    }
    
    public void addReply(Integer reviewId, String phanHoi) {
        DanhGia review = danhGiaRepo.findById(reviewId).orElseThrow(() -> new RuntimeException("Review not found"));
        review.setPhanHoi(phanHoi);
        review.setNgayPhanHoi(java.time.LocalDateTime.now());
        danhGiaRepo.save(review);
    }

    @Transactional(readOnly = true)
    public List<UserReviewResponse> getReviewsByUser(Integer userId) {
        return danhGiaRepo.findByNguoiDung_IdOrderByNgayDanhGiaDesc(userId).stream()
                .map(this::toUserReviewResponse)
                .collect(Collectors.toList());
    }

    private UserReviewResponse toUserReviewResponse(DanhGia d) {
        KhachSan ks = d.getKhachSan();
        PhieuDatPhong pdp = d.getPhieuDatPhong();
        UserReviewResponse.KhachSanMini mini = null;
        if (ks != null) {
            mini = UserReviewResponse.KhachSanMini.builder()
                    .id(ks.getId())
                    .ten(ks.getTen())
                    .diaChi(ks.getDiaChi())
                    .hinhAnhBia(ks.getHinhAnhBia())
                    .build();
        }
        return UserReviewResponse.builder()
                .id(d.getId())
                .soSaoTong(d.getSoSaoTong())
                .binhLuan(d.getBinhLuan())
                .phanHoi(d.getPhanHoi())
                .ngayPhanHoi(d.getNgayPhanHoi())
                .ngayDanhGia(d.getNgayDanhGia())
                .maDatPhong(pdp != null ? pdp.getMaDatPhong() : null)
                .khachSan(mini)
                .build();
    }
}
