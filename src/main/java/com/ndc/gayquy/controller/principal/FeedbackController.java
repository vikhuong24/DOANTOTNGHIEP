package com.ndc.gayquy.controller.principal;

import com.ndc.gayquy.common.enums.TrangThaiPhanHoi;
import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.principal.PrincipalFeedbackResponse;
import com.ndc.gayquy.service.principal.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("principalFeedbackController")
@RequestMapping("/principal/feedbacks")
@RequiredArgsConstructor
@Tag(name = "Principal", description = "Các API dành cho Hiệu trưởng (Phê duyệt bài đăng, Phê duyệt đợt phân bổ, Báo cáo tài chính, Giám sát phản hồi)")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "Xem toàn bộ phản hồi kèm câu trả lời (Read-only)",
            description = "Hiệu trưởng giám sát toàn bộ các ý kiến đóng góp, thắc mắc của nhà hảo tâm và phụ huynh kèm theo nội dung trả lời từ phía cán bộ nhà trường.")
    @GetMapping
    public ApiResponse<List<PrincipalFeedbackResponse>> getAllFeedbacks(
            @Parameter(description = "Lọc theo trạng thái phản hồi", example = "DAXULY")
            @RequestParam(value = "trangThai", required = false) TrangThaiPhanHoi trangThai
    ) {
        List<PrincipalFeedbackResponse> response = feedbackService.getAllFeedbacks(trangThai);
        return ApiResponse.success(response);
    }

    @Operation(summary = "Xem chi tiết một phản hồi",
            description = "Tra cứu nội dung chi tiết của một phản hồi theo mã phản hồi.")
    @GetMapping("/{id}")
    public ApiResponse<PrincipalFeedbackResponse> getFeedbackDetail(
            @Parameter(description = "Mã phản hồi", example = "2")
            @PathVariable("id") Long id
    ) {
        PrincipalFeedbackResponse response = feedbackService.getFeedbackDetail(id);
        return ApiResponse.success(response);
    }
}
