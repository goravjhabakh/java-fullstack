package com.example.backend.project;

import java.util.ArrayList;
import java.util.List;

import com.example.backend.task.Task;
import com.example.backend.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "projects")
public class Project {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
  private List<Task> tasks = new ArrayList<>();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  protected Project() {
  }

  public Project(String name, User user) {
    this.name = name;
    this.user = user;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public List<Task> getTasks() {
    return tasks;
  }

  public User getUser() {
    return user;
  }
}
