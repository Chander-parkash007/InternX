package com.chanderparkash.internx.exception;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //helper method to build error response
    private ResponseEntity<Map<String, Object>> builderror(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "status", status.value(),
                "error", message,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handlesBadRequest(BadCredentialsException ex) {
        return builderror(HttpStatus.UNAUTHORIZED, "Wrong Email or Password");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors() // get all field errors
                .stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage()) // format each
                .collect(Collectors.joining(", ")); // join into one string
        return builderror(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handlesRuntime(RuntimeException ex) {
        return builderror(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> exceptionhandler(Exception ex) {
        return builderror(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
    }

}
