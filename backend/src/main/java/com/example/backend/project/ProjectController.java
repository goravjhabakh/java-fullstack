package com.example.backend.project;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.task.CreateTaskRequest;
import com.example.backend.task.TaskResponse;
import com.example.backend.task.TaskService;

@RestController
@RequestMapping("/projects")
public class ProjectController {

  private final ProjectService projectService;
  private final TaskService taskService;

  public ProjectController(
      ProjectService projectService,
      TaskService taskService) {
    this.projectService = projectService;
    this.taskService = taskService;
  }

  @GetMapping
  public List<ProjectResponse> getAllProjects() {
    return projectService.getAllProjects();
  }

  @GetMapping("/{id}")
  public ProjectResponse getProjectById(@PathVariable Long id) {
    return projectService.getProjectById(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ProjectResponse createProject(
      @Valid @RequestBody CreateProjectRequest request) {
    return projectService.createProject(request.getName());
  }

  @PostMapping("/{projectId}/tasks")
  @ResponseStatus(HttpStatus.CREATED)
  public TaskResponse createTask(
      @PathVariable Long projectId,
      @Valid @RequestBody CreateTaskRequest request) {
    return taskService.createTask(projectId, request.getTitle());
  }
}
