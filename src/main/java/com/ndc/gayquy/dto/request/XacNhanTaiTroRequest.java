package com.ndc.gayquy.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu xác nhận đóng góp tài trợ thực tế")
public class XacNhanTaiTroRequest {

    @Schema(description = "Số tiền thực nhận (VNĐ, chỉ nhập số, không chứa chữ cái)", example = "500000")
    @NotNull(message = "Số tiền thực tế không được để trống")
    @Positive(message = "Số tiền thực nhận phải là số dương lớn hơn 0")
    @DecimalMin(value = "1000", message = "Số tiền thực nhận tối thiểu là 1,000 VNĐ")
    @Digits(integer = 15, fraction = 2, message = "Số tiền không hợp lệ, tối đa 15 chữ số phần nguyên và 2 chữ số phần thập phân")
    private BigDecimal soTienThucTe;

    @Schema(description = "Ghi chú của cán bộ xác nhận", example = "Đã khớp sao kê ngân hàng VCB")
    private String ghiChu;
}
