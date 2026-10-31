package com.example.backend.task;

public class TaskResponse {

  private Long id;
  private String title;
  private boolean completed;
  private Long projectId;

  public TaskResponse(Long id, String title, boolean completed, Long projectId) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.projectId = projectId;
  }

  public static TaskResponse from(Task task) {
    return new TaskResponse(
        task.getId(),
        task.getTitle(),
        task.isCompleted(),
        task.getProject().getId());
  }

  public Long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public boolean isCompleted() {
    return completed;
  }

  public Long getProjectId() {
    return projectId;
  }
}
