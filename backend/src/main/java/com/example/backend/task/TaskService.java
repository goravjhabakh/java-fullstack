package com.example.backend.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
  public TaskPageResponse getAllTasks(
      int page,
      int size,
      Boolean completed,
      Long projectId,
      String title,
      String sortBy,
      String direction) {

    if (page < 0) {
      throw new IllegalArgumentException("Page must be 0 or greater");
    }

    if (size < 1 || size > 100) {
      throw new IllegalArgumentException("Size must be between 1 and 100");
    }

    if (projectId != null && projectId < 1) {
      throw new IllegalArgumentException("Project ID must be 1 or greater");
    }

    String normalizedTitle = null;

    if (title != null) {
      String trimmedTitle = title.trim();

      if (!trimmedTitle.isEmpty()) {
        normalizedTitle = trimmedTitle;
      }
    }

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

    if (!sortField.equals("id")) {
      sort = sort.and(Sort.by(Sort.Direction.ASC, Task::getId));
    }

    Specification<Task> specification = TaskSpecifications.hasCompleted(completed)
        .and(TaskSpecifications.hasProjectId(projectId))
        .and(TaskSpecifications.titleContains(normalizedTitle));

    Pageable pageable = PageRequest.of(page, size, sort);
    Page<Task> taskPage = taskRepository.findAll(specification, pageable);
    Page<TaskResponse> responsePage = taskPage.map(TaskResponse::from);

    return new TaskPageResponse(
        responsePage.getContent(),
        responsePage.getNumber(),
        responsePage.getSize(),
        responsePage.getNumberOfElements(),
        responsePage.getTotalElements(),
        responsePage.getTotalPages(),
        responsePage.isFirst(),
        responsePage.isLast());
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
