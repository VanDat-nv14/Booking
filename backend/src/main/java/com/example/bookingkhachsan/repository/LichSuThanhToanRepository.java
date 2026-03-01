package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.LichSuThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuThanhToanRepository extends JpaRepository<LichSuThanhToan, Integer> {

    List<LichSuThanhToan> findByPhieuDatPhongIdOrderByNgayGiaoDichDesc(Integer phieuDatPhongId);

    @Query("""
        SELECT SUM(ls.soTien) FROM LichSuThanhToan ls
        WHERE ls.phieuDatPhong.id = :bookingId
          AND ls.loaiGiaoDich = 'ThanhToan'
          AND ls.trangThai = 'ThanhCong'
        """)
    java.math.BigDecimal sumPaidByBookingId(@Param("bookingId") Integer bookingId);
}
