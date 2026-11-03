package com.ndc.gayquy.dto.fundraiser;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu xác nhận đã nhận tiền đóng góp tài trợ")
public class ConfirmDonationRequest {

    @Schema(description = "Số tiền thực tế đã nhận (VNĐ, để trống sẽ lấy theo số tiền đăng ký soitendk)", example = "15000000.00")
    @Positive(message = "Số tiền thực nhận phải lớn hơn 0")
    @DecimalMin(value = "1000", message = "Số tiền tối thiểu là 1,000 VNĐ")
    @Digits(integer = 15, fraction = 2, message = "Số tiền không hợp lệ")
    private BigDecimal soTienTt;

    @Schema(description = "Ghi chú đối soát của cán bộ", example = "Đã khớp lệnh với sao kê tài khoản ngân hàng VCB ngày 01/03")
    private String ghiChu;
}
