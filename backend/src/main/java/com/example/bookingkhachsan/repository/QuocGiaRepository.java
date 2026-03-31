package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.QuocGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuocGiaRepository extends JpaRepository<QuocGia, Integer> {
    List<QuocGia> findByTrangThaiTrue();
    java.util.Optional<QuocGia> findByTen(String ten);

    /** Load full tree in one query to avoid N+1 when serializing (QuocGia -> TinhThanh -> ViTri). */
    @Query("SELECT DISTINCT q FROM QuocGia q LEFT JOIN FETCH q.tinhThanhs t LEFT JOIN FETCH t.viTris WHERE q.trangThai = true")
    List<QuocGia> findTreeWithLocations();
}
