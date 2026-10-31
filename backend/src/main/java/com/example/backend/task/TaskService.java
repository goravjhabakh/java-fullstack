package com.example.backend.task;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.project.Project;
import com.example.backend.project.ProjectNotFoundException;
import com.example.backend.project.ProjectRepository;

@Service
public class TaskService {

  private final TaskRepository taskRepository;
  private final ProjectRepository projectRepository;

  public TaskService(
      TaskRepository taskRepository,
      ProjectRepository projectRepository) {
    this.taskRepository = taskRepository;
    this.projectRepository = projectRepository;
  }

  private Task getTaskEntityById(Long id) {
    return taskRepository.findById(id)
        .orElseThrow(() -> new TaskNotFoundException(id));
  }

  @Transactional(readOnly = true)
  public List<TaskResponse> getAllTasks(Boolean completed, String sortBy, String direction) {
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

    List<Task> tasks = completed == null
        ? taskRepository.findAll(sort)
        : taskRepository.findByCompleted(completed, sort);

    return tasks.stream().map(TaskResponse::from).toList();
  }

  @Transactional(readOnly = true)
  public TaskResponse getTaskById(Long id) {
    return TaskResponse.from(getTaskEntityById(id));
  }

  @Transactional
  public TaskResponse createTask(Long projectId, String title) {
    Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new ProjectNotFoundException(projectId));

    Task task = new Task(title, project);
    Task savedTask = taskRepository.save(task);

    return TaskResponse.from(savedTask);
  }

  @Transactional
  public TaskResponse updateTask(Long id, UpdateTaskRequest request) {
    Task task = getTaskEntityById(id);

    if (request.getTitle() != null) {
      task.updateTitle(request.getTitle());
    }

    if (request.getCompleted() != null) {
      task.updateCompleted(request.getCompleted());
    }

    return TaskResponse.from(task);
  }

  @Transactional
  public void deleteTask(Long id) {
    Task task = getTaskEntityById(id);
    taskRepository.delete(task);
  }
}
