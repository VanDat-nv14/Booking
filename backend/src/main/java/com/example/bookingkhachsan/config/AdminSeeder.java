package com.example.bookingkhachsan.config;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final NguoiDungRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!repository.existsByEmail("admin@hotel.com")) {
            NguoiDung admin = new NguoiDung();
            admin.setHoTen("Administrator");
            admin.setEmail("admin@hotel.com");
            admin.setMatKhau(passwordEncoder.encode("123456"));
            admin.setChucVu("Admin"); // Must match SQL Check constraint ('Admin')
            admin.setTrangThai(true);
            admin.setSdt("0900000000");
            admin.setProvider(NguoiDung.Provider.LOCAL);
            
            repository.save(admin);
            System.out.println("Default Admin created: admin@hotel.com / 123456");
        }
    }
}
