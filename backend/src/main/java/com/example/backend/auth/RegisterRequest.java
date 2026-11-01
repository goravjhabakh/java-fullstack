package com.example.backend.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

  @NotBlank
  @Size(min = 3, max = 50)
  private String username;

  @NotBlank
  @Size(min = 8, max = 100)
  private String password;

  public String getUsername() {
    return username;
  }

  public String getPassword() {
    return password;
  }
}
