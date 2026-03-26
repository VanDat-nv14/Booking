package com.example.bookingkhachsan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // Bat @Scheduled trong BookingService (tu dong expire Pending bookings)
@EnableAsync        // Bat @Async trong EmailService (gui email bat dong bo)

public class BookingKhachSanApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookingKhachSanApplication.class, args);
	}

}
