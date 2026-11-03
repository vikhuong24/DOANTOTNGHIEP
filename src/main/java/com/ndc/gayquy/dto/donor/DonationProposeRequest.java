package com.ndc.gayquy.dto.donor;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu đề xuất tài trợ mới")
public class DonationProposeRequest {

    @Schema(description = "Mã bài tài trợ liên quan (nếu có, để trống nếu đề xuất hạng mục mới ngoài danh sách)", example = "1")
    @Positive(message = "Mã bài tài trợ phải là số nguyên dương")
    private Long maBaiTaiTro;

    @Schema(description = "Tiêu đề đề xuất tài trợ", example = "Tài trợ 20 bộ bàn ghế chống cận thị cho lớp 1")
    @NotBlank(message = "Tiêu đề đề xuất tài trợ không được để trống")
    @Size(min = 5, max = 255, message = "Tiêu đề đề xuất phải từ 5 đến 255 ký tự")
    private String tieuDe;

    @Schema(description = "Số tiền đề xuất tài trợ (VNĐ, chỉ nhập số, tối thiểu 1,000 VNĐ)", example = "30000000")
    @NotNull(message = "Số tiền đề xuất không được để trống")
    @Positive(message = "Số tiền đề xuất phải là số dương lớn hơn 0")
    @DecimalMin(value = "1000", message = "Số tiền đề xuất tối thiểu là 1,000 VNĐ")
    @Digits(integer = 15, fraction = 2, message = "Số tiền không hợp lệ, tối đa 15 chữ số phần nguyên và 2 chữ số phần thập phân")
    private BigDecimal soTienDx;

    @Schema(description = "Mục đích sử dụng chi tiết của khoản tài trợ", example = "Trang bị bàn ghế phù hợp tiêu chuẩn cho trẻ khiếm thị can thiệp sớm")
    @NotBlank(message = "Mục đích sử dụng tài trợ không được để trống")
    @Size(min = 10, max = 2000, message = "Mục đích sử dụng phải từ 10 đến 2,000 ký tự")
    private String mucDichSd;
}
