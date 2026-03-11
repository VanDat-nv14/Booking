package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.ReviewDto;
import com.example.bookingkhachsan.entity.*;
import com.example.bookingkhachsan.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
        review.setTrangThai("Chờ duyệt");
        
        danhGiaRepo.save(review);
    }

    public List<DanhGia> getReviews(Integer hotelId) {
        return danhGiaRepo.findByKhachSanIdAndTrangThai(hotelId, "Đã duyệt");
    }
}
