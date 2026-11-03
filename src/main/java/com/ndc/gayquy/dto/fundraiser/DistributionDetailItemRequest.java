package com.ndc.gayquy.dto.fundraiser;

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
@Schema(description = "Chi tiết phân bổ cho từng học sinh")
public class DistributionDetailItemRequest {

    @Schema(description = "Mã học sinh nhận hỗ trợ", example = "1")
    @NotNull(message = "Mã học sinh không được để trống")
    @Positive(message = "Mã học sinh phải là số nguyên dương")
    private Long maHocSinh;

    @Schema(description = "Số tiền phân bổ cho học sinh (VNĐ)", example = "2000000.00")
    @NotNull(message = "Số tiền phân bổ không được để trống")
    @Positive(message = "Số tiền phân bổ phải lớn hơn 0")
    @DecimalMin(value = "1000", message = "Số tiền phân bổ tối thiểu là 1,000 VNĐ")
    @Digits(integer = 15, fraction = 2, message = "Số tiền không hợp lệ")
    private BigDecimal soTien;

    @Schema(description = "Họ tên người nhận thay (nếu có)", example = "Hoàng Thị Mai (Mẹ nhận thay)")
    private String nguoiNhan;

    @Schema(description = "Ghi chú phân bổ", example = "Học bổng vượt khó kỳ 1")
    private String ghiChu;
}
