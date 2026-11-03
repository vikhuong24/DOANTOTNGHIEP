package com.ndc.gayquy.controller.guest;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.guest.CampaignDetailResponse;
import com.ndc.gayquy.dto.guest.CampaignSummaryResponse;
import com.ndc.gayquy.dto.guest.PageCustomResponse;
import com.ndc.gayquy.service.guest.CampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/guest/campaigns")
@RequiredArgsConstructor
@Tag(name = "Guest", description = "Các API dành cho Khách vãng lai (Đăng ký, Đăng nhập, Bài đăng gây quỹ, Sao kê, Học sinh)")
public class CampaignController {

    private final CampaignService campaignService;

    @Operation(summary = "Lấy danh sách các bài đăng gây quỹ công khai",
            description = "Lấy danh sách bài đăng có trạng thái Đang vận động/Đã duyệt kèm phân trang và tìm kiếm theo tiêu đề.")
    @GetMapping
    public ApiResponse<PageCustomResponse<CampaignSummaryResponse>> layDanhSachBaiDang(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageCustomResponse<CampaignSummaryResponse> response = campaignService.layDanhSachBaiDang(keyword, page, size);
        return ApiResponse.success(response);
    }

    @Operation(summary = "Xem chi tiết một bài đăng gây quỹ",
            description = "Xem chi tiết bài đăng cùng danh sách các nhà hảo tâm đã ủng hộ thành công.")
    @GetMapping("/{id}")
    public ApiResponse<CampaignDetailResponse> layChiTietBaiDang(@PathVariable Long id) {
        CampaignDetailResponse response = campaignService.layChiTietBaiDang(id);
        return ApiResponse.success(response);
    }
}
