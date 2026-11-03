package com.ndc.gayquy.dto.guest;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu đăng ký tài khoản Nhà hảo tâm mới")
public class RegisterRequest {

    @Schema(description = "Họ và tên người dùng", example = "Trần Minh Tâm")
    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2 đến 100 ký tự")
    private String hoTen;

    @Schema(description = "Địa chỉ email (dùng để đăng nhập)", example = "minhtam.tran@gmail.com")
    @NotBlank(message = "Email không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$",
            message = "Email không đúng định dạng (Ví dụ: example@domain.com)")
    private String email;

    @Schema(description = "Số điện thoại liên hệ (10 chữ số, bắt đầu bằng 0)", example = "0907777888")
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$",
            message = "Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và bao gồm đúng 10 chữ số")
    private String sdt;

    @Schema(description = "Mật khẩu đăng nhập (tối thiểu 6 ký tự)", example = "123456")
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 50, message = "Mật khẩu phải từ 6 đến 50 ký tự")
    private String matKhau;
}
