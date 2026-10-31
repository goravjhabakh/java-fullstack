package com.example.backend.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateProjectRequest {

  @NotBlank(message = "Project name is required")
  @Size(max = 100, message = "Project name must be at most 100 characters")
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
