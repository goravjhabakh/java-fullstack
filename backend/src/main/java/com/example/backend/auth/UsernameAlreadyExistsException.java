package com.example.backend.auth;

public class UsernameAlreadyExistsException extends RuntimeException {

  public UsernameAlreadyExistsException() {
    super("Username already exists");
  }
}
