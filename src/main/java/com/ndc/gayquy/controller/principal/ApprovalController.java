package com.ndc.gayquy.controller.principal;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.principal.PrincipalCampaignResponse;
import com.ndc.gayquy.dto.principal.PrincipalDecisionRequest;
import com.ndc.gayquy.dto.principal.PrincipalDistributionResponse;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.principal.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("principalApprovalController")
@RequestMapping("/principal/approvals")
@RequiredArgsConstructor
@Tag(name = "Principal", description = "Các API dành cho Hiệu trưởng (Phê duyệt bài đăng, Phê duyệt đợt phân bổ, Báo cáo tài chính, Giám sát phản hồi)")
public class ApprovalController {

    private final ApprovalService approvalService;

    // ==========================================
    // 1. DUYỆT BÀI ĐĂNG KÊU GỌI
    // ==========================================

    @Operation(summary = "Lấy danh sách bài đăng gây quỹ chờ duyệt",
            description = "Trả về danh sách các bài đăng gây quỹ do cán bộ tạo đang ở trạng thái 'ChoDuyet'.")
    @GetMapping("/campaigns")
    public ApiResponse<List<PrincipalCampaignResponse>> getPendingCampaigns() {
        List<PrincipalCampaignResponse> response = approvalService.getPendingCampaigns();
        return ApiResponse.success(response);
    }

    @Operation(summary = "Duyệt hoặc từ chối bài đăng gây quỹ",
            description = "Hiệu trưởng xem xét và phê duyệt (trangthai = 'DaDuyet') hoặc từ chối (trangthai = 'TuChoi').")
    @PutMapping("/campaigns/{id}")
    public ApiResponse<PrincipalCampaignResponse> decideCampaign(
            @Parameter(description = "Mã bài tài trợ", example = "1")
            @PathVariable("id") Long id,
            @Valid @RequestBody PrincipalDecisionRequest request
    ) {
        Long hieuTruongId = SecurityUtils.getCurrentUserId();
        PrincipalCampaignResponse response = approvalService.decideCampaign(id, hieuTruongId, request);
        return ApiResponse.success("Xét duyệt bài đăng thành công", response);
    }

    // ==========================================
    // 2. DUYỆT ĐỢT PHÂN BỔ KINH PHÍ
    // ==========================================

    @Operation(summary = "Lấy danh sách đợt phân bổ kinh phí chờ duyệt",
            description = "Trả về danh sách các đợt phân bổ do cán bộ lập kế hoạch đang ở trạng thái 'ChoDuyet'.")
    @GetMapping("/distributions")
    public ApiResponse<List<PrincipalDistributionResponse>> getPendingDistributions() {
        List<PrincipalDistributionResponse> response = approvalService.getPendingDistributions();
        return ApiResponse.success(response);
    }

    @Operation(summary = "Duyệt hoặc từ chối đợt phân bổ kinh phí",
            description = "Hiệu trưởng xem xét danh sách học sinh thụ hưởng và phê duyệt (trangthai = 'DaDuyet') hoặc từ chối (trangthai = 'TuChoi').")
    @PutMapping("/distributions/{id}")
    public ApiResponse<PrincipalDistributionResponse> decideDistribution(
            @Parameter(description = "Mã đợt phân bổ", example = "1")
            @PathVariable("id") Long id,
            @Valid @RequestBody PrincipalDecisionRequest request
    ) {
        Long hieuTruongId = SecurityUtils.getCurrentUserId();
        PrincipalDistributionResponse response = approvalService.decideDistribution(id, hieuTruongId, request);
        return ApiResponse.success("Xét duyệt đợt phân bổ kinh phí thành công", response);
    }
}
