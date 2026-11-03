package com.ndc.gayquy.dto.donor;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dữ liệu cập nhật hồ sơ cá nhân (chỉ điền trường cần thay đổi, bỏ qua nếu giữ nguyên)")
public class UpdateProfileRequest {

    @Schema(description = "Họ tên mới (để trống nếu giữ nguyên)", example = "Nguyễn Văn Nam")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String hoTen;

    @Schema(description = "Địa chỉ email mới (để trống nếu giữ nguyên)", example = "nam.nguyen@gmail.com")
    @Pattern(regexp = "^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$",
            message = "Email không đúng định dạng (Ví dụ: example@domain.com)")
    private String email;

    @Schema(description = "Số điện thoại mới (10 chữ số, bắt đầu bằng 0, để trống nếu giữ nguyên)", example = "0908123456")
    @Pattern(regexp = "^$|^0\\d{9}$",
            message = "Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và bao gồm đúng 10 chữ số")
    private String sdt;

    @Schema(description = "Địa chỉ mới (để trống nếu giữ nguyên)", example = "123 Nguyễn Thị Minh Khai, Q.1, TP.HCM")
    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String diaChi;
}
