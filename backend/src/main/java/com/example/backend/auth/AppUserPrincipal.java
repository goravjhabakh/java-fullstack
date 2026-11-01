package com.example.backend.auth;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.backend.user.User;

public class AppUserPrincipal implements UserDetails {

  private final Long userId;
  private final String username;
  private final String password;
  private final boolean enabled;

  public AppUserPrincipal(User user) {
    this.userId = user.getId();
    this.username = user.getUsername();
    this.password = user.getPasswordHash();
    this.enabled = user.isEnabled();
  }

  public Long getUserId() {
    return userId;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_USER"));
  }

  @Override
  public String getPassword() {
    return password;
  }

  @Override
  public String getUsername() {
    return username;
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }
}
