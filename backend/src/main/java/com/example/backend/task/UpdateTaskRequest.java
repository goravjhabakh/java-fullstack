package com.example.backend.task;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateTaskRequest {

  @Pattern(regexp = ".*\\S.*", message = "Title is required")
  @Size(max = 100, message = "Title must be at most 100 characters")
  private String title;

  private Boolean completed;

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public Boolean getCompleted() {
    return completed;
  }

  public void setCompleted(Boolean completed) {
    this.completed = completed;
  }
}
