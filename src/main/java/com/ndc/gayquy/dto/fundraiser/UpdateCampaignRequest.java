package com.ndc.gayquy.dto.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiBaiTaiTro;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
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
@Schema(description = "Yêu cầu cập nhật bài đăng gây quỹ")
public class UpdateCampaignRequest {

    @Schema(description = "Tiêu đề bài vận động", example = "Tài trợ máy trợ thính kỹ thuật số cho học sinh lớp khiếm thính (Đợt 1)")
    @Size(min = 5, max = 255, message = "Tiêu đề phải từ 5 đến 255 ký tự")
    private String tieuDe;

    @Schema(description = "Nội dung bài viết chi tiết", example = "Cập nhật bổ sung thông tin các em học sinh nhận hỗ trợ máy trợ thính...")
    private String noiDung;

    @Schema(description = "Đường dẫn ảnh bìa bài viết", example = "/uploads/banners/tro-thinh-cap-nhat.jpg")
    private String anhBia;

    @Schema(description = "Số tiền mục tiêu vận động (VNĐ)", example = "150000000.00")
    @Positive(message = "Số tiền mục tiêu phải lớn hơn 0")
    @DecimalMin(value = "1000", message = "Số tiền mục tiêu tối thiểu là 1,000 VNĐ")
    @Digits(integer = 15, fraction = 2, message = "Số tiền không hợp lệ")
    private BigDecimal mucTieu;

    @Schema(description = "Trạng thái bài tài trợ", example = "DANG_VAN_DONG")
    private TrangThaiBaiTaiTro trangThai;

    @Schema(description = "Thời gian bắt đầu vận động", example = "2026-11-01T08:00:00")
    private LocalDateTime ngayBatDau;

    @Schema(description = "Thời gian kết thúc vận động", example = "2026-12-31T23:59:59")
    private LocalDateTime ngayKetThuc;
}
