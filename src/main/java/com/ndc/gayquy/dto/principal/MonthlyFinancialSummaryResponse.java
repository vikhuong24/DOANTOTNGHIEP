package com.ndc.gayquy.dto.principal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thống kê tài chính chi tiết theo từng tháng")
public class MonthlyFinancialSummaryResponse {

    @Schema(description = "Năm", example = "2026")
    private Integer nam;

    @Schema(description = "Tháng", example = "2")
    private Integer thang;

    @Schema(description = "Tháng/Năm hiển thị", example = "02/2026")
    private String thangNam;

    @Schema(description = "Tổng tiền quyên góp nhận được trong tháng (VNĐ)", example = "135000000.00")
    private BigDecimal tongTienQuyenGop;

    @Schema(description = "Tổng tiền giải ngân trao hỗ trợ trong tháng (VNĐ)", example = "50000000.00")
    private BigDecimal tongTienGiaiNgan;

    @Schema(description = "Chênh lệch thu - chi trong tháng (VNĐ)", example = "85000000.00")
    private BigDecimal chenhLech;
}
