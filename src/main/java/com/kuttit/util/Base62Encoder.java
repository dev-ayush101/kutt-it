package com.kuttit.util;

public class Base62Encoder {

    public static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public static String encode(long num) {
        StringBuilder sb = new StringBuilder();

        while (num > 0) {
            int rem = (int) (num % 62);
            sb.append(BASE62.charAt(rem));
            num /= 62;
        }

        return sb.reverse().toString();
    }
}
