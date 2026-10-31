package com.example.backend.task;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/tasks")
public class TaskController {
  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  @GetMapping
  public List<Task> getAllTasks(
      @RequestParam(required = false) Boolean completed,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "asc") String direction) {
    return taskService.getAllTasks(completed, sortBy, direction);
  }

  @GetMapping("/{id}")
  public Task getTaskById(@PathVariable Long id) {
    return taskService.getTaskById(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Task createTask(@Valid @RequestBody CreateTaskRequest request) {
    return taskService.createTask(request.getTitle());
  }

  @PatchMapping("/{id}")
  public Task updateTask(
      @PathVariable Long id,
      @Valid @RequestBody UpdateTaskRequest request) {
    return taskService.updateTask(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteTask(@PathVariable Long id) {
    taskService.deleteTask(id);
  }
}
