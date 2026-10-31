package com.example.backend.project;

public class ProjectResponse {

  private Long id;
  private String name;

  public ProjectResponse(Long id, String name) {
    this.id = id;
    this.name = name;
  }

  public static ProjectResponse from(Project project) {
    return new ProjectResponse(
        project.getId(),
        project.getName());
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }
}
