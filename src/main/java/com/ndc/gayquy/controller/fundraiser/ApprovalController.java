package com.ndc.gayquy.controller.fundraiser;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.fundraiser.*;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.fundraiser.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("fundraiserApprovalController")
@RequestMapping("/fundraiser/approvals")
@RequiredArgsConstructor
@Tag(name = "Fundraiser", description = "Các API dành cho Cán bộ quản lý gây quỹ (Bài đăng, Duyệt đề xuất & xác nhận tiền, Phân bổ, Minh chứng, Phản hồi)")
public class ApprovalController {

    private final ApprovalService approvalService;

    // ==========================================
    // 1. ĐỀ XUẤT TÀI TRỢ (Bảng DEXUATTAITRO)
    // ==========================================

    @Operation(summary = "Lấy danh sách đề xuất tài trợ chờ duyệt",
            description = "Lấy toàn bộ các đề xuất tài trợ đang ở trạng thái chờ duyệt (CHO_DUYET / ChoDuyet).")
    @GetMapping("/proposals")
    public ApiResponse<List<PendingProposalResponse>> getPendingProposals() {
        List<PendingProposalResponse> response = approvalService.getPendingProposals();
        return ApiResponse.success(response);
    }

    @Operation(summary = "Duyệt / Từ chối đề xuất tài trợ",
            description = "Cán bộ phê duyệt (trangthai = 'DaDuyet') hoặc từ chối (trangthai = 'TuChoi', truyền kèm lydo).")
    @PutMapping("/proposals/{id}")
    public ApiResponse<PendingProposalResponse> processProposalApproval(
            @Parameter(description = "Mã đề xuất tài trợ", example = "2")
            @PathVariable("id") Long id,
            @Valid @RequestBody ApprovalDecisionRequest request
    ) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        PendingProposalResponse response = approvalService.processProposalApproval(id, canBoId, request);
        return ApiResponse.success("Cập nhật trạng thái đề xuất tài trợ thành công", response);
    }

    // ==========================================
    // 2. ĐĂNG KÝ TÀI TRỢ (Bảng TAITRO)
    // ==========================================

    @Operation(summary = "Lấy danh sách đăng ký ủng hộ chờ duyệt / xác nhận",
            description = "Lấy toàn bộ các lượt đăng ký đóng góp đang ở trạng thái CHODUYET.")
    @GetMapping("/donations")
    public ApiResponse<List<PendingDonationResponse>> getPendingDonations() {
        List<PendingDonationResponse> response = approvalService.getPendingDonations();
        return ApiResponse.success(response);
    }

    @Operation(summary = "Duyệt / Từ chối đăng ký tài trợ",
            description = "Cán bộ duyệt (trangthai = 'DADUYET') hoặc từ chối (trangthai = 'TUCHOI', lưu lý do vào trường ghichu).")
    @PutMapping("/donations/{id}")
    public ApiResponse<PendingDonationResponse> processDonationApproval(
            @Parameter(description = "Mã đăng ký tài trợ", example = "5")
            @PathVariable("id") Long id,
            @Valid @RequestBody ApprovalDecisionRequest request
    ) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        PendingDonationResponse response = approvalService.processDonationApproval(id, canBoId, request);
        return ApiResponse.success("Cập nhật trạng thái đăng ký tài trợ thành công", response);
    }

    @Operation(summary = "Xác nhận đã nhận tiền tài trợ (Cộng dồn vào tổng tiền bài đăng)",
            description = "Sau khi đăng ký được duyệt, cán bộ đối soát và xác nhận tiền đã vào tài khoản/quỹ. Cập nhật trangthai TAITRO = 'DaNhan' và tự động cộng dồn số tiền vào tongtiendanhan của TT_TAITRO.")
    @PutMapping("/donations/{id}/confirm")
    public ApiResponse<ConfirmDonationResponse> confirmDonation(
            @Parameter(description = "Mã đóng góp tài trợ", example = "5")
            @PathVariable("id") Long id,
            @Valid @RequestBody(required = false) ConfirmDonationRequest request
    ) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        ConfirmDonationResponse response = approvalService.confirmDonation(id, canBoId, request);
        return ApiResponse.success("Xác nhận đã nhận tiền thành công", response);
    }
}
