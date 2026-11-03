package com.ndc.gayquy.controller.fundraiser;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.fundraiser.CampaignDetailResponse;
import com.ndc.gayquy.dto.fundraiser.CreateCampaignRequest;
import com.ndc.gayquy.dto.fundraiser.UpdateCampaignRequest;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.fundraiser.CampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("fundraiserCampaignController")
@RequestMapping("/fundraiser/campaigns")
@RequiredArgsConstructor
@Tag(name = "Fundraiser", description = "Các API dành cho Cán bộ quản lý gây quỹ (Bài đăng, Duyệt đề xuất & xác nhận tiền, Phân bổ, Minh chứng, Phản hồi)")
public class CampaignController {

    private final CampaignService campaignService;

    @Operation(summary = "Tạo bài đăng gây quỹ mới",
            description = "Cán bộ tạo bài đăng kêu gọi quyên góp từ thiện cho trường học.")
    @PostMapping
    public ApiResponse<CampaignDetailResponse> createCampaign(@Valid @RequestBody CreateCampaignRequest request) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        CampaignDetailResponse response = campaignService.createCampaign(canBoId, request);
        return ApiResponse.success("Tạo bài đăng gây quỹ thành công", response);
    }

    @Operation(summary = "Chỉnh sửa bài đăng gây quỹ",
            description = "Cập nhật tiêu đề, nội dung, ảnh bìa, mục tiêu, trạng thái hoặc thời gian của bài đăng do chính mình tạo.")
    @PutMapping("/{id}")
    public ApiResponse<CampaignDetailResponse> updateCampaign(
            @Parameter(description = "Mã bài tài trợ", example = "1")
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateCampaignRequest request
    ) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        CampaignDetailResponse response = campaignService.updateCampaign(id, canBoId, request);
        return ApiResponse.success("Cập nhật bài đăng gây quỹ thành công", response);
    }

    @Operation(summary = "Lấy danh sách bài đăng do mình tạo",
            description = "Trả về danh sách toàn bộ các bài đăng gây quỹ mà cán bộ đang đăng nhập đã tạo.")
    @GetMapping
    public ApiResponse<List<CampaignDetailResponse>> getMyCampaigns() {
        Long canBoId = SecurityUtils.getCurrentUserId();
        List<CampaignDetailResponse> response = campaignService.getMyCampaigns(canBoId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "Xem chi tiết bài đăng gây quỹ",
            description = "Lấy thông tin chi tiết của một bài đăng gây quỹ theo ID.")
    @GetMapping("/{id}")
    public ApiResponse<CampaignDetailResponse> getCampaignDetail(
            @Parameter(description = "Mã bài tài trợ", example = "1")
            @PathVariable("id") Long id
    ) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        CampaignDetailResponse response = campaignService.getCampaignDetail(id, canBoId);
        return ApiResponse.success(response);
    }
}
