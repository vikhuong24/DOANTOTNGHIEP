package com.ndc.gayquy.controller.parent;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.parent.ParentFeedbackRequest;
import com.ndc.gayquy.dto.parent.ParentFeedbackResponse;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.parent.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("parentFeedbackController")
@RequestMapping("/parent/feedbacks")
@RequiredArgsConstructor
@Tag(name = "Parent", description = "Các API dành cho Phụ huynh học sinh (Danh sách con, Lịch sử hỗ trợ, Minh chứng trao tặng, Phản hồi)")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "Gửi phản hồi sai lệch",
            description = "Phụ huynh gửi phản hồi/khiếu nại về sai lệch thông tin hoặc số tiền hỗ trợ của con (có thể gắn mã bài tài trợ hoặc đợt phân bổ).")
    @PostMapping
    public ApiResponse<ParentFeedbackResponse> createFeedback(@Valid @RequestBody ParentFeedbackRequest request) {
        Long parentId = SecurityUtils.getCurrentUserId();
        ParentFeedbackResponse response = feedbackService.createFeedback(parentId, request);
        return ApiResponse.success("Gửi phản hồi sai lệch thành công", response);
    }

    @Operation(summary = "Xem lại phản hồi và câu trả lời",
            description = "Lấy danh sách toàn bộ các phản hồi mà phụ huynh đã gửi kèm câu trả lời của nhà trường.")
    @GetMapping
    public ApiResponse<List<ParentFeedbackResponse>> getMyFeedbacks() {
        Long parentId = SecurityUtils.getCurrentUserId();
        List<ParentFeedbackResponse> response = feedbackService.getMyFeedbacks(parentId);
        return ApiResponse.success(response);
    }
}
