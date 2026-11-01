package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.backend.project.Project;
import com.example.backend.project.ProjectRepository;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private ProjectRepository projectRepository;

  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  private AuthService authService;

  @Captor
  private ArgumentCaptor<User> userCaptor;

  @Captor
  private ArgumentCaptor<Project> projectCaptor;

  @BeforeEach
  void setUp() {
    authService = new AuthService(userRepository, projectRepository, passwordEncoder);
  }

  @Test
  void registerStoresABcryptHashAndCreatesAnOwnedDefaultProject() {
    when(userRepository.existsByUsername("alice")).thenReturn(false);
    when(userRepository.saveAndFlush(any(User.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    authService.register("Alice", "correct horse battery staple");

    verify(userRepository).saveAndFlush(userCaptor.capture());
    User savedUser = userCaptor.getValue();

    assertThat(savedUser.getUsername()).isEqualTo("alice");
    assertThat(savedUser.getPasswordHash()).isNotEqualTo("correct horse battery staple");
    assertThat(passwordEncoder.matches("correct horse battery staple", savedUser.getPasswordHash()))
        .isTrue();

    verify(projectRepository).save(projectCaptor.capture());
    Project defaultProject = projectCaptor.getValue();

    assertThat(defaultProject.getName()).isEqualTo("Default Project");
    assertThat(defaultProject.getUser()).isSameAs(savedUser);
  }
}
