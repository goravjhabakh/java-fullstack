package com.example.backend.project;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.user.User;
import com.example.backend.user.UserRepository;

@Service
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final UserRepository userRepository;

  public ProjectService(
      ProjectRepository projectRepository,
      UserRepository userRepository) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
  }

  public List<ProjectResponse> getAllProjects(Long userId) {
    return projectRepository.findAllByUserIdOrderByIdAsc(userId)
        .stream().map(ProjectResponse::from).toList();
  }

  public ProjectResponse getProjectById(Long id, Long userId) {
    Project project = projectRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ProjectNotFoundException(id));

    return ProjectResponse.from(project);
  }

  public ProjectResponse createProject(String name, Long userId) {
    User user = userRepository.findById(userId).orElseThrow();

    Project project = new Project(name, user);
    Project savedProject = projectRepository.save(project);

    return ProjectResponse.from(savedProject);
  }
}
