package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.LoaiPhong;
import com.example.bookingkhachsan.repository.LoaiPhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoaiPhongController {

    private final LoaiPhongRepository loaiPhongRepo;

    /** GET /api/room-types — Lay tat ca loai phong (public) */
    @GetMapping
    public ResponseEntity<List<LoaiPhong>> getAll() {
        return ResponseEntity.ok(loaiPhongRepo.findAll());
    }

    /** GET /api/room-types/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<LoaiPhong> getById(@PathVariable Integer id) {
        return loaiPhongRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/room-types — Admin/Manager tao loai phong moi */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<LoaiPhong> create(@RequestBody LoaiPhong loaiPhong) {
        return ResponseEntity.ok(loaiPhongRepo.save(loaiPhong));
    }

    /** PUT /api/room-types/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<LoaiPhong> update(@PathVariable Integer id, @RequestBody LoaiPhong loaiPhong) {
        if (!loaiPhongRepo.existsById(id)) return ResponseEntity.notFound().build();
        loaiPhong.setId(id);
        return ResponseEntity.ok(loaiPhongRepo.save(loaiPhong));
    }

    /** DELETE /api/room-types/{id} — Admin only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!loaiPhongRepo.existsById(id)) return ResponseEntity.notFound().build();
        loaiPhongRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
