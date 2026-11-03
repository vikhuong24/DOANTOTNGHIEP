package com.ndc.gayquy.controller.guest;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.guest.AuthResponse;
import com.ndc.gayquy.dto.guest.LoginRequest;
import com.ndc.gayquy.dto.guest.RegisterRequest;
import com.ndc.gayquy.service.guest.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/guest")
@RequiredArgsConstructor
@Tag(name = "Guest", description = "Các API dành cho Khách vãng lai (Đăng ký, Đăng nhập, Bài đăng gây quỹ, Sao kê, Học sinh)")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Đăng ký tài khoản Nhà hảo tâm (Donor)",
            description = "Đăng ký tài khoản mới cho Nhà hảo tâm. Tên đăng nhập mặc định là null, đăng nhập sau này bằng email.")
    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.success("Đăng ký tài khoản Nhà hảo tâm thành công", response);
    }

    @Operation(summary = "Đăng nhập hệ thống (Xử lý thông minh cho mọi tác nhân)",
            description = "Nếu truyền chuỗi chứa ký tự '@' thì hệ thống tự động xác thực bằng Email (Nhà hảo tâm), ngược lại xác thực bằng Tên đăng nhập (Phụ huynh, Cán bộ, Hiệu trưởng, Admin).")
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.success("Đăng nhập thành công", response);
    }
}
