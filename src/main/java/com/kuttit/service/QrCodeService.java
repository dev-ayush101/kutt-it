package com.kuttit.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final RedisTemplate<String, Object> redisTemplate;

    public byte[] getQrCode(String shortCode) {
        String cacheKey = "qr:" + shortCode;

        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.info("QR cache hit for shortCode: {}", shortCode);
            return Base64.getDecoder().decode((String) cached);
        }

        byte[] qrBytes = generateQrCode("http://localhost:8080/api/r/" + shortCode);
        redisTemplate.opsForValue().set(cacheKey, Base64.getEncoder().encodeToString(qrBytes), Duration.ofHours(24));
        log.info("QR generated and cached for shortCode: {}", shortCode);
        return qrBytes;
    }

    private byte[] generateQrCode(String url) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(url, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}
