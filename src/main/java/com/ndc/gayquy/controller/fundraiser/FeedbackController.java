package com.ndc.gayquy.controller.fundraiser;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.fundraiser.FundraiserFeedbackResponse;
import com.ndc.gayquy.dto.fundraiser.ReplyFeedbackRequest;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.fundraiser.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("fundraiserFeedbackController")
@RequestMapping("/fundraiser/feedbacks")
@RequiredArgsConstructor
@Tag(name = "Fundraiser", description = "Các API dành cho Cán bộ quản lý gây quỹ (Bài đăng, Duyệt đề xuất & xác nhận tiền, Phân bổ, Minh chứng, Phản hồi)")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "Lấy danh sách phản hồi từ người dùng",
            description = "Trả về danh sách phản hồi của nhà hảo tâm và phụ huynh. Có thể lọc theo trạng thái (CHOXULY, DAXULY, TUCHOI).")
    @GetMapping
    public ApiResponse<List<FundraiserFeedbackResponse>> getFeedbacks(
            @Parameter(description = "Trạng thái phản hồi", example = "CHOXULY")
            @RequestParam(value = "trangThai", required = false) TrangThaiPhanHoi trangThai
    ) {
        List<FundraiserFeedbackResponse> response = feedbackService.getFeedbacks(trangThai);
        return ApiResponse.success(response);
    }

    @Operation(summary = "Xem chi tiết một phản hồi",
            description = "Lấy thông tin chi tiết của một phản hồi theo mã phản hồi.")
    @GetMapping("/{id}")
    public ApiResponse<FundraiserFeedbackResponse> getFeedbackDetail(
            @Parameter(description = "Mã phản hồi", example = "2")
            @PathVariable("id") Long id
    ) {
        FundraiserFeedbackResponse response = feedbackService.getFeedbackDetail(id);
        return ApiResponse.success(response);
    }

    @Operation(summary = "Trả lời phản hồi (Chuyển trạng thái sang DAXULY)",
            description = "Cán bộ nhập nội dung trả lời cho phản hồi. Hệ thống lưu câu trả lời, ghi nhận cán bộ xử lý và cập nhật trangthai='DAXULY'.")
    @PutMapping("/{id}/reply")
    public ApiResponse<FundraiserFeedbackResponse> replyFeedback(
            @Parameter(description = "Mã phản hồi", example = "2")
            @PathVariable("id") Long id,
            @Valid @RequestBody ReplyFeedbackRequest request
    ) {
        Long canBoId = SecurityUtils.getCurrentUserId();
        FundraiserFeedbackResponse response = feedbackService.replyFeedback(id, canBoId, request);
        return ApiResponse.success("Đã trả lời phản hồi thành công (trạng thái DAXULY)", response);
    }
}
