package com.example.backend.auth;

import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.project.Project;
import com.example.backend.project.ProjectRepository;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final ProjectRepository projectRepository;
  private final PasswordEncoder passwordEncoder;

  public AuthService(
      UserRepository userRepository,
      ProjectRepository projectRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public AuthUserResponse register(String username, String password) {
    String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);

    if (userRepository.existsByUsername(normalizedUsername)) {
      throw new UsernameAlreadyExistsException();
    }

    String passwordHash = passwordEncoder.encode(password);

    User user = new User(normalizedUsername, passwordHash);
    User savedUser;

    try {
      savedUser = userRepository.saveAndFlush(user);
    } catch (DataIntegrityViolationException exception) {
      throw new UsernameAlreadyExistsException();
    }

    Project defaultProject = new Project("Default Project", savedUser);
    projectRepository.save(defaultProject);

    return new AuthUserResponse(
        savedUser.getId(),
        savedUser.getUsername());
  }
}
