package com.example.backend.error;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.task.TaskNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ApiError handleValidationException(MethodArgumentNotValidException exception) {
    Map<String, String> fieldErrors = new HashMap<>();

    exception.getBindingResult().getFieldErrors()
        .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

    return new ApiError(400, "Validation failed", fieldErrors);
  }

  @ExceptionHandler(TaskNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ApiError handleTaskNotFound(TaskNotFoundException exception) {
    return new ApiError(404, exception.getMessage(), Map.of());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ApiError handleIllegalArgument(IllegalArgumentException exception) {
    return new ApiError(
        400,
        exception.getMessage(),
        Map.of());
  }
}
