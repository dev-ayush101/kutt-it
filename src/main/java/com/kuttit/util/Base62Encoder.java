package com.kuttit.util;

public class Base62Encoder {

    public static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public static String encode(byte[] bytes) {
        StringBuilder result = new StringBuilder();

        // Convert byte-array → positive long
        long num = 0;
        for (byte b: bytes) {
            num = (num << 8) | (b & 0xFF);
        }

        // Convert to Base62
        while (num > 0) {
            int rem = (int)(num % 62);
            result.append(BASE62.charAt(rem));
            num /= 62;
        }

        return result.reverse().toString();
    }
}
