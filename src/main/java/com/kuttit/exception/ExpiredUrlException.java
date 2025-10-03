package com.kuttit.exception;

public class ExpiredUrlException extends RuntimeException {
    public ExpiredUrlException(String message) {
        super(message);
    }
}
