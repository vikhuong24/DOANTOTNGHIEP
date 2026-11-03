package com.ndc.gayquy.controller.donor;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.donor.FeedbackRequest;
import com.ndc.gayquy.dto.donor.FeedbackResponse;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.donor.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/donor/feedbacks")
@RequiredArgsConstructor
@Tag(name = "Donor", description = "Các API dành cho Nhà hảo tâm (Hồ sơ, Đóng góp tài trợ, Đề xuất, Tiến độ & Minh chứng, Lịch sử, Phản hồi)")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "Gửi phản hồi / thắc mắc / ý kiến đóng góp",
            description = "Gửi phản hồi có thể gắn với bài gây quỹ hoặc đợt phân bổ cụ thể.")
    @PostMapping
    public ApiResponse<FeedbackResponse> sendFeedback(@Valid @RequestBody FeedbackRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FeedbackResponse response = feedbackService.sendFeedback(currentUserId, request);
        return ApiResponse.success("Gửi phản hồi thành công", response);
    }
}
