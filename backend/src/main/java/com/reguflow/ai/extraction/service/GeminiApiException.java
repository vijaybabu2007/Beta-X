package com.reguflow.ai.extraction.service;

public class GeminiApiException extends RuntimeException {
    private final int statusCode;

    public GeminiApiException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public GeminiApiException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 500;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
