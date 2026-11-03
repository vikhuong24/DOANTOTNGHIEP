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
@Schema(description = "Yêu cầu đăng ký ủng hộ cho một bài gây quỹ")
public class DonationRegisterRequest {

    @Schema(description = "Mã bài tài trợ cần ủng hộ", example = "1")
    @NotNull(message = "Mã bài tài trợ không được để trống")
    @Positive(message = "Mã bài tài trợ phải là số nguyên dương")
    private Long maBaiTaiTro;

    @Schema(description = "Tên hiển thị công khai trên danh sách vinh danh (để trống sẽ lấy họ tên tài khoản)", example = "Nhà hảo tâm ẩn danh")
    @Size(max = 100, message = "Tên hiển thị tối đa 100 ký tự")
    private String tenHienThi;

    @Schema(description = "Số tiền đăng ký ủng hộ (VNĐ, chỉ nhập số, tối thiểu 1,000 VNĐ)", example = "500000")
    @NotNull(message = "Số tiền đăng ký ủng hộ không được để trống")
    @Positive(message = "Số tiền đăng ký phải là số dương lớn hơn 0")
    @DecimalMin(value = "1000", message = "Số tiền đăng ký tối thiểu là 1,000 VNĐ")
    @Digits(integer = 15, fraction = 2, message = "Số tiền không hợp lệ, tối đa 15 chữ số phần nguyên và 2 chữ số phần thập phân")
    private BigDecimal soTienDk;

    @Schema(description = "Đường dẫn ảnh chụp màn hình giao dịch chuyển khoản", example = "/uploads/receipts/bill_example.jpg")
    @Size(max = 255, message = "Đường dẫn ảnh tối đa 255 ký tự")
    private String anhGiaoDich;

    @Schema(description = "Lời nhắn / Lời chúc gửi đến nhà trường và học sinh", example = "Chúc các em học sinh luôn học tập tốt")
    @Size(max = 1000, message = "Ghi chú tối đa 1,000 ký tự")
    private String ghiChu;
}
