package com.ndc.gayquy.controller.parent;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.parent.StudentEvidenceResponse;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.parent.EvidenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("parentEvidenceController")
@RequestMapping("/parent/students")
@RequiredArgsConstructor
@Tag(name = "Parent", description = "Các API dành cho Phụ huynh học sinh (Danh sách con, Lịch sử hỗ trợ, Minh chứng trao tặng, Phản hồi)")
public class EvidenceController {

    private final EvidenceService evidenceService;

    @Operation(summary = "Xem tài liệu minh chứng trao tặng của con",
            description = "Lấy danh sách các hình ảnh, biên bản giao nhận, phiếu thu minh chứng trao tặng cho học sinh từ các đợt phân bổ. Bắt buộc kiểm tra quyền sở hữu.")
    @GetMapping("/{mahocsinh}/evidences")
    public ApiResponse<List<StudentEvidenceResponse>> getStudentEvidences(
            @Parameter(description = "Mã học sinh", example = "1")
            @PathVariable("mahocsinh") Long maHocSinh
    ) {
        Long parentId = SecurityUtils.getCurrentUserId();
        List<StudentEvidenceResponse> response = evidenceService.getStudentEvidences(parentId, maHocSinh);
        return ApiResponse.success(response);
    }
}
