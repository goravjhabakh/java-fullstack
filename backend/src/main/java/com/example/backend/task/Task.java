package com.example.backend.task;

public class Task {
  private long id;
  private String title;
  private boolean completed;

  public Task(long id, String title, boolean completed) {
    this.id = id;
    this.title = title;
    this.completed = completed;
  }

  public long getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public boolean isCompleted() {
    return completed;
  }
}
