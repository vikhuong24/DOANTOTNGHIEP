package com.ndc.gayquy.dto.principal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Chi tiết phân bổ cho từng học sinh")
public class PrincipalDistributionDetailResponse {

    @Schema(description = "Mã chi tiết phân bổ", example = "1")
    private Long maChiTietPhanBo;

    @Schema(description = "Mã học sinh", example = "1")
    private Long maHocSinh;

    @Schema(description = "Họ tên học sinh", example = "Nguyễn Hoàng Đức")
    private String tenHocSinh;

    @Schema(description = "Lớp học", example = "Lớp 3A-KT")
    private String lop;

    @Schema(description = "Số tiền phân bổ (VNĐ)", example = "2000000.00")
    private BigDecimal soTien;

    @Schema(description = "Họ tên người nhận thay", example = "Hoàng Thị Mai (Mẹ nhận thay)")
    private String nguoiNhan;

    @Schema(description = "Thời gian nhận", example = "2026-02-10T09:30:00")
    private LocalDateTime ngayNhan;

    @Schema(description = "Ghi chú phân bổ", example = "Học bổng vượt khó kỳ 1")
    private String ghiChu;
}
