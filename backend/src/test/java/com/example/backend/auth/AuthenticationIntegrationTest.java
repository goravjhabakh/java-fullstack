package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.example.backend.PostgreSqlIntegrationTest;
import com.example.backend.project.Project;
import com.example.backend.project.ProjectRepository;
import com.example.backend.task.TaskRepository;
import com.example.backend.user.UserRepository;

class AuthenticationIntegrationTest extends PostgreSqlIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private AuthService authService;

  @Autowired
  private TaskRepository taskRepository;

  @Autowired
  private ProjectRepository projectRepository;

  @Autowired
  private UserRepository userRepository;

  @BeforeEach
  void clearDatabase() {
    taskRepository.deleteAll();
    projectRepository.deleteAll();
    userRepository.deleteAll();
  }

  @Test
  void anonymousProtectedRequestReturnsUnauthorized() throws Exception {
    mockMvc.perform(get("/projects"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void authenticatedUnsafeRequestWithoutCsrfReturnsForbidden() throws Exception {
    MockHttpSession session = login("alice");

    mockMvc.perform(post("/projects")
        .session(session)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Without CSRF\"}"))
        .andExpect(status().isForbidden());
  }

  @Test
  void loginCreatesAnAuthenticatedSession() throws Exception {
    MockHttpSession session = login("alice");

    mockMvc.perform(get("/auth/me").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("alice"));
  }

  @Test
  void authenticatedOwnerCanAccessOwnProjects() throws Exception {
    MockHttpSession session = login("alice");

    mockMvc.perform(get("/projects").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value("Default Project"));
  }

  @Test
  void anotherUserCannotAccessAnOwnersProject() throws Exception {
    AuthUserResponse owner = authService.register("owner", "correct horse battery staple");
    Project ownerProject = projectRepository.findAllByUserIdOrderByIdAsc(owner.id()).getFirst();
    MockHttpSession otherUserSession = login("other-user");

    mockMvc.perform(get("/projects/{id}", ownerProject.getId()).session(otherUserSession))
        .andExpect(status().isNotFound());
  }

  @Test
  void logoutInvalidatesTheSession() throws Exception {
    MockHttpSession session = login("alice");

    mockMvc.perform(post("/auth/logout").session(session).with(csrf()))
        .andExpect(status().isNoContent());

    assertThat(session.isInvalid()).isTrue();

    mockMvc.perform(get("/projects").session(session))
        .andExpect(status().isUnauthorized());
  }

  private MockHttpSession login(String username) throws Exception {
    authService.register(username, "correct horse battery staple");

    MvcResult result = mockMvc.perform(post("/auth/login")
        .with(csrf())
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("username", username)
        .param("password", "correct horse battery staple"))
        .andExpect(status().isNoContent())
        .andReturn();

    return (MockHttpSession) result.getRequest().getSession(false);
  }
}
