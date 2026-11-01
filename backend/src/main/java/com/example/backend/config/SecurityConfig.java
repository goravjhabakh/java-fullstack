package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

import jakarta.servlet.DispatcherType;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
            .requestMatchers("/auth/register", "/auth/login", "/auth/csrf").permitAll()
            .requestMatchers("/auth/me", "/projects/**", "/tasks/**").authenticated()
            .anyRequest().authenticated())
        .formLogin(form -> form
            .loginProcessingUrl("/auth/login")
            .successHandler((request, response, authentication) -> {
              response.setStatus(HttpStatus.NO_CONTENT.value());
            })
            .failureHandler((request, response, authentication) -> {
              response.setStatus(HttpStatus.UNAUTHORIZED.value());
            }))
        .logout(logout -> logout
            .logoutUrl("/auth/logout")
            .logoutSuccessHandler((request, response, authentication) -> {
              response.setStatus(HttpStatus.NO_CONTENT.value());
            }))
        .httpBasic(basic -> basic.disable())
        .cors(cors -> {
        })
        .exceptionHandling(exceptions -> exceptions
            .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));

    return http.build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
