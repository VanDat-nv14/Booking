package com.example.bookingkhachsan.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // Cho phep dung @PreAuthorize, @Secured tren controller
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // --- Public endpoints ---
                .requestMatchers("/", "/api/auth/**", "/api/locations/**",
                        "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/error",
                        "/uploads/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/hotels/**", "/api/room-types/**").permitAll()


                // --- Admin only ---
                // Dung hasAuthority("ROLE_Admin") thay vi hasRole("ADMIN")
                // vi chucVu trong DB la "Admin" -> getAuthorities() tao ra "ROLE_Admin"
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_Admin")

                // --- Hotel Manager + Admin ---
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/hotels/**")
                    .hasAnyAuthority("ROLE_Admin", "ROLE_HotelManager")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/hotels/**")
                    .hasAnyAuthority("ROLE_Admin", "ROLE_HotelManager")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/hotels/**")
                    .hasAnyAuthority("ROLE_Admin", "ROLE_HotelManager")

                // --- Moi request con lai phai dang nhap ---
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/api/auth/oauth2/success")
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
