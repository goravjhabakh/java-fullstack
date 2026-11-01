package com.example.backend.task;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.auth.AppUserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/tasks")
public class TaskController {

  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  @GetMapping
  public TaskPageResponse getAllTasks(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) Boolean completed,
      @RequestParam(required = false) Long projectId,
      @RequestParam(required = false) String title,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "asc") String direction,
      @AuthenticationPrincipal AppUserPrincipal principal) {

    return taskService.getAllTasks(
        page,
        size,
        completed,
        projectId,
        title,
        sortBy,
        direction,
        principal.getUserId());
  }

  @GetMapping("/{id}")
  public TaskResponse getTaskById(
      @PathVariable Long id,
      @AuthenticationPrincipal AppUserPrincipal principal) {

    return taskService.getTaskById(id, principal.getUserId());
  }

  @PatchMapping("/{id}")
  public TaskResponse updateTask(
      @PathVariable Long id,
      @Valid @RequestBody UpdateTaskRequest request,
      @AuthenticationPrincipal AppUserPrincipal principal) {

    return taskService.updateTask(
        id,
        request,
        principal.getUserId());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteTask(
      @PathVariable Long id,
      @AuthenticationPrincipal AppUserPrincipal principal) {

    taskService.deleteTask(id, principal.getUserId());
  }
}
