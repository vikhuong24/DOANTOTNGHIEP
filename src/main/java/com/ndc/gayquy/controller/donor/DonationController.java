package com.ndc.gayquy.controller.donor;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.donor.CampaignProgressResponse;
import com.ndc.gayquy.dto.donor.DonationHistoryResponse;
import com.ndc.gayquy.dto.donor.DonationProposeRequest;
import com.ndc.gayquy.dto.donor.DonationRegisterRequest;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.donor.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/donor")
@RequiredArgsConstructor
@Tag(name = "Donor", description = "Các API dành cho Nhà hảo tâm (Hồ sơ, Đóng góp tài trợ, Đề xuất, Tiến độ & Minh chứng, Lịch sử, Phản hồi)")
public class DonationController {

    private final DonationService donationService;

    @Operation(summary = "Đăng ký ủng hộ cho một bài gây quỹ (Tạo bản ghi TAITRO)",
            description = "Tạo yêu cầu đóng góp với trạng thái mặc định là 'CHODUYET' kèm hình ảnh minh chứng chuyển khoản.")
    @PostMapping("/donations/register")
    public ApiResponse<Map<String, Object>> registerDonation(@Valid @RequestBody DonationRegisterRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Long maTaiTro = donationService.registerDonation(currentUserId, request);
        return ApiResponse.success("Đăng ký ủng hộ thành công, vui lòng chờ cán bộ nhà trường đối soát",
                Map.of("maTaiTro", maTaiTro, "trangThai", "CHODUYET"));
    }

    @Operation(summary = "Tạo đề xuất tài trợ mới (Tạo bản ghi DEXUATTAITRO)",
            description = "Nhà hảo tâm chủ động đề xuất tài trợ một hạng mục mới hoặc gắn vào bài đăng cụ thể.")
    @PostMapping("/donations/propose")
    public ApiResponse<Map<String, Object>> proposeDonation(@Valid @RequestBody DonationProposeRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Long maDeXuat = donationService.proposeDonation(currentUserId, request);
        return ApiResponse.success("Gửi đề xuất tài trợ thành công, nhà trường sẽ xem xét và phản hồi sớm",
                Map.of("maDeXuat", maDeXuat, "trangThai", "CHODUYET"));
    }

    @Operation(summary = "Theo dõi tiến độ các bài đăng đã ủng hộ kèm minh chứng",
            description = "Lấy danh sách các bài đăng gây quỹ mà tài khoản này đã từng ủng hộ, kèm tiến độ % và minh chứng giải ngân.")
    @GetMapping("/campaigns/progress")
    public ApiResponse<List<CampaignProgressResponse>> getCampaignsProgress() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<CampaignProgressResponse> response = donationService.getCampaignsProgress(currentUserId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "Xem toàn bộ lịch sử đóng góp của Nhà hảo tâm",
            description = "Xem tổng số tiền đã đóng góp thành công, chi tiết từng khoản ủng hộ trực tiếp và các đề xuất tài trợ.")
    @GetMapping("/donations/history")
    public ApiResponse<DonationHistoryResponse> getDonationHistory() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        DonationHistoryResponse response = donationService.getDonationHistory(currentUserId);
        return ApiResponse.success(response);
    }
}
