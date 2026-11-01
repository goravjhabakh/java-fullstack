package com.example.backend.task;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TaskRepository
    extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

  Optional<Task> findByIdAndProjectUserId(Long id, Long userId);
}
