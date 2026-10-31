package com.example.backend.project;

public class ProjectNotFoundException extends RuntimeException {

  public ProjectNotFoundException(Long id) {
    super("Project with id " + id + " was not found");
  }
}
