package com.ndc.gayquy.common.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.ndc.gayquy.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode.getCode(), exception.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
    }

    /**
     * Bắt lỗi khi dữ liệu vi phạm annotation @Valid (@Pattern, @Email, @Size, @NotNull, @DecimalMin...)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(
                ApiResponse.<Map<String, String>>builder()
                        .code(ErrorCode.INVALID_KEY.getCode())
                        .message("Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại các trường thông tin!")
                        .result(errors)
                        .build()
        );
    }

    /**
     * Bắt lỗi khi nhập chữ cái vào trường số / tiền (BigDecimal, Long, Integer...) hoặc JSON sai định dạng
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<String>> handleHttpMessageNotReadable(HttpMessageNotReadableException exception) {
        Throwable cause = exception.getCause();
        if (cause instanceof InvalidFormatException invalidFormatEx) {
            Class<?> targetType = invalidFormatEx.getTargetType();
            String fieldName = invalidFormatEx.getPath().isEmpty() ? "dữ liệu" : invalidFormatEx.getPath().get(0).getFieldName();

            if (Number.class.isAssignableFrom(targetType) || BigDecimal.class.isAssignableFrom(targetType)) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error(ErrorCode.INVALID_AMOUNT.getCode(),
                                "Trường [" + fieldName + "] không hợp lệ: Số tiền/chỉ số chỉ được nhập số, không được chứa chữ cái hoặc ký tự đặc biệt!")
                );
            }
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(ErrorCode.INVALID_KEY.getCode(),
                            "Trường [" + fieldName + "] sai kiểu dữ liệu yêu cầu!")
            );
        }

        return ResponseEntity.badRequest().body(
                ApiResponse.error(ErrorCode.INVALID_KEY.getCode(),
                        "Dữ liệu JSON gửi lên không đúng định dạng chuẩn!")
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<String>> handleConstraintViolation(ConstraintViolationException exception) {
        return ResponseEntity.badRequest().body(
                ApiResponse.error(ErrorCode.INVALID_KEY.getCode(), exception.getMessage())
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception exception) {
        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatus())
                .body(ApiResponse.error(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode(), exception.getMessage()));
    }
}
