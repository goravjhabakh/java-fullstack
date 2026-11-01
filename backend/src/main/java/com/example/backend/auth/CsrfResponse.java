package com.example.backend.auth;

public record CsrfResponse(String token, String headerName) {
}
