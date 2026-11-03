package com.ndc.gayquy.dto.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiBaiDang;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu tạo mới bài đăng gây quỹ")
public class CreateCampaignRequest {

    @Schema(description = "Tiêu đề bài vận động tài trợ", example = "Tài trợ máy trợ thính kỹ thuật số cho học sinh lớp khiếm thính")
    @NotBlank(message = "Tiêu đề bài đăng không được để trống")
    @Size(min = 5, max = 255, message = "Tiêu đề phải từ 5 đến 255 ký tự")
    private String tieuDe;

    @Schema(description = "Nội dung bài viết chi tiết", example = "Chương trình kêu gọi tài trợ 20 bộ máy trợ thính chuyên dụng hiện đại nhằm hỗ trợ các em học sinh phục hồi chức năng nghe.")
    @NotBlank(message = "Nội dung bài đăng không được để trống")
    private String noiDung;

    @Schema(description = "Đường dẫn ảnh bìa bài viết", example = "/uploads/banners/tro-thinh-2026.jpg")
    private String anhBia;

    @Schema(description = "Số tiền mục tiêu vận động (VNĐ)", example = "120000000.00")
    @NotNull(message = "Số tiền mục tiêu không được để trống")
    @Positive(message = "Số tiền mục tiêu phải lớn hơn 0")
    @DecimalMin(value = "1000", message = "Số tiền mục tiêu tối thiểu là 1,000 VNĐ")
    @Digits(integer = 15, fraction = 2, message = "Số tiền không hợp lệ")
    private BigDecimal mucTieu;

    @Schema(description = "Trạng thái khởi tạo", example = "CHODUYET")
    private TrangThaiBaiDang trangThai;

    @Schema(description = "Thời gian bắt đầu vận động", example = "2026-11-01T08:00:00")
    private LocalDateTime ngayBatDau;

    @Schema(description = "Thời gian kết thúc vận động", example = "2026-12-31T23:59:59")
    private LocalDateTime ngayKetThuc;
}
