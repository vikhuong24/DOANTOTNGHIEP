package com.ndc.gayquy.controller.donor;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.donor.ProfileResponse;
import com.ndc.gayquy.dto.donor.UpdateProfileRequest;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.donor.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/donor/profile")
@RequiredArgsConstructor
@Tag(name = "Donor", description = "Các API dành cho Nhà hảo tâm (Hồ sơ, Đóng góp tài trợ, Đề xuất, Tiến độ & Minh chứng, Lịch sử, Phản hồi)")
public class ProfileController {

    private final ProfileService profileService;

    @Operation(summary = "Xem hồ sơ cá nhân của Nhà hảo tâm",
            description = "Lấy thông tin người dùng hiện tại dựa trên JWT Token xác thực.")
    @GetMapping
    public ApiResponse<ProfileResponse> getProfile() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProfileResponse response = profileService.getProfile(currentUserId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "Cập nhật hồ sơ cá nhân của Nhà hảo tâm",
            description = "Cập nhật họ tên, số điện thoại và địa chỉ.")
    @PutMapping
    public ApiResponse<ProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProfileResponse response = profileService.updateProfile(currentUserId, request);
        return ApiResponse.success("Cập nhật thông tin cá nhân thành công", response);
    }
}
