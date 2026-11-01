package com.example.backend.task;

import org.springframework.data.jpa.domain.Specification;

public final class TaskSpecifications {

  private TaskSpecifications() {
  }

  public static Specification<Task> belongsToUser(Long userId) {
    return (root, query, criteriaBuilder) -> criteriaBuilder.equal(
        root.get("project").get("user").get("id"),
        userId);
  }

  public static Specification<Task> hasCompleted(Boolean completed) {
    return (root, query, criteriaBuilder) -> {
      if (completed == null) {
        return criteriaBuilder.conjunction();
      }

      return criteriaBuilder.equal(root.get("completed"), completed);
    };
  }

  public static Specification<Task> hasProjectId(Long projectId) {
    return (root, query, criteriaBuilder) -> {
      if (projectId == null) {
        return criteriaBuilder.conjunction();
      }

      return criteriaBuilder.equal(
          root.get("project").get("id"),
          projectId);
    };
  }

  public static Specification<Task> titleContains(String title) {
    return (root, query, criteriaBuilder) -> {
      if (title == null) {
        return criteriaBuilder.conjunction();
      }

      return criteriaBuilder.like(
          criteriaBuilder.lower(root.get("title")),
          "%" + title.toLowerCase() + "%");
    };
  }
}
