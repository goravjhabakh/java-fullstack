package com.example.backend.task;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

@Service
public class TaskService {

  private final TaskRepository taskRepository;

  public TaskService(TaskRepository taskRepository) {
    this.taskRepository = taskRepository;
  }

  public List<Task> getAllTasks(Boolean completed, String sortBy, String direction) {
    String sortField = switch (sortBy) {
      case "id", "title", "completed" -> sortBy;
      default -> throw new IllegalArgumentException("Invalid sortBy value");
    };

    Sort.Direction sortDirection = switch (direction.toLowerCase()) {
      case "asc" -> Sort.Direction.ASC;
      case "desc" -> Sort.Direction.DESC;
      default -> throw new IllegalArgumentException("Invalid direction value");
    };

    Sort sort = Sort.by(sortDirection, sortField);

    if (completed == null) {
      return taskRepository.findAll(sort);
    }

    return taskRepository.findByCompleted(completed, sort);
  }

  public Task getTaskById(Long id) {
    return taskRepository.findById(id)
        .orElseThrow(() -> new TaskNotFoundException(id));
  }

  public Task createTask(String title) {
    Task task = new Task(title);
    return taskRepository.save(task);
  }

  @Transactional
  public Task updateTask(Long id, UpdateTaskRequest request) {
    Task task = getTaskById(id);

    if (request.getTitle() != null) {
      task.updateTitle(request.getTitle());
    }

    if (request.getCompleted() != null) {
      task.updateCompleted(request.getCompleted());
    }

    return task;
  }

  @Transactional
  public void deleteTask(Long id) {
    Task task = getTaskById(id);
    taskRepository.delete(task);
  }
}
