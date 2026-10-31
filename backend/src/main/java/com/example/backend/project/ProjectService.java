package com.example.backend.project;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {

  private final ProjectRepository projectRepository;

  public ProjectService(ProjectRepository projectRepository) {
    this.projectRepository = projectRepository;
  }

  public List<ProjectResponse> getAllProjects() {
    return projectRepository.findAll(Sort.by(Sort.Direction.ASC, Project::getId))
        .stream().map(ProjectResponse::from).toList();
  }

  public ProjectResponse getProjectById(Long id) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new ProjectNotFoundException(id));

    return ProjectResponse.from(project);
  }

  public ProjectResponse createProject(String name) {
    Project project = new Project(name);
    Project savedProject = projectRepository.save(project);

    return ProjectResponse.from(savedProject);
  }
}
