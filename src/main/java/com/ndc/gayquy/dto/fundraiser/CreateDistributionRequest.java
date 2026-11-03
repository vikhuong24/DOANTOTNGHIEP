package com.ndc.gayquy.dto.fundraiser;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu tạo đợt phân bổ và chi tiết phân bổ cho học sinh")
public class CreateDistributionRequest {

    @Schema(description = "Mã bài tài trợ nguồn kinh phí", example = "2")
    @NotNull(message = "Mã bài tài trợ không được để trống")
    @Positive(message = "Mã bài tài trợ phải là số nguyên dương")
    private Long maBaiTaiTro;

    @Schema(description = "Tên đợt phân bổ", example = "Đợt 3 - Trao học bổng chuyên biệt quý 2 năm học 2026")
    @NotBlank(message = "Tên đợt phân bổ không được để trống")
    @Size(min = 5, max = 255, message = "Tên đợt phân bổ phải từ 5 đến 255 ký tự")
    private String tenDot;

    @Schema(description = "Thời gian dự kiến trao", example = "2026-05-15T09:00:00")
    private LocalDateTime ngayTrao;

    @Schema(description = "Danh sách chi tiết phân bổ cho các học sinh")
    @NotEmpty(message = "Danh sách phân bổ học sinh không được để trống")
    @Valid
    private List<DistributionDetailItemRequest> chiTietPhanBo;
}
