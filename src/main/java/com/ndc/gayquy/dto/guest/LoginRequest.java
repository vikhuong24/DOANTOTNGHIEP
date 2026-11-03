package com.ndc.gayquy.dto.guest;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu đăng nhập hệ thống")
public class LoginRequest {

    @Schema(description = "Email (đối với Nhà hảo tâm) hoặc Tên đăng nhập (đối với Phụ huynh, Cán bộ, Hiệu trưởng, Admin)", example = "minhtam.tran@gmail.com")
    @NotBlank(message = "Tên đăng nhập hoặc Email không được để trống")
    private String usernameOrEmail;

    @Schema(description = "Mật khẩu tài khoản", example = "123456")
    @NotBlank(message = "Mật khẩu không được để trống")
    private String matKhau;
}
