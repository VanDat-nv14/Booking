package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.HotelDetailDto;
import com.example.bookingkhachsan.dto.HotelSearchResultDto;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.HotelService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class HotelController {

    private final HotelService service;

    @GetMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<KhachSan>> getAll(@RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(service.getAllForAdmin());
    }

    @GetMapping("/public")
    public ResponseEntity<List<HotelSearchResultDto>> getPublic(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) java.time.LocalDate checkIn,
            @RequestParam(required = false) java.time.LocalDate checkOut
    ) {
        return ResponseEntity.ok(service.getPublicWithAvailability(limit, checkIn, checkOut));
    }

    @GetMapping("/my-hotel")
    public ResponseEntity<KhachSan> getMyHotel(@AuthenticationPrincipal NguoiDung nguoiDung) {
        if (nguoiDung == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(service.getMyHotel(nguoiDung.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<HotelSearchResultDto>> search(
            @RequestParam(name = "viTriId", required = false) Integer viTriId,
            @RequestParam(name = "soSao", required = false) Integer soSao,
            @RequestParam(name = "minPrice", required = false) java.math.BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) java.math.BigDecimal maxPrice,
            @RequestParam(name = "checkIn", required = false) java.time.LocalDate checkIn,
            @RequestParam(name = "checkOut", required = false) java.time.LocalDate checkOut
    ) {
        return ResponseEntity.ok(service.search(viTriId, soSao, minPrice, maxPrice, checkIn, checkOut));
    }

    @GetMapping("/map")
    public ResponseEntity<List<com.example.bookingkhachsan.dto.HotelMapDto>> getMapData() {
        return ResponseEntity.ok(service.getMapData());
    }

    /** Trang chi tiết khách sạn — trả về HotelDetailDto với dịch vụ và đánh giá */
    @GetMapping("/{id}/details")
    public ResponseEntity<HotelDetailDto> getDetails(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.getHotelDetail(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> createHotel(@jakarta.validation.Valid @RequestBody com.example.bookingkhachsan.dto.HotelDto dto) {
        try {
            return ResponseEntity.ok(service.createHotel(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateHotel(@PathVariable Integer id, @jakarta.validation.Valid @RequestBody com.example.bookingkhachsan.dto.HotelDto dto) {
        try {
            return ResponseEntity.ok(service.updateHotel(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/hotels/{id}/settings — HotelManager updates their hotel's deposit % and check-in/out time.
     * Verifies caller is the nguoiQuanLy of this hotel.
     */
    @PutMapping("/{id}/settings")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<?> updateHotelSettings(
            @PathVariable Integer id,
            @RequestBody com.example.bookingkhachsan.dto.HotelDto dto,
            @AuthenticationPrincipal NguoiDung currentUser) {
        try {
            KhachSan hotel = service.getDetails(id);
            if (hotel == null) return ResponseEntity.notFound().build();
            // Permission check: only Admin or the assigned manager can update
            boolean isAdmin = "Admin".equals(currentUser.getChucVu());
            boolean isManager = hotel.getNguoiQuanLy() != null
                    && hotel.getNguoiQuanLy().getId().equals(currentUser.getId());
            if (!isAdmin && !isManager) {
                return ResponseEntity.status(403).body(java.util.Map.of("error", "Bạn không có quyền chỉnh sửa khách sạn này!"));
            }
            return ResponseEntity.ok(service.updateHotelSettings(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHotel(@PathVariable Integer id) {
        try {
            service.deleteHotel(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/hotels/{id}/toggle-status — Admin bật/tắt trạng thái hoạt động của khách sạn
     */
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> toggleStatus(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.toggleStatus(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * Upload nhiều hình ảnh từ file máy tính cho khách sạn.
     * Lưu file vào uploads/hotel-images/{id}/ và thêm URL vào danh sách hinhAnhs của khách sạn.
     */
    @PostMapping("/{id}/images/upload")
    public ResponseEntity<?> uploadHotelImages(
            @PathVariable Integer id,
            @RequestParam("files") java.util.List<org.springframework.web.multipart.MultipartFile> files,
            @AuthenticationPrincipal NguoiDung currentUser) {

        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Danh sách file không được để trống!"));
        }

        KhachSan hotel = service.getDetails(id);
        java.util.List<String> imgs = hotel.getHinhAnhs() != null
                ? new java.util.ArrayList<>(hotel.getHinhAnhs())
                : new java.util.ArrayList<>();

        java.util.List<String> uploadedUrls = new java.util.ArrayList<>();

        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/hotel-images/" + id;
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            java.nio.file.Files.createDirectories(uploadPath);

            for (org.springframework.web.multipart.MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) continue;

                String ext = "";
                String originalName = file.getOriginalFilename();
                if (originalName != null && originalName.contains(".")) {
                    ext = originalName.substring(originalName.lastIndexOf('.'));
                }
                String fileName = "hotel_" + id + "_" + java.util.UUID.randomUUID().toString().substring(0, 8) + ext;
                java.nio.file.Path filePath = uploadPath.resolve(fileName);
                java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                String imageUrl = "/uploads/hotel-images/" + id + "/" + fileName;
                imgs.add(imageUrl);
                uploadedUrls.add(imageUrl);
            }

            if (uploadedUrls.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Không có file ảnh nào hợp lệ được tải lên!"));
            }

            com.example.bookingkhachsan.dto.HotelDto req = new com.example.bookingkhachsan.dto.HotelDto();
            req.setHinhAnhs(imgs);
            req.setHinhAnhBia(hotel.getHinhAnhBia() != null && !hotel.getHinhAnhBia().isEmpty()
                    ? hotel.getHinhAnhBia() : uploadedUrls.get(0));
            service.updateHotelSettings(id, req);

            return ResponseEntity.ok(java.util.Map.of("urls", uploadedUrls, "message", "Upload thành công " + uploadedUrls.size() + " ảnh!"));
        } catch (java.io.IOException e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", "Lỗi lưu file: " + e.getMessage()));
        }
    }
}
