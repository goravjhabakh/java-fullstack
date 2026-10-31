package com.example.backend.task;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class TaskService {
  private final List<Task> tasks = new ArrayList<>();
  private long nextId = 1;

  public List<Task> getAllTasks() {
    return tasks;
  }

  public Task createTask(String title) {
    Task task = new Task(nextId, title, false);
    tasks.add(task);
    nextId++;
    return task;
  }
}
