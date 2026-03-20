package com.example.bookingkhachsan.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Tùy chỉnh OAuth2 Authorization Request:
 * - Facebook: thêm auth_type=reauthenticate → Facebook luôn hiển thị màn chọn tài khoản
 *   thay vì tự động dùng account đang đăng nhập trong browser.
 */
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository repo, String authorizationRequestBaseUri) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(repo, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return customize(defaultResolver.resolve(request), request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return customize(defaultResolver.resolve(request, clientRegistrationId), request);
    }

    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest authRequest, HttpServletRequest httpRequest) {
        if (authRequest == null) return null;

        String registrationId = extractRegistrationId(authRequest);

        if ("facebook".equalsIgnoreCase(registrationId)) {
            // Thêm auth_type=reauthenticate → Facebook hiển thị màn chọn tài khoản
            Map<String, Object> additionalParams = new HashMap<>(authRequest.getAdditionalParameters());
            additionalParams.put("auth_type", "reauthenticate");
            return OAuth2AuthorizationRequest.from(authRequest)
                    .additionalParameters(additionalParams)
                    .build();
        }

        return authRequest;
    }

    private String extractRegistrationId(OAuth2AuthorizationRequest authRequest) {
        // AuthorizationRequestUri có dạng: .../oauth2/authorization/{registrationId}
        // Lấy registrationId từ state hoặc từ URL
        String uri = authRequest.getAuthorizationRequestUri();
        if (uri != null) {
            if (uri.contains("facebook.com")) return "facebook";
            if (uri.contains("google.com")) return "google";
        }
        // Fallback: lấy từ additionalParameters nếu có
        Object id = authRequest.getAdditionalParameters().get("registration_id");
        return id != null ? id.toString() : "";
    }
}
