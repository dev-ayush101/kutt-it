package com.kuttit.util;

public class ShortCodeGenerator {

    private static final int CODE_LENGTH = 8;

    public static String generate(String url) {

        // Hash
        byte[] hash = HashUtil.sha256(url);

        // Encode to Base62
        String base62 = Base62Encoder.encode(hash);

        // Trim to desired length
        return base62.substring(0, CODE_LENGTH);
    }
}
