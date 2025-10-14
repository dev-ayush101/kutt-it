package com.kuttit.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class QrCodeService {

    @Value("${qr.storage.path}")
    private String storagePath;

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(Paths.get(storagePath));
        log.info("QR storage directory ready: {}", storagePath);
    }

    public String getQrCodeUrl(String shortCode) throws IOException {
        Path filePath = Paths.get(storagePath, shortCode + ".png");

        if (Files.exists(filePath)) {
            log.info("QR file cache hit for shortCode: {}", shortCode);
        } else {
            byte[] qrBytes = generateQrCode("http://localhost:8080/api/r/" + shortCode);
            Files.write(filePath, qrBytes);
            log.info("QR generated and saved for shortCode: {}", shortCode);
        }

        return "http://localhost:8080/qr/" + shortCode + ".png";
    }

    private byte[] generateQrCode(String url) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(url, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code");
        }
    }
}