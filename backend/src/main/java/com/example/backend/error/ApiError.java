package com.example.backend.error;

import java.util.Map;

public class ApiError {
  private int status;
  private String message;
  private Map<String, String> fieldErrors;

  public ApiError(int status, String message, Map<String, String> fieldErrors) {
    this.status = status;
    this.message = message;
    this.fieldErrors = fieldErrors;
  }

  public int getStatus() {
    return status;
  }

  public String getMessage() {
    return message;
  }

  public Map<String, String> getFieldErrors() {
    return fieldErrors;
  }
}
