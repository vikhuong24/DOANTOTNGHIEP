package com.ndc.gayquy.controller.fundraiser;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.fundraiser.CreateDistributionRequest;
import com.ndc.gayquy.dto.fundraiser.DistributionResponse;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.fundraiser.DistributionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("fundraiserDistributionController")
@RequestMapping("/fundraiser/distributions")
@RequiredArgsConstructor
@Tag(name = "Fundraiser", description = "Các API dành cho Cán bộ quản lý gây quỹ (Bài đăng, Duyệt đề xuất & xác nhận tiền, Phân bổ, Minh chứng, Phản hồi)")
public class DistributionController {

    private final DistributionService distributionService;

    @Operation(summary = "Tạo đợt phân bổ kinh phí và chi tiết phân bổ cho học sinh",
            description = "Lập kế hoạch đợt phân bổ mới (DOTPHANBO) kèm danh sách phân bổ cho từng học sinh (CT_PHANBO) với trạng thái 'ChoDuyet' để chờ Ban giám hiệu duyệt.")
    @PostMapping
    public ApiResponse<DistributionResponse> createDistribution(@Valid @RequestBody CreateDistributionRequest request) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        DistributionResponse response = distributionService.createDistribution(canBoId, request);
        return ApiResponse.success("Tạo đợt phân bổ thành công (trạng thái ChoDuyet)", response);
    }

    @Operation(summary = "Lấy danh sách các đợt phân bổ",
            description = "Trả về danh sách toàn bộ các đợt phân bổ kinh phí trong hệ thống.")
    @GetMapping
    public ApiResponse<List<DistributionResponse>> getAllDistributions() {
        List<DistributionResponse> response = distributionService.getAllDistributions();
        return ApiResponse.success(response);
    }

    @Operation(summary = "Xem chi tiết đợt phân bổ kèm danh sách học sinh",
            description = "Lấy chi tiết đợt phân bổ theo ID kèm theo toàn bộ danh sách học sinh nhận kinh phí hỗ trợ.")
    @GetMapping("/{id}")
    public ApiResponse<DistributionResponse> getDistributionDetail(
            @Parameter(description = "Mã đợt phân bổ", example = "1")
            @PathVariable("id") Long id
    ) {
        DistributionResponse response = distributionService.getDistributionDetail(id);
        return ApiResponse.success(response);
    }
}
