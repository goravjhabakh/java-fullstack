package com.example.backend.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTaskRequest {

  @NotBlank(message = "Title is required")
  @Size(max = 100, message = "Title must be at most 100 characters")
  private String title;

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }
}
