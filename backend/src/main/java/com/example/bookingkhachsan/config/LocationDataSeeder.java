package com.example.bookingkhachsan.config;

import com.example.bookingkhachsan.entity.QuocGia;
import com.example.bookingkhachsan.entity.TinhThanh;
import com.example.bookingkhachsan.entity.ViTri;
import com.example.bookingkhachsan.repository.QuocGiaRepository;
import com.example.bookingkhachsan.repository.TinhThanhRepository;
import com.example.bookingkhachsan.repository.ViTriRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Seed dữ liệu tỉnh thành Việt Nam (dữ liệu thô, không gọi API).
 * Chạy khi location.seed-on-startup=true và bảng tinh_thanh trống.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "location.seed-on-startup", havingValue = "true")
@Order(2)
public class LocationDataSeeder implements CommandLineRunner {

    private static final List<String> TINH_THANH_VIET_NAM = Arrays.asList(
            "Thành phố Hà Nội", "Tỉnh Hà Giang", "Tỉnh Cao Bằng", "Tỉnh Bắc Kạn", "Tỉnh Tuyên Quang",
            "Tỉnh Lào Cai", "Tỉnh Điện Biên", "Tỉnh Lai Châu", "Tỉnh Sơn La", "Tỉnh Yên Bái",
            "Tỉnh Hoà Bình", "Tỉnh Thái Nguyên", "Tỉnh Lạng Sơn", "Tỉnh Quảng Ninh", "Tỉnh Bắc Giang",
            "Tỉnh Phú Thọ", "Tỉnh Vĩnh Phúc", "Tỉnh Bắc Ninh", "Tỉnh Hải Dương", "Thành phố Hải Phòng",
            "Tỉnh Hưng Yên", "Tỉnh Thái Bình", "Tỉnh Hà Nam", "Tỉnh Nam Định", "Tỉnh Ninh Bình",
            "Tỉnh Thanh Hóa", "Tỉnh Nghệ An", "Tỉnh Hà Tĩnh", "Tỉnh Quảng Bình", "Tỉnh Quảng Trị",
            "Thành phố Huế", "Thành phố Đà Nẵng", "Tỉnh Quảng Nam", "Tỉnh Quảng Ngãi", "Tỉnh Bình Định",
            "Tỉnh Phú Yên", "Tỉnh Khánh Hòa", "Tỉnh Ninh Thuận", "Tỉnh Bình Thuận", "Tỉnh Kon Tum",
            "Tỉnh Gia Lai", "Tỉnh Đắk Lắk", "Tỉnh Đắk Nông", "Tỉnh Lâm Đồng", "Tỉnh Bình Phước",
            "Tỉnh Tây Ninh", "Tỉnh Bình Dương", "Tỉnh Đồng Nai", "Tỉnh Bà Rịa - Vũng Tàu",
            "Thành phố Hồ Chí Minh", "Tỉnh Long An", "Tỉnh Tiền Giang", "Tỉnh Bến Tre", "Tỉnh Trà Vinh",
            "Tỉnh Vĩnh Long", "Tỉnh Đồng Tháp", "Tỉnh An Giang", "Tỉnh Kiên Giang", "Thành phố Cần Thơ",
            "Tỉnh Hậu Giang", "Tỉnh Sóc Trăng", "Tỉnh Bạc Liêu", "Tỉnh Cà Mau"
    );

    private final QuocGiaRepository quocGiaRepository;
    private final TinhThanhRepository tinhThanhRepository;
    private final ViTriRepository viTriRepository;

    @Override
    public void run(String... args) {
        if (tinhThanhRepository.count() > 0) {
            log.info("LocationDataSeeder: Đã có dữ liệu tỉnh thành, bỏ qua seed.");
            return;
        }

        log.info("LocationDataSeeder: Bắt đầu seed dữ liệu tỉnh thành (dữ liệu thô)");

        // 1. Lấy hoặc tạo Quốc gia Việt Nam
        QuocGia vietNam = quocGiaRepository.findAll().stream()
                .filter(q -> "Việt Nam".equalsIgnoreCase(q.getTen()))
                .findFirst()
                .orElseGet(() -> {
                    QuocGia q = new QuocGia();
                    q.setTen("Việt Nam");
                    q.setTrangThai(true);
                    return quocGiaRepository.save(q);
                });
        log.info("Sử dụng quốc gia: {}", vietNam.getTen());

        // 2. Tạo 63 tỉnh/thành phố
        for (String ten : TINH_THANH_VIET_NAM) {
            TinhThanh tt = new TinhThanh();
            tt.setTen(ten);
            tt.setQuocGia(vietNam);
            tt.setTrangThai(true);
            tt = tinhThanhRepository.save(tt);
            // Mỗi tỉnh có 1 vị trí mặc định "Tổng quan"
            ViTri vt = new ViTri();
            vt.setTen("Tổng quan");
            vt.setTinhThanh(tt);
            vt.setTrangThai(true);
            viTriRepository.save(vt);
        }

        log.info("LocationDataSeeder: Đã tạo {} tỉnh/thành phố và vị trí mặc định. Hoàn tất.", TINH_THANH_VIET_NAM.size());
    }
}
