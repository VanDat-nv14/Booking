package com.example.bookingkhachsan.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;

@Component
@Getter
public class VnPayConfig {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    public String buildPaymentUrl(String txnRef, long amountVnd, String orderInfo, String clientIp) {
        try {
            long amount = amountVnd * 100L; // VNPAY amount tính bằng VND * 100

            Map<String, String> vnpParams = new TreeMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            vnpParams.put("vnp_IpAddr", (clientIp != null && !clientIp.equals("0:0:0:0:0:0:0:1")) ? clientIp : "127.0.0.1");

            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            String createDate = now.format(formatter);
            vnpParams.put("vnp_CreateDate", createDate);

            // Build query & hash data
            StringJoiner query = new StringJoiner("&");
            StringJoiner hashData = new StringJoiner("&");
            
            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                if (value != null && !value.isBlank()) {
                    // hashData: key raw + value URL-encoded (spaces → '+') theo đúng chuẩn VNPAY
                    String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8);
                    hashData.add(key + "=" + encodedValue);
                    // query: dùng %20 thay + cho đẹp URL trên browser
                    query.add(key + "=" + encodedValue.replace("+", "%20"));
                }
            }

            String vnpSecureHash = hmacSHA512(hashSecret, hashData.toString());
            query.add("vnp_SecureHash=" + vnpSecureHash);

            return payUrl + "?" + query.toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo URL thanh toán VNPAY: " + e.getMessage(), e);
        }
    }

    public boolean validateSignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) return false;

        Map<String, String> sorted = new TreeMap<>(params);
        sorted.remove("vnp_SecureHash");
        sorted.remove("vnp_SecureHashType");

        StringJoiner hashData = new StringJoiner("&");
        for (Map.Entry<String, String> entry : sorted.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.isBlank()) {
                // Spring đã URL-decode tham số. Encode lại đúng chuẩn VNPAY: key raw + value URLEncode (spaces → '+')
                String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8);
                hashData.add(key + "=" + encodedValue);
            }
        }

        String calculated = hmacSHA512(hashSecret, hashData.toString());
        return calculated.equalsIgnoreCase(receivedHash);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hash.append('0');
                hash.append(hex);
            }
            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error while calculating VNPAY HMAC: " + e.getMessage(), e);
        }
    }
}

