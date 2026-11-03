package com.ndc.gayquy.dto.principal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Báo cáo tổng hợp tài chính gây quỹ và giải ngân")
public class FinancialReportResponse {

    @Schema(description = "Tổng tiền đã nhận quyên góp (VNĐ)", example = "220000000.00")
    private BigDecimal tongTienQuyenGop;

    @Schema(description = "Tổng tiền đã giải ngân trao hỗ trợ (VNĐ)", example = "100000000.00")
    private BigDecimal tongTienGiaiNgan;

    @Schema(description = "Số dư quỹ hiện tại (VNĐ)", example = "120000000.00")
    private BigDecimal soDuQuyHienTai;

    @Schema(description = "Tổng số lượt đóng góp thành công", example = "4")
    private Long tongSoLuotQuyenGop;

    @Schema(description = "Tổng số học sinh đã nhận hỗ trợ", example = "5")
    private Long tongSoHocSinhNhanHoTro;

    @Schema(description = "Danh sách thống kê tài chính theo từng tháng (GROUP BY)")
    private List<MonthlyFinancialSummaryResponse> thongKeTheoThang;
}
