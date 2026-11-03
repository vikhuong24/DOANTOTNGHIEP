package com.ndc.gayquy.controller.principal;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.principal.FinancialReportResponse;
import com.ndc.gayquy.service.principal.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("principalReportController")
@RequestMapping("/principal/reports")
@RequiredArgsConstructor
@Tag(name = "Principal", description = "Các API dành cho Hiệu trưởng (Phê duyệt bài đăng, Phê duyệt đợt phân bổ, Báo cáo tài chính, Giám sát phản hồi)")
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Báo cáo tài chính tổng hợp gây quỹ và giải ngân",
            description = "Trả về tổng tiền quyên góp, tổng tiền giải ngân, số dư quỹ và thống kê chi tiết từng tháng (sử dụng câu lệnh Query GROUP BY).")
    @GetMapping("/financial")
    public ApiResponse<FinancialReportResponse> getFinancialReport() {
        FinancialReportResponse response = reportService.getFinancialReport();
        return ApiResponse.success("Lấy báo cáo tài chính thành công", response);
    }
}
