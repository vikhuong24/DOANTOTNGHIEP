package com.ndc.gayquy.controller.parent;

import com.ndc.gayquy.common.response.ApiResponse;
import com.ndc.gayquy.dto.parent.StudentResponse;
import com.ndc.gayquy.dto.parent.StudentSupportHistoryResponse;
import com.ndc.gayquy.security.SecurityUtils;
import com.ndc.gayquy.service.parent.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("parentStudentController")
@RequestMapping("/parent/students")
@RequiredArgsConstructor
@Tag(name = "Parent", description = "Các API dành cho Phụ huynh học sinh (Danh sách con, Lịch sử hỗ trợ, Minh chứng trao tặng, Phản hồi)")
public class StudentController {

    private final StudentService studentService;

    @Operation(summary = "Lấy danh sách các con của phụ huynh",
            description = "Trả về toàn bộ danh sách các học sinh thuộc quyền giám hộ của phụ huynh đang đăng nhập.")
    @GetMapping
    public ApiResponse<List<StudentResponse>> getMyStudents() {
        Long parentId = SecurityUtils.getCurrentUserId();
        List<StudentResponse> response = studentService.getMyStudents(parentId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "Xem lịch sử nhận hỗ trợ của con",
            description = "Lấy chi tiết toàn bộ các lần nhận tiền / quà từ các đợt phân bổ (bảng CT_PHANBO). Bắt buộc kiểm tra quyền sở hữu.")
    @GetMapping("/{mahocsinh}/history")
    public ApiResponse<List<StudentSupportHistoryResponse>> getStudentHistory(
            @Parameter(description = "Mã học sinh", example = "1")
            @PathVariable("mahocsinh") Long maHocSinh
    ) {
        Long parentId = SecurityUtils.getCurrentUserId();
        List<StudentSupportHistoryResponse> response = studentService.getStudentHistory(parentId, maHocSinh);
        return ApiResponse.success(response);
    }
}
