package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.QuocGia;
import com.example.bookingkhachsan.entity.TinhThanh;
import com.example.bookingkhachsan.entity.ViTri;
import com.example.bookingkhachsan.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
public class LocationController {

    @Autowired private LocationService locationService;
    @Autowired private com.example.bookingkhachsan.repository.QuocGiaRepository quocGiaRepository;
    @Autowired private com.example.bookingkhachsan.repository.TinhThanhRepository tinhThanhRepository;
    @Autowired private com.example.bookingkhachsan.repository.ViTriRepository viTriRepository;

    /** Cây đầy đủ: QuocGia → TinhThanh → ViTri */
    @GetMapping("/tree")
    public ResponseEntity<List<QuocGia>> getTree() {
        return ResponseEntity.ok(locationService.getTree());
    }

    /** Tất cả quốc gia */
    @GetMapping("/quocgia")
    public ResponseEntity<List<QuocGia>> getAllQuocGia() {
        return ResponseEntity.ok(quocGiaRepository.findAll());
    }

    /** Tỉnh thành — nếu truyền quocGiaId thì lọc theo quốc gia */
    @GetMapping("/tinhthanh")
    public ResponseEntity<List<TinhThanh>> getTinhThanh(
            @RequestParam(required = false) Integer quocGiaId) {
        if (quocGiaId != null) {
            return ResponseEntity.ok(tinhThanhRepository.findByQuocGia_Id(quocGiaId));
        }
        return ResponseEntity.ok(tinhThanhRepository.findAll());
    }

    /** ViTri — nếu truyền tinhThanhId thì lọc theo tỉnh */
    @GetMapping("/vitri")
    public ResponseEntity<List<ViTri>> getViTri(
            @RequestParam(required = false) Integer tinhThanhId) {
        if (tinhThanhId != null) {
            return ResponseEntity.ok(viTriRepository.findByTinhThanh_Id(tinhThanhId));
        }
        return ResponseEntity.ok(viTriRepository.findAll());
    }

    /** Tạo vị trí mới trong một tỉnh thành */
    @PostMapping("/vitri")
    public ResponseEntity<?> createViTri(@RequestBody Map<String, Object> body) {
        try {
            String ten = (String) body.get("ten");
            Integer tinhThanhId = (Integer) body.get("tinhThanhId");
            if (ten == null || ten.isBlank() || tinhThanhId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên và tỉnh thành không được để trống"));
            }
            var existing = viTriRepository.findByTenAndTinhThanh_Id(ten.trim(), tinhThanhId);
            if (existing.isPresent()) return ResponseEntity.ok(existing.get());

            ViTri viTri = new ViTri();
            viTri.setTen(ten.trim());
            viTri.setTrangThai(true);
            TinhThanh tt = new TinhThanh();
            tt.setId(tinhThanhId);
            viTri.setTinhThanh(tt);
            return ResponseEntity.ok(viTriRepository.save(viTri));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
