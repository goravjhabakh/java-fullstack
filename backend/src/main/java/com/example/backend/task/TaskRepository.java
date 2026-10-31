package com.example.backend.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TaskRepository
    extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

  Page<Task> findByCompleted(boolean completed, Pageable pageable);

  Page<Task> findByProject_Id(Long projectId, Pageable pageable);

  Page<Task> findByCompletedAndProject_Id(
      boolean completed,
      Long projectId,
      Pageable pageable);

  Page<Task> findByTitleContainingIgnoreCase(
      String title,
      Pageable pageable);

  Page<Task> findByCompletedAndTitleContainingIgnoreCase(
      boolean completed,
      String title,
      Pageable pageable);

  Page<Task> findByProject_IdAndTitleContainingIgnoreCase(
      Long projectId,
      String title,
      Pageable pageable);

  Page<Task> findByCompletedAndProject_IdAndTitleContainingIgnoreCase(
      boolean completed,
      Long projectId,
      String title,
      Pageable pageable);
}
