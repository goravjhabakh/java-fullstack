package com.example.backend.task;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

  private final TaskRepository taskRepository;

  public TaskService(TaskRepository taskRepository) {
    this.taskRepository = taskRepository;
  }

  public List<Task> getAllTasks() {
    return taskRepository.findAll(Sort.by(Sort.Direction.ASC, Task::getId));
  }

  public Task createTask(String title) {
    Task task = new Task(title);
    return taskRepository.save(task);
  }
}
