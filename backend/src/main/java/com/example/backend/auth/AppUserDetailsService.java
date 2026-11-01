package com.example.backend.auth;

import java.util.Locale;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.backend.user.User;
import com.example.backend.user.UserRepository;

@Service
public class AppUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  public AppUserDetailsService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String username) {
    String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);

    User user = userRepository.findByUsername(normalizedUsername)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    return new AppUserPrincipal(user);
  }
}
